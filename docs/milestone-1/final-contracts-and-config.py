import json
from pathlib import Path
root=Path(__file__).resolve().parents[2]
p=root/'web/src/app/api/member/route.ts';s=p.read_text(encoding='utf-8');s=s.replace('const {error:e}=await client.from("profiles").update({display_name:name}).eq("id",user.id);return e?','const {data,error:e}=await client.from("profiles").update({display_name:name}).eq("id",user.id).select("id").maybeSingle();return e||!data?');p.write_text(s,encoding='utf-8')
p=root/'web/src/app/api/ai/detect/route.ts';s=p.read_text(encoding='utf-8').replace('response.status===503?503:422','response.status===503?503:response.status===429?429:422');p.write_text(s,encoding='utf-8')
p=root/'web/src/components/database-quiz.tsx';s=p.read_text(encoding='utf-8').replace('disabled={busy||done||Object.keys(answers)','disabled={busy||done||current.quiz_questions.length===0||Object.keys(answers)');p.write_text(s,encoding='utf-8')
p=root/'contracts/openapi/application.openapi.json';doc=json.loads(p.read_text(encoding='utf-8'))
operations={
 '/api/auth':('post','Supabase Auth actions; 503 when not configured'),
 '/api/member':('get','Verified member profile/history/summary; RLS ownership'),
 '/api/admin':('get','Verified admin management; no public access'),
 '/api/scans':('post','Explicit client-reported scan snapshot save; never disposal'),
 '/api/disposals':('post','Explicit user-confirmed disposal with verified rule and idempotency'),
 '/api/recommendations':('get','Verified unconditional area rule; otherwise Pending'),
 '/api/quiz':('post','Local practice quiz grading, no persistence'),
 '/api/quizzes':('get','Published database quizzes without answer keys'),
 '/api/public/{section}':('get','Published catalog/knowledge or verified campus locations')}
for route,(method,summary) in operations.items():
 op={'summary':summary,'description':'Implemented local handler; hosted operations require configured and approved Supabase. Detailed input constraints are enforced in the route and SQL RPC.','responses':{'200':{'description':'Operation result; inspect payload status'},'400':{'description':'Invalid request'},'401':{'description':'Authentication required'},'403':{'description':'Origin/permission denied'},'503':{'description':'Not configured or unavailable'}}}
 if '{section}' in route:op['parameters']=[{'in':'path','name':'section','required':True,'schema':{'enum':['catalog','knowledge','locations']}}]
 doc['paths'][route]={method:op}
doc['paths']['/api/member']['post']={'summary':'Update owned profile or submit feedback/contact','responses':{'200':{'description':'Actual write succeeded'},'401':{'description':'Authentication required'},'503':{'description':'Not configured'}}}
doc['paths']['/api/admin']['post']={'summary':'Admin create/update/status/question management; no deletion','responses':{'200':{'description':'Actual write succeeded'},'403':{'description':'Not admin'},'503':{'description':'Not configured'}}}
doc['paths']['/api/quizzes']['post']={'summary':'Authenticated transactional quiz grading with private answer keys','responses':{'200':{'description':'Real database score'},'401':{'description':'Authentication required'},'503':{'description':'Not configured'}}}
p.write_text(json.dumps(doc,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
for relative in ['README.md','docs/milestone-1/compatibility-supabase.md']:
 p=root/relative;s=p.read_text(encoding='utf-8').replace('PyTorch 2.11.0+cu128 and torchvision 0.26.0+cu128','PyTorch 2.14.1+cu126 and torchvision 0.29.1+cu126').replace('CUDA wheel runtime 12.8','CUDA wheel runtime 12.6');p.write_text(s,encoding='utf-8')
print('Final input/contract alignment; profile writes require an actual affected row')
