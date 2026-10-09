import { S } from "../simulation/state.js";
import {
  resourceTypes,
  resolveResource,
} from "../simulation/resource-types.js";

export function identityGroups(username: string) {
  const sa = username.match(/^system:serviceaccount:([^:]+):/);
  return sa ? ["system:authenticated", "system:serviceaccounts", "system:serviceaccounts:"+sa[1]] : ["system:authenticated", "system:authenticated:oauth"];
}
export function roleAllows(
  username: string,
  verb: string,
  resource: string,
  namespace?: string,
  name?: string,
  apiGroups?: string[],
) {
  const type = resolveResource(resource.split("/")[0]);
  resource = (type ?? resource.split("/")[0]) + (resource.includes("/") ? "/"+resource.split("/")[1] : "");
  const version = type ? resourceTypes[type].apiVersion : "v1";
  const group = version.includes("/") ? version.split("/")[0] : "";
  for (const binding of S.cluster.resources.filter(
    (item) =>
      item.kind === "ClusterRoleBinding" ||
      (item.kind === "RoleBinding" && item.metadata.namespace === namespace &&
       (!type || resourceTypes[type].namespaced || resource === "securitycontextconstraints" || (verb === "bind" && resource === "clusterroles"))),
  )) {
    const subjects = binding.subjects as
      { kind: string; name: string; namespace?: string }[] | undefined;
    if (
      !subjects?.some(
        (subject) =>
          (subject.kind === "User" && subject.name === username) ||
          (subject.kind === "Group" &&
            identityGroups(username).includes(subject.name)) ||
          (subject.kind === "ServiceAccount" &&
            username ===
              `system:serviceaccount:${subject.namespace ?? namespace}:${subject.name}`),
      )
    )
      continue;
    const ref = binding.roleRef as { kind: string; name: string } | undefined;
    if (!ref) continue;
    const role = S.cluster.resources.find(
      (item) =>
        item.kind === ref.kind &&
        item.metadata.name === ref.name &&
        (ref.kind === "ClusterRole" ? !item.metadata.namespace : item.metadata.namespace === namespace),
    );
    const rules = role?.rules as
      | {
          verbs?: string[];
          resources?: string[];
          apiGroups?: string[];
          resourceNames?: string[];
        }[]
      | undefined;
    if (
      rules?.some(
        (rule) =>
          (rule.verbs?.includes(verb) || rule.verbs?.includes("*")) &&
          (rule.resources?.includes(resource) ||
            rule.resources?.includes("*") ||
            rule.resources?.includes("*/"+resource.split("/")[1])) &&
          (apiGroups ?? [group]).every(requestedGroup => rule.apiGroups?.includes(requestedGroup) || rule.apiGroups?.includes("*")) &&
          (!rule.resourceNames?.length || (!["create","deletecollection"].includes(verb) &&
            (!!name && rule.resourceNames.includes(name)))),
      )
    )
      return true;
  }
  return false;
}

export function authorized(
  verb: string,
  resource: string,
  namespace?: string,
  name?: string,
) {
  return roleAllows(S.cluster.user, verb, resource, namespace, name);
}
export function forbidden(
  verb: string,
  resource: string,
  namespace?: string,
  name?: string,
) {
  const type = resolveResource(resource.split("/")[0]);
  const version = type ? resourceTypes[type].apiVersion : "v1";
  const group = version.includes("/") ? version.split("/")[0] : "";
  return `Error from server (Forbidden): ${resource}${group ? "." + group : ""}${name ? ` "${name}"` : ""} is forbidden: User "${S.cluster.user}" cannot ${verb} resource "${resource}" in API group "${group}" ${namespace ? `in the namespace "${namespace}"` : "at the cluster scope"}`;
}

export function assertCanImpersonate(identity: string) {
  if (authorized("impersonate", "users", undefined, identity)) return;
  const sa = identity.match(/^system:serviceaccount:([^:]+):([^:]+)$/);
  const resource = sa ? "serviceaccounts" : "users";
  const name = sa ? sa[2] : identity;
  const namespace = sa?.[1];
  if (roleAllows(S.cluster.user, "impersonate", resource, namespace, name))
    return;
  throw new Error(
    `Error from server (Forbidden): ${resource} "${name}" is forbidden: User "${S.cluster.user}" cannot impersonate resource "${resource}" in API group "" ${namespace ? `in the namespace "${namespace}"` : "at the cluster scope"}`,
  );
}
