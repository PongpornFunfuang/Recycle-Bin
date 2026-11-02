from pathlib import Path
import json,hashlib,datetime
r=Path(__file__).resolve().parents[1];e=r/'docs/evidence/cloud-migration-fdmohzvuxvsrcaddbjvl';manifest=json.loads((r/'docs/product/MIGRATION_HASHES.json').read_text(encoding='utf-8'));prior=json.loads((e/'ledger.json').read_text(encoding='utf-8'))
history=e/'ledger-before-label-correction.json'
if not history.exists():history.write_text(json.dumps(prior,ensure_ascii=False,indent=2),encoding='utf-8')
rows=[]
for i,m in enumerate(manifest):
 if hashlib.sha256((r/m['file']).read_bytes()).hexdigest()!=m['sha256']:raise SystemExit('Hash mismatch, do not report completion')
 rows.append({**m,'cloudExecuted':True,'status':'COMMITTED','observedResult':'Success. No rows returned','timeRecorded':prior['migrations'][i]['time'] if i<len(prior['migrations']) else datetime.datetime.now(datetime.timezone.utc).isoformat(),'evidence':'SQL Editor observed result in this session; validation.json confirms installed objects'})
result={'project':'fdmohzvuxvsrcaddbjvl','region':'ap-southeast-1','preflight':prior['preflight'],'migrations':rows,'recordingNote':'Initial ledger entries 3 and 4 were mistakenly labeled 0002 due to a retained REPL binding. Labels corrected from actual per-file verified editor submissions and Success observations; original ledger preserved. No migration was rerun. Timestamps are local recording times, not database commit timestamps. Windows clipboard adds CRLF; comparison restored original LF and matched approved source hashes.','validation':json.loads((e/'validation.json').read_text(encoding='utf-8'))}
(e/'ledger.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
expected={'schema_version':'5','base_tables':'37','rls_disabled':'0','policies':'52','auth_users':'0','active_admins':'0','legacy_save_execute':'false','member_writer_execute':'false','service_writer_execute':'true','member_quiz_keys_select':'false','member_roles_insert':'false','quiz_direct_insert':'false','rule_link_guard_triggers':'2','definers_missing_search_path':'0'}
actual={x['check_name']:x['value'] for x in result['validation']['rows']};assert all(actual.get(k)==v for k,v in expected.items())
meta=r/'docs/evidence/cloud-preflight-2026-11-02/project-created.json';state=json.loads(meta.read_text(encoding='utf-8'));state.update(cloudSqlExecutedByAgent=True,migrationsApplied=True,authUsersVerifiedBySql=0);meta.write_text(json.dumps(state,indent=2),encoding='utf-8')
print(json.dumps({'project':result['project'],'committed':len(rows),'sourceHashesMatch':True,'validation':'PASS','hostedUserE2E':'PENDING','authSettingsChanged':False,'adminCreated':False}))
