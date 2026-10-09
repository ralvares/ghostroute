import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  S,
  resetState,
  replaceState,
} from "../.test-build/src/simulation/state.js";
import {
  applyResource,
  getResources,
  deleteResource,
} from "../.test-build/src/simulation/cluster-api.js";
import { clusterCommand } from "../.test-build/src/terminal/cluster-shell.js";
import {
  encodeProgress,
  decodeProgress,
} from "../.test-build/src/simulation/snapshot.js";
import { sha3_224 } from "../.test-build/src/security/eso-hash.js";
import { secretValue } from "../.test-build/src/simulation/secrets.js";
const ns = "secrets-team";
const get = (type, name) => getResources(type, ns, name)[0];
const store = (value) => ({
  apiVersion: "external-secrets.io/v1",
  kind: "SecretStore",
  metadata: { name: "provider" },
  spec: {
    provider: {
      fake: {
        data: [{ key: "database", value: JSON.stringify({ password: value }) }],
      },
    },
  },
});
const external = (
  policy = "Periodic",
  creation = "Owner",
  deletion = "Retain",
) => ({
  apiVersion: "external-secrets.io/v1",
  kind: "ExternalSecret",
  metadata: { name: "database" },
  spec: {
    refreshPolicy: policy,
    refreshInterval: "1m",
    secretStoreRef: { name: "provider", kind: "SecretStore" },
    target: {
      name: "database",
      creationPolicy: creation,
      deletionPolicy: deletion,
    },
    data: [
      {
        secretKey: "password",
        remoteRef: { key: "database", property: "password" },
      },
    ],
  },
});
const pod = (name) => ({
  apiVersion: "v1",
  kind: "Pod",
  metadata: { name },
  spec: {
    containers: [
      {
        name: "app",
        image: "busybox",
        env: [
          {
            name: "PASSWORD",
            valueFrom: { secretKeyRef: { name: "database", key: "password" } },
          },
        ],
        volumeMounts: [
          { name: "credentials", mountPath: "/credentials" },
          { name: "credentials", mountPath: "/pinned", subPath: "password" },
        ],
      },
    ],
    volumes: [{ name: "credentials", secret: { secretName: "database" } }],
  },
});
async function setup() {
  resetState();
  await clusterCommand("oc new-project " + ns);
  applyResource(store("v1"), ns);
}
test("ESO hash primitive matches SHA3-224, including multiple blocks", () => {
  for (const input of [
    "",
    "abc",
    "map[password:[116 114 97 105 110 105 110 103]]",
    "a".repeat(300),
  ])
    assert.equal(
      sha3_224(input),
      createHash("sha3-224").update(input).digest("hex"),
    );
});
test("Periodic reconciliation rotates the Secret and volume while environment/subPath stay pinned until restart", async () => {
  await setup();
  applyResource(external(), ns);
  applyResource(pod("consumer"), ns);
  assert.equal(secretValue(get("secrets", "database"), "password"), "v1");
  assert.match(
    (await clusterCommand("oc exec consumer -- env")).stdout,
    /PASSWORD=v1/,
  );
  applyResource(store("v2"), ns);
  assert.equal(secretValue(get("secrets", "database"), "password"), "v1");
  await clusterCommand("sleep 61");
  assert.equal(secretValue(get("secrets", "database"), "password"), "v2");
  assert.equal(
    (await clusterCommand("oc exec consumer -- cat /credentials/password"))
      .stdout,
    "v2",
  );
  assert.equal(
    (await clusterCommand("oc exec consumer -- cat /pinned")).stdout,
    "v1",
  );
  assert.match(
    (await clusterCommand("oc exec consumer -- env")).stdout,
    /PASSWORD=v1/,
  );
  replaceState(decodeProgress(encodeProgress(S)));
  assert.match(
    (await clusterCommand("oc exec consumer -- env")).stdout,
    /PASSWORD=v1/,
  );
  deleteResource("pods", "consumer", ns);
  applyResource(pod("consumer"), ns);
  assert.match(
    (await clusterCommand("oc exec consumer -- env")).stdout,
    /PASSWORD=v2/,
  );
  assert.match(
    get("externalsecrets", "database").status.syncedResourceVersion,
    /^\d+-[a-f0-9]{56}$/,
  );
});
test("OnChange, CreatedOnce, ownership and Merge honor their separate lifecycle controls", async () => {
  await setup();
  applyResource(external("OnChange"), ns);
  applyResource(store("v2"), ns);
  await clusterCommand("sleep 120");
  assert.equal(secretValue(get("secrets", "database"), "password"), "v1");
  await clusterCommand("oc annotate externalsecret database force-sync=2");
  assert.equal(secretValue(get("secrets", "database"), "password"), "v2");
  deleteResource("externalsecrets", "database", ns);
  assert.equal(
    getResources("secrets", ns).some((r) => r.metadata.name === "database"),
    false,
  );
  applyResource(external("CreatedOnce", "Orphan"), ns);
  applyResource(store("v3"), ns);
  await clusterCommand("sleep 120");
  assert.equal(secretValue(get("secrets", "database"), "password"), "v2");
  deleteResource("externalsecrets", "database", ns);
  assert.equal(secretValue(get("secrets", "database"), "password"), "v2");
  deleteResource("secrets", "database", ns);
  applyResource(external("Periodic", "Merge"), ns);
  assert.equal(
    get("externalsecrets", "database").status.conditions[0].status,
    "False",
  );
  assert.equal(getResources("secrets", ns).length, 0);
  applyResource(
    {
      apiVersion: "v1",
      kind: "Secret",
      metadata: { name: "database" },
      stringData: { unrelated: "keep" },
    },
    ns,
  );
  assert.equal(secretValue(get("secrets", "database"), "password"), "v3");
  assert.equal(secretValue(get("secrets", "database"), "unrelated"), "keep");
});
test("missing env Secret blocks the consumer, and reconciliation starts it once the Secret is available", async () => {
  await setup();
  const p = pod("waiting");
  p.spec.volumes = [];
  p.spec.containers[0].volumeMounts = [];
  applyResource(p, ns);
  assert.equal(get("pods", "waiting").status.phase, "Pending");
  applyResource(external(), ns);
  assert.equal(get("pods", "waiting").status.phase, "Running");
  assert.match(
    (await clusterCommand("oc exec waiting -- env")).stdout,
    /PASSWORD=v1/,
  );
});
test("CSI requires registered driver/node/provider and exposes real mounted contents without creating a Secret", async () => {
  await setup();
  applyResource(
    {
      apiVersion: "v1",
      kind: "ConfigMap",
      metadata: { name: "provider-record" },
      data: {
        path: "secret/data/database",
        version: "2",
        value: "training-v2",
        roles: "reader",
        serviceAccounts: "default",
      },
    },
    ns,
  );
  applyResource(
    {
      apiVersion: "secrets-store.csi.x-k8s.io/v1",
      kind: "SecretProviderClass",
      metadata: { name: "database" },
      spec: {
        provider: "vault",
        parameters: {
          vaultAddress: "https://vault.example.test",
          roleName: "reader",
          objects:
            "- objectName: password\n  secretPath: secret/data/database\n  secretKey: password\n",
        },
      },
    },
    ns,
  );
  const projected = {
    apiVersion: "v1",
    kind: "Pod",
    metadata: { name: "projected" },
    spec: {
      nodeName: "worker-01",
      containers: [
        {
          name: "app",
          image: "busybox",
          volumeMounts: [
            { name: "external", mountPath: "/external", readOnly: true },
          ],
        },
      ],
      volumes: [
        {
          name: "external",
          csi: {
            driver: "secrets-store.csi.k8s.io",
            readOnly: true,
            volumeAttributes: { secretProviderClass: "database" },
          },
        },
      ],
    },
  };
  applyResource(projected, ns);
  assert.equal(
    (await clusterCommand("oc exec projected -- cat /external/password"))
      .stdout,
    "training-v2",
  );
  assert.equal(getResources("secrets", ns).length, 0);
  assert.equal(
    getResources("secretproviderclasspodstatuses", ns)[0].status.mounted,
    true,
  );
  deleteResource("pods", "projected", ns);
  assert.equal(getResources("secretproviderclasspodstatuses", ns).length, 0);
  S.cluster.user = "platform-admin";
  deleteResource("csidrivers", "secrets-store.csi.k8s.io");
  S.cluster.user = "operator";
  applyResource(projected, ns);
  assert.equal(get("pods", "projected").status.phase, "Pending");
  assert.match(
    get("pods", "projected").status.containerStatuses[0].state.waiting.message,
    /registered CSI drivers/,
  );
});
test("RuntimeClass admission applies scheduling and overhead; installed handler and SCC remain independent", async () => {
  await setup();
  S.cluster.user = "platform-admin";
  applyResource({
    apiVersion: "node.k8s.io/v1",
    kind: "RuntimeClass",
    metadata: { name: "kata" },
    handler: "kata",
    overhead: { podFixed: { memory: "350Mi" } },
    scheduling: {
      nodeSelector: { "feature.node.kubernetes.io/runtime.kata": "true" },
    },
  });
  S.cluster.user = "operator";
  const p = {
    apiVersion: "v1",
    kind: "Pod",
    metadata: { name: "sandbox" },
    spec: {
      runtimeClassName: "kata",
      hostUsers: true,
      containers: [{ name: "app", image: "busybox" }],
    },
  };
  applyResource(p, ns);
  const live = get("pods", "sandbox");
  assert.equal(live.spec.nodeName, "worker-02");
  assert.equal(live.spec.overhead.memory, "350Mi");
  assert.equal(live.metadata.annotations["openshift.io/scc"], "restricted-v2");
  assert.equal(live.status.phase, "Running");
  assert.throws(
    () =>
      applyResource(
        {
          ...p,
          metadata: { name: "conflict" },
          spec: {
            ...p.spec,
            nodeSelector: {
              "feature.node.kubernetes.io/runtime.kata": "false",
            },
          },
        },
        ns,
      ),
    /conflict: runtimeClass/,
  );
  assert.throws(
    () =>
      applyResource(
        {
          ...p,
          metadata: { name: "missing" },
          spec: { ...p.spec, runtimeClassName: "absent" },
        },
        ns,
      ),
    /RuntimeClass "absent" not found/,
  );
  assert.throws(
    () =>
      applyResource(
        {
          ...p,
          metadata: { name: "root" },
          spec: {
            ...p.spec,
            containers: [
              {
                name: "app",
                image: "busybox",
                securityContext: { runAsUser: 0 },
              },
            ],
          },
        },
        ns,
      ),
    /security context constraint/,
  );
  applyResource(
    {
      ...p,
      metadata: { name: "userns" },
      spec: { ...p.spec, hostUsers: false },
    },
    ns,
  );
  assert.equal(get("pods", "userns").status.phase, "Pending");
  assert.match(
    get("pods", "userns").status.containerStatuses[0].state.waiting.message,
    /does not support user namespaces/,
  );
});

