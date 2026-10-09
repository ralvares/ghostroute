import { S } from "../simulation/state.js";
import type { Resource } from "../simulation/cluster-model.js";
import { roleAllows } from "./rbac.js";

/** Kubernetes prevents a writable Role/Binding from becoming an implicit privilege escalation. */
export function validateRbacGrant(resource: Resource) {
  const user=S.cluster.user, namespace=resource.metadata.namespace;
  const roleKind=resource.kind==="ClusterRole"||resource.kind==="ClusterRoleBinding"?"ClusterRole":"Role";
  const roles=roleKind==="ClusterRole"?"clusterroles":"roles";
  let rules=resource.rules as any[]|undefined;
  if(resource.kind.endsWith("Binding")) {
    const ref=resource.roleRef as {kind:string;name:string;apiGroup:string}|undefined;
    if(!ref||!["Role","ClusterRole"].includes(ref.kind)||ref.apiGroup!=="rbac.authorization.k8s.io"||(resource.kind==="ClusterRoleBinding"&&ref.kind!=="ClusterRole")) throw new Error(`Error from server (Invalid): ${resource.kind} requires a valid roleRef`);
    if(roleAllows(user,"bind",ref.kind==="ClusterRole"?"clusterroles":"roles",namespace,ref.name)) return;
    if(ref.name.startsWith("system:openshift:scc:")) rules=[{apiGroups:["security.openshift.io"],resources:["securitycontextconstraints"],verbs:["use"],resourceNames:[ref.name.slice("system:openshift:scc:".length)]}];
    else rules=S.cluster.resources.find(r=>r.kind===ref.kind&&r.metadata.name===ref.name&&(ref.kind==="ClusterRole"||r.metadata.namespace===namespace))?.rules as any[]|undefined;
    if(!rules) throw new Error(`Error from server (NotFound): ${ref.kind.toLowerCase()}s.rbac.authorization.k8s.io "${ref.name}" not found`);
  } else if(roleAllows(user,"escalate",roles,namespace,resource.metadata.name)) return;
  if(!Array.isArray(rules)) throw new Error(`Error from server (Invalid): ${resource.kind} requires rules`);
  for(const rule of rules) for(const group of rule.apiGroups??[""]) for(const verb of rule.verbs??[]) for(const target of rule.resources??[]) for(const name of rule.resourceNames?.length?rule.resourceNames:[undefined]) {
    // Compare group as well as resource to avoid granting identically named resources in a different API group.
    if(!roleAllows(user,verb,target,namespace,name,[group])) throw new Error(`Error from server (Forbidden): ${resource.kind.toLowerCase()}s.rbac.authorization.k8s.io "${resource.metadata.name}" is forbidden: user "${user}" is attempting to grant RBAC permissions not currently held`);
  }
  if(rules.some(r=>r.nonResourceURLs?.length)) throw new Error("simulation: non-resource URL grant coverage is not implemented");
}
