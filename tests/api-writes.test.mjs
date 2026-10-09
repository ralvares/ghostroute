import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {S, resetState, replaceState} from "../.test-build/src/simulation/state.js";
import {kubeRequest, readApiResources, apiBody} from "../.test-build/src/simulation/kube-api.js";
import {clusterCommand} from "../.test-build/src/terminal/cluster-shell.js";
import {mergePatch, jsonPatch} from "../.test-build/src/simulation/api-patch.js";
import {strategicPatch} from "../.test-build/src/simulation/strategic-patch.js";
import {subscribe} from "../.test-build/src/simulation/events.js";
import {encodeProgress, decodeProgress} from "../.test-build/src/simulation/snapshot.js";

const fixture = JSON.parse(readFileSync(new URL("./fixtures/upstream-patches.json", import.meta.url)));
for (const c of fixture.cases) test("upstream strategic merge: " + c.name, () => {
  assert.deepEqual(strategicPatch(c.Kind, c.Object, c.Patch), c.expected);
});
const cmPath = "/api/v1/namespaces/lab/configmaps/settings";
function request(method, path, body, contentType) { return kubeRequest({method, path, body, contentType}); }
function lab() {
  resetState();
  const incident=S;
  assert.equal(request("POST", "/api/v1/namespaces", {apiVersion:"v1",kind:"Namespace",metadata:{name:"lab"}}).code, 201);
  assert.equal(request("POST", "/api/v1/namespaces/lab/configmaps", {apiVersion:"v1",kind:"ConfigMap",metadata:{name:"settings"},data:{keep:"yes",remove:"old"}}).code, 201);
  assert.equal(S,incident,"API writes preserve the command queue's incident identity");
}
function get(path=cmPath) { return apiBody(request("GET",path)); }
const patch = (body, contentType="application/merge-patch+json", path=cmPath) => request("PATCH",path,body,contentType);

test("JSON patch supports escaped pointers, array insertion, copy/move/test, and aborts failed operations", () => {
  const object = {"a/b":{"~key": [1,2]}, source:{label:"x"}};
  const updated = jsonPatch(object, [
    {op:"test",path:"/source",value:{label:"x"}},
    {op:"add",path:"/a~1b/~0key/1",value:9},
    {op:"copy",from:"/source",path:"/copy"},
    {op:"move",from:"/source/label",path:"/copy/moved"},
    {op:"replace",path:"/a~1b/~0key/0",value:3},
    {op:"remove",path:"/a~1b/~0key/2"},
  ]);
  assert.deepEqual(updated, {"a/b":{"~key":[3,9]},source:{},copy:{label:"x",moved:"x"}});
  assert.throws(() => jsonPatch(object,[{op:"add",path:"/new",value:1},{op:"test",path:"/source/label",value:"wrong"}]), /test operation failed/);
  assert.deepEqual(object, {"a/b":{"~key":[1,2]},source:{label:"x"}});
  assert.throws(() => jsonPatch(object,[{op:"add",path:"/a~1b/~0key/01",value:0}]), /array index/);
  assert.throws(() => jsonPatch(object,[{op:"move",from:"/source",path:"/source/nested"}]), /own child/);
  assert.equal({}.polluted, undefined);
  const dangerous = JSON.parse('{"__proto__":{"polluted":true}}');
  assert.equal(mergePatch({},dangerous).__proto__.polluted,true);
  assert.equal({}.polluted,undefined);
  assert.throws(() => jsonPatch({},[{op:"add",path:"/__proto__/polluted",value:true}]), /does not exist/);
});

test("reads do not bump revisions; conditional replacement rejects stale writes and removes omitted fields", () => {
  lab();
  const first=get();
  assert.equal(get().metadata.resourceVersion,first.metadata.resourceVersion);
  assert.equal(patch({data:{keep:"new"}}).code,200);
  const current=get();
  assert.notEqual(current.metadata.resourceVersion,first.metadata.resourceVersion);
  assert.equal(current.metadata.uid,first.metadata.uid);
  assert.equal(request("PUT",cmPath,first).code,409);
  assert.equal(get().data.keep,"new");
  const replacement={apiVersion:"v1",kind:"ConfigMap",metadata:current.metadata};
  assert.equal(request("PUT",cmPath,replacement).code,200);
  assert.equal(get().data,undefined);
});

