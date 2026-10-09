"""Junior operator recovery paths through real terminal input, followed by offline resume."""
import json,sys
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
from gameplay import CLOCK
from browser_helpers import open_bastion

out=Path('artifacts/campaign');out.mkdir(parents=True,exist_ok=True)
errors,commands,failed=[],[],[]
with sync_playwright() as p:
 browser=p.chromium.launch();context=browser.new_context(viewport={'width':1536,'height':1024});page=context.new_page();page.add_init_script(CLOCK)
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.on('requestfailed',lambda r:failed.append({'url':r.url,'failure':r.failure}))
 page.goto(sys.argv[1]);page.locator('#startBtn').click();page.evaluate('stepGame()');open_bastion(page)
 def command(text,contains=None):
  field=page.locator('#termInput');field.fill(text);field.press('Enter');expect(page.locator('#termform')).to_have_attribute('aria-busy','false',timeout=15000)
  output=page.locator('.termline').last
  if contains is not None:
   try:expect(output).to_contain_text(contains)
   except Exception:
    page.screenshot(path=str(out/"api-write-failure.png"));print(json.dumps({"browser_errors":errors,"terminal":page.locator("#termOutput").inner_text()}),flush=True);raise
  value=output.text_content();commands.append({'command':text,'output':value});return value
 command('oc create namespace investigation','created');command('oc project investigation','Now using')
 command('mkdir -p notes');command('cd notes');command('pwd','/home/operator/notes')
 command('oc create cm settings --from-literal=version=v1 --dry-run=client -o yaml > settings.yaml')
 command('cat settings.yaml','version: v1');command('oc get cm settings','NotFound')
 command('oc create -f settings.yaml --dry-run=server','server dry run');command('oc get cm settings','NotFound')
 command('oc create -f settings.yaml','created')
 before=json.loads(command('oc get cm settings -o json'))
 command('oc get cm settings -o json > stale.json')
 command('oc label cm settings owner=mira','labeled');command('oc annotate cm settings case=incident-18','annotated')
 command('oc label cm settings owner=kai','--overwrite is false')
 command('oc label cm settings owner=kai --overwrite','labeled')
 command('oc label cm settings owner-','labeled')
 command('oc patch cm settings --type=merge -p \'{"data":{"version":"v2"}}\'','patched')
 command('oc replace -f stale.json','Conflict')
 current=json.loads(command('oc get cm settings -o json'));assert current['data']['version']=='v2';assert current['metadata']['uid']==before['metadata']['uid'];assert current['metadata']['resourceVersion']!=before['metadata']['resourceVersion'];assert 'owner' not in current['metadata']['labels']
 command('oc patch cm settings --type=json -p \'[{"op":"replace","path":"/data/version","value":"bad"},{"op":"test","path":"/metadata/name","value":"wrong"}]\'','test operation failed')
 assert json.loads(command('oc get cm settings -o json'))['data']['version']=='v2'
 command('oc get cm settings -o json > current.json');command('oc replace -f current.json','replaced')
 command('oc run root --image=busybox --overrides=\'{"spec":{"containers":[{"name":"root","image":"busybox","securityContext":{"runAsUser":0}}]}}\' --dry-run=client -o yaml > root.yaml')
 command('oc create -f root.yaml --dry-run=server','unable to validate against any security context constraint');command('oc get pod root','NotFound')
 command('oc create deployment witness --image=busybox','created')
 pods=json.loads(command('oc get pods -o json'))['items'];assert len(pods)==1
 pod_name=pods[0]['metadata']['name'];pod_uid=pods[0]['metadata']['uid']
 command('oc label deployment witness owner=mira','labeled')
 assert json.loads(command('oc get pods -o json'))['items'][0]['metadata']['uid']==pod_uid
 command('oc scale deployment witness --replicas=2 --dry-run=server','server dry run')
 assert len(json.loads(command('oc get pods -o json'))['items'])==1
 command('oc scale deployment witness --replicas=2','configured')
 pods=json.loads(command('oc get pods -o json'))['items'];assert len(pods)==2;assert pods[0]['metadata']['uid']==pod_uid
 command('oc patch deployment witness -p \'{"spec":{"template":{"spec":{"containers":[{"name":"witness","image":"registry.example.test/owned:arbitrary-uid"}]}}}}\'','patched')
 command('oc get pods -o wide','Running')
 command('oc patch pod '+pod_name+' -p \'{"spec":{"containers":[{"name":"witness","env":[{"name":"UNSAFE","value":"1"}]}]}}\'','pod updates may not change')
 command('oc create secret generic training --from-file=record=current.json --dry-run=server -o name','secret/training')
 command('oc get secret training','Forbidden')
 command('oc delete cm settings --dry-run=server','server dry run');command('oc get cm settings','settings')
 command('oc delete deployment witness','deleted');command('oc get pods','No resources found')
 command('game save','saved');page.wait_for_function("document.documentElement.dataset.offline==='ready'",timeout=30000,polling=50)
 context.set_offline(True);page.reload()
 try:expect(page.locator('#startBtn')).to_have_text('Resume the case →')
 except Exception:
  page.screenshot(path=str(out/'api-offline-failure.png'));print(json.dumps({'errors':errors,'failed':failed,'state':page.evaluate('({offline:document.documentElement.dataset.offline,progress:document.documentElement.dataset.progress,controller:!!navigator.serviceWorker.controller})')}),flush=True);raise
 page.locator('#startBtn').click();page.evaluate('stepGame()');open_bastion(page)
 command('pwd','/home/operator/notes');command('cat stale.json','"version": "v1"')
 restored=json.loads(command('oc get cm settings -o json'));assert restored['metadata']['uid']==current['metadata']['uid'];assert restored['data']['version']=='v2'
 command("oc get cm settings -o json | jq -r '.data.version'",'v2')
 command("oc get cm settings -o go-template='{{index .data \"version\"}}'",'v2')
 command('game status','Offline installation: ready')
 page.screenshot(path=str(out/'api-write-offline.png'))
 assert not errors,errors
 browser.close()
receipt={'url':sys.argv[1],'real_input':True,'checks':['client/server dry run','SCC failure without persisted Pod','conditional replacement and failed JSON test','label overwrite/removal','metadata without rollout','scale preserves running Pods','strategic template patch','Pod immutability','Secret from local file','delete dry run and Deployment cleanup','offline files/identity/revision restore','offline WASM queries'],'commands':commands,'browser_errors':errors,'screenshot':str(out/'api-write-offline.png')}
(out/'api-write-browser-receipt.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt,indent=2))
