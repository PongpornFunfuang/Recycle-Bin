// Existing authorized owner account only. Independent non-persistent session.
// No registration/email/reset/profile edits. Never prints credentials/tokens.
import fs from 'node:fs';import path from 'node:path';import {createRequire} from 'node:module';
const root=path.resolve(import.meta.dirname,'..'),require=createRequire(path.join(root,'web/package.json'));
const {createClient}=require('@supabase/supabase-js');const out={capturedAt:new Date().toISOString(),scope:'Existing authorized owner, separate ephemeral Supabase Auth session; no UI session changed, no email sent, no application rows written',checks:[]};
try{
 const file=path.join(root,'.local/secrets/owner-auth-test.json');
 if(!fs.existsSync(file))throw Error('owner_test_credentials_missing');
 const owner=JSON.parse(fs.readFileSync(file,'utf8'));if(!owner.email||!owner.password)throw Error('owner_test_credentials_incomplete');
 const env=Object.fromEntries(fs.readFileSync(path.join(root,'web/.env.local'),'utf8').split(/\r?\n/).filter(l=>l.includes('=')&&!l.startsWith('#')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i),l.slice(i+1).trim().replace(/^['"]|['"]$/g,'')];}));
 if(env.NEXT_PUBLIC_SUPABASE_URL!=='https://fdmohzvuxvsrcaddbjvl.supabase.co')throw Error('project_mismatch');
 const db=createClient(env.NEXT_PUBLIC_SUPABASE_URL,env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
 if(process.argv.includes('--invalid-only')){const invalid=await db.auth.signInWithPassword({email:owner.email,password:owner.password+'-invalid-audit'});const result={capturedAt:new Date().toISOString(),scope:'One invalid-password request against authorized owner; no emails',status:invalid.error?.code==='invalid_credentials'?'PASS':'FAIL',errorCode:invalid.error?.code??null};fs.writeFileSync(path.join(root,'docs/evidence/full-audit-2026-11-02/hosted-invalid-login.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));process.exit(0);}
 const login=await db.auth.signInWithPassword({email:owner.email,password:owner.password});out.checks.push({name:'owner_login',status:!login.error?'PASS':'FAIL',errorCode:login.error?.code??null});
 if(login.error)throw Error('owner_login_failed');
 try{
  const identity=await db.auth.getUser();out.checks.push({name:'verified_identity',status:identity.data.user?.id===login.data.user.id?'PASS':'FAIL'});
  const role=await db.rpc('current_user_is_admin');out.checks.push({name:'owner_admin_role',status:role.data===true&&!role.error?'PASS':'FAIL'});
  const refreshed=await db.auth.refreshSession();out.checks.push({name:'refresh_token',status:refreshed.data.session&&!refreshed.error?'PASS':'FAIL'});
  const own=await db.from('profiles').select('id',{count:'exact',head:true}).eq('id',login.data.user.id);out.checks.push({name:'own_profile_read',status:own.count===1&&!own.error?'PASS':'FAIL'});
 }finally{const logout=await db.auth.signOut({scope:'local'});out.checks.push({name:'ephemeral_session_logout',status:!logout.error?'PASS':'FAIL'});}
}catch(e){out.blocker=e.message;}
fs.writeFileSync(path.join(root,'docs/evidence/full-audit-2026-11-02/hosted-owner-auth.json'),JSON.stringify(out,null,2));console.log(JSON.stringify(out));
