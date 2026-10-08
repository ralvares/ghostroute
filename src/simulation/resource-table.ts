import type { Resource } from "./cluster-model.js";

/** Kubernetes metav1.Table is the server/client boundary, including hidden wide columns. */
export interface TableColumn {
  name: string;
  type: string;
  format?: string;
  priority?: number;
  description: string;
}
export interface ResourceTable {
  apiVersion: "meta.k8s.io/v1";
  kind: "Table";
  metadata: {
    resourceVersion?: string;
    continue?: string;
    remainingItemCount?: number;
  };
  columnDefinitions: TableColumn[];
  rows: { cells: unknown[]; object: Resource }[];
}
export interface PrinterColumn {
  name: string;
  type: string;
  jsonPath: string;
  priority?: number;
  format?: string;
  description?: string;
}
export const simulationEpoch = Date.UTC(2026, 9, 8, 2, 14);
export function humanDuration(milliseconds: number): string {
  const seconds = Math.trunc(milliseconds / 1000);
  if (seconds < -1) return "<invalid>";
  if (seconds < 0) return "0s";
  if (seconds < 120) return `${seconds}s`;
  const minutes = Math.trunc(milliseconds / 60000);
  if (minutes < 10)
    return `${minutes}m${seconds % 60 ? `${seconds % 60}s` : ""}`;
  if (minutes < 180) return `${minutes}m`;
  const hours = Math.trunc(milliseconds / 3600000);
  if (hours < 8) return `${hours}h${minutes % 60 ? `${minutes % 60}m` : ""}`;
  if (hours < 48) return `${hours}h`;
  const days = Math.trunc(hours / 24);
  if (hours < 192) return `${days}d${hours % 24 ? `${hours % 24}h` : ""}`;
  if (hours < 24 * 365 * 2) return `${days}d`;
  const years = Math.trunc(days / 365);
  if (hours < 24 * 365 * 8)
    return `${years}y${days % 365 ? `${days % 365}d` : ""}`;
  return `${years}y`;
}
export function age(timestamp: unknown, now: number): string {
  if (!timestamp || typeof timestamp !== "string") return "<unknown>";
  const time = Date.parse(timestamp);
  return Number.isFinite(time) ? humanDuration(now - time) : "<unknown>";
}
const columns = (names: string[], wide: string[] = []): TableColumn[] =>
  [...names, ...wide].map((name, index) => ({
    name,
    type: "string",
    ...(name === "Name" ? { format: "name" } : {}),
    ...(index >= names.length ? { priority: 1 } : {}),
    description: "",
  }));
export const formatLabels = (labels?: Record<string, string>) =>
  Object.keys(labels ?? {})
    .sort()
    .map((key) => `${key}=${labels![key]}`)
    .join(",") || "<none>";
