from pathlib import Path
import json,hashlib,re,datetime
r=Path(__file__).resolve().parents[1];d=r/'docs/product';e=r/'docs/evidence/continuation-2026-11-02'
verification=json.loads((e/'verification-results.json').read_text(encoding='utf-8'));responsive=json.loads((e/'responsive-accessibility-camera.json').read_text(encoding='utf-8'));components=json.loads((e/'component-regressions.json').read_text(encoding='utf-8'));physical=json.loads((e/'physical-camera-inference.json').read_text(encoding='utf-8'));backup=json.loads((e/'backup-online.json').read_text(encoding='utf-8'));baseline=json.loads((e/'recovery-baseline.json').read_text(encoding='utf-8'));old={x['path']:x for x in baseline['files']}
node=re.search(r'tests (\d+)',(e/'node-tests.log').read_text(encoding='utf-8')).group(1);py=re.search(r'(\d+) passed',(e/'python-tests.log').read_text(encoding='utf-8')).group(1)
sql=json.loads((d/'MIGRATION_HASHES.json').read_text(encoding='utf-8'))[-1]['sha256'];cases=len(responsive['checks']);component_count=len(components['results'])
report=f'''# RECYCLE BIN — Continuation Report · 2 พฤศจิกายน 2026

**PARTIALLY READY LOCAL / READY FOR CLOUD SETUP REVIEW / NOT READY FOR RELEASE / NO DEPLOY**

## 1. งานที่ตรวจและทำต่อเสร็จแล้ว

- ดำเนินต่อจาก Source เดิม ไม่สร้างโปรเจกต์ใหม่ ตรวจไฟล์ข้อความที่รายงานเปลี่ยนแปลงจากรอบก่อนครบ104ไฟล์ และทุกไฟล์ตรง Hash ในรายงานเดิม ไม่พบผล Verification ที่ค้างหรือไฟล์ในรายการหาย ตัวเลขก่อนหน้าที่ระบุ40 Tests เป็นข้อมูลเก่า: หลักฐานรอบก่อนจริงมี44 Node +7 Python
- `git status` และ `git diff` ตอบว่าโฟลเดอร์นี้ไม่ใช่ Git repository จึงไม่สามารถตรวจ Git Diff ได้ ใช้ Hash Baseline แทน ไม่มีการ Init/Reset/Revert/Clean/Commit/Push
- Backup61ไฟล์ตรง SHA256 ต้นทางยังอยู่ครบ ภาพก่อน Redesign16ภาพเป็น PNGและไม่เปลี่ยน Hash ตรวจ HTTPจริงแล้ว Backup/Env/SQL/Model Weightsตอบ404 คู่มือ Restore ผ่านการตรวจ Pathและ Copy-Item -WhatIf เท่านั้น ไม่ได้ Restore จริง
- UIฟ้า–ขาวเดิมยังคงอยู่ ตรวจ{cases}กรณีครอบคลุม26เส้นทางที่ขนาด390/768/1440 รวม Home/Auth/Search/Categories/Details/Scanner/Knowledge/Quiz/History/Profile/Disposals/Dashboard/Map/Contact/Feedback/Settings/Learning/Admin ไม่พบ Overflowหรือช่องกรอกไม่มีชื่อในขอบเขตตรวจนี้ ไม่มีการใช้หน้าจอจำลองแทนฟีเจอร์จริง
- แก้ Readiness ให้แยก Network/Auth failure ออกจาก Schema Missing; ปฏิเสธโหมด Scanner ที่ไม่รองรับ ภาพเสีย และคำขอแบบฝึกหัดเกินขนาด
- การยืนยันทิ้งและ Quiz เก็บ Payload เดิมตลอดการลองส่งซ้ำ ป้องกันตัวเลือกเปลี่ยนระหว่างส่ง; Admin Clone แสดงเวอร์ชันใหม่ถูกต้องและรับมือ Error; Saved Scan เก่าไม่ทำให้หน้า Crashเมื่อข้อมูลวัตถุไม่ครบ
- Snapshot หยุดกล้องและจับภาพทันที รอคำขอ AI ที่กำลังทำงานจบก่อนส่งภาพที่ Freezeไว้ ตรวจด้วยผลตอบกลับ AIจริงที่หน่วงเวลาใน Test ไม่มีผลทำนายปลอม การบันทึกสแกนที่ตอบกลับช้าผูกกับ Prediction เดิม ไม่เปลี่ยนสถานะของภาพใหม่
- แก้ SQL0005 ปิดการแก้ Rule–Bin/Rule–Source ที่ Verifiedผ่าน Table Grant โดยตรง เพิ่ม Parent Lock/Trigger/Audit ต้องออกเวอร์ชันใหม่จริงแม้แก้เฉพาะความสัมพันธ์ SQL0001–0004ไม่เปลี่ยนและไม่มีการรัน SQLบนCloud

## 2. ผลทดสอบจริง

| การตรวจ | ผล | หลักฐานใน docs/evidence/continuation-2026-11-02 |
|---|---|---|
'''
for x in verification['results']:report+=f"| {x['name']} | {x['status']} | {x['name']}.log |\n"
report+=f'''| Node Automated Tests | {node} PASS /0FAIL | node-tests.log |
| Python | {py} PASS /0FAIL,2Warnings | python-tests.log |
| Component Regression | {component_count} PASS — FixturesเฉพาะTest | component-regressions.json |
| Responsive/Accessibility เบื้องต้น | {cases} PASS | responsive-accessibility-camera.json |
| Physical Camera | {physical['status']} —{physical['successfulFrames']}Actual Inference Requests | physical-camera-inference.json |
| Backup/Original Screenshots/HTTP Exposure | {backup['status']} | backup-online.json |
| Model SHA256 | PASS | model-integrity.json |
| Known Secrets/Build Canary | ผลสแกนสุดท้ายในรายงานแนบ | final-security-backup.json |

กล้องจริงครอบคลุม3เฟรม Live +Snapshot +เปิดใหม่แล้วหยุด Trackปิดครบและไม่มีRequestตามหลัง ไม่บันทึกภาพหรือLabelsจากกล้องจริง ไม่ใช่การวัดAccuracyหรือมือถือจริง ชุด Snapshot In-Flightใช้กล้องสังเคราะห์แต่ผลAIจริง การทดสอบ Componentใช้ FixtureและError503แยกใน Browser Memory ไม่ใช่ผลทดสอบAuthหรือPersistenceสำเร็จ

Pythonมี Starlette/httpx DeprecationWarning และ Cache Write PermissionWarning เท่านั้น Testsผ่าน ไม่เปลี่ยน Windows Permissionsเพื่อแก้Cache ผลล้มของSQLก่อนแก้และปัญหาเครื่องมือทดสอบบันทึกใน REGRESSION_FINDINGS.md ไม่ได้เปลี่ยน FAILเป็นPASSโดยไม่รันซ้ำ

## 3. Security และฐานข้อมูล

Regressionยืนยันว่าเดิม Adminแทรกความสัมพันธ์เข้ากฎVerifiedได้ผ่านตรง หลังแก้ INSERT/UPDATE/DELETEถูกป้องกันในฐานข้อมูลแล้ว รวมการลองผ่านOwnerในLocalTest ข้อมูลเดิมไม่ถูกลบ Triggerใหม่คุ้มครองการเขียนต่อจากนี้ ล็อก Parentเพื่อจัดลำดับกับการVerify แต่ยังไม่อ้างผลทดสอบContentionหลายConnectionบนHosted PostgreSQL

Schemaยังมี37ตารางเปิดRLS,211คอลัมน์,325Constraints,81Indexes,52Policies; schema-catalog.jsonเพิ่มรายการFunctions/Triggers HMACผูกUser/ผล/เวลา,Owner Isolation,Role Escalation,Transactions,IdempotencyและPrivate Quizผ่านLocalTestsเท่านั้น AI PredictionยังแยกจากConfirmed Disposal ไม่มีการเดาวัสดุ สีถัง หรือพิกัด

**SQL0005 Hash ใหม่:** `{sql}`

เป็นCandidateที่ยังไม่รันบนCloud ต้องตรวจและอนุมัติHashใหม่นี้ก่อนใช้งาน ไม่ใช้Hashรอบก่อน ไม่มีการติดตั้งDependenciesเพิ่ม เปลี่ยนDriver/Toolkit/Firewall/PATH ใช้บริการเสียเงิน หรือเปิดPublic Access

## 4. ไฟล์ที่เปลี่ยนเฉพาะ Continuation

รายการครบและSHA256อยู่ [CONTINUATION_FILES_2026-11-02.md](CONTINUATION_FILES_2026-11-02.md) และ JSONชื่อเดียวกัน เทียบกับ recovery-baseline.json ไม่ใช้Git ไม่รวมค่าของEnv/Secretsหรือ Dependencies/Runtime Caches ไฟล์Backupไม่ถูกเขียนทับ ไม่มีไฟล์Baselineถูกลบ

## 5. สิ่งที่ยังเหลือและ Cloud Blockers

- ยังไม่มีSupabase Project/Region/CredentialsหรือการอนุมัติCloud SQL/Auth Settings จึงยังทดสอบRegister/Login/Email/Recovery/Session/Persistence/Hosted RLS/Admin E2Eไม่ได้ ทั้ง15รายการใน INTEGRATION_TEST_REPORT.md เป็นPENDING
- Scan History/Disposal/Dashboard/Quiz Progress/Feedback/AdminมีSourceเชื่อมจริง แต่Hosted Integrationยังไม่Complete การSave FlowทดสอบSignature/SQL/Componentในเครื่องได้ ยังไม่อ้างว่าเขียนSupabaseจริงได้
- ต้องมีข้อมูลSPU_KKที่ยืนยันแหล่งอ้างอิง สีถัง พิกัด และกฎก่อนให้คำแนะนำพื้นที่ แผนที่ยังแสดงPendingโดยไม่มีหมุดสมมติ
- Android/iOSจริง,Accessibilityเต็มรูปแบบ,การใช้กล้องต่อเนื่อง/ความร้อน/RAM/VRAMและPrivacy/Retention/Deletion PolicyยังPending ไม่มีAccuracyทั่วไปจากภาพทดสอบเพียงสองภาพ

## 6. ขั้นตอนที่ต้องให้ผู้ใช้ดำเนินการ

1. ระบุSupabase Free Projectที่ต้องการใช้หรืออนุมัติการสร้าง พร้อมProject Reference/Regionและแจ้งว่ามีข้อมูลหรือAuth Usersเดิมหรือไม่ ห้ามเริ่มจากสมมติว่าเป็นฐานข้อมูลว่าง
2. ตรวจ [MIGRATION_REVIEW.md](MIGRATION_REVIEW.md), [MIGRATION_HASHES.json](MIGRATION_HASHES.json), [CLOUD_APPROVAL_GATE.md](CLOUD_APPROVAL_GATE.md) แล้วอนุมัติTargetและ SQL0001→0005/ผลกระทบ/Rollbackแยกต่างหาก
3. อนุมัติAuth Email Confirmation/Local Callback/Email Delivery Configurationตาม [SUPABASE_SETUP_RUNBOOK.md](SUPABASE_SETUP_RUNBOOK.md) ข้อจำกัดBuilt-in SMTPอาจทำให้ทดสอบอีเมลกับนักศึกษาทั่วไปไม่ได้ ไม่ปิดConfirmationเพื่อทำให้ดูผ่าน
4. ใส่Project URL/Publishable KeyและServer-onlySecretที่จำเป็นในweb/.env.localของเครื่องตาม ENVIRONMENT.md โดยไม่ส่งSecretในแชต ใช้SCAN_RECEIPT_SECRETที่เก็บในเครื่อง ไม่ต้องเปลี่ยนDriverหรือGlobal PATH
5. เตรียมบัญชีทดสอบA/Bที่มีสิทธิ์ใช้อีเมลและยืนยันอีเมลจริง ระบุUUIDเป้าหมายAdmin ใช้ [FIRST_ADMIN_REVIEW_TEMPLATE.md](FIRST_ADMIN_REVIEW_TEMPLATE.md) เฉพาะเมื่ออนุมัติแล้ว TemplateปฏิเสธUUIDศูนย์และActive Adminที่มีอยู่ จึงไม่ควรใช้ซ้ำ
6. ส่งข้อมูลพื้นที่และตัดสินใจPrivacy/Retention จากนั้นทดสอบHostedทั้ง15รายการ เก็บหลักฐานก่อนพิจารณาRelease

## 7. เปิดและทดสอบในเครื่อง

จาก `C:\\Users\\P.12x_\\Desktop\\RECYCLE BIN`:

```powershell
& '.\\scripts\\Start-Local.ps1'
& 'C:\\Users\\P.12x_\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\bin\\node.exe' scripts/verify-product.mjs --evidence-dir docs/evidence/manual-verification
```

เว็บ http://127.0.0.1:3000 · Scanner http://127.0.0.1:3000/scanner · AI http://127.0.0.1:8000/health/ready

Database Readiness `/api/health/ready` ยังคง503/not_configuredตามจริง ไม่ใช่AIล้มเหลว ดูคำสั่งและข้อจำกัดRuntimeใน INSTALLATION_AND_LOCAL_RUN.md การรันFullVerificationไม่เปิดกล้องจริงอัตโนมัติ กล้องจริงใช้สคริปต์แยกและต้องมีอุปกรณ์/สิทธิ์

## 8. Readiness

**พร้อมใช้LocalเฉพาะUI/คู่มือ/PhotoและCamera AIในขอบเขตที่ทดสอบ** และ **พร้อมเข้าสู่การตรวจอนุมัติCloud Integration** ยังไม่ใช่Productที่Auth/Persistence/ข้อมูลพื้นที่เชื่อมครบ และ **NOT READY FOR RELEASE**

หยุดที่Cloud Approval Gate ไม่มีการสร้างProject รันHosted SQL เปลี่ยนCloud Settings Commit/Push หรือDeployทุกกรณี การDeployยังต้องผ่านPre-Deployment Quality Gateและอนุมัติแยกต่างหาก
'''
(d/'CONTINUATION_REPORT_2026-11-02.md').write_text(report,encoding='utf-8')
entries=[];ignored={'.git','.next','.venv','node_modules','.local','backups','__pycache__','.pytest_cache'}
def walk(folder):
 for p in folder.iterdir():
  if p.is_symlink():continue
  if p.is_dir():
   if p.name not in ignored:walk(p)
  elif not(p.name.startswith('.env') and p.name!='.env.example') and p.suffix not in {'.pyc','.tsbuildinfo','.pth','.onnx'}:
   rel=p.relative_to(r).as_posix()
   if rel.startswith('docs/evidence/') or rel.startswith('docs/product/CONTINUATION_FILES'):continue
   sha=hashlib.sha256(p.read_bytes()).hexdigest();prior=old.get(rel)
   if prior is None or prior['sha256']!=sha or rel=='scripts/recover-continuation.py':entries.append({'path':rel,'status':'Created' if prior is None or rel=='scripts/recover-continuation.py' else 'Modified','sha256':sha})
