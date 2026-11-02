import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';

test('server-attested evidence SQL: synthetic metadata in isolated PGlite, NOT actual Storage',async t=>{
 const db=new PGlite(),A=crypto.randomUUID(),B=crypto.randomUUID(),C=crypto.randomUUID(),hash='a'.repeat(64);
 const role=async(name='authenticated',user=A)=>{await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[user]);await db.exec('set role '+name);};
 try{
 await db.exec("create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key,raw_user_meta_data jsonb default '{}');create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema public,auth to anon,authenticated,service_role;grant execute on function auth.uid() to anon,authenticated,service_role;create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text,metadata jsonb);alter table storage.objects enable row level security;grant usage on schema storage to anon,authenticated;grant select,insert,delete on storage.objects to anon,authenticated;");
 for(const file of ['0001_foundation','0002_admin_workflow','0003_member_workflow','0004_quiz_workflow','0005_product_hardening','0006_location_evidence','0007a_private_evidence','0007_self_pinning','0007b_pin_guards','0007c_server_evidence','0008_general_confirmation'])await db.exec(readFileSync('../database/postgres/'+file+'.sql','utf8'));
 await db.query('insert into auth.users(id) values($1),($2),($3)',[A,B,C]);await db.query("insert into private.user_roles(user_id,role_code) values($1,'admin'),($2,'admin')",[A,B]);await role();
 const area=(await db.query<{id:string}>("insert into public.areas(code,name) values('LOCAL','LOCAL TEST') returning id")).rows[0].id;
 const kind=(await db.query<{id:string}>("insert into public.bin_types(code,name) values('LOCAL','LOCAL TEST') returning id")).rows[0].id;
 const cat=(await db.query<{id:string}>("insert into public.waste_categories(slug,name) values('local','LOCAL TEST') returning id")).rows[0].id;
 async function reserve(owner=A){const id=crypto.randomUUID();await role('service_role');await db.query('select public.reserve_pin_evidence($1,$2,$3,100,\'image/png\')',[id,owner,hash]);return id;}
 async function object(id:string,owner=A,mime='image/png',size=100){await db.exec('reset role');await db.query("insert into storage.objects(bucket_id,name,metadata) values('pin-evidence',$1,$2::jsonb)",[owner+'/'+id,JSON.stringify({mimetype:mime,size})]);}
 async function finalize(id:string,owner=A){await role('service_role');await db.query('select public.finalize_pin_evidence($1,$2,$3)',[id,owner,hash]);}
 async function ready(owner=A){const id=await reserve(owner);await object(id,owner);await finalize(id,owner);return id;}
 const payload=(evidence:string|null)=>({area_id:area,name:'LOCAL TEST',reference:'LOCAL ONLY',latitude:10,longitude:100,surveyed_at:'2026-01-01',evidence_photo_id:evidence,bins:[{code:crypto.randomUUID(),color:'เขียว',bin_type_id:kind,categories:[cat]}]});
 await t.test('Admin/member/anonymous cannot forge attestations or upload directly',async()=>{
  for(const user of [A,C]){await role('authenticated',user);await assert.rejects(db.query('select public.reserve_pin_evidence($1,$2,$3,100,\'image/png\')',[crypto.randomUUID(),user,hash]));await assert.rejects(db.query("insert into public.pin_evidence(id,owner_id,object_key) values(gen_random_uuid(),$1,'fake')",[user]));await assert.rejects(db.query("insert into storage.objects(bucket_id,name,metadata) values('pin-evidence',$1,'{}')",[user+'/'+crypto.randomUUID()]));}
  await role('anon');await assert.rejects(db.query('select public.pin_backend_readiness()'));
 });
 await t.test('Missing object, mismatching MIME/size/hash and inactive/member owner cannot finalize',async()=>{
  const id=await reserve();await assert.rejects(db.query('select public.finalize_pin_evidence($1,$2,$3)',[id,A,hash]));await object(id,A,'image/jpeg',99);await role('service_role');await assert.rejects(db.query('select public.finalize_pin_evidence($1,$2,$3)',[id,A,hash]));await db.exec('reset role');await db.query("update storage.objects set metadata='{\"mimetype\":\"image/png\",\"size\":100}' where name=$1",[A+'/'+id]);await role('service_role');await assert.rejects(db.query('select public.finalize_pin_evidence($1,$2,$3)',[id,A,'b'.repeat(64)]));await assert.rejects(db.query('select public.reserve_pin_evidence($1,$2,$3,100,\'image/png\')',[crypto.randomUUID(),C,hash]));await finalize(id);
 });
 await t.test('Pending without a photo saves; unvalidated/other owner cannot bind; validated owner can verify',async()=>{
  await role();await db.query('select public.admin_save_pin(null,$1::jsonb)',[JSON.stringify(payload(null))]);
  const pending=await reserve();await role();await assert.rejects(db.query('select public.admin_save_pin(null,$1::jsonb)',[JSON.stringify(payload(pending))]));
  const theirs=await ready(B);await role();await assert.rejects(db.query('select public.admin_save_pin(null,$1::jsonb)',[JSON.stringify(payload(theirs))]));
  const own=await ready();await role();const loc=(await db.query<{id:string}>('select public.admin_save_pin(null,$1::jsonb) id',[JSON.stringify(payload(own))])).rows[0].id;await db.query('select public.admin_verify_pin($1)',[loc]);assert.equal((await db.query<{verification_status:string}>('select verification_status from public.locations where id=$1',[loc])).rows[0].verification_status,'verified');await role('service_role');await assert.rejects(db.query('select public.begin_pin_evidence_cleanup($1,$2)',[own,A]));
 });
 await t.test('Cleanup lease blocks binding, requires object removal and retains idempotent recovery tombstone',async()=>{
  const id=await ready();await role('service_role');assert.equal((await db.query<{key:string}>('select public.begin_pin_evidence_cleanup($1,$2) key',[id,B])).rows[0].key,null);await db.query('select public.begin_pin_evidence_cleanup($1,$2)',[id,A]);await assert.rejects(db.query('select public.finish_pin_evidence_cleanup($1,$2)',[id,A]));await role();await assert.rejects(db.query('select public.admin_save_pin(null,$1::jsonb)',[JSON.stringify(payload(id))]));await db.exec('reset role');await db.query('delete from storage.objects where name=$1',[A+'/'+id]);await role('service_role');await db.query('select public.finish_pin_evidence_cleanup($1,$2)',[id,A]);assert.equal((await db.query<{key:string}>('select public.begin_pin_evidence_cleanup($1,$2) key',[id,A])).rows[0].key,null);
  await object(id);await role('service_role');await db.query('select public.begin_pin_evidence_cleanup($1,$2)',[id,A]);await db.exec('reset role');await db.query('delete from storage.objects where name=$1',[A+'/'+id]);await role('service_role');await db.query('select public.finish_pin_evidence_cleanup($1,$2)',[id,A]);
 });
 await t.test('Ambiguous fresh upload is retained for delayed recovery',async()=>{const id=await reserve();await assert.rejects(db.query('select public.begin_pin_evidence_cleanup($1,$2)',[id,A]));await db.exec('reset role');await db.query("update public.pin_evidence set created_at=now()-interval '6 minutes' where id=$1",[id]);await role('service_role');await db.query('select public.begin_pin_evidence_cleanup($1,$2)',[id,A]);await db.query('select public.finish_pin_evidence_cleanup($1,$2)',[id,A]);await role();const ready=await db.query<{r:{ready:boolean;version:number}}>('select public.pin_backend_readiness() r');assert.deepEqual(ready.rows[0].r,{ready:true,version:1});});
 }finally{await db.close();}
});
