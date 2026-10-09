import { parseAllDocuments } from "yaml";
import { S } from "../simulation/state.js";
import type { Resource } from "../simulation/cluster-model.js";
import {
  applyResource,
  deleteResource,
  clusterTime,
} from "../simulation/cluster-api.js";
import { resolveResource } from "../simulation/resource-types.js";
import { resolveRemote } from "../release/repository.js";
import { record } from "../simulation/operations.js";
let reconciling = false;
const key = (r: Resource) =>
  [r.apiVersion, r.kind, r.metadata.namespace ?? "", r.metadata.name].join("|");
const get = (kind: string, name: string, namespace: string) =>
  S.cluster.resources.find(
    (r) =>
      r.kind === kind &&
      r.metadata.name === name &&
      r.metadata.namespace === namespace,
  );
function equalDesired(desired: any, live: any): boolean {
  if (Array.isArray(desired))
    return (
      Array.isArray(live) &&
      desired.length === live.length &&
      desired.every((v, i) => equalDesired(v, live[i]))
    );
  if (desired && typeof desired === "object")
    return (
      !!live &&
      Object.entries(desired).every(([k, v]) => equalDesired(v, live[k]))
    );
  return desired === live;
}
const glob = (pattern: string, value: string) =>
  new RegExp(
    "^" +
      pattern
        .split("*")
        .map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
        .join(".*") +
      "$",
  ).test(value);
