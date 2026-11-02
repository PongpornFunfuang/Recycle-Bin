"""Local read-only preflight plus evidence; no Cloud mutation or credential output."""
from pathlib import Path
import json,hashlib,os,datetime,urllib.request,urllib.error
r=Path(__file__).resolve().parents[1];out=r/'docs/evidence/cloud-preflight-2026-11-02';out.mkdir(exist_ok=True)
hashes=json.loads((r/'docs/product/MIGRATION_HASHES.json').read_text(encoding='utf-8'));sql=[]
for item in hashes:
 p=r/item['file'];body=p.read_text(encoding='utf-8');sha=hashlib.sha256(p.read_bytes()).hexdigest();sql.append({'file':item['file'],'expected':item['sha256'],'actual':sha,'matches':sha==item['sha256'],'transactionWrapped':body.strip().lower().endswith('commit;') and 'begin;' in body.lower(),'bytes':p.stat().st_size,'cloudExecutedByAgent':item.get('cloudExecuted',False)})
expected='feb76b37c73c986dcee9dccde36cc0d44d02e67b81e7b16cf292ee2a89d73c09'
if not all(x['matches'] for x in sql) or sql[-1]['actual']!=expected:raise SystemExit('Migration hash mismatch; stop and review. No SQL executed.')
docs=[]
for p in sorted((r/'docs/product').iterdir()):
 if p.suffix.lower() in {'.md','.json'}:
  body=p.read_text(encoding='utf-8');docs.append({'file':p.relative_to(r).as_posix(),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
values={}
env=r/'web/.env.local'
if env.exists():
 for line in env.read_text(encoding='utf-8').splitlines():
  if '=' in line and not line.lstrip().startswith('#'):
   key,value=line.split('=',1);values[key.strip()]=value.strip().strip('"').strip("'")
names=['NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY','SUPABASE_SECRET_KEY','SCAN_RECEIPT_SECRET']
presence={name:{'localFileHasValue':bool(values.get(name)),'processHasValue':bool(os.environ.get(name))} for name in names}
try:
 try:response=urllib.request.urlopen('http://127.0.0.1:3000/api/health/ready',timeout=8)
 except urllib.error.HTTPError as error:response=error
 readiness={'httpStatus':response.status,'body':json.load(response)}
except Exception as error:readiness={'status':'unavailable','errorType':type(error).__name__}
previous=json.loads((r/'docs/product/CONTINUATION_FILES_2026-11-02.json').read_text(encoding='utf-8'));drift=[]
for item in previous['files']:
 p=r/item['path']
 if not p.exists() or hashlib.sha256(p.read_bytes()).hexdigest()!=item['sha256']:drift.append(item['path'])
backup=[]
for item in json.loads((r/'backups/pre-blue-white-redesign/manifest.json').read_text(encoding='utf-8')):
 p=r/'backups/pre-blue-white-redesign'/item['backup'];backup.append({'file':item['source'],'matches':p.is_file() and hashlib.sha256(p.read_bytes()).hexdigest()==item['sha256']})
project_record=out/'project-created.json'
project=json.loads(project_record.read_text(encoding='utf-8')) if project_record.exists() else None
report={'capturedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'migrations':sql,'docsRead':docs,'environmentPresenceOnly':presence,'localReadiness':readiness,'sourceDriftSinceFinalContinuationInventory':drift,'backup':backup,'previousTests':json.loads((r/'docs/evidence/continuation-2026-11-02/verification-results.json').read_text(encoding='utf-8')),'cloudCreation':'CREATED_WITH_USER_APPROVAL' if project else 'AWAITING_USER_APPROVAL','project':project,'cloudSqlExecuted':bool(project and project.get('cloudSqlExecutedByAgent')),'authSettingsChanged':False,'adminCreated':False,'deployed':False}
(out/'local-preflight.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'migrationHashes':'PASS','0005':sql[-1]['actual'],'docsRead':len(docs),'environmentPresenceOnly':presence,'readiness':readiness,'sourceDrift':drift,'backupMatches':sum(x['matches'] for x in backup),'backupFiles':len(backup),'scope':'LOCAL_PREFLIGHT_ONLY','projectCreation':report['cloudCreation']}))
