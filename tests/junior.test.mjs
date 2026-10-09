import { requestProject } from "../.test-build/src/simulation/project-request.js";
import test from "node:test";
import assert from "node:assert/strict";
import {
  S,
  resetState,
  makeState,
} from "../.test-build/src/simulation/state.js";
import {
  clusterCommand,
  commandNamespace,
} from "../.test-build/src/terminal/cluster-shell.js";
import { readApiResources } from "../.test-build/src/simulation/kube-api.js";
import { worldObjects } from "../.test-build/src/world/locations.js";
import {
  placeWorldLabels,
  overlaps,
} from "../.test-build/src/world/label-layout.js";

test("normal payment logs honor selected project and explicit namespace overrides", async () => {
  resetState();
  await clusterCommand("oc project payments");
  assert.match(
    (await clusterCommand("oc logs deployment/payment-api")).stdout,
    /telemetry: POST/,
  );
  assert.equal(
    (await clusterCommand("oc logs deployment/payment-api --tail=2")).stdout
      .split("\n")
      .filter(Boolean).length,
    2,
  );
  assert.equal(
    (await clusterCommand("oc logs deployment/payment-api --tail=0")).stdout,
    "",
  );
  await assert.rejects(
    clusterCommand("oc logs deployment/payment-api -n default"),
    /NotFound/,
  );
  assert.equal(commandNamespace(["oc", "get", "pods", "-ndefault"]), "default");
  assert.equal(S.cluster.namespace, "payments");
});
test("a junior can read the Pod discovered by oc get pods and select its real container", async () => {
  resetState();
  await clusterCommand("oc project payments");
  const pod = readApiResources("pods", "payments").find((p) =>
    p.metadata.name.startsWith("payment-api-"),
  );
  assert.match(
    (await clusterCommand(`oc logs ${pod.metadata.name} -c payment-api`))
      .stdout,
    /203\.0\.113\.77/,
  );
  await assert.rejects(
    clusterCommand(`oc logs ${pod.metadata.name} -c missing`),
    /BadRequest/,
  );
  await assert.rejects(
    clusterCommand("oc logs payment-api-unknown"),
    /NotFound/,
  );
});
test("retained payment Deployment selector matches its template and Pods carry the same environment", () => {
  resetState();
  const deploy = readApiResources("deployments", "payments", "payment-api")[0];
  const pods = readApiResources("pods", "payments").filter(
    (p) => p.metadata.labels?.app === "payment-api",
  );
  assert.deepEqual(
    deploy.spec.selector.matchLabels,
    deploy.spec.template.metadata.labels,
  );
  for (const pod of pods)
    assert.deepEqual(
      pod.spec.containers[0].env,
      deploy.spec.template.spec.containers[0].env,
    );
});
test("incident policy apply accepts matching namespace and rejects a mismatched explicit target", async () => {
  resetState();
  assert.equal(
    (await clusterCommand("oc apply -f policies/deny-all.yaml -n payments"))
      .stdout,
    "networkpolicy.networking.k8s.io/default-deny-egress created\n",
  );
  await assert.rejects(
    clusterCommand("oc apply -f policies/deny-all.yaml -n default"),
    /does not match/,
  );
});
test("the first investigation asks the release witness about the incident before optional UID advice", () => {
  const state = makeState();
  state.world.scene = "operations";
  const kai = worldObjects(state).find((o) => o.id === "kai");
  assert.equal(kai.action, "release");
  assert.match(kai.sub, /what changed/);
});
test("compact witness labels retain a clickable title when full descriptions cannot fit", () => {
  const object = {
    id: "vale",
    x: 500,
    y: 330,
    label: "VALE",
    sub: "Archive custodian",
    kind: "npc",
    r: 55,
  };
  const blockers = [
    { x: 0, y: 0, width: 320, height: 300 },
    { x: 900, y: 0, width: 280, height: 450 },
    { x: 424, y: 382, width: 52, height: 105 },
    { x: 472, y: 210, width: 56, height: 145 },
  ];
  const labels = placeWorldLabels(
    [{ object, width: 350, height: 54, compactHeight: 32, compactWidth: 90 }],
    { x: 0, y: 0, width: 1180, height: 650 },
    blockers,
  );
  assert.equal(labels.length, 1);
  assert.equal(labels[0].compact, true);
  assert.ok(!blockers.some((b) => overlaps(labels[0], b)));
});

