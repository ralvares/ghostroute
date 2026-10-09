import test from "node:test";
import assert from "node:assert/strict";
import { S,resetState,replaceState } from "../.test-build/src/simulation/state.js";
import { kubeRequest,apiBody,readApiResources } from "../.test-build/src/simulation/kube-api.js";
import { clusterCommand } from "../.test-build/src/terminal/cluster-shell.js";
import { projectHealth } from "../.test-build/src/simulation/health.js";
import { worldObjects } from "../.test-build/src/world/locations.js";
import { encodeProgress,decodeProgress } from "../.test-build/src/simulation/snapshot.js";
import { verifyRollout,testConnection } from "../.test-build/src/simulation/operations.js";
import { removeTelemetry } from "../.test-build/src/simulation/operations.js";
import { networkPolicyDirection } from "../.test-build/src/security/network-policy.js";
const deploymentPath="/apis/apps/v1/namespaces/payments/deployments/payment-api";
const policyPath="/apis/networking.k8s.io/v1/namespaces/payments/networkpolicies";

test("older checkpoints materialize the incident once while retaining the recorded generation",()=>{
  resetState();removeTelemetry();const old=JSON.parse(encodeProgress(S));
  delete old.data.cluster.incidentStored;delete old.data.cluster.apiStorage;
  old.data.cluster.resources=old.data.cluster.resources.filter(r=>!(r.metadata.namespace==="payments" && ["Deployment","Pod","NetworkPolicy"].includes(r.kind)));
  replaceState(decodeProgress(JSON.stringify(old)));
  assert.equal(readApiResources("deployments","payments","payment-api")[0].metadata.generation,2);
  assert.equal(S.env,false);assert.equal(S.pods.length,2);
  const twice=decodeProgress(encodeProgress(S));assert.equal(twice.cluster.resources.filter(r=>r.kind==="Deployment"&&r.metadata.name==="payment-api").length,1);
});

test("the first incident accepts ordinary CLI patches; previews preserve the scene and identity",async()=>{
  resetState();const before=readApiResources("deployments","payments","payment-api")[0];
  const pods=S.pods.map(p=>p.name);
  const preview=await clusterCommand("oc set env deployment/payment-api -n payments TELEMETRY_ENDPOINT- --dry-run=server");
  assert.match(preview.stdout,/server dry run/);assert.equal(S.env,true);assert.deepEqual(S.pods.map(p=>p.name),pods);
  const update=await clusterCommand(`oc patch deployment payment-api -n payments --type=json -p '[{"op":"remove","path":"/spec/template/spec/containers/0/env/0"}]'`);
  assert.match(update.stdout,/patched/);assert.equal(S.env,false);assert.equal(S.patchSeen,true);
  assert.notDeepEqual(S.pods.map(p=>p.name),pods);assert.equal(S.pods.length,2);
  const current=readApiResources("deployments","payments","payment-api")[0];assert.equal(current.metadata.uid,before.metadata.uid);
  assert.equal(S.cluster.resources.filter(r=>r.kind==="Deployment"&&r.metadata.name==="payment-api").length,1);
  assert.equal(kubeRequest({method:"PUT",path:deploymentPath,body:before}).code,409);
  assert.equal((await clusterCommand("oc set env deployment/payment-api -n payments SAFE=1")).error,false);
  assert.equal(S.deployment.env.SAFE,"1");assert.equal(S.env,false);
});

test("renamed policies, selectors and deletions drive real dependency consequences",()=>{
  resetState();
  const deny={apiVersion:"networking.k8s.io/v1",kind:"NetworkPolicy",metadata:{name:"incident-boundary",namespace:"payments"},spec:{podSelector:{matchExpressions:[{key:"app",operator:"In",values:["payment-api"]}]},policyTypes:["Egress"],egress:[]}};
  apiBody(kubeRequest({method:"POST",path:policyPath,body:deny}));
  assert.equal(projectHealth(S).checkout,"DEGRADED");assert.equal(S.firstDeny,true);assert.equal(S.pods.every(p=>p.ready),true);
  assert.equal(testConnection("ledger"),false);assert.equal(testConnection("external"),false);
  apiBody(kubeRequest({method:"PATCH",path:policyPath+"/incident-boundary",contentType:"application/merge-patch+json",body:{spec:{egress:[{to:[{podSelector:{matchLabels:{app:"ledger"}}}],ports:[{port:8443}]}]}}}));
  assert.equal(S.incidentNetwork.ledger,true);assert.equal(S.incidentNetwork.dns,false);assert.equal(projectHealth(S).checkout,"DEGRADED");
  apiBody(kubeRequest({method:"DELETE",path:policyPath+"/incident-boundary"}));
  assert.equal(S.policy,"none");assert.equal(projectHealth(S).checkout,"HEALTHY");assert.equal(S.incidentNetwork.external,true);
  assert.equal(S.interruptions,1);
});

