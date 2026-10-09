import {spawnSync} from "node:child_process";
import {mkdtempSync,readFileSync,writeFileSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
const directory=mkdtempSync(join(tmpdir(),"ghostroute-api-oracle-"));
const binary=join(directory,"oracle");
const run=(command,args,options={})=>{
  const result=spawnSync(command,args,{encoding:"utf8",...options});
  if (result.status || result.error) throw Error(result.stderr||String(result.error));
  return result.stdout;
};
try {
 run("go",["build","-o",binary,"."],{cwd:"tools/api-conformance"});
 const header="// Generated from pinned upstream Kubernetes 1.35.2 / OpenShift Go API types.\n// Regenerate with node tools/record-api-fixtures.mjs.\n";
 writeFileSync("src/simulation/strategic-schemas.ts",header+"export const strategicSchemas: Record<string, Record<string, {key?: string; strategies: string[]}>> = "+JSON.stringify(JSON.parse(run(binary,["schema"])),null,2)+";\n");
 writeFileSync("src/simulation/typed-field-orders.ts",header+"export const typedFieldOrders: Record<string, Record<string, string[]>> = "+JSON.stringify(JSON.parse(run(binary,["orders"])),null,2)+";\n");
 const path="tests/fixtures/upstream-patches.json", fixtures=JSON.parse(readFileSync(path,"utf8"));
 for (const c of fixtures.cases) c.expected=JSON.parse(run(binary,[],{input:JSON.stringify(c)}));
 writeFileSync(path,JSON.stringify(fixtures,null,2)+"\n");
 console.log("Recorded native merge strategies, typed field order, and "+fixtures.cases.length+" independent strategic patch cases.");
} finally {rmSync(directory,{recursive:true,force:true});}
