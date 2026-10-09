"""Investigate arbitrary incident edits, recover real dependencies, and resume offline."""
import json,sys
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
from gameplay import CLOCK
from browser_helpers import open_bastion

out=Path('artifacts/campaign');out.mkdir(parents=True,exist_ok=True)
errors,commands=[],[]
with sync_playwright() as p:
 browser=p.chromium.launch();context=browser.new_context(viewport={'width':1536,'height':1024});page=context.new_page();page.add_init_script(CLOCK)
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(sys.argv[1]);page.locator('#startBtn').click();page.evaluate('stepGame()');open_bastion(page)
 def command(text,contains=None):
  field=page.locator('#termInput');field.fill(text);field.press('Enter');expect(page.locator('#termform')).to_have_attribute('aria-busy','false',timeout=15000)
  line=page.locator('.termline').last
  if contains is not None:expect(line).to_contain_text(contains)
  output=line.inner_text();commands.append({'command':text,'output':output});return output
 command('oc get deployment payment-api -n payments -o json > before.json')
 original=json.loads(command('cat before.json'));uid=original['metadata']['uid']
 command('oc set env deployment/payment-api -n payments TELEMETRY_ENDPOINT- --dry-run=server','server dry run')
 assert 'TELEMETRY_ENDPOINT' in command('oc get deployment payment-api -n payments -o json')
 command('oc patch deployment payment-api -n payments --type=json -p \'[{"op":"remove","path":"/spec/template/spec/containers/0/env/0"}]\'','patched')
 assert 'TELEMETRY_ENDPOINT' not in command('oc get deployment payment-api -n payments -o json')
 command('oc replace -f before.json -n payments','Conflict')
 command('oc patch deployment payment-api -n payments -p \'{"spec":{"template":{"spec":{"containers":[{"name":"payment-api","securityContext":{"runAsUser":0}}]}}}}\'','patched')
 command('oc get events -n payments','unable to validate against any security context constraint')
 expect(page.locator('#bastionHealth')).to_contain_text('0/2 Pods Ready')
 command('oc rollout status deployment/payment-api -n payments','Waiting')
 command('oc patch deployment payment-api -n payments --type=json -p \'[{"op":"remove","path":"/spec/template/spec/containers/0/securityContext/runAsUser"}]\'','patched')
 expect(page.locator('#bastionHealth')).to_contain_text('2/2 Pods Ready')
 deny={'apiVersion':'networking.k8s.io/v1','kind':'NetworkPolicy','metadata':{'name':'scene-boundary','namespace':'payments'},'spec':{'podSelector':{'matchLabels':{'app':'payment-api'}},'policyTypes':['Egress'],'egress':[]}}
 command("echo '"+json.dumps(deny)+"' > scene-policy.json")
 command('oc apply -f scene-policy.json -n payments','created')
 expect(page.locator('#shellshade')).to_be_hidden();page.evaluate('stepGame(100)')
 expect(page.locator('#radioName')).to_have_text('MIRA');expect(page.locator('#radioText')).to_contain_text('DNS and ledger')
 page.screenshot(path=str(out/'incident-api-outage.png'));page.locator('#radioClose').click();open_bastion(page)
 ledger={'to':[{'podSelector':{'matchLabels':{'app':'ledger'}}}],'ports':[{'protocol':'TCP','port':8443}]}
 command("oc patch networkpolicy scene-boundary -n payments --type=merge -p '"+json.dumps({'spec':{'egress':[ledger]}})+"'",'patched')
 expect(page.locator('#bastionHealth')).to_contain_text('DNS blocked · ledger allowed')
 expect(page.locator('#healthSummary')).to_contain_text('DEGRADED')
 expect(page.locator('#healthMap svg')).to_have_attribute('aria-label','Payment application: 2 Pods Ready. DNS blocked, ledger allowed, external blocked.')
 page.screenshot(path=str(out/'incident-api-partial.png'))
 dns={'to':[{'namespaceSelector':{'matchLabels':{'kubernetes.io/metadata.name':'openshift-dns'}},'podSelector':{'matchLabels':{'dns.operator.openshift.io/daemonset-dns':'default'}}}],'ports':[{'protocol':'TCP','port':53},{'protocol':'UDP','port':53}]}
 command("oc patch networkpolicy scene-boundary -n payments --type=json -p '"+json.dumps([{'op':'add','path':'/spec/egress/-','value':dns}])+"'",'patched')
 expect(page.locator('#healthSummary')).to_contain_text('HEALTHY');expect(page.locator('#exposure')).to_have_text('CONTAINED')
 command('oc delete networkpolicy scene-boundary -n payments','deleted')
 expect(page.locator('#exposure')).to_have_text('OPEN PATH')
 command('oc apply -f policies/payments-egress.yaml -n payments','created')
 command('oc scale deployment payment-api -n payments --replicas=0','configured')
 expect(page.locator('#bastionHealth')).to_contain_text('0/0 Pods Ready');expect(page.locator('#impactFlag')).to_be_visible()
 command('oc rsh deployment/payment-api -n payments','no running')
 command('oc scale deployment payment-api -n payments --replicas=2','configured')
 command('oc rollout status deployment/payment-api -n payments','successfully rolled out')
 assert json.loads(command('oc get deployment payment-api -n payments -o json'))['metadata']['uid']==uid
 command('game save','saved');page.wait_for_function("document.documentElement.dataset.offline==='ready'",polling=50)
 context.set_offline(True);page.reload();page.locator('#startBtn').click();page.evaluate('stepGame()');open_bastion(page)
 expect(page.locator('#bastionHealth')).to_contain_text('2/2 Pods Ready');expect(page.locator('#exposure')).to_have_text('CONTAINED')
 command("oc get deployment payment-api -n payments -o json | jq -r '.metadata.uid'",uid)
 command('cat scene-policy.json','scene-boundary');command('game status','Offline installation: ready')
 page.screenshot(path=str(out/'incident-api-recovered-offline.png'));assert not errors,errors;browser.close()
receipt={'url':sys.argv[1],'real_input':True,'checks':['arbitrary incident mutation','server preview isolation','stale replacement failure','SCC controller failure and repair','renamed policy drives Mira reaction','independent DNS/ledger consequences','policy deletion opens external path','scale to zero blocks rsh','simulated rollout and offline resource identity'],'commands':commands,'browser_errors':errors}
(out/'incident-api-browser.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt,indent=2))
