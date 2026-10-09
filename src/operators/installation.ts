import { complianceInventory } from "./compliance-inventory.js";
import type { Resource } from "../simulation/cluster-model.js";
import { operatorCrds } from "./crds.js";

/** Authored installed inventory. Controllers execute through the shared engine, not these Pods. */
export function installedOperatorFixtures(): Resource[] {
  const controllers = [
    [
      "openshift-pipelines",
      "tekton-pipelines-controller",
      "ghcr.io/tektoncd/pipeline/controller:v1.9.0",
    ],
    [
      "openshift-pipelines",
      "tekton-triggers-controller",
      "ghcr.io/tektoncd/triggers/controller:v0.35.1",
    ],
    [
      "openshift-gitops",
      "openshift-gitops-repo-server",
      "quay.io/argoproj/argocd:v3.5.4",
    ],
    [
      "openshift-compliance",
      "compliance-operator",
      "quay.io/compliance-operator/compliance-operator:1.8.2",
    ],
    [
      "openshift-sandboxed-containers-operator",
      "sandboxed-containers-operator",
      "registry.redhat.io/openshift-sandboxed-containers/osc-rhel9-operator:1.11.0",
    ],
    [
      "external-secrets",
      "external-secrets",
      "ghcr.io/external-secrets/external-secrets:v0.18.0",
    ],
  ];
  const namespaces = [
    ...new Set([
      ...controllers.map((c) => c[0]),
      "openshift-csi-secrets-store",
    ]),
  ];
  const resources: Resource[] = namespaces.flatMap((namespace) => [
    {
      apiVersion: "v1",
      kind: "Namespace",
      metadata: {
        name: namespace,
        labels: { "kubernetes.io/metadata.name": namespace },
        annotations: { "openshift.io/sa.scc.uid-range": "1000900000/10000" },
      },
    },
    {
      apiVersion: "v1",
      kind: "ServiceAccount",
      metadata: { name: "default", namespace },
    },
  ]);
  for (const [namespace, name, image] of controllers) {
    const labels = { app: name },
      container = { name: "manager", image };
    resources.push(
      {
        apiVersion: "apps/v1",
        kind: "Deployment",
        metadata: { name, namespace },
        spec: {
          replicas: 1,
          selector: { matchLabels: labels },
          template: { metadata: { labels }, spec: { containers: [container] } },
        },
        status: {
          replicas: 1,
          readyReplicas: 1,
          availableReplicas: 1,
          updatedReplicas: 1,
          conditions: [
            {
              type: "Available",
              status: "True",
              reason: "MinimumReplicasAvailable",
            },
          ],
        },
      },
      installedPod(name + "-sim-0", namespace, container, labels),
    );
  }
  resources.push(
    installedPod(
      "openshift-gitops-application-controller-0",
      "openshift-gitops",
      {
        name: "application-controller",
        image: "quay.io/argoproj/argocd:v3.5.4",
      },
      { app: "openshift-gitops-application-controller" },
    ),
  );
  const namespace = "openshift-csi-secrets-store",
    name = "secrets-store-csi-driver";
  const container = {
    name: "secrets-store",
    image: "registry.k8s.io/csi-secrets-store/driver:v1.5.3",
    args: ["--enable-secret-rotation=true", "--rotation-poll-interval=2m"],
  };
  resources.push(
    { apiVersion: "v1", kind: "ServiceAccount", metadata: { name, namespace } },
    {
      apiVersion: "apps/v1",
      kind: "DaemonSet",
      metadata: { name, namespace },
      spec: {
        selector: { matchLabels: { app: name } },
        template: {
          metadata: { labels: { app: name } },
          spec: { serviceAccountName: name, containers: [container] },
        },
      },
      status: {
        desiredNumberScheduled: 2,
        currentNumberScheduled: 2,
        numberReady: 2,
        numberAvailable: 2,
        updatedNumberScheduled: 2,
      },
    },
    ...["worker-01", "worker-02"].map((node, i) =>
      installedPod(name + "-" + i, namespace, container, { app: name }, node),
    ),
    {
      apiVersion: "rbac.authorization.k8s.io/v1",
      kind: "ClusterRole",
      metadata: { name: "secrets-store-csi-driver-sync" },
      rules: [
        {
          apiGroups: [""],
          resources: ["secrets"],
          verbs: [
            "get",
            "list",
            "watch",
            "create",
            "update",
            "patch",
            "delete",
          ],
        },
      ],
    },
    {
      apiVersion: "rbac.authorization.k8s.io/v1",
      kind: "ClusterRoleBinding",
      metadata: { name: "secrets-store-csi-driver-sync" },
      roleRef: {
        apiGroup: "rbac.authorization.k8s.io",
        kind: "ClusterRole",
        name: "secrets-store-csi-driver-sync",
      },
      subjects: [{ kind: "ServiceAccount", name, namespace }],
    },
    {
      apiVersion: "kataconfiguration.openshift.io/v1",
      kind: "KataConfig",
      metadata: { name: "example-kataconfig" },
      spec: {
        checkNodeEligibility: true,
        kataConfigPoolSelector: {
          matchLabels: { "feature.node.kubernetes.io/runtime.kata": "true" },
        },
      },
      status: {
        conditions: [
          {
            type: "InProgress",
            status: "False",
            reason: "InstallationCompleted",
            message: "Kata runtime installation completed",
            lastTransitionTime: "2026-10-01T02:14:00Z",
          },
        ],
        kataNodes: {
          nodeCount: 1,
          readyNodeCount: 1,
          installed: ["worker-02"],
          installing: [],
          failedToInstall: [],
          waitingToInstall: [],
          uninstalling: [],
          failedToUninstall: [],
          waitingToUninstall: [],
        },
        runtimeClasses: ["kata"],
        waitingForMcoToStart: false,
      },
    },
    {
      apiVersion: "node.k8s.io/v1",
      kind: "RuntimeClass",
      metadata: { name: "kata" },
      handler: "kata",
      scheduling: {
        nodeSelector: { "feature.node.kubernetes.io/runtime.kata": "true" },
      },
    },
    ...complianceInventory("openshift-compliance"),
    ...structuredClone(operatorCrds),
  );
  let address = 50;
  for (const pod of resources.filter((r) => r.kind === "Pod")) {
    const ip = "10.128.0." + address++;
    pod.status!.podIP = ip;
    pod.status!.podIPs = [{ ip }];
    pod.metadata.annotations = {
      ...pod.metadata.annotations,
      "ghostroute.training/component": "controller",
    };
  }
  return resources;
}
function installedPod(
  name: string,
  namespace: string,
  container: any,
  labels: Record<string, string>,
  nodeName = "worker-01",
): Resource {
  return {
    apiVersion: "v1",
    kind: "Pod",
    metadata: { name, namespace, labels },
    spec: { nodeName, containers: [container] },
    status: {
      phase: "Running",
      conditions: [
        { type: "Ready", status: "True" },
        { type: "PodScheduled", status: "True" },
      ],
      containerStatuses: [
        {
          name: container.name,
          ready: true,
          restartCount: 0,
          state: { running: { startedAt: "2026-10-01T02:14:00Z" } },
          image: container.image,
        },
      ],
    },
  };
}
