import type { Resource } from "../simulation/cluster-model.js";

function equalityLabels(text: string): Record<string, string> {
  return Object.fromEntries(
    text.split(",").map((pair) => {
      const match = pair.match(/^([^=,!\s]+)={1,2}([^=,!\s]*)$/);
      if (!match)
        throw new Error("error: service selectors require key=value pairs");
      return [match[1], match[2]];
    }),
  );
}
const portValue = (text: string): string | number =>
  /^\d+$/.test(text) ? Number(text) : text;

/** Client-side generators; storage, admission and controllers remain API-owned. */
export function exposedResource(
  source: Resource,
  flags: Record<string, string[]>,
): Resource {
  const flag = (name: string) => flags[name]?.at(-1);
  const name = flag("--name") ?? source.metadata.name;
  const labels = flag("-l") ?? flag("--labels");
  const metadata = {
    name,
    namespace: source.metadata.namespace,
    creationTimestamp: null as any,
    labels:
      labels !== undefined
        ? equalityLabels(labels)
        : { ...source.metadata.labels },
  };
  if (source.kind === "Service") {
    const ports = source.spec?.ports ?? [];
    if (!ports.length)
      throw new Error("error: cannot expose a service without ports");
    const target = flag("--port")
      ? portValue(flag("--port")!)
      : (ports[0].name ?? ports[0].targetPort ?? ports[0].port);
    return {
      apiVersion: "route.openshift.io/v1",
      kind: "Route",
      metadata,
      spec: {
        host: flag("--hostname") ?? "",
        to: { kind: "", name: source.metadata.name },
        port: { targetPort: target },
        ...(flag("--path") ? { path: flag("--path") } : {}),
        ...(flag("--wildcard-policy")
          ? { wildcardPolicy: flag("--wildcard-policy") }
          : {}),
      },
    };
  }
  if (source.kind !== "Pod" && source.kind !== "Deployment")
    throw new Error(
      "simulation: expose supports Pod, Deployment and Service sources",
    );
  const selector =
    flag("--selector") !== undefined
      ? equalityLabels(flag("--selector")!)
      : source.kind === "Pod"
        ? { ...source.metadata.labels }
        : { ...source.spec?.selector?.matchLabels };
  if (source.spec?.selector?.matchExpressions?.length && !flag("--selector"))
    throw new Error(
      "error: couldn't find a selector via --selector flag or introspection: match expressions cannot be converted to a Service selector",
    );
  if (!Object.keys(selector).length)
    throw new Error(
      "error: couldn't find a selector via --selector flag or introspection",
    );
  const spec =
    source.kind === "Pod" ? source.spec : source.spec?.template?.spec;
  const found = spec?.containers?.flatMap((c: any) => c.ports ?? []) ?? [];
  const portTexts =
    flag("--port")?.split(",") ??
    ([...new Set(found.map((p: any) => String(p.containerPort)))] as string[]);
  if (!portTexts.length)
    throw new Error(
      "error: couldn't find port via --port flag or introspection",
    );
  const ports = portTexts.map((text, i) => {
    const port = Number(text);
    if (!Number.isInteger(port) || port < 1 || port > 65535)
      throw new Error("error: invalid service port " + text);
    const protocol =
      flag("--protocol") ??
      found.find((p: any) => p.containerPort === port)?.protocol ??
      "TCP";
    if (!["TCP", "UDP", "SCTP"].includes(protocol))
      throw new Error("error: invalid protocol " + protocol);
    return {
      ...(portTexts.length > 1 ? { name: `port-${i + 1}` } : {}),
      port,
      protocol,
      targetPort: flag("--target-port")
        ? portValue(flag("--target-port")!)
        : port,
    };
  });
  const type = flag("--type") ?? "ClusterIP";
  if (type !== "ClusterIP")
    throw new Error(
      "simulation: expose currently supports ClusterIP and headless Services",
    );
  return {
    apiVersion: "v1",
    kind: "Service",
    metadata,
    spec: {
      selector,
      ports,
      ...(flag("--type") ? { type } : {}),
      ...(flag("--cluster-ip") ? { clusterIP: flag("--cluster-ip") } : {}),
      ...(flag("--external-ip")
        ? { externalIPs: [flag("--external-ip")] }
        : {}),
      ...(flag("--session-affinity")
        ? { sessionAffinity: flag("--session-affinity") }
        : {}),
    },
  };
}
