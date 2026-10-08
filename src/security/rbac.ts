import { S } from "../simulation/state.js";

export function roleAllows(
  username: string,
  verb: string,
  resource: string,
  namespace?: string,
  name?: string,
) {
  const group =
    resource === "securitycontextconstraints"
      ? "security.openshift.io"
      : resource === "deployments"
        ? "apps"
        : resource === "networkpolicies"
          ? "networking.k8s.io"
          : ["roles", "rolebindings"].includes(resource)
            ? "rbac.authorization.k8s.io"
            : "";
  for (const binding of S.cluster.resources.filter(
    (item) =>
      item.kind === "RoleBinding" && item.metadata.namespace === namespace,
  )) {
    const subjects = binding.subjects as
      { kind: string; name: string; namespace?: string }[] | undefined;
    if (
      !subjects?.some(
        (subject) =>
          (subject.kind === "User" && subject.name === username) ||
          (subject.kind === "Group" &&
            subject.name === "system:authenticated") ||
          (subject.kind === "ServiceAccount" &&
            username ===
              `system:serviceaccount:${subject.namespace ?? namespace}:${subject.name}`),
      )
    )
      continue;
    const ref = binding.roleRef as { kind: string; name: string } | undefined;
    if (!ref) continue;
    if (
      ref.kind === "ClusterRole" &&
      ref.name.startsWith("system:openshift:scc:") &&
      verb === "use" &&
      resource === "securitycontextconstraints" &&
      name === ref.name.slice("system:openshift:scc:".length)
    )
      return true;
    const role = S.cluster.resources.find(
      (item) =>
        item.kind === ref.kind &&
        item.metadata.name === ref.name &&
        item.metadata.namespace === namespace,
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
            rule.resources?.includes("*")) &&
          (rule.apiGroups?.includes(group) || rule.apiGroups?.includes("*")) &&
          (!rule.resourceNames?.length ||
            (!!name && rule.resourceNames.includes(name))),
      )
    )
      return true;
  }
  return false;
}

export function authorized(verb: string, resource: string, namespace?: string) {
  if (S.cluster.user === "platform-admin") return true;
  if (roleAllows(S.cluster.user, verb, resource, namespace)) return true;
  if (["get", "list", "watch"].includes(verb)) return resource !== "secrets";
  if (resource === "namespaces" && verb === "create") return true;
  if (
    resource === "securitycontextconstraints" ||
    resource === "clusterrolebindings" ||
    resource === "rolebindings"
  )
    return false;
  return (
    !!namespace &&
    S.cluster.ownedNamespaces.has(namespace) &&
    ["create", "update", "patch", "delete"].includes(verb)
  );
}
export function forbidden(verb: string, resource: string, namespace?: string) {
  const group =
    resource === "securitycontextconstraints"
      ? "security.openshift.io"
      : ["rolebindings", "roles", "clusterrolebindings"].includes(resource)
        ? "rbac.authorization.k8s.io"
        : resource === "deployments"
          ? "apps"
          : resource === "networkpolicies"
            ? "networking.k8s.io"
            : "";
  return `Error from server (Forbidden): ${resource}${group ? "." + group : ""} is forbidden: User "${S.cluster.user}" cannot ${verb} resource "${resource}" in API group "${group}" ${namespace ? `in the namespace "${namespace}"` : "at the cluster scope"}`;
}
