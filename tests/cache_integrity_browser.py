"""Reject a cache whose HTML comes from a different build, then retry online."""
import json, shutil, tempfile, threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

with tempfile.TemporaryDirectory(prefix='ghostroute-integrity-') as directory:
    target = Path(directory) / 'ghostroute'
    shutil.copytree('dist', target)
    original = (target / 'index.html').read_bytes()
    (target / 'index.html').write_bytes(original + b'\n<!-- another build -->\n')
    class Quiet(SimpleHTTPRequestHandler):
        def log_message(self, *args): pass
    server = ThreadingHTTPServer(('127.0.0.1', 4190), partial(Quiet, directory=directory))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    errors = []
    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context()
        page = context.new_page()
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto('http://127.0.0.1:4190/ghostroute/')
        page.wait_for_function("document.documentElement.dataset.offline === 'error'", polling=50, timeout=35000)
        expect(page.locator('#startBtn')).to_be_visible()
        assert page.evaluate('navigator.serviceWorker.controller === null')
        assert page.evaluate("caches.keys().then(keys => keys.filter(key => key.startsWith('nexus-offline:')))") == []
        # A rejected install must leave the game usable online and allow recovery.
        (target / 'index.html').write_bytes(original)
        page.reload()
        page.wait_for_function("document.documentElement.dataset.offline === 'ready'", polling=50, timeout=35000)
        context.set_offline(True)
        page.reload()
        expect(page.locator('#startBtn')).to_be_visible()
        page.wait_for_function("document.documentElement.dataset.offline === 'ready'", polling=50)
        assert not errors, errors
        browser.close()
    server.shutdown()
receipt = {'mixed_build_rejected': True, 'incomplete_cache_removed': True,
           'online_retry': True, 'offline_after_recovery': True, 'browser_errors': errors}
Path('artifacts/campaign/cache-integrity-receipt.json').write_text(json.dumps(receipt, indent=2) + '\n')
print(json.dumps(receipt, indent=2))
