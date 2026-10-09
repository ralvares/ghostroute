import test from 'node:test';
import assert from 'node:assert/strict';
import {S,resetState} from '../.test-build/src/simulation/state.js';
import {applyResource,getResources,deleteResource} from '../.test-build/src/simulation/cluster-api.js';
import {clusterCommand} from '../.test-build/src/terminal/cluster-shell.js';
import {kubeRequest} from '../.test-build/src/simulation/kube-api.js';
import {reconcileServices} from '../.test-build/src/network/services.js';
import {executePodFixture} from '../.test-build/src/simulation/pod-exec.js';
test('Deployment metadata labels, Pod template labels and selector columns preserve their distinct meanings',async()=>{
 resetState();
 const absent=(await clusterCommand('oc get deployments -n payments -L labels')).stdout;
 assert.match(absent,/AGE\s+LABELS\npayment-api/);assert.equal(absent.split('\n').length,3);assert.doesNotMatch(absent,/app=/);
 assert.match((await clusterCommand('oc get deployments -n payments -L app')).stdout,/APP\npayment-api\s+2\/2\s+2\s+2\s+120m\s+payment-api/);
 assert.match((await clusterCommand('oc get deployments -n payments --show-labels')).stdout,/app=payment-api/);
 assert.match((await clusterCommand('oc get deployments -n payments -o wide')).stdout,/app=payment-api/);
 assert.equal(JSON.parse((await clusterCommand('oc get deployments -n payments -l app=payment-api -o json')).stdout).items.length,1);
 const d=getResources('deployments','payments','payment-api')[0];d.spec.template.metadata.labels={app:'wrong'};assert.throws(()=>applyResource(d,'payments'),/selector does not match/);
});
test('Service selectors follow Pod labels and readiness; Route admission does not imply a working backend',()=>{
 resetState();const service=getResources('services','payments','payment-api')[0];assert.deepEqual(service.spec.selector,{app:'payment-api'});
 assert.equal(getResources('endpoints','payments','payment-api')[0].subsets[0].addresses.length,2);
 const pod=S.cluster.resources.find(r=>r.kind==='Pod'&&r.metadata.name==='payment-api-7d9cd-ab12');pod.metadata.labels.app='other';reconcileServices(S.cluster.resources);assert.equal(getResources('endpoints','payments','payment-api')[0].subsets[0].addresses.length,1);
 const second=S.cluster.resources.find(r=>r.kind==='Pod'&&r.metadata.name==='payment-api-7d9cd-cd34');second.status.conditions[0].status='False';reconcileServices(S.cluster.resources);
 assert.equal(getResources('endpoints','payments','payment-api')[0].subsets[0].addresses,undefined);assert.equal(getResources('endpointslices','payments').find(r=>r.metadata.labels['kubernetes.io/service-name']==='payment-api').endpoints[0].conditions.ready,false);
 assert.equal(getResources('routes','payments','payment-api')[0].status.ingress[0].conditions[0].status,'True');
});
test('named Service targetPorts resolve per Pod; DNS requests, readiness and NetworkPolicy govern diagnostics',async()=>{
 resetState();await clusterCommand('oc new-project net');
 for(const [name,app] of [['client','client'],['server','api']])applyResource({apiVersion:'v1',kind:'Pod',metadata:{name,labels:{app}},spec:{containers:[{name:'app',image:'busybox',ports:[{name:'http',containerPort:8080}]}]}},'net');
 applyResource({apiVersion:'v1',kind:'Service',metadata:{name:'api'},spec:{selector:{app:'api'},ports:[{name:'web',port:80,targetPort:'http'}]}},'net');
 assert.equal((await clusterCommand('oc exec client -n net -- curl http://api/health')).error??false,false);
 assert.equal((await clusterCommand('oc exec client -n net -- curl http://api.net.svc.cluster.local/health')).error??false,false);
 applyResource({apiVersion:'networking.k8s.io/v1',kind:'NetworkPolicy',metadata:{name:'block'},spec:{podSelector:{matchLabels:{app:'api'}},policyTypes:['Ingress'],ingress:[]}},'net');assert.match((await clusterCommand('oc exec client -n net -- curl http://api/health')).stderr,/timed out/);
 deleteResource('networkpolicies','block','net');const backend=S.cluster.resources.find(r=>r.kind==='Pod'&&r.metadata.name==='server'&&r.metadata.namespace==='net');backend.status.conditions[1].status='False';reconcileServices(S.cluster.resources);const client=S.cluster.resources.find(r=>r.kind==='Pod'&&r.metadata.name==='client'&&r.metadata.namespace==='net');assert.equal(executePodFixture(client,{command:['curl','http://api/health']}).exitCode,7);
});
