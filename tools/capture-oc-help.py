"""Capture native help only; never run operational commands or load user kubeconfig."""
import hashlib,json,os,re,subprocess,sys
from pathlib import Path
client=Path(sys.argv[1] if len(sys.argv)>1 else '/private/tmp/ghostroute-oc422/oc')
env={**os.environ,'KUBECONFIG':'/dev/null','LC_ALL':'C','LANG':'C'}
def capture(args):
 result=subprocess.run([str(client),*args],env=env,text=True,capture_output=True,timeout=20,check=True)
 return {'stdout':result.stdout,'stderr':result.stderr}
def run(args):
 page=capture(args)
 return page['stdout']+page['stderr']
def children(help_text):
 active=False
 for line in help_text.splitlines():
  if line and not line[0].isspace():active=line.rstrip().endswith('Commands:') or line.rstrip()=='Available Commands:'
  if active:
   match=re.match(r'^  ([a-z][a-z0-9-]+)\s{2,}\S',line)
   if match:yield match[1]
queue=[()];pages={};streams={};inventory=[]
while queue:
 path=queue.pop(0);key=' '.join(path)
 if key in pages:continue
 page=capture([*path,'--help']);help_text=page['stdout']+page['stderr'];pages[key]=help_text
 if page['stderr']:streams[key]=page
 inventory.append({'path':'oc'+(' '+key if key else ''),'subcommands':list(children(help_text)),'flags':sorted(set(re.findall(r'^\s+(?:-\w, )?(--[a-z][a-z0-9-]*)',help_text,re.M)))})
 queue.extend((*path,c) for c in children(help_text) if c!='help')
 print('captured',len(pages),'oc '+key,flush=True)
page=capture(['options']);pages['options']=page['stdout']+page['stderr'];streams['options']=page
inventory.append({'path':'oc options','subcommands':[],'flags':sorted(set(re.findall(r'^\s+(?:-\w, )?(--[a-z][a-z0-9-]*)',pages['options'],re.M)))})
version=run(['version','--client'])
Path('src/terminal/oc-help-streams.json').write_text(json.dumps(streams,separators=(',',':'))+'\n')
Path('src/terminal/oc-help-data.json').write_text(json.dumps(pages,ensure_ascii=False,separators=(',',':'))+'\n')
Path('docs/reference/oc-command-inventory.json').write_text(json.dumps({'client':version.strip(),'binarySha256':hashlib.sha256(client.read_bytes()).hexdigest(),'scope':'Native help pages and flags; capture does not establish operational support','pages':len(pages),'commands':inventory},indent=2)+'\n')
print('COMPLETE:',len(pages),'native help pages; no operational commands executed')
