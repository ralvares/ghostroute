import sys,json
from pathlib import Path
sys.path.insert(0,str(Path('tests').resolve()))
from playwright.sync_api import sync_playwright,expect
from gameplay import CLOCK
from browser_helpers import open_bastion,walk_to
out=Path('artifacts/campaign');out.mkdir(exist_ok=True,parents=True)
with sync_playwright() as p:
 browser=p.chromium.launch();context=browser.new_context(viewport={'width':1536,'height':1024});page=context.new_page();page.add_init_script(CLOCK);errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.goto(sys.argv[1]);page.locator('#startBtn').click();page.locator('#radioClose').click();open_bastion(page)
 def command(s,needle):
  page.locator('#termInput').fill(s);page.locator('#termInput').press('Enter');expect(page.locator('#termform')).to_have_attribute('aria-busy','false');
  if s != 'clear':expect(page.locator('.termline').last).to_contain_text(needle)
 command('oc project payments','payments');command('clear','');command('oc get deployments -L labels','LABELS');command('oc get deployments -L app','payment-api');command('oc get deployments --show-labels','app=payment-api');command('oc get services -o wide','172.30.0.11');command('oc get endpointslices','payment-api');command('oc get routes','edge/Redirect');page.screenshot(path=str(out/'selectors-services-routes.png'))
 command('oc exec payment-api-7d9cd-ab12 -- curl -I http://ledger:8443/health','200 OK');command("cat rhacs/alerts.json | jq '.alerts[] | {policy: .policy.name, caller: .violations[0].keyValueAttrs}'",'Exec into Pod');command('oc timemachine --auditlog-file ~/forensics/reference-audit.log get deployments -n frontend --time 2025-12-10T06:31:00Z -o json','asset-cache');page.screenshot(path=str(out/'timemachine-investigation.png'))
 command('oc rsh deployment/payment-api','Connected');command('exit','Back on bastion');page.locator('#closeTerm').click();walk_to(page,900,270);expect(page.locator('#details')).to_be_visible();expect(page.locator('#detailsBody')).to_contain_text('Kubernetes Actions: Exec into Pod');page.locator('[data-baseline]').first.click();expect(page.locator('#detailsBody')).to_contain_text('Locked');page.locator('#runtimeEnforcement').click();expect(page.locator('#runtimeEnforcement')).to_contain_text('Disable');page.screenshot(path=str(out/'rhacs-runtime-baseline.png'));page.locator('#detailDone').click();open_bastion(page);command('oc rsh deployment/payment-api','Connected')
 expect(page.locator('#changeNotice')).to_contain_text('RHACS');command('env','Pod was terminated');command("cat rhacs/alerts.json | jq '.alerts[] | select(.enforcement != null) | {policy: .policy.name, enforcement, enforcementCount, podUid: .processViolation.processes[0].podUid}'",'KILL_POD_ENFORCEMENT');command('oc get pods','Running');page.screenshot(path=str(out/'rhacs-runtime-enforcement.png'))
 command('game save','saved');page.wait_for_function("document.documentElement.dataset.offline==='ready'",polling=50);context.set_offline(True);page.reload();page.locator('#startBtn').click();page.evaluate('stepGame()');open_bastion(page);command("cat rhacs/alerts.json | jq '.alerts | length'",'2');assert not errors,errors
 browser.close()
print('PASS: labels, selectors, Services, Routes, exec alert, baseline lock, enforcement, timemachine and offline evidence')
