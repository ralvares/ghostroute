"""Selected-container rsh must retain its environment and RHACS baseline identity."""
import sys,json
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
from gameplay import CLOCK
from browser_helpers import open_bastion
with sync_playwright() as p:
 browser=p.chromium.launch();page=browser.new_page(viewport={'width':1536,'height':1024});page.add_init_script(CLOCK);errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.goto(sys.argv[1]);page.locator('#startBtn').click();page.locator('#radioClose').click();open_bastion(page)
 def command(text,needle):
  page.locator('#termInput').fill(text);page.locator('#termInput').press('Enter');expect(page.locator('#termform')).to_have_attribute('aria-busy','false');expect(page.locator('.termline').last).to_contain_text(needle)
 command('oc project payments','payments')
 command('oc patch deployment payment-api --type=json -p \'[{"op":"add","path":"/spec/template/spec/containers/-","value":{"name":"metrics","image":"busybox","env":[{"name":"METRICS_ROLE","value":"observer"}]}}]\'','patched')
 command('oc rsh deployment/payment-api -c metrics','Connected');command('env','METRICS_ROLE=observer');assert 'TELEMETRY_ENDPOINT' not in page.locator('.termline').last.inner_text();command('exit','Back on bastion')
 command("cat rhacs/baselines.json | jq '.baselines[] | {container: .key.containerName, processes: .elements}'",'metrics');assert not errors,errors
 out=Path('artifacts/campaign');page.screenshot(path=str(out/'selected-container-shell.png'));(out/'selected-container-shell.json').write_text(json.dumps({'selectedContainer':'metrics','environment':'METRICS_ROLE=observer','baselineContainer':'metrics','browserErrors':errors},indent=2)+'\n');browser.close()
print('PASS: rsh selected-container environment and RHACS process baseline identity')