test("a RuntimeClass selector waits for eligible nodes; missing installed handler creates a sandbox event", async () => {
  await setup();
  S.cluster.user = "platform-admin";
  applyResource({
    apiVersion: "node.k8s.io/v1",
    kind: "RuntimeClass",
    metadata: { name: "isolated" },
    handler: "kata",
    scheduling: { nodeSelector: { "training.example.test/eligible": "true" } },
  });
  S.cluster.user = "operator";
  const sandbox = {
    apiVersion: "v1",
    kind: "Pod",
    metadata: { name: "unassigned" },
    spec: {
      runtimeClassName: "isolated",
      hostUsers: true,
      containers: [{ name: "app", image: "busybox" }],
    },
  };
  applyResource(sandbox, ns);
  assert.equal(get("pods", "unassigned").spec.nodeName, undefined);
  assert.equal(
    get("pods", "unassigned").status.conditions[0].reason,
    "Unschedulable",
  );
  assert.equal(get("pods", "unassigned").status.containerStatuses, undefined);
  assert.match(
    (await clusterCommand("oc describe pod unassigned")).stdout,
    /FailedScheduling/,
  );
  S.cluster.user = "platform-admin";
  await clusterCommand(
    "oc label node worker-02 training.example.test/eligible=true",
  );
  S.cluster.user = "operator";
  assert.equal(get("pods", "unassigned").spec.nodeName, "worker-02");
  assert.equal(get("pods", "unassigned").status.phase, "Running");
  S.cluster.user = "platform-admin";
  applyResource({
    apiVersion: "node.k8s.io/v1",
    kind: "RuntimeClass",
    metadata: { name: "not-installed" },
    handler: "absent",
    scheduling: { nodeSelector: { "training.example.test/eligible": "true" } },
  });
  S.cluster.user = "operator";
  applyResource(
    {
      ...sandbox,
      metadata: { name: "no-runtime" },
      spec: { ...sandbox.spec, runtimeClassName: "not-installed" },
    },
    ns,
  );
  assert.equal(
    get("pods", "no-runtime").status.containerStatuses[0].state.waiting.reason,
    "ContainerCreating",
  );
  assert.match(
    (await clusterCommand("oc describe pod no-runtime")).stdout,
    /FailedCreatePodSandBox/,
  );
});

