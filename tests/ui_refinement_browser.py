"""Visible tools, readable world/console, notes persistence and native client help."""
import json,sys
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
from gameplay import CLOCK
from browser_helpers import open_bastion,walk_to
out=Path('artifacts/ui-refinement');out.mkdir(parents=True,exist_ok=True)
receipts=[]
with sync_playwright() as p:
 b=p.chromium.launch()
 for name,width,height in [('desktop',1536,1024),('tablet',900,900),('mobile',390,844)]:
  context=b.new_context(viewport={'width':width,'height':height});page=context.new_page();page.add_init_script(CLOCK);errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.goto(sys.argv[1]);page.locator('#startBtn').click();page.locator('#radioClose').click();page.evaluate('stepGame()')
  for id in ['traceBtn','caseBtn']:
   box=page.locator('#'+id).bounding_box();assert box and box['y']>=0 and box['y']+box['height']<height,(name,id,box)
  page.locator('#caseNotes').fill('Lead: inspect the release job and the build-bot role.');page.locator('#caseBtn').click();expect(page.locator('#casepanel')).to_be_visible();page.locator('#closeCase').click()
  page.locator('[data-health-view=cluster]').click();expect(page.locator('#healthMap')).to_have_attribute('data-view','cluster');expect(page.locator('#healthMap')).to_contain_text('control-01');page.locator('[data-health-view=application]').click()
  page.evaluate('window.scrollTo(0,0)');page.screenshot(path=str(out/(name+'-world.png')),full_page=True)
  open_bastion(page);expect(page.locator('#bastionNotes')).to_have_value('Lead: inspect the release job and the build-bot role.');expect(page.locator('#termOutput')).not_to_contain_text('OFFLINE');assert page.locator('#termOutput').inner_text()==''
  def command(text):
   page.locator('#termInput').fill(text);page.locator('#termInput').press('Enter');expect(page.locator('#termform')).to_have_attribute('aria-busy','false',timeout=15000);return '' if text == 'clear' else page.locator('.termline').last.inner_text()
  native=json.loads(Path('src/terminal/oc-help-data.json').read_text())[''].rstrip('\n');assert command('oc --help')==native
  assert 'OpenShift Client' in command('oc --help | head -22');command('oc get pods -A');command('clear');command('oc --help | head -22');page.screenshot(path=str(out/(name+'-terminal.png')))
  terminal=page.locator('#shellshade .terminal').bounding_box();assert terminal['height']>=250,terminal
  if name=='desktop':assert terminal['width']>=1050,terminal
  overflow=page.evaluate('document.documentElement.scrollWidth>innerWidth');assert not overflow,(name,'horizontal page overflow')
  assert not errors,errors
  receipts.append({'viewport':name,'terminal':terminal,'consoleFont':page.locator('#termOutput').evaluate('e=>getComputedStyle(e).fontSize'),'nativeHelpExact':True,'visibleTools':True,'notesShared':True,'pageErrors':errors});context.close()
 b.close()
(out/'receipt.json').write_text(json.dumps(receipts,indent=2)+'\n');print('PASS: desktop/tablet/mobile world and terminal, visible tools, health toggle, shared notes, exact native oc help')
