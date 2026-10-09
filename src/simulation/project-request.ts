import type { Resource } from "./cluster-model.js";
import { S } from "./state.js";
import { applyResource, auditRequest } from "./cluster-api.js";
import { authorized, forbidden } from "../security/rbac.js";
import { projectAdminBinding } from "../security/bootstrap-rbac.js";

/** ProjectRequest is transient. The project controller provisions a namespace and its requesting user's grant. */
export function requestProject(request: Resource) {
  const user = S.cluster.user, name = request.metadata.name;
  if (!authorized("create","projectrequests",undefined,name)) throw new Error(forbidden("create","projectrequests",undefined,name));
  if (name.startsWith("openshift-") || name.startsWith("kube-") || ["default","openshift"].includes(name)) throw new Error(`Error from server (Forbidden): projectrequests.project.openshift.io "${name}" is forbidden: project name is reserved`);
  const auditStart=S.cluster.audit.length;
  try {
    S.cluster.user = "platform-admin";
    applyResource({apiVersion:"v1",kind:"Namespace",metadata:{name,annotations:{"openshift.io/requester":user,"openshift.io/display-name":String(request.displayName??""),"openshift.io/description":String(request.description??"")}}},"default",true);
    applyResource(projectAdminBinding(name,user),name,true);
  } finally {S.cluster.user=user;S.cluster.audit.splice(auditStart);}
  auditRequest("create","projectrequests",undefined,name,201);
  const namespace = S.cluster.resources.find(r=>r.kind==="Namespace"&&r.metadata.name===name)!;
  return {...structuredClone(namespace),apiVersion:"project.openshift.io/v1",kind:"Project"};
}