test("scale retains original replicas; deleted Pods are replaced; empty worker rooms are safe",async()=>{
  resetState();const first=readApiResources("pods","payments").filter(p=>p.metadata.labels?.app==="payment-api");
  await clusterCommand("oc scale deployment payment-api -n payments --replicas=3");
  assert.equal(S.pods.length,3);for(const pod of first)assert.ok(readApiResources("pods","payments").some(p=>p.metadata.uid===pod.metadata.uid));
  apiBody(kubeRequest({method:"DELETE",path:"/api/v1/namespaces/payments/pods/"+first[0].metadata.name}));
  assert.equal(S.pods.length,3);assert.ok(!readApiResources("pods","payments").some(p=>p.metadata.uid===first[0].metadata.uid));
  await clusterCommand("oc scale deployment payment-api -n payments --replicas=0");
  assert.equal(S.pods.length,0);assert.equal(projectHealth(S).checkout,"DEGRADED");assert.equal(verifyRollout(),false);assert.equal(testConnection("ledger"),false);
  assert.equal(projectHealth(S).externalActive,false);assert.equal(S.findings.baselineDeviation,false);
  S.world.scene="worker-01";assert.equal(worldObjects(S).some(o=>o.id==="pod1"),false);
  await assert.rejects(clusterCommand("oc rsh deployment/payment-api -n payments"),/no running/);
  replaceState(decodeProgress(encodeProgress(S)));assert.equal(S.pods.length,0);assert.equal(readApiResources("pods","payments").filter(p=>p.metadata.labels?.app==="payment-api").length,0);
});

test("incident reachability checks destination ingress and UDP DNS, including ledger readiness",()=>{
  resetState();
  const ingress={apiVersion:"networking.k8s.io/v1",kind:"NetworkPolicy",metadata:{name:"ledger-isolation",namespace:"payments"},spec:{podSelector:{matchLabels:{app:"ledger"}},policyTypes:["Ingress"],ingress:[]}};
  apiBody(kubeRequest({method:"POST",path:policyPath,body:ingress}));
  assert.equal(S.incidentNetwork.ledger,false);assert.equal(S.incidentNetwork.dns,true);
  assert.equal(S.findings.baselineDeviation,true);assert.equal(projectHealth(S).externalActive,true);
  apiBody(kubeRequest({method:"DELETE",path:policyPath+"/ledger-isolation"}));
  assert.equal(S.incidentNetwork.ledger,true);
  apiBody(kubeRequest({method:"POST",path:policyPath,body:{...ingress,metadata:{name:"tcp-only",namespace:"payments"},spec:{podSelector:{matchLabels:{app:"payment-api"}},policyTypes:["Egress"],egress:[{ports:[{port:53,protocol:"TCP"},{port:8443}]}]}}}));
  assert.equal(S.incidentNetwork.dns,false);assert.equal(S.incidentNetwork.ledger,true);
  apiBody(kubeRequest({method:"DELETE",path:"/api/v1/namespaces/payments/pods/ledger-86bbb-zyx12"}));
  assert.equal(S.incidentNetwork.ledger,false);
});

test("IP exceptions, protocols, port ranges and empty peer lists use tenant policy semantics",()=>{
  const pod={apiVersion:"v1",kind:"Pod",metadata:{name:"app",namespace:"n",labels:{app:"a"}}};
  const policy={apiVersion:"networking.k8s.io/v1",kind:"NetworkPolicy",metadata:{name:"p",namespace:"n"},spec:{podSelector:{},policyTypes:["Egress"],egress:[{to:[{ipBlock:{cidr:"203.0.113.0/24",except:["203.0.113.77/32"]}}],ports:[{protocol:"TCP",port:440,endPort:450}]}]}};
  assert.equal(networkPolicyDirection([policy],pod,undefined,"egress",443,"TCP","203.0.113.77"),false);
  assert.equal(networkPolicyDirection([policy],pod,undefined,"egress",443,"TCP","203.0.113.78"),true);
  assert.equal(networkPolicyDirection([policy],pod,undefined,"egress",443,"UDP","203.0.113.78"),false);
  policy.spec.egress=[{to:[],ports:[]}];assert.equal(networkPolicyDirection([policy],pod,undefined,"egress",443,"TCP","198.51.100.1"),true);
});

test("NetworkPolicy defaults follow upstream empty-egress and protocol rules",()=>{
  resetState();
  const policy={apiVersion:"networking.k8s.io/v1",kind:"NetworkPolicy",metadata:{name:"defaults",namespace:"payments"},spec:{podSelector:{matchLabels:{app:"payment-api"}},egress:[]}};
  const stored=apiBody(kubeRequest({method:"POST",path:policyPath,body:policy}));
  assert.deepEqual(stored.spec.policyTypes,["Ingress"]);assert.equal(S.incidentNetwork.external,true);
  const preview=apiBody(kubeRequest({method:"PATCH",path:policyPath+"/defaults?dryRun=All",contentType:"application/merge-patch+json",body:{spec:{policyTypes:[],egress:[{ports:[{port:8443}]}]}}}));
  assert.deepEqual(preview.spec.policyTypes,["Ingress","Egress"]);assert.equal(preview.spec.egress[0].ports[0].protocol,"TCP");
  assert.deepEqual(readApiResources("networkpolicies","payments","defaults")[0].spec.policyTypes,["Ingress"]);
});