test("equivalent JSON key order does not change an object's revision", () => {
  lab();
  const original = get();
  const replacement = {data:{remove:"old",keep:"yes"},metadata:original.metadata,kind:"ConfigMap",apiVersion:"v1"};
  assert.equal(request("PUT",cmPath,replacement).code,200);
  assert.equal(get().metadata.resourceVersion,original.metadata.resourceVersion);
});

test("merge/JSON patch delete fields, and a failed test does not persist earlier edits", () => {
  lab();
  assert.equal(patch({data:{remove:null}}).code,200);
  assert.deepEqual(get().data,{keep:"yes"});
  const revision=get().metadata.resourceVersion;
  const response=patch([{op:"replace",path:"/data/keep",value:"bad"},{op:"test",path:"/metadata/resourceVersion",value:"stale"}],"application/json-patch+json");
  assert.equal(response.code,422);
  assert.deepEqual(get().data,{keep:"yes"});
  assert.equal(get().metadata.resourceVersion,revision);
});

test("patch-only and update-only RBAC grants authorize their own verbs without a read grant", () => {
  lab(); S.cluster.user="platform-admin";
  const resources=S.cluster.resources;
  resources.push({apiVersion:"rbac.authorization.k8s.io/v1",kind:"Role",metadata:{name:"writer",namespace:"lab"},rules:[{apiGroups:[""],resources:["configmaps"],resourceNames:["settings"],verbs:["patch"]}]});
  resources.push({apiVersion:"rbac.authorization.k8s.io/v1",kind:"RoleBinding",metadata:{name:"writer",namespace:"lab"},subjects:[{kind:"User",name:"patcher"}],roleRef:{apiGroup:"rbac.authorization.k8s.io",kind:"Role",name:"writer"}});
  S.cluster.user="patcher";
  assert.equal(request("GET",cmPath).code,403);
  assert.equal(patch({data:{keep:"patched"}}).code,200);
  assert.equal(request("PUT",cmPath,{apiVersion:"v1",kind:"ConfigMap",metadata:{name:"settings"}}).code,403);
  assert.equal(patch({data:{keep:"forbidden"}},undefined,cmPath.replace("settings","another")).code,403);
  S.cluster.user="platform-admin";
  S.cluster.resources.find(r=>r.kind==="Role"&&r.metadata.name==="writer").rules[0].verbs=["update"];
  const object=get(); S.cluster.user="patcher";
  assert.equal(request("PUT",cmPath,{...object,data:{keep:"updated"}}).code,200);
  assert.equal(patch({data:{keep:"bad"}}).code,403);
});

