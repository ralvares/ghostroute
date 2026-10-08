import { S } from "../simulation/state.js";
import { G } from "../game/runtime.js";
import { toast } from "../ui/notifications.js";
import { objects } from "../world/locations.js";
import { addClue } from "../security/evidence.js";
import { nearest } from "../game/movement.js";
import { closeRadio, radio } from "../characters/dialogue.js";
import { openTerminal } from "../terminal/shell.js";
import { openDetail } from "../ui/panels.js";
import type { WorldObject } from "../world/locations.js";

export function toggleTrace() {
  if (!S.started || G.terminalOpen || G.detailOpen || G.endOpen) return;
  G.traceOn = !G.traceOn;
  G.traceEnd = performance.now() + 12500;
  toast(
    G.traceOn
      ? "Trace Vision ON · Follow the outbound path"
      : "Trace Vision OFF",
  );
  if (G.traceOn) {
    const d = Math.hypot(S.x - objects[1].x, S.y - objects[1].y);
    if (d < 170) {
      addClue("trace");
      S.traceFound = true;
    }
  }
}

export function interact(o: WorldObject | null = nearest()) {
  if (!o || !S.started || G.terminalOpen || G.detailOpen || G.endOpen) return;
  closeRadio();
  if (o.id === "ops") {
    openTerminal();
    return;
  }
  if (o.id === "rhacs") {
    addClue("rhacs");
    openDetail(
      `<div class="eyebrow">RHACS · NETWORK ANOMALY</div><h2>An unexpected route.</h2><p>The learned baseline for <code>payments/payment-api</code> contains traffic to the internal ledger and DNS. A new external flow was observed.</p><div class="divider"></div><div class="panelmeta">SOURCE → DESTINATION</div><p style="font-family:var(--mono);font-size:13px;color:#fdb3ad;word-break:break-all">payment-api → 203.0.113.77:443</p><div class="row"><span class="pill hot">Observed: outside baseline</span><span class="pill">Current flow: ${S.findings.baselineDeviation ? "outside baseline" : S.policy !== "none" ? "blocked" : "exporter stopped"}</span><span class="pill">Not yet confirmed malicious</span></div><p style="font-size:13px">The alert identifies a deviation, not its cause. Correlate application logs, configuration and outbound tests before drawing conclusions.</p>`,
    );
    return;
  }
  if (o.id === "pod1" || o.id === "pod2") {
    if (G.traceOn) {
      addClue("trace");
      S.traceFound = true;
    }
    openDetail(
      `<div class="eyebrow">WORKLOAD · PAYMENTS NAMESPACE</div><h2>payment-api <span style="color:#75d9c9;font-size:15px">2 / 2 ready</span></h2><p>This Pod is running on <strong>${o.id === "pod1" ? "worker-01" : "worker-02"}</strong>. Both replicas come from the same Deployment template.</p><div class="row"><span class="pill">app=payment-api</span><span class="pill">Deployment/payment-api</span><span class="pill">ServiceAccount: payment-app</span></div><div class="divider"></div><p>${G.traceOn ? '<strong style="color:#ffa8a4">Trace Vision:</strong> outgoing signal to an unrecognized endpoint detected.' : "Open Trace Vision near a Pod to reveal its network flows."}</p><p style="font-size:13px">To investigate what the application is doing, open the operator terminal and inspect <code>oc logs deployment/payment-api -n payments</code>.</p>`,
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
    radio(
      "RHEA",
      !S.evidence.has("logs")
        ? "An alert is a clue, not a conviction. First identify the source and inspect its logs. What operation produced the unexpected traffic?"
        : S.env
          ? "The logs and config are connected. A setting was changed. Don't forget to verify both the bad path and the good path after remediation."
          : "You stopped the application's suspicious behavior. Now ensure the cluster enforces the intended boundary.",
    );
    return;
  }
  if (o.id === "mira") {
    radio(
      "MIRA",
      S.policy === "deny"
        ? "Default-deny was too broad by itself. Open the policy files in your simulated home directory: compare deny-all.yaml with payments-egress.yaml."
        : S.policy === "allow"
          ? "A fix is only useful if it preserves service. Open a Pod shell and curl both the ledger and the untrusted address."
          : "SCC controls what a container can do. NetworkPolicy controls allowed Pod traffic. Here we need to inspect the Deployment and egress rules. The CLI is open at the Ops terminal.",
    );
    return;
  }
}
