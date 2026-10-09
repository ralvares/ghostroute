import {createServer} from "node:http";
import {spawn,spawnSync} from "node:child_process";
import {mkdtempSync, writeFileSync, mkdirSync, rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import assert from "node:assert/strict";
import {kubeRequest} from "../.test-build/src/simulation/kube-api.js";
import {clusterCommand} from "../.test-build/src/terminal/cluster-shell.js";
import {S,resetState} from "../.test-build/src/simulation/state.js";

const directory=mkdtempSync(join(tmpdir(),"ghostroute-write-conformance-"));
const server=createServer(async(req,res)=>{
  const chunks=[]; for await (const chunk of req) chunks.push(chunk);
  const bytes=Buffer.concat(chunks);
  let body;
  if (bytes.length) {
    if (req.headers["content-type"]?.includes("kubernetes.protobuf")) {
      const decoded=spawnSync(process.env.GHOSTROUTE_API_ORACLE ?? "/private/tmp/ghostroute-api-oracle",["decode"],{input:bytes,encoding:"utf8"});
      if (decoded.status) throw Error(decoded.stderr);
      body=JSON.parse(decoded.stdout);
    } else body=JSON.parse(bytes.toString());
  }
  const response=kubeRequest({method:req.method,path:req.url,body,accept:req.headers.accept,contentType:req.headers["content-type"]?.split(";")[0],impersonateUser:req.headers["impersonate-user"]});
  res.writeHead(response.code,{"Content-Type":"application/json"});res.end(JSON.stringify(response.body));
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const native=args=>new Promise((resolve,reject)=>{
  const process=spawn(globalThis.process.env.GHOSTROUTE_OC ?? "oc",args);let stdout="",stderr="";
  process.stdout.on("data",v=>stdout+=v);process.stderr.on("data",v=>stderr+=v);
  process.on("error",reject);process.on("exit",code=>resolve({stdout,stderr,code}));
});
const quote=value=>"'"+value.replaceAll("'","'\\''")+"'";
function setup() {
  resetState();
  kubeRequest({method:"POST",path:"/api/v1/namespaces",body:{apiVersion:"v1",kind:"Namespace",metadata:{name:"lab"}}});
  kubeRequest({method:"POST",path:"/api/v1/namespaces/lab/configmaps",body:{apiVersion:"v1",kind:"ConfigMap",metadata:{name:"settings"},data:{keep:"yes",remove:"old"}}});
}
const cases=[
 ["create","namespace","new-tenant"],
 ["create","namespace","preview","--dry-run=client","-o","json"],
 ["create","namespace","preview","--dry-run=server","-o","json"],
 ["create","configmap","copy","--from-literal=a=b"],
 ["create","configmap","copy","--from-literal=a=b","--dry-run=client","-o","json"],
 ["create","configmap","copy","--from-literal=a=b","--dry-run=server","-o","json"],
 ["create","secret","generic","token","--from-literal=password=training","--dry-run=client","-o","json"],
 ["create","secret","generic","token","--from-literal=password=training","--dry-run=server","-o","json"],
 ["patch","configmap","settings","--type=merge","-p",'{"data":{"remove":null,"keep":"changed"}}'],
 ["patch","configmap","settings","--type=merge","-p",'{"data":{"remove":null}}',"-o","json"],
 ["patch","configmap","settings","--type=json","-p",'[{"op":"remove","path":"/data/remove"}]',"-o","json"],
 ["patch","configmap","settings","-p",'{"data":{"keep":"preview"}}',"--dry-run=server"],
 ["patch","configmap","settings","-p",'{"data":{"keep":"preview"}}',"--dry-run=client","-o","json"],
 ["label","configmap","settings","owner=mira"],
 ["annotate","configmap","settings","investigation=verified","--dry-run=server"],
 ["delete","configmap","settings","--dry-run=server"],
];
const results=[];
try {
  const client=(await native(["version","--client"])).stdout.trim();
  for (const args of cases) {
    setup();
    const expected=await native([`--server=http://127.0.0.1:${server.address().port}`,"--kubeconfig=/dev/null",`--cache-dir=${directory}`,"--request-timeout=10s","-n","lab",...args,...(args[0]==="create" ? ["--validate=false"] : [])]);
    setup();
    const actual=await clusterCommand("oc "+args.map(quote).join(" ")+" -n lab");
    if (expected.code) throw Error(`Native command failed: ${args.join(" ")}\n${expected.stderr}`);
    assert.equal(actual.error,false);
    assert.equal(actual.stdout,expected.stdout,`Native client mismatch: oc ${args.join(" ")}`);
    results.push("oc "+args.map(quote).join(" "));console.log("MATCH: "+results.at(-1));
  }
  mkdirSync("artifacts/campaign",{recursive:true});
  writeFileSync("artifacts/campaign/native-oc-writes.json",JSON.stringify({client,server:"offline mock API; CLI byte comparison, not acceptance against a live server",commands:results,byte_exact:true},null,2)+"\n");
} finally {server.close();rmSync(directory,{recursive:true,force:true});}