export function formatSelector(selector: any, empty = "<none>"): string {
  if (!selector) return empty;
  const terms = Object.entries(selector.matchLabels ?? {}).map(
    ([key, value]) => `${key}=${value}`,
  );
  for (const expression of selector.matchExpressions ?? []) {
    const values = [...(expression.values ?? [])].sort().join(",");
    switch (expression.operator) {
      case "In":
        terms.push(`${expression.key} in (${values})`);
        break;
      case "NotIn":
        terms.push(`${expression.key} notin (${values})`);
        break;
      case "Exists":
        terms.push(expression.key);
        break;
      case "DoesNotExist":
        terms.push(`!${expression.key}`);
        break;
      default:
        return "<invalid>";
    }
  }
  return terms.sort().join(",") || empty;
}
function podCells(pod: Resource, now: number): unknown[] {
  const spec = pod.spec ?? {},
    status: any = pod.status ?? {};
  const conditions: any[] = status.conditions ?? [];
  const init: any[] = spec.initContainers ?? [];
  const statuses: any[] = status.containerStatuses ?? [];
  let total = spec.containers?.length ?? 0,
    ready = 0,
    restarts = 0,
    sidecarRestarts = 0;
  let last = "",
    sidecarLast = "",
    initializing = false;
  let reason = status.reason || status.phase || "";
  if (
    conditions.some(
      (c) => c.type === "PodScheduled" && c.reason === "SchedulingGated",
    )
  )
    reason = "SchedulingGated";
  total += init.filter((c) => c.restartPolicy === "Always").length;
  for (const [i, container] of (status.initContainerStatuses ?? []).entries()) {
    const state = container.state ?? {},
      terminated = state.terminated;
    const sidecar =
      init.find((c) => c.name === container.name)?.restartPolicy === "Always";
    const finished = container.lastState?.terminated?.finishedAt ?? "";
    restarts += container.restartCount ?? 0;
    if (finished > last) last = finished;
    if (sidecar) {
      sidecarRestarts += container.restartCount ?? 0;
      if (finished > sidecarLast) sidecarLast = finished;
    }
    if (terminated && terminated.exitCode === 0) continue;
    if (sidecar && container.started === true) {
      if (container.ready) ready++;
      continue;
    }
    if (terminated)
      reason =
        "Init:" +
        (terminated.reason ||
          (terminated.signal
            ? `Signal:${terminated.signal}`
            : `ExitCode:${terminated.exitCode}`));
    else if (
      state.waiting?.reason &&
      state.waiting.reason !== "PodInitializing"
    )
      reason = `Init:${state.waiting.reason}`;
    else reason = `Init:${i}/${init.length}`;
    initializing = true;
    break;
  }
  if (
    !initializing ||
    conditions.some((c) => c.type === "Initialized" && c.status === "True")
  ) {
    restarts = sidecarRestarts;
    last = sidecarLast;
    let running = false,
      errorReason = "";
    for (const container of [...statuses].reverse()) {
      restarts += container.restartCount ?? 0;
      const finished = container.lastState?.terminated?.finishedAt ?? "";
      if (finished > last) last = finished;
      const state = container.state ?? {},
        terminated = state.terminated;
      if (state.waiting?.reason) reason = state.waiting.reason;
      else if (terminated) {
        reason =
          terminated.reason ||
          (terminated.signal
            ? `Signal:${terminated.signal}`
            : `ExitCode:${terminated.exitCode}`);
        if (terminated.exitCode !== 0) errorReason = reason;
      } else if (container.ready && state.running) {
        running = true;
        ready++;
      }
    }
    if (reason === "Completed") {
      if (
        running &&
        conditions.some((c) => c.type === "Ready" && c.status === "True")
      )
        reason = "Running";
      else if (errorReason) reason = errorReason;
      else if (running) reason = "NotReady";
    }
  }
  if (pod.metadata.deletionTimestamp && status.reason === "NodeLost")
    reason = "Unknown";
  else if (
    pod.metadata.deletionTimestamp &&
    !["Succeeded", "Failed"].includes(status.phase)
  )
    reason = "Terminating";
  const gates: any[] = spec.readinessGates ?? [];
  const gateReady = gates.filter(
    (gate) =>
      conditions.find((c) => c.type === gate.conditionType)?.status === "True",
  ).length;
  return [
    pod.metadata.name,
    `${ready}/${total}`,
    reason,
    `${restarts}${restarts && last ? ` (${age(last, now)} ago)` : ""}`,
    age(pod.metadata.creationTimestamp, now),
    status.podIPs?.[0]?.ip || "<none>",
    spec.nodeName || "<none>",
    status.nominatedNodeName || "<none>",
    gates.length ? `${gateReady}/${gates.length}` : "<none>",
  ];
}

