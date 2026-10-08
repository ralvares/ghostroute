"""Story access, physical bastion, notebook and consequence-driven health proof."""
import sys,json
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
from gameplay import CLOCK
from browser_helpers import walk_to,open_bastion
out=Path('artifacts/roadshow');out.mkdir(parents=True,exist_ok=True)
errors,failed,flows=[],[],[]
with sync_playwright() as p:
 browser=p.chromium.launch();context=browser.new_context(viewport={'width':1536,'height':1024},device_scale_factor=1)
 page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)));page.on('requestfailed',lambda r:failed.append(r.url));page.add_init_script(CLOCK)
 page.goto(sys.argv[1]);page.locator('#startBtn').click();page.locator('#radioClose').click();page.evaluate('stepGame()')
 def shot(name):
  page.evaluate('flushPaint()');page.screenshot(path=str(out/(name+'.png')),full_page=True,animations='disabled')
 def walk(x,y):walk_to(page,x,y)
 def command(text,contains):
  field=page.locator('#termInput');field.fill(text);field.press('Enter');expect(page.locator('.termline').last).to_contain_text(contains,timeout=10000);expect(page.locator('#termform')).to_have_attribute('aria-busy','false')
 def record():page.locator('#recordLead').click();page.locator('#detailDone').click()
 page.locator('#world').press('t');expect(page.locator('#shellshade')).to_be_hidden();expect(page.locator('#toast')).to_contain_text('bastion at RHACS Central');shot('district')
 page.locator('#caseNotes').fill('Lead: follow the release; preserve customer checkout.');page.locator('#caseNotes').press('End');page.locator('#caseNotes').press('t');expect(page.locator('#shellshade')).to_be_hidden()
 walk(820,295);walk(380,230);expect(page.locator('#toast')).to_contain_text('Worker access required');expect(page.locator('#sceneTitle')).to_contain_text('cluster lobby')
 walk(895,465);expect(page.locator('#radioText')).to_contain_text('Get the incident report');page.locator('#radioClose').click();walk(170,565);walk(210,340)
 walk(480,410);expect(page.locator('#radioText')).to_contain_text('Take my incident report');page.locator('#radioClose').click();walk(830,390);expect(page.locator('#detailsBody')).to_contain_text('keycard found');record();shot('soc')
 open_bastion(page);expect(page.locator('#bastionNotes')).to_contain_text('');expect(page.locator('#bastionNotes')).to_have_value('Lead: follow the release; preserve customer checkout.t\n\nMaintenance keycard: records archive in prod-east lobby.')
 command('oc whoami','operator');page.locator('#bastionNotes').fill('Interview Rhea, Mira, Kai and Vale. Compare logs, configuration and audit records.');shot('bastion');page.locator('#closeTerm').click();expect(page.locator('#shellshade')).to_be_hidden();expect(page.locator('#caseNotes')).to_have_value('Interview Rhea, Mira, Kai and Vale. Compare logs, configuration and audit records.')
 walk(160,535);walk(820,295);walk(895,465);expect(page.locator('#radioText')).to_contain_text('worker investigation pass');page.locator('#radioClose').click();shot('cluster')
 walk(380,230);expect(page.locator('#sceneTitle')).to_contain_text('worker-01');walk(860,340);expect(page.locator('#detailsBody')).to_contain_text('exporter');record();walk(490,330);expect(page.locator('#detailsBody')).to_contain_text('one Pod running inside');page.locator('#detailDone').click();page.locator('#world').press('Space');page.evaluate('stepGame()');page.locator('#radioClose').click() if page.locator('#radio').is_visible() else None;shot('worker-01')
 walk(160,535);walk(800,280);walk(300,370);expect(page.locator('#detailsBody')).to_contain_text('two paths');record();walk(745,335);expect(page.locator('#detailsBody')).to_contain_text('ledger');page.locator('#detailDone').click();shot('worker-02')
 walk(160,535);walk(110,350);walk(650,330);expect(page.locator('#detailsBody')).to_contain_text('arbitrary UID');record();shot('operations');walk(180,510)
 walk(1055,425);walk(500,330);expect(page.locator('#detailsBody')).to_contain_text('build-bot');record();walk(760,350);expect(page.locator('#detailsBody')).to_contain_text('exporter');page.locator('#detailDone').click();shot('archive')
 flows.append('Rhea incident report -> Mira physical access pass -> worker interviews -> maintenance keycard -> Vale audit trail; doors enforce story access without granting API permissions')
 flows.append('Single physical bastion opens modal terminal; T elsewhere is rejected; logs/config shortcuts removed; leaving console hides terminal; notebooks mirror and save leads')
 open_bastion(page);command('cd workloads','cd');command('ls','owned-root.yaml');command('cat owned-root.yaml','runAsUser: 0');command('cd ../scc','cd');command('cat vendor-fixed-uid.yaml','MustRunAs');command('cd ../policies','cd')
 command('oc apply -f ./deny-all.yaml','configured');expect(page.locator('#shellshade')).to_be_hidden();expect(page.locator('#impactFlag')).to_be_visible();expect(page.locator('#healthSummary')).to_contain_text('DEGRADED · 2/2');expect(page.locator('#exposure')).to_have_text('ISOLATED');expect(page.locator('#healthMap svg')).to_have_attribute('aria-label','Payment application: 2 Pods Ready. DNS blocked, ledger blocked, external blocked.');expect(page.locator('#changeNotice')).to_contain_text('CHECKOUT DEGRADED')
 page.evaluate('stepGame(1)');expect(page.locator('#world')).to_have_attribute('data-reaction','running');start=float(page.locator('#world').get_attribute('data-reaction-x'));page.evaluate('stepGame(25)');assert float(page.locator('#world').get_attribute('data-reaction-x'))<start;shot('mira-running')
 page.evaluate('stepGame(180)');expect(page.locator('#radioText')).to_contain_text('What did you do? Checkout is offline!');shot('degraded');page.locator('#radioClose').click();page.locator('[data-health-view=cluster]').click();expect(page.locator('.nodeTile .good')).to_have_count(3);shot('degraded-cluster');page.locator('[data-health-view=application]').click();open_bastion(page)
 command('oc apply -f payments-egress.yaml','Selected Pods may reach');expect(page.locator('#impactFlag')).to_be_hidden();expect(page.locator('#healthSummary')).to_contain_text('HEALTHY');expect(page.locator('#changeNotice')).to_contain_text('CHECKOUT HEALTHY');expect(page.locator('#bastionHealth')).to_contain_text('ledger allowed');command('cd ~','cd');command('cat case/archive-note.txt','build-bot');command('cat README.md','laboratory');page.locator('#closeTerm').click();shot('restored')
 flows.append('Default-deny interrupts console and animates Mira approaching; dialogue challenges outage; checkout degrades while Pods/nodes remain Ready; targeted recovery clears flag and raises recovery notice')
 for name,contains in [('Inventory','Maintenance keycard'),('Journal','Build-bot audit trail')]:
  page.locator(f'[data-nav="{name.lower()}"]').click();expect(page.locator('#detailsBody')).to_contain_text(contains);page.locator('#detailDone').click()
 walk(160,535);walk(1050,480);expect(page.locator('#zoneBadge')).to_have_text('UNTRUSTED NETWORK');walk(980,370);expect(page.locator('#detailsBody')).to_contain_text('documentation-only');page.locator('#detailDone').click();shot('untrusted');walk(205,400)
 walk(820,295);walk(800,280);page.locator('#caseNotes').fill('Saved investigation: build-bot credential identified; human attribution remains unproven.');page.wait_for_timeout(300);page.wait_for_function("document.documentElement.dataset.progress === 'saved'",polling=50)
 reload=context.new_page();reload.goto(sys.argv[1]);reload.locator('#startBtn').click();expect(reload.locator('#sceneTitle')).to_contain_text('worker-02');expect(reload.locator('#caseNotes')).to_have_value('Saved investigation: build-bot credential identified; human attribution remains unproven.');reload.locator('[data-nav=inventory]').click();expect(reload.locator('#detailsBody')).to_contain_text('Issued by Mira');reload.close();page.bring_to_front()
 flows.append('Visited worker, access passes, discoveries, personal notes and outage acknowledgement survive a fresh page')
 layout=[]
 for width,height in [(1536,1024),(1024,768),(390,844)]:
  page.set_viewport_size({'width':width,'height':height});page.evaluate('stepGame()');shot(f'layout-{width}')
  result=page.evaluate('''() => {const box=s=>{const r=document.querySelector(s).getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}};return {width:innerWidth,scrollWidth:document.documentElement.scrollWidth,world:box('#world'),notes:box('.notesDock'),intel:box('.intelDock')}}''')
  assert result['width']==result['scrollWidth'],result
  a,b=result['notes'],result['intel'];assert a['x']+a['w']<=b['x']+1 or a['y']+a['h']<=b['y']+1,result
  assert result['world']['y']+result['world']['h']<=a['y']+1,result
  viewport=page.locator('#world').evaluate('c=>({width:c.width,height:c.height,cssWidth:c.getBoundingClientRect().width,cssHeight:c.getBoundingClientRect().height})');assert abs(viewport['cssWidth']/viewport['width']-viewport['cssHeight']/viewport['height'])<.01,viewport
  layout.append(result)
 page.set_viewport_size({'width':1536,'height':1024});page.evaluate('stepGame()');open_bastion(page);page.set_viewport_size({'width':390,'height':844});page.evaluate('stepGame()');shot('bastion-mobile');panel=page.locator('.bastionPanel').bounding_box();assert panel['x']>=0 and panel['x']+panel['width']<=390;assert panel['y']>=0 and panel['y']+panel['height']<=844
 assert not errors,errors;assert not failed,failed;browser.close()
receipt={'url':sys.argv[1],'flows':flows,'layout':layout,'browser_errors':errors,'failed_requests':failed};(out/'rpg-receipt.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt,indent=2))
