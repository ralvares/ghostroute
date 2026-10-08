export const resourceTypes = {
  nodes: {
    kind: "Node",
    apiVersion: "v1",
    namespaced: false,
    aliases: ["node", "no"],
  },
  namespaces: {
    kind: "Namespace",
    apiVersion: "v1",
    namespaced: false,
    aliases: ["namespace", "ns", "project", "projects"],
  },
  pods: {
    kind: "Pod",
    apiVersion: "v1",
    namespaced: true,
    aliases: ["pod", "po"],
  },
  deployments: {
    kind: "Deployment",
    apiVersion: "apps/v1",
    namespaced: true,
    aliases: ["deployment", "deploy"],
  },
  serviceaccounts: {
    kind: "ServiceAccount",
    apiVersion: "v1",
    namespaced: true,
    aliases: ["serviceaccount", "sa"],
  },
  services: {
    kind: "Service",
    apiVersion: "v1",
    namespaced: true,
    aliases: ["service", "svc"],
  },
  configmaps: {
    kind: "ConfigMap",
    apiVersion: "v1",
    namespaced: true,
    aliases: ["configmap", "cm"],
  },
  secrets: {
    kind: "Secret",
    apiVersion: "v1",
    namespaced: true,
    aliases: ["secret"],
  },
  networkpolicies: {
    kind: "NetworkPolicy",
    apiVersion: "networking.k8s.io/v1",
    namespaced: true,
    aliases: ["networkpolicy", "netpol"],
  },
  roles: {
    kind: "Role",
    apiVersion: "rbac.authorization.k8s.io/v1",
    namespaced: true,
    aliases: ["role"],
  },
  rolebindings: {
    kind: "RoleBinding",
    apiVersion: "rbac.authorization.k8s.io/v1",
    namespaced: true,
    aliases: ["rolebinding"],
  },
  securitycontextconstraints: {
    kind: "SecurityContextConstraints",
    apiVersion: "security.openshift.io/v1",
    namespaced: false,
    aliases: ["scc"],
  },
  events: {
    kind: "Event",
    apiVersion: "v1",
    namespaced: true,
    aliases: ["event", "ev"],
  },

  routes: {
    kind: "Route",
    apiVersion: "route.openshift.io/v1",
    namespaced: true,
    aliases: ["route"],
  },
  resourcequotas: {
    kind: "ResourceQuota",
    apiVersion: "v1",
    namespaced: true,
    aliases: ["quota", "resourcequota"],
  },
  limitranges: {
    kind: "LimitRange",
    apiVersion: "v1",
    namespaced: true,
    aliases: ["limits", "limitrange"],
  },
  images: {
    kind: "Image",
    apiVersion: "config.openshift.io/v1",
    namespaced: false,
    aliases: ["image"],
  },
  adminnetworkpolicies: {
    kind: "AdminNetworkPolicy",
    apiVersion: "policy.networking.k8s.io/v1alpha1",
    namespaced: false,
    aliases: ["anp", "adminnetworkpolicy"],
  },
  baselineadminnetworkpolicies: {
    kind: "BaselineAdminNetworkPolicy",
    apiVersion: "policy.networking.k8s.io/v1alpha1",
    namespaced: false,
    aliases: ["banp", "baselineadminnetworkpolicy"],
  },
  egressips: {
    kind: "EgressIP",
    apiVersion: "k8s.ovn.org/v1",
    namespaced: false,
    aliases: ["egressip"],
  },
  userdefinednetworks: {
    kind: "UserDefinedNetwork",
    apiVersion: "k8s.ovn.org/v1",
    namespaced: true,
    aliases: ["udn", "userdefinednetwork"],
  },
  networkattachmentdefinitions: {
    kind: "NetworkAttachmentDefinition",
    apiVersion: "k8s.cni.cncf.io/v1",
    namespaced: true,
    aliases: ["nad", "networkattachmentdefinition"],
  },
  pipelines: {
    kind: "Pipeline",
    apiVersion: "tekton.dev/v1",
    namespaced: true,
    aliases: ["pipeline"],
  },
  pipelineruns: {
    kind: "PipelineRun",
    apiVersion: "tekton.dev/v1",
    namespaced: true,
    aliases: ["pipelinerun"],
  },
  secretproviderclasses: {
    kind: "SecretProviderClass",
    apiVersion: "secrets-store.csi.x-k8s.io/v1",
    namespaced: true,
    aliases: ["secretproviderclass"],
  },
  secretstores: {
    kind: "SecretStore",
    apiVersion: "external-secrets.io/v1",
    namespaced: true,
    aliases: ["secretstore"],
  },
  externalsecrets: {
    kind: "ExternalSecret",
    apiVersion: "external-secrets.io/v1",
    namespaced: true,
    aliases: ["externalsecret"],
  },
  prometheusrules: {
    kind: "PrometheusRule",
    apiVersion: "monitoring.coreos.com/v1",
    namespaced: true,
    aliases: ["prometheusrule"],
  },
  compliancescans: {
    kind: "ComplianceScan",
    apiVersion: "compliance.openshift.io/v1alpha1",
    namespaced: true,
    aliases: ["compliancescan"],
  },
  tailoredprofiles: {
    kind: "TailoredProfile",
    apiVersion: "compliance.openshift.io/v1alpha1",
    namespaced: true,
    aliases: ["tailoredprofile"],
  },
  complianceremediations: {
    kind: "ComplianceRemediation",
    apiVersion: "compliance.openshift.io/v1alpha1",
    namespaced: true,
    aliases: ["complianceremediation"],
  },
  runtimeclasses: {
    kind: "RuntimeClass",
    apiVersion: "node.k8s.io/v1",
    namespaced: false,
    aliases: ["runtimeclass"],
  },
  seccompprofiles: {
    kind: "SeccompProfile",
    apiVersion: "security-profiles-operator.x-k8s.io/v1beta1",
    namespaced: true,
    aliases: ["seccompprofile"],
  },
  k8srequiredlabels: {
    kind: "K8sRequiredLabels",
    apiVersion: "constraints.gatekeeper.sh/v1beta1",
    namespaced: false,
    aliases: ["requiredlabels"],
  },
} as const;
export type ResourceType = keyof typeof resourceTypes;
export function resolveResource(name: string): ResourceType | undefined {
  return (Object.keys(resourceTypes) as ResourceType[]).find(
    (type) =>
      type === name ||
      (resourceTypes[type].aliases as readonly string[]).includes(name),
  );
}
