// Local isolated PostgreSQL guard test only; never contacts Supabase or runs migrations.
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url),require=createRequire(new URL('web/package.json',root));
const {PGlite}=require('@electric-sql/pglite');
const sql=readFileSync(new URL('database/operations/first_admin_fdmohzvuxvsrcaddbjvl.sql',root),'utf8');
const db=new PGlite(),target='a1fbf6f7-0d34-44bf-a071-f265f61dfebb';
const report={capturedAt:new Date().toISOString(),scope:'Isolated PGlite minimal fixture; NOT hosted bootstrap or full migration compatibility',cloudSQLExecuted:false,checks:[]};
try{
 await db.exec("create schema auth;create schema private;create table public.recyclebin_schema_version(version int);insert into public.recyclebin_schema_version values(5);create table auth.users(id uuid primary key,email_confirmed_at timestamptz);create table public.profiles(id uuid primary key references auth.users(id));create table private.user_access(user_id uuid primary key references auth.users(id),status text);create table private.user_roles(user_id uuid references auth.users(id),role_code text,primary key(user_id,role_code));create table private.audit_logs(actor_id uuid,event text,entity_id uuid,entity_table text,changed_fields text[]);");
 await assert.rejects(db.exec(sql),/confirmed_auth_profile_active_access_required/);await db.exec('rollback');report.checks.push({name:'missing/unconfirmed target rejected',status:'PASS'});
 await db.query('insert into auth.users values($1,now())',[target]);await db.query('insert into public.profiles values($1)',[target]);await db.query("insert into private.user_access values($1,'active')",[target]);await db.exec(sql);
 assert.equal((await db.query("select * from private.user_roles where role_code='admin'")).rows.length,1);const audit=(await db.query('select * from private.audit_logs')).rows;assert.equal(audit.length,1);assert.equal(audit[0].actor_id,null);assert.equal(audit[0].event,'operator_first_admin_bootstrap');report.checks.push({name:'confirmed active target gains role with operator audit atomically',status:'PASS'});
 await assert.rejects(db.exec(sql),/active_admin_already_exists_use_admin_workflow/);await db.exec('rollback');assert.equal((await db.query('select * from private.audit_logs')).rows.length,1);report.checks.push({name:'repeated bootstrap rejected without duplicate audit',status:'PASS'});
 report.status='PASS_LOCAL_GUARDS_ONLY';
}catch(e){report.status='FAIL_LOCAL_GUARDS';report.error=e.message;process.exitCode=1;}
finally{await db.close();writeFileSync(new URL('docs/evidence/cloud-migration-fdmohzvuxvsrcaddbjvl/first-admin-local-guards.json',root),JSON.stringify(report,null,2));console.log(JSON.stringify(report));}
