import { repositoryUrl } from "../release/source-fixture.js";
import type { Resource } from "../simulation/cluster-model.js";
export const gitopsPrerequisites: Resource[] = [
  {
    apiVersion: "v1",
    kind: "Namespace",
    metadata: { name: "openshift-gitops" },
  },
  {
    apiVersion: "v1",
    kind: "ServiceAccount",
    metadata: {
      name: "argocd-application-controller",
      namespace: "openshift-gitops",
    },
  },
  {
    apiVersion: "v1",
    kind: "Pod",
    metadata: {
      name: "argocd-application-controller-0",
      namespace: "openshift-gitops",
      annotations: { "ghostroute.training/component": "controller" },
    },
    spec: {
      serviceAccountName: "argocd-application-controller",
      containers: [
        {
          name: "application-controller",
          image: "quay.io/argoproj/argocd:v3.5.4",
          securityContext: {
            allowPrivilegeEscalation: false,
            capabilities: { drop: ["ALL"] },
            seccompProfile: { type: "RuntimeDefault" },
          },
        },
      ],
    },
  },
  {
    apiVersion: "rbac.authorization.k8s.io/v1",
    kind: "Role",
    metadata: { name: "payment-gitops", namespace: "payments" },
    rules: [
      {
        apiGroups: ["apps"],
        resources: ["deployments"],
        verbs: ["get", "list", "watch", "create", "update", "patch", "delete"],
      },
    ],
  },
  {
    apiVersion: "rbac.authorization.k8s.io/v1",
    kind: "RoleBinding",
    metadata: { name: "payment-gitops", namespace: "payments" },
    roleRef: {
      apiGroup: "rbac.authorization.k8s.io",
      kind: "Role",
      name: "payment-gitops",
    },
    subjects: [
      {
        kind: "ServiceAccount",
        name: "argocd-application-controller",
        namespace: "openshift-gitops",
      },
    ],
  },
  {
    apiVersion: "argoproj.io/v1alpha1",
    kind: "AppProject",
    metadata: { name: "payments", namespace: "openshift-gitops" },
    spec: {
      sourceRepos: [repositoryUrl],
      destinations: [
        { server: "https://kubernetes.default.svc", namespace: "payments" },
      ],
      clusterResourceWhitelist: [],
      namespaceResourceWhitelist: [{ group: "apps", kind: "Deployment" }],
    },
  },
];
export const paymentApplication: Resource = {
  apiVersion: "argoproj.io/v1alpha1",
  kind: "Application",
  metadata: { name: "payment-api", namespace: "openshift-gitops" },
  spec: {
    project: "payments",
    source: { repoURL: repositoryUrl, targetRevision: "main", path: "deploy" },
    destination: {
      server: "https://kubernetes.default.svc",
      namespace: "payments",
    },
    syncPolicy: {
      syncOptions: ["Replace=true"],
      automated: { enabled: true, prune: true, selfHeal: true },
    },
  },
};
export { developerDeployment, repairedDeployment } from "./manifests-source.js";
