import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { S, resetState } from "../.test-build/src/simulation/state.js";
import { clusterCommand } from "../.test-build/src/terminal/cluster-shell.js";
import { kubeRequest } from "../.test-build/src/simulation/kube-api.js";
import { readVirtualFile } from "../.test-build/src/simulation/filesystem.js";

test("all 249 native help pages resolve without cluster calls or stage changes", async () => {
  resetState();
  const reference = JSON.parse(readFileSync("src/terminal/oc-help-data.json"));
  assert.equal(Object.keys(reference).length, 249);
  const before = JSON.stringify(S);
  for (const [path, output] of Object.entries(reference)) {
    const response = await clusterCommand(
      "oc" + (path ? " " + path : "") + (path === "options" ? "" : " --help"),
    );
    assert.equal(response.stdout + (response.stderr ?? ""), output, path);
    assert.equal(response.error ?? false, false, path);
  }
  assert.equal(JSON.stringify(S), before);
  assert.equal((await clusterCommand("oc help get")).stdout, reference.get);
  assert.equal(
    (await clusterCommand("oc create secret generic sample -h")).stdout,
    reference["create secret generic"],
  );
  assert.equal(
    (
      await clusterCommand(
        "oc exec payment-api-7d9cd-ab12 -n payments -- unknown --help",
      )
    ).error,
    true,
  );
  await assert.rejects(
    clusterCommand("oc new-build anything"),
    /not implemented/,
  );
});

test("a fresh tenant uses core API reconciliation without any campaign activation", async () => {
  resetState();
  assert.equal(
    (await clusterCommand("oc new-project engineering")).error ?? false,
    false,
  );
  const deployment = {
    apiVersion: "apps/v1",
    kind: "Deployment",
    metadata: { name: "web", labels: { team: "engineering" } },
    spec: {
      replicas: 2,
      selector: { matchLabels: { app: "web" } },
      template: {
        metadata: { labels: { app: "web" } },
        spec: {
          containers: [
            {
              name: "web",
              image: "busybox",
              ports: [{ name: "http", containerPort: 8080 }],
            },
          ],
        },
      },
    },
  };
  assert.equal(
    kubeRequest({
      method: "POST",
      path: "/apis/apps/v1/namespaces/engineering/deployments",
      body: deployment,
    }).code,
    201,
  );
  const dry = await clusterCommand(
    "oc expose deployment/web --dry-run=server -o json",
  );
  assert.equal(JSON.parse(dry.stdout).kind, "Service");
  assert.equal(
    S.cluster.resources.some(
      (r) => r.kind === "Service" && r.metadata.namespace === "engineering",
    ),
    false,
  );
  assert.equal(
    (await clusterCommand("oc expose deployment/web")).error ?? false,
    false,
  );
  assert.equal(
    (await clusterCommand("oc expose service/web --hostname=web.example.test"))
      .error ?? false,
    false,
  );
  const get = (path) => kubeRequest({ method: "GET", path }).body;
  assert.equal(
    get("/api/v1/namespaces/engineering/endpoints/web").subsets[0].addresses
      .length,
    2,
  );
  assert.equal(
    get("/apis/route.openshift.io/v1/namespaces/engineering/routes/web").spec
      .host,
    "web.example.test",
  );
  await assert.rejects(
    clusterCommand("oc label pods -l app=web app=other --overwrite"),
    /not implemented/,
  ); // unsupported bulk syntax must not mutate Pods.
  assert.equal(
    get("/api/v1/namespaces/engineering/endpoints/web").subsets[0].addresses
      .length,
    2,
  );
  S.cluster.user = "visitor";
  await assert.rejects(
    clusterCommand("oc expose deployment/web --name=blocked"),
    /Forbidden/,
  );
  assert.equal(
    S.cluster.resources.some((r) => r.metadata.name === "blocked"),
    false,
  );
});

test("Secret extraction uses API authorization, decoded data and the shared virtual filesystem", async () => {
  resetState();
  await clusterCommand("oc new-project credentials");
  await clusterCommand(
    "oc create secret generic auth --from-literal=token=revoked-token",
  );
  const standard = await clusterCommand("oc extract secret/auth --to=-");
  assert.equal(standard.stdout, "revoked-token\n");
  assert.equal(standard.stderr, "# token\n");
  assert.equal(
    (await clusterCommand("oc extract secret/auth")).error ?? false,
    false,
  );
  assert.equal(readVirtualFile("token"), "revoked-token");
  await assert.rejects(
    clusterCommand("oc extract secret/auth"),
    /already exists/,
  );
  assert.equal(
    (await clusterCommand("oc extract secret/auth --confirm")).error ?? false,
    false,
  );
  S.cluster.user = "visitor";
  await assert.rejects(
    clusterCommand("oc extract secret/auth --to=-"),
    /Forbidden/,
  );
});

test("rsh identifies its exact Pod and honors tenant access before starting a session", async () => {
  resetState();
  await clusterCommand("oc new-project shell");
  await clusterCommand("oc run diagnostic --image=busybox");
  const connected = await clusterCommand("oc rsh diagnostic");
  assert.equal(connected.podShell.name, "diagnostic");
  assert.equal(connected.podShell.namespace, "shell");
  const pod = S.cluster.resources.find(
    (r) => r.kind === "Pod" && r.metadata.name === "diagnostic",
  );
  assert.equal(connected.podShell.uid, pod.metadata.uid);
  S.cluster.user = "visitor";
  await assert.rejects(clusterCommand("oc rsh diagnostic"), /Forbidden/);
});
