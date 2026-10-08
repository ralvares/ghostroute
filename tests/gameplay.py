"""Browser regression proof shared by the legacy and migrated game.

Requires Python Playwright and Chromium: pip install playwright pillow;
playwright install chromium. Uses real DOM input and a deterministic frame clock.
"""
import argparse
import json
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
from browser_helpers import open_bastion

CLOCK = """
const nativeFrame = window.requestAnimationFrame.bind(window);
window.flushPaint = () => new Promise(resolve => nativeFrame(() => nativeFrame(resolve)));
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
        context = browser.new_context(viewport={"width": 1440, "height": 1000}, device_scale_factor=1)
        page = context.new_page()
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.add_init_script(CLOCK)
        page.goto(url)
        page.wait_for_function("typeof window.stepGame === 'function'")
        page.evaluate("stepGame()")
        page.evaluate("flushPaint()")
        page.screenshot(animations="disabled", path=str(output / "opening.png"))
        page.locator("#startBtn").click()
        page.locator("#radioClose").click()
        rpg = page.locator("#sceneTitle").count() > 0
        def walk(x, y):
            box = page.locator("#world").bounding_box()
            view=page.locator("#world").evaluate("c=>({width:c.width,height:c.height,x:Number(c.dataset.cameraX||0),y:Number(c.dataset.cameraY||0)})")
            page.locator("#world").click(position={"x": (x-view["x"]) / view["width"] * box["width"], "y": (y-view["y"]) / view["height"] * box["height"]})
            page.evaluate("stepGame(180)")
        if rpg:
            walk(210,340);walk(480,410);expect(page.locator("#radioName")).to_have_text("RHEA");page.locator("#radioClose").click();walk(160,535)
            walk(820,295)
            expect(page.locator("#sceneTitle")).to_contain_text("cluster lobby")
            walk(895,465);page.locator("#radioClose").click();walk(405,245)
            expect(page.locator("#sceneTitle")).to_contain_text("worker-01")
            page.locator("#world").focus()
            page.keyboard.down("d"); page.evaluate("stepGame(18)"); page.keyboard.up("d")
            page.keyboard.down("w"); page.evaluate("stepGame(24)"); page.keyboard.up("w")
        else:
            page.locator("#world").focus()
            page.keyboard.down("w"); page.evaluate("stepGame(45)"); page.keyboard.up("w")
        expect(page.locator("#nearbyText")).to_contain_text("payment-api")
        page.keyboard.press("Space"); page.evaluate("stepGame()")
        expect(page.locator("#evidenceCount")).to_have_text("2 / 5" if rpg else "1 / 5")
        page.keyboard.press("e")
        expect(page.locator("#detailsBody")).to_contain_text("worker-01")
        page.keyboard.press("Escape")
        receipts.append("WASD movement, Trace Vision, nearby interaction, modal escape")
        if rpg:
            walk(160,535); walk(175,535); walk(210,340)
            expect(page.locator("#sceneTitle")).to_contain_text("security operations")
            walk(480,410)
        else: walk(291,470)
        expect(page.locator("#radioName")).to_have_text("RHEA")
        page.locator("#radioClose").click()
        if not rpg:
            walk(220,310);expect(page.locator("#detailsBody")).to_contain_text("203.0.113.77:443");page.locator("#detailDone").click()
        page.locator("#caseBtn").click()
        expect(page.locator("#evidenceList")).to_contain_text("203.0.113.77:443")
        page.locator("#closeCase").click()
        receipts.append("Click-to-walk, NPC dialogue, RHACS investigation and caseboard")
        open_bastion(page) if rpg else page.locator("#terminalBtn").click()
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
        page.evaluate("flushPaint()")
        page.screenshot(animations="disabled", path=str(output / "investigation.png"))
        command("cat policies/payments-egress.yaml", "port: 8443")
        command("oc set env deployment/payment-api -n payments TELEMETRY_ENDPOINT-", "2 new Pods")
        command("oc apply -f policies/deny-all.yaml", "default-deny-egress configured")
        expect(page.locator("#health")).to_have_text("DEGRADED")
        if rpg:
            expect(page.locator("#shellshade")).to_be_hidden();page.evaluate("stepGame(180)");expect(page.locator("#radioText")).to_contain_text("What did you do?");open_bastion(page)
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
        page.evaluate("flushPaint()")
        page.screenshot(animations="disabled", path=str(output / "debrief.png"))
        receipts.append("Autocomplete/history, evidence, rollout, deny-all outage, recovery, DNS, positive/negative tests, B-grade completion")
        page.locator("#playAgain").click()
        expect(page.locator("#opening")).to_be_visible()
        expect(page.locator("#evidenceCount")).to_have_text("0 / 5")
        # Replay safely to confirm the top incident grade is still achievable.
        page.locator("#startBtn").click()
        page.locator("#radioClose").click()
        if rpg: walk(210,340);walk(480,410);page.locator("#radioClose").click()
        else: walk(220,310);page.locator("#detailDone").click()
        open_bastion(page) if rpg else page.locator("#terminalBtn").click()
        command("oc logs deployment/payment-api -n payments", "WARN telemetry")
        command("oc get deployment payment-api -n payments -o yaml", "TELEMETRY_ENDPOINT")
        command("oc get networkpolicies -n payments", "not restricted")
        field.press("Escape")
        page.locator("#radioClose").click() if page.locator("#radio").is_visible() else None
        if rpg: walk(160,535);walk(820,295);walk(895,465);page.locator("#radioClose").click();walk(405,245);walk(490,330)
        else: walk(468,312)
        page.locator("#detailDone").click()
        page.keyboard.press("Space")
        expect(page.locator("#evidenceCount")).to_have_text("5 / 5")
        open_bastion(page) if rpg else page.locator("#terminalBtn").click()
        command("oc set env deployment/payment-api -n payments TELEMETRY_ENDPOINT-", "2 new Pods")
        command("oc apply -f policies/payments-egress.yaml", "Selected Pods may reach")
        command("oc rollout status deployment/payment-api -n payments", "2 of 2")
        command("oc rsh -n payments deployment/payment-api", "Connected to payment-api")
        command("curl -I https://ledger.payments.svc.cluster.local:8443/health", "200 OK")
        command("curl -I https://203.0.113.77", "Expected negative test")
        expect(page.locator(".grade")).to_have_text("S")
        if page.evaluate("document.documentElement.dataset.progress !== undefined"):
            page.wait_for_function("document.documentElement.dataset.progress === 'saved'", polling=50)
            restored = page.context.new_page()
            restored.goto(url)
            expect(restored.locator("#ending")).to_be_visible()
            expect(restored.locator(".grade")).to_have_text("S")
            expect(restored.locator("#evidenceCount")).to_have_text("5 / 5")
            restored.close()
            page.bring_to_front()
            receipts.append("Completed case and incident grade restore in a fresh page")
        page.locator("#restartTop").click()
        expect(page.locator("#opening")).to_be_visible()
        page.set_viewport_size({"width": 390, "height": 844})
        page.evaluate("stepGame()")
        page.evaluate("flushPaint()")
        page.screenshot(animations="disabled", path=str(output / "mobile.png"))
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
