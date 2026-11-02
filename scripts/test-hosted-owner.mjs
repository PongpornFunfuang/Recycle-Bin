// Authorized owner account only. No SQL, admin creation, cleanup, or email requests.
import {readFileSync,writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {randomUUID,createHash} from 'node:crypto';
import {isDeepStrictEqual} from 'node:util';
const root=new URL('../',import.meta.url);
const require=createRequire(new URL('web/package.json',root));
const {createClient}=require('@supabase/supabase-js');
const credentials=JSON.parse(readFileSync(new URL('.local/secrets/owner-auth-test.json',root),'utf8'));
const env=Object.fromEntries(readFileSync(new URL('web/.env.local',root),'utf8').split(/\r?\n/).filter(s=>s&&!s.startsWith('#')&&s.includes('=')).map(s=>{const i=s.indexOf('=');return [s.slice(0,i),s.slice(i+1).replace(/^['"]|['"]$/g,'')];}));
if(env.NEXT_PUBLIC_SUPABASE_URL!=='https://fdmohzvuxvsrcaddbjvl.supabase.co'||credentials.projectRef!=='fdmohzvuxvsrcaddbjvl')throw Error('Wrong target');
const file=new URL('docs/evidence/cloud-migration-fdmohzvuxvsrcaddbjvl/owner-hosted-tests.json',root);
const report={capturedAt:new Date().toISOString(),projectRef:credentials.projectRef,account:'authorized-owner-A',scope:'Actual hosted Auth/Data API + loopback Business API; no SQL/admin/email writes',checks:[],records:{},limitations:['No second authorized account','No verified campus reference records','No admin approval','Recovery password update requires user handoff']};
function record(name,pass,detail={}){report.checks.push({name,status:pass?'PASS':'FAIL',...detail});writeFileSync(file,JSON.stringify(report,null,2));console.log(JSON.stringify({name,status:pass?'PASS':'FAIL',...detail}));if(!pass)throw Error('Assertion failed: '+name);}
const cookies=new Map();
async function app(path,{method='GET',body,anonymous=false,origin='http://127.0.0.1:3000'}={}){
 const headers={Origin:origin};if(!anonymous)headers.Cookie=[...cookies].map(([k,v])=>k+'='+v).join(';');if(body&&!(body instanceof FormData))headers['Content-Type']='application/json';
 const response=await fetch('http://127.0.0.1:3000'+path,{method,headers,body:body instanceof FormData?body:body?JSON.stringify(body):undefined,redirect:'manual',signal:AbortSignal.timeout(60000)});
 if(!anonymous)for(const value of response.headers.getSetCookie()){const first=value.split(';')[0];const i=first.indexOf('=');if(i>0){const k=first.slice(0,i),v=first.slice(i+1);if(v)cookies.set(k,v);else cookies.delete(k);}}
 const text=await response.text();let json;try{json=JSON.parse(text);}catch{json=null;}return {status:response.status,json,headers:response.headers};
}
const supabase=createClient(env.NEXT_PUBLIC_SUPABASE_URL,env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
try{
 record('anonymous private API denied',(await app('/api/member?section=identity',{anonymous:true})).status===401);
 record('cross-origin auth request denied',(await app('/api/auth',{method:'POST',body:{action:'login',email:credentials.email,password:credentials.password},origin:'https://invalid.example'})).status===403);
 record('invalid password denied',(await app('/api/auth',{method:'POST',body:{action:'login',email:credentials.email,password:randomUUID()}})).status===400);
 const login=await app('/api/auth',{method:'POST',body:{action:'login',email:credentials.email,password:credentials.password}});record('owner login and SSR cookies',login.status===200&&cookies.size>0,{http:login.status});
 const identity=await app('/api/member?section=identity');record('owner is active member without admin',identity.status===200&&identity.json.authenticated===true&&identity.json.isAdmin===false);
 const direct=await supabase.auth.signInWithPassword({email:credentials.email,password:credentials.password});record('real hosted JWT and confirmed email',!direct.error&&!!direct.data.user?.email_confirmed_at);
 const userId=direct.data.user.id;report.records.ownerUserId=userId;
 const profile=await app('/api/member?section=profile');record('trigger-created profile readable',profile.status===200&&typeof profile.json.profile?.display_name==='string');
 const update=await app('/api/member',{method:'POST',body:{section:'profile',display_name:'บัญชีทดสอบเจ้าของ'}});const reread=await app('/api/member?section=profile');record('profile update persisted',update.status===200&&reread.json.profile.display_name==='บัญชีทดสอบเจ้าของ');
 record('member admin API denied',(await app('/api/admin')).status===403);
 const promotion=await supabase.rpc('admin_set_role',{p_user:userId,p_admin:true});record('member cannot self-promote',!!promotion.error);
 const privateRoles=await supabase.schema('private').from('user_roles').select('*');record('private role schema unavailable to member JWT',!!privateRoles.error);
 const privateKeys=await supabase.schema('private').from('quiz_answer_keys').select('*');record('private quiz keys unavailable to member JWT',!!privateKeys.error);
 const audit=await supabase.rpc('admin_audit_log');record('member audit RPC denied',!!audit.error);
 const before=await app('/api/member?section=dashboard');record('initial summary readable',before.status===200);
 const image=readFileSync(new URL('ml/test-images/bottles-for-recycling.jpg',root));const form=new FormData();form.append('image',new Blob([image],{type:'image/jpeg'}),'authorized-test-bottles.jpg');form.append('mode','photo');form.append('saveable','true');
 const detected=await app('/api/ai/detect',{method:'POST',body:form});const receipt=detected.headers.get('X-Scan-Receipt');record('real FastAPI inference and owner receipt',detected.status===200&&!!receipt&&detected.json.modelVersion==='fasterrcnn-resnet50-fpn-v2-coco-dd69338a',{http:detected.status,objects:detected.json?.detections?.length??0});
 report.records.predictionId=detected.json.predictionId;report.records.resultSha256=createHash('sha256').update(JSON.stringify(detected.json)).digest('hex');
 const forged={...detected.json,imageWidth:detected.json.imageWidth+1};record('tampered scan rejected',(await app('/api/scans',{method:'POST',body:{result:forged,receipt}})).status===422);
 const save=await app('/api/scans',{method:'POST',body:{result:detected.json,receipt}});record('signed real scan persisted',save.status===200&&save.json.predictionId===detected.json.predictionId,{http:save.status});
 const retry=await app('/api/scans',{method:'POST',body:{result:detected.json,receipt}});record('scan retry idempotent',retry.status===200&&retry.json.predictionId===save.json.predictionId);
 const detail=await app('/api/member?section=history-detail&id='+detected.json.predictionId);record('history snapshot re-read matches real inference',detail.status===200&&detail.json.row.provenance==='server_verified'&&isDeepStrictEqual(detail.json.row.result_snapshot.detections,detected.json.detections));
 const history=await app('/api/member?section=history');record('history contains saved UUID once',history.status===200&&history.json.rows.filter(r=>r.id===detected.json.predictionId).length===1);
 const rows=await supabase.from('ai_predictions').select('id,user_id').eq('id',detected.json.predictionId);record('member JWT Data API re-read',!rows.error&&rows.data.length===1&&rows.data[0].user_id===userId);
 const anon=createClient(env.NEXT_PUBLIC_SUPABASE_URL,env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});const anonRows=await anon.from('ai_predictions').select('id').eq('id',detected.json.predictionId);record('anonymous Data API cannot read saved scan',!!anonRows.error||anonRows.data.length===0);
 const rawWriter=await supabase.rpc('persist_verified_scan',{p_user:userId,p_result:detected.json});record('member cannot call privileged scan writer',!!rawWriter.error);
 const after=await app('/api/member?section=dashboard');record('scan count increments once without disposal',after.status===200&&Number(after.json.summary.scans)===Number(before.json.summary.scans)+1&&Number(after.json.summary.disposals)===Number(before.json.summary.disposals)&&Number(after.json.summary.items)===Number(before.json.summary.items));report.records.summary=after.json.summary;
 const feedbackText='[AUTHORIZED OWNER INTEGRATION TEST] Feedback persistence '+new Date().toISOString();const feedback=await app('/api/member',{method:'POST',body:{section:'feedback',kind:'issue',message:feedbackText}});const feedbackRead=await app('/api/member?section=feedback');record('feedback persisted and readable by owner',feedback.status===200&&feedbackRead.json.rows.some(r=>r.message===feedbackText));report.records.feedbackId=feedbackRead.json.rows.find(r=>r.message===feedbackText)?.id;
 const contactText='[AUTHORIZED OWNER INTEGRATION TEST] Contact persistence '+new Date().toISOString();const contact=await app('/api/member',{method:'POST',body:{section:'contact',subject:'Authorized integration test',message:contactText}});const contactRead=await app('/api/member?section=contact');record('contact persisted and readable by owner',contact.status===200&&contactRead.json.rows.some(r=>r.message===contactText));report.records.contactId=contactRead.json.rows.find(r=>r.message===contactText)?.id;
 const learning=await app('/api/member?section=learning');record('learning returns actual owned rows',learning.status===200&&Array.isArray(learning.json.rows));
 const disposal=await app('/api/disposals',{method:'POST',body:{eventId:randomUUID(),itemId:randomUUID(),ruleId:randomUUID(),quantity:1,confirmed:false,disposedAt:new Date().toISOString(),predictionId:null,detectionId:null}});record('disposal requires explicit true',disposal.status===400);
 const logout=await app('/api/auth',{method:'POST',body:{action:'logout'}});record('logout removes authenticated access',logout.status===200&&(await app('/api/member?section=identity')).status===401);
 await supabase.auth.signOut();
 report.finishedAt=new Date().toISOString();report.status='PASS_WITH_SCOPE_LIMITATIONS';
}catch(e){report.status='INCOMPLETE';report.error={name:e.name,message:e.message.startsWith('Assertion failed:')?e.message:'Operation failed; no raw response logged'};process.exitCode=1;}
finally{writeFileSync(file,JSON.stringify(report,null,2));console.log(JSON.stringify({status:report.status,passed:report.checks.filter(x=>x.status==='PASS').length,failed:report.checks.filter(x=>x.status==='FAIL').length}));}
