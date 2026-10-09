import { normalizeSecret, secretValue } from "./secrets.js";
import { synchronizeMetadata } from "./api-storage.js";
import { validateResourceUpdate } from "./resource-update.js";
import { strategicPatch } from "./strategic-patch.js";
import { mergePatch } from "./api-patch.js";
import { strategicSchemas } from "./strategic-schemas.js";
import { S } from "./state.js";
import { allocatePodAddress, creationNetwork } from "./pod-addresses.js";
import { defaultSccs } from "./default-sccs.js";
import { installedCrds } from "./installed-crds.js";
import {
  validateCustomResource,
  validateCustomSchema,
} from "./custom-resource.js";
import { jsonPathValues, simulationEpoch } from "./resource-table.js";
export const clusterTime = () =>
  simulationEpoch + S.cluster.audit.length * 1000;
import type { Resource, PodSpec, ApiAuditEvent, Scc } from "./cluster-model.js";
import { authorized, forbidden, roleAllows } from "../security/rbac.js";
import { admitPod } from "../security/scc.js";
import { publish } from "./events.js";
import { parse } from "yaml";
import { policyFiles } from "./resources.js";
import {
  validateCampaignPod,
  registryPullFailure,
  schedulingFailure,
  reconcileFixtureControllers,
  resource as findResource,
} from "../campaign/models.js";

import {
  resourceTypes,
  resolveResource,
  refreshResourceTypes,
  type ResourceType,
} from "./resource-types.js";
export {
  resourceTypes,
  resolveResource,
  refreshResourceTypes,
  type ResourceType,
} from "./resource-types.js";

export function auditRequest(
  verb: string,
  resource: string,
  namespace: string | undefined,
  name: string | undefined,
  code: number,
  message = "",
  username = S.cluster.user,
) {
  const seq = S.cluster.audit.length + 1;
  const version =
    resource in resourceTypes
      ? resourceTypes[resource as ResourceType].apiVersion
      : "v1";
  const api = version === "v1" ? "/api/v1" : "/apis/" + version;
  const event: ApiAuditEvent = {
    kind: "Event",
    apiVersion: "audit.k8s.io/v1",
    level: "Metadata",
    stage: "ResponseComplete",
    auditID: `00000000-0000-4000-8000-${String(seq).padStart(12, "0")}`,
    verb,
    user: { username },
    requestURI: `${api}/${namespace ? "namespaces/" + namespace + "/" : ""}${resource}${name ? "/" + name : ""}`,
    objectRef: { resource, namespace, name },
    responseStatus: {
      code,
      ...(code >= 400
        ? {
            reason: ({400:"BadRequest",403:"Forbidden",404:"NotFound",409:"Conflict",415:"UnsupportedMediaType",422:"Invalid",501:"NotImplemented"} as Record<number,string>)[code] ?? "Unknown",
            message,
          }
        : {}),
    },
    annotations: {
      "authorization.k8s.io/decision":
        code === 403 && message.includes("cannot ") ? "forbid" : "allow",
    },
    requestReceivedTimestamp: new Date(
      Date.UTC(2026, 9, 8, 2, 14) + seq * 1000,
    ).toISOString(),
  };
  S.cluster.audit.push(event);
  const domain = Object.freeze({
    type: "cluster.request" as const,
    sequence: S.audit.length + 1,
    actor:
      username === S.cluster.user
        ? ("operator" as const)
        : ("simulation" as const),
    at: event.requestReceivedTimestamp,
    data: Object.freeze({
      verb,
      resource,
      message,
      namespace: namespace ?? "",
      name: name ?? "",
      code,
    }),
  });
  S.audit.push(domain);
  publish(domain);
}