test("server dry run performs SCC validation without persisting resources, grants, or controller effects", () => {
  lab(); const before=structuredClone(S.cluster.resources), uid=S.cluster.apiStorage.nextUid;
  const create=request("POST","/api/v1/namespaces/lab/pods?dryRun=All",{apiVersion:"v1",kind:"Pod",metadata:{name:"preview"},spec:{containers:[{name:"app",image:"busybox"}]}});
  assert.equal(create.code,201); assert.equal(create.body.metadata.annotations["openshift.io/scc"],"restricted-v3");
  assert.equal(create.body.metadata.resourceVersion,undefined,"a dry-run create has never been stored");
  assert.deepEqual(S.cluster.resources,before); assert.equal(S.cluster.apiStorage.nextUid,uid);
  const root=request("POST","/api/v1/namespaces/lab/pods?dryRun=All",{apiVersion:"v1",kind:"Pod",metadata:{name:"root"},spec:{containers:[{name:"app",image:"busybox",securityContext:{runAsUser:0}}]}});
  assert.equal(root.code,403); assert.match(root.body.message,/unable to validate/);
  assert.equal(S.cluster.audit.at(-1).annotations["authorization.k8s.io/decision"],"allow");
  assert.deepEqual(S.cluster.resources,before);
  const deployment=request("POST","/apis/apps/v1/namespaces/lab/deployments?dryRun=All",{apiVersion:"apps/v1",kind:"Deployment",metadata:{name:"preview"},spec:{replicas:2,template:{spec:{containers:[{name:"app",image:"busybox"}]}}}});
  assert.equal(deployment.code,201); assert.equal(deployment.body.status,undefined);
  assert.deepEqual(S.cluster.resources,before);
  assert.equal(create.body.spec.nodeName,undefined,"dry run never runs the scheduler");
  assert.equal(create.body.status.phase,"Pending");
  const storedVersion = get().metadata.resourceVersion;
  const preview = patch({data:{keep:"preview"}},undefined,cmPath+"?dryRun=All");
  assert.equal(preview.code,200);
  assert.equal(preview.body.metadata.resourceVersion,storedVersion,"a dry-run update retains the stored revision");
  assert.equal(get().data.keep,"yes");
  assert.equal(request("DELETE",cmPath+"?dryRun=All").code,200); assert.ok(get());
  assert.equal(patch({data:{keep:"bad"}},undefined,cmPath+"?dryRun=wrong").code,400);
});

test("Pod image changes preserve admission, identity and attachment; immutable environment changes are rejected", () => {
  lab();
  const path="/api/v1/namespaces/lab/pods/app";
  request("POST","/api/v1/namespaces/lab/pods",{apiVersion:"v1",kind:"Pod",metadata:{name:"app"},spec:{containers:[{name:"app",image:"registry.example.test/owned:root"}]}});
  const before=get(path);
  const update=patch({spec:{containers:[{name:"app",image:"registry.example.test/owned:arbitrary-uid"}]}},"application/strategic-merge-patch+json",path);
  assert.equal(update.code,200);
  const after=get(path);
  assert.equal(after.metadata.uid,before.metadata.uid);
  assert.equal(after.status.podIP,before.status.podIP);
  assert.equal(after.spec.containers[0].securityContext.runAsUser,before.spec.containers[0].securityContext.runAsUser);
  assert.equal(after.status.containerStatuses[0].ready,true);
  assert.equal(patch({spec:{containers:[{name:"app",env:[{name:"BAD",value:"1"}]}]}},"application/strategic-merge-patch+json",path).code,422);
  assert.deepEqual(get(path).spec,after.spec);
});

test("immutable ConfigMap data and RoleBinding roleRef cannot be changed by an administrator", () => {
  lab();
  assert.equal(patch({immutable:true}).code,200);
  S.cluster.user="platform-admin";
  assert.equal(patch({data:{keep:"changed"}}).code,422);
  assert.equal(patch({metadata:{labels:{owner:"mira"}}}).code,200);
  const path="/apis/rbac.authorization.k8s.io/v1/namespaces/lab/rolebindings/team";
  request("POST",path.slice(0,path.lastIndexOf("/")),{apiVersion:"rbac.authorization.k8s.io/v1",kind:"RoleBinding",metadata:{name:"team"},subjects:[],roleRef:{kind:"ClusterRole",apiGroup:"rbac.authorization.k8s.io",name:"view"}});
  assert.equal(patch({roleRef:{name:"admin"}},undefined,path).code,422);
});

test("Deployment metadata does not roll Pods; scale preserves surviving Pods; delete cleans up owned Pods", () => {
  lab(); const path="/apis/apps/v1/namespaces/lab/deployments/app";
  const object={apiVersion:"apps/v1",kind:"Deployment",metadata:{name:"app"},spec:{replicas:1,selector:{matchLabels:{app:"app"}},template:{metadata:{labels:{app:"app"}},spec:{containers:[{name:"app",image:"busybox"}]}}}};
  assert.equal(request("POST",path.slice(0,path.lastIndexOf("/")),object).code,201);
  const before=readApiResources("pods","lab")[0];
  assert.equal(before.metadata.labels.app,"app");
  assert.equal(patch({metadata:{labels:{owner:"mira"}}},undefined,path).code,200);
  assert.equal(readApiResources("pods","lab")[0].metadata.uid,before.metadata.uid);
  assert.equal(patch({spec:{replicas:2}},undefined,path).code,200);
  assert.equal(readApiResources("pods","lab").length,2);
  assert.equal(readApiResources("pods","lab")[0].metadata.uid,before.metadata.uid);
  assert.equal(patch({spec:{selector:{matchLabels:{app:"other"}}}},undefined,path).code,422);
  assert.equal(request("DELETE",path).code,200); assert.equal(readApiResources("pods","lab").length,0);
});