/** Source-faithful built-in handlers; CRD columns are supplied by the installed definition. */
export function resourceTable(
  items: Resource[],
  kind: string,
  now = simulationEpoch,
  printerColumns?: PrinterColumn[],
): ResourceTable {
  let definitions = columns(["Name", "Age"]);
  let cells: (r: Resource) => unknown[] = (r) => [
    r.metadata.name,
    age(r.metadata.creationTimestamp, now),
  ];
  const base = (r: Resource) => [r.metadata.name];
  const a = (r: Resource) => age(r.metadata.creationTimestamp, now);
  switch (kind) {
    case "CustomResourceDefinition":
      definitions = columns(["Name", "Created At"]);
      cells = (r) => [...base(r), r.metadata.creationTimestamp ?? "<unknown>"];
      break;
    case "Pod":
      definitions = columns(
        ["Name", "Ready", "Status", "Restarts", "Age"],
        ["IP", "Node", "Nominated Node", "Readiness Gates"],
      );
      cells = (r) => podCells(r, now);
      break;
    case "Deployment":
      definitions = columns(
        ["Name", "Ready", "Up-to-date", "Available", "Age"],
        ["Containers", "Images", "Selector"],
      );
      cells = (r) => [
        ...base(r),
        `${r.status?.readyReplicas ?? 0}/${r.spec?.replicas ?? 0}`,
        r.status?.updatedReplicas ?? 0,
        r.status?.availableReplicas ?? 0,
        a(r),
        (r.spec?.template?.spec.containers ?? []).map((c) => c.name).join(","),
        (r.spec?.template?.spec.containers ?? []).map((c) => c.image).join(","),
        formatSelector(r.spec?.selector, ""),
      ];
      break;
    case "SecurityContextConstraints":
      definitions = columns([
        "Name",
        "Privileged",
        "Capabilities",
        "SELinux",
        "RunAsUser",
        "FSGroup",
        "SupplementalGroups",
        "Priority",
        "ReadOnlyFS",
        "Volumes",
      ]);
      definitions[1].type = "bool";
      definitions[7].type = "integer";
      definitions[8].type = "bool";
      cells = (r: any) => [
        ...base(r),
        r.allowPrivilegedContainer ?? false,
        (r.allowedCapabilities ?? []).join(","),
        r.seLinuxContext?.type ?? "",
        r.runAsUser?.type ?? "",
        r.fsGroup?.type ?? "",
        r.supplementalGroups?.type ?? "",
        r.priority == null ? "<none>" : String(r.priority),
        r.readOnlyRootFilesystem ?? false,
        (r.volumes ?? []).join(","),
      ];
      break;
    case "Project":
      definitions = columns(["Name", "Display Name", "Status"]);
      cells = (r) => [
        ...base(r),
        r.metadata.annotations?.["openshift.io/display-name"] ?? "",
        r.status?.phase ?? "",
      ];
      break;
    case "Namespace":
      definitions = columns(["Name", "Status", "Age"]);
      cells = (r) => [...base(r), r.status?.phase ?? "", a(r)];
      break;
    case "ConfigMap":
      definitions = columns(["Name", "Data", "Age"]);
      cells = (r) => [
        ...base(r),
        Object.keys(r.data ?? {}).length +
          Object.keys(r.binaryData ?? {}).length,
        a(r),
      ];
      break;
    case "Secret":
      definitions = columns(["Name", "Type", "Data", "Age"]);
      cells = (r) => [
        ...base(r),
        r.type ?? "",
        Object.keys(r.data ?? {}).length,
        a(r),
      ];
      break;
    case "NetworkPolicy":
      definitions = columns(["Name", "Pod-Selector", "Age"]);
      cells = (r) => [...base(r), formatSelector(r.spec?.podSelector), a(r)];
      break;
    case "RuntimeClass":
      definitions = columns(["Name", "Handler", "Age"]);
      cells = (r) => [...base(r), r.handler ?? "", a(r)];
      break;
    case "Node":
      definitions = columns(
        ["Name", "Status", "Roles", "Age", "Version"],
        [
          "Internal-IP",
          "External-IP",
          "OS-Image",
          "Kernel-Version",
          "Container-Runtime",
        ],
      );
      cells = (r) => {
        const status: any = r.status ?? {},
          nodeInfo = status.nodeInfo ?? {};
        const ready = (status.conditions ?? []).find(
          (c: any) => c.type === "Ready",
        );
        const roles = new Set(
          Object.entries(r.metadata.labels ?? {}).flatMap(([key, value]) =>
            key.startsWith("node-role.kubernetes.io/") && key.slice(24)
              ? [key.slice(24)]
              : key === "kubernetes.io/role" && value
                ? [value]
                : [],
          ),
        );
        const address = (type: string) =>
          (status.addresses ?? []).find((v: any) => v.type === type)?.address ||
          "<none>";
        return [
          ...base(r),
          `${ready ? (ready.status === "True" ? "Ready" : "NotReady") : "Unknown"}${r.spec?.unschedulable ? ",SchedulingDisabled" : ""}`,
          [...roles].sort().join(",") || "<none>",
          a(r),
          nodeInfo.kubeletVersion ?? "",
          address("InternalIP"),
          address("ExternalIP"),
          nodeInfo.osImage || "<unknown>",
          nodeInfo.kernelVersion || "<unknown>",
          nodeInfo.containerRuntimeVersion || "<unknown>",
        ];
      };
      break;
    case "RoleBinding":
    case "ClusterRoleBinding":
      definitions = columns(
        ["Name", "Role", "Age"],
        ["Users", "Groups", "ServiceAccounts"],
      );
      cells = (r: any) => [
        ...base(r),
        `${r.roleRef?.kind ?? ""}/${r.roleRef?.name ?? ""}`,
        a(r),
        ...["User", "Group", "ServiceAccount"].map((kind) =>
          (r.subjects ?? [])
            .filter((s: any) => s.kind === kind)
            .map((s: any) =>
              kind === "ServiceAccount"
                ? `${s.namespace ?? ""}/${s.name}`
                : s.name,
            )
            .join(", "),
        ),
      ];
      break;
    case "Service":
      definitions = columns(
        ["Name", "Type", "Cluster-IP", "External-IP", "Port(s)", "Age"],
        ["Selector"],
      );
      cells = (r) => {
        const spec = r.spec ?? {},
          status: any = r.status ?? {};
        let external = "<none>";
        if (spec.type === "ExternalName") external = spec.externalName ?? "";
        else if (spec.type === "LoadBalancer")
          external =
            [
              ...(status.loadBalancer?.ingress ?? []).map(
                (i: any) => i.ip || i.hostname,
              ),
              ...(spec.externalIPs ?? []),
            ].join(",") || "<pending>";
        else external = (spec.externalIPs ?? []).join(",") || "<none>";
        return [
          ...base(r),
          spec.type ?? "",
          spec.clusterIPs?.[0] || "<none>",
          external,
          (spec.ports ?? [])
            .map(
              (p: any) =>
                `${p.port}${p.nodePort ? `:${p.nodePort}` : ""}/${p.protocol ?? "TCP"}`,
            )
            .join(",") || "<none>",
          a(r),
          formatLabels(spec.selector),
        ];
      };
      break;
    case "Event":
      definitions = columns(
        ["Last Seen", "Type", "Reason", "Object"],
        ["Subobject", "Source"],
      );
      definitions.push(
        ...columns(["Message"]),
        ...columns([], ["First Seen", "Count", "Name"]),
      );
      cells = (r: any) => {
        const first = r.firstTimestamp || r.eventTime;
        const source = r.source?.component || r.reportingComponent || "",
          host = r.source?.host || r.reportingInstance || "";
        return [
          age(r.series?.lastObservedTime || r.lastTimestamp || first, now),
          r.type ?? "",
          r.reason ?? "",
          `${(r.involvedObject?.kind ?? "").toLowerCase()}${r.involvedObject?.name ? `/${r.involvedObject.name}` : ""}`,
          r.involvedObject?.fieldPath ?? "",
          `${source}${host ? `, ${host}` : ""}`,
          (r.message ?? "").trim(),
          age(first, now),
          r.series?.count ?? (r.count || 1),
          r.metadata.name,
        ];
      };
      break;
    case "ResourceQuota":
      definitions = columns(["Name", "Request", "Limit", "Age"]);
      cells = (r: any) => [
        ...base(r),
        ...[false, true].map((limit) =>
          Object.keys(r.status?.hard ?? {})
            .sort()
            .filter((k) => k.startsWith("limits.") === limit)
            .map(
              (k) => `${k}: ${r.status?.used?.[k] ?? "0"}/${r.status.hard[k]}`,
            )
            .join(", "),
        ),
        a(r),
      ];
      break;
    case "Route":
      definitions = columns([
        "Name",
        "Host/Port",
        "Path",
        "Services",
        "Port",
        "Termination",
        "Wildcard",
      ]);
      cells = (r) => {
        const spec = r.spec ?? {},
          status: any = r.status ?? {};
        let host = spec.host ?? "",
          admitted = 0,
          rejected = 0,
          reason = "",
          matched = false;
        for (const ingress of status.ingress ?? []) {
          const condition = (ingress.conditions ?? []).find(
            (c: any) => c.type === "Admitted",
          );
          if (condition?.status === "True") {
            admitted++;
            if (!matched) {
              matched = ingress.host === spec.host;
              host = ingress.host;
            }
          } else if (condition?.status === "False") {
            rejected++;
            reason = condition.reason ?? "";
          }
        }
        if (status.ingress != null) {
          if (!admitted && rejected) host = reason;
          else if (rejected) host += ` ... ${rejected} rejected`;
          else if (!admitted) host = "Pending";
          else if (admitted > 1) host += ` ... ${admitted - 1} more`;
        }
        const backends = [spec.to ?? {}, ...(spec.alternateBackends ?? [])],
          total = backends.reduce((sum, b) => sum + (b.weight ?? 0), 0);
        const services = backends
          .map((b) =>
            b.weight == null || (backends.length === 1 && total !== 0)
              ? (b.name ?? "")
              : `${b.name}(${total ? Math.trunc((b.weight * 100) / total) : 0}%)`,
          )
          .join(",");
        const tls = spec.tls ?? {},
          termination = tls.termination
            ? tls.termination +
              (tls.insecureEdgeTerminationPolicy
                ? `/${tls.insecureEdgeTerminationPolicy}`
                : "")
            : tls.insecureEdgeTerminationPolicy
              ? `default/${tls.insecureEdgeTerminationPolicy}`
              : "";
        return [
          ...base(r),
          host,
          spec.path ?? "",
          services,
          spec.port ? spec.port.targetPort : "<all>",
          termination,
          spec.wildcardPolicy ?? "",
        ];
      };
      break;
  }
  if (printerColumns !== undefined) {
    const custom = printerColumns.length
      ? printerColumns
      : [
          {
            name: "Age",
            type: "date",
            jsonPath: ".metadata.creationTimestamp",
          },
        ];
    definitions = [
      ...columns(["Name"]),
      ...custom.map((c) => ({
        name: c.name,
        type: c.type,
        description: c.description ?? "",
        priority: c.priority ?? 0,
        ...(c.format ? { format: c.format } : {}),
      })),
    ];
    cells = (r) => [
      r.metadata.name,
      ...custom.map((c) => {
        const found = jsonPathValues(r, c.jsonPath)[0];
        if (c.type === "date")
          return found == null
            ? null
            : typeof found === "string" && Number.isFinite(Date.parse(found))
              ? age(found, now)
              : "<invalid>";
        if (found === undefined || found === null) return null;
        if (c.type === "integer" || c.type === "number")
          return typeof found === "number" ? found : null;
        if (c.type === "boolean")
          return typeof found === "boolean" ? found : null;
        return typeof found === "object"
          ? JSON.stringify(found)
          : String(found);
      }),
    ];
  }
  return {
    apiVersion: "meta.k8s.io/v1",
    kind: "Table",
    metadata: {},
    columnDefinitions: definitions,
    rows: items.map((object) => ({
      object: structuredClone(object),
      cells: cells(object),
    })),
  };
}

