import type { Resource } from "../simulation/cluster-model.js";

/** Kubernetes networking/v1 defaulting: an empty egress list does not infer Egress. */
export function defaultNetworkPolicy(resource: Resource) {
  if (resource.kind !== "NetworkPolicy" || !resource.spec) return;
  if (!resource.spec.policyTypes?.length)
    resource.spec.policyTypes = resource.spec.egress?.length ? ["Ingress", "Egress"] : ["Ingress"];
  for (const rule of [...(resource.spec.ingress ?? []), ...(resource.spec.egress ?? [])])
    for (const port of rule.ports ?? []) port.protocol ??= "TCP";
}

export function matchesLabels(labels: Record<string, string> = {}, selector: any = {}) {
  if (!Object.entries(selector.matchLabels ?? {}).every(([key, value]) => labels[key] === value)) return false;
  return (selector.matchExpressions ?? []).every((requirement: any) => {
    const present = Object.hasOwn(labels, requirement.key);
    const included = (requirement.values ?? []).includes(labels[requirement.key]);
    switch (requirement.operator) {
      case "In": return present && included;
      case "NotIn": return !present || !included;
      case "Exists": return present;
      case "DoesNotExist": return !present;
      default: throw new Error("Error from server (Invalid): invalid label selector operator");
    }
  });
}

function ipv4(address: string) {
  const parts = address.split(".");
  if (parts.length !== 4 || parts.some(p => !/^\d+$/.test(p) || Number(p) > 255))
    throw new Error("simulation: network policy address evaluation currently supports IPv4");
  return parts.reduce((value, part) => ((value << 8) | Number(part)) >>> 0, 0);
}
function inRange(address: string, cidr: string) {
  const [network, length] = cidr.split("/");
  const bits = Number(length);
  if (length === undefined || !Number.isInteger(bits) || bits < 0 || bits > 32)
    throw new Error("Error from server (Invalid): invalid IPv4 CIDR");
  const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
  return (ipv4(address) & mask) === (ipv4(network) & mask);
}

/** Pure tenant-policy evaluation shared by application health and Pod diagnostics. */
export function networkPolicyDirection(
  resources: Resource[], pod: Resource, peer: Resource | undefined,
  direction: "ingress" | "egress", port: number,
  protocol = "TCP", externalIP?: string,
): boolean | undefined {
  const namespace = pod.metadata.namespace;
  const type = direction === "ingress" ? "Ingress" : "Egress";
  const selected = resources.filter(policy => policy.kind === "NetworkPolicy" &&
    policy.metadata.namespace === namespace && matchesLabels(pod.metadata.labels, policy.spec?.podSelector) &&
    (policy.spec?.policyTypes?.length ? policy.spec.policyTypes : (policy.spec?.egress?.length ? ["Ingress", "Egress"] : ["Ingress"])).includes(type));
  if (!selected.length) return undefined;
  function peerMatches(selector: any) {
    if (selector.ipBlock) {
      const address = externalIP ?? peer?.status?.podIP;
      return typeof address === "string" && inRange(address, selector.ipBlock.cidr) &&
        !(selector.ipBlock.except ?? []).some((except: string) => inRange(address, except));
    }
    if (!Object.keys(selector).length) return true;
    if (!peer || externalIP) return false;
    if (selector.namespaceSelector) {
      const ns = resources.find(r => r.kind === "Namespace" && r.metadata.name === peer.metadata.namespace);
      if (!matchesLabels({"kubernetes.io/metadata.name": peer.metadata.namespace!, ...ns?.metadata.labels}, selector.namespaceSelector)) return false;
    } else if (peer.metadata.namespace !== namespace) return false;
    return !selector.podSelector || matchesLabels(peer.metadata.labels, selector.podSelector);
  }
  function portMatches(entry: any) {
    if ((entry.protocol ?? "TCP") !== protocol) return false;
    if (entry.port === undefined) return true;
    if (typeof entry.port === "number") return port >= entry.port && port <= (entry.endPort ?? entry.port);
    const destination = direction === "ingress" ? pod : peer;
    return destination?.spec?.containers?.some(container => (container as any).ports?.some((p: any) =>
      p.name === entry.port && p.containerPort === port && (p.protocol ?? "TCP") === protocol)) ?? false;
  }
  return selected.some(policy => (policy.spec?.[direction] ?? []).some((rule: any) => {
    const peers = direction === "egress" ? rule.to : rule.from;
    return (!rule.ports?.length || rule.ports.some(portMatches)) && (!peers?.length || peers.some(peerMatches));
  }));
}
