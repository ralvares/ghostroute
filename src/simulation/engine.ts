import {reconcileCompliance} from "../operators/compliance.js";
import {runtimeFailure} from "./runtime-class.js";
import {reconcileExternalSecrets} from "../security/external-secrets.js";
import {reconcileNetworks} from "../network/user-defined.js";
import {reconcileGitOps} from "../gitops/controller.js";
import {reconcileTekton,succeeded} from "../release/tekton.js";
import {registryAuthorized, registryHost, leakedToken, privatePullFailure} from "../security/registry.js";
import {pipelineGate} from "../security/rhacs/policies.js";
import { networkPolicyDirection, matchesLabels } from "../security/network-policy.js";
import { reconcileServices } from "../network/services.js";
import { normalizeSecret, secretValue } from "../simulation/secrets.js";
import { podNetworkDomain } from "../simulation/pod-addresses.js";
import { coreResources,reconcileNetworkPods, reconcileSecretConsumers } from "../simulation/cluster-api.js";
import { projectHealth } from "../simulation/health.js";
import { S } from "../simulation/state.js";
import type { Resource, PodSpec } from "../simulation/cluster-model.js";
import { roleAllows } from "../security/rbac.js";
import { admitPod } from "../security/scc.js";

export function resource(
  kind: string,
  name: string,
  namespace = S.cluster.namespace,
) {
  return [...S.cluster.resources, ...coreResources(), ...S.cluster.sccs].find(
    (r) =>
      r.kind === kind &&
      r.metadata.name === name &&
      (!r.metadata.namespace || r.metadata.namespace === namespace),
  );
}
export function valueAt(value: any, path: string): any {
  const parts = path.split(".");
  for (let i = 0; i < parts.length; i++) {
    if (value == null) return undefined;
    if (Object.hasOwn(value, parts.slice(i).join(".")))
      return value[parts.slice(i).join(".")];
    value = value[parts[i]];
  }
  return value;
}
export function quantity(text: string | undefined, kind: string) {
  if (!text) return 0;
  const match = text.match(/^(\d+(?:\.\d+)?)(m|Ki|Mi|Gi)?$/);
  if (!match)
    throw new Error(
      "simulation: supported quantities are decimal CPU/m or memory Ki/Mi/Gi",
    );
  return (
    Number(match[1]) *
    (match[2] === "m"
      ? 0.001
      : match[2] === "Ki"
        ? 1024
        : match[2] === "Mi"
          ? 1024 ** 2
          : match[2] === "Gi"
            ? 1024 ** 3
            : 1)
  );
}
export function match(labels: Record<string, string> | undefined, selector: any) {
  return matchesLabels(labels,selector ?? {});
}
export function nsLabels(namespace: string) {
  return {
    "kubernetes.io/metadata.name": namespace,
    ...resource("Namespace", namespace)?.metadata.labels,
  };
}
export const ready = (pod: Resource | undefined) =>
  !!pod &&
  ((pod.status?.containerStatuses as { ready: boolean }[] | undefined)?.every(
    (c) => c.ready,
  ) ??
    false);

/** Registry policy is enforced while pulling images, after API admission. */
export function registryPullFailure(image: string) {
  const sources = resource("Image", "cluster")?.spec?.registrySources;
  if (!sources) return "";
  const first = image.split("/")[0];
  const qualified =
    image.includes("/") && /[.:]|^localhost$/.test(first)
      ? image
      : "docker.io/" + (image.includes("/") ? "" : "library/") + image;
  const matches = (entry: string) =>
    qualified.startsWith(entry + "/") || qualified.split(":")[0] === entry;
  const denied =
    sources.blockedRegistries?.some(matches) ||
    (sources.allowedRegistries && !sources.allowedRegistries.some(matches));
  return denied
    ? `Source image rejected: image docker://${qualified} is rejected by runtime registry policy`
    : "";
}

