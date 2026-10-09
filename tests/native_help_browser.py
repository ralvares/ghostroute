"""First use of each lazy native reference must work after an offline reload."""
import sys,json
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
from gameplay import CLOCK
from browser_helpers import open_bastion
out=Path('artifacts/campaign');out.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
 browser=p.chromium.launch();context=browser.new_context(viewport={'width':1536,'height':1024});page=context.new_page();page.add_init_script(CLOCK);errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.goto(sys.argv[1]);page.locator('#startBtn').click();page.locator('#radioClose').click();open_bastion(page)
 def command(text,needle):
  page.locator('#termInput').fill(text);page.locator('#termInput').press('Enter');expect(page.locator('#termform')).to_have_attribute('aria-busy','false',timeout=15000);expect(page.locator('.termline').last).to_contain_text(needle)
 command('oc new-project offline-reference','Now using project');command('oc create secret generic sample --from-literal=token=training','created');command('game save','saved');page.wait_for_function("document.documentElement.dataset.offline==='ready'",polling=50);context.set_offline(True);page.reload();page.locator('#startBtn').click();page.evaluate('stepGame()');open_bastion(page)
 # No help page was loaded while online.
 command('oc create secret generic --help','Create a secret');command('oc options','The following options can be passed to any command');command('roxctl image scan --help','roxctl image scan');command('tkn -n offline-reference pr logs --help','tkn pipelinerun logs');page.screenshot(path=str(out/'native-help-offline.png'))
 command('oc get secret sample -o jsonpath="{.data.token}" | base64 -d','training');assert not errors,errors
 receipt={'offlineColdReferences':['oc 4.22.0','roxctl 4.11.3','tkn 0.46.1'],'saveRestored':True,'browserErrors':errors};(out/'native-help-offline.json').write_text(json.dumps(receipt,indent=2)+'\n');browser.close()
print('PASS: cold offline native help for oc, roxctl and tkn; restored tenant and Secret')
