"""Read-only source inventory and bounded anonymous HTTP probes. Never logs secrets."""
import ast,datetime,hashlib,json,re,time,urllib.request,urllib.error
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/evidence/full-audit-2026-11-02'
OUT.mkdir(parents=True,exist_ok=True)
def save(name,data):
 (OUT/name).write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf8')
sources=list((ROOT/'web/src').rglob('*.ts'))+list((ROOT/'web/src').rglob('*.tsx'))+list((ROOT/'ai-service/app').glob('*.py'))
inventory=[]
for p in sources:
 text=p.read_text(encoding='utf-8-sig')
 inventory.append({'file':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'methods':re.findall(r'export async function (GET|POST|PUT|PATCH|DELETE)',text),'hrefs':sorted(set(re.findall(r'href=["\']([^"\']+)',text))),'forms':text.count('<form'),'buttons':text.count('<button'),'disabledExpressions':re.findall(r'disabled=\{([^}]{0,200})\}',text),'markers':sorted(set(re.findall(r'\b(?:TODO|FIXME|mock|placeholder|setInterval|setTimeout)\b',text,re.I)))})
sql=[]
for p in sorted((ROOT/'database/postgres').glob('*.sql')):
 text=p.read_text(encoding='utf-8-sig');sql.append({'file':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'tables':re.findall(r'create table(?: if not exists)? ([\w.]+)',text,re.I),'functions':re.findall(r'create(?: or replace)? function ([\w.]+)',text,re.I),'triggers':re.findall(r'create trigger ([\w]+)',text,re.I),'policies':re.findall(r'create policy ([\w]+)',text,re.I)})
save('source-inventory.json',{'capturedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'files':inventory,'sql':sql,'tests':[str(p.relative_to(ROOT)) for p in (ROOT/'web/tests').iterdir() if p.is_file()],'eslintConfigured':any((ROOT/'web'/n).exists() for n in ['eslint.config.mjs','eslint.config.js','.eslintrc.json'])})
def probe(url,method='GET',data=None,headers=None):
 start=time.perf_counter();request=urllib.request.Request(url,data=data,method=method,headers=headers or {})
 try:response=urllib.request.urlopen(request,timeout=35)
 except urllib.error.HTTPError as e:response=e
 except Exception as e:return {'url':url,'method':method,'error':type(e).__name__,'status':'BLOCKED'}
 body=response.read();item={'url':url,'method':method,'http':response.status,'ms':round((time.perf_counter()-start)*1000,1),'bytes':len(body),'finalUrl':response.url,'cacheControl':response.headers.get('cache-control'),'nosniff':response.headers.get('x-content-type-options')}
 try:
  result=json.loads(body);item['json']=result
 except Exception:pass
 return item
paths=['/api/health/live','/api/health/ready','/api/ai/health','/api/public/catalog','/api/public/categories','/api/public/knowledge','/api/public/locations','/api/public/not-a-section','/api/quizzes','/api/admin','/api/member','/api/recommendations?label=bottle','/api/location-evidence?id=00000000-0000-4000-8000-000000000001']
results=[probe('http://127.0.0.1:3000'+p) for p in paths]
for p in ['/api/admin','/api/member','/api/scans','/api/disposals','/api/quiz','/api/auth','/api/ai/detect','/api/location-evidence']:
 for origin in ['http://untrusted.invalid','http://127.0.0.1:3000']:
  results.append(probe('http://127.0.0.1:3000'+p,'POST',b'{}',{'Content-Type':'application/json','Origin':origin}))
save('anonymous-api-probes.json',{'capturedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'scope':'Anonymous, no auth email, no production inserts. Empty invalid requests only.','results':results})
environment={}
import shutil,subprocess
for name in ['docker','wsl','supabase','node','python']:
 environment[name]=shutil.which(name)
for command in [['docker','info','--format','{{.ServerVersion}}'],['wsl','--status']]:
 if shutil.which(command[0]):
  try:
   run=subprocess.run(command,capture_output=True,timeout=12);environment[' '.join(command) ]={'exitCode':run.returncode,'stdout':run.stdout.decode('utf-8',errors='replace')[:1500],'stderr':run.stderr.decode('utf-8',errors='replace')[:500]}
  except Exception as e:environment[' '.join(command)]={'error':type(e).__name__}
save('environment.json',environment)
print(json.dumps({'sourceFiles':len(inventory),'sqlFiles':len(sql),'httpProbes':len(results),'output':str(OUT)}))
