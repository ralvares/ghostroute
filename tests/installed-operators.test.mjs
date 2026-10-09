import test from "node:test";
import assert from "node:assert/strict";
import {
  S,
  resetState,
  replaceState,
} from "../.test-build/src/simulation/state.js";
import { clusterCommand } from "../.test-build/src/terminal/cluster-shell.js";
import {
  applyResource,
  getResources,
  deleteResource,
} from "../.test-build/src/simulation/cluster-api.js";
import { secretValue } from "../.test-build/src/simulation/secrets.js";
import { complianceInventory } from "../.test-build/src/operators/compliance-inventory.js";
import { reconcileFixtureControllers } from "../.test-build/src/simulation/engine.js";
import {
  encodeProgress,
  decodeProgress,
} from "../.test-build/src/simulation/snapshot.js";
const ns = "installed-consumers";
const get = (type, name) => getResources(type, ns, name)[0];
async function csiSetup(sync = true) {
  resetState();
  await clusterCommand("oc new-project " + ns);
  applyResource(
    {
      apiVersion: "v1",
      kind: "ConfigMap",
      metadata: { name: "provider-record" },
      data: {
        path: "secret/data/database",
        roles: "reader",
        serviceAccounts: "default",
        version: "1",
        value: "training-v1",
        csiObjectVersions: JSON.stringify({ password: "opaque-a" }),
      },
    },
    ns,
  );
  const spc = {
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
      ...(sync
        ? {
            secretObjects: [
              {
                secretName: "synced-database",
                type: "Opaque",
                data: [{ objectName: "password", key: "password" }],
              },
            ],
          }
        : {}),
    },
  };
  applyResource(spc, ns);
  return spc;
}
const csiPod = (name) => ({
  apiVersion: "v1",
  kind: "Pod",
  metadata: { name },
  spec: {
    nodeName: "worker-01",
    containers: [
      {
        name: "app",
        image: "busybox",
        env: [
          {
            name: "PASSWORD",
            valueFrom: {
              secretKeyRef: { name: "synced-database", key: "password" },
            },
          },
        ],
        volumeMounts: [
          { name: "external", mountPath: "/external" },
          { name: "external", mountPath: "/pinned", subPath: "password" },
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
});
function provider(value, version) {
  const r = get("configmaps", "provider-record");
  r.data.value = value;
  r.data.version = version;
  r.data.csiObjectVersions = JSON.stringify({ password: "opaque-" + version });
  applyResource(r, ns);
}
test("preinstalled operator CRDs, controllers and prepared Kata runtime are discoverable with evaluated RBAC", async () => {
  resetState();
  S.cluster.user = "platform-admin";
  for (const [type, name] of [
    ["kataconfig", "example-kataconfig"],
    ["runtimeclass", "kata"],
    ["ds", "secrets-store-csi-driver"],
  ])
    assert.match(
      (
        await clusterCommand(
          "oc get " +
            type +
            " " +
            name +
            (type === "ds" ? " -n openshift-csi-secrets-store" : "") +
            " -o yaml",
        )
      ).stdout,
      /kind:/,
    );
  for (const type of [
    "pipelineruns",
    "applications",
    "compliancecheckresults",
    "scansettingbindings",
    "kataconfigs",
  ])
    assert.match(
      (await clusterCommand("oc api-resources")).stdout,
      new RegExp(type),
    );
  assert.equal(
    getResources("kataconfigs")[0].status.kataNodes.readyNodeCount,
    1,
  );
  S.cluster.user = "operator";
  assert.equal(
    (await clusterCommand("oc auth can-i patch kataconfigs")).stdout,
    "no\n",
  );
});
test("CSI sync starts at a mounted consumer, rotates files/Secret/opaque versions, preserves env and subPath, and survives save", async () => {
  await csiSetup();
  assert.equal(getResources("secrets", ns).length, 0);
  applyResource(csiPod("app"), ns);
  assert.equal(
    secretValue(get("secrets", "synced-database"), "password"),
    "training-v1",
  );
  assert.match(
    (await clusterCommand("oc exec app -- env")).stdout,
    /PASSWORD=training-v1/,
  );
  provider("training-v2", "2");
  assert.equal(
    (await clusterCommand("oc exec app -- cat /external/password")).stdout,
    "training-v1",
  );
  await clusterCommand("sleep 121");
  assert.equal(
    (await clusterCommand("oc exec app -- cat /external/password")).stdout,
    "training-v2",
  );
  assert.equal(
    secretValue(get("secrets", "synced-database"), "password"),
    "training-v2",
  );
  assert.equal(
    getResources("secretproviderclasspodstatuses", ns)[0].status.objects[0]
      .version,
    "opaque-2",
  );
  assert.match(
    (await clusterCommand("oc exec app -- env")).stdout,
    /PASSWORD=training-v1/,
  );
  assert.equal(
    (await clusterCommand("oc exec app -- cat /pinned")).stdout,
    "training-v1",
  );
  replaceState(decodeProgress(encodeProgress(S)));
  assert.equal(
    (await clusterCommand("oc exec app -- cat /external/password")).stdout,
    "training-v2",
  );
  assert.match(
    (await clusterCommand("oc exec app -- env")).stdout,
    /PASSWORD=training-v1/,
  );
  deleteResource("pods", "app", ns);
  assert.equal(getResources("secrets", ns).length, 0);
});
test("CSI Secret lifecycle retains multiple consumers until the last mount is deleted", async () => {
  await csiSetup();
  applyResource(csiPod("one"), ns);
  applyResource(csiPod("two"), ns);
  assert.equal(
    get("secrets", "synced-database").metadata.ownerReferences.length,
    2,
  );
  deleteResource("pods", "one", ns);
  assert.ok(get("secrets", "synced-database"));
  deleteResource("pods", "two", ns);
  assert.equal(getResources("secrets", ns).length, 0);
});
test("CSI rotation failure preserves last good mount; revoked sync RBAC produces an Event without failing the mount", async () => {
  await csiSetup(false);
  const fixture = csiPod("app");
  fixture.spec.containers[0].env = [];
  applyResource(fixture, ns);
  const record = get("configmaps", "provider-record");
  record.data.roles = "denied";
  applyResource(record, ns);
  await clusterCommand("sleep 121");
  assert.equal(
    (await clusterCommand("oc exec app -- cat /external/password")).stdout,
    "training-v1",
  );
  assert.equal(get("pods", "app").status.phase, "Running");
  assert.ok(S.cluster.events.some((e) => e.reason === "FailedToRotate"));
  await csiSetup();
  S.cluster.user = "platform-admin";
  deleteResource("clusterrolebindings", "secrets-store-csi-driver-sync");
  S.cluster.user = "operator";
  const pod = csiPod("no-sync");
  pod.spec.containers[0].env = [];
  applyResource(pod, ns);
  assert.equal(get("pods", "no-sync").status.phase, "Running");
  assert.equal(getResources("secrets", ns).length, 0);
  assert.ok(S.cluster.events.some((e) => e.reason === "FailedToCreateSecret"));
});
test("Compliance tailoring uses native spec/status/output; remediation changes posture and rescan updates CheckResults", async () => {
  resetState();
  await clusterCommand("oc new-project " + ns);
  S.cluster.resources.push(...complianceInventory(ns));
  const profile = {
    apiVersion: "compliance.openshift.io/v1alpha1",
    kind: "TailoredProfile",
    metadata: { name: "district" },
    spec: {
      title: "District",
      description: "Applicable audit control",
      extends: "rhcos4-moderate",
      disableRules: [
        {
          name: "rhcos4-kernel-module-usb-storage-disabled",
          rationale: "No physical USB access",
        },
      ],
    },
  };
  applyResource(profile, ns);
  assert.equal(get("tailoredprofiles", "district").status.state, "READY");
  assert.match(
    get("configmaps", "district-tp").data["tailoring.xml"],
    /xccdf_compliance.openshift.io_profile_district/,
  );
  const scan = {
    apiVersion: "compliance.openshift.io/v1alpha1",
    kind: "ComplianceScan",
    metadata: { name: "district" },
    spec: {
      profile: "xccdf_compliance.openshift.io_profile_district",
      content: "ssg-rhcos4-ds.xml",
      tailoringConfigMap: { name: "district-tp" },
    },
  };
  applyResource(scan, ns);
  assert.equal(
    get("compliancescans", "district").status.result,
    "NON-COMPLIANT",
  );
  assert.equal(getResources("compliancecheckresults", ns)[0].status, "FAIL");
  applyResource(
    {
      apiVersion: "compliance.openshift.io/v1alpha1",
      kind: "ComplianceRemediation",
      metadata: { name: "audit-enabled" },
      spec: {
        apply: true,
        current: {
          object: {
            apiVersion: "v1",
            kind: "ConfigMap",
            metadata: { name: "node-posture" },
            data: { audit: "enabled" },
          },
        },
      },
    },
    ns,
  );
  assert.equal(
    get("complianceremediations", "audit-enabled").status.applicationState,
    "Applied",
  );
  assert.equal(
    get("compliancescans", "district").status.result,
    "NON-COMPLIANT",
    "completion remains a point-in-time result until rescan",
  );
  await clusterCommand(
    "oc annotate compliancescan district compliance.openshift.io/rescan= --overwrite",
  );
  assert.equal(get("compliancescans", "district").status.result, "COMPLIANT");
  assert.equal(get("compliancescans", "district").status.currentIndex, 1);
  assert.equal(getResources("compliancecheckresults", ns)[0].status, "PASS");
  profile.spec.extends = "absent";
  applyResource(profile, ns);
  assert.equal(get("tailoredprofiles", "district").status.state, "ERROR");
});
