import type { Resource } from "./cluster-model.js";

const incidentAddresses = ["10.128.0.21", "10.129.0.22", "10.129.0.23"];
function unusedAddress(used: Set<string>) {
  for (let n = 276; n < 65535; n++) {
    if (n % 256 === 0 || n % 256 === 255) continue;
    const address = `10.128.${Math.floor(n / 256)}.${n % 256}`;
    if (!used.has(address)) return address;
  }
  throw new Error("simulation: recorded Pod address pool exhausted");
}
export function podNetworkDomain(pod: Resource | undefined) {
  try {
    return (
      JSON.parse(
        pod?.metadata.annotations?.["k8s.v1.cni.cncf.io/network-status"] ??
          "[]",
      ).find((net: any) => net.default)?.name ?? "ovn-kubernetes"
    );
  } catch {
    return "ovn-kubernetes";
  }
}
export function creationNetwork(pod: Resource, resources: Resource[]) {
  const prior = resources.find(
    (r) =>
      r.kind === "Pod" &&
      r.metadata.name === pod.metadata.name &&
      r.metadata.namespace === pod.metadata.namespace,
  );
  const network = resources.find(
    (r) =>
      r.kind === "UserDefinedNetwork" &&
      r.metadata.namespace === pod.metadata.namespace &&
      r.spec?.layer2?.role === "Primary",
  );
  const domain = prior
    ? podNetworkDomain(prior)
    : network
      ? `${pod.metadata.namespace}/${network.metadata.name}`
      : "ovn-kubernetes";
  return {
    domain,
    subnet:
      domain === "ovn-kubernetes"
        ? undefined
        : network?.spec?.layer2?.subnets?.[0],
  };
}
export function allocatePodAddress(pod: Resource, resources: Resource[]) {
  const same = (r: Resource) =>
    r.kind === "Pod" &&
    r.metadata.name === pod.metadata.name &&
    r.metadata.namespace === pod.metadata.namespace;
  const { domain, subnet } = creationNetwork(pod, resources);
  const prior = resources.find(same)?.status?.podIP;
  const used = new Set(
    resources
      .filter(
        (r) => r.kind === "Pod" && !same(r) && podNetworkDomain(r) === domain,
      )
      .map((r) => String(r.status?.podIP ?? "")),
  );
  if (typeof prior === "string" && prior && !used.has(prior)) return prior;
  if (domain !== "ovn-kubernetes") {
    const match = String(subnet).match(/^(\d+\.\d+\.\d+)\.0\/24$/);
    if (!match)
      throw new Error(
        "simulation: recorded primary UDN address allocation supports IPv4 /24 fixtures",
      );
    for (let n = 20; n < 255; n++) {
      const ip = `${match[1]}.${n}`;
      if (!used.has(ip)) return ip;
    }
    throw new Error("simulation: recorded primary UDN address pool exhausted");
  }
  return unusedAddress(used);
}
/** Repair the old count-based allocator's collisions while retaining object identity and progress. */
export function repairDuplicatePodAddresses(resources: Resource[]) {
  const all = new Set(
    resources
      .filter((r) => r.kind === "Pod")
      .map((r) => String(r.status?.podIP ?? "")),
  );
  for (const address of incidentAddresses) all.add(address);
  const seen = new Set<string>();
  const incident = (pod: Resource) => pod.metadata.namespace === "payments" &&
    (pod.metadata.name.startsWith("payment-api-") || pod.metadata.name === "ledger-86bbb-zyx12");
  const pods = resources.filter(r => r.kind === "Pod").sort((a,b) => Number(incident(b)) - Number(incident(a)));
  for (const pod of pods) {
    const ip = pod.status?.podIP;
    if (typeof ip !== "string" || !ip) continue;
    const key = podNetworkDomain(pod) + "|" + ip;
    if (seen.has(key)) {
      const address =
        podNetworkDomain(pod) === "ovn-kubernetes"
          ? unusedAddress(all)
          : allocatePodAddress(pod, resources);
      pod.status!.podIP = address;
      pod.status!.podIPs = [{ ip: address }];
      try {
        const networks = JSON.parse(
          pod.metadata.annotations?.["k8s.v1.cni.cncf.io/network-status"] ??
            "[]",
        );
        for (const network of networks)
          if (network.default) network.ips = [address];
        if (networks.length)
          pod.metadata.annotations!["k8s.v1.cni.cncf.io/network-status"] =
            JSON.stringify(networks);
      } catch {
        /* Legacy saves may have no recorded attachment annotation. */
      }
      all.add(address);
      seen.add(podNetworkDomain(pod) + "|" + address);
    } else seen.add(key);
  }
}
