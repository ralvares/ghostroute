import { getImage } from "./images.js";
import { S } from "../../simulation/state.js";
import type { Resource } from "../../simulation/cluster-model.js";
import type { Policy } from "./types.js";
import { centralPolicies } from "./policies.js";
import {
  clusterTime,
  reconcileDeployment,
  synchronizeClusterMetadata,
} from "../../simulation/cluster-api.js";
import { record } from "../../simulation/operations.js";
import { projectIncident } from "../../simulation/incident-controller.js";
import { reconcileServices } from "../../network/services.js";
export const execPolicyId = "8ab0f199-4904-4808-9461-3501da1d1b77";
export const baselinePolicyId = "89cae2e6-0cb7-4329-8692-c2c3717c1237";
export interface ProcessBaseline {
  id: string;
  key: {
    deploymentId: string;
    containerName: string;
    clusterId: string;
    namespace: string;
  };
  elements: { element: { processName: string }; auto: boolean }[];
  created: string;
  lastUpdate: string;
  userLockedTimestamp?: string;
  stackRoxLockedTimestamp?: string;
}
export interface ProcessIndicator {
  id: string;
  deploymentId: string;
  containerName: string;
  podId: string;
  podUid: string;
  clusterId: string;
  namespace: string;
  containerStartTime?: string;
  imageId: string;
  signal: {
    id: string;
    containerId: string;
    time: string;
    name: string;
    args: string;
    execFilePath: string;
    pid: number;
    uid: number;
    gid: number;
    scraped: boolean;
    lineageInfo: { parentUid: number; parentExecFilePath: string }[];
  };
}
export interface RuntimeAlert {
  id: string;
  policy: Policy;
  lifecycleStage: "RUNTIME";
  clusterId: string;
  clusterName: string;
  namespace: string;
  namespaceId: string;
  deployment: {
    id: string;
    name: string;
    type: string;
    namespace: string;
    clusterId: string;
    clusterName: string;
    labels: Record<string, string>;
  };
  entityType: "DEPLOYMENT";
  violations: {
    message: string;
    type: "K8S_EVENT" | "GENERIC";
    time?: string;
    keyValueAttrs?: { attrs: { key: string; value: string }[] };
  }[];
  processViolation?: { message: string; processes: ProcessIndicator[] };
  time: string;
  firstOccurred: string;
  state: "ACTIVE" | "RESOLVED";
  resolvedAt?: string;
  enforcement?: { action: string; message: string };
  enforcementCount: number;
}

const clusterId = "00000000-0000-4000-8000-000000000001";
const now = () => new Date(clusterTime()).toISOString();
const id = () =>
  `00000000-0000-4000-a000-${String(++S.cluster.rhacs.runtime.sequence).padStart(12, "0")}`;