export function coreResources(): Resource[] {
  const paymentPodCreated =
    [...S.audit].reverse().find(
      (event) =>
        event.type === "pods.replaced" && event.data.revision === S.podRev,
    )?.at ?? "2026-10-08T00:14:00Z";
  return [
    ...[...S.policies].map(
      (name) =>
        parse(
          policyFiles[
            name === "payment-egress"
              ? "policies/payments-egress.yaml"
              : "policies/deny-all.yaml"
          ],
        ) as Resource,
    ),
    {
      apiVersion: "apps/v1",
      kind: "Deployment",
      metadata: {
        name: "payment-api",
        namespace: "payments",
        creationTimestamp: "2026-10-08T00:14:00Z",
        labels: { app: "payment-api" },
      },
      spec: {
        replicas: 2,
        selector: { matchLabels: { app: "payment-api" } },
        template: {
          metadata: { labels: { app: "payment-api" } },
          spec: {
            serviceAccountName: "payment-app",
            hostUsers: false,
            containers: [
              {
                name: "payment-api",
                image: "registry.example.test/payments:v1.8.2",
                env: Object.entries(S.deployment.env).map(([name, value]) => ({
                  name,
                  value,
                })),
              },
            ],
          },
        },
      },
      status: {
        replicas: 2,
        updatedReplicas: 2,
        readyReplicas: S.deployment.readyReplicas,
        availableReplicas: S.deployment.readyReplicas,
      },
    },
    ...S.pods.map((pod) => ({
      apiVersion: "v1",
      kind: "Pod",
      metadata: {
        name: pod.name,
        namespace: "payments",
        creationTimestamp: paymentPodCreated,
        labels: { app: "payment-api" },
        annotations: { "openshift.io/scc": "restricted-v3" },
      },
      spec: {
        hostUsers: false,
        nodeName: pod.node,
        serviceAccountName: "payment-app",
        containers: [
          {
            name: "payment-api",
            image: "registry.example.test/payments:v1.8.2",
            env: Object.entries(S.deployment.env).map(([name, value]) => ({
              name,
              value,
            })),
          },
        ],
      },
      status: {
        phase: "Running",
        podIP: pod.node === "worker-01" ? "10.128.0.21" : "10.129.0.22",
        podIPs: [
          { ip: pod.node === "worker-01" ? "10.128.0.21" : "10.129.0.22" },
        ],
        conditions: [{ type: "Ready", status: pod.ready ? "True" : "False" }],
        containerStatuses: [
          {
            name: "payment-api",
            ready: pod.ready,
            restartCount: 0,
            state: { running: { startedAt: paymentPodCreated } },
          },
        ],
      },
    })),
    {
      apiVersion: "v1",
      kind: "Pod",
      metadata: {
        name: "ledger-86bbb-zyx12",
        namespace: "payments",
        creationTimestamp: "2026-10-08T00:14:00Z",
        labels: { app: "ledger" },
        annotations: { "openshift.io/scc": "restricted-v3" },
      },
      spec: {
        nodeName: "worker-02",
        containers: [
          { name: "ledger", image: "registry.example.test/ledger:v1" },
        ],
      },
      status: {
        phase: "Running",
        podIP: "10.129.0.23",
        podIPs: [{ ip: "10.129.0.23" }],
        conditions: [{ type: "Ready", status: "True" }],
        containerStatuses: [
          {
            name: "ledger",
            ready: true,
            restartCount: 0,
            state: { running: { startedAt: "2026-10-08T00:14:00Z" } },
          },
        ],
      },
    },
  ];
}

export function getResources(
  type: ResourceType,
  namespace?: string,
  name?: string,
): Resource[] {
  const core = synchronizeClusterMetadata();
  const verb = name ? "get" : "list";
  if (!authorized(verb, type, namespace, name)) {
    const message = forbidden(verb, type, namespace, name);
    auditRequest(verb, type, namespace, name, 403, message);
    throw new Error(message);
  }
  const all =
    type === "securitycontextconstraints"
      ? S.cluster.sccs
      : type === "events"
        ? S.cluster.events
        : type === "projects"
          ? S.cluster.resources
              .filter((r) => r.kind === "Namespace")
              .map((r) => ({
                ...r,
                apiVersion: "project.openshift.io/v1",
                kind: "Project",
              }))
          : [...S.cluster.resources, ...core];
  const resources = all.filter(
    (resource) =>
      resource.kind === resourceTypes[type].kind &&
      (!resourceTypes[type].namespaced ||
        !namespace ||
        resource.metadata.namespace === namespace) &&
      (!name || resource.metadata.name === name),
  );
  if (name && !resources.length) {
    const message = `Error from server (NotFound): ${type} "${name}" not found`;
    auditRequest(verb, type, namespace, name, 404, message);
    throw new Error(message);
  }
  resources.sort((a, b) => {
    const left = `${a.metadata.namespace ?? ""}/${a.metadata.name}`,
      right = `${b.metadata.namespace ?? ""}/${b.metadata.name}`;
    return left < right ? -1 : left > right ? 1 : 0;
  });
  auditRequest(verb, type, namespace, name, 200);
  return structuredClone(
    resources.map((resource) => ({
      ...resource,
      metadata: {
        ...resource.metadata,
        creationTimestamp:
          resource.metadata.creationTimestamp ?? "2026-10-01T02:14:00Z",
      },
    })),
  );
}

