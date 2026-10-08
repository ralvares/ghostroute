"""A new cached build becomes available with an old tab open; saves remain intact."""
import json, re, shutil, tempfile, threading
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from functools import partial
from playwright.sync_api import sync_playwright, expect
from gameplay import CLOCK
from browser_helpers import open_bastion
with tempfile.TemporaryDirectory(prefix='ghostroute-update-') as directory:
 root=Path(directory); target=root/'ghostroute'; shutil.copytree('dist',target)
 original_index=(target/'index.html').read_text(); original_sw=(target/'sw.js').read_text()
 def version(number):
  (target/'index.html').write_text(original_index.replace('</head>',f'<meta name="update-fixture" content="{number}"></head>'))
  (target/'sw.js').write_text(re.sub(r"const cacheName = prefix \+ '[^']+';",f"const cacheName = prefix + 'update-proof-{number}';",original_sw))
 version(1)
 class Quiet(SimpleHTTPRequestHandler):
  def log_message(self,*args):pass
 server=ThreadingHTTPServer(('127.0.0.1',4185),partial(Quiet,directory=directory)); threading.Thread(target=server.serve_forever,daemon=True).start()
 errors=[]
 with sync_playwright() as p:
  browser=p.chromium.launch(); context=browser.new_context(); page=context.new_page(); page.add_init_script(CLOCK); page.on('pageerror',lambda e:errors.append(str(e))); page.goto('http://127.0.0.1:4185/ghostroute/'); page.locator('#startBtn').click();page.evaluate('stepGame()');open_bastion(page)
  field=page.locator('#termInput');field.fill("echo retained-through-update > findings.txt");field.press('Enter');expect(page.locator('#termform')).to_have_attribute('aria-busy','false');page.locator('#bastionNotes').fill('Retain my case notes too');field.fill('game save');field.press('Enter');expect(page.locator('.termline').last).to_contain_text('Progress saved locally');page.wait_for_function("document.documentElement.dataset.offline==='ready'",polling=50)
  # Keep this tab open while replacing the application cache and checking for updates.
  page.wait_for_function("navigator.serviceWorker.controller !== null",polling=50)
  page.evaluate("window.previousController=navigator.serviceWorker.controller")
  version(2);page.evaluate('navigator.serviceWorker.getRegistration().then(reg => reg.update())')
  page.wait_for_function("caches.keys().then(keys => keys.some(key => key.endsWith('update-proof-2')))",polling=50)
  page.wait_for_function("navigator.serviceWorker.getRegistration().then(reg => !reg.installing && !reg.waiting)",polling=50)
  page.wait_for_function("navigator.serviceWorker.controller !== window.previousController",polling=50)
  context.set_offline(True);page.reload();expect(page.locator('meta[name=update-fixture]')).to_have_attribute('content','2')
  page.locator('#startBtn').click();page.evaluate('stepGame()');open_bastion(page);expect(page.locator('#bastionNotes')).to_have_value('Retain my case notes too');field.fill('cat findings.txt');field.press('Enter');expect(page.locator('.termline').last).to_contain_text('retained-through-update')
  field.fill("jq 'select(.verb==\"patch\") | .user.username' audit/kube-apiserver.log");field.press('Enter');expect(page.locator('.termline').last).to_contain_text('build-bot')
  assert not errors,errors;browser.close()
 server.shutdown()
receipt={'open_tab_update':True,'offline_updated_build':True,'notes_and_files_retained':True,'jq_after_update':True,'browser_errors':errors}
Path('artifacts/campaign/update-receipt.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt,indent=2))
