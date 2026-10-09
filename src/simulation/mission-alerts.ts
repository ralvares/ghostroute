import { S } from "./state.js";
import { succeeded } from "../release/tekton.js";
export interface MissionAlert {
  key: string;
  who: "KAI" | "MIRA" | "RHEA" | "VALE";
  title: string;
  cause: string;
  next: string;
}
/** Current actionable consequence; failed history does not imply a current service outage. */
export function missionAlert(): MissionAlert | undefined {
  const ns = S.campaign.active
    ? "rs-" + String(S.campaign.active + 1).padStart(2, "0")
    : "payments";
  const pods = S.cluster.resources.filter(
    (r) =>
      r.kind === "Pod" &&
      r.metadata.namespace === ns &&
      !["Succeeded", "Failed"].includes(String(r.status?.phase)),
  );
  for (const pod of pods) {
    const state =
      (pod.status?.containerStatuses as any[])?.find((c) => c.state?.waiting)
        ?.state.waiting ??
      (pod.status?.conditions as any[])?.find(
        (c) => c.type === "PodScheduled" && c.status === "False",
      );
    if (state)
      return {
        key: pod.metadata.uid + state.reason,
        who: state.reason === "ImagePullBackOff" ? "VALE" : "KAI",
        title: `WORKLOAD BLOCKED · ${state.reason}`,
        cause: `${ns}/${pod.metadata.name}: ${state.message ?? "container has not started"}`,
        next:
          state.reason === "ImagePullBackOff"
            ? "Inspect the Pod events and imagePullSecrets. The bastion login does not repair kubelet credentials."
            : state.message?.includes("primary user-defined network")
              ? "Inspect oc get udn -n " +
                ns +
                " -o yaml. This namespace waits for its primary network."
              : state.message?.includes("runtime") ||
                  state.message?.includes("RuntimeHandler")
                ? "Inspect the RuntimeClass, node selector and Node runtimeHandlers. A RuntimeClass cannot install a missing runtime. SCC remains a separate admission check."
                : state.reason === "ContainerCreating"
                  ? "Inspect the Pod volumes, SecretProviderClass, CSIDriver and CSINode registration. Check provider authentication and the requested key."
                  : state.reason === "Unschedulable"
                    ? "Inspect the RuntimeClass scheduling selector and the eligible Node labels. No node has been assigned; changing a label does not install a runtime."
                    : state.reason === "CreateContainerConfigError"
                      ? "Inspect the referenced Secret and key. After rotation, restart an environment consumer; mounting a Secret alone does not refresh startup environment."
                      : "Inspect the Pod logs and security context. Check the application fix before broadening an SCC grant.",
      };
  }
  const app = S.cluster.resources.find(
    (r) => r.kind === "Application" && r.metadata.name === "payment-api",
  );
  if (app) {
    const condition = (app.status?.conditions as any[])?.[0],
      operation = app.status?.operationState as any,
      sync = app.status?.sync as any;
    if (
      condition ||
      operation?.phase === "Failed" ||
      sync?.status === "OutOfSync"
    )
      return {
        key: app.metadata.uid + JSON.stringify([condition, sync, operation]),
        who: "MIRA",
        title:
          condition || operation?.phase === "Failed"
            ? "GITOPS SYNC BLOCKED"
            : "GITOPS DRIFT DETECTED",
        cause:
          condition?.message ??
          (operation?.phase === "Failed"
            ? operation.message
            : "Live resources differ from the desired pushed revision."),
        next: "Inspect Application status, its AppProject and controller logs. Check the remote YAML and sync policy; fix the cause before requesting another sync.",
      };
  }
  if (S.campaign.active === 17) {
    const runs = S.cluster.resources
      .filter(
        (r) => r.kind === "PipelineRun" && r.metadata.namespace === "rs-18",
      )
      .sort(
        (a, b) =>
          Date.parse(String(b.status?.startTime)) -
          Date.parse(String(a.status?.startTime)),
      );
    const latest = runs[0];
    if (latest && !succeeded(latest))
      return {
        key: latest.metadata.uid ?? latest.metadata.name,
        who: "KAI",
        title: "RELEASE BLOCKED",
        cause:
          (latest.status?.conditions as any[])?.[0]?.message ??
          "The pipeline did not succeed.",
        next: "Read tkn pr logs --last -n rs-18 and TaskRun step exit codes. Repair the dependency, commit it, and push. Local edits cannot change a remote build.",
      };
    if (latest && app) {
      const image = (latest.status?.results as any[])?.find(
          (r) => r.name === "image",
        )?.value,
        live = S.cluster.resources.find(
          (r) =>
            r.kind === "Deployment" &&
            r.metadata.namespace === "payments" &&
            r.metadata.name === "payment-api",
        )?.spec?.template?.spec.containers[0].image;
      if (image && live !== image)
        return {
          key: "promotion-" + image,
          who: "MIRA",
          title: "PROMOTION PENDING",
          cause:
            "The release gate passed, but payment-api still uses " + live + ".",
          next: "Promote the reviewed image in deploy/payment-api.yaml, commit and push the manifest. CI completion alone does not change GitOps desired state.",
        };
    }
  }
  const recent = S.cluster.audit.at(-1);
  if (
    recent?.responseStatus.code === 403 &&
    recent.annotations?.["authorization.k8s.io/decision"] === "forbid"
  )
    return {
      key: "rbac-" + recent.auditID,
      who: "RHEA",
      title: "ACCESS DENIED",
      cause:
        recent.annotations?.["authorization.k8s.io/reason"] ??
        "This identity lacks permission for the requested API operation.",
      next:
        recent.objectRef.resource === "namespaces" && recent.verb === "create"
          ? "Use oc new-project for self-provisioning. Direct Namespace creation requires a cluster grant."
          : "Inspect oc auth can-i and the relevant RoleBinding. Cluster changes require the separate credential sealed in the archive; use it only for the necessary administrative step.",
    };
  const write = S.cluster.audit
    .filter(
      (e) =>
        e.objectRef.namespace === ns &&
        ["create", "patch", "update", "delete"].includes(e.verb),
    )
    .at(-1);
  if (
    write &&
    write.responseStatus.code >= 400 &&
    write.responseStatus.message?.includes("unable to validate")
  )
    return {
      key: write.auditID,
      who: "MIRA",
      title: "SCC ADMISSION BLOCKED",
      cause: write.responseStatus.message,
      next: "Read the rejected fields. Fix the owned application for restricted-v3, or justify a narrowly scoped vendor exception.",
    };
  const failed = Object.entries(S.campaign.proofs).find(([, p]) => !p.passed);
  if (failed)
    return {
      key: "probe-" + failed[0],
      who: "RHEA",
      title: "MISSION CHECK FAILED · " + failed[0],
      cause: failed[1].detail,
      next: "Review case status, inspect the relevant resources, repair the control, then repeat this check. A negative test must prove the forbidden action is denied.",
    };
  return undefined;
}
