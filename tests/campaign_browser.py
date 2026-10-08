"""Actual field interactions and bastion inputs across all 27 chapters."""
import json,sys,subprocess,re
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
from gameplay import CLOCK
from browser_helpers import walk_to,open_bastion
out=Path('artifacts/campaign');out.mkdir(parents=True,exist_ok=True)
plan=json.loads(subprocess.check_output(['node','tests/campaign-plan.mjs']))
errors,failed,results=[],[],[]
with sync_playwright() as p:
 browser=p.chromium.launch();context=browser.new_context(viewport={'width':1536,'height':1024},device_scale_factor=1)
 page=context.new_page();page.add_init_script(CLOCK);page.on('pageerror',lambda e:errors.append(str(e)));page.on('requestfailed',lambda r:failed.append(r.url));page.goto(sys.argv[1]);page.locator('#startBtn').click();page.locator('#radioClose').click();page.evaluate('stepGame()')
 def walk(x,y):walk_to(page,x,y)
 def command(text,contains):
  field=page.locator('#termInput');field.fill(text);field.press('Enter');expect(page.locator('#termform')).to_have_attribute('aria-busy','false',timeout=15000);expect(page.locator('.termline').last).to_contain_text(contains,timeout=15000)
 def close():
  for panel,button in [('#shellshade','#closeTerm'),('#details','#detailDone'),('#radio','#radioClose')]:
   if page.locator(panel).is_visible():page.locator(button).click()
 def lobby():
  close()
  while page.locator('#world').get_attribute('data-scene') not in ['cluster','district']:page.locator('#sceneBack').click()
  if page.locator('#world').get_attribute('data-scene')=='district':walk(820,295)
 def shot(name):page.evaluate('flushPaint()');page.screenshot(path=str(out/(name+'.png')),full_page=True,animations='disabled')
 # Close the original case with real movement and inputs; collect the physical archive key as well.
 walk(210,340);walk(480,410);page.locator('#radioClose').click();walk(830,390);page.locator('#recordLead').click();page.locator('#detailDone').click()
 open_bastion(page);command('oc logs deployment/payment-api -n payments','WARN telemetry');command('oc get deployment payment-api -n payments -o yaml','TELEMETRY_ENDPOINT');command('oc get networkpolicies -n payments','not restricted')
 lobby();walk(895,465);page.locator('#radioClose').click();walk(380,230);walk(490,330);page.locator('#detailDone').click();page.keyboard.press('Space')
 open_bastion(page);command('oc set env deployment/payment-api -n payments TELEMETRY_ENDPOINT-','2 new Pods');command('oc apply -f policies/payments-egress.yaml','Selected Pods may reach');command('oc rollout status deployment/payment-api -n payments','2 of 2');command('oc rsh -n payments deployment/payment-api','Connected');command('curl -I https://ledger.payments.svc.cluster.local:8443/health','200 OK');command('curl -I https://203.0.113.77','Expected negative test');expect(page.locator('#ending')).to_be_visible();expect(page.locator('.grade')).to_have_text('S');page.locator('#continueJourney').click();page.locator('#radioClose').click()
 for ch in plan:
  expect(page.locator('#episodeLabel')).to_have_text('CHAPTER '+ch['id']+' / 27')
  page.locator('[data-nav=journey]').click();expect(page.locator('.journeyCase.current')).to_contain_text(ch['title']);expect(page.locator('.journeyCase')).to_have_count(27);page.locator('#detailDone').click()
  # Each witness is met in their physical room, not through a navigation shortcut.
  for w in ch['witnesses']:
   close()
   if w['scene']=='soc':
    while page.locator('#world').get_attribute('data-scene')!='district':page.locator('#sceneBack').click()
    walk(210,340);walk(480,410)
   else:
    lobby()
    if w['scene']=='cluster':walk(895,465)
    elif w['scene']=='operations':walk(110,350);walk(650,330)
    else:walk(1055,425);walk(500,330)
   expect(page.locator('#detailsBody')).to_contain_text('Interview recorded');page.locator('#campaignLead').click();page.locator('#detailDone').click()
  lobby();walk(1055,425);walk(760,350);expect(page.locator('#detailsBody')).to_contain_text('ARCHIVE DISCOVERY');page.locator('#detailDone').click()
  open_bastion(page);command('cd ~/campaign/'+ch['id'],'cd')
  field=page.locator('#termInput');field.fill('cat bri');field.press('Tab');expect(field).to_have_value('cat briefing.txt ');field.press('Enter');expect(page.locator('.termline').last).to_contain_text('TENANT: '+ch['namespace'])
  command('cat evidence.json','authored-training-fixture');command('cat handover.txt','REPORT:');command('case conclude '+ch['conclusion'],'Case remains open')
  user='operator'
  for f in ch['files']:
   if ch['id']=='05' and f['name']=='vendor.yaml':continue
   if ch['id']=='25' and f['name']=='app.yaml':
    command('oc login -u platform-admin -p training','Logged in');command('oc adm policy add-scc-to-user rs-profile -z profiled -n '+ch['namespace'],'added');user='platform-admin'
   desired='platform-admin' if f['admin'] else 'operator'
   if desired!=user:command('oc login -u '+desired+' -p training','Logged in');user=desired
   command('oc apply -f '+f['name']+' -n '+ch['namespace'],re.compile('created|configured'))
  if ch['id']=='05':
   command('oc login -u platform-admin -p training','Logged in');command('oc adm policy add-scc-to-user rs-vendor -z vendor -n '+ch['namespace'],'added');command('oc login -u operator -p training','Logged in');command('oc rollout restart deployment/vendor -n '+ch['namespace'],'restarted')
  if ch['id']=='04':
   page.locator('#closeTerm').click();page.locator('[data-health-view=cluster]').click();expect(page.locator('#impactFlag')).to_be_visible();expect(page.locator('#healthSummary')).to_contain_text('DEGRADED');page.locator('[data-health-view=application]').click();shot('runtime-degraded');open_bastion(page)
  for probe in ch['probes']:command('case test '+probe,'PASS ·')
  command('case conclude '+ch['conclusion'],'Case closed');expect(page.locator('#ending')).to_be_visible();results.append(ch['id']+' '+ch['title']);print(results[-1],flush=True)
  if ch['id'] in ['02','14','18','25','27']:shot('chapter-'+ch['id']+'-closed')
  if ch['id']!='27':page.locator('#chapterNext').click();page.locator('#radioClose').click()
 expect(page.locator('#endBody')).to_contain_text('27/27');page.wait_for_function("document.documentElement.dataset.progress==='saved'")
 # Offline reload restores final chapter and all reports; local WASM still runs.
 page.wait_for_function("document.documentElement.dataset.offline==='ready'");context.set_offline(True);page.reload();expect(page.locator('#endBody')).to_contain_text('27/27');page.locator('#chapterNext').click();page.evaluate('stepGame(2)');open_bastion(page);command("cat evidence.json | jq '.sourceType'",'authored-training-fixture');command('game export','Downloaded')
 with page.expect_download() as d:command('game export','Downloaded')
 save=d.value;save.save_as(str(out/'completed-progress.json'));export=json.loads((out/'completed-progress.json').read_text());assert len(export['data']['campaign']['reports'])==26
 page.locator('#closeTerm').click();page.locator('[data-nav=journal]').click();expect(page.locator('#detailsBody')).to_contain_text('Verified handovers');expect(page.locator('#detailsBody')).to_contain_text('The City That Remembers');shot('final-journal');page.locator('#detailDone').click()
 page.set_viewport_size({'width':390,'height':844});page.evaluate('stepGame()');page.locator('[data-nav=journey]').click();shot('journey-mobile');assert page.evaluate('document.documentElement.scrollWidth===innerWidth');page.locator('#detailDone').click();open_bastion(page);shot('bastion-mobile')
 assert not errors,errors;assert not failed,failed
 browser.close()
(out/'receipt.json').write_text(json.dumps({'url':sys.argv[1],'chapters':results,'browser_errors':errors,'failed_requests':failed,'offline_resume':True,'reports':26,'final_completion':'27/27'},indent=2)+'\n')
print('PASS: all chapters, physical interviews, archive, live Tab, real commands, negative gates, offline resume and export')
