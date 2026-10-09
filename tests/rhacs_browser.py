"""Real bastion input: image -> policy gate -> SBOM -> repaired image, plus credentials/offline resume."""
import json,sys,time
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
from gameplay import CLOCK
from browser_helpers import open_bastion
out=Path('artifacts/roxctl');out.mkdir(parents=True,exist_ok=True)
errors,failed,commands=[],[],[]
with sync_playwright() as p:
 browser=p.chromium.launch();context=browser.new_context(viewport={'width':1536,'height':1024});page=context.new_page();page.add_init_script(CLOCK)
 page.on('pageerror',lambda e:errors.append(str(e)));page.on('requestfailed',lambda r:failed.append({'url':r.url,'failure':r.failure,'headers':r.headers}))
 page.goto(sys.argv[1]);page.locator('#startBtn').click();page.evaluate('stepGame()');open_bastion(page)
 def command(text,contains=None):
  before=page.locator('.termline').count();start=time.monotonic();field=page.locator('#termInput');field.fill(text);field.press('Enter');expect(page.locator('#termform')).to_have_attribute('aria-busy','false',timeout=15000)
  chunks=page.locator('.termline').all_text_contents()[before:];output='\n'.join(chunks[1:]);assert contains is None or contains in output,(text,output,contains)
  commands.append({'command':text,'output':output,'seconds':round(time.monotonic()-start,3)});return output
 command('cat rhacs/README.md','Offline');command('ls rhacs/sboms','payments-v1.spdx.json')
 field=page.locator('#termInput');field.fill('roxctl sbom scan --file rhacs/sboms/payments-v1.s');field.press('Tab');expect(field).to_have_value('roxctl sbom scan --file rhacs/sboms/payments-v1.spdx.json ')
 command('clear');command('roxctl image scan --image registry.example.test/payments:v1.8.2 --output table --headers COMPONENT,VERSION,CVE,SEVERITY,CVSS,FIXED_VERSION','CVE-2021-44228');page.screenshot(path=str(out/'image-scan.png'))
 command('roxctl image check --image registry.example.test/payments:v1.8.2 --output json','failingCheck');command("roxctl image check --image registry.example.test/payments:v1.8.2 --output json | jq '.summary.TOTAL'",'2')
 command('roxctl image sbom --image registry.example.test/payments:v1.8.2 > payment.spdx.json');command("jq -r '.packages[0].externalRefs[0].referenceLocator' payment.spdx.json",'pkg:maven/')
 command('roxctl sbom scan --file payment.spdx.json --output json --fail','vulnerabilities found: 2');command("roxctl sbom scan --file payment.spdx.json --output json --fail | jq '.result.summary.CRITICAL'",'2')
 command('roxctl sbom scan --file rhacs/sboms/payments-v2.spdx.json --output table --fail','TOTAL-VULNERABILITIES: 0');command('roxctl image check --image registry.example.test/payments:v1.8.3','TOTAL: 0')
 command('roxctl deployment check -f rhacs/payments-v2.yaml --output json','"TOTAL": 0');command('roxctl deployment check -f rhacs/payments-v1.yaml --output json','Container with privilege escalation allowed')
 command('roxctl image scan --image no-such-image --output json','no authored image scan');command('roxctl image check --image registry.example.test/payments:v1.8.2 --output json > blocked.json','failed policies found');command("jq '.summary.TOTAL' blocked.json",'2')
 command('roxctl image scan -i registry.example.test/payments:v1.8.2 -o table | less','CVE-2021-44228');expect(page.locator('#terminalPager')).to_be_visible();page.locator('#terminalPager').press('q')
 command('oc login -u platform-admin -p training','Logged in')
 command('oc create secret generic recovery --from-literal=token=training-v2 -n payments','created');command("oc get secret recovery -n payments -o jsonpath='{.data.token}' | base64 -d",'training-v2');command("printf '%s' training-v2 | base64 -w0",'dHJhaW5pbmctdjI=')
 command('oc create secret docker-registry private-registry --docker-server=registry.example.test --docker-username=release-bot --docker-password=training-registry-v2 -n payments','created')
 command("oc get secret private-registry -n payments -o jsonpath='{.data.\\.dockerconfigjson}' | base64 -d | jq -r '.auths[\"registry.example.test\"].auth' | base64 -d",'release-bot:training-registry-v2')
 command("printf '%s' training-registry-v1-revoked | podman login registry.example.test --username release-bot --password-stdin",'unauthorized');command("printf '%s' training-registry-v2 | podman login registry.example.test --username release-bot --password-stdin",'Login Succeeded')
 command("skopeo inspect docker://registry.example.test/payments:v1.8.3 | jq -r '.Digest'",'sha256:93236ef3');command("skopeo inspect --format '{{.Digest}}' docker://registry.example.test/private/payments:v1.8.3",'sha256:93236ef3');page.screenshot(path=str(out/'registry-inspection.png'))
 command('podman push registry.example.test/private/payments:v1.8.3','Writing manifest');command('podman pull registry.example.test/private/payments:v1.8.3','Writing manifest')
 private={'apiVersion':'apps/v1','kind':'Deployment','metadata':{'name':'private-payments','namespace':'payments'},'spec':{'replicas':1,'selector':{'matchLabels':{'app':'private-payments'}},'template':{'metadata':{'labels':{'app':'private-payments'}},'spec':{'containers':[{'name':'app','image':'registry.example.test/private/payments:v1.8.3','securityContext':{'allowPrivilegeEscalation':False,'capabilities':{'drop':['ALL']},'seccompProfile':{'type':'RuntimeDefault'}}}]}}}}
 command("echo '"+json.dumps(private)+"' > private.json");command('oc apply -f private.json','created');command('oc get pods -n payments','ImagePullBackOff')
 command("oc patch deployment private-payments -n payments --type=merge -p '{\"spec\":{\"template\":{\"spec\":{\"imagePullSecrets\":[{\"name\":\"private-registry\"}]}}}}'",'patched');command('oc rollout status deployment/private-payments -n payments','successfully rolled out');page.screenshot(path=str(out/'registry-recovery.png'))
 with page.expect_download() as download:command('game export','Downloaded')
 download.value.save_as(str(out/'rhacs-progress.json'))
 command('game save','saved');page.wait_for_function("document.documentElement.dataset.offline==='ready'",polling=50);context.set_offline(True);page.reload();page.wait_for_function("document.documentElement.dataset.ready==='true'",timeout=30000,polling=50);page.screenshot(path=str(out/'offline-start.png'));print('RESTORE ERRORS',errors,failed);expect(page.locator('#startBtn')).to_have_text('Resume the case →');page.locator('#startBtn').click();page.evaluate('stepGame()');open_bastion(page)
 command('roxctl sbom scan --file payment.spdx.json --output json','CVE-2021-44228');command('roxctl image scan -i registry.example.test/payments:v1.8.3 -o table','TOTAL-VULNERABILITIES: 0');command("oc get secret recovery -n payments -o jsonpath='{.data.token}' | base64 -d",'training-v2');command('podman pull registry.example.test/private/payments:v1.8.3','Writing manifest');command('oc rollout status deployment/private-payments -n payments','successfully rolled out')
 assert not errors,errors;assert not failed,failed;browser.close()
(out/'browser-receipt.json').write_text(json.dumps({'url':sys.argv[1],'commands':commands,'offline_resume':True,'page_errors':errors,'failed_requests':failed},indent=2)+'\n');print('PASS: RHACS/SBOM/Secret/registry real-input workflow, pager, pipes and offline resume')
