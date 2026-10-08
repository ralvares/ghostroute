from browser_helpers import open_bastion
"""Cold offline reload, persistent browser restart, portable saves and WASM timings."""
import json
import sys
import time
from pathlib import Path
from tempfile import TemporaryDirectory
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright, expect

errors = []
timings = {}
WORKER_TIMING = """
window.queryTimings = [];
window.queryWorkers = 0;
const NativeWorker = window.Worker;
window.Worker = class extends NativeWorker {
  constructor(...args) { super(...args); window.queryWorkers++; }
  postMessage(data, ...args) {
    const start = performance.now();
    this.addEventListener('message', () => {
      window.queryTimings.push({tool:data.tool, ms: +(performance.now()-start).toFixed(2)});
    }, {once:true});
    super.postMessage(data, ...args);
  }
};
"""
with TemporaryDirectory(prefix='ghost-route-profile-') as profile, sync_playwright() as p:
    context = p.chromium.launch_persistent_context(profile, viewport={'width':1440,'height':1000}, headless=True)
    page = context.pages[0]
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(sys.argv[1])
    page.wait_for_function("document.documentElement.dataset.offline === 'ready'", timeout=30000)
    page.locator('#startBtn').click()
    open_bastion(page)

    def command(text, contains):
        start = time.perf_counter()
        field = page.locator('#termInput')
        field.fill(text)
        field.press('Enter')
        expect(page.locator('.termline').last).to_contain_text(contains, timeout=10000)
        expect(page.locator('#termform')).to_have_attribute('aria-busy', 'false', timeout=10000)
        page.wait_for_function("document.documentElement.dataset.progress === 'saved'")
        return round((time.perf_counter()-start)*1000, 1)

    command('oc create namespace offline-lab', 'created')
    command('oc project offline-lab', 'Now using')
    command('oc create serviceaccount vendor', 'created')
    command('oc login -u platform-admin -p training', 'Logged into')
    command('oc apply -f scc/vendor-fixed-uid.yaml', 'created')
    command('oc adm policy add-scc-to-user vendor-fixed-uid -z vendor', 'added')
    command('oc apply -f workloads/vendor.yaml', 'created')
    command('oc rollout status deployment/vendor', 'successfully rolled out')
    command('oc logs deployment/payment-api -n payments', 'WARN telemetry')
    expect(page.locator('#evidenceCount')).to_have_text('1 / 5')
    command('oc set env deployment/payment-api -n payments TELEMETRY_ENDPOINT-', '2 new Pods')
    command('oc apply -f policies/payments-egress.yaml', 'Selected Pods may reach')
    custom = json.dumps({'apiVersion':'v1','kind':'ConfigMap','metadata':{'name':'saved'},'data':{'proof':'offline'}})
    command(f"echo '{custom}' > workloads/saved.json", 'echo')
    command('oc apply -f workloads/saved.json', 'created')
    command('mkdir -p investigation/evidence', 'mkdir')
    command('cd investigation/evidence', 'cd')
    command("echo 'saved-local-notes' > notes.txt", 'echo')
    # No query tools have run yet. Their first use must work without a network.
    context.set_offline(True)
    command('game status', 'Offline installation: ready')
    with page.expect_download() as download:
        command('game export', 'Downloaded roadshow-progress.json')
    backup = Path(profile)/'backup.json'
    download.value.save_as(backup)
    saved = json.loads(backup.read_text())
    assert saved['data']['cluster']['files']['workloads/saved.json'].strip() == custom
    context.close()

    # Restart the browser with the same disk profile and disconnect before navigation.
    context = p.chromium.launch_persistent_context(profile, viewport={'width':1440,'height':1000}, headless=True)
    context.set_offline(True)
    page = context.pages[0]
    page.on('pageerror', lambda error: errors.append(str(error)))
    started = time.perf_counter()
    page.add_init_script(WORKER_TIMING)
    page.goto(sys.argv[1])
    expect(page.locator('#startBtn')).to_have_text('Resume the case →')
    timings['offline_navigation_and_restore_ms'] = round((time.perf_counter()-started)*1000,1)
    page.locator('#startBtn').click()
    expect(page.locator('#evidenceCount')).to_have_text('1 / 5')
    expect(page.locator('#exposure')).to_have_text('CONTAINED')
    open_bastion(page)
    expect(page.locator('#termPrompt')).to_have_text('platform-admin@bastion:~/investigation/evidence$')
    command('cat notes.txt', 'saved-local-notes')
    command('pwd', '/home/operator/investigation/evidence')
    command('cd ~', 'cd')
    command('oc project', 'offline-lab')
    command('oc rollout status deployment/vendor', 'successfully rolled out')
    query = "oc get configmap saved -o json | jq -r '.data.proof'"
    timings['cold_offline_jq_command_ms'] = command(query,'offline')
    timings['warm_jq_command_ms'] = [command(query,'offline') for _ in range(5)]
    query = "oc get configmap saved -o go-template='{{index .data \"proof\"}}'"
    timings['cold_offline_go_command_ms'] = command(query,'offline')
    timings['warm_go_command_ms'] = [command(query,'offline') for _ in range(5)]
    timings['worker_roundtrip_ms'] = page.evaluate('queryTimings')
    assert page.evaluate('queryWorkers') == 2, 'WASM workers should stay warm between queries'
    command('cat workloads/saved.json', 'offline')
    command('oc auth can-i use scc/vendor-fixed-uid --as=system:serviceaccount:offline-lab:vendor', 'yes')
    command("cat audit/kube-apiserver.log | jq -r 'select(.verb == \"patch\") | .user.username'", 'build-bot')
    # A hung jq expression is isolated; the next command receives a fresh engine.
    command("oc get pods -o json | jq 'repeat(0) | empty'", '5-second execution limit')
    command("oc get configmaps -o json | jq '.items | length'", '1')
    # Import the backup after clearing; replacement restores context, files and evidence.
    page.locator('#restartTop').click()
    page.wait_for_function("document.documentElement.dataset.progress === 'saved'")
    page.locator('#startBtn').click()
    open_bastion(page)
    with page.expect_file_chooser() as chooser:
        command('game import', 'Choose a game progress file')
    chooser.value.set_files(backup)
    expect(page.locator('#startBtn')).to_have_text('Resume the case →')
    page.locator('#startBtn').click()
    expect(page.locator('#evidenceCount')).to_have_text('1 / 5')
    open_bastion(page)
    command('cat notes.txt', 'saved-local-notes')
    command('pwd', '/home/operator/investigation/evidence')
    command('cd ~', 'cd')
    command('oc project', 'offline-lab')
    command('oc get configmap saved', 'saved')
    # Invalid imports leave the current incident playable.
    with page.expect_file_chooser() as chooser:
        command('game import', 'Choose a game progress file')
    chooser.value.set_files({'name':'broken.json','mimeType':'application/json','buffer':b'{}'})
    expect(page.locator('.termline').last).to_contain_text('Import failed')
    command('oc project','offline-lab')
    assert not errors, errors
    context.close()

receipt = {'checks':['All build/WASM assets available after offline browser restart','Incident/evidence/cluster/files/SCC grants survive restart','Real jq and Go templates first used offline','Warm workers reused','Hung jq worker replaced','Portable export/import','Invalid import preserves live progress'], 'timings_include_dom_input_and_autosave':timings,'browser_errors':errors}
Path('artifacts/migrated').mkdir(parents=True,exist_ok=True)
receipt['url'] = sys.argv[1]
name = 'offline-subpath-receipt.json' if urlparse(sys.argv[1]).path.strip('/') else 'offline-receipt.json'
Path('artifacts/migrated', name).write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps(receipt,indent=2))
