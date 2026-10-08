"""Browser regression proof shared by the legacy and migrated game.

Requires Python Playwright and Chromium: pip install playwright pillow;
playwright install chromium. Uses real DOM input and a deterministic frame clock.
"""
import argparse
import json
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

CLOCK = """
let gameTime = 1000, callbacks = [];
performance.now = () => gameTime;
window.requestAnimationFrame = fn => { callbacks.push(fn); return callbacks.length; };
window.stepGame = (count = 1) => {
  for (let i = 0; i < count; i++) {
    gameTime += 16;
    const batch = callbacks; callbacks = [];
    batch.forEach(fn => fn(gameTime));
  }
};
"""

def run(url, output):
    output = Path(output)
    output.mkdir(parents=True, exist_ok=True)
    errors, receipts = [], []
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1440, "height": 1000}, device_scale_factor=1)
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.add_init_script(CLOCK)
        page.goto(url)
        page.wait_for_function("typeof window.stepGame === 'function'")
        page.evaluate("stepGame()")
        page.screenshot(path=str(output / "opening.png"))
        page.locator("#startBtn").click()
        page.locator("#radioClose").click()
        # The avatar starts near the Ops station. Moving north reveals payment-api.
        page.locator("#world").focus()
        page.keyboard.down("w")
        page.evaluate("stepGame(45)")
        page.keyboard.up("w")
        expect(page.locator("#nearbyText")).to_contain_text("payment-api")
        page.keyboard.press("Space")
        page.evaluate("stepGame()")
        expect(page.locator("#evidenceCount")).to_have_text("1 / 5")
        page.keyboard.press("e")
        expect(page.locator("#detailsBody")).to_contain_text("worker-01")
        page.keyboard.press("Escape")
        receipts.append("WASD movement, Trace Vision, nearby interaction, modal escape")

        def walk(x, y):
            box = page.locator("#world").bounding_box()
            page.locator("#world").click(position={"x": x / 1180 * box["width"], "y": y / 650 * box["height"]})
            page.evaluate("stepGame(150)")

        walk(291, 470)
        expect(page.locator("#radioName")).to_have_text("RHEA")
        page.locator("#radioClose").click()
        walk(220, 310)
        expect(page.locator("#detailsBody")).to_contain_text("An unexpected route.")
        page.locator("#detailDone").click()
        page.locator("#radioClose").click() if page.locator("#radio").is_visible() else None
        page.locator("#caseBtn").click()
        expect(page.locator("#evidenceList")).to_contain_text("203.0.113.77:443")
        page.locator("#closeCase").click()
        receipts.append("Click-to-walk, NPC dialogue, RHACS investigation and caseboard")
        page.locator("#terminalBtn").click()
        field = page.locator("#termInput")
        field.fill("oc who")
        field.press("Tab")
        expect(field).to_have_value("oc whoami")
        field.press("Enter")
        field.press("ArrowUp")
        expect(field).to_have_value("oc whoami")
        field.fill("oc get no")
        field.press("ArrowRight")
        expect(field).to_have_value("oc get nodes")

        def command(text, contains):
            field.fill(text)
            field.press("Enter")
            expect(page.locator(".termline").last).to_contain_text(contains)

        command("oc imaginary", "unsupported oc syntax")
        command("oc logs deployment/payment-api -n payments --tail=25", "WARN telemetry")
        command("oc get deployment payment-api -n payments -o yaml", "TELEMETRY_ENDPOINT")
        command("oc get networkpolicies -n payments", "not restricted")
        expect(page.locator("#evidenceCount")).to_have_text("5 / 5")
        page.evaluate("document.querySelector('#toast').classList.remove('show')")
        page.screenshot(path=str(output / "investigation.png"))
        command("cat policies/payments-egress.yaml", "port: 8443")
        command("oc set env deployment/payment-api -n payments TELEMETRY_ENDPOINT-", "2 new Pods")
        command("oc apply -f policies/deny-all.yaml", "default-deny-egress configured")
        expect(page.locator("#health")).to_have_text("DEGRADED")
        command("oc rsh -n payments deployment/payment-api", "Connected to payment-api")
        command("nslookup ledger.payments.svc.cluster.local", "DNS blocked")
        command("curl -I https://ledger.payments.svc.cluster.local:8443/health", "cannot reach")
        command("exit", "Back on bastion")
        command("oc apply -f policies/payments-egress.yaml", "Selected Pods may reach")
        expect(page.locator("#health")).to_have_text("HEALTHY")
        command("oc rollout status deployment/payment-api -n payments", "2 of 2")
        command("oc rsh -n payments deployment/payment-api", "Connected to payment-api")
        command("env", "No TELEMETRY_ENDPOINT")
        command("nslookup ledger.payments.svc.cluster.local", "172.30.121.42")
        command("curl -I https://ledger.payments.svc.cluster.local:8443/health", "200 OK")
        command("curl -I https://203.0.113.77", "Expected negative test")
        expect(page.locator("#ending")).to_be_visible()
        expect(page.locator(".grade")).to_have_text("B")
        expect(page.locator("#endBody")).to_contain_text("1Service disruptions")
        page.evaluate("document.querySelector('#toast').classList.remove('show')")
        page.screenshot(path=str(output / "debrief.png"))
        receipts.append("Autocomplete/history, evidence, rollout, deny-all outage, recovery, DNS, positive/negative tests, B-grade completion")
        page.locator("#playAgain").click()
        expect(page.locator("#opening")).to_be_visible()
        expect(page.locator("#evidenceCount")).to_have_text("0 / 5")
        # Replay safely to confirm the top incident grade is still achievable.
        page.locator("#startBtn").click()
        page.locator("#radioClose").click()
        walk(220, 310)
        page.locator("#detailDone").click()
        page.locator("#terminalBtn").click()
        command("oc logs deployment/payment-api -n payments", "WARN telemetry")
        command("oc get deployment payment-api -n payments -o yaml", "TELEMETRY_ENDPOINT")
        command("oc get networkpolicies -n payments", "not restricted")
        field.press("Escape")
        page.locator("#radioClose").click() if page.locator("#radio").is_visible() else None
        walk(468, 312)
        page.locator("#detailDone").click()
        page.keyboard.press("Space")
        expect(page.locator("#evidenceCount")).to_have_text("5 / 5")
        page.locator("#terminalBtn").click()
        command("oc set env deployment/payment-api -n payments TELEMETRY_ENDPOINT-", "2 new Pods")
        command("oc apply -f policies/payments-egress.yaml", "Selected Pods may reach")
        command("oc rollout status deployment/payment-api -n payments", "2 of 2")
        command("oc rsh -n payments deployment/payment-api", "Connected to payment-api")
        command("curl -I https://ledger.payments.svc.cluster.local:8443/health", "200 OK")
        command("curl -I https://203.0.113.77", "Expected negative test")
        expect(page.locator(".grade")).to_have_text("S")
        page.locator("#restartTop").click()
        expect(page.locator("#opening")).to_be_visible()
        page.set_viewport_size({"width": 390, "height": 844})
        page.evaluate("stepGame()")
        page.screenshot(path=str(output / "mobile.png"))
        receipts.append("Restart, S-grade safe completion and mobile canvas")
        assert not errors, errors
        browser.close()
    (output / "receipt.json").write_text(json.dumps({"url": url, "flows": receipts, "browser_errors": errors}, indent=2) + "\n")
    print(json.dumps({"passed": receipts, "browser_errors": errors}, indent=2))

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("url")
    parser.add_argument("output")
    args = parser.parse_args()
    run(args.url, args.output)