function workload(pod: Resource) {
  const direct = pod.metadata.ownerReferences?.find(
    (o) => o.kind === "Deployment",
  );
  const rsRef = pod.metadata.ownerReferences?.find(
    (o) => o.kind === "ReplicaSet",
  );
  const rs =
    rsRef &&
    S.cluster.resources.find(
      (r) =>
        r.kind === "ReplicaSet" &&
        r.metadata.name === rsRef.name &&
        r.metadata.namespace === pod.metadata.namespace,
    );
  const parent =
    direct?.name ??
    rs?.metadata.ownerReferences?.find((o) => o.kind === "Deployment")?.name;
  return (
    S.cluster.resources.find(
      (r) =>
        r.kind === "Deployment" &&
        r.metadata.namespace === pod.metadata.namespace &&
        (parent
          ? r.metadata.name === parent
          : r.metadata.name === "payment-api"
            ? pod.metadata.labels?.app === "payment-api"
            : pod.metadata.name.startsWith(r.metadata.name + "-sim-")),
    ) ?? pod
  );
}
function excluded(policy: Policy, pod: Resource, owner: Resource) {
  const regex = (q: string, s: string) => new RegExp(q).test(s);
  return (
    policy.disabled ||
    !policy.lifecycleStages.includes("RUNTIME") ||
    (policy.scope?.length &&
      !policy.scope.some(
        (s) =>
          (!s.namespace || s.namespace === pod.metadata.namespace) &&
          (!s.cluster || s.cluster === clusterId),
      )) ||
    policy.exclusions?.some(
      (e: any) =>
        e.deployment &&
        (!e.deployment.name || regex(e.deployment.name, owner.metadata.name)) &&
        (!e.deployment.scope?.namespace ||
          e.deployment.scope.namespace === pod.metadata.namespace),
    )
  );
}
export function baselineFor(
  pod: Resource,
  containerName = pod.spec!.containers![0].name,
) {
  const owner = workload(pod);
  const deploymentId = owner.metadata.uid!;
  let baseline = S.cluster.rhacs.runtime.baselines.find(
    (b) =>
      b.key.deploymentId === deploymentId &&
      b.key.containerName === containerName,
  );
  if (!baseline) {
    baseline = {
      id: id(),
      key: {
        deploymentId,
        containerName,
        clusterId,
        namespace: pod.metadata.namespace!,
      },
      elements: [],
      created: now(),
      lastUpdate: now(),
    };
    S.cluster.rhacs.runtime.baselines.push(baseline);
  }
  if (
    !baseline.userLockedTimestamp &&
    !baseline.stackRoxLockedTimestamp &&
    clusterTime() - Date.parse(baseline.created) >= 3600000
  )
    baseline.stackRoxLockedTimestamp = now();
  return baseline;
}
export function setBaselineLocked(baselineId: string, locked: boolean) {
  const baseline = S.cluster.rhacs.runtime.baselines.find(
    (b) => b.id === baselineId,
  );
  if (!baseline) throw new Error("Process baseline not found");
  if (locked) baseline.userLockedTimestamp = now();
  else {
    delete baseline.userLockedTimestamp;
    delete baseline.stackRoxLockedTimestamp;
    baseline.created = now();
  }
  baseline.lastUpdate = now();
  record("rhacs.baseline", { id: baseline.id, locked }, "operator");
}
function alert(
  policy: Policy,
  pod: Resource,
  process: ProcessIndicator | undefined,
  message: string,
  attrs?: { key: string; value: string }[],
) {
  const owner = workload(pod),
    time = now();
  let item = S.cluster.rhacs.runtime.alerts.find(
    (a) =>
      a.policy.id === policy.id &&
      a.deployment.id === owner.metadata.uid &&
      a.state === "ACTIVE",
  );
  if (!item) {
    item = {
      id: id(),
      policy: structuredClone(policy),
      lifecycleStage: "RUNTIME",
      clusterId,
      clusterName: "prod-east",
      namespace: pod.metadata.namespace!,
      namespaceId:
        S.cluster.resources.find(
          (r) =>
            r.kind === "Namespace" &&
            r.metadata.name === pod.metadata.namespace,
        )?.metadata.uid ?? "",
      deployment: {
        id: owner.metadata.uid!,
        name: owner.metadata.name,
        type: owner.kind,
        namespace: pod.metadata.namespace!,
        clusterId,
        clusterName: "prod-east",
        labels: { ...owner.metadata.labels },
      },
      entityType: "DEPLOYMENT",
      violations: [],
      time,
      firstOccurred: time,
      state: "ACTIVE",
      enforcementCount: 0,
    };
    S.cluster.rhacs.runtime.alerts.push(item);
  }
  item.policy = structuredClone(policy);
  item.time = time;
  item.violations.push({
    message,
    type: process ? "GENERIC" : "K8S_EVENT",
    ...(!process ? { time, keyValueAttrs: { attrs: attrs ?? [] } } : {}),
  });
  item.violations = item.violations.slice(-40);
  if (process) {
    item.processViolation ??= { message, processes: [] };
    item.processViolation.processes.push(process);
    item.processViolation.processes =
      item.processViolation.processes.slice(-40);
  }
  S.cluster.rhacs.runtime.alerts = S.cluster.rhacs.runtime.alerts.slice(-100);
  return item;
}
/** Completed exec audit requests notify; they cannot retroactively block CONNECT or kill a Pod. */
export function observeExec(pod: Resource, command: string[]) {
  const owner = workload(pod),
    policy = centralPolicies().find((p) => p.id === execPolicyId);
  if (!policy || excluded(policy, pod, owner)) return;
  const item = alert(
    policy,
    pod,
    undefined,
    `Kubernetes API request to execute command in pod ${pod.metadata.name}`,
    [
      { key: "User", value: S.cluster.user },
      { key: "Pod", value: pod.metadata.name },
      { key: "Namespace", value: pod.metadata.namespace! },
      { key: "Command", value: command.join(" ") },
    ],
  );
  record(
    "rhacs.alert",
    {
      id: item.id,
      policy: policy.name,
      pod: pod.metadata.name,
      terminated: false,
    },
    "simulation",
  );
}
export function observeProcess(
  pod: Resource,
  command: string[],
  containerName?: string,
  ancestorPaths: string[] = [],
) {
  const container = pod.spec!.containers!.find(
    (c) => c.name === (containerName ?? pod.spec!.containers![0].name),
  )!;
  if (!container) throw new Error("Process container not found");
  const baseline = baselineFor(pod, container.name),
    name = command[0].split("/").at(-1)!,
    locked = !!(
      baseline.userLockedTimestamp || baseline.stackRoxLockedTimestamp
    ),
    unexpected =
      locked && !baseline.elements.some((e) => e.element.processName === name);
  if (
    !locked &&
    !baseline.elements.some((e) => e.element.processName === name)
  ) {
    baseline.elements.push({ element: { processName: name }, auto: true });
    baseline.lastUpdate = now();
  }
  const uid =
    container.securityContext?.runAsUser ??
    pod.spec?.securityContext?.runAsUser ??
    1000;
  let imageId = "";
  try {
    imageId = getImage(container.image).digest;
  } catch {
    /* Unknown image contents cannot acquire an invented image digest. */
  }
  const signalId = id();
  const process: ProcessIndicator = {
    id: id(),
    deploymentId: baseline.key.deploymentId,
    containerName: container.name,
    podId: pod.metadata.name,
    podUid: pod.metadata.uid!,
    clusterId,
    namespace: pod.metadata.namespace!,
    containerStartTime: (pod.status?.containerStatuses as any[])?.find(
      (c) => c.name === container.name,
    )?.state?.running?.startedAt,
    imageId,
    signal: {
      id: signalId,
      containerId:
        (pod.status?.containerStatuses as any[])
          ?.find((c) => c.name === container.name)
          ?.containerID?.replace(/^cri-o:\/\//, "") ?? pod.metadata.uid!,
      time: now(),
      name,
      args: command.slice(1).join(" "),
      execFilePath: command[0].startsWith("/")
        ? command[0]
        : "/usr/bin/" + name,
      pid: 100 + S.cluster.rhacs.runtime.sequence,
      uid,
      gid: container.securityContext?.runAsGroup ?? 0,
      scraped: false,
      lineageInfo: ancestorPaths.map((parentExecFilePath) => ({
        parentUid: uid,
        parentExecFilePath,
      })),
    },
  };
  S.cluster.rhacs.runtime.processes.push(process);
  S.cluster.rhacs.runtime.processes =
    S.cluster.rhacs.runtime.processes.slice(-500);
  const owner = workload(pod),
    hits: RuntimeAlert[] = [];
  const field = (key: string, value: string) => {
    switch (key) {
      case "Unexpected Process Executed":
        return String(unexpected) === value;
      case "Process Name":
        return new RegExp(value).test(name);
      case "Process Arguments":
        return new RegExp(value).test(process.signal.args);
      case "Process Ancestor":
        return ancestorPaths.some((p) => new RegExp(value).test(p));
      case "Process UID":
        return String(uid) === value;
      case "Namespace":
        return new RegExp(value).test(pod.metadata.namespace!);
      default:
        return false;
    }
  };
  const supported = new Set([
    "Unexpected Process Executed",
    "Process Name",
    "Process Arguments",
    "Process Ancestor",
    "Process UID",
    "Namespace",
  ]);
  for (const policy of centralPolicies()) {
    if (
      excluded(policy, pod, owner) ||
      !policy.policySections?.length ||
      policy.policySections.some((s) =>
        s.policyGroups.some((g) => !supported.has(g.fieldName)),
      )
    )
      continue;
    const match = policy.policySections.some((s) =>
      s.policyGroups.every((g) => {
        const values = g.values.map((v) => field(g.fieldName, v.value));
        const hit =
          g.booleanOperator === "AND"
            ? values.every(Boolean)
            : values.some(Boolean);
        return g.negate ? !hit : hit;
      }),
    );
    if (match)
      hits.push(
        alert(
          policy,
          pod,
          process,
          `${policy.name}: ${name} executed in ${pod.metadata.name}`,
        ),
      );
  }
  const enforcing = hits.filter((a) =>
    a.policy.enforcementActions?.includes("KILL_POD_ENFORCEMENT"),
  );
  if (enforcing.length) {
    for (const item of enforcing) {
      item.enforcement = {
        action: "KILL_POD_ENFORCEMENT",
        message: `Pod ${pod.metadata.name} terminated`,
      };
      item.enforcementCount++;
    }
    S.cluster.resources = S.cluster.resources.filter((r) => r !== pod);
    synchronizeClusterMetadata();
    if (owner.kind === "Deployment") reconcileDeployment(owner, false);
    reconcileServices(S.cluster.resources);
    projectIncident();
  }
  for (const item of hits)
    record(
      "rhacs.alert",
      {
        id: item.id,
        policy: item.policy.name,
        pod: pod.metadata.name,
        terminated: enforcing.length > 0,
      },
      "simulation",
    );
  return hits;
}
