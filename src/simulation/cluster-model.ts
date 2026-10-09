import { defaultSccs } from "./default-sccs.js";
import { installedCrds } from "./installed-crds.js";
export interface SecurityContext {
  runAsUser?: number;
  privileged?: boolean;
  allowPrivilegeEscalation?: boolean;
  readOnlyRootFilesystem?: boolean;
  capabilities?: { add?: string[]; drop?: string[] };
  seccompProfile?: { type: string; localhostProfile?: string };
}
export interface ContainerSpec {
  name: string;
  image: string;
  securityContext?: SecurityContext;
  env?: {
    name: string;
    value?: string;
    valueFrom?: { secretKeyRef: { name: string; key: string } };
  }[];
  resources?: {
    requests?: Record<string, string>;
    limits?: Record<string, string>;
  };
  volumeMounts?: { name: string; mountPath: string; readOnly?: boolean }[];
}
export interface PodSpec {
  runtimeClassName?: string;
  nodeSelector?: Record<string, string>;
  nodeName?: string;
  containers: ContainerSpec[];
  serviceAccountName?: string;
  securityContext?: SecurityContext;
  hostUsers?: boolean;
  hostNetwork?: boolean;
  hostPID?: boolean;
  hostIPC?: boolean;
  volumes?: Record<string, unknown>[];
}
export interface Resource {
  apiVersion: string;
  kind: string;
  metadata: {
    name: string;
    uid?: string;
    resourceVersion?: string;
    generation?: number;
    namespace?: string;
    creationTimestamp?: string;
    deletionTimestamp?: string;
    annotations?: Record<string, string>;
    labels?: Record<string, string>;
  };
  spec?: Partial<PodSpec> & {
    [key: string]: any;
    replicas?: number;
    template?: { metadata?: Partial<Resource["metadata"]>; spec: PodSpec };
  };
  status?: Record<string, unknown>;
  data?: Record<string, string>;
  stringData?: Record<string, string>;
  disableRules?: { name: string; rationale: string }[];
  [key: string]: unknown;
}
export interface Scc extends Resource {
  runAsUser: {
    type: "MustRunAsRange" | "RunAsAny" | "MustRunAs" | "MustRunAsNonRoot";
    uid?: number;
    uidRangeMin?: number;
    uidRangeMax?: number;
  };
  allowPrivilegedContainer: boolean;
  allowPrivilegeEscalation?: boolean;
  requiredDropCapabilities?: string[] | null;
  allowedCapabilities?: string[] | null;
  userNamespaceLevel?: string;
  priority?: number | null;
}
export interface ApiAuditEvent {
  kind: "Event";
  apiVersion: "audit.k8s.io/v1";
  level: "Metadata" | "RequestResponse";
  stage: "ResponseComplete";
  auditID: string;
  verb: string;
  user: { username: string };
  impersonatedUser?: { username: string };
  requestURI: string;
  objectRef: {
    resource: string;
    namespace?: string;
    name?: string;
    subresource?: string;
  };
  responseStatus: { code: number; reason?: string; message?: string };
  annotations: Record<string, string>;
  requestReceivedTimestamp: string;
  requestObject?: unknown;
}

export function createCluster() {
  const resources: Resource[] = ["default", "payments", "openshift-dns"].map(
    (name, index) => ({
      apiVersion: "v1",
      kind: "Namespace",
      metadata: {
        name,
        annotations: {
          "openshift.io/sa.scc.uid-range": `${1000750000 + index * 10000}/10000`,
        },
      },
      status: { phase: "Active" },
    }),
  );
  for (const name of ["control-01", "worker-01", "worker-02"])
    resources.push({
      apiVersion: "v1",
      kind: "Node",
      metadata: {
        name,
        creationTimestamp: "2026-10-01T02:14:00Z",
        labels: {
          ["node-role.kubernetes.io/" +
          (name === "control-01" ? "control-plane" : "worker")]: "",
        },
      },
      status: {
        conditions: [{ type: "Ready", status: "True" }],
        nodeInfo: {
          kubeletVersion: "v1.35.2",
          osImage: "Red Hat Enterprise Linux CoreOS (offline fixture)",
          kernelVersion: "6.12.0",
          containerRuntimeVersion: "cri-o://1.35.2",
        },
        addresses: [
          {
            type: "InternalIP",
            address:
              name === "control-01"
                ? "10.0.0.10"
                : name === "worker-01"
                  ? "10.0.0.11"
                  : "10.0.0.12",
          },
        ],
      },
    });
  for (const namespace of ["default", "payments"])
    resources.push({
      apiVersion: "v1",
      kind: "ServiceAccount",
      metadata: { name: "default", namespace },
    });
  resources.push({
    apiVersion: "v1",
    kind: "ServiceAccount",
    metadata: { name: "payment-app", namespace: "payments" },
  });
  const sccs = structuredClone(defaultSccs);
  return {
    version: "4.22",
    incidentStored: false,
    policyRevision: "4.22-a18571de",
    user: "operator",
    namespace: "default",
    cwd: "/home/operator",
    previousCwd: "/home/operator",
    directories: [] as string[],
    resources: [
      ...resources,
      ...structuredClone(installedCrds),
      {
        apiVersion: "v1",
        kind: "ServiceAccount",
        metadata: { name: "build-bot", namespace: "payments" },
      },
      {
        apiVersion: "rbac.authorization.k8s.io/v1",
        kind: "Role",
        metadata: { name: "release-bot", namespace: "payments" },
        rules: [
          {
            apiGroups: ["apps"],
            resources: ["deployments"],
            verbs: ["get", "list", "patch", "update"],
          },
        ],
      },
      {
        apiVersion: "rbac.authorization.k8s.io/v1",
        kind: "RoleBinding",
        metadata: { name: "release-bot", namespace: "payments" },
        roleRef: {
          apiGroup: "rbac.authorization.k8s.io",
          kind: "Role",
          name: "release-bot",
        },
        subjects: [
          { kind: "ServiceAccount", name: "build-bot", namespace: "payments" },
        ],
      },
    ] as Resource[],
    sccs,
    ownedNamespaces: new Set(["payments"]),
    audit: [
      {
        kind: "Event",
        apiVersion: "audit.k8s.io/v1",
        level: "RequestResponse",
        stage: "ResponseComplete",
        auditID: "00000000-0000-4000-8000-000000000000",
        verb: "patch",
        user: { username: "system:serviceaccount:payments:build-bot" },
        requestURI: "/apis/apps/v1/namespaces/payments/deployments/payment-api",
        objectRef: {
          resource: "deployments",
          namespace: "payments",
          name: "payment-api",
        },
        responseStatus: { code: 200 },
        requestObject: {
          spec: {
            template: {
              spec: {
                containers: [
                  {
                    name: "payment-api",
                    env: [
                      {
                        name: "TELEMETRY_ENDPOINT",
                        value: "https://203.0.113.77/upload",
                      },
                    ],
                  },
                ],
              },
            },
          },
        },
        annotations: { "authorization.k8s.io/decision": "allow" },
        requestReceivedTimestamp: "2026-10-08T02:13:40.000Z",
      },
    ] as ApiAuditEvent[],
    events: [] as Resource[],
    files: {} as Record<string, string>,
    generation: 0,
    apiStorage: {
      revision: 0,
      nextUid: 0,
      objects: {} as Record<string, {
        uid: string;
        resourceVersion: string;
        generation: number;
        fingerprint: string;
        spec: string;
      }>,
    },
  };
}