export function synchronizeClusterMetadata() {
  const core = coreResources();
  synchronizeMetadata([...S.cluster.resources, ...S.cluster.sccs, ...S.cluster.events, ...core]);
  return core;
}

function namespaceRange(namespace: string): [number, number] {
  const allocation =
    S.cluster.resources.find(
      (resource) =>
        resource.kind === "Namespace" && resource.metadata.name === namespace,
    )?.metadata.annotations?.["openshift.io/sa.scc.uid-range"] ??
    "1000750000/10000";
  const [base, count] = allocation.split("/").map(Number);
  return [base, base + count - 1];
}
function usableSccs(namespace: string, sa: string, directRequest = false) {
  const available = new Set(["restricted-v3", "restricted-v2"]);
  for (const scc of S.cluster.sccs)
    if (
      roleAllows(
        `system:serviceaccount:${namespace}:${sa}`,
        "use",
        "securitycontextconstraints",
        namespace,
        scc.metadata.name,
      ) ||
      (directRequest &&
        roleAllows(
          S.cluster.user,
          "use",
          "securitycontextconstraints",
          namespace,
          scc.metadata.name,
        ))
    )
      available.add(scc.metadata.name);
  if (directRequest && S.cluster.user === "platform-admin")
    available.add("anyuid");
  return available;
}

function admitResource(resource: Resource, directRequest = true, runRuntime = true) {
  const namespace = resource.metadata.namespace!;
  const spec = resource.spec as PodSpec;
  validateCampaignPod(resource);
  const sa = spec.serviceAccountName ?? "default";
  if (
    !S.cluster.resources.some(
      (item) =>
        item.kind === "ServiceAccount" &&
        item.metadata.namespace === namespace &&
        item.metadata.name === sa,
    )
  )
    throw new Error(
      `Error from server (Forbidden): pods "${resource.metadata.name}" is forbidden: error looking up service account ${namespace}/${sa}: serviceaccount "${sa}" not found`,
    );
  const admission = admitPod(
    spec,
    S.cluster.sccs,
    usableSccs(namespace, sa, directRequest),
    namespaceRange(namespace),
  );
  if (!admission.accepted)
    throw new Error(
      `Error from server (Forbidden): pods "${resource.metadata.name}" is forbidden: ${admission.message}`,
    );
  const requestedNode = admission.spec.nodeName;
  if (requestedNode && !["worker-01", "worker-02"].includes(requestedNode))
    throw new Error(
      "simulation: nodeName must select worker-01 or worker-02; scheduling to other nodes is not implemented",
    );
  resource.spec = {
    ...admission.spec,
    ...(runRuntime ? {nodeName:
      requestedNode ??
      (S.cluster.resources.filter((item) => item.kind === "Pod").length % 2
        ? "worker-02"
        : "worker-01")} : {}),
  };
  resource.metadata.annotations = {
    ...resource.metadata.annotations,
    "openshift.io/scc": admission.scc,
  };
  if (runRuntime) startPod(resource);
  else resource.status = {phase: "Pending"};
}

