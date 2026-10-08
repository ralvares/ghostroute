"""Real bastion inputs, WASM queries, pager navigation/search and offline saves."""
import json, sys
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
from gameplay import CLOCK
from browser_helpers import open_bastion
out = Path('artifacts/campaign'); out.mkdir(parents=True, exist_ok=True)
errors, failures, checked = [], [], []
audit_query = "jq 'select(.verb == \"patch\" and .objectRef.name == \"payment-api\") | {user: .user.username, time: .requestReceivedTimestamp, request: .requestObject}' audit/kube-apiserver.log"
with sync_playwright() as p:
 browser = p.chromium.launch(); context = browser.new_context(viewport={'width':1536,'height':1024}); page = context.new_page()
 page.add_init_script(CLOCK); page.on('pageerror',lambda e:errors.append(str(e))); page.on('requestfailed',lambda r:failures.append(r.url))
 page.goto(sys.argv[1]); page.locator('#startBtn').click(); page.evaluate('stepGame()'); open_bastion(page); field = page.locator('#termInput')
 def command(text, expected=None):
  field.fill(text); field.press('Enter'); expect(page.locator('#termform')).to_have_attribute('aria-busy','false',timeout=15000)
  if expected is not None: expect(page.locator('.termline').last).to_contain_text(expected,timeout=15000)
  checked.append(text); return page.locator('.termline').last.text_content()
 def quit_pager(key='q'):
  page.locator('#terminalPager').press(key); expect(field).to_be_visible(); expect(field).to_be_focused(); expect(page.locator('#shellshade')).to_be_visible()
 command(audit_query, 'system:serviceaccount:payments:build-bot')
 expect(page.locator('.termline').last).to_contain_text('TELEMETRY_ENDPOINT')
 command('jq','jq 1.8.2');
 command("jq -nr '\"  spaced  \"' | wc -c",'11')
 command("jq -njr '\"  spaced  \"' | wc -c",'10')
 command("jq -nr '\"\"' | wc -l",'1')
 command("jq -n --arg name payment-api '{name: $name}'",'payment-api')
 command("jq -rc 'select(.verb==\"patch\") | .user.username' audit/kube-apiserver.log",'build-bot')
 command("jq --argjson code 200 'select(.responseStatus.code == $code) | .verb' audit/kube-apiserver.log",'patch')
 command("jq -e 'false' audit/kube-apiserver.log",'false'); command("jq 'broken(' audit/kube-apiserver.log",'jq:')
 command("jq -R -s 'split(\"\\n\") | length' notes.txt",'2')
 command("jq 'select(.verb==\"patch\")' audit/kube-apiserver.log | more",'build-bot')
 expect(page.locator('#terminalPager')).to_be_visible(); expect(page.locator('.pagerText')).to_contain_text('Event'); quit_pager()
 command("jq -nr 'range(1;81) | \"line-\"+tostring' > investigation.txt")
 command('wc -l investigation.txt','80 investigation.txt')
 command('less investigation.txt','line-80')
 first = page.locator('.pagerText').inner_text(); assert 'line-1\n' in first and 'line-80' not in first
 page.locator('#terminalPager').press('Space'); assert page.locator('.pagerText').inner_text()!=first
 page.locator('#terminalPager').press('b'); assert page.locator('.pagerText').inner_text()==first
 page.locator('#terminalPager').press('/'); page.locator('.pagerSearch').fill('line-60'); page.locator('.pagerSearch').press('Enter'); expect(page.locator('.pagerText')).to_contain_text('line-60')
 page.locator('#terminalPager').press('n'); expect(page.locator('.pagerStatus')).to_contain_text('match: line-60')
 page.locator('#terminalPager').press('/'); page.locator('.pagerSearch').fill('missing'); page.locator('.pagerSearch').press('Enter'); expect(page.locator('.pagerStatus')).to_contain_text('Pattern not found')
 page.locator('#terminalPager').press('/'); page.locator('.pagerSearch').press('Escape'); expect(page.locator('#terminalPager')).to_be_visible()
 page.locator('#terminalPager').press('End'); expect(page.locator('.pagerText')).to_contain_text('line-80'); page.screenshot(path=str(out/'bastion-less.png'))
 quit_pager('Escape')
 command('cat investigation.txt | grep -n line- | more','80:line-80'); page.locator('[data-page=next]').click(); page.locator('[data-page=back]').click(); page.locator('[data-page=quit]').click(); expect(field).to_be_focused()
 command('more investigation.txt','line-80'); page.locator('#closeTerm').click(); open_bastion(page); expect(field).to_be_visible(); expect(page.locator('#terminalPager')).to_be_hidden()
 command('oc logs deployment/payment-api -n payments | less','WARN telemetry'); expect(page.locator('.pagerText')).to_contain_text('ledger request completed'); quit_pager()
 command('oc logs deployment/payment-api -n payments --tail=1 | cat','/healthz passed')
 command('oc get deployment payment-api -n payments -o yaml | less','TELEMETRY_ENDPOINT'); quit_pager()
 command('oc get pods -n payments | grep payment-api','payment-api')
 command("oc get --raw /apis/apps/v1/namespaces/payments/deployments/payment-api | jq '.metadata.name'",'payment-api')
 command("oc get --raw /api/v1 | jq -r '.resources[].name' | sort | head -n 3",'configmaps')
 command('oc get --raw /api/v1/namespaces/payments/pods/no-such-pod','NotFound')
 command('oc get --raw /unsupported','not implemented')
 command("jq -c 'select(.verb==\"patch\")' audit/kube-apiserver.log > selected.json")
 command("jq -r '.user.username' selected.json",'build-bot')
 command('printf \'%s\\n\' Alpha Alpha Beta > samples.txt'); command("grep -in '^alpha$' samples.txt",'2:Alpha')
 command("cat samples.txt | sort | uniq -c",'2 Alpha'); command("grep -v Beta samples.txt | wc -l",'2')
 command('head -n 1 samples.txt','Alpha'); command('tail -n 1 samples.txt','Beta')
 command("printf '%s\\n' 'a:b:c' | cut -d : -f 1,3",'a:c')
 command('echo Gamma >> samples.txt'); command('tail -n 1 samples.txt','Gamma')
 command("cat samples.txt | grep absent | wc -l",'0'); command("grep '[' samples.txt",'invalid regular expression')
 command('cat samples.txt | tail -f','not implemented'); command('cat samples.txt | more | wc -l','final pipeline')
 command('echo bad > audit/kube-apiserver.log','read-only')
 command('which oc jq less more','/usr/bin/jq'); command('which unknown','no unknown'); command('history | tail -n 2','history | tail')
 command('man jq','jq 1.8.2'); quit_pager()
 field.fill("jq '.' audit/ku"); field.press('Tab'); expect(field).to_have_value("jq '.' audit/kube-apiserver.log ")
 field.fill('less inv'); field.press('Tab'); expect(field).to_have_value('less investigation.txt ')
 command('game save','Progress saved locally'); page.wait_for_function("document.documentElement.dataset.offline==='ready'",polling=50); context.set_offline(True); page.reload(); page.locator('#startBtn').click(); page.evaluate('stepGame()'); open_bastion(page)
 command('tail -n 1 samples.txt','Gamma'); command(audit_query,'build-bot'); command('less investigation.txt','line-80'); quit_pager()
 page.set_viewport_size({'width':390,'height':844}); command('less -N investigation.txt','80 line-80'); expect(page.locator('#terminalPager')).to_be_visible(); assert page.evaluate('document.documentElement.scrollWidth===innerWidth')
 page.screenshot(path=str(out/'bastion-pager-mobile.png')); page.locator('[data-page=next]').click(); page.locator('[data-page=quit]').click(); command('cat samples.txt | wc -l','4')
 assert not errors, errors; assert not failures, failures; browser.close()
receipt={'url':sys.argv[1], 'commands':checked, 'exact_user_audit_query':True, 'pager_keyboard_search_and_touch':True, 'offline_resume':True, 'local_files_retained':True,'browser_errors':errors,'failed_requests':failures}
(out/'bastion-receipt.json').write_text(json.dumps(receipt,indent=2)+'\n'); print(json.dumps(receipt,indent=2))
