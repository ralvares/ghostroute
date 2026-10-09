import test from "node:test";
import assert from "node:assert/strict";
import { resetState, S } from "../.test-build/src/simulation/state.js";
import {
  writeVirtualFile,
  readVirtualFile,
} from "../.test-build/src/simulation/filesystem.js";
import {
  textCommand,
  jqArguments,
} from "../.test-build/src/terminal/text-tools.js";
import { clusterCommand } from "../.test-build/src/terminal/cluster-shell.js";
import { pathCompletions } from "../.test-build/src/terminal/path-completion.js";
import { observeIncidentCommand } from "../.test-build/src/missions/incident.js";
import {
  kubeRequest,
  apiResourcePath,
} from "../.test-build/src/simulation/kube-api.js";
import { parse } from "yaml";
import { labFiles } from "../.test-build/src/simulation/lab-files.js";

test("the exact audit jq invocation keeps its whole quoted filter and filename", () => {
  const filter =
    'select(.verb == "patch" and .objectRef.name == "payment-api") | {user: .user.username, time: .requestReceivedTimestamp, request: .requestObject}';
  assert.deepEqual(jqArguments([filter, "audit/kube-apiserver.log"]), {
    query: filter,
    flags: [],
    files: ["audit/kube-apiserver.log"],
  });
  assert.deepEqual(
    jqArguments([
      "-rc",
      "--arg",
      "name",
      "payment-api",
      "select(.name==$name)",
      "one.json",
      "two.json",
    ]).files,
    ["one.json", "two.json"],
  );
  assert.throws(
    () => jqArguments(["--arg", "missing"]),
    /requires a name and value/,
  );
});
test("file and pipeline tools share filtering, preserve whitespace and count real newline/bytes", async () => {
  resetState();
  writeVirtualFile("sample.txt", "Zulu  \nalpha\nalpha\n10\n2\né");
  assert.equal(
    (await textCommand(["head", "-n", "1", "sample.txt"])).stdout,
    "Zulu  \n",
  );
  assert.equal(
    (await textCommand(["tail", "-n", "0", "sample.txt"])).stdout,
    "",
  );
  assert.equal(
    (await textCommand(["tail", "-n", "1", "sample.txt"])).stdout,
    "é",
  );
  assert.equal(
    (await textCommand(["grep", "-in", "^ALPHA$", "sample.txt"])).stdout,
    "2:alpha\n3:alpha\n",
  );
  assert.equal(
    (await textCommand(["grep", "-F", "a.b"], "a.b\naxb\n")).stdout,
    "a.b\n",
  );
  assert.equal(
    (await textCommand(["sort", "-nr"], "2\n10\n1\n")).stdout,
    "10\n2\n1\n",
  );
  assert.equal(
    (await textCommand(["uniq", "-c"], "a\na\nb\n")).stdout,
    "      2 a\n      1 b\n",
  );
  assert.equal((await textCommand(["wc", "-lwc"], "a é")).stdout, "0 2 4\n");
  assert.equal(
    (await textCommand(["cut", "-d", ":", "-f", "1,3-"], "a:b:c:d\nwhole\n"))
      .stdout,
    "a:c:d\nwhole\n",
  );
});
test("pipelines handle empty matches and persist replaced/appended evidence with no newline invention", async () => {
  resetState();
  assert.equal(
    (await clusterCommand("printf '%s\\n' alpha beta | grep absent | wc -l"))
      .stdout,
    "0\n",
  );
  await clusterCommand("printf '%s' alpha > findings.txt");
  await clusterCommand("echo beta >> findings.txt");
  assert.equal(readVirtualFile("findings.txt"), "alphabeta\n");
  await assert.rejects(
    clusterCommand("echo unsafe > audit/kube-apiserver.log"),
    /read-only/,
  );
  await assert.rejects(
    clusterCommand("cat notes.txt | more | wc -l"),
    /final pipeline/,
  );
  await assert.rejects(
    clusterCommand("cat notes.txt | tail -f"),
    /not implemented/,
  );
  assert.equal((await clusterCommand("cat notes.txt | less")).pager, "less");
});
test("Tab completes pager/jq files and output paths without editing quoted filters", () => {
  resetState();
  assert.deepEqual(pathCompletions("less aud"), ["less audit/"]);
  assert.deepEqual(
    pathCompletions("jq 'select(.verb == \"patch\")' audit/ku"),
    ["jq 'select(.verb == \"patch\")' audit/kube-apiserver.log "],
  );
  assert.equal(pathCompletions("jq 'sel"), null);
  assert.deepEqual(pathCompletions("echo text > not"), [
    "echo text > notes.txt ",
  ]);
});
test("file-based jq only advances the cause when output contains the actual audit evidence", () => {
  resetState();
  const command = "jq 'select(.verb == \"patch\")' audit/kube-apiserver.log";
  observeIncidentCommand(command, "", true);
  assert.equal(S.incident.auditSeen, false);
  observeIncidentCommand(command, JSON.stringify(S.cluster.audit[0]), false);
  assert.equal(S.incident.auditSeen, false);
  observeIncidentCommand(command, JSON.stringify(S.cluster.audit[0]), true);
  assert.equal(S.incident.auditSeen, true);
});
test("offline Kubernetes REST discovery and resource reads match CLI state; errors are Status objects", async () => {
  resetState();
  const path = apiResourcePath("deployments", "payments", "payment-api");
  assert.equal(
    path,
    "/apis/apps/v1/namespaces/payments/deployments/payment-api",
  );
  const response = kubeRequest({ method: "GET", path });
  assert.equal(response.code, 200);
  assert.equal(response.body.metadata.name, "payment-api");
  response.body.metadata.name = "changed-copy";
  assert.equal(
    kubeRequest({ method: "GET", path }).body.metadata.name,
    "payment-api",
  );
  assert.ok(
    kubeRequest({ method: "GET", path: "/api/v1" }).body.resources.some(
      (resource) => resource.name === "pods",
    ),
  );
  const missing = kubeRequest({
    method: "GET",
    path: "/api/v1/namespaces/payments/pods/absent",
  });
  assert.equal(missing.code, 404);
  assert.equal(missing.body.kind, "Status");
  assert.match(
    (await clusterCommand("oc get --raw /api/v1 | grep pods")).stdout,
    /pods/,
  );
  assert.match(
    (
      await clusterCommand(
        "oc get deployment payment-api -n payments -o yaml | grep TELEMETRY",
      )
    ).stdout,
    /TELEMETRY_ENDPOINT/,
  );
});
test("REST writes evaluate real RBAC/admission and reconcile resources visible through oc", async () => {
  resetState();
  const namespace = {
    apiVersion: "project.openshift.io/v1",
    kind: "ProjectRequest",
    metadata: { name: "api-lab" },
  };
  assert.equal(
    kubeRequest({
      method: "POST",
      path: "/apis/project.openshift.io/v1/projectrequests",
      body: namespace,
    }).code,
    201,
  );
  const denied = kubeRequest({
    method: "POST",
    path: "/apis/security.openshift.io/v1/securitycontextconstraints",
    body: {
      apiVersion: "security.openshift.io/v1",
      kind: "SecurityContextConstraints",
      metadata: { name: "unsafe" },
    },
  });
  assert.equal(denied.code, 403);
  assert.equal(denied.body.reason, "Forbidden");
  assert.match(
    (await clusterCommand("oc get namespaces | grep api-lab")).stdout,
    /api-lab/,
  );
  assert.equal(
    kubeRequest({ method: "DELETE", path: "/api/v1/namespaces/api-lab" }).code,
    403,
  );
  S.cluster.user = "platform-admin";
  assert.equal(
    kubeRequest({ method: "DELETE", path: "/api/v1/namespaces/api-lab" }).code,
    200,
  );
  assert.equal(
    kubeRequest({ method: "GET", path: "/api/v1/namespaces/api-lab" }).code,
    404,
  );
});
test("REST returns the admitted Pod and the same SCC refusal as the domain server", () => {
  resetState();
  kubeRequest({
    method: "POST",
    path: "/apis/project.openshift.io/v1/projectrequests",
    body: {
      apiVersion: "project.openshift.io/v1",
      kind: "ProjectRequest",
      metadata: { name: "api-lab" },
    },
  });
  const denied = kubeRequest({
    method: "POST",
    path: "/api/v1/namespaces/api-lab/pods",
    body: parse(labFiles["workloads/owned-root.yaml"]),
  });
  assert.equal(denied.code, 403);
  assert.match(
    denied.body.message,
    /unable to validate against any security context constraint/,
  );
  const admitted = kubeRequest({
    method: "POST",
    path: "/api/v1/namespaces/api-lab/pods",
    body: parse(labFiles["workloads/owned-secure.yaml"]),
  });
  assert.equal(admitted.code, 201);
  assert.equal(
    admitted.body.metadata.annotations["openshift.io/scc"],
    "restricted-v3",
  );
  assert.equal(admitted.body.status.containerStatuses[0].ready, true);
});

test("head and tail accept the native historical numeric shorthand in pipelines", async () => {
  const { textCommand } =
    await import("../.test-build/src/terminal/text-tools.js");
  assert.equal(
    (await textCommand(["head", "-2"], "one\ntwo\nthree\n")).stdout,
    "one\ntwo\n",
  );
  assert.equal(
    (await textCommand(["tail", "-2"], "one\ntwo\nthree\n")).stdout,
    "two\nthree\n",
  );
});