/** The JSONPath subset used by installed CRD printer columns; reject other expressions. */
export function jsonPathValues(object: unknown, path: string): unknown[] {
  const tokens: (string | { filter: string; value: string } | number)[] = [];
  let rest = path.replace(/^\{(.*)\}$/, "$1").replace(/^\$?\./, "");
  while (rest) {
    let match: RegExpMatchArray | null;
    if (rest.startsWith(".")) {
      rest = rest.slice(1);
      continue;
    }
    if (
      (match = rest.match(/^\[\?\(@\.([\w.-]+)\s*==\s*["']([^"']*)["']\)\]/))
    ) {
      tokens.push({ filter: match[1], value: match[2] });
      rest = rest.slice(match[0].length);
    } else if ((match = rest.match(/^\[(\*|\d+)\]/))) {
      tokens.push(match[1] === "*" ? "*" : Number(match[1]));
      rest = rest.slice(match[0].length);
    } else if ((match = rest.match(/^\[['"]([^'"]+)['"]\]/))) {
      tokens.push(match[1]);
      rest = rest.slice(match[0].length);
    } else if ((match = rest.match(/^((?:\\.|[^.\[\]])+)/))) {
      tokens.push(match[1].replace(/\\(.)/g, "$1"));
      rest = rest.slice(match[0].length);
    } else
      throw new Error(
        `simulation: CRD printer JSONPath is not implemented: ${path}`,
      );
  }
  let values: any[] = [object];
  for (const token of tokens)
    values = values.flatMap((v) => {
      if (typeof token === "object")
        return Array.isArray(v)
          ? v.filter(
              (entry) => jsonPathValues(entry, token.filter)[0] === token.value,
            )
          : [];
      if (token === "*")
        return v && typeof v === "object" ? Object.values(v) : [];
      return v != null &&
        Object.hasOwn(Object(v), token) &&
        v[token] !== undefined
        ? [v[token]]
        : [];
    });
  return values;
}