import { validPodCommand } from "../.test-build/src/terminal/syntax.js";
test("Pod DNS searches accept same-namespace service names without allowing unrelated destinations", () => {
  for (const name of [
    "ledger",
    "ledger.payments",
    "ledger.payments.svc",
    "ledger.payments.svc.cluster.local",
  ]) {
    assert.equal(validPodCommand(`nslookup ${name}`), true);
    assert.equal(validPodCommand(`curl -I https://${name}:8443`), true);
  }
  assert.equal(validPodCommand("nslookup unrelated"), false);
  assert.equal(validPodCommand("curl -I https://ledger:443"), false);
});

import {
  applyApiResource,
  kubeRequest,
} from "../.test-build/src/simulation/kube-api.js";
test("impersonated reads evaluate the subject's binding and restore authenticated identity after denial", async () => {
  resetState();
  await assert.rejects(
    clusterCommand("oc get configmaps -n payments --as=case-reader"),
    /cannot impersonate/,
  );
  S.cluster.user = "platform-admin";
  applyApiResource(
    {
      apiVersion: "rbac.authorization.k8s.io/v1",
      kind: "Role",
      metadata: { name: "reader", namespace: "payments" },
      rules: [
        {
          apiGroups: [""],
          resources: ["configmaps"],
          verbs: ["get"],
          resourceNames: ["settings"],
        },
      ],
    },
    "payments",
  );
  applyApiResource(
    {
      apiVersion: "rbac.authorization.k8s.io/v1",
      kind: "RoleBinding",
      metadata: { name: "reader", namespace: "payments" },
      roleRef: {
        apiGroup: "rbac.authorization.k8s.io",
        kind: "Role",
        name: "reader",
      },
      subjects: [{ kind: "User", name: "case-reader" }],
    },
    "payments",
  );
  applyApiResource(
    {
      apiVersion: "v1",
      kind: "ConfigMap",
      metadata: { name: "settings", namespace: "payments" },
      data: { level: "safe" },
    },
    "payments",
  );
  assert.match(
    (
      await clusterCommand(
        "oc get configmap settings -n payments --as=case-reader -o json",
      )
    ).stdout,
    /safe/,
  );
  await assert.rejects(
    clusterCommand("oc get configmaps -n payments --as=case-reader"),
    /Forbidden/,
  );
  await assert.rejects(
    clusterCommand("oc get secrets -n payments --as=case-reader"),
    /Forbidden/,
  );
  await assert.rejects(
    clusterCommand("oc get pods -n payments --as=unbound-user"),
    /Forbidden/,
  );
  assert.equal(S.cluster.user, "platform-admin");
  const denied = S.cluster.audit.at(-1);
  assert.equal(denied.user.username, "platform-admin");
  assert.equal(denied.impersonatedUser.username, "unbound-user");
  assert.equal(denied.responseStatus.code, 403);
  const forbidden = kubeRequest({
    method: "GET",
    path: "/api/v1/namespaces/payments/secrets",
    impersonateUser: "case-reader",
  });
  assert.equal(forbidden.code, 403);
  assert.equal(S.cluster.user, "platform-admin");
});

