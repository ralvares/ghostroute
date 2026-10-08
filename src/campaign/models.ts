import { chapters } from "./catalog.js";
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
  return [...S.cluster.resources, ...S.cluster.sccs].find(
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
function match(labels: Record<string, string> | undefined, selector: any) {
  if (!selector) return true;
  if (selector.matchExpressions)
    throw new Error(
      "simulation: this campaign models matchLabels selectors only",
    );
  return Object.entries(selector.matchLabels ?? {}).every(
    ([key, val]) => labels?.[key] === val,
  );
}
function nsLabels(namespace: string) {
  return {
    "kubernetes.io/metadata.name": namespace,
    ...resource("Namespace", namespace)?.metadata.labels,
  };
}
const ready = (pod: Resource | undefined) =>
  !!pod &&
  ((pod.status?.containerStatuses as { ready: boolean }[] | undefined)?.every(
    (c) => c.ready,
  ) ??
    false);

/** Bounded admission models; failures are evaluated, never manufactured from command names. */
export function validateCampaignPod(pod: Resource) {
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
  const registries = resource("Image", "cluster")?.spec?.registrySources
    ?.allowedRegistries as string[] | undefined;
  for (const c of spec.containers) {
    if (
      registries &&
      !registries.some((host) => c.image.startsWith(host + "/"))
    )
      throw new Error(
        "Error from server (Forbidden): image registry is not in spec.registrySources.allowedRegistries",
      );
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
  const others = S.cluster.resources.filter(
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
              sum + quantity(c.resources?.[bucket]?.[dimension], dimension),
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
  if (spec.runtimeClassName) {
    if (!resource("RuntimeClass", spec.runtimeClassName))
      return "RuntimeClass is not installed in the recorded training cluster";
    if (
      resource("Node", spec.nodeName ?? "")?.metadata.labels?.[
        "roadshow.virtualization"
      ] !== "true"
    )
      return "No recorded virtualization-capable node satisfies RuntimeClass kata";
  }
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
function peerMatches(
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
function tenantDirection(
  namespace: string,
  pod: Resource,
  peer: Resource | undefined,
  peerNs: string,
  port: number,
  direction: "ingress" | "egress",
  external = false,
) {
  const type = direction === "ingress" ? "Ingress" : "Egress";
  const policies = S.cluster.resources.filter(
    (r) =>
      r.kind === "NetworkPolicy" &&
      r.metadata.namespace === namespace &&
      match(pod.metadata.labels, r.spec?.podSelector) &&
      (
        r.spec?.policyTypes ??
        (r.spec?.egress ? ["Ingress", "Egress"] : ["Ingress"])
      ).includes(type),
  );
  if (!policies.length) return undefined;
  return policies.some((p) =>
    (p.spec?.[direction] ?? []).some(
      (rule: any) =>
        (!rule.ports ||
          rule.ports.some(
            (p: any) => (p.protocol ?? "TCP") === "TCP" && p.port === port,
          )) &&
        (!(direction === "egress" ? rule.to : rule.from) ||
          (direction === "egress" ? rule.to : rule.from).some(
            (p: any) =>
              peerMatches(p, peer, peerNs, external) &&
              (p.namespaceSelector ||
                p.namespaces ||
                p.pods ||
                p.ipBlock ||
                p.networks ||
                peerNs === namespace),
          )),
    ),
  );
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
  if (!external && destNamespace !== namespace) {
    const a = resource("UserDefinedNetwork", "primary", namespace),
      b = resource("UserDefinedNetwork", "primary", destNamespace);
    if (a || b) return false;
  }
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
  for (const external of S.cluster.resources.filter(
    (r) => r.kind === "ExternalSecret",
  )) {
    const ns = external.metadata.namespace!,
      store = resource("SecretStore", external.spec?.secretStoreRef?.name, ns);
    const provider = resource("ConfigMap", "provider-record", ns);
    const valid =
      !!store &&
      provider?.data?.version === "2" &&
      external.spec?.data?.length === 1 &&
      external.spec?.data?.[0]?.remoteRef?.key === "database";
    external.status = {
      conditions: [
        {
          type: "Ready",
          status: valid ? "True" : "False",
          reason: valid
            ? "RecordedProviderSynced"
            : "RecordedProviderUnavailable",
        },
      ],
      syncedResourceVersion: valid ? "2" : "",
    };
    if (valid) {
      const name = external.spec?.target?.name ?? external.metadata.name;
      let secret = resource("Secret", name, ns);
      if (!secret) {
        secret = {
          apiVersion: "v1",
          kind: "Secret",
          metadata: { name, namespace: ns },
        };
        S.cluster.resources.push(secret);
      }
      secret.stringData = { password: provider!.data!.value };
      secret.metadata.annotations = { "roadshow.provider-version": "2" };
    }
  }
  for (const scan of S.cluster.resources.filter(
    (r) => r.kind === "ComplianceScan",
  )) {
    const ns = scan.metadata.namespace!,
      profile = resource("TailoredProfile", scan.spec?.profile, ns),
      fix = resource("ComplianceRemediation", "audit-enabled", ns);
    const hidden = profile?.disableRules?.some(
      (r: any) => r.name === "audit-enabled",
    );
    scan.status = {
      phase: "DONE",
      result: fix?.spec?.apply && !hidden ? "COMPLIANT" : "NON-COMPLIANT",
      source: "recorded-fixture",
      excludedRules: profile?.disableRules ?? [],
    };
  }
  for (const run of S.cluster.resources.filter(
    (r) => r.kind === "PipelineRun",
  )) {
    const ns = run.metadata.namespace!,
      pipe = resource("Pipeline", run.spec?.pipelineRef?.name, ns),
      att = resource("ConfigMap", "attestation", ns);
    const digest = run.spec?.params?.find(
      (p: any) => p.name === "digest",
    )?.value;
    const valid =
      pipe?.spec?.tasks?.[2]?.runAfter?.includes("scan") &&
      pipe.spec.tasks[2].when?.[0]?.values?.includes("0") &&
      att?.data?.scanHigh === "0" &&
      att.data.digest === digest &&
      att.data.signed === "true";
    run.status = {
      conditions: [
        {
          type: "Succeeded",
          status: valid ? "True" : "False",
          reason: valid ? "RecordedGatePassed" : "RecordedGateFailed",
        },
      ],
      source: "recorded-fixture",
      signed: !!valid,
    };
  }
}
export function evaluateProbe(
  model: string,
  namespace: string,
): { passed: boolean; detail: string } {
  const get = (kind: string, name: string) => resource(kind, name, namespace);
  const data = (name: string) => get("ConfigMap", name)?.data ?? {};
  const app = get("Pod", "app");
  let passed: unknown = false,
    detail = "";
  switch (model) {
    case "owned-ready":
      passed =
        ready(app) &&
        app?.metadata.annotations?.["openshift.io/scc"] === "restricted-v3";
      detail = "Ready Pod with restricted SCC, no privilege grant required.";
      break;
    case "root-rejected": {
      const test: PodSpec = {
        containers: [
          {
            name: "unsafe",
            image: "registry.example.test/owned:arbitrary-uid",
            securityContext: { runAsUser: 0 },
          },
        ],
      };
      passed = !admitPod(
        test,
        S.cluster.sccs,
        new Set(["restricted-v3", "restricted-v2"]),
        [1000780000, 1000789999],
      ).accepted;
      detail = "Restricted admission evaluated the UID-0 negative request.";
      break;
    }
    case "runtime-distinction": {
      const failed = get("Pod", "broken") ?? S.campaign.diagnostics[namespace];
      passed =
        !!failed &&
        failed.metadata.annotations?.["openshift.io/scc"] === "restricted-v3" &&
        !ready(failed);
      detail = get("Pod", "broken")
        ? "Admitted Pod has a runtime failure; retain this diagnosis, then remove the failed Pod."
        : "Retained runtime diagnosis explains the failure; the failed Pod has been removed.";
      break;
    }
    case "reader-allowed":
      passed = roleAllows("case-reader", "get", "configmaps", namespace);
      detail = "RBAC evaluated get ConfigMaps for case-reader.";
      break;
    case "reader-secret-denied":
      passed =
        !roleAllows("case-reader", "get", "secrets", namespace) &&
        !roleAllows("case-reader", "patch", "configmaps", namespace);
      detail = "Secret reads and mutations remain outside the subject's grant.";
      break;
    case "vendor-ready":
      passed =
        ready(get("Pod", "vendor-sim-0")) &&
        get("Pod", "vendor-sim-0")?.spec?.containers?.[0]?.securityContext
          ?.runAsUser === 1001;
      detail = "Vendor controller replica is Ready at its required UID.";
      break;
    case "vendor-isolated":
      passed =
        roleAllows(
          "system:serviceaccount:" + namespace + ":vendor",
          "use",
          "securitycontextconstraints",
          namespace,
          "rs-vendor",
        ) &&
        !roleAllows(
          "system:serviceaccount:" + namespace + ":default",
          "use",
          "securitycontextconstraints",
          namespace,
          "rs-vendor",
        ) &&
        data("exception").owner &&
        data("exception").expires &&
        data("exception").scope === "vendor-only";
      detail = "Dedicated grant and accountable exception record checked.";
      break;
    case "budget-fit":
      passed = ready(app) && !!app?.spec?.containers?.[0]?.resources?.requests;
      detail = "Accepted workload has defaulted resources.";
      break;
    case "budget-denied": {
      const sample: Resource = {
        apiVersion: "v1",
        kind: "Pod",
        metadata: { name: "oversized", namespace },
        spec: {
          containers: [
            {
              name: "oversized",
              image: "registry.example.test/owned:arbitrary-uid",
              resources: {
                requests: { cpu: "900m" },
                limits: { cpu: "1", memory: "1Gi" },
              },
            },
          ],
        },
      };
      try {
        validateCampaignPod(sample);
      } catch (error) {
        passed = (error as Error).message.includes("Forbidden");
      }
      detail =
        "Oversized negative request was evaluated against live quotas and limits.";
      break;
    }
    case "secret-current":
      passed =
        ready(app) &&
        get("Secret", "database")?.stringData?.password === "training-v2" &&
        app?.metadata.annotations?.["roadshow.secret-version"] ===
          "training-v2";
      detail =
        "Consumer startup snapshot compared with current synthetic Secret.";
      break;
    case "secret-retired":
      passed =
        get("Secret", "database")?.stringData?.password === "training-v2" &&
        !app?.spec?.containers?.some((c) => c.env?.some((e) => !!e.value));
      detail =
        "Old credential is absent and the consumer has no literal password.";
      break;
    case "tls-working":
      passed =
        ready(app) &&
        !!get("Service", "app") &&
        get("Route", "front-door")?.spec?.tls?.termination === "edge";
      detail =
        "Recorded client-to-router TLS termination and selected backend checked.";
      break;
    case "http-redirect":
      passed =
        get("Route", "front-door")?.spec?.tls?.insecureEdgeTerminationPolicy ===
        "Redirect";
      detail = "HTTP redirect configured; router-to-Pod TLS is not asserted.";
      break;
    case "provenance":
      passed =
        ready(app) &&
        app?.spec?.containers?.[0]?.image?.endsWith(
          "@" + data("attestation").digest,
        ) &&
        data("attestation").signed === "true";
      detail =
        "Pinned artifact matches the recorded training catalog, not a live signature service.";
      break;
    case "registry-denied":
      try {
        validateCampaignPod({
          apiVersion: "v1",
          kind: "Pod",
          metadata: { name: "untrusted", namespace },
          spec: {
            containers: [
              { name: "bad", image: "untrusted.example.test/app:latest" },
            ],
          },
        });
      } catch (error) {
        passed = (error as Error).message.includes("allowedRegistries");
      }
      detail =
        "Unapproved registry negative request evaluated against live Image configuration.";
      break;
    case "timeline":
      passed =
        data("timeline-report").caller === "support-agent" &&
        data("timeline-report").window === "02:13:40-02:14:02";
      detail = "Reported caller and window match retained timeline.";
      break;
    case "attribution":
      passed =
        data("timeline-report").attribution === "credential-only" &&
        data("timeline-report").denied === "portforward";
      detail = "Denied action and attribution limits preserved.";
      break;
    case "threat-coverage":
      passed =
        data("threat-model").assets?.split(",").length >= 3 &&
        data("threat-model").threats?.split(",").length >= 3 &&
        data("threat-model").controls?.includes("RBAC") &&
        data("threat-model").owner === "platform+application";
      detail =
        "Threat-model record covers assets, threats, controls and owners.";
      break;
    case "threat-priority":
      passed = data("threat-model").priority === "credential-then-egress";
      detail =
        "Backlog prioritization is grounded in the retained credential and flow evidence.";
      break;
    case "layer-coverage":
      passed =
        data("layer-map").rhacs === "build-deploy-runtime" &&
        data("layer-map").compliance === "configuration-posture" &&
        data("layer-map").spo === "security-profile-lifecycle";
      detail = "Three distinct operator responsibilities reviewed.";
      break;
    case "layer-boundary":
      passed = data("layer-map").native === "RBAC-SCC-network";
      detail = "Tool coverage does not erase native enforcement.";
      break;
    case "client-flow":
      passed = flow(namespace, "client", "server");
      detail =
        "TCP/8443 evaluated through both ingress and egress policy decisions.";
      break;
    case "peer-blocked":
      passed = !flow(namespace, "stranger", "server");
      detail = "Unrelated peer evaluated against the same policy union.";
      break;
    case "admin-deny":
      passed = !flow(namespace, "client", "external", namespace, true);
      detail =
        "External documentation range remains denied above developer allowances.";
      break;
    case "egress-selected": {
      const e = resource("EgressIP", "rs-egress");
      passed =
        e?.spec?.egressIPs?.[0] === "192.0.2.25" &&
        match(nsLabels(namespace), e?.spec?.namespaceSelector);
      detail =
        "Selected namespace maps to the recorded reserved egress address.";
      break;
    }
    case "egress-control": {
      const e = resource("EgressIP", "rs-egress");
      passed = !!e && !match(nsLabels("default"), e?.spec?.namespaceSelector);
      detail =
        "Control namespace is not selected; no claim about actual packets.";
      break;
    }
    case "udn-local":
      passed =
        !!get("UserDefinedNetwork", "primary") &&
        flow(namespace, "client", "server");
      detail = "Recorded local domain permits intended service.";
      break;
    case "udn-cross":
      passed =
        !!get("UserDefinedNetwork", "primary") &&
        !flow(namespace, "client", "peer", namespace + "-peer");
      detail = "Separate primary domains prevent the cross-tenant path.";
      break;
    case "vlan-good":
      passed =
        ready(app) &&
        !schedulingFailure(app!) &&
        !!get("NetworkAttachmentDefinition", "vlan200");
      detail =
        "Recorded attachment and capable node satisfy the requested placement.";
      break;
    case "vlan-wrong":
      passed =
        !!app &&
        !!schedulingFailure({
          ...structuredClone(app),
          spec: { ...app.spec, nodeName: "worker-01" },
        });
      detail =
        "Wrong-node negative request fails the recorded capability requirement.";
      break;
    case "release-scoped": {
      const bot = "system:serviceaccount:payments:build-bot";
      passed =
        roleAllows(bot, "get", "deployments", "payments", "payment-api") &&
        !roleAllows(bot, "patch", "deployments", "payments", "payment-api") &&
        !roleAllows(bot, "get", "deployments", "payments", "other") &&
        !roleAllows(bot, "get", "secrets", "payments");
      detail =
        "Original delivery identity retains only payment-api inspection; patching and unrelated reads are denied.";
      break;
    }
    case "pipeline-clean":
      passed =
        get("PipelineRun", "release")?.status?.signed === true &&
        data("promotion-review").supportEnvImport === "disabled" &&
        data("promotion-review").configurationSource === "versioned-reviewed" &&
        data("promotion-review").owner === "Kai and Mira";
      detail =
        "Recorded clean artifact passes scan-before-sign and digest binding; the original unreviewed support import is disabled.";
      break;
    case "pipeline-high": {
      const pipe = get("Pipeline", "secure-release");
      passed =
        !!pipe &&
        pipe.spec?.tasks?.[2]?.runAfter?.includes("scan") &&
        pipe.spec.tasks[2].when?.[0]?.values?.length === 1 &&
        pipe.spec.tasks[2].when[0].values[0] === "0";
      detail =
        "Recorded high-count 1 does not satisfy the zero-high signing gate.";
      break;
    }
    case "csi-project":
      passed =
        ready(app) &&
        get(
          "SecretProviderClass",
          "database",
        )?.spec?.parameters?.objects?.includes("secret/data/database") &&
        data("provider-record").version === "2" &&
        data("provider-record").auth === "namespace-serviceaccount";
      detail =
        "Synthetic provider path, authentication record and mounted projection checked.";
      break;
    case "csi-nosync":
      passed =
        !!get("SecretProviderClass", "database") &&
        !get("SecretProviderClass", "database")?.spec?.secretObjects &&
        !get("Secret", "database");
      detail =
        "CSI-only mapping has no sync request or Kubernetes Secret copy.";
      break;
    case "eso-sync":
      passed =
        get("ExternalSecret", "database")?.status?.syncedResourceVersion ===
          "2" &&
        get("Secret", "database")?.metadata.annotations?.[
          "roadshow.provider-version"
        ] === "2" &&
        get("Secret", "database")?.stringData?.password === "training-v2";
      detail = "Local fixture reconciliation synchronized provider version 2.";
      break;
    case "eso-scoped":
      passed =
        get("ExternalSecret", "database")?.spec?.data?.length === 1 &&
        get("ExternalSecret", "database")?.spec?.data?.[0]?.remoteRef?.key ===
          "database";
      detail = "Only the declared key is copied.";
      break;
    case "correlation":
      passed =
        data("correlation").namespace === "payments" &&
        data("correlation").pod === "payment-api-7d9cd-ab12" &&
        data("correlation").window === "02:13:55" &&
        data("correlation").caller === "support-agent";
      detail = "Join keys match the retained API and runtime window.";
      break;
    case "correlation-scope":
      passed =
        data("correlation").exposure === "unconfirmed" &&
        data("correlation").pod !== "unrelated";
      detail = "No unsupported data-exposure claim or unrelated Pod join.";
      break;
    case "alert-spike":
      passed =
        get("PrometheusRule", "sustained-spike")?.spec?.groups?.[0]?.rules?.[0]
          ?.expr === "rate(container_cpu_usage_seconds_total[5m]) > 0.5";
      detail =
        "Recorded sustained 0.8-0.9 CPU exceeds the configured 0.5 threshold.";
      break;
    case "alert-normal":
      passed =
        get("PrometheusRule", "sustained-spike")?.spec?.groups?.[0]?.rules?.[0]
          ?.for === "5m";
      detail =
        "Normal and single-sample spike fixtures do not sustain five minutes.";
      break;
    case "compliance-effective":
      passed =
        get("ComplianceScan", "district")?.status?.result === "COMPLIANT" &&
        !get("TailoredProfile", "district")?.disableRules?.some(
          (r: any) => r.name === "audit-enabled",
        );
      detail =
        "Recorded applicable audit control is remediated rather than excluded.";
      break;
    case "compliance-exception":
      passed =
        get("TailoredProfile", "district")?.disableRules?.length === 1 &&
        !!get("TailoredProfile", "district")?.disableRules?.[0]?.rationale;
      detail = "Narrow USB exception remains explicit with a rationale.";
      break;
    case "kata-ready":
      passed =
        ready(app) &&
        app?.spec?.runtimeClassName === "kata" &&
        !schedulingFailure(app!);
      detail =
        "RuntimeClass and recorded capable node checked; no VM was started.";
      break;
    case "seccomp-normal":
      passed =
        ready(app) &&
        app?.spec?.containers?.[0]?.securityContext?.seccompProfile
          ?.localhostProfile === "rs-app.json" &&
        ["read", "write", "openat", "close", "exit_group"].every((name) =>
          get("SeccompProfile", "app")?.spec?.syscalls?.some(
            (s: any) => s.action === "SCMP_ACT_ALLOW" && s.names.includes(name),
          ),
        );
      detail =
        "Consumer selects the recorded profile; its normal syscall trace fits the allow set.";
      break;
    case "seccomp-denied":
      passed =
        get("SeccompProfile", "app")?.spec?.defaultAction ===
          "SCMP_ACT_ERRNO" &&
        !get("SeccompProfile", "app")?.spec?.syscalls?.some(
          (s: any) =>
            s.action === "SCMP_ACT_ALLOW" && s.names.includes("unshare"),
        );
      detail = "Recorded unshare is outside the allow set.";
      break;
    case "label-denied":
      try {
        validateCampaignPod({
          apiVersion: "v1",
          kind: "Pod",
          metadata: { name: "ownerless", namespace },
          spec: {
            containers: [
              {
                name: "bad",
                image: "registry.example.test/owned:arbitrary-uid",
              },
            ],
          },
        });
      } catch (error) {
        passed = (error as Error).message.includes("requires owner");
      }
      detail =
        "Ownerless negative Pod evaluated against the scoped constraint.";
      break;
    case "handover":
      passed =
        data("handover").owner === "Mira" &&
        data("handover").evidence === "retained-and-verified" &&
        data("handover").claim === "bounded-simulation";
      detail = "Handover keeps ownership and the actual evidence boundary.";
      break;
    case "campaign-history": {
      const missing = chapters
        .slice(1, -1)
        .flatMap((ch) => [
          ...ch.goals
            .filter(
              (g) =>
                JSON.stringify(
                  valueAt(
                    resource(g.kind, g.name, g.namespace ?? ch.namespace),
                    g.path,
                  ),
                ) !== JSON.stringify(g.value),
            )
            .map((g) => "Chapter " + ch.id + " · " + g.label),
          ...ch.probes
            .filter((p) => !evaluateProbe(p.model, ch.namespace).passed)
            .map((p) => "Chapter " + ch.id + " · " + p.label),
        ]);
      const initial =
        !S.env &&
        S.policy === "allow" &&
        projectHealth(S).checkout === "HEALTHY" &&
        S.incident.explained;
      passed =
        initial &&
        !missing.length &&
        S.campaign.completed.length === S.campaign.active &&
        S.campaign.completed.every((n, i) => n === i);
      detail =
        (initial
          ? "Original payment cause and containment remain verified."
          : "Original payment cause/containment requires review.") +
        "\n" +
        (missing.length
          ? "Controls to repair:\n" + missing.join("\n")
          : "Every earlier chapter’s resource goals and fixture probes still hold in prod-east.");
      break;
    }
    default:
      throw new Error("simulation: unknown campaign probe " + model);
  }
  return { passed: !!passed, detail };
}
