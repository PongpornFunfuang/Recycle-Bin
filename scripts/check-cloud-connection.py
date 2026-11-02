from pathlib import Path
import json,urllib.request,urllib.error,datetime
r=Path(__file__).resolve().parents[1];e=r/'docs/evidence/cloud-migration-fdmohzvuxvsrcaddbjvl';rows=[]
for path in ['/api/health/ready','/api/public/catalog','/api/member?section=identity','/api/admin']:
 try:
  try:response=urllib.request.urlopen('http://127.0.0.1:3000'+path,timeout=20)
  except urllib.error.HTTPError as error:response=error
  rows.append({'path':path,'httpStatus':response.status,'body':json.load(response)})
 except Exception as error:rows.append({'path':path,'errorType':type(error).__name__})
private=r/'.local/secrets/recycle-bin-database-password.txt';secret_valid=private.is_file() and len(private.read_text(encoding='utf-8').strip())>=20 and '<redacted>' not in private.read_text(encoding='utf-8')
report={'capturedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'project':'fdmohzvuxvsrcaddbjvl','scope':'Actual local Next.js to hosted Supabase read readiness and unauthenticated denial. No account or persistence write test.','requests':rows,'databasePasswordStoredPrivately':secret_valid,'authSettingsChanged':False,'adminCreated':False}
(e/'local-cloud-connection.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps(report,ensure_ascii=True))