/** Bounded admission models; failures are evaluated, never manufactured from command names. */
export function validateWorkload(pod: Resource) {
  const namespace = pod.metadata.namespace!;
  const spec = pod.spec as PodSpec;
  const limit = S.cluster.resources.find(
    (r) => r.kind === "LimitRange" && r.metadata.namespace === namespace,
  );
  const constraint = S.cluster.resources.find(
    (r) =>
      r.kind === "K8sRequiredLabels" &&
      r.spec?.match?.namespaces?.includes(namespace),
  );
  if (
    constraint &&
    constraint.spec?.parameters.labels.some(
      (l: { key: string }) => !pod.metadata.labels?.[l.key],
    )
  )
    throw new Error(
      'Error from server (Forbidden): admission constraint "' +
        constraint.metadata.name +
        '" requires owner labels',
    );
  for (const c of spec.containers) {
    const defaults = limit?.spec?.limits?.[0];
    if (defaults) {
      c.resources = {
        requests: { ...defaults.defaultRequest, ...c.resources?.requests },
        limits: { ...defaults.default, ...c.resources?.limits },
      };
      for (const dimension of ["cpu", "memory"])
        if (
          quantity(c.resources.limits?.[dimension], dimension) >
            quantity(defaults.max?.[dimension], dimension) &&
          defaults.max?.[dimension]
        )
          throw new Error(
            "Error from server (Forbidden): maximum " +
              dimension +
              " usage per Container exceeded by LimitRange",
          );
    }
  }
  const quotas = S.cluster.resources.filter(
    (r) => r.kind === "ResourceQuota" && r.metadata.namespace === namespace,
  );
  const others = [...S.cluster.resources, ...coreResources()].filter(
    (r) =>
      r.kind === "Pod" &&
      r.metadata.namespace === namespace &&
      r.metadata.name !== pod.metadata.name,
  );
  for (const quota of quotas) {
    const hard = quota.spec?.hard ?? {};
    if (hard.pods && others.length + 1 > Number(hard.pods))
      throw new Error(
        "Error from server (Forbidden): exceeded quota: " +
          quota.metadata.name +
          ", requested: pods=1",
      );
    for (const bucket of ["requests", "limits"] as const)
      for (const dimension of ["cpu", "memory"]) {
        const key = bucket + "." + dimension;
        if (!hard[key]) continue;
        const total = [...others, pod]
          .flatMap((p) => p.spec?.containers ?? [])
          .reduce(
            (sum, c) =>
              sum +
              quantity(
                c.resources?.[bucket as "requests" | "limits"]?.[dimension],
                dimension,
              ),
            0,
          );
        if (total > quantity(hard[key], dimension))
          throw new Error(
            "Error from server (Forbidden): exceeded quota: " +
              quota.metadata.name +
              ", " +
              key,
          );
      }
  }
}
export function schedulingFailure(pod: Resource) {
  const spec = pod.spec as PodSpec,
    ns = pod.metadata.namespace!;
  const runtime = runtimeFailure(pod, S.cluster.resources);
  if (runtime) return runtime.message;
  const attachment = pod.metadata.annotations?.["k8s.v1.cni.cncf.io/networks"];
  if (attachment) {
    const network = resource("NetworkAttachmentDefinition", attachment, ns);
    if (!network) return "NetworkAttachmentDefinition is absent";
    const config = JSON.parse(network.spec?.config ?? "{}");
    if (
      config.vlanId === 200 &&
      resource("Node", spec.nodeName ?? "")?.metadata.labels?.[
        "roadshow.vlan200"
      ] !== "true"
    )
      return "No recorded VLAN-200 capability on requested node";
  }
  return "";
}

