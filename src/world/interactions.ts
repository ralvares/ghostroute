import {centralPolicies} from "../security/rhacs/policies.js";
import { discover } from "./story.js";
import { scheduleSave } from "../simulation/persistence.js";
import { updateHUD } from "../ui/hud.js";
import { enterScene } from "./scenes.js";
import { S } from "../simulation/state.js";
import { G } from "../game/runtime.js";
import { esc } from "../ui/notifications.js";
import { toast } from "../ui/notifications.js";
import { worldObjects } from "../world/locations.js";
import { addClue } from "../security/evidence.js";
import { nearest } from "../game/movement.js";
import { closeRadio, radio } from "../characters/dialogue.js";
import { openTerminal } from "../terminal/shell.js";
import { openDetail, closeDetail } from "../ui/panels.js";
import type { WorldObject } from "../world/locations.js";
import {
  campaignInterview,
  discoverCampaignArtifact,
  showCampaignContext,
} from "../ui/campaign.js";

function unavailableDependencies() {
  return [!S.incidentNetwork.dns ? "DNS" : "", !S.incidentNetwork.ledger ? "ledger" : ""].filter(Boolean).join(" and ");
}

export function toggleTrace() {
  if (!S.started || G.detailOpen || G.endOpen) return;
  if (!S.world.scene.startsWith("worker")) {
    toast("Enter a worker room to trace its Pod connections.");
    return;
  }
  G.traceOn = !G.traceOn;
  G.traceEnd = performance.now() + 12500;
  toast(
    G.traceOn
      ? S.campaign.active
        ? "Trace Vision ON · use case tests at the bastion for this tenant’s recorded paths"
        : "Trace Vision ON · Follow the outbound path"
      : "Trace Vision OFF",
  );
  if (G.traceOn && !S.campaign.active) {
    const pod = worldObjects().find(
      (object) => object.id === "pod1" || object.id === "pod2",
    );
    if (pod && Math.hypot(S.x - pod.x, S.y - pod.y) < 170) {
      addClue("trace");
      S.traceFound = true;
    }
  }
}

