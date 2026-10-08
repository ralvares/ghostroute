from browser_helpers import open_bastion
"""Real production-terminal proof for cluster, SCC, jq and Go templates."""
import json
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

errors, requests = [], []
with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1440, "height": 1000})
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.on('requestfailed', lambda request: requests.append(request.url))
    page.goto(sys.argv[1])
    page.locator('#startBtn').click()
    open_bastion(page)
    field = page.locator('#termInput')

    def command(text, contains):
        field.fill(text)
        field.press('Enter')
        output = page.locator('.termline').last
        expect(output).to_contain_text(contains, timeout=10000)
        return output.inner_text()

    command('oc create namespace lab', 'namespace/lab created')
    namespaces = command('oc get namespaces', 'lab')
    assert 'openshift-*' not in namespaces
    command('oc project lab', 'Now using project "lab"')
    command('oc apply -f workloads/owned-root.yaml', 'unable to validate against any security context constraint')
    command('oc apply -f workloads/owned-secure.yaml', 'pod/owned-secure created')
    command("oc get pod owned-secure -o json | jq -r '.metadata.annotations[\"openshift.io/scc\"]'", 'restricted-v3')
    command("oc get pods -o go-template='{{range .items}}{{.metadata.name}}{{\"\\n\"}}{{end}}'", 'owned-secure')
    command('oc create serviceaccount vendor', 'serviceaccount/vendor created')
    command('oc apply -f workloads/vendor.yaml', 'deployment.apps/vendor created')
    command('oc rollout status deployment/vendor', '0 of 1')
    command('oc get events', 'FailedCreate')
    command('oc describe deployment vendor', 'runAsUser: Invalid value: 1001')
    command('oc adm policy add-scc-to-user anyuid -z vendor', 'cannot create resource "rolebindings"')
    command("cat audit/kube-apiserver.log | jq -r 'select(.responseStatus.code == 403) | .user.username' | sort", 'operator')
    command('oc login -u platform-admin -p training', 'Logged into simulated')
    command('oc adm policy add-scc-to-user anyuid -z vendor', 'added')
    command('oc rollout restart deployment/vendor', 'restarted')
    command('oc rollout status deployment/vendor', 'successfully rolled out')
    command('oc adm policy remove-scc-from-user anyuid -z vendor', 'removed')
    command('oc apply -f scc/vendor-fixed-uid.yaml', 'created')
    command('oc adm policy add-scc-to-user vendor-fixed-uid -z vendor', 'added')
    command('oc rollout restart deployment/vendor', 'restarted')
    command("oc get pods -o json | jq -r '.items[] | select(.metadata.name | startswith(\"vendor-sim\")) | .metadata.annotations[\"openshift.io/scc\"]'", 'vendor-fixed-uid')
    command('oc auth can-i use scc/vendor-fixed-uid --as=system:serviceaccount:lab:vendor', 'yes')
    command('oc auth can-i use scc/anyuid --as=system:serviceaccount:lab:default', 'no')
    command("oc adm node-logs master-01 --path=kube-apiserver/audit.log | jq -r 'select(.verb == \"patch\") | .user.username'", 'build-bot')
    custom = json.dumps({'apiVersion':'v1', 'kind':'ConfigMap', 'metadata':{'name':'investigation'}, 'data':{'case':'018'}})
    command(f"echo '{custom}' > workloads/investigation.json", "echo")
    command('oc apply -f workloads/investigation.json', 'configmap/investigation created')
    command("oc get configmap investigation -o go-template='{{index .data \"case\"}}'", '018')
    command("oc get configmaps -o json | jq '.items | length'", '1')
    command('oc delete configmap investigation', 'deleted')
    command('oc get configmap investigation', 'NotFound')
    command('oc login -u operator -p training', 'Logged into simulated')
    command('oc apply -f workloads/owned-root.yaml', 'Forbidden')
    command("oc get pods -o json | jq 'this is invalid'", 'jq:')
    command('oc get pods', 'owned-secure')
    page.screenshot(path='artifacts/migrated/cluster-scc.png')
    assert not errors, errors
    assert not requests, requests
    browser.close()

receipt = {'checks':['Namespace/context persistence', 'SCC admission and owned-app repair', 'Real jq filters and malformed-query recovery', 'Real Go range/index templates', 'Deployment/controller failure distinction', 'RBAC denies escalation', 'anyuid grant/revoke', 'Scoped custom SCC', 'Audit investigation', 'User manifest CRUD'], 'browser_errors':errors, 'failed_requests':requests}
Path('artifacts/migrated/cluster-receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps(receipt,indent=2))
