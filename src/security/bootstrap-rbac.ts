import {defaultSccs} from "../simulation/default-sccs.js";
import type { Resource } from "../simulation/cluster-model.js";

const apiVersion = "rbac.authorization.k8s.io/v1";
const read = ["get", "list", "watch"];
const writes = [...read, "create", "update", "patch", "delete", "deletecollection"];
const tenantRules = [
  {apiGroups:[""],resources:["pods","pods/exec","pods/log","services","endpoints","configmaps","secrets","serviceaccounts","persistentvolumeclaims","events","resourcequotas","limitranges"],verbs:writes},
  {apiGroups:["discovery.k8s.io","apps","batch","networking.k8s.io","route.openshift.io","tekton.dev","triggers.tekton.dev","k8s.ovn.org","k8s.cni.cncf.io","external-secrets.io","compliance.openshift.io","security-profiles-operator.x-k8s.io","secrets-store.csi.x-k8s.io","monitoring.coreos.com","constraints.gatekeeper.sh"],resources:["*"],verbs:writes},
];
export function projectAdminBinding(namespace: string, username: string): Resource {
  return {apiVersion,kind:"RoleBinding",metadata:{name:"admin",namespace},roleRef:{apiGroup:"rbac.authorization.k8s.io",kind:"ClusterRole",name:"admin"},subjects:[{kind:"User",name:username}]};
}
/** Bootstrapped grants are real resources. Authorization never depends on the active chapter. */
export function bootstrapRbac(): Resource[] {
  const role = (name:string,rules:unknown[]):Resource => ({apiVersion,kind:"ClusterRole",metadata:{name},rules});
  const binding = (name:string,roleName:string,subjects:unknown[]):Resource => ({apiVersion,kind:"ClusterRoleBinding",metadata:{name},roleRef:{apiGroup:"rbac.authorization.k8s.io",kind:"ClusterRole",name:roleName},subjects});
  return [
    ...defaultSccs.map(scc=>role("system:openshift:scc:"+scc.metadata.name,[{apiGroups:["security.openshift.io"],resources:["securitycontextconstraints"],verbs:["use"],resourceNames:[scc.metadata.name]}])),
    binding("system:openshift:scc:restricted-v3","system:openshift:scc:restricted-v3",[{kind:"Group",name:"system:authenticated"}]),
    binding("system:openshift:scc:restricted-v2","system:openshift:scc:restricted-v2",[{kind:"Group",name:"system:authenticated"}]),
    role("cluster-admin",[{apiGroups:["*"],resources:["*"],verbs:["*"]}]),
    role("admin",[...tenantRules,{apiGroups:["rbac.authorization.k8s.io"],resources:["roles","rolebindings"],verbs:writes}]),
    role("edit",tenantRules),
    role("view",tenantRules.map(rule=>({...rule,verbs:read,resources:rule.resources.filter(name=>!["secrets","pods/exec"].includes(name))}))),
    role("self-provisioner",[{apiGroups:["project.openshift.io"],resources:["projectrequests"],verbs:["create"]}]),
    // Story investigators have an explicitly inspectable cluster read grant; secrets remain tenant scoped.
    role("incident-reader",[{apiGroups:["*"],resources:["nodes","namespaces","projects","pods","pods/log","deployments","services","endpoints","configmaps","serviceaccounts","events","networkpolicies","securitycontextconstraints","roles","rolebindings","clusterroles","clusterrolebindings","customresourcedefinitions","resourcequotas","limitranges","persistentvolumeclaims","userdefinednetworks","clusteruserdefinednetworks","networkattachmentdefinitions","applications","appprojects","applicationsets","pipelineruns","taskruns","pipelines","tasks","eventlisteners","triggerbindings","triggertemplates","externalsecrets","secretstores","compliancescans","complianceremediations","tailoredprofiles","egressips","egressfirewalls","adminnetworkpolicies","baselineadminnetworkpolicies","seccompprofiles"],verbs:read}]),
    binding("platform-admin","cluster-admin",[{kind:"User",name:"platform-admin"}]),
    binding("incident-reader","incident-reader",[{kind:"User",name:"operator"}]),
    binding("self-provisioners","self-provisioner",[{kind:"Group",name:"system:authenticated:oauth"}]),
    {...projectAdminBinding("payments","operator"),roleRef:{apiGroup:"rbac.authorization.k8s.io",kind:"ClusterRole",name:"edit"}},
  ];
}
