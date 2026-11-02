// Exact approved target. Before/after verification only: no SQL or content writes.
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url),base='http://127.0.0.1:3000';
const phase=process.argv[2];if(!['before','after'].includes(phase))throw Error('Require before/after');
const target='a1fbf6f7-0d34-44bf-a071-f265f61dfebb',project='fdmohzvuxvsrcaddbjvl';
const approvedHash='0c64c4ab2075feeef65eea3520b606b82dfc79b8021072c2ab9047ddb9023566';
const sql=readFileSync(new URL('database/operations/first_admin_fdmohzvuxvsrcaddbjvl.sql',root));
if(createHash('sha256').update(sql).digest('hex')!==approvedHash)throw Error('SQL hash mismatch; stop');
const credentials=JSON.parse(readFileSync(new URL('.local/secrets/owner-auth-test.json',root),'utf8'));
if(credentials.projectRef!==project)throw Error('Wrong credentials project');
const env=readFileSync(new URL('web/.env.local',root),'utf8');
if(!env.split(/\r?\n/).some(s=>s.trim()==='NEXT_PUBLIC_SUPABASE_URL=https://'+project+'.supabase.co'))throw Error('Wrong configured project');
const directory=new URL('docs/evidence/first-admin-fdmohzvuxvsrcaddbjvl/',root);mkdirSync(directory,{recursive:true});
const output=new URL(phase+'.json',directory);
if(existsSync(output))throw Error('Evidence exists; inspect state rather than overwrite');
const report={capturedAt:new Date().toISOString(),projectRef:project,targetUserId:target,sqlSha256:approvedHash,phase,sqlExecutedByThisScript:false,checks:[]};
const cookies=new Map();
async function app(path,body,anon=false){const response=await fetch(base+path,{method:body?'POST':'GET',headers:{Origin:base,...(!anon?{Cookie:[...cookies].map(([k,v])=>k+'='+v).join(';')}:{ }),...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,redirect:'manual',signal:AbortSignal.timeout(60000)});if(!anon)for(const entry of response.headers.getSetCookie()){const kv=entry.split(';')[0],i=kv.indexOf('='),name=kv.slice(0,i),value=kv.slice(i+1);if(value)cookies.set(name,value);else cookies.delete(name);}let data;try{data=await response.json();}catch{}return {status:response.status,data};}
function check(name,pass,detail={}){report.checks.push({name,status:pass?'PASS':'FAIL',...detail});console.log(JSON.stringify(report.checks.at(-1)));if(!pass)throw Error('Verification failed: '+name);}
try{
 const login=await app('/api/auth',{action:'login',email:credentials.email,password:credentials.password});check('owner authenticates with existing approved test credentials',login.status===200,{http:login.status});
 const identity=await app('/api/member?section=identity');check('owner identity active and expected role',identity.status===200&&identity.data.authenticated===true&&identity.data.isAdmin===(phase==='after'),{isAdmin:identity.data?.isAdmin??null});
 const profile=await app('/api/member?section=profile');check('target profile remains readable',profile.status===200&&profile.data.profile.display_name==='บัญชีทดสอบเจ้าของ');
 const overview=await app('/api/admin');check('admin API enforces current approved role',overview.status===(phase==='after'?200:403),{http:overview.status});
 if(phase==='after'){
  const users=await app('/api/admin?resource=users');const person=users.data?.rows?.find(row=>row.id===target||row.user_id===target);check('admin permissions directory contains exact target',users.status===200&&!!person,{targetPresent:!!person});
  const audit=await app('/api/admin?resource=audit');const rows=audit.data?.rows?.filter(row=>row.event==='operator_first_admin_bootstrap'&&row.entity_id===target&&row.entity_table==='user_roles');check('exactly one operator bootstrap audit with null actor',audit.status===200&&rows?.length===1&&rows[0].actor_id===null,{matchingEvents:rows?.length??0});
  if(rows?.[0])report.audit={event:rows[0].event,entityId:rows[0].entity_id,actorId:rows[0].actor_id,createdAt:rows[0].created_at??null};
  check('anonymous admin remains denied',(await app('/api/admin',undefined,true)).status===401);
 }
 const logout=await app('/api/auth',{action:'logout'});check('logout clears access',logout.status===200&&(await app('/api/member?section=identity')).status===401);
 report.status='PASS';
}catch(e){report.status='INCOMPLETE';report.error=e.message.startsWith('Verification failed:')?e.message:'Network/configuration operation failed; no raw response logged';process.exitCode=1;}
finally{writeFileSync(output,JSON.stringify(report,null,2),{flag:'wx'});console.log(JSON.stringify({phase,status:report.status,checks:report.checks.length}));}