function startPod(resource: Resource, previous?: Resource) {
  const namespace = resource.metadata.namespace!;
  const spec = resource.spec as PodSpec;
  const containerStatuses = spec.containers.map((container) => {
    const image = container.image.split("@")[0],
      uid = container.securityContext?.runAsUser;
    const pullFailure = registryPullFailure(container.image);
    const fails =
      (image === "registry.example.test/owned:root" && uid !== 0) ||
      (image === "registry.example.test/vendor:fixed-uid" && uid !== 100);
    const known = [
      "registry.example.test/owned:root",
      "registry.example.test/owned:arbitrary-uid",
      "registry.example.test/vendor:fixed-uid",
      "busybox",
      "busybox:latest",
      "registry.example.test/payments:v1.8.2",
    ].includes(image);
    return {
      name: container.name,
      ready: known && !fails && !pullFailure,
      restartCount: fails ? 1 : 0,
      state:
        pullFailure || !known
          ? {
              waiting: {
                reason: "ImagePullBackOff",
                message:
                  pullFailure || "Image is absent from the offline registry",
              },
            }
          : fails
            ? {
                waiting: {
                  reason: "CrashLoopBackOff",
                  message:
                    "Application cannot write its data directory: permission denied",
                },
              }
            : { running: { startedAt: new Date(clusterTime()).toISOString() } },
    };
  });
  const running = containerStatuses.every(
    (c) => c.state.waiting?.reason !== "ImagePullBackOff",
  );
  const podIP = previous?.status?.podIP ?? allocatePodAddress(resource, S.cluster.resources);
  if (!previous) {
    const network = creationNetwork(resource, S.cluster.resources);
    resource.metadata.annotations!["k8s.v1.cni.cncf.io/network-status"] = JSON.stringify([
      { name: network.domain, interface: "eth0", ips: [podIP], default: true },
    ]);
  }
  resource.status = {
    phase: running ? "Running" : "Pending",
    containerStatuses,
    podIP,
    podIPs: [{ ip: podIP }],
    conditions: [
      { type: "Initialized", status: "True" },
      {
        type: "Ready",
        status: containerStatuses.every((c) => c.ready) ? "True" : "False",
      },
    ],
  };
  const scheduling = schedulingFailure(resource);
  const secretRefs = spec.containers
    .flatMap((c) => c.env ?? [])
    .filter((e) => e.valueFrom?.secretKeyRef);
  const missing = secretRefs.find(
    (e) => !findResource("Secret", e.valueFrom!.secretKeyRef.name, namespace),
  );
  if (scheduling || missing) {
    resource.status = {
      phase: "Pending",
      containerStatuses: [
        {
          name: spec.containers[0].name,
          ready: false,
          restartCount: 0,
          state: {
            waiting: {
              reason: scheduling
                ? resource.metadata.annotations?.["k8s.v1.cni.cncf.io/networks"]
                  ? "ContainerCreating"
                  : "FailedScheduling"
                : "CreateContainerConfigError",
              message: scheduling || "Referenced Secret is absent",
            },
          },
        },
      ],
    };
  }
  for (const ref of secretRefs) {
    const secret = findResource(
      "Secret",
      ref.valueFrom!.secretKeyRef.name,
      namespace,
    );
    const value = secretValue(secret, ref.valueFrom!.secretKeyRef.key);
    if (value)
      resource.metadata.annotations!["roadshow.secret-version"] = value;
  }
}

function reconcileDeployment(deployment: Resource, recreate = true) {
  const template = deployment.spec?.template;
  if (!template) throw new Error("Deployment requires spec.template");
  const namespace = deployment.metadata.namespace!;
  const prefix = deployment.metadata.name + "-sim-";
  S.cluster.resources = S.cluster.resources.filter(
    (resource) =>
      !(
        resource.kind === "Pod" &&
        resource.metadata.namespace === namespace &&
        resource.metadata.name.startsWith(prefix) &&
        (recreate || Number(resource.metadata.name.slice(prefix.length)) >= (deployment.spec?.replicas ?? 1))
      ),
  );
  synchronizeClusterMetadata();
  const replicas = deployment.spec?.replicas ?? 1;
  let available = 0,
    failedCreates = 0;
  for (let index = 0; index < replicas; index++) {
    const existing = S.cluster.resources.find(resource => resource.kind === "Pod" && resource.metadata.namespace === namespace && resource.metadata.name === prefix + index);
    if (existing) {
      if ((existing.status?.containerStatuses as {ready: boolean}[] | undefined)?.every(status => status.ready)) available++;
      continue;
    }
    const pod: Resource = {
      apiVersion: "v1",
      kind: "Pod",
      metadata: {
        name: prefix + index,
        namespace,
        creationTimestamp: new Date(clusterTime()).toISOString(),
        labels: structuredClone(template.metadata?.labels ?? {}),
        annotations: structuredClone(template.metadata?.annotations ?? {}),
      },
      spec: structuredClone(template.spec),
    };
    try {
      admitResource(pod, false);
      S.cluster.resources.push(pod);
      const statuses = pod.status?.containerStatuses as { ready: boolean }[];
      if (statuses.every((status) => status.ready)) available++;
      auditRequest(
        "create",
        "pods",
        namespace,
        pod.metadata.name,
        201,
        "",
        "system:serviceaccount:kube-system:replicaset-controller",
      );
    } catch (error) {
      failedCreates++;
      const message = (error as Error).message.replace(
        /^Error from server \(Forbidden\): /,
        "",
      );
      auditRequest(
        "create",
        "pods",
        namespace,
        pod.metadata.name,
        403,
        message,
        "system:serviceaccount:kube-system:replicaset-controller",
      );
      S.cluster.events.push({
        apiVersion: "v1",
        kind: "Event",
        metadata: {
          name: `${deployment.metadata.name}.${S.cluster.events.length + 1}`,
          namespace,
          creationTimestamp: new Date(clusterTime()).toISOString(),
        },
        firstTimestamp: new Date(clusterTime()).toISOString(),
        lastTimestamp: new Date(clusterTime()).toISOString(),
        count: 1,
        source: { component: "replicaset-controller" },
        reason: "FailedCreate",
        message: "Error creating: " + message,
        involvedObject: {
          kind: "ReplicaSet",
          name: deployment.metadata.name + "-sim",
        },
        type: "Warning",
      });
    }
  }
  deployment.status = {
    replicas,
    updatedReplicas: S.cluster.resources.filter(
      (p) =>
        p.kind === "Pod" &&
        p.metadata.namespace === namespace &&
        p.metadata.name.startsWith(prefix),
    ).length,
    readyReplicas: available,
    availableReplicas: available,
    conditions:
      available < replicas
        ? failedCreates
          ? [{ type: "ReplicaFailure", status: "True", reason: "FailedCreate" }]
          : [
              {
                type: "Available",
                status: "False",
                reason: "MinimumReplicasUnavailable",
              },
            ]
        : [{ type: "Available", status: "True" }],
  };
}