test("quota inspection reports the same consumption used to admit or reject Pods", async () => {
  resetState();
  applyApiResource(
    {
      apiVersion: "v1",
      kind: "ResourceQuota",
      metadata: { name: "budget", namespace: "payments" },
      spec: {
        hard: { pods: "4", "requests.cpu": "500m", "limits.memory": "512Mi" },
      },
    },
    "payments",
  );
  applyApiResource(
    {
      apiVersion: "v1",
      kind: "Pod",
      metadata: { name: "counted", namespace: "payments" },
      spec: {
        containers: [
          {
            name: "counted",
            image: "busybox",
            resources: {
              requests: { cpu: "100m" },
              limits: { memory: "128Mi" },
            },
          },
        ],
      },
    },
    "payments",
  );
  const quota = readApiResources("resourcequotas", "payments", "budget")[0];
  assert.equal(quota.status.used.pods, "4");
  assert.equal(quota.status.used["requests.cpu"], "100m");
  assert.equal(quota.status.used["limits.memory"], "128Mi");
  assert.match(
    (await clusterCommand("oc get quota -n payments")).stdout,
    /pods: 4\/4/,
  );
  await assert.rejects(
    clusterCommand("oc run excessive --image=busybox -n payments"),
    /exceeded quota/,
  );
});

test("runtime registry policy admits the Pod and exposes ImagePullBackOff with its actual cause", async () => {
  resetState();
  S.cluster.user = "platform-admin";
  applyApiResource(
    {
      apiVersion: "config.openshift.io/v1",
      kind: "Image",
      metadata: { name: "cluster" },
      spec: {
        registrySources: { allowedRegistries: ["registry.example.test"] },
      },
    },
    "payments",
  );
  S.cluster.user = "operator";
  assert.match(
    (
      await clusterCommand(
        "oc run blocked-image --image=untrusted.example.test/app:latest -n payments",
      )
    ).stdout,
    /created/,
  );
  const pod = readApiResources("pods", "payments", "blocked-image")[0];
  assert.equal(pod.status.phase, "Pending");
  assert.equal(
    pod.status.containerStatuses[0].state.waiting.reason,
    "ImagePullBackOff",
  );
  assert.match(
    pod.status.containerStatuses[0].state.waiting.message,
    /runtime registry policy/,
  );
});

import {
  decodeProgress,
  encodeProgress,
} from "../.test-build/src/simulation/snapshot.js";
import { workload, materialize } from "../.test-build/src/campaign/catalog.js";
import { flow } from "../.test-build/src/campaign/models.js";
import { secretValue } from "../.test-build/src/simulation/secrets.js";
import { removeTelemetry } from "../.test-build/src/simulation/operations.js";

