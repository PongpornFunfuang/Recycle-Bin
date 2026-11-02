import json,hashlib,re,datetime,os
from pathlib import Path
r=Path(__file__).resolve().parents[1];backup=r/'backups/pre-blue-white-redesign';manifest=json.loads((backup/'manifest.json').read_text(encoding='utf-8'));entries=[]
for e in manifest:
 p=backup/e['backup'];entries.append({'path':e['source'],'backupMatchesSnapshot':p.is_file() and hashlib.sha256(p.read_bytes()).hexdigest()==e['sha256'],'sourceStillExists':(r/e['source']).is_file()})
# Keep actual values in memory only, never in report/logs.
values=[];env=r/'web/.env.local'
if env.exists():
 for line in env.read_text(encoding='utf-8').splitlines():
  if '=' in line and not line.startswith('#'):
   k,v=line.split('=',1)
   if k in ['SUPABASE_SECRET_KEY','SCAN_RECEIPT_SECRET','AI_INTERNAL_TOKEN'] and len(v.strip())>=20:values.append(v.strip().strip('"').strip("'"))
for secret_file in ['owner-auth-test.json','brevo-account-preparation.json']:
 secret_path=r/'.local/secrets'/secret_file
 if secret_path.exists():
  value=json.loads(secret_path.read_text(encoding='utf-8')).get('password','')
  if len(value)>=20:values.append(value)
leaks=[];files=0
for directory in [backup,r/'web/public',r/'web/.next/static',r/'docs',r/'contracts',r/'.local/logs']:
 for p in directory.rglob('*'):
  if not p.is_file() or p.suffix.lower() in {'.png','.jpg','.jpeg','.ttf','.woff','.pth','.onnx'}:continue
  if p.stat().st_size>10000000:continue
  data=p.read_bytes();files+=1
  if any(v.encode() in data for v in values) or b'RB_PRODUCT_SERVER_CANARY' in data:leaks.append(str(p.relative_to(r)))
report={'capturedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'backup':{'files':len(entries),'status':'PASS' if all(e['backupMatchesSnapshot'] and e['sourceStillExists'] for e in entries) else 'FAIL','entries':entries,'restoreExecuted':False},'secrets':{'filesInspected':files,'actualSecretValuesPrinted':False,'leakPaths':leaks,'status':'PASS' if not leaks else 'FAIL','scope':'Known local server secrets, owner test/Brevo preparation passwords and build canary; backup/public/static/docs/contracts/local logs. Does not replace a full secret scanner.'}}
(Path(os.environ.get('RB_EVIDENCE_DIR',str(r/'docs/evidence/product')))/'final-security-backup.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps({'backup':report['backup']['status'],'backupFiles':len(entries),'secrets':report['secrets']['status'],'leakPaths':leaks}))