export function applyResource(
  input: Resource,
  namespace: string,
  createOnly = false,
  operation?: "create" | "patch" | "update",
  reconcile = true,
) {
  synchronizeClusterMetadata();
  refreshResourceTypes();
  let resource = structuredClone(input);
  normalizeSecret(resource);
  const type = (Object.keys(resourceTypes) as ResourceType[]).find(
    (type) => resourceTypes[type].kind === resource.kind,
  );
  if (!type)
    throw new Error(
      `simulation: resource kind ${resource.kind} is not implemented`,
    );
  if (
    !resource.metadata?.name ||
    !/^[a-z0-9]([-a-z0-9.]*[a-z0-9])?$/.test(resource.metadata.name)
  )
    throw new Error(
      "Error from server (Invalid): metadata.name must be a valid lowercase resource name",
    );
  if (resource.apiVersion !== resourceTypes[type].apiVersion)
    throw new Error(
      `error: no matches for kind "${resource.kind}" in version "${resource.apiVersion}"`,
    );
  const ns = resourceTypes[type].namespaced
    ? (resource.metadata.namespace ?? namespace)
    : undefined;
  if (
    ns === "payments" &&
    (resource.metadata.name === "payment-api" ||
      resource.metadata.name.startsWith("payment-api-") ||
      resource.kind === "NetworkPolicy")
  )
    throw new Error(
      "simulation: original Ghost Route infrastructure is changed through its environment-removal and predefined policy operations",
    );
  if (ns) resource.metadata.namespace = ns;
  const pool =
    type === "securitycontextconstraints"
      ? S.cluster.sccs
      : type === "events"
        ? S.cluster.events
        : S.cluster.resources;
  const old = pool.find(
    (item) =>
      item.kind === resource.kind &&
      item.metadata.name === resource.metadata.name &&
      item.metadata.namespace === ns,
  );
  const previousTemplate = JSON.stringify(old?.spec?.template);
  const previousReplicas = old?.spec?.replicas ?? 1;
  if (old && !createOnly && operation === undefined) {
    // Apply preserves admission-generated/defaulted fields that the manifest did not own.
    resource = (strategicSchemas[resource.kind]
      ? strategicPatch(resource.kind, old, resource)
      : mergePatch(old, resource)) as Resource;
  }
  resource.metadata.creationTimestamp =
    old?.metadata.creationTimestamp ?? new Date(clusterTime()).toISOString();
  const verb = operation ?? (old ? "patch" : "create");
  if (!authorized(verb, type, ns, resource.metadata.name)) {
    const message = forbidden(verb, type, ns, resource.metadata.name);
    auditRequest(verb, type, ns, resource.metadata.name, 403, message);
    throw new Error(message);
  }
  if (old && createOnly)
    throw new Error(
      `Error from server (AlreadyExists): ${type} "${resource.metadata.name}" already exists`,
    );
  if (old && resource.metadata.uid && resource.metadata.uid !== old.metadata.uid)
    throw new Error(`Error from server (Conflict): ${type} "${resource.metadata.name}" UID precondition failed`);
  if (old && resource.metadata.resourceVersion && resource.metadata.resourceVersion !== old.metadata.resourceVersion)
    throw new Error(`Error from server (Conflict): Operation cannot be fulfilled on ${type} "${resource.metadata.name}": the object has been modified; please apply your changes to the latest version and try again`);
  if (old) validateResourceUpdate(old, resource);
  if (
    ns &&
    !S.cluster.resources.some(
      (item) => item.kind === "Namespace" && item.metadata.name === ns,
    )
  )
    throw new Error(
      `Error from server (NotFound): namespaces "${ns}" not found`,
    );
  if (
    resource.kind === "Pod" &&
    (!resource.spec?.containers?.length ||
      resource.spec.containers.some(
        (container) => !container.image || !container.name,
      ))
  )
    throw new Error(
      "Error from server (Invalid): Pod requires named containers with images",
    );
  if (
    resource.kind === "Deployment" &&
    (!resource.spec?.template?.spec.containers?.length ||
      (resource.spec.replicas ?? 1) < 0 ||
      (resource.spec.replicas ?? 1) > 10)
  )
    throw new Error(
      "simulation: Deployment requires a Pod template and 0–10 replicas",
    );
  if (resource.kind === "CustomResourceDefinition") {
    const spec = resource.spec ?? {},
      versions: any[] = spec.versions ?? [];
    if (
      !spec.group ||
      !spec.names?.plural ||
      !spec.names.kind ||
      !["Namespaced", "Cluster"].includes(spec.scope) ||
      resource.metadata.name !== `${spec.names.plural}.${spec.group}`
    )
      throw new Error(
        "Error from server (Invalid): CustomResourceDefinition requires matching metadata.name, group, names and scope",
      );
    if (Object.hasOwn(resourceTypes, spec.names.plural) && !old)
      throw new Error(
        "Error from server (Invalid): resource name is already registered",
      );
    if (
      !old &&
      Object.values(resourceTypes).some((d) => d.kind === spec.names.kind)
    )
      throw new Error(
        "simulation: custom CRDs with a kind already used by another API group are not implemented",
      );
    if (
      versions.length !== 1 ||
      !versions[0].served ||
      !versions[0].storage ||
      !versions[0].schema?.openAPIV3Schema
    )
      throw new Error(
        "simulation: custom CRDs currently require one served storage version with an OpenAPI schema",
      );
    validateCustomSchema(versions[0].schema.openAPIV3Schema);
    for (const column of versions[0].additionalPrinterColumns ?? []) {
      if (
        !column.name ||
        !column.jsonPath ||
        !["string", "integer", "number", "boolean", "date"].includes(
          column.type,
        )
      )
        throw new Error(
          "Error from server (Invalid): invalid additionalPrinterColumns",
        );
      jsonPathValues({}, column.jsonPath);
    }
    resource.status = {
      acceptedNames: spec.names,
      storedVersions: [versions[0].name],
      conditions: [
        { type: "NamesAccepted", status: "True" },
        { type: "Established", status: "True" },
      ],
    };
  }
  const definition = S.cluster.resources.find(
    (r) =>
      r.kind === "CustomResourceDefinition" && r.spec?.names?.plural === type,
  );
  if (
    definition &&
    !installedCrds.some((crd) => crd.metadata.name === definition.metadata.name)
  )
    validateCustomResource(
      resource,
      definition.spec!.versions[0].schema.openAPIV3Schema,
    );
  if (resource.kind === "SecurityContextConstraints") {
    if (defaultSccs.some((scc) => scc.metadata.name === resource.metadata.name))
      throw new Error(
        "simulation: default SCC modification is protected; apply a custom SCC",
      );
    const scc = resource as Scc;
    if (
      !scc.runAsUser ||
      !["MustRunAs", "MustRunAsRange", "RunAsAny", "MustRunAsNonRoot"].includes(
        scc.runAsUser.type,
      )
    )
      throw new Error(
        "Error from server (Invalid): SCC requires a supported runAsUser strategy",
      );
    if (
      scc.runAsUser.type === "MustRunAs" &&
      !Number.isInteger(scc.runAsUser.uid)
    )
      throw new Error("Error from server (Invalid): MustRunAs requires a UID");
    // Do not claim to simulate permissive host/privileged profiles.
    if (
      scc.allowPrivilegedContainer ||
      scc.allowHostNetwork ||
      scc.allowHostPID ||
      scc.allowHostIPC ||
      scc.allowHostDirVolumePlugin
    )
      throw new Error(
        "simulation: custom privileged/host-access SCCs are not implemented",
      );
  }
  if (
    ["Role", "RoleBinding"].includes(resource.kind) &&
    S.cluster.user !== "platform-admin"
  )
    throw new Error(forbidden(verb, type, ns));
  if (resource.kind === "Role" && !Array.isArray(resource.rules))
    throw new Error("Error from server (Invalid): Role requires rules");
  if (
    resource.kind === "RoleBinding" &&
    (!Array.isArray(resource.subjects) || !resource.roleRef)
  )
    throw new Error(
      "Error from server (Invalid): RoleBinding requires subjects and roleRef",
    );
  if (resource.kind === "Pod" && !old) {
    try {
      admitResource(resource, true, reconcile);
    } catch (error) {
      auditRequest(
        verb,
        type,
        ns,
        resource.metadata.name,
        403,
        (error as Error).message,
      );
      throw error;
    }
  }
  if (old && resource.kind === "Pod") {
    if (resource.spec?.containers?.some((container, i) => container.image !== old.spec?.containers?.[i]?.image)) startPod(resource, old);
    else resource.status = structuredClone(old.status);
  }
  if (resource.kind === "Service") {
    resource.spec ??= {};
    resource.spec.type ??= "ClusterIP";
    if (resource.spec.type !== "ExternalName") {
      resource.spec.clusterIP ??=
        old?.spec?.clusterIP ??
        `172.30.0.${20 + S.cluster.resources.filter((r) => r.kind === "Service").length}`;
      resource.spec.clusterIPs ??= [resource.spec.clusterIP];
    }
    for (const port of resource.spec.ports ?? []) port.protocol ??= "TCP";
  }
  if (resource.kind === "Secret") resource.type ??= "Opaque";
  if (resource.kind === "Route") {
    resource.spec!.wildcardPolicy ??= "None";
    resource.spec!.host ??=
      old?.spec?.host ??
      `${resource.metadata.name}-${ns}.apps.prod-east.example.test`;
  }
  if (resource.kind === "Namespace" && !old) {
    const base = 1000780000 + S.cluster.generation++ * 10000;
    resource.metadata.annotations = {
      ...resource.metadata.annotations,
      "openshift.io/sa.scc.uid-range": `${base}/10000`,
    };
    resource.status = { phase: "Active" };
    S.cluster.ownedNamespaces.add(resource.metadata.name);
    S.cluster.resources.push({
      apiVersion: "v1",
      kind: "ServiceAccount",
      metadata: { name: "default", namespace: resource.metadata.name },
    });
  }
  if (old) {
    for (const key of Object.keys(old)) delete old[key];
    Object.assign(old, resource);
  }
  else pool.push(resource as Scc);
  auditRequest(verb, type, ns, resource.metadata.name, old ? 200 : 201);
  if (reconcile && resource.kind === "Deployment" && (!old || previousTemplate !== JSON.stringify(resource.spec?.template) || previousReplicas !== (resource.spec?.replicas ?? 1)))
    reconcileDeployment(old ?? resource, !old || previousTemplate !== JSON.stringify(resource.spec?.template));
  refreshResourceTypes();
  if (reconcile) reconcileFixtureControllers();
  synchronizeClusterMetadata();
  return `${resource.kind.toLowerCase()}${resource.apiVersion.includes("/") ? "." + resource.apiVersion.split("/")[0] : ""}/${resource.metadata.name} ${old ? "configured" : "created"}`;
}