test("replacement payment Pods expose their rollout birth time while the Deployment retains its original age", () => {
  resetState();
  const before = readApiResources("pods", "payments").find((p) =>
    p.metadata.name.startsWith("payment-api"),
  );
  removeTelemetry();
  const replaced = readApiResources("pods", "payments").find((p) =>
    p.metadata.name.startsWith("payment-api"),
  );
  const event = S.audit.findLast((e) => e.type === "pods.replaced");
  assert.notEqual(
    replaced.metadata.creationTimestamp,
    before.metadata.creationTimestamp,
  );
  assert.ok(
    Date.parse(replaced.metadata.creationTimestamp) <= Date.parse(event.at),
  );
  assert.equal(
    replaced.metadata.creationTimestamp,
    S.cluster.resources.find(
      (r) => r.kind === "Pod" && r.metadata.name === replaced.metadata.name,
    ).metadata.creationTimestamp,
  );
  assert.equal(
    replaced.status.containerStatuses[0].state.running.startedAt,
    replaced.metadata.creationTimestamp,
  );
  assert.equal(
    readApiResources("deployments", "payments", "payment-api")[0].metadata
      .creationTimestamp,
    before.metadata.creationTimestamp,
  );
});
test("ordinary Pod exec uses the same ingress/egress policies and preserves API authorization", async () => {
  resetState();
  requestProject({
    apiVersion: "project.openshift.io/v1",
    kind: "ProjectRequest",
    metadata: { name: "exec-demo" },
  });
  for (const name of ["client", "server", "stranger"])
    applyApiResource(materialize(workload(name), "exec-demo"), "exec-demo");
  const ip = readApiResources("pods", "exec-demo", "server")[0].status.podIP;
  assert.match(
    (
      await clusterCommand(
        `oc exec client -n exec-demo -- curl -I http://${ip}:8443/health`,
      )
    ).stdout,
    /200 OK/,
  );
  applyApiResource(
    {
      apiVersion: "networking.k8s.io/v1",
      kind: "NetworkPolicy",
      metadata: { name: "isolate", namespace: "exec-demo" },
      spec: { podSelector: {}, policyTypes: ["Ingress", "Egress"] },
    },
    "exec-demo",
  );
  assert.match(
    (await clusterCommand(`oc exec client -n exec-demo -- nc -zv ${ip} 8443`))
      .stderr,
    /timed out/,
  );
  applyApiResource(
    {
      apiVersion: "networking.k8s.io/v1",
      kind: "NetworkPolicy",
      metadata: { name: "egress", namespace: "exec-demo" },
      spec: {
        podSelector: { matchLabels: { app: "client" } },
        policyTypes: ["Egress"],
        egress: [
          {
            to: [{ podSelector: { matchLabels: { app: "server" } } }],
            ports: [{ port: 8443 }],
          },
        ],
      },
    },
    "exec-demo",
  );
  assert.match(
    (
      await clusterCommand(
        `oc exec client -n exec-demo -- curl -I http://${ip}:8443`,
      )
    ).stderr,
    /timed out/,
  );
  applyApiResource(
    {
      apiVersion: "networking.k8s.io/v1",
      kind: "NetworkPolicy",
      metadata: { name: "ingress", namespace: "exec-demo" },
      spec: {
        podSelector: { matchLabels: { app: "server" } },
        policyTypes: ["Ingress"],
        ingress: [
          {
            from: [{ podSelector: { matchLabels: { app: "client" } } }],
            ports: [{ port: 8443 }],
          },
        ],
      },
    },
    "exec-demo",
  );
  assert.match(
    (
      await clusterCommand(
        `oc exec client -n exec-demo -- curl -I http://${ip}:8443`,
      )
    ).stdout,
    /200 OK/,
  );
  assert.match(
    (await clusterCommand(`oc exec stranger -n exec-demo -- nc -zv ${ip} 8443`))
      .stderr,
    /timed out/,
  );
  await assert.rejects(
    clusterCommand(`oc exec client -n exec-demo --as=case-reader -- id`),
    /cannot impersonate/,
  );
  S.cluster.user = "platform-admin";
  await assert.rejects(
    clusterCommand(`oc exec client -n exec-demo --as=case-reader -- id`),
    /cannot get resource "pods"/,
  );
  applyApiResource(
    {
      apiVersion: "rbac.authorization.k8s.io/v1",
      kind: "Role",
      metadata: { name: "pod-reader", namespace: "exec-demo" },
      rules: [{ apiGroups: [""], resources: ["pods"], verbs: ["get", "list"] }],
    },
    "exec-demo",
  );
  applyApiResource(
    {
      apiVersion: "rbac.authorization.k8s.io/v1",
      kind: "RoleBinding",
      metadata: { name: "pod-reader", namespace: "exec-demo" },
      roleRef: {
        apiGroup: "rbac.authorization.k8s.io",
        kind: "Role",
        name: "pod-reader",
      },
      subjects: [{ kind: "User", name: "case-reader" }],
    },
    "exec-demo",
  );
  await assert.rejects(
    clusterCommand(`oc exec client -n exec-demo --as=case-reader -- id`),
    /cannot create resource "pods\/exec"/,
  );
  assert.equal(S.cluster.user, "platform-admin");
});
test("Pod addresses remain unique across deletions, recreation, and old checkpoint collisions", async () => {
  resetState();
  await clusterCommand("oc run a --image=busybox -n payments");
  await clusterCommand("oc run b --image=busybox -n payments");
  await clusterCommand("oc delete pod a -n payments");
  await clusterCommand("oc run c --image=busybox -n payments");
  const pods = readApiResources("pods", "payments");
  const ips = pods.map((p) => p.status.podIP);
  assert.equal(new Set(ips).size, ips.length);
  const saved = JSON.parse(encodeProgress(S));
  const b = saved.data.cluster.resources.find(
    (p) => p.kind === "Pod" && p.metadata.name === "b",
  );
  const c = saved.data.cluster.resources.find(
    (p) => p.kind === "Pod" && p.metadata.name === "c",
  );
  c.status.podIP = b.status.podIP;
  c.status.podIPs = [{ ip: b.status.podIP }];
  const repaired = decodeProgress(JSON.stringify(saved));
  const repairedIPs = repaired.cluster.resources
    .filter((p) => p.kind === "Pod")
    .map((p) => p.status.podIP);
  assert.equal(new Set(repairedIPs).size, repairedIPs.length);
  assert.equal(repaired.cluster.namespace, S.cluster.namespace);
});

