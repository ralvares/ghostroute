import { reconcileGitOps } from "../gitops/controller.js";
import { failingPolicies } from "../security/rhacs/policies.js";
import { roleAllows } from "../security/rbac.js";
import { S } from "../simulation/state.js";
import type { Resource } from "../simulation/cluster-model.js";
import { synchronizeMetadata } from "../simulation/api-storage.js";
import { pipelineGate } from "../security/rhacs/policies.js";
import { resolveRemote, sourceArtifact } from "./repository.js";
import {
  releaseTasks,
  releasePipeline,
  releaseRun,
  releaseTriggers,
} from "./manifests.js";
import { simulationEpoch } from "../simulation/resource-table.js";
import { seedTimestamp } from "./source-fixture.js";

const get = (kind: string, name: string, ns: string) =>
  S.cluster.resources.find(
    (r) =>
      r.kind === kind &&
      r.metadata.name === name &&
      r.metadata.namespace === ns,
  );
export const succeeded = (r: Resource | undefined) =>
  (r?.status?.conditions as any[])?.find((c) => c.type === "Succeeded")
    ?.status === "True";
const same = (a: unknown, b: unknown) =>
  JSON.stringify(a) === JSON.stringify(b);
const condition = (ok: boolean, message: string) => [
  {
    type: "Succeeded",
    status: ok ? "True" : "False",
    reason: ok ? "Succeeded" : "Failed",
    message,
  },
];
/** Deterministic authored execution, with native Tekton API objects and immutable completed runs. */
export function reconcileTekton() {
  for (const run of S.cluster.resources.filter(
    (r) => r.kind === "PipelineRun",
  )) {
    if (run.status?.completionTime) continue;
    const ns = run.metadata.namespace!,
      name = run.metadata.name,
      pipe = get("Pipeline", run.spec?.pipelineRef?.name, ns);
    if (!pipe) {
      run.status = {
        conditions: [
          {
            type: "Succeeded",
            status: "False",
            reason: "CouldntGetPipeline",
            message: `Pipeline ${run.spec?.pipelineRef?.name} not found`,
          },
        ],
        completionTime: new Date(seedTimestamp * 1000).toISOString(),
      };
      continue;
    }
    const status: any = {
      conditions: [],
      pipelineSpec: structuredClone(pipe.spec),
      childReferences: [],
      skippedTasks: [],
      startTime: new Date(
        Math.max(
          Date.parse(run.metadata.creationTimestamp ?? "") || simulationEpoch,
          simulationEpoch + S.audit.length * 1000,
          ...S.cluster.resources
            .filter((r) => r.kind === "PipelineRun" && r.status?.completionTime)
            .map((r) => Date.parse(String(r.status!.completionTime)) + 1000),
        ),
      ).toISOString(),
    };
    S.cluster.tekton.sequence++;
    run.status = status;
    synchronizeMetadata(S.cluster.resources);
    const pvcName = name + "-source";
    if (
      run.spec?.workspaces?.some((w: any) => w.volumeClaimTemplate) &&
      !get("PersistentVolumeClaim", pvcName, ns)
    )
      S.cluster.resources.push({
        apiVersion: "v1",
        kind: "PersistentVolumeClaim",
        metadata: {
          name: pvcName,
          namespace: ns,
          ownerReferences: [
            {
              apiVersion: run.apiVersion,
              kind: run.kind,
              name,
              uid: run.metadata.uid!,
              controller: true,
            },
          ],
        },
        spec: {
          accessModes: ["ReadWriteOnce"],
          resources: { requests: { storage: "1Gi" } },
        },
        status: {
          phase: "Bound",
          capacity: { storage: "1Gi" },
          accessModes: ["ReadWriteOnce"],
        },
      });
    let clock = Date.parse(status.startTime),
      failure = "",
      commit = "",
      image = "",
      digest = "";
    const time = () => new Date(clock).toISOString();
    const tasks = pipe.spec?.tasks ?? [];
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i],
        template = releaseTasks.find(
          (t) => t.metadata.name === task.taskRef?.name,
        ),
        installed = get("Task", task.taskRef?.name, ns);
      if (failure) {
        status.skippedTasks.push({ name: task.name, reason: "StoppingSkip" });
        continue;
      }
      if (
        !template ||
        !same(installed?.spec, template.spec) ||
        !same(task, releasePipeline.spec!.tasks[i])
      ) {
        failure = `simulation: task ${task.name} or pipeline wiring is outside the authored execution contract`;
        status.skippedTasks.push({ name: task.name, reason: "StoppingSkip" });
        continue;
      }
      const serviceAccount =
        run.spec?.taskRunSpecs?.find(
          (s: any) => s.pipelineTaskName === task.name,
        )?.serviceAccountName ??
        run.spec?.taskRunTemplate?.serviceAccountName ??
        "default";
      if (
        !get("ServiceAccount", serviceAccount, ns) ||
        (task.name === "build" &&
          !roleAllows(
            `system:serviceaccount:${ns}:${serviceAccount}`,
            "use",
            "securitycontextconstraints",
            ns,
            "privileged",
          ))
      ) {
        failure = `simulation: ${task.name} requires its configured service account and builder SCC grant`;
        status.skippedTasks.push({ name: task.name, reason: "StoppingSkip" });
        continue;
      }
      const secrets =
        task.name === "build"
          ? ["release-registry"]
          : task.name === "scan"
            ? ["central-access"]
            : task.name === "sign"
              ? ["signing-key", "release-registry"]
              : [];
      if (secrets.some((name) => !get("Secret", name, ns))) {
        failure = "simulation: required Task credentials are missing";
        status.skippedTasks.push({ name: task.name, reason: "StoppingSkip" });
        continue;
      }
      let output = "",
        exitCode = 0,
        results: { name: string; type: string; value: string }[] = [];
      try {
        if (task.name === "fetch") {
          const params = run.spec?.params ?? [];
          const url =
            params.find((p: any) => p.name === "repo-url")?.value ??
            S.cluster.sourceRepository.url;
          if (url !== S.cluster.sourceRepository.url)
            throw new Error(
              "simulation: no authored remote repository for " + url,
            );
          const c = resolveRemote(
            S.cluster.sourceRepository,
            params.find((p: any) => p.name === "revision")?.value ?? "main",
          );
          commit = c.sha;
          output = `From ${url}\n * branch            ${commit} -> FETCH_HEAD\nHEAD is now at ${commit.slice(0, 7)} ${c.message}\n`;
          results = [{ name: "commit", type: "string", value: commit }];
        } else if (task.name === "build") {
          image = sourceArtifact(S.cluster.sourceRepository.commits[commit]);
          const gate = pipelineGate(image);
          digest = gate.digest;
          output = `STEP 1/11: FROM registry.access.redhat.com/ubi9/openjdk-17 AS build\nCOMMIT ${image}\nWriting manifest to image destination\n`;
          results = [
            { name: "image", type: "string", value: image },
            { name: "digest", type: "string", value: digest },
          ];
        } else if (task.name === "scan") {
          const gate = pipelineGate(image);
          exitCode = gate.exitCode;
          output = JSON.stringify(gate.policy, null, 2) + "\n";
          if (exitCode)
            output += `ERROR:\tchecking image failed: failed policies found: ${failingPolicies(gate.policy)} policies violated that are failing the check\n`;
          results = [
            { name: "check-exit", type: "string", value: String(exitCode) },
          ];
        } else if (task.name === "sign")
          output = `Pushing signature to: ${image.split(":")[0]}\n`;
      } catch (error) {
        exitCode = 1;
        output = (error as Error).message + "\n";
      }
      const trName = name + "-" + task.name,
        podName = trName + "-pod",
        started = time();
      clock += 1000;
      const finished = time(),
        step = template.spec!.steps[0];
      const tr: Resource = {
        apiVersion: "tekton.dev/v1",
        kind: "TaskRun",
        metadata: {
          name: trName,
          namespace: ns,
          creationTimestamp: started,
          labels: {
            "tekton.dev/pipelineRun": name,
            "tekton.dev/pipelineTask": task.name,
          },
          ownerReferences: [
            {
              apiVersion: run.apiVersion,
              kind: run.kind,
              name,
              uid: run.metadata.uid!,
              controller: true,
              blockOwnerDeletion: true,
            },
          ],
        },
        spec: {
          taskRef: { name: template.metadata.name },
          workspaces:
            template.spec?.workspaces?.map((w: any) => ({
              name: w.name,
              persistentVolumeClaim: { claimName: pvcName },
            })) ?? [],
          serviceAccountName: serviceAccount,
          params:
            task.name === "fetch"
              ? (run.spec?.params ?? [])
              : task.name === "scan"
                ? [{ name: "image", value: image }]
                : task.name === "sign"
                  ? [
                      { name: "image", value: image },
                      { name: "digest", value: digest },
                    ]
                  : [],
        },
        status: {
          conditions: condition(
            exitCode === 0,
            exitCode
              ? `"step-${step.name}" exited with code ${exitCode}`
              : "All Steps have completed executing",
          ),
          startTime: started,
          completionTime: finished,
          podName,
          taskSpec: structuredClone(template.spec),
          steps: [
            {
              name: step.name,
              container: "step-" + step.name,
              terminated: {
                exitCode,
                reason: exitCode ? "Error" : "Completed",
                startedAt: started,
                finishedAt: finished,
              },
            },
          ],
          results,
        },
      };
      S.cluster.resources.push(tr);
      synchronizeMetadata(S.cluster.resources);
      S.cluster.resources.push({
        apiVersion: "v1",
        kind: "Pod",
        metadata: {
          name: podName,
          namespace: ns,
          creationTimestamp: started,
          labels: {
            "tekton.dev/taskRun": trName,
            "tekton.dev/pipelineRun": name,
          },
          ownerReferences: [
            {
              apiVersion: tr.apiVersion,
              kind: tr.kind,
              name: trName,
              uid: tr.metadata.uid!,
              controller: true,
              blockOwnerDeletion: true,
            },
          ],
        },
        spec: {
          serviceAccountName: tr.spec!.serviceAccountName,
          restartPolicy: "Never",
          containers: [
            {
              name: "step-" + step.name,
              image: step.image,
              securityContext: step.securityContext,
            },
          ],
        },
        status: {
          phase: exitCode ? "Failed" : "Succeeded",
          containerStatuses: [
            {
              name: "step-" + step.name,
              image: step.image,
              ready: false,
              restartCount: 0,
              state: {
                terminated: {
                  exitCode,
                  reason: exitCode ? "Error" : "Completed",
                  startedAt: started,
                  finishedAt: finished,
                },
              },
            },
          ],
        },
      });
      S.cluster.tekton.logs[ns + "/" + podName] = {
        ["step-" + step.name]: output,
      };
      status.childReferences.push({
        apiVersion: "tekton.dev/v1",
        kind: "TaskRun",
        name: trName,
        pipelineTaskName: task.name,
      });
      if (exitCode) failure = `TaskRun ${trName} failed`;
    }
    if (tasks.length !== 4 && !failure)
      failure = "simulation: this pipeline task graph is not implemented";
    status.conditions = condition(
      !failure,
      failure || "Tasks Completed: 4 (Failed: 0, Cancelled: 0), Skipped: 0",
    );
    status.completionTime = time();
    status.results = !failure
      ? [
          { name: "commit", type: "string", value: commit },
          { name: "image", type: "string", value: image },
          { name: "digest", type: "string", value: digest },
        ]
      : [];
    synchronizeMetadata(S.cluster.resources);
  }
}
/** Only a configured binding + template + listener consumes this simulated remote push event. */
export function deliverPush(revision: string) {
  for (const listener of S.cluster.resources.filter(
    (r) => r.kind === "EventListener" && r.metadata.name === "release-push",
  )) {
    const ns = listener.metadata.namespace!;
    if (
      !same(listener.spec, releaseTriggers[2].spec) ||
      !same(
        get("TriggerBinding", "release-push", ns)?.spec,
        releaseTriggers[0].spec,
      ) ||
      !same(
        get("TriggerTemplate", "release-push", ns)?.spec,
        releaseTriggers[1].spec,
      )
    )
      continue;
    const name =
      "secure-release-" +
      revision.slice(0, 7) +
      "-" +
      String(S.cluster.tekton.sequence + 1).padStart(3, "0");
    S.cluster.resources.push(releaseRun(name, revision, ns));
    reconcileTekton();
  }
  reconcileGitOps();
}
export function taskPodLogs(
  namespace: string,
  name: string,
  container?: string,
) {
  if (
    namespace === "openshift-gitops" &&
    name === "argocd-application-controller-0"
  ) {
    if (container && container !== "application-controller")
      throw new Error(`container ${container} is not valid for pod ${name}`);
    return S.cluster.gitops.logs.join("\n") + "\n";
  }
  const logs = S.cluster.tekton.logs[namespace + "/" + name];
  if (!logs) return undefined;
  if (container) {
    if (!(container in logs))
      throw new Error(`container ${container} is not valid for pod ${name}`);
    return logs[container];
  }
  return Object.values(logs).join("");
}
