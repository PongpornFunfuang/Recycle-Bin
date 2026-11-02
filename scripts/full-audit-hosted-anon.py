"""Anonymous read-only RLS checks on the one authorized hosted project."""
import datetime,json,urllib.request,urllib.error
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];env={}
for line in (ROOT/'web/.env.local').read_text(encoding='utf-8-sig').splitlines():
 if '=' in line and not line.startswith('#'):
  k,v=line.split('=',1);env[k]=v.strip().strip('"').strip("'")
base=env['NEXT_PUBLIC_SUPABASE_URL'];assert base.rstrip('/')=='https://fdmohzvuxvsrcaddbjvl.supabase.co'
headers={'apikey':env['NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'],'Prefer':'count=exact','Range':'0-0'}
results=[]
for table in ['profiles','ai_predictions','confirmed_disposals','feedback','contact_messages','quiz_attempts','user_roles','quiz_answer_keys','quizzes','quiz_questions','locations']:
 request=urllib.request.Request(base+'/rest/v1/'+table+'?select=*&limit=1',headers=headers)
 try:r=urllib.request.urlopen(request,timeout=15)
 except urllib.error.HTTPError as e:r=e
 data=json.loads(r.read());results.append({'table':table,'http':r.status,'contentRange':r.headers.get('content-range'),'rows':len(data) if isinstance(data,list) else None,'returnedColumns':list(data[0]) if isinstance(data,list) and data else [],'errorCode':data.get('code') if isinstance(data,dict) else None})
out={'capturedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'scope':'Publishable key only, no user token; GET only; no private values logged','results':results}
(ROOT/'docs/evidence/full-audit-2026-11-02/hosted-anonymous-rls.json').write_text(json.dumps(out,indent=2),encoding='utf8');print(json.dumps(results))
