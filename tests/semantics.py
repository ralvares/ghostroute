from browser_helpers import open_bastion
"""Production-browser checks for corrected simulation semantics."""
import json
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

errors = []
with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1440, "height": 1000})
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(sys.argv[1])
    page.locator("#startBtn").click()
    open_bastion(page)
    field = page.locator("#termInput")

    def command(text, contains):
        field.fill(text)
        field.press("Enter")
        result = page.locator(".termline").last
        expect(result).to_contain_text(contains)
        return result.inner_text()

    for invalid, expected in [
        ("oc get deployment unknown -n payments", "NotFound"),
        ("oc get pods -n payments --invented", "error:"),
        ("oc auth can-i delete secrets -n default", "no"),
        ("oc set env deployment/payment-api -n payments TELEMETRY_ENDPOINT-=bad", "simulation:"),
    ]:
        command(invalid, expected)
    config = json.loads(command("oc get deployment payment-api -n payments -o json", '"kind": "Deployment"'))
    assert config["spec"]["template"]["spec"]["containers"][0]["env"][0]["name"] == "TELEMETRY_ENDPOINT"
    command("oc apply -f policies/payments-egress.yaml", "Selected Pods may reach")
    listing = command("oc get networkpolicies -n payments", "payment-egress")
    assert "default-deny-egress" not in listing
    command("oc get networkpolicy payment-egress -n payments -o yaml", "kind: NetworkPolicy")
    command("oc apply -f policies/deny-all.yaml", "default-deny-egress configured")
    expect(page.locator("#health")).to_have_text("HEALTHY")
    command("oc rsh -n payments deployment/payment-api", "Connected")
    for invalid in ["curl -I https://ledger.evil.test:8443/health", "curl -I https://203.0.113.77.evil.test", "nslookup unknown"]:
        command(invalid, "unsupported Pod syntax")
    command("curl -I https://ledger.payments.svc.cluster.local:8443/health", "200 OK")
    command("curl -I https://203.0.113.77", "Expected negative test")
    command("exit", "Back on bastion")
    command("oc set env deployment/payment-api -n payments TELEMETRY_ENDPOINT-", "2 new Pods")
    config = json.loads(command("oc get deployment payment-api -n payments -o json", '"kind": "Deployment"'))
    assert config["spec"]["template"]["spec"]["containers"][0]["env"] == []
    command("oc get pods -n payments -o wide", "payment-api-8dc11-ab12")
    assert not errors, errors
    browser.close()

receipt = {"checks": ["Unsupported commands reject", "JSON/YAML representations", "Only applied policies listed", "Additive policy order preserves service", "Exact Pod destinations", "Deployment/Pod coherence"], "browser_errors": errors}
Path('artifacts/migrated').mkdir(parents=True, exist_ok=True)
Path('artifacts/migrated/semantics.json').write_text(json.dumps(receipt, indent=2) + '\n')
print(json.dumps(receipt, indent=2))