test("RuntimeClass overhead compares quantity values independently of unit spelling and field order", async () => {
  await setup();
  S.cluster.user = "platform-admin";
  applyResource({
    apiVersion: "node.k8s.io/v1",
    kind: "RuntimeClass",
    metadata: { name: "kata" },
    handler: "kata",
    overhead: { podFixed: { memory: "350Mi", cpu: "100m" } },
    scheduling: {
      nodeSelector: { "feature.node.kubernetes.io/runtime.kata": "true" },
    },
  });
  S.cluster.user = "operator";
  applyResource(
    {
      apiVersion: "v1",
      kind: "Pod",
      metadata: { name: "equivalent" },
      spec: {
        runtimeClassName: "kata",
        hostUsers: true,
        overhead: { cpu: "0.1", memory: "367001600" },
        containers: [{ name: "app", image: "busybox" }],
      },
    },
    ns,
  );
  assert.equal(get("pods", "equivalent").status.phase, "Running");
  assert.deepEqual(get("pods", "equivalent").spec.overhead, {
    memory: "350Mi",
    cpu: "100m",
  });
});

test("a Deployment becomes available when its missing Secret appears, without forcing a rollout", async () => {
  await setup();
  applyResource(
    {
      apiVersion: "apps/v1",
      kind: "Deployment",
      metadata: { name: "consumer" },
      spec: {
        replicas: 1,
        selector: { matchLabels: { app: "consumer" } },
        template: {
          metadata: { labels: { app: "consumer" } },
          spec: pod("unused").spec,
        },
      },
    },
    ns,
  );
  assert.equal(get("deployments", "consumer").status.readyReplicas, 0);
  const before = getResources("pods", ns).find(
    (p) => p.metadata.labels?.app === "consumer",
  ).metadata.uid;
  applyResource(external(), ns);
  assert.equal(get("deployments", "consumer").status.readyReplicas, 1);
  const running = getResources("pods", ns).find(
    (p) => p.metadata.labels?.app === "consumer",
  );
  assert.equal(
    running.metadata.uid,
    before,
    "kubelet recovery starts the existing Pod",
  );
  assert.equal(
    (
      await clusterCommand(
        "oc exec " + running.metadata.name + " -- cat /credentials/password",
      )
    ).stdout,
    "v1",
  );
});