function log(app: Resource, message: string) {
  S.cluster.gitops.logs.push(
    `time="${new Date(clusterTime()).toISOString()}" level=info msg=${JSON.stringify(message)} application=${app.metadata.namespace}/${app.metadata.name}`,
  );
  if (S.cluster.gitops.logs.length > 100) S.cluster.gitops.logs.shift();
}
function health(r: Resource | undefined) {
  if (!r) return "Missing";
  if (r.kind === "Deployment")
    return Number(
      r.status?.availableReplicas ?? r.status?.readyReplicas ?? 0,
    ) >= Number(r.spec?.replicas ?? 1)
      ? "Healthy"
      : "Progressing";
  if (r.kind === "Pod")
    return r.status?.phase === "Failed"
      ? "Degraded"
      : r.status?.phase === "Running"
        ? "Healthy"
        : "Progressing";
  return "Healthy";
}
/** Plain YAML source reconciliation through existing admission, RBAC, rollout and audit models. */
export function reconcileGitOps() {
  if (reconciling) return;
  reconciling = true;
  try {
    for (const app of S.cluster.resources.filter(
      (r) => r.kind === "Application",
    )) {
      const id = app.metadata.namespace + "/" + app.metadata.name,
        previous = app.status;
      try {
        const spec = app.spec!,
          source = spec.source,
          project = get(
            "AppProject",
            spec.project ?? "default",
            app.metadata.namespace!,
          );
        if (
          !source ||
          spec.sources ||
          source.helm ||
          source.kustomize ||
          source.plugin
        )
          throw new Error(
            "simulation: GitOps currently renders a single plain-YAML directory source",
          );
        if (!project)
          throw new Error(
            `application references project ${spec.project ?? "default"} which does not exist`,
          );
        const namespace = spec.destination?.namespace,
          server = spec.destination?.server;
        if (
          !(project.spec?.sourceRepos ?? []).some((p: string) =>
            glob(p, source.repoURL),
          )
        )
          throw new Error(
            `application repo ${source.repoURL} is not permitted in project '${project.metadata.name}'`,
          );
        if (
          !(project.spec?.destinations ?? []).some(
            (d: any) => glob(d.namespace, namespace) && glob(d.server, server),
          )
        )
          throw new Error(
            `application destination server '${server}' and namespace '${namespace}' do not match any of the allowed destinations in project '${project.metadata.name}'`,
          );
        if (server !== "https://kubernetes.default.svc")
          throw new Error(
            "simulation: only the prod-east destination is authored",
          );
        if (source.repoURL !== S.cluster.sourceRepository.url)
          throw new Error(
            "simulation: no authored Git source for " + source.repoURL,
          );
        if (
          !source.path ||
          source.path.startsWith("/") ||
          source.path.split("/").includes("..")
        )
          throw new Error(
            "application source path must be a relative repository directory",
          );
        const revision = (app.operation as any)?.sync
          ? ((app.operation as any).sync.revision ?? source.targetRevision)
          : source.targetRevision;
        const commit = resolveRemote(
          S.cluster.sourceRepository,
          revision ?? "main",
        );
        if (
          !Object.keys(commit.files).some((k) =>
            k.startsWith(source.path + "/"),
          )
        )
          throw new Error("application path does not exist: " + source.path);
        const desired: Resource[] = [];
        for (const [file, text] of Object.entries(commit.files))
          if (file.startsWith(source.path + "/") && /\.ya?ml$/.test(file)) {
            if (
              !source.directory?.recurse &&
              file.slice(source.path.length + 1).includes("/")
            )
              continue;
            for (const doc of parseAllDocuments(text)) {
              if (doc.errors.length) throw new Error(doc.errors[0].message);
              const input = doc.toJSON();
              if (!input) continue;
              if (!input.apiVersion || !input.kind || !input.metadata?.name)
                throw new Error("manifest lacks apiVersion/kind/metadata.name");
              const type = resolveResource(input.kind);
              if (!type)
                throw new Error(
                  `simulation: unsupported GitOps resource ${input.kind}`,
                );
              const group = input.apiVersion.includes("/")
                ? input.apiVersion.split("/")[0]
                : "";
              if (
                input.metadata.namespace &&
                input.metadata.namespace !== namespace
              )
                throw new Error(
                  `manifest namespace ${input.metadata.namespace} differs from the application destination`,
                );
              const allowed = project.spec?.namespaceResourceWhitelist ?? [
                { group: "*", kind: "*" },
              ];
              if (
                !allowed.some(
                  (a: any) => glob(a.group, group) && glob(a.kind, input.kind),
                )
              )
                throw new Error(
                  `resource ${input.kind} is not permitted in project ${project.metadata.name}`,
                );
              if (
                ![
                  "Deployment",
                  "Service",
                  "ConfigMap",
                  "NetworkPolicy",
                ].includes(input.kind)
              )
                throw new Error(
                  `simulation: GitOps reconciliation of ${input.kind} is not implemented`,
                );
              input.metadata.namespace = namespace;
              input.metadata.annotations = {
                ...input.metadata.annotations,
                "argocd.argoproj.io/tracking-id": `${app.metadata.name}:${group}/${input.kind}:${namespace}/${input.metadata.name}`,
              };
              desired.push(input);
            }
          }
        const drift = desired.some(
          (r) =>
            !equalDesired(
              { spec: r.spec, data: r.data },
              {
                spec: get(r.kind, r.metadata.name, namespace)?.spec,
                data: get(r.kind, r.metadata.name, namespace)?.data,
              },
            ),
        );
        const absent = (S.cluster.gitops.managed[id] ?? []).filter(
          (k) => !desired.some((r) => key(r) === k),
        );
        const isOut = drift || absent.length > 0;
        const manual = (app.operation as any)?.sync,
          automated = spec.syncPolicy?.automated;
        const token =
          commit.sha +
          JSON.stringify({ source, destination: spec.destination });
        const canAuto =
          automated &&
          automated.enabled !== false &&
          (drift || (absent.length > 0 && automated.prune)) &&
          (automated.selfHeal || S.cluster.gitops.attempted[id] !== token) &&
          !(
            previous?.operationState &&
            (previous.operationState as any).phase === "Failed" &&
            S.cluster.gitops.attempted[id] === token
          );
        let operationState = previous?.operationState;
        if (manual || canAuto) {
          if (!manual && !desired.length && !automated?.allowEmpty)
            throw new Error(
              "automated sync will not prune the application because the desired state is empty and allowEmpty is false",
            );
          S.cluster.gitops.attempted[id] = token;
          const startedAt = new Date(clusterTime()).toISOString();
          log(
            app,
            `Initiated ${manual ? "" : "automated "}sync to '${commit.sha}'`,
          );
          let message = "successfully synced (all tasks run)",
            phase = "Succeeded";
          const results: any[] = [];
          const user = S.cluster.user;
          try {
            S.cluster.user =
              "system:serviceaccount:openshift-gitops:argocd-application-controller";
            for (const r of desired) {
              try {
                const replace =
                  spec.syncPolicy?.syncOptions?.includes("Replace=true") &&
                  !!get(r.kind, r.metadata.name, namespace);
                applyResource(
                  structuredClone(r),
                  namespace,
                  false,
                  replace ? "update" : undefined,
                  true,
                );
                results.push({
                  group: r.apiVersion.split("/")[0],
                  version: r.apiVersion.split("/").at(-1),
                  kind: r.kind,
                  namespace,
                  name: r.metadata.name,
                  status: "Synced",
                  message: `${r.kind.toLowerCase()}${r.apiVersion.includes("/") ? "." + r.apiVersion.split("/")[0] : ""}/${r.metadata.name} configured`,
                  syncPhase: "Sync",
                });
              } catch (e) {
                phase = "Failed";
                message = (e as Error).message;
                results.push({
                  kind: r.kind,
                  namespace,
                  name: r.metadata.name,
                  status: "SyncFailed",
                  message,
                  syncPhase: "Sync",
                });
                break;
              }
            }
            if (phase === "Succeeded" && (manual?.prune ?? automated?.prune))
              for (const k of absent) {
                const r = S.cluster.resources.find((r) => key(r) === k);
                if (r) {
                  const type = resolveResource(r.kind)!;
                  deleteResource(type, r.metadata.name, namespace);
                }
              }
          } finally {
            S.cluster.user = user;
          }
          if (phase === "Succeeded")
            S.cluster.gitops.managed[id] = [
              ...new Set([
                ...desired.map(key),
                ...((manual?.prune ?? automated?.prune) ? [] : absent),
              ]),
            ];
          operationState = {
            phase,
            message,
            startedAt,
            finishedAt: new Date(clusterTime()).toISOString(),
            operation: {
              sync: {
                revision: commit.sha,
                prune: !!(manual?.prune ?? automated?.prune),
              },
              initiatedBy: {
                ...(manual ? { username: user } : { automated: true }),
              },
            },
            syncResult: {
              revision: commit.sha,
              source: structuredClone(source),
              resources: results,
            },
          };
          delete app.operation;
          log(
            app,
            `Sync operation to ${commit.sha} ${phase.toLowerCase()}: ${message}`,
          );
        }
        const resources = desired.map((r) => {
          const live = get(r.kind, r.metadata.name, namespace);
          return {
            group: r.apiVersion.includes("/") ? r.apiVersion.split("/")[0] : "",
            version: r.apiVersion.split("/").at(-1),
            kind: r.kind,
            namespace,
            name: r.metadata.name,
            status: equalDesired(
              { spec: r.spec, data: r.data },
              { spec: live?.spec, data: live?.data },
            )
              ? "Synced"
              : "OutOfSync",
            health: { status: health(live) },
          };
        });
        for (const k of absent) {
          const r = S.cluster.resources.find((r) => key(r) === k);
          if (r)
            resources.push({
              group: r.apiVersion.includes("/")
                ? r.apiVersion.split("/")[0]
                : "",
              version: r.apiVersion.split("/").at(-1),
              kind: r.kind,
              namespace,
              name: r.metadata.name,
              status: "OutOfSync",
              health: { status: health(r) },
            });
        }
        const synced = resources.every((r) => r.status === "Synced");
        const healthStatus = resources.some(
          (r) => r.health.status === "Missing",
        )
          ? "Missing"
          : resources.some((r) => r.health.status === "Degraded")
            ? "Degraded"
            : resources.some((r) => r.health.status !== "Healthy")
              ? "Progressing"
              : "Healthy";
        app.status = {
          sync: {
            status: synced ? "Synced" : "OutOfSync",
            revision: commit.sha,
            comparedTo: {
              source: structuredClone(source),
              destination: structuredClone(spec.destination),
            },
          },
          health: { status: healthStatus },
          resources,
          conditions: [],
          reconciledAt: new Date(clusterTime()).toISOString(),
          ...(operationState ? { operationState } : {}),
          history: [...((previous?.history as any[]) ?? [])],
        };
        if (
          operationState &&
          (operationState as any).phase === "Succeeded" &&
          !(app.status.history as any[]).some((h) => h.revision === commit.sha)
        )
          (app.status.history as any[]).push({
            id: ++S.cluster.gitops.sequence,
            revision: commit.sha,
            deployedAt: (operationState as any).finishedAt,
            source: structuredClone(source),
          });
      } catch (e) {
        app.status = {
          ...previous,
          sync: { status: "Unknown" },
          health: {
            status: previous?.health
              ? (previous.health as any).status
              : "Unknown",
          },
          conditions: [
            {
              type: "ComparisonError",
              message: (e as Error).message,
              lastTransitionTime: new Date(clusterTime()).toISOString(),
            },
          ],
        };
        delete app.operation;
      }
      if (
        JSON.stringify([
          previous?.sync,
          previous?.health,
          previous?.conditions,
          previous?.operationState,
        ]) !==
        JSON.stringify([
          app.status?.sync,
          app.status?.health,
          app.status?.conditions,
          app.status?.operationState,
        ])
      )
        record(
          "controller.reconciled",
          {
            kind: "Application",
            namespace: app.metadata.namespace!,
            name: app.metadata.name,
            sync: String((app.status?.sync as any)?.status),
            health: String((app.status?.health as any)?.status),
          },
          "simulation",
        );
    }
  } finally {
    reconciling = false;
  }
}