test("named multi-Pod deletion processes every name and command help does not need a flag value", async () => {
  resetState();
  for (const name of ["one", "two"])
    await clusterCommand(`oc run ${name} --image=busybox -n payments`);
  const output = await clusterCommand("oc delete pod one two -n payments");
  assert.match(output.stdout, /pod "one" deleted/);
  assert.match(output.stdout, /pod "two" deleted/);
  assert.equal(
    readApiResources("pods", "payments").filter((p) =>
      ["one", "two"].includes(p.metadata.name),
    ).length,
    0,
  );
  assert.match(
    (await clusterCommand("oc login --help")).stdout,
    /Log in to your server/,
  );
});

test("unquoted file wildcards expand in the virtual filesystem while quoted jq expressions stay literal", async () => {
  resetState();
  await clusterCommand("echo first > notes-one.txt");
  await clusterCommand("echo second > notes-two.txt");
  assert.equal(
    (await clusterCommand("cat notes-*.txt")).stdout,
    "first\nsecond\n",
  );
  assert.equal(
    (await clusterCommand("echo 'notes-*.txt'")).stdout,
    "notes-*.txt\n",
  );
});

test("Secret writes consume stringData, API reads return base64 data, and running consumers keep their startup value", async () => {
  resetState();
  S.cluster.user = "platform-admin";
  applyApiResource(
    {
      apiVersion: "v1",
      kind: "Secret",
      metadata: { name: "sample" },
      stringData: { password: "training-v1", unicode: "olá" },
    },
    "payments",
  );
  let secret = readApiResources("secrets", "payments", "sample")[0];
  assert.equal(secret.stringData, undefined);
  assert.equal(secret.data.password, "dHJhaW5pbmctdjE=");
  assert.equal(secretValue(secret, "unicode"), "olá");
  applyApiResource(
    materialize(
      workload(
        "consumer",
        {},
        {
          env: [
            {
              name: "PASSWORD",
              valueFrom: { secretKeyRef: { name: "sample", key: "password" } },
            },
          ],
        },
      ),
      "payments",
    ),
    "payments",
  );
  applyApiResource(
    {
      apiVersion: "v1",
      kind: "Secret",
      metadata: { name: "sample" },
      stringData: { password: "training-v2" },
    },
    "payments",
  );
  assert.equal(
    readApiResources("pods", "payments", "consumer")[0].metadata.annotations[
      "roadshow.secret-version"
    ],
    "training-v1",
  );
  await clusterCommand("oc delete pod consumer -n payments");
  applyApiResource(
    materialize(
      workload(
        "consumer",
        {},
        {
          env: [
            {
              name: "PASSWORD",
              valueFrom: { secretKeyRef: { name: "sample", key: "password" } },
            },
          ],
        },
      ),
      "payments",
    ),
    "payments",
  );
  assert.equal(
    readApiResources("pods", "payments", "consumer")[0].metadata.annotations[
      "roadshow.secret-version"
    ],
    "training-v2",
  );
  const old = JSON.parse(encodeProgress(S));
  const legacy = old.data.cluster.resources.find(
    (r) => r.kind === "Secret" && r.metadata.name === "sample",
  );
  legacy.stringData = { password: "training-v3" };
  delete legacy.data;
  secret = decodeProgress(JSON.stringify(old)).cluster.resources.find(
    (r) => r.kind === "Secret" && r.metadata.name === "sample",
  );
  assert.equal(secret.stringData, undefined);
  assert.equal(secretValue(secret, "password"), "training-v3");
});

