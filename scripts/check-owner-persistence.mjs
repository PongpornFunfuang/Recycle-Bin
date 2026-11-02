import {readFileSync,writeFileSync,existsSync} from 'node:fs';
const root=new URL('../',import.meta.url),base='http://127.0.0.1:3000';
const input=JSON.parse(readFileSync(new URL('docs/evidence/cloud-migration-fdmohzvuxvsrcaddbjvl/owner-hosted-tests.json',root),'utf8'));
const credentials=JSON.parse(readFileSync(new URL('.local/secrets/owner-auth-test.json',root),'utf8'));
const report={capturedAt:new Date().toISOString(),projectRef:'fdmohzvuxvsrcaddbjvl',scope:'Read stored owner records after verified Local Next/FastAPI restart; no new content or SQL',checks:[]};
const cookies=new Map();
async function request(path,body){const response=await fetch(base+path,{method:body?'POST':'GET',headers:{Origin:base,Cookie:[...cookies].map(([k,v])=>k+'='+v).join(';'),...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,redirect:'manual',signal:AbortSignal.timeout(60000)});for(const c of response.headers.getSetCookie()){const kv=c.split(';')[0],i=kv.indexOf('=');const name=kv.slice(0,i),value=kv.slice(i+1);if(value)cookies.set(name,value);else cookies.delete(name);}let data;try{data=await response.json();}catch{}return {response,data};}
function check(name,pass){report.checks.push({name,status:pass?'PASS':'FAIL'});console.log(JSON.stringify(report.checks.at(-1)));if(!pass)throw Error('Check failed');}
try{
 const web=await request('/api/health/ready');check('Next and Cloud database ready after restart',web.response.status===200&&web.data.checks?.database==='ready');
 const ai=await fetch('http://127.0.0.1:8000/health/ready');const aiData=await ai.json();check('FastAPI model reloaded on CUDA',ai.status===200&&aiData.aiScannerReady===true&&aiData.provider==='pytorch_cuda');
 const login=await request('/api/auth',{action:'login',email:credentials.email,password:credentials.password});check('owner login after restart',login.response.status===200);
 const history=await request('/api/member?section=history');const match=history.data?.rows?.filter(r=>r.id===input.records.predictionId);check('same scan UUID persists once',history.response.status===200&&match?.length===1&&match[0].provenance==='server_verified');
 const detail=await request('/api/member?section=history-detail&id='+input.records.predictionId);check('real result snapshot persists',detail.response.status===200&&detail.data.row.result_snapshot.detections.length===35&&detail.data.row.result_snapshot.modelVersion==='fasterrcnn-resnet50-fpn-v2-coco-dd69338a');
 const feedback=await request('/api/member?section=feedback');check('same feedback UUID persists',feedback.response.status===200&&feedback.data.rows.some(r=>r.id===input.records.feedbackId));
 const contact=await request('/api/member?section=contact');check('same contact UUID persists',contact.response.status===200&&contact.data.rows.some(r=>r.id===input.records.contactId));
 const dashboard=await request('/api/member?section=dashboard');check('dashboard totals persist',dashboard.response.status===200&&['scans','disposals','items'].every(k=>dashboard.data.summary[k]===input.records.summary[k]));
 check('member remains unable to access admin',(await request('/api/admin')).response.status===403);
 const marker='RB_CALLBACK_LOG_CANARY_'+Date.now();const callback=await request('/auth/callback?code='+marker);check('invalid callback denied',callback.response.status===307&&callback.response.headers.get('location')===base+'/login?error=callback_failed');
 const log=new URL('.local/logs/owner-web-out.log',root);check('callback code omitted from Next request log',existsSync(log)&&!readFileSync(log,'utf8').includes(marker));
 const logout=await request('/api/auth',{action:'logout'});check('logout still denies private API',logout.response.status===200&&(await request('/api/member?section=identity')).response.status===401);
 report.status='PASS_OWNER_SCOPE';
}catch{report.status='INCOMPLETE';process.exitCode=1;}
finally{writeFileSync(new URL('docs/evidence/cloud-migration-fdmohzvuxvsrcaddbjvl/owner-persistence-after-restart.json',root),JSON.stringify(report,null,2));console.log(JSON.stringify({status:report.status,passed:report.checks.filter(x=>x.status==='PASS').length}));}