/** MatchLabels, literal ports and IPv4 /24 or /0 subset used by these lab fixtures. */
export function peerMatches(
  peer: any,
  target: Resource | undefined,
  namespace: string,
  external: boolean,
) {
  if (peer.networks || peer.ipBlock) {
    const ranges = peer.networks ?? [peer.ipBlock.cidr];
    if (
      ranges.some((r: string) => !["0.0.0.0/0", "203.0.113.0/24"].includes(r))
    )
      throw new Error(
        "simulation: campaign IP peers support the documented /0 and external /24 fixtures",
      );
    return (
      ranges.includes("0.0.0.0/0") ||
      (external && ranges.includes("203.0.113.0/24"))
    );
  }
  if (external) return false;
  return (
    (!peer.namespaceSelector ||
      match(nsLabels(namespace), peer.namespaceSelector)) &&
    (!peer.podSelector || match(target?.metadata.labels, peer.podSelector)) &&
    (!peer.namespaces || match(nsLabels(namespace), peer.namespaces)) &&
    (!peer.pods || match(target?.metadata.labels, peer.pods.podSelector))
  );
}
export function tenantDirection(
  namespace: string,
  pod: Resource,
  peer: Resource | undefined,
  peerNs: string,
  port: number,
  direction: "ingress" | "egress",
  external = false,
) {
  return networkPolicyDirection(S.cluster.resources, pod, peer ?? (peerNs ? {apiVersion:"v1",kind:"Pod",metadata:{name:"recorded-peer",namespace:peerNs}} : undefined), direction, port, "TCP", external ? "203.0.113.77" : undefined);
}
export function flow(
  namespace: string,
  sourceName: string,
  destName: string,
  destNamespace = namespace,
  external = false,
  port = 8443,
) {
  const source = resource("Pod", sourceName, namespace),
    dest = resource("Pod", destName, destNamespace);
  if (!ready(source) || (!external && !ready(dest))) return false;
  if (!external && podNetworkDomain(source) !== podNetworkDomain(dest))
    return false;
  let adminAllowed = false;
  const admins = S.cluster.resources
    .filter(
      (r) =>
        r.kind === "AdminNetworkPolicy" &&
        match(nsLabels(namespace), r.spec?.subject?.namespaces),
    )
    .sort((a, b) => Number(a.spec?.priority) - Number(b.spec?.priority));
  for (const admin of admins) {
    const rule = admin.spec?.egress?.find((rule: any) =>
      rule.to?.some((peer: any) =>
        peerMatches(peer, dest, destNamespace, external),
      ),
    );
    if (!rule) continue;
    if (rule.action === "Deny") return false;
    if (rule.action === "Allow") {
      adminAllowed = true;
      break;
    }
    if (rule.action === "Pass") break;
  }
  const egress = adminAllowed
    ? true
    : tenantDirection(
        namespace,
        source!,
        dest,
        destNamespace,
        port,
        "egress",
        external,
      );
  if (egress === false) return false;
  if (egress === undefined) {
    const baseline = S.cluster.resources.find(
      (r) =>
        r.kind === "BaselineAdminNetworkPolicy" &&
        match(nsLabels(namespace), r.spec?.subject?.namespaces),
    );
    const action = baseline?.spec?.egress?.find((r: any) =>
      r.to?.some((p: any) => peerMatches(p, dest, destNamespace, external)),
    )?.action;
    if (action === "Deny") return false;
  }
  if (
    !external &&
    tenantDirection(
      destNamespace,
      dest!,
      source,
      namespace,
      port,
      "ingress",
    ) === false
  )
    return false;
  return true;
}
export function reconcileFixtureControllers() {
  reconcileExternalSecrets();
  reconcileNetworks();
  reconcileNetworkPods();
  reconcileSecretConsumers();
  reconcileServices(S.cluster.resources);
  for (const egress of S.cluster.resources.filter(
    (r) => r.kind === "EgressIP",
  )) {
    egress.status = {
      items: (egress.spec?.egressIPs ?? []).flatMap((ip: string) => {
        const node = S.cluster.resources.find(
          (r) =>
            r.kind === "Node" &&
            Object.hasOwn(
              r.metadata.labels ?? {},
              "k8s.ovn.org/egress-assignable",
            ) &&
            (
              r.metadata.annotations?.[
                "ghostroute.training/reserved-egress-addresses"
              ] ?? ""
            )
              .split(",")
              .includes(ip),
        );
        return node ? [{ node: node.metadata.name, egressIP: ip }] : [];
      }),
    };
  }
  for (const quota of S.cluster.resources.filter(
    (r) => r.kind === "ResourceQuota",
  )) {
    const hard = quota.spec?.hard ?? {};
    const pods = [...S.cluster.resources, ...coreResources()].filter(
      (r) =>
        r.kind === "Pod" &&
        r.metadata.namespace === quota.metadata.namespace &&
        !["Succeeded", "Failed"].includes(String(r.status?.phase)),
    );
    const used: Record<string, string> = {};
    for (const key of Object.keys(hard)) {
      if (key === "pods") {
        used[key] = String(pods.length);
        continue;
      }
      const match = key.match(/^(requests|limits)\.(cpu|memory)$/);
      if (!match) continue;
      const [, bucket, dimension] = match;
      const total = pods
        .flatMap((p) => p.spec?.containers ?? [])
        .reduce(
          (sum, c) =>
            sum +
            quantity(
              c.resources?.[bucket as "requests" | "limits"]?.[dimension],
              dimension,
            ),
          0,
        );
      if (dimension === "cpu")
        used[key] = Number.isInteger(total)
          ? String(total)
          : `${Math.round(total * 1000)}m`;
      else {
        const unit =
          total &&
          [
            ["Gi", 1024 ** 3],
            ["Mi", 1024 ** 2],
            ["Ki", 1024],
          ].find(([, size]) => total % Number(size) === 0);
        used[key] = unit
          ? `${total / Number(unit[1])}${unit[0]}`
          : String(total);
      }
    }
    quota.status = { hard: structuredClone(hard), used };
  }
  reconcileCompliance();
  reconcileTekton();
  reconcileGitOps();
}

export {validateWorkload as validateCampaignPod};