export function grantScc(
  name: string,
  sa: string,
  namespace: string,
  remove = false,
) {
  if (!authorized("create", "rolebindings", namespace)) {
    const message = forbidden("create", "rolebindings", namespace);
    auditRequest(
      "create",
      "rolebindings",
      namespace,
      "system:openshift:scc:" + name,
      403,
      message,
    );
    throw new Error(message);
  }
  if (
    defaultSccs.some((scc) => scc.metadata.name === name) &&
    !["restricted-v3", "restricted-v2", "nonroot-v2", "anyuid"].includes(name)
  )
    throw new Error(
      `simulation: admission using the ${name} SCC is not implemented`,
    );
  if (!S.cluster.sccs.some((scc) => scc.metadata.name === name))
    throw new Error(
      `Error from server (NotFound): securitycontextconstraints.security.openshift.io "${name}" not found`,
    );
  if (
    !S.cluster.resources.some(
      (item) =>
        item.kind === "ServiceAccount" &&
        item.metadata.namespace === namespace &&
        item.metadata.name === sa,
    )
  )
    throw new Error(
      `Error from server (NotFound): serviceaccounts "${sa}" not found`,
    );
  const bindingName = "system:openshift:scc:" + name;
  let binding = S.cluster.resources.find(
    (item) =>
      item.kind === "RoleBinding" &&
      item.metadata.namespace === namespace &&
      item.metadata.name === bindingName,
  );
  if (!binding && !remove) {
    binding = {
      apiVersion: "rbac.authorization.k8s.io/v1",
      kind: "RoleBinding",
      metadata: { name: bindingName, namespace },
      roleRef: {
        apiGroup: "rbac.authorization.k8s.io",
        kind: "ClusterRole",
        name: bindingName,
      },
      subjects: [],
    };
    S.cluster.resources.push(binding);
  }
  if (binding) {
    const subjects = (
      binding.subjects as { kind: string; name: string; namespace: string }[]
    ).filter(
      (subject) =>
        !(
          subject.kind === "ServiceAccount" &&
          subject.name === sa &&
          subject.namespace === namespace
        ),
    );
    if (!remove) subjects.push({ kind: "ServiceAccount", name: sa, namespace });
    binding.subjects = subjects;
  }
  auditRequest(
    remove ? "delete" : "create",
    "rolebindings",
    namespace,
    "system:openshift:scc:" + name,
    200,
  );
  return `clusterrole.rbac.authorization.k8s.io/system:openshift:scc:${name} ${remove ? "removed" : "added"}: "${sa}"`;
}

