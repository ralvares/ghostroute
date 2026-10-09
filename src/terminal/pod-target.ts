import {
  apiBody,
  apiResourcePath,
  kubeRequest,
} from "../simulation/kube-api.js";
import { resolveResource } from "../simulation/cluster-api.js";
import { matchesLabels } from "../security/network-policy.js";
import type { Resource } from "../simulation/cluster-model.js";

/** Native TYPE/NAME shorthand selects a Pod; exec authorization still targets pods/exec. */
export function shellPod(
  target: string,
  namespace: string,
  impersonateUser?: string,
): Resource {
  const [alias, name] = target.split("/");
  const type = name ? resolveResource(alias) : "pods";
  if (type !== "pods" && type !== "deployments")
    throw new Error(
      "simulation: shell targets support Pod and Deployment resources",
    );
  const object = apiBody(
    kubeRequest({
      method: "GET",
      path: apiResourcePath(type, namespace, name ?? alias),
      impersonateUser,
    }),
  ) as Resource;
  if (type === "pods") return object;
  const list = apiBody(
    kubeRequest({
      method: "GET",
      path: apiResourcePath("pods", namespace),
      impersonateUser,
    }),
  ) as { items: Resource[] };
  const pods = list.items.filter((p) =>
    matchesLabels(p.metadata.labels, object.spec?.selector ?? {}),
  );
  const ready = (p: Resource) =>
    (
      p.status?.conditions as { type: string; status: string }[] | undefined
    )?.some((c) => c.type === "Ready" && c.status === "True") ?? false;
  pods.sort(
    (a, b) =>
      Number(b.status?.phase === "Running") -
        Number(a.status?.phase === "Running") ||
      Number(ready(b)) - Number(ready(a)) ||
      a.metadata.name.localeCompare(b.metadata.name),
  );
  if (!pods.length)
    throw new Error(
      "Error from server (BadRequest): no Pod is available for " + target,
    );
  return pods[0];
}
