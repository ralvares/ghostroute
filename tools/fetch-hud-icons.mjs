import { mkdir, writeFile } from 'node:fs/promises';
const version='v3.36.0';
const names=['map','briefcase','book-2','route','folder','eye','map-pin','train','menu-2','alert-triangle','x','arrow-left','arrow-right','check'];
await mkdir('public/ui',{recursive:true});
for(const name of names){
 const response=await fetch(`https://raw.githubusercontent.com/tabler/tabler-icons/${version}/icons/outline/${name}.svg`);
 if(!response.ok)throw Error(`${name}: ${response.status}`);
 await writeFile(`public/ui/${name}.svg`,await response.text());
}
const license=await fetch(`https://raw.githubusercontent.com/tabler/tabler-icons/${version}/LICENSE`);
if(!license.ok)throw Error('Missing Tabler license');
await writeFile('public/ui/Tabler-LICENSE',await license.text());
console.log(`Saved ${names.length} official Tabler icons (${version}) and MIT license`);