export function deleteResource(
  type: ResourceType,
  name: string,
  namespace: string,
) {
  const ns = resourceTypes[type].namespaced ? namespace : undefined;
  if (!authorized("delete", type, ns, name))
    throw new Error(forbidden("delete", type, ns, name));
  refreshResourceTypes();
  const target = [
    ...coreResources(),
    ...S.cluster.resources,
    ...S.cluster.sccs,
    ...S.cluster.events,
  ].find(
    (item) =>
      item.kind === resourceTypes[type].kind &&
      item.metadata.name === name &&
      item.metadata.namespace === ns,
  );
  if (!target)
    throw new Error(
      `Error from server (NotFound): ${type} "${name}" not found`,
    );
  if (
    coreResources().some(
      (item) =>
        item.kind === target.kind &&
        item.metadata.name === name &&
        item.metadata.namespace === ns,
    ) ||
    (["default", "payments", "openshift-dns"].includes(name) &&
      type === "namespaces")
  )
    throw new Error(
      "simulation: deleting original Ghost Route infrastructure is not implemented",
    );
  if (
    type === "securitycontextconstraints" &&
    defaultSccs.some((scc) => scc.metadata.name === name)
  )
    throw new Error("simulation: deleting default SCCs is protected");
  S.cluster.resources = S.cluster.resources.filter(
    (item) =>
      item !==
        S.cluster.resources.find(
          (r) =>
            r.kind === target.kind &&
            r.metadata.name === name &&
            r.metadata.namespace === ns,
        ) && !(type === "namespaces" && item.metadata.namespace === name) &&
        !(type === "deployments" && item.kind === "Pod" && item.metadata.namespace === ns && item.metadata.name.startsWith(name + "-sim-")),
  );
  if (type === "events" || type === "namespaces")
    S.cluster.events = S.cluster.events.filter((event) =>
      type === "namespaces"
        ? event.metadata.namespace !== name
        : !(event.metadata.name === name && event.metadata.namespace === ns),
    );
  if (type === "securitycontextconstraints")
    S.cluster.sccs = S.cluster.sccs.filter(
      (item) => item.metadata.name !== name,
    );
  if (type === "customresourcedefinitions")
    S.cluster.resources = S.cluster.resources.filter(
      (r) =>
        r.kind !== target.spec?.names?.kind ||
        r.apiVersion.split("/")[0] !== target.spec?.group,
    );
  refreshResourceTypes();
  reconcileFixtureControllers();
  synchronizeClusterMetadata();
  auditRequest("delete", type, ns, name, 200);
  return `${target.kind.toLowerCase()} "${name}" deleted`;
}

export function restartDeployment(name: string, namespace: string) {
  const deployment = S.cluster.resources.find(
    (item) =>
      item.kind === "Deployment" &&
      item.metadata.namespace === namespace &&
      item.metadata.name === name,
  );
  if (!deployment)
    throw new Error(
      `Error from server (NotFound): deployments.apps "${name}" not found`,
    );
  if (!authorized("patch", "deployments", namespace))
    throw new Error(forbidden("patch", "deployments", namespace));
  reconcileDeployment(deployment);
  auditRequest("patch", "deployments", namespace, name, 200);
  return `deployment.apps/${name} restarted`;
}
