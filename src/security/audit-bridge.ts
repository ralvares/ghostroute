import { subscribe } from "../simulation/events.js";
import { auditRequest } from "../simulation/cluster-api.js";
import { S } from "../simulation/state.js";

export function registerAuditBridge() {
  return subscribe((event) => {
    if (event.type === "deployment.updated")
      auditRequest("patch", "deployments", "payments", "payment-api", 200);
    if (event.type === "pods.replaced")
      for (const pod of S.pods)
        auditRequest(
          "create",
          "pods",
          "payments",
          pod.name,
          201,
          "",
          "system:serviceaccount:kube-system:replicaset-controller",
        );
    if (event.type === "policy.applied")
      auditRequest(
        "patch",
        "networkpolicies",
        "payments",
        String(event.data.name),
        200,
      );
  });
}
