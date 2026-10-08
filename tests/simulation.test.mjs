import test from "node:test";
import assert from "node:assert/strict";
import { S, resetState } from "../.test-build/src/simulation/state.js";
import {
  removeTelemetry,
  applyPolicy,
  testConnection,
  collectEvidence,
  verifyRollout,
  resetSimulation,
} from "../.test-build/src/simulation/operations.js";
import { subscribe } from "../.test-build/src/simulation/events.js";
import {
  validOcCommand,
  validPodCommand,
} from "../.test-build/src/terminal/syntax.js";

test("environment removal replaces both Pods and reevaluates findings in event order", () => {
  resetState();
  S.checked.add("positive");
  const before = S.pods.map((pod) => pod.name);
  const observed = [];
  const unsubscribe = subscribe((event) => observed.push(event.type));
  assert.equal(removeTelemetry(), true);
  unsubscribe();
  assert.equal(S.env, false);
  assert.equal(S.podRev, 2);
  assert.notDeepEqual(
    S.pods.map((pod) => pod.name),
    before,
  );
  assert.ok(S.pods.every((pod) => pod.revision === 2 && pod.ready));
  assert.equal(S.checked.size, 0);
  assert.equal(S.findings.unexpectedConfiguration, false);
  assert.equal(S.findings.unrestrictedEgress, true);
  assert.deepEqual(observed, [
    "deployment.updated",
    "pods.replaced",
    "rollout.completed",
    "security.reevaluated",
  ]);
  assert.equal(removeTelemetry(), false);
  assert.equal(S.podRev, 2);
  assert.equal(S.audit.length, 4);
  assert.ok(Object.isFrozen(S.audit[0].data));
});

test("NetworkPolicy union is independent of application order", () => {
  for (const order of [
    ["default-deny-egress", "payment-egress"],
    ["payment-egress", "default-deny-egress"],
  ]) {
    resetState();
    order.forEach(applyPolicy);
    assert.equal(S.policy, "allow");
    assert.equal(S.policies.size, 2);
    assert.equal(testConnection("ledger"), true);
    assert.equal(testConnection("dns"), true);
    assert.equal(testConnection("external"), false);
    assert.equal(S.findings.dependencyUnavailable, false);
    assert.equal(S.findings.baselineDeviation, false);
    assert.equal(S.interruptions, order[0] === "default-deny-egress" ? 1 : 0);
  }
});

test("deny-all invalidates connectivity proof; configuration change invalidates rollout proof", () => {
  resetState();
  assert.equal(testConnection("ledger"), true);
  assert.equal(testConnection("external"), true);
  assert.ok(!S.checked.has("negative"));
  applyPolicy("default-deny-egress");
  assert.equal(S.checked.size, 0);
  assert.equal(testConnection("ledger"), false);
  assert.equal(testConnection("dns"), false);
  assert.equal(testConnection("external"), false);
  assert.ok(S.checked.has("negative"));
  applyPolicy("payment-egress");
  assert.equal(S.checked.size, 0);
  assert.equal(verifyRollout(), true);
  assert.ok(!S.checked.has("rollout"));
  removeTelemetry();
  verifyRollout();
  assert.ok(S.checked.has("rollout"));
});

test("audit and evidence are deterministic and replay resets the world", () => {
  function scenario() {
    resetSimulation();
    collectEvidence("rhacs");
    assert.equal(collectEvidence("rhacs"), false);
    removeTelemetry();
    applyPolicy("payment-egress");
    testConnection("external");
    return JSON.stringify(S.audit);
  }
  assert.equal(scenario(), scenario());
  resetSimulation();
  assert.equal(S.env, true);
  assert.equal(S.policy, "none");
  assert.equal(S.evidence.size, 0);
  assert.equal(S.audit.length, 1);
  assert.equal(S.audit[0].type, "simulation.reset");
});

test("bounded oc grammar rejects unknown resources, options, mutations and arbitrary authorization success", () => {
  for (const command of [
    "oc get deployment unknown -n payments",
    "oc get deployment payment-api -n other",
    "oc get pods -n payments --invented",
    "oc auth can-i delete secrets -n payments",
    "oc set env deployment/payment-api -n payments TELEMETRY_ENDPOINT-=bad",
    "oc rollout status deployment/payment-api -n payments extra",
    "oc get nodes -o yaml",
    "oc get networkpolicies -n payments -o json",
  ])
    assert.equal(validOcCommand(command), false, command);
  for (const command of [
    "oc get deployment payment-api -n payments -o json",
    "oc get networkpolicy payment-egress -n payments -o yaml",
    "oc auth can-i patch deployments -n payments",
    "oc set env deployment/payment-api -n payments TELEMETRY_ENDPOINT-",
    "oc apply -f policies/payments-egress.yaml",
  ])
    assert.equal(validOcCommand(command), true, command);
});

test("Pod grammar binds exact destinations, ports and commands", () => {
  for (const command of [
    "curl -I https://ledger.evil.test:8443/health",
    "curl -I https://203.0.113.77.evil.test",
    "curl -I https://ledger.payments.svc.cluster.local:22/health",
    "curl -I http://203.0.113.77",
    "nslookup unknown",
    "env extra",
    "ip route delete default",
  ])
    assert.equal(validPodCommand(command), false, command);
  assert.equal(
    validPodCommand(
      "curl -I https://ledger.payments.svc.cluster.local:8443/health",
    ),
    true,
  );
  assert.equal(validPodCommand("curl -v https://203.0.113.77/upload"), true);
});
