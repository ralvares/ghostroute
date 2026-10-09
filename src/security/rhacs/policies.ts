import { S } from "../../simulation/state.js";
import type {
  Resource,
  PodSpec,
  ContainerSpec,
} from "../../simulation/cluster-model.js";
import { defaultPolicies } from "./default-policies.js";
import { getImage } from "./images.js";
import type {
  ImageAsset,
  Policy,
  PolicyResult,
  Vulnerability,
} from "./types.js";
import { cveSeverities } from "./scan.js";
const policySeverities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
export const releasePolicy: Policy = {
  id: "training-release-hardening",
  name: "Release workload hardening",
  description:
    "Release workloads must disable privilege escalation and use a read-only root filesystem.",
  remediation:
    "Set allowPrivilegeEscalation: false and readOnlyRootFilesystem: true in the container securityContext.",
  categories: ["Deployment Security"],
  severity: "HIGH_SEVERITY",
  lifecycleStages: ["DEPLOY"],
  enforcementActions: [
    "SCALE_TO_ZERO_ENFORCEMENT",
    "FAIL_DEPLOYMENT_CREATE_ENFORCEMENT",
  ],
  policySections: [
    {
      policyGroups: [
        {
          fieldName: "Read-Only Root Filesystem",
          values: [{ value: "false" }],
        },
      ],
    },
    {
      policyGroups: [
        {
          fieldName: "Allow Privilege Escalation",
          values: [{ value: "true" }],
        },
      ],
    },
  ],
};
export function centralPolicies(): Policy[] {
  const base = defaultPolicies.map((p) => ({
    ...p,
    ...S.cluster.rhacs.policyOverrides[p.id],
  }));
  const custom = [...S.cluster.rhacs.customPolicies];
  if (S.campaign.active >= 17 && !custom.some((p) => p.id === releasePolicy.id))
    custom.push(releasePolicy);
  return [...base, ...custom];
}
const regex = (pattern: string, value: string) =>
  new RegExp(pattern.replace(/^r\//, "")).test(value);
function compare(value: string | number, query: string) {
  const m = query.match(
    /^(>=|<=|>|<|=)?\s*(\d+(?:\.\d+)?|LOW|MODERATE|IMPORTANT|CRITICAL)$/,
  );
  if (!m) return regex(query, String(value));
  const numeric = /^\d/.test(m[2]);
  const a = numeric ? Number(value) : cveSeverities.indexOf(String(value));
  const b = numeric ? Number(m[2]) : cveSeverities.indexOf(m[2]);
  switch (m[1]) {
    case ">=":
      return a >= b;
    case "<=":
      return a <= b;
    case ">":
      return a > b;
    case "<":
      return a < b;
    default:
      return a === b;
  }
}
function quantity(q: string | undefined) {
  if (!q) return 0;
  const match = q.match(/^([\d.]+)(.*)$/);
  if (!match) return NaN;
  return (
    Number(match[1]) *
    ({
      m: 0.001,
      Ki: 1024,
      Mi: 1024 ** 2,
      Gi: 1024 ** 3,
      k: 1000,
      M: 1000 ** 2,
      G: 1000 ** 3,
    }[match[2]] ?? 1)
  );
}
interface Context {
  image: ImageAsset;
  workload?: Resource;
  pod?: PodSpec;
  container?: ContainerSpec;
  vuln?: Vulnerability;
  component?: { name: string; version: string };
}
function field(ctx: Context, name: string, query: string): boolean {
  const { image, pod, container: c, workload: w, vuln: v } = ctx;
  const sc = c?.securityContext ?? {};
  const bool = (v: boolean) => String(v) === query;
  const labels =
    w?.spec?.template?.metadata?.labels ?? w?.metadata.labels ?? {};
  const annotations =
    w?.spec?.template?.metadata?.annotations ?? w?.metadata.annotations ?? {};
  const pair = (
    q: string,
    values: Record<string, string>,
    required = false,
  ) => {
    const eq = q.indexOf("=");
    const key = eq < 0 ? q : q.slice(0, eq),
      value = eq < 0 ? "" : q.slice(eq + 1);
    const matches = Object.entries(values).some(
      ([k, v]) => regex(key, k) && (!value || regex(value, v)),
    );
    return required ? !matches : matches;
  };
  switch (name) {
    case "CVE":
      return !!v && regex(query, v.cve);
    case "Severity":
      return !!v && compare(v.severity, query);
    case "CVSS":
      return !!v && compare(v.cvss, query);
    case "Fixed By":
      return !!v && !!v.fixedBy && regex(query, v.fixedBy);
    case "Image Component": {
      const [k, q] = query.split("=");
      return (
        !!ctx.component &&
        regex(k, ctx.component.name) &&
        (!q || regex(q, ctx.component.version))
      );
    }
    case "Image Tag":
      return regex(
        query,
        image.ref.includes("@")
          ? ""
          : (image.ref.split(":").at(-1) ?? "latest"),
      );
    case "Image Registry":
      return regex(query, image.ref.split("/")[0]);
    case "Image Remote":
      return regex(
        query,
        image.ref.split("/").slice(1).join("/").split(":")[0],
      );
    case "Image User":
      return image.user === query;
    case "Image Age":
      return (
        (Date.parse("2026-10-08T12:00:00Z") - Date.parse(image.created)) /
          86400000 >
        Number(query)
      );
    case "Image Scan Age":
      return (
        (Date.parse("2026-10-08T12:00:00Z") - Date.parse(image.scanned)) /
          86400000 >
        Number(query)
      );
    case "Unscanned Image":
      return bool(!image.scanned);
    case "Required Image Label":
      return pair(query, image.labels, true);
    case "Image Signature Verified By":
      return false; // No authored signatures. Enabling a verification criterion must produce a violation via negate.
    case "Dockerfile Line": {
      const eq = query.indexOf("=");
      return image.dockerfile.some(
        (d) =>
          regex(query.slice(0, eq), d.instruction) &&
          regex(query.slice(eq + 1), d.value),
      );
    }
    case "Privileged Container":
      return bool(sc.privileged === true);
    case "Allow Privilege Escalation":
      return bool(
        sc.privileged === true || (sc.allowPrivilegeEscalation ?? true),
      );
    case "Read-Only Root Filesystem":
      return bool(sc.readOnlyRootFilesystem ?? false);
    case "Host PID":
      return bool(pod?.hostPID ?? false);
    case "Host IPC":
      return bool(pod?.hostIPC ?? false);
    case "Host Network":
      return bool(pod?.hostNetwork ?? false);
    case "Automount Service Account Token":
      return bool((pod as any)?.automountServiceAccountToken ?? true);
    case "Service Account":
      return (pod?.serviceAccountName ?? "default") === query;
    case "Namespace":
      return (w?.metadata.namespace ?? "default") === query;
    case "Container CPU Request":
      return compare(quantity(c?.resources?.requests?.cpu), query);
    case "Container Memory Limit":
      return compare(quantity(c?.resources?.limits?.memory), query);
    case "Add Capabilities":
      return (sc.capabilities?.add ?? []).some((v) => regex(query, v));
    case "Drop Capabilities":
      return (sc.capabilities?.drop ?? []).some((v) => regex(query, v));
    case "Seccomp Profile Type":
      return regex(
        query,
        sc.seccompProfile?.type ??
          pod?.securityContext?.seccompProfile?.type ??
          "Unconfined",
      );
    case "AppArmor Profile":
      return regex(
        query,
        (sc as any).appArmorProfile?.type ??
          annotations[
            `container.apparmor.security.beta.kubernetes.io/${c?.name}`
          ] ??
          "runtime/default",
      );
    case "Required Label":
      return pair(query, labels, true);
    case "Required Annotation":
      return pair(query, annotations, true);
    case "Disallowed Annotation":
      return pair(query, annotations);
    case "Volume Source":
      return (pod?.volumes ?? []).some((volume: any) =>
        regex(query, volume.hostPath?.path ?? ""),
      );
    case "Mount Propagation":
      return (c?.volumeMounts ?? []).some((m: any) =>
        regex(query, (m.mountPropagation ?? "None").toUpperCase()),
      );
    case "Exposed Port":
      return ((c as any)?.ports ?? []).some((p: any) =>
        compare(p.containerPort, query),
      );
    case "Exposed Port Protocol":
      return ((c as any)?.ports ?? []).some((p: any) =>
        regex(query, (p.protocol ?? "TCP").toLowerCase()),
      );
    case "Exposed Node Port":
      return ((c as any)?.ports ?? []).some((p: any) =>
        compare(p.hostPort ?? 0, query),
      );
    case "Environment Variable": {
      const parts = query.split("=");
      return (c?.env ?? []).some(
        (e) =>
          !e.valueFrom &&
          regex(parts[1] ?? ".*", e.name) &&
          (!parts[2] || regex(parts[2], e.value ?? "")),
      );
    }
    case "Has Ingress Network Policy":
    case "Has Egress Network Policy":
    case "Port Exposure Method":
      throw new Error(
        `simulation: Central policy criterion ${name} requires an exposure assessment not authored for these manifests`,
      );
    default:
      throw new Error(
        `simulation: Central policy criterion ${name} is not implemented`,
      );
  }
}
function matches(policy: Policy, ctx: Context): boolean {
  if (
    policy.scope?.length &&
    !policy.scope.some(
      (s) =>
        (!s.namespace || s.namespace === ctx.workload?.metadata.namespace) &&
        (!s.cluster || s.cluster === "training-cluster"),
    )
  )
    return false;
  if (
    ctx.workload &&
    policy.exclusions?.some(
      (e: any) =>
        e.deployment &&
        (!e.deployment.name ||
          regex(e.deployment.name, ctx.workload!.metadata.name)) &&
        (!e.deployment.scope?.namespace ||
          e.deployment.scope.namespace === ctx.workload!.metadata.namespace),
    )
  )
    return false;
  return (policy.policySections ?? []).some((section) =>
    section.policyGroups.every((group) => {
      const values = group.values.map((q) =>
        field(ctx, group.fieldName, q.value),
      );
      const match =
        group.booleanOperator === "AND"
          ? values.every(Boolean)
          : values.some(Boolean);
      return group.negate ? !match : match;
    }),
  );
}
const emptySummary = () =>
  ({ CRITICAL: 0, HIGH: 0, LOW: 0, MEDIUM: 0, TOTAL: 0 }) as Record<
    string,
    number
  >;
export function checkPolicies(
  images: ImageAsset[],
  stage: "BUILD" | "DEPLOY",
  workload?: Resource,
  categories: string[] = [],
  policies = centralPolicies(),
): PolicyResult {
  const pod = (workload?.spec?.template?.spec ?? workload?.spec) as
    PodSpec | undefined;
  const summary = emptySummary();
  const violated = [];
  for (const policy of policies.filter(
    (p) =>
      !p.disabled &&
      p.lifecycleStages.includes(stage) &&
      (!categories.length || p.categories?.some((c) => categories.includes(c))),
  )) {
    const contexts = images.flatMap<Context>((image, i) => {
      const common = { image, workload, pod, container: pod?.containers?.[i] };
      return image.components.length
        ? image.components.flatMap((component) =>
            component.vulns.some((v) => !v.snoozed)
              ? component.vulns
                  .filter((v) => !v.snoozed)
                  .map((vuln) => ({ ...common, component, vuln }))
              : [{ ...common, component }],
          )
        : [common];
    });
    const hit = contexts.filter((ctx) => matches(policy, ctx));
    if (!hit.length) continue;
    const severity = policy.severity.replace("_SEVERITY", "");
    const actions =
      stage === "BUILD"
        ? ["FAIL_BUILD_ENFORCEMENT"]
        : ["SCALE_TO_ZERO_ENFORCEMENT"];
    const violation = [
      ...new Set(
        hit.map((h) =>
          h.vuln &&
          policy.policySections?.some((s) =>
            s.policyGroups.some((g) =>
              ["CVE", "Severity", "CVSS", "Fixed By"].includes(g.fieldName),
            ),
          )
            ? `${h.component!.name} version ${h.component!.version} contains ${h.vuln.cve} (${h.vuln.severity}), fixed in ${h.vuln.fixedBy || "no known version"}`
            : `${h.container?.name ?? h.image.ref}: ${policy.name}`,
        ),
      ),
    ];
    violated.push({
      name: policy.name,
      severity,
      description: policy.description ?? "",
      violation,
      remediation: policy.remediation ?? "",
      failingCheck: !!policy.enforcementActions?.some((a) =>
        actions.includes(a),
      ),
    });
    summary[severity]++;
    summary.TOTAL++;
  }
  violated.sort(
    (a, b) =>
      policySeverities.indexOf(b.severity) -
        policySeverities.indexOf(a.severity) || a.name.localeCompare(b.name),
  );
  return {
    ...(violated.length
      ? {
          results: [
            {
              metadata: workload
                ? {
                    id: workload.metadata.uid ?? "",
                    additionalInfo: {
                      name: workload.metadata.name,
                      namespace: workload.metadata.namespace ?? "default",
                      type: workload.kind,
                    },
                  }
                : { id: "unknown", additionalInfo: null },
              summary: { ...summary },
              violatedPolicies: violated,
            },
          ],
        }
      : {}),
    summary,
  };
}
export function checkDeployment(workload: Resource, categories: string[] = []) {
  if (
    ![
      "Pod",
      "Deployment",
      "DeploymentConfig",
      "DaemonSet",
      "StatefulSet",
      "ReplicaSet",
      "Job",
      "CronJob",
    ].includes(workload.kind)
  )
    throw new Error(
      `simulation: deployment check does not support ${workload.kind}`,
    );
  const copy = structuredClone(workload);
  if (copy.kind === "CronJob") copy.spec = copy.spec?.jobTemplate?.spec;
  const pod = copy.spec?.template?.spec ?? copy.spec;
  const containers = pod?.containers;
  if (!containers?.length)
    throw new Error(`deployment ${copy.metadata.name}: missing containers`);
  return checkPolicies(
    containers.map((c) => getImage(c.image)),
    "DEPLOY",
    copy,
    categories,
  );
}
export function failingPolicies(report: PolicyResult) {
  return (
    report.results
      ?.flatMap((r) => r.violatedPolicies)
      .filter((p) => p.failingCheck).length ?? 0
  );
}
export function combinePolicies(reports: PolicyResult[]): PolicyResult {
  const results = reports
    .flatMap((r) => r.results ?? [])
    .sort(
      (a, b) =>
        (a.metadata.additionalInfo?.type ?? "").localeCompare(
          b.metadata.additionalInfo?.type ?? "",
        ) ||
        (a.metadata.additionalInfo?.name ?? "").localeCompare(
          b.metadata.additionalInfo?.name ?? "",
        ),
    );
  const summary = emptySummary();
  for (const r of reports)
    for (const [k, v] of Object.entries(r.summary)) summary[k] += v;
  return { ...(results.length ? { results } : {}), summary };
}
export function pipelineGate(ref: string) {
  const image = getImage(ref);
  const scan = scanImageForGate(image);
  const policy = checkPolicies([image], "BUILD");
  return {
    image,
    digest: image.digest,
    scan,
    policy,
    exitCode: failingPolicies(policy) ? 1 : 0,
  };
}
import { scanImage as scanImageForGate } from "./scan.js";
