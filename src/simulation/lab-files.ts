import { stringify } from "yaml";
import type { Resource, Scc } from "./cluster-model.js";

const container = (name: string, image: string, uid?: number) => ({
  name,
  image,
  securityContext: {
    ...(uid !== undefined ? { runAsUser: uid } : {}),
    allowPrivilegeEscalation: false,
    capabilities: { drop: ["ALL"] },
    seccompProfile: { type: "RuntimeDefault" },
  },
});
const pod = (name: string, image: string, uid?: number): Resource => ({
  apiVersion: "v1",
  kind: "Pod",
  metadata: { name },
  spec: {
    serviceAccountName: "default",
    containers: [container(name, image, uid)],
  },
});
const vendor: Resource = {
  apiVersion: "apps/v1",
  kind: "Deployment",
  metadata: { name: "vendor" },
  spec: {
    replicas: 1,
    template: {
      spec: {
        serviceAccountName: "vendor",
        containers: [
          container("vendor", "registry.example.test/vendor:fixed-uid", 1001),
        ],
      },
    },
  },
};
const custom: Scc = {
  apiVersion: "security.openshift.io/v1",
  kind: "SecurityContextConstraints",
  metadata: { name: "vendor-fixed-uid" },
  allowHostDirVolumePlugin: false,
  allowHostIPC: false,
  allowHostNetwork: false,
  allowHostPID: false,
  allowHostPorts: false,
  allowPrivilegedContainer: false,
  allowPrivilegeEscalation: false,
  readOnlyRootFilesystem: false,
  runAsUser: { type: "MustRunAs", uid: 1001 },
  seLinuxContext: { type: "MustRunAs" },
  fsGroup: { type: "MustRunAs" },
  supplementalGroups: { type: "RunAsAny" },
  userNamespaceLevel: "RequirePodLevel",
  requiredDropCapabilities: ["ALL"],
  allowedCapabilities: ["NET_BIND_SERVICE"],
  seccompProfiles: ["runtime/default"],
  volumes: [
    "configMap",
    "downwardAPI",
    "emptyDir",
    "persistentVolumeClaim",
    "projected",
    "secret",
  ],
};
export const labFiles: Record<string, string> = {
  "workloads/owned-root.yaml": stringify(
    pod("owned", "registry.example.test/owned:root", 0),
  ),
  "workloads/owned-secure.yaml": stringify(
    pod("owned-secure", "registry.example.test/owned:arbitrary-uid"),
  ),
  "workloads/vendor.yaml": stringify(vendor),
  "scc/vendor-fixed-uid.yaml": stringify(custom),
  "lab.txt": `OpenShift 4.22 local training cluster. All commands are simulated.\nOperator owns payments and namespaces created during this session.\nLocal identities: operator and platform-admin; password: training.\n\nOwned app: compare workloads/owned-root.yaml and workloads/owned-secure.yaml.\nThe secure image supports arbitrary UIDs, a writable data directory and unprivileged ports.\nVendor app: fixed UID 1001; its source cannot be changed. Use a dedicated vendor ServiceAccount.\nInspect SCC failure via oc describe deployment vendor and oc get events.\nAn SCC grant needs platform-admin. Compare anyuid with the narrower vendor-fixed-uid SCC.\nDefault OpenShift SCCs are preserved. restricted-v3 defaults hostUsers:false.\nAudit evidence: cat audit/kube-apiserver.log | jq 'select(.responseStatus.code == 403)'\n\nUse echo '<JSON manifest>' > workloads/custom.json to submit your own resources.\nUse oc apply -f workloads/custom.json -n your-project.\nSupported commands/resources: oc api-resources; oc --help.\n`,
};