walk(r)
removed=[p for p in old if not(r/p).is_file()];preserved=[]
for name in ['0001_foundation','0002_admin_workflow','0003_member_workflow','0004_quiz_workflow']:
 rel='database/postgres/'+name+'.sql';preserved.append({'path':rel,'unchanged':hashlib.sha256((r/rel).read_bytes()).hexdigest()==old[rel]['sha256']})
(d/'CONTINUATION_FILES_2026-11-02.json').write_text(json.dumps({'basis':'recovery-baseline.json; no Git. Env secret values excluded; evidence artifacts under separate directory.','files':entries,'removedBaselineFiles':removed,'preservedMigrations':preserved},ensure_ascii=False,indent=2),encoding='utf-8')
(d/'CONTINUATION_FILES_2026-11-02.md').write_text('# Files changed in this continuation\n\n'+ '\n'.join(f"- {x['status']}: `{x['path']}`" for x in entries)+'\n\nNo baseline file was deleted. Source env secrets were not changed or included. Runtime evidence is stored separately under docs/evidence/continuation-2026-11-02.\n',encoding='utf-8')
p=r/'scripts/verify-product.mjs';s=p.read_text(encoding='utf-8');needle="for(const [name,command,args,directory] of steps){if(only"
if needle in s and 'Unknown verification step' not in s:s=s.replace(needle,"if(only&&[...only].some(name=>!steps.some(step=>step[0]===name)))throw Error('Unknown verification step; no tests have been run');for(const [name,command,args,directory] of steps){if(only");p.write_text(s,encoding='utf-8')
print(json.dumps({'nodeTests':node,'pythonTests':py,'responsiveCases':cases,'isolatedComponentChecks':component_count,'physicalAIRequests':physical['successfulFrames'],'changedFiles':len(entries),'removedBaselineFiles':removed,'preservedMigrations':preserved,'release':'NOT READY'}))
