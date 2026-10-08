/** Authored fiction grounded in the deterministic incident; no real actor attribution. */
export const storyFiles = {
  "case/assignment.txt": `CASE 018 — THE GHOST ROUTE\n02:14 UTC. Checkout remains healthy, but every successful payment is followed by a signal to an address outside the approved baseline. Rhea has asked an independent investigator to find the cause before anybody shuts the service down.\n\nMeet Rhea for the RHACS incident report. Mira controls physical worker-room access. Kai handled the application release. Vale keeps the records archive. A maintenance keycard opens that archive. Return to the bastion with your evidence.\n\nAn API credential is not a human identity. A deviation is not proof of compromise. Protect customers while you determine what changed.\n`,
  "case/release-note.txt": `RELEASE DESK — KAI\n02:12 UTC. Payment image signed off. No external telemetry destination appears in the approved handover.\n02:14 UTC. Rhea reports an unexpected route after the release. I checked the image review, not the final Deployment environment. Compare the running configuration with the API change record before blaming the image.\n\nOwned applications must support arbitrary UIDs. For immutable vendor software, evaluate a dedicated identity and narrow SCC exception instead of weakening every workload.\n`,
  "case/archive-note.txt": `RECORDS DESK — VALE\nThe retained API event shows a patch by system:serviceaccount:payments:build-bot at 02:13:40 UTC. The request body added TELEMETRY_ENDPOINT. The record identifies the credential used; it does not establish who controlled it.\n\nI can give you a trail, not a culprit. Correlate the request, current configuration and actual application logs at the bastion.\n`,
};

export const incidentFiles = {
  "case/release-job.json":
    JSON.stringify(
      {
        sourceType: "authored-training-fixture",
        cluster: "prod-east",
        run: "release-184",
        step: "import-support-config",
        input: "support.env",
        reviewedAtPromotion: false,
        identity: "system:serviceaccount:payments:build-bot",
        request: {
          deployment: "payment-api",
          namespace: "payments",
          env: { TELEMETRY_ENDPOINT: "https://203.0.113.77/upload" },
        },
        response: {
          auditID: "00000000-0000-4000-8000-000000000000",
          code: 200,
        },
        time: "2026-10-08T02:13:40.000Z",
        disposition:
          "Delivery defect confirmed; no human attacker established.",
      },
      null,
      2,
    ) + "\n",
  "case/permission-review.yaml": `# Retained pre-incident permission review — authored fixture
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: release-bot
  namespace: payments
rules:
- apiGroups: [apps]
  resources: [deployments]
  verbs: [get, list, patch, update]
# No resourceNames restriction; build-bot was bound to this Role.
# Promotion imported support.env without reviewing Deployment settings.
`,
};
Object.assign(storyFiles, incidentFiles);
