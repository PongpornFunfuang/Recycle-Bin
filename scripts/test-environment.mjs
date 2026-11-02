// Every cloud mutation in this script is pinned to the explicitly approved TEST project.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
const root=path.resolve(import.meta.dirname,'..'),ref='yyprbgvhmncddlyeduyr',file=path.join(root,'.local/secrets/supabase-test-'+ref+'.json');
const cfg=JSON.parse(fs.readFileSync(file,'utf8'));assert.equal(cfg.projectRef,ref);assert.equal(cfg.url,'https://'+ref+'.supabase.co');
const require=createRequire(path.join(root,'web/package.json')),{createClient}=require('@supabase/supabase-js');
const admin=createClient(cfg.url,cfg.secretKey,{auth:{persistSession:false,autoRefreshToken:false}});
const evidence=path.join(root,'docs/evidence/pin-release-2026-11-02');
const save=()=>fs.writeFileSync(file,JSON.stringify(cfg,null,2));
function check(result,label){if(result.error)throw Error(label+': '+(result.error.code??result.error.status??'request_failed'));return result.data;}
async function signed(role){const u=cfg.users?.[role];assert.ok(u,'Missing test user');const db=createClient(cfg.url,cfg.publishableKey,{auth:{persistSession:false,autoRefreshToken:false}});check(await db.auth.signInWithPassword({email:u.email,password:u.password}),'test login');return db;}

if(process.argv.includes('--create-users')){
 cfg.nonce??=crypto.randomUUID().slice(0,8);cfg.users??={};save();
 for(const role of ['adminA','adminC','memberB']){
  if(cfg.users[role]?.id)continue;
  const email='rb-test-'+role.toLowerCase()+'-'+cfg.nonce+'@example.invalid',password=crypto.randomBytes(32).toString('base64url');
  const result=await admin.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{display_name:'TEST ONLY '+role}});const user=check(result,'create synthetic test user').user;
  cfg.users[role]={id:user.id,email,password};save();
 }
 const ids=Object.values(cfg.users).map(u=>u.id);assert.equal(new Set(ids).size,3);
 const a=cfg.users.adminA.id,c=cfg.users.adminC.id;
 const sql=`begin;\ndo $$begin if (select count(*) from auth.users where id in ('${ids.join("','")}') and email like '%@example.invalid')<>3 then raise exception 'test_users_required';end if;if exists(select 1 from private.user_roles where role_code='admin' and user_id not in ('${a}','${c}')) then raise exception 'unexpected_admin';end if;end;$$;\ninsert into private.user_roles(user_id,role_code) values('${a}','admin'),('${c}','admin') on conflict do nothing;\ninsert into private.audit_logs(event,entity_id,entity_table) values('test_admin_bootstrap','${a}','profiles'),('test_admin_bootstrap','${c}','profiles');\ncommit;\nselect jsonb_build_object('admins',(select count(*) from private.user_roles where role_code='admin'),'users',(select count(*) from auth.users)) as test_roles;`;
 fs.writeFileSync(path.join(evidence,'test-admin-bootstrap.sql'),sql);console.log(JSON.stringify({testProject:ref,usersCreated:3,bootstrapSql:'docs/evidence/pin-release-2026-11-02/test-admin-bootstrap.sql',emailsSent:false,secretsPrinted:false}));
}

if(process.argv.includes('--seed')){
 const db=await signed('adminA');assert.equal(check(await db.rpc('current_user_is_admin'),'test role'),true);cfg.fixtures??={};
 async function row(table,key,value,data){const prior=await db.from(table).select('id').eq(key,value).maybeSingle();check(prior,'lookup '+table);if(prior.data)return prior.data.id;const created=check(await db.from(table).insert(data).select('id').single(),'seed '+table);return created.id;}
 cfg.fixtures.area=await row('areas','code','SPU_KK',{code:'SPU_KK',name:'TEST ONLY — พื้นที่สังเคราะห์ ไม่ใช่พิกัดจริง'});
 cfg.fixtures.binType=await row('bin_types','code','TEST_SINGLE',{code:'TEST_SINGLE',name:'TEST ONLY ถังเดี่ยว'});
 cfg.fixtures.categories={};for(const [slug,name] of [['general','ขยะทั่วไป'],['recyclable','ขยะรีไซเคิล'],['organic','ขยะอินทรีย์'],['hazardous','ขยะอันตราย']])cfg.fixtures.categories[slug]=await row('waste_categories','slug',slug,{slug,name});
 const catalog=[['pet-bottle','ขวดพลาสติก PET','recyclable'],['aluminium-can','กระป๋องอะลูมิเนียม','recyclable'],['clean-paper','กระดาษสะอาด','recyclable'],['cardboard','กล่องกระดาษ','recyclable'],['glass-bottle','ขวดแก้ว','recyclable'],['food-scraps','เศษอาหาร','organic'],['fruit-peels','เศษผักและผลไม้','organic'],['leaves','ใบไม้','organic'],['dirty-wrapper','ซองขนมเปื้อนอาหาร','general'],['used-tissue','กระดาษทิชชูใช้แล้ว','general'],['used-battery','ถ่านไฟฉายใช้แล้ว','hazardous'],['used-light-bulb','หลอดไฟใช้แล้ว','hazardous']];
 cfg.fixtures.items={};for(const [slug,name,category] of catalog)cfg.fixtures.items[slug]=await row('waste_items','slug',slug,{slug,name:'[TEST] '+name,category_id:cfg.fixtures.categories[category],status:'published'});
 cfg.fixtures.quiz=await row('quizzes','slug','test-general-quiz',{slug:'test-general-quiz',title:'TEST ONLY แบบทดสอบทั่วไป',version:1,status:'draft'});
 const status=check(await db.from('quizzes').select('status').eq('id',cfg.fixtures.quiz).single(),'quiz state');
 if(status.status==='draft'){
  const questions=[['ขวดก่อนรีไซเคิลควรทำอย่างไร?',['เทของเหลวและตรวจวัสดุ','ใส่รวมอาหาร'],0,'ตรวจวัสดุ ความสะอาด และเงื่อนไขจุดรับ'],['เศษอาหารต้องแยกอะไรออก?',['บรรจุภัณฑ์','ไม่ต้องแยก'],0,'แยกบรรจุภัณฑ์และของมีคม'],['ถ่านไฟฉายใช้แล้วควรทำอย่างไร?',['หาจุดรับที่ตรวจสอบได้','เผา'],0,'ไม่เผาหรือทิ้งรวม'],['AIยืนยันว่าทิ้งแล้วได้หรือไม่?',['ไม่ได้ ผู้ใช้ต้องยืนยัน','ได้อัตโนมัติ'],0,'Prediction และการยืนยันแยกจากกัน']];
  for(let i=0;i<questions.length;i++){const [prompt,choices,answer,explanation]=questions[i];const existing=check(await db.rpc('admin_quiz_questions'),'test questions').find(q=>q.quiz_id===cfg.fixtures.quiz&&q.position===i+1);check(await db.rpc('admin_save_question',{p_id:existing?.id??null,p_quiz:cfg.fixtures.quiz,p_position:i+1,p_prompt:prompt,p_choices:choices,p_answer:answer,p_explanation:explanation}),'seed question');}
  check(await db.from('quizzes').update({status:'published'}).eq('id',cfg.fixtures.quiz),'publish test quiz');
 }
 save();await db.auth.signOut({scope:'local'});console.log(JSON.stringify({testProject:ref,syntheticArea:1,categories:4,catalog:12,quiz:1,questions:4,productionTouched:false}));
}