test("primary UDN namespaces wait for network provisioning and overlapping domain IPs stay distinct", async () => {
  resetState();
  S.cluster.user = "platform-admin";
  for (const ns of ["tenant-a", "tenant-b"])
    applyApiResource(
      {
        apiVersion: "v1",
        kind: "Namespace",
        metadata: {
          name: ns,
          labels: { "k8s.ovn.org/primary-user-defined-network": "" },
        },
      },
      "default",
    );
  applyApiResource(materialize(workload("client"), "tenant-a"), "tenant-a");
  assert.equal(
    readApiResources("pods", "tenant-a", "client")[0].status.phase,
    "Pending",
  );
  S.cluster.user = "platform-admin";
  for (const ns of ["tenant-a", "tenant-b"])
    applyApiResource(
      {
        apiVersion: "k8s.ovn.org/v1",
        kind: "UserDefinedNetwork",
        metadata: { name: "primary", namespace: ns },
        spec: {
          topology: "Layer2",
          layer2: { role: "Primary", subnets: ["10.90.0.0/24"] },
        },
      },
      ns,
    );
  assert.ok(readApiResources("pods", "tenant-a", "client")[0].status.podIP);
  await clusterCommand("oc delete pod client -n tenant-a");
  for (const [ns, name] of [
    ["tenant-a", "client"],
    ["tenant-a", "server"],
    ["tenant-b", "peer"],
  ])
    applyApiResource(materialize(workload(name), ns), ns);
  const client = readApiResources("pods", "tenant-a", "client")[0];
  const server = readApiResources("pods", "tenant-a", "server")[0];
  const peer = readApiResources("pods", "tenant-b", "peer")[0];
  assert.equal(client.status.podIP, "10.90.0.2");
  assert.equal(server.status.podIP, "10.90.0.3");
  assert.equal(peer.status.podIP, "10.90.0.2");
  assert.equal(
    flow("tenant-a", "client", "server", "tenant-a", false, 8443),
    true,
  );
  assert.equal(
    flow("tenant-a", "client", "peer", "tenant-b", false, 8443),
    false,
  );
  const saved = JSON.parse(encodeProgress(S));
  const duplicate = saved.data.cluster.resources.find(
    (r) => r.kind === "Pod" && r.metadata.name === "server",
  );
  duplicate.status.podIP = client.status.podIP;
  duplicate.status.podIPs = [{ ip: client.status.podIP }];
  const repaired = decodeProgress(JSON.stringify(saved));
  const repairedServer = repaired.cluster.resources.find(
    (r) => r.kind === "Pod" && r.metadata.name === "server",
  );
  assert.equal(repairedServer.status.podIP, "10.90.0.3");
  assert.deepEqual(
    JSON.parse(
      repairedServer.metadata.annotations["k8s.v1.cni.cncf.io/network-status"],
    )[0].ips,
    ["10.90.0.3"],
  );
});

test("EgressIP assignment requires a reserved address and an eligible recorded node", () => {
  resetState();
  S.cluster.user = "platform-admin";
  applyApiResource(
    {
      apiVersion: "k8s.ovn.org/v1",
      kind: "EgressIP",
      metadata: { name: "sample" },
      spec: {
        egressIPs: ["192.0.2.25"],
        namespaceSelector: { matchLabels: { partner: "true" } },
      },
    },
    "default",
  );
  assert.deepEqual(
    readApiResources("egressips", undefined, "sample")[0].status.items,
    [],
  );
  applyApiResource(
    {
      apiVersion: "v1",
      kind: "Node",
      metadata: {
        name: "worker-02",
        labels: { "k8s.ovn.org/egress-assignable": "" },
        annotations: {
          "ghostroute.training/reserved-egress-addresses": "192.0.2.25",
        },
      },
    },
    "default",
  );
  assert.deepEqual(
    readApiResources("egressips", undefined, "sample")[0].status.items,
    [{ node: "worker-02", egressIP: "192.0.2.25" }],
  );
});
