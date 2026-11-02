// Explicit invocation only. Real Supabase Storage on the approved TEST project.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';
import {createClient} from '@supabase/supabase-js';import sharp from 'sharp';
import {storeValidatedEvidence,cleanupUnusedEvidence,EvidenceStoreError} from '../src/lib/pin-evidence-store';
async function main(){
const root=path.resolve(process.cwd(),'..'),ref='yyprbgvhmncddlyeduyr',secret=path.join(root,'.local/secrets/supabase-test-'+ref+'.json');
const cfg=JSON.parse(fs.readFileSync(secret,'utf8'));assert.equal(cfg.projectRef,ref);assert.equal(cfg.url,'https://'+ref+'.supabase.co');
const service=createClient(cfg.url,cfg.secretKey,{auth:{persistSession:false,autoRefreshToken:false}}),anon=createClient(cfg.url,cfg.publishableKey,{auth:{persistSession:false}});
const results:{name:string;status:string}[]=[],cleanup:string[]=[];const hash=(b:Uint8Array)=>createHash('sha256').update(b).digest('hex');
function ok<T extends {error:unknown}>(r:T,label:string){assert.equal(r.error,null,label);return r;}
async function login(role:string){const client=createClient(cfg.url,cfg.publishableKey,{auth:{persistSession:false,autoRefreshToken:false}});ok(await client.auth.signInWithPassword({email:cfg.users[role].email,password:cfg.users[role].password}),'synthetic login');return client;}
const A=await login('adminA'),B=await login('memberB'),C=await login('adminC'),owner=cfg.users.adminA.id;
try{
 const bucket=ok(await service.storage.getBucket('pin-evidence'),'real bucket');assert.equal(bucket.data?.public,false);assert.equal(bucket.data?.file_size_limit,8388608);results.push({name:'Actual Storage bucket private and bounded',status:'PASS'});
 const png=await sharp({create:{width:128,height:96,channels:3,background:'blue'}}).png().toBuffer();
 for(const [label,client] of [['admin',A],['member',B],['anonymous',anon]] as const){const denied=await client.storage.from('pin-evidence').upload(owner+'/'+crypto.randomUUID(),png,{contentType:'image/png'});assert.ok(denied.error);assert.ok([401,403].includes(Number(denied.error.statusCode)),label+' must fail by authorization, not network');}
 const forgery=await A.rpc('reserve_pin_evidence',{p_id:crypto.randomUUID(),p_owner:owner,p_sha256:hash(png),p_size:png.length,p_mime:'image/png'});assert.equal(forgery.error?.code,'42501');results.push({name:'Admin/member/anon direct upload and client attestation denied',status:'PASS'});
 for(const format of ['jpeg','png','webp'] as const){
  const bytes=await sharp({create:{width:128,height:96,channels:3,background:'#087ec9'}}).toFormat(format).toBuffer();
  const id=await storeValidatedEvidence(service,owner,bytes,'image/'+format);cleanup.push(id);cfg.createdEvidence??=[];cfg.createdEvidence.push(id);fs.writeFileSync(secret,JSON.stringify(cfg,null,2));
  const meta=ok(await A.from('pin_evidence').select('owner_id,object_key,content_sha256,validation_state,byte_size,mime_type').eq('id',id).single(),'actual metadata').data;assert.ok(meta,'evidence metadata must exist');
  assert.equal(meta.owner_id,owner);assert.equal(meta.object_key,owner+'/'+id);assert.equal(meta.validation_state,'validated');assert.equal(meta.content_sha256,hash(bytes));assert.equal(meta.byte_size,bytes.length);assert.equal(meta.mime_type,'image/'+format);
  const file=ok(await A.storage.from('pin-evidence').download(meta.object_key),'owner download').data;assert.equal(hash(new Uint8Array(await file!.arrayBuffer())),hash(bytes));
  const denied=await B.storage.from('pin-evidence').download(meta.object_key);assert.ok(denied.error);assert.ok([400,401,403,404].includes(Number(denied.error.statusCode)));
  const anonymous=await anon.storage.from('pin-evidence').download(meta.object_key);assert.ok(anonymous.error);
  const review=await C.storage.from('pin-evidence').download(meta.object_key);ok(review,'other authorized admin can review evidence');
  const memberSigned=await B.storage.from('pin-evidence').createSignedUrl(meta.object_key,60);assert.ok(memberSigned.error);
  const signed=ok(await A.storage.from('pin-evidence').createSignedUrl(meta.object_key,60),'authorized signed URL').data;const response=await fetch(signed!.signedUrl);assert.equal(response.status,200);assert.equal(hash(new Uint8Array(await response.arrayBuffer())),hash(bytes));
  await cleanupUnusedEvidence(service,cfg.users.adminC.id,id);assert.equal((await A.storage.from('pin-evidence').download(meta.object_key)).error,null,'different owner cleanup must not remove file');
  results.push({name:`Actual ${format}: upload/readback/hash/MIME/size/app-owner/path/member denial/signed URL`,status:'PASS'});
 }
 await assert.rejects(storeValidatedEvidence(service,owner,Buffer.from([137,80,78,71,13,10,26,10,0,0,0,0,0,0,0,0]),'image/png'),(e:unknown)=>e instanceof EvidenceStoreError&&e.status===415);
 await assert.rejects(storeValidatedEvidence(service,owner,png,'image/jpeg'),(e:unknown)=>e instanceof EvidenceStoreError&&e.status===415);results.push({name:'Corrupt signature image and MIME mismatch rejected before Storage',status:'PASS'});
 const orphan=crypto.randomUUID();ok(await service.rpc('reserve_pin_evidence',{p_id:orphan,p_owner:owner,p_sha256:hash(png),p_size:png.length,p_mime:'image/png'}),'orphan reservation');cfg.orphanEvidence=orphan;fs.writeFileSync(secret,JSON.stringify(cfg,null,2));await assert.rejects(cleanupUnusedEvidence(service,owner,orphan),(e:unknown)=>e instanceof EvidenceStoreError&&e.status===409);results.push({name:'Interrupted fresh upload retained with recovery record',status:'PASS'});
}catch(error){results.push({name:error instanceof Error?error.message.slice(0,200):'unknown failure',status:'FAIL'});process.exitCode=1;}
finally{
 for(const id of cleanup){try{await cleanupUnusedEvidence(service,owner,id);const absent=await A.storage.from('pin-evidence').download(owner+'/'+id);assert.ok(absent.error);results.push({name:'Actual unused object delete + recovery tombstone '+id,status:'PASS'});}catch{results.push({name:'Actual cleanup '+id,status:'FAIL'});process.exitCode=1;}}
 await Promise.all([A,B,C].map(c=>c.auth.signOut({scope:'local'})));
 fs.writeFileSync(path.join(root,'docs/evidence/pin-release-2026-11-02/real-storage-tests.json'),JSON.stringify({capturedAt:new Date().toISOString(),project:ref,scope:'REAL Supabase Storage API, dedicated Test project. App owner is bound by pin_evidence and immutable owner/id path; server-uploaded objects need not have native owner_id equal to the app user.',productionTouched:false,results},null,2));
 console.log(JSON.stringify({testProject:ref,pass:results.filter(r=>r.status==='PASS').length,fail:results.filter(r=>r.status==='FAIL'),productionTouched:false}));
}
}
main().catch(e=>{console.error('TEST STORAGE ERROR: '+String(e.message).slice(0,200));process.exitCode=1;});