test("delete preconditions prevent removing a recreated object; revisions and identity survive portable saves", () => {
  lab(); const old=get();
  assert.equal(request("DELETE",cmPath,{preconditions:{resourceVersion:"stale"}}).code,409);
  assert.equal(request("DELETE",cmPath,{preconditions:{uid:old.metadata.uid}}).code,200);
  request("POST","/api/v1/namespaces/lab/configmaps",{apiVersion:"v1",kind:"ConfigMap",metadata:{name:"settings"},data:{keep:"new"}});
  const recreated=get(); assert.notEqual(recreated.metadata.uid,old.metadata.uid);
  assert.equal(request("DELETE",cmPath,{preconditions:{uid:old.metadata.uid}}).code,409);
  const text=encodeProgress(S); replaceState(decodeProgress(text));
  assert.equal(get().metadata.uid,recreated.metadata.uid); assert.equal(get().metadata.resourceVersion,recreated.metadata.resourceVersion);
  const saved=JSON.parse(text); delete saved.data.cluster.apiStorage;
  assert.ok(decodeProgress(JSON.stringify(saved)).cluster.apiStorage);
});

test("CLI scaffolding, JSON patch, replace and dry runs use the shared API and preserve local files", async () => {
  lab();
  const scaffold=await clusterCommand("oc run preview -n lab --image=busybox --dry-run=client -o yaml > preview.yaml"); assert.equal(scaffold.error,false);
  assert.equal(readApiResources("pods","lab").length,0);
  assert.match((await clusterCommand("cat preview.yaml")).stdout,/namespace: lab/);
  assert.match((await clusterCommand("oc create -f preview.yaml --dry-run=server")).stdout,/server dry run/);
  assert.equal(readApiResources("pods","lab").length,0);
  await clusterCommand("oc create -f preview.yaml");
  assert.match((await clusterCommand(`oc patch cm settings -n lab --type=json -p '[{"op":"remove","path":"/data/remove"}]'`)).stdout,/patched/);
  assert.deepEqual(get().data,{keep:"yes"});
  await clusterCommand("oc get cm settings -n lab -o json > settings.json");
  assert.match((await clusterCommand("oc replace -f settings.json -n lab")).stdout,/replaced/);
  await clusterCommand("oc delete cm settings -n lab --dry-run=server"); assert.ok(get());
  const current=get();
  await assert.rejects(clusterCommand(`oc patch cm settings -n lab --type=merge -p '{"data":{"keep":"bad"}}' -o unsupported`));
  assert.equal(get().metadata.resourceVersion,current.metadata.resourceVersion);
});

test("impersonated writes restore the authenticated user before notifying subscribers or saving", () => {
  lab(); S.cluster.user="platform-admin"; const notifications=[];
  const unsubscribe=subscribe(()=>notifications.push({user:S.cluster.user,audit:S.cluster.audit.at(-1)}));
  try {
    const response=kubeRequest({method:"PATCH",path:cmPath,body:{data:{keep:"impersonated"}},contentType:"application/merge-patch+json",impersonateUser:"operator"});
    assert.equal(response.code,200);
    assert.equal(S.cluster.user,"platform-admin"); assert.ok(notifications.length);
    assert.ok(notifications.every(n=>n.user==="platform-admin"));
    assert.equal(S.cluster.audit.at(-1).user.username,"platform-admin");
    assert.equal(S.cluster.audit.at(-1).impersonatedUser.username,"operator");
  } finally {unsubscribe();}
});