export function interact(o: WorldObject | null = nearest()) {
  if (!o || !S.started || G.detailOpen || G.endOpen) return;
  closeRadio();
  if (S.campaign.active && o.id === "campaign-dossier") {
    discoverCampaignArtifact();
    return;
  }
  if (S.campaign.active && o.id === "worker-register") {
    showCampaignContext("register");
    return;
  }
  if (o.id === "mira" && S.world.scene === "soc" && !S.campaign.active) {
    radio(
      "MIRA",
      S.policy === "deny"
        ? `Checkout is offline. Restore ${unavailableDependencies()} from the bastion, then verify the required paths.`
        : "Checkout is back. Finish your verification; I will return to the cluster lobby when we leave the operations hub.",
    );
    return;
  }
  if (S.campaign.active && o.kind === "npc") {
    const who = o.art ?? o.id.split("-")[0];
    if (!campaignInterview(who)) showCampaignContext(who);
    return;
  }
  if (o.kind === "portal" && o.destination) {
    enterScene(o.destination);
    return;
  }
  if (o.id === "mira-reaction") {
    radio(
      "MIRA",
      `What did you do? Checkout is offline. ${S.deployment.readyReplicas}/${S.deployment.desiredReplicas} payment Pods are Ready; ${unavailableDependencies()} cannot be reached. Return to the bastion, inspect the active policies, and verify the required paths.`,
    );
    return;
  }
  if ((o.kind === "prop" || o.kind === "npc") && o.action) {
    const fresh = discover(S, o.action);
    if (fresh) {
      toast("Discovery added to journal · " + o.label);
      scheduleSave();
      updateHUD();
    }
    const content: Record<string, string> = {
      keycard: `<h2>Maintenance keycard found.</h2><p>Rhea left a physical access badge in the locker. It opens the records archive in the cluster corridor. Your inventory now contains the badge.</p><p>This key only opens a story room. It does not grant API permissions or SCC access.</p><img class="inventoryKey" src="${import.meta.env.BASE_URL}art/keycard.webp" alt="Maintenance access keycard">`,
      audit: `<h2>Who changed payment-api?</h2><p>The retained training audit event records a Deployment patch by <code>system:serviceaccount:payments:build-bot</code> at 02:13:40 UTC. Its request body includes the telemetry endpoint. A service account name identifies the API caller; it does not establish who controlled its credential.</p><pre class="journal">jq 'select(.verb == "patch" and .objectRef.name == "payment-api") | {auditID, user: .user.username, time: .requestReceivedTimestamp, request: .requestObject}' audit/kube-apiserver.log</pre><p>Run the query in your terminal. Compare the retained request with the current Deployment configuration. Then read <code>case/release-job.json</code>: its response auditID links the delivery job to this patch. Read <code>case/permission-review.yaml</code> to find the weak permission boundary. Use <code>case explain release-import</code> after correlating all three.</p>`,
      release: `<h2>The exporter was enabled.</h2><p>The incident's retained patch added <code>TELEMETRY_ENDPOINT=https://203.0.113.77/upload</code>. The application logs record a telemetry POST to this destination. They do not identify the request payload or establish malicious intent. Inspect both sources before changing the live simulation.</p><pre class="journal">oc logs deployment/payment-api -n payments
oc get deployment payment-api -n payments -o yaml</pre><p>Configuration can explain an unexpected flow. Investigate whether the change was approved; a deviation alone is not proof of an intruder.</p>`,
      image: `<h2>Build for an arbitrary UID.</h2><p>The owned application requests UID 0. Restricted SCC admission rejects that request. Repair the application and file permissions so it runs with the non-root UID selected by its SCC.</p><pre class="journal">cat workloads/Dockerfile.secure
cat workloads/owned-root.yaml
cat workloads/owned-secure.yaml</pre><p>For an immutable vendor image, investigate a dedicated service account and narrow custom SCC. RBAC controls who may use an SCC; the SCC checks the Pod security settings.</p>`,
      boundary: `<h2>Checkout needs two paths.</h2><p>Payment Pods need DNS and the internal ledger on TCP/8443. Default-deny blocks both paths until selecting policies permit them. Pod readiness can stay green while customer requests fail.</p><pre class="journal">cat policies/deny-all.yaml
cat policies/payments-egress.yaml</pre><p>Watch the live health map when you apply each policy. Then verify inside a Pod with real simulation connectivity tests.</p>`,
    };
    openDetail(
      `<div class="eyebrow">${o.kind === "npc" ? "INTERVIEW" : "DISCOVERY"} · ${esc(o.label)}</div>` +
        (o.kind === "npc"
          ? `<img class="interviewPortrait" src="${import.meta.env.BASE_URL}art/${o.art}.webp" alt="${esc(o.label)}">`
          : "") +
        (o.id === "kai" && !S.campaign.active && o.action === "release"
          ? `<h2>The release imported a support file.</h2><p>I handled delivery run <code>release-184</code>. Its support-config step imported an environment file after promotion review. I can explain the delivery path; Vale can help establish which API request actually changed production.</p><p>Read <code>case/release-job.json</code> at the bastion. Match its response auditID to the retained audit event, then compare the patched setting with the Deployment and application logs. Check <code>case/permission-review.yaml</code> for the permission that allowed the change.</p><p>Don't name an attacker from a service account. Determine whether the delivery record explains the patch.</p>`
          : content[o.action]) +
        `<button class="btnquiet" id="recordLead">Add this lead to notebook</button>` +
        (o.id === "kai" && !S.campaign.active && o.action === "release"
          ? `<button class="btnquiet" id="buildAdvice">Ask about application UID failures</button>`
          : ""),
    );
    document
      .getElementById("buildAdvice")
      ?.addEventListener("click", () => {
        closeDetail();
        interact({ ...o, action: "image" });
      });
    document.getElementById("recordLead")!.addEventListener("click", () => {
      const leads: Record<string, string> = {
        keycard: "Maintenance keycard: records archive in prod-east lobby.",
        audit:
          "Vale: build-bot patched payment-api at 02:13:40 UTC. Filter audit/kube-apiserver.log with jq; check requestObject. API identity alone is not attribution.",
        release:
          "Kai: release-184 imported a support environment file after review. Read case/release-job.json, match its auditID with the API event, and inspect case/permission-review.yaml. Compare the patched TELEMETRY_ENDPOINT with live configuration and logs.",
        image:
          "Kai: repair owned image for arbitrary UID. Compare workloads/owned-root.yaml and workloads/owned-secure.yaml; read workloads/Dockerfile.secure. Evaluate a narrow exception only for the immutable vendor.",
        boundary:
          "Mira: checkout requires DNS and ledger TCP/8443. Compare policies/deny-all.yaml with policies/payments-egress.yaml. Test allowed and blocked paths inside a Pod.",
      };
      const text = leads[o.action!];
      if (!S.story.notes.includes(text))
        S.story.notes += (S.story.notes ? "\n\n" : "") + text;
      scheduleSave();
      updateHUD();
      toast("Lead saved in your notebook.");
      (document.getElementById("recordLead") as HTMLButtonElement).disabled =
        true;
    });
    return;
  }
  if (o.id === "ops") {
    openTerminal();
    return;
  }
  if (o.id === "rhacs") {
    addClue("rhacs");
    openDetail(
      `<div class="eyebrow">RHACS CENTRAL · FLEET INVESTIGATION</div><h2>prod-east · An unexpected route.</h2><p>RHACS can monitor multiple secured clusters. This training console is connected to <strong>prod-east</strong>. Select its case, then walk into the cluster building to inspect the worker rooms and their Pods.</p><p>The learned baseline for <code>payments/payment-api</code> contains traffic to the internal ledger and DNS. A new external flow was observed.</p><div class="divider"></div><div class="panelmeta">SOURCE → DESTINATION</div><p style="font-family:var(--mono);font-size:13px;color:#fdb3ad;word-break:break-all">payment-api → 203.0.113.77:443</p><div class="row"><span class="pill hot">Observed: outside baseline</span><span class="pill">Current flow: ${S.findings.baselineDeviation ? "outside baseline" : S.policy !== "none" ? "blocked" : "exporter stopped"}</span><span class="pill">Not yet confirmed malicious</span></div><p style="font-size:13px">The alert identifies a deviation, not its cause. Correlate application logs, configuration and outbound tests before drawing conclusions.</p><div class="divider"></div><h3>Supply-chain investigation</h3><p>${centralPolicies().filter(p=>!p.disabled).length} active Central policies. ${S.cluster.rhacs.receipts.length} recent scan/check receipts.</p><p>At the bastion, read <code>cat rhacs/README.md</code>, scan an image or SPDX SBOM with <code>roxctl</code>, then inspect <code>rhacs/receipts.json</code>. The release pipeline uses these same checks.</p>`,
    );
    return;
  }
  if (o.id.startsWith("lab-pod:")) {
    const pod = S.cluster.resources.find(
      (item) =>
        item.kind === "Pod" &&
        item.metadata.name === o.resourceName &&
        item.metadata.namespace === o.namespace,
    );
    openDetail(
      `<div class="eyebrow">POD · ${esc(o.namespace)} · ${esc(S.world.scene)}</div><h2>${esc(o.resourceName)}</h2><p>Scheduled node: <strong>${esc(pod?.spec?.nodeName)}</strong>. Namespace: <strong>${esc(o.namespace)}</strong>.</p><p>SCC: <code>${esc(pod?.metadata.annotations?.["openshift.io/scc"])}</code></p><p>Status: <code>${esc(JSON.stringify(pod?.status))}</code></p><p>Inspect with <code>oc describe pod ${esc(o.resourceName)} -n ${esc(o.namespace)}</code>. A Deployment controller creates replicas; the Pods run inside this worker.</p>`,
    );
    return;
  }
  if (o.id === "pod1" || o.id === "pod2") {
    const pod = S.cluster.resources.find(r => r.kind === "Pod" && r.metadata.namespace === o.namespace && r.metadata.name === o.resourceName);
    const statuses = pod?.status?.containerStatuses as {ready: boolean}[] | undefined;
    const ready = statuses?.filter(c => c.ready).length ?? 0;
    const total = pod?.spec?.containers?.length ?? 0;
    if (G.traceOn && !S.campaign.active) {
      addClue("trace");
      S.traceFound = true;
    }
    openDetail(
      `<div class="eyebrow">WORKLOAD · PAYMENTS NAMESPACE</div><h2>${esc(o.resourceName)} <span style="color:#75d9c9;font-size:15px">${ready} / ${total} Ready</span></h2><p>Scheduled node: <strong>${esc(pod?.spec?.nodeName ?? "Pending")}</strong>. This is one Pod running inside this worker. The Deployment requests ${S.deployment.desiredReplicas} replicas; ${S.deployment.readyReplicas} are Ready. Its Pods run on workers; the Deployment is a controller resource.</p><div class="row"><span class="pill">app=${esc(pod?.metadata.labels?.app)}</span><span class="pill">Deployment/payment-api</span><span class="pill">ServiceAccount: ${esc(pod?.spec?.serviceAccountName ?? "default")}</span></div><div class="divider"></div><p>${G.traceOn ? S.findings.baselineDeviation ? '<strong style="color:#ffa8a4">Trace Vision:</strong> outgoing signal to an unrecognized endpoint detected.' : "Trace Vision: the exporter’s external signal is stopped or blocked." : "Open Trace Vision near a Pod to reveal its network flows."}</p><p style="font-size:13px">To investigate what the application is doing, open the operator terminal and inspect <code>oc logs deployment/payment-api -n payments</code>.</p>`,
    );
    return;
  }
  if (o.id === "ledger") {
    openDetail(
      `<div class="eyebrow">INTERNAL DEPENDENCY</div><h2>ledger · tcp/8443</h2><p>The payment service calls this internal workload to complete checkout requests.</p><div class="row"><span class="pill">Namespace: payments</span><span class="pill">app=ledger</span><span class="pill">worker-02</span></div><p>When you introduce egress restrictions, <strong>this dependency and OpenShift DNS must remain reachable</strong>. Otherwise customers cannot complete payments.</p>`,
    );
    return;
  }
  if (o.id === "edge") {
    openDetail(
      `<div class="eyebrow">NETWORK EDGE · OUTSIDE THE CLUSTER</div><h2>Untrusted destination</h2><p>Traffic crosses the cluster edge toward <code>203.0.113.77:443</code> (a documentation-only address used by this offline simulation).</p><p>This path is only visible when Trace Vision is active. A NetworkPolicy can restrict which destinations selected Pods are allowed to reach.</p>`,
    );
    return;
  }
  if (o.id === "rhea") {
    addClue("rhacs");
    radio(
      "RHEA",
      !S.evidence.has("logs")
        ? "RHACS observed payment-api → 203.0.113.77:443, outside its learned baseline. That is a lead, not proof of compromise. Take my incident report to Mira in the prod-east lobby for worker-room access. Kai handled the release; Vale keeps the audit trail. The bastion is beside me. The maintenance keycard is in the locker."
        : S.env
          ? "The logs and config are connected. A setting was changed. Don't forget to verify both the bad path and the good path after remediation."
          : "You stopped the application's suspicious behavior. Now ensure the cluster enforces the intended boundary.",
    );
    return;
  }
  if (o.id === "mira") {
    if (!S.story.inventory.includes("worker-pass")) {
      if (!S.evidence.has("rhacs")) {
        radio(
          "MIRA",
          "The worker rooms are restricted. Get the incident report from Rhea at RHACS Central first. I need to know what you are investigating before issuing access.",
        );
        return;
      }
      discover(S, "access");
      scheduleSave();
      updateHUD();
      radio(
        "MIRA",
        "Rhea’s report checks out. Here is a worker investigation pass. Worker-01 hosts a payment Pod and Kai’s release handover. Kai is in Operations. Worker-02 hosts the other payment Pod and ledger. Gather your clues, then return to the bastion at RHACS Central to investigate with oc.",
      );
      return;
    }
    radio(
      "MIRA",
      S.policy === "deny"
        ? "Default-deny was too broad by itself. Open the policy files in your simulated home directory: compare deny-all.yaml with payments-egress.yaml."
        : S.policy === "allow"
          ? "A fix is only useful if it preserves service. Open a Pod shell and curl both the ledger and the untrusted address."
          : "The payments namespace spans both worker rooms. Kai is in Operations: ask what changed in the release. His handover is also on the worker-01 desk. Vale keeps the archive audit trail; your maintenance keycard opens its door. At the bastion, correlate the release records with the API patch before deciding what happened.",
    );
    return;
  }
}
