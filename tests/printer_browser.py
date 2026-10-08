"""Real-input proof for resource tables, native JSONPath and installed/custom CRDs."""
import json,re,sys,time
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
from gameplay import CLOCK
from browser_helpers import open_bastion
out=Path('artifacts/campaign');out.mkdir(parents=True,exist_ok=True)
errors,failed,commands=[],[],[]
with sync_playwright() as p:
 browser=p.chromium.launch();context=browser.new_context(viewport={'width':1536,'height':1024});page=context.new_page();page.add_init_script(CLOCK)
 page.on('pageerror',lambda e:errors.append(str(e)));page.on('requestfailed',lambda r:failed.append(r.url))
 page.goto(sys.argv[1]);page.locator('#startBtn').click();page.evaluate('stepGame()');open_bastion(page)
 def command(text,contains=None):
  started=time.monotonic();field=page.locator('#termInput');field.fill(text);field.press('Enter');expect(page.locator('#termform')).to_have_attribute('aria-busy','false',timeout=15000)
  output=page.locator('.termline').last
  if contains is not None:expect(output).to_contain_text(contains)
  commands.append({'command':text,'seconds':round(time.monotonic()-started,3)});return output.text_content()
 pods=command('oc get pods -A','NAMESPACE');assert re.search(r'NAMESPACE\s+NAME\s+READY\s+STATUS\s+RESTARTS\s+AGE',pods);assert 'SCC' not in pods;assert re.search(r'payments\s+payment-api-7d9cd-ab12\s+1/1\s+Running\s+0\s+120m',pods)
 page.screenshot(path=str(out/'native-pod-table.png'))
 command('oc get pods -A -o wide','NOMINATED NODE');command('oc get pods -n payments --no-headers','ledger-86bbb-zyx12')
 command('oc get pods -A --show-labels -L app','LABELS')
 command("oc get pods -A -l 'app in (payment-api)' --field-selector=spec.nodeName=worker-01",'payment-api-7d9cd-ab12')
 command("oc get pods -A -o 'custom-columns=Name:.metadata.name,scc:.metadata.annotations.openshift\\.io/scc'",'restricted-v3')
 command('oc get scc','SUPPLEMENTALGROUPS');expect(page.locator('.termline').last).to_contain_text('nested-container');page.screenshot(path=str(out/'native-scc-table.png'))
 command("oc get scc restricted-v3 -o jsonpath='{.runAsUser.uidRangeMin} {.runAsUser.uidRangeMax}'",'1000 65534')
 command("oc get pods -A -o jsonpath='{range .items[*]}{.metadata.namespace}{\"/\"}{.metadata.name}{\"\\n\"}{end}'",'payments/payment-api-7d9cd-ab12')
 command("oc get pods -A -o jsonpath-as-json='{.items[*].metadata.name}'",'payment-api-7d9cd-ab12')
 command("oc get pods -A -o jsonpath='{.items[*].metadata.name}' | wc -l",'0')
 command("oc get pods -A -o jsonpath='{broken('",'unclosed action')
 command('oc get crd','compliancescans.compliance.openshift.io')
 command("oc get crd compliancescans.compliance.openshift.io -o json | jq -r '.spec.versions[0].additionalPrinterColumns[].name'",'Result')
 command('oc login -u platform-admin -p training','Logged in')
 crd={'apiVersion':'apiextensions.k8s.io/v1','kind':'CustomResourceDefinition','metadata':{'name':'signals.security.example.test'},'spec':{'group':'security.example.test','scope':'Namespaced','names':{'kind':'Signal','plural':'signals','singular':'signal','shortNames':['sig']},'versions':[{'name':'v1','served':True,'storage':True,'schema':{'openAPIV3Schema':{'type':'object','properties':{'spec':{'type':'object','required':['severity'],'properties':{'severity':{'type':'integer','minimum':0,'maximum':10},'owner':{'type':'string'}}}}}},'additionalPrinterColumns':[{'name':'Severity','type':'integer','jsonPath':'.spec.severity'},{'name':'Owner','type':'string','priority':1,'jsonPath':'.spec.owner'}]}]}}
 command("echo '"+json.dumps(crd)+"' > signal-crd.json")
 command('oc apply -f signal-crd.json','created')
 signal={'apiVersion':'security.example.test/v1','kind':'Signal','metadata':{'name':'suspicious','namespace':'payments'},'spec':{'severity':9,'owner':'mira'}}
 command("echo '"+json.dumps(signal)+"' > signal.json");command('oc apply -f signal.json','created');command('oc get sig -A -o wide','mira');page.screenshot(path=str(out/'custom-crd-table.png'))
 command('oc api-resources --api-group=security.example.test','Signal')
 command('oc delete crd prometheusrules.monitoring.coreos.com','deleted')
 assert 'PrometheusRule' not in command('oc api-resources --api-group=monitoring.coreos.com')
 command('oc get sig -A | less','suspicious');expect(page.locator('#terminalPager')).to_be_visible();page.locator('#terminalPager').press('q')
 command('game save','saved');page.wait_for_function("document.documentElement.dataset.offline==='ready'",polling=50);context.set_offline(True);page.reload();expect(page.locator('#startBtn')).to_have_text('Resume the case →');page.locator('#startBtn').click();page.evaluate('stepGame()');open_bastion(page)
 command('oc get sig -A -o wide','mira');command('cat signal-crd.json','additionalPrinterColumns')
 command('oc get crd prometheusrules.monitoring.coreos.com','NotFound')
 assert 'PrometheusRule' not in command('oc api-resources --api-group=monitoring.coreos.com')
 command("oc get pods -A -o jsonpath='{.items[0].metadata.namespace}'",'payments')
 command('oc get scc anyuid','RunAsAny')
 page.set_viewport_size({'width':390,'height':844});page.evaluate('stepGame()');command('oc get pods -A','NAMESPACE');page.screenshot(path=str(out/'native-pod-table-mobile.png'));assert page.evaluate('document.documentElement.scrollWidth===innerWidth')
 assert not errors,errors;assert not failed,failed;browser.close()
receipt={'url':sys.argv[1],'commands':commands,'pods_default_columns':True,'scc_13_actual_defaults':True,'kubernetes_jsonpath_wasm':True,'custom_crd_offline_resume':True,'installed_crd_deletion_retained':True,'browser_errors':errors,'failed_requests':failed}
(out/'printer-receipt.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt,indent=2))
