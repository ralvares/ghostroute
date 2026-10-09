import type { Resource, PodSpec } from "./cluster-model.js";

/** Kubernetes RuntimeClass admission: runtime names are references, not installed runtimes. */
export function admitRuntimeClass(pod: Resource, resources: Resource[]) {
  const spec = pod.spec!;
  if (!spec.runtimeClassName) return;
  const runtime = resources.find(
    (r) =>
      r.kind === "RuntimeClass" && r.metadata.name === spec.runtimeClassName,
  );
  const forbidden = (message: string): never => {
    throw new Error(
      `Error from server (Forbidden): pods "${pod.metadata.name}" is forbidden: ${message}`,
    );
  };
  if (!runtime)
    forbidden(
      `pod rejected: RuntimeClass "${spec.runtimeClassName}" not found`,
    );
  const overhead = runtime!.overhead as
    { podFixed?: Record<string, string> } | undefined;
  if (spec.overhead && !sameOverhead(spec.overhead, overhead?.podFixed ?? {}))
    forbidden(
      "pod rejected: Pod's Overhead doesn't match RuntimeClass's defined Overhead",
    );
  if (overhead?.podFixed) spec.overhead = structuredClone(overhead.podFixed);
  const scheduling = runtime!.scheduling as
    | { nodeSelector?: Record<string, string>; tolerations?: unknown[] }
    | undefined;
  for (const [key, value] of Object.entries(scheduling?.nodeSelector ?? {})) {
    if (
      spec.nodeSelector?.[key] !== undefined &&
      spec.nodeSelector[key] !== value
    )
      forbidden(
        `conflict: runtimeClass.scheduling.nodeSelector[${key}] = ${value}; pod.spec.nodeSelector[${key}] = ${spec.nodeSelector[key]}`,
      );
    spec.nodeSelector = { ...spec.nodeSelector, [key]: value };
  }
  if (scheduling?.tolerations)
    spec.tolerations = [
      ...(spec.tolerations ?? []),
      ...scheduling.tolerations.filter(
        (t) =>
          !(spec.tolerations ?? []).some(
            (old: unknown) => JSON.stringify(old) === JSON.stringify(t),
          ),
      ),
    ];
}
export function selectRuntimeNode(
  spec: PodSpec,
  resources: Resource[],
): string | undefined {
  if (spec.nodeName) return spec.nodeName;
  const nodes = resources.filter(
    (r) =>
      r.kind === "Node" &&
      Object.hasOwn(
        r.metadata.labels ?? {},
        "node-role.kubernetes.io/worker",
      ) &&
      !r.spec?.unschedulable &&
      Object.entries(spec.nodeSelector ?? {}).every(
        ([key, value]) => r.metadata.labels?.[key] === value,
      ),
  );
  return nodes[
    resources.filter((r) => r.kind === "Pod").length % Math.max(1, nodes.length)
  ]?.metadata.name;
}
export function runtimeFailure(
  pod: Resource,
  resources: Resource[],
): { reason: string; message: string } | undefined {
  const spec = pod.spec!,
    node = resources.find(
      (r) => r.kind === "Node" && r.metadata.name === spec.nodeName,
    );
  if (
    !node ||
    Object.entries(spec.nodeSelector ?? {}).some(
      ([key, value]) => node.metadata.labels?.[key] !== value,
    )
  )
    return {
      reason: "FailedScheduling",
      message: "no nodes satisfy the Pod node selector",
    };
  if (!spec.runtimeClassName) return;
  const runtime = resources.find(
    (r) =>
      r.kind === "RuntimeClass" && r.metadata.name === spec.runtimeClassName,
  )!;
  const handler = (node.status?.runtimeHandlers as any[] | undefined)?.find(
    (h) => h.name === runtime?.handler,
  );
  if (!handler)
    return {
      reason: "FailedCreatePodSandBox",
      message: `Failed to create pod sandbox: no runtime for "${runtime?.handler}" is configured`,
    };
  if (spec.hostUsers === false && handler.features?.userNamespaces !== true)
    return {
      reason: "FailedCreatePodSandBox",
      message: `Failed to create pod sandbox: RuntimeHandler "${runtime?.handler}" does not support user namespaces`,
    };
}

function sameOverhead(
  a: Record<string, string>,
  b: Record<string, string>,
): boolean {
  const units: Record<string, number> = {
    n: 1e-9,
    u: 1e-6,
    m: 1e-3,
    "": 1,
    k: 1e3,
    K: 1e3,
    M: 1e6,
    G: 1e9,
    T: 1e12,
    P: 1e15,
    E: 1e18,
    Ki: 1024,
    Mi: 1024 ** 2,
    Gi: 1024 ** 3,
    Ti: 1024 ** 4,
    Pi: 1024 ** 5,
    Ei: 1024 ** 6,
  };
  const value = (text: string) => {
    const match = String(text).match(
      /^([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?)([a-zA-Z]*)$/,
    );
    if (!match || units[match[2]] === undefined)
      throw new Error(
        "simulation: unsupported RuntimeClass overhead quantity " + text,
      );
    return Number(match[1]) * units[match[2]];
  };
  return (
    Object.keys(a).length === Object.keys(b).length &&
    Object.entries(a).every(
      ([key, quantity]) =>
        b[key] !== undefined && value(quantity) === value(b[key]),
    )
  );
}
