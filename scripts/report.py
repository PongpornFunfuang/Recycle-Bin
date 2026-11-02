import datetime,hashlib,json,re
from pathlib import Path
root=Path(__file__).resolve().parents[1]
e=root/'docs/evidence'
verify=json.loads((e/'verification-results.json').read_text())
security=json.loads((e/'security-check.json').read_text())
gpu=json.loads((e/'gpu-diagnostic.json').read_text())
model=json.loads((root/'ml/manifests/active-model.json').read_text())
bench=json.loads((e/'active-model-api-benchmark-optimized.json').read_text())
node_log=(e/'node-tests.log').read_text(encoding='utf-8')
python_log=(e/'python-tests.log').read_text(encoding='utf-8')
node_count=re.search(r'tests (\d+)',node_log).group(1)
python_count=re.search(r'(\d+) passed',python_log).group(1)
test_rows='\n'.join(f"| {r['name']} | {r['status']} | exit {r['exitCode']} |" for r in verify['results'])
latencies='\n'.join(f"| {r['image']} | {r['input']} | {r['warmMedianApiMs']:.1f} ms |" for r in bench)
baseline=json.loads((root/'docs/milestone-1/local-development-baseline-2026-11-01.json').read_text(encoding='utf-8-sig'))
changed=[r for r in baseline['files'] if hashlib.sha256(Path(r['path']).read_bytes()).hexdigest().upper()!=r['sha256']]
changed_lines='\n'.join('- `'+str(Path(r['path']).relative_to(root)).replace('\\','/')+'`' for r in changed)
archive=e/'contract-baseline'
archive_names={'foundation.schema.json':'foundation.schema.json','application.openapi.json':'application.openapi.json','inference.openapi.json':'inference.openapi.json','README.md':'database-README.md'}
archived_ok=all(hashlib.sha256((archive/archive_names[Path(r['path']).name]).read_bytes()).hexdigest().upper()==r['sha256'] for r in changed)
source_originals=json.loads((root/'docs/milestone-1/baseline-files.json').read_text(encoding='utf-8-sig'))['protectedFiles']
start_hashes={str(Path(r['path'])).lower():r['sha256'].lower() for r in baseline['files']}
originals_ok=all(hashlib.sha256(Path(r['path']).read_bytes()).hexdigest().lower()==start_hashes[str(Path(r['path'])).lower()] for r in source_originals)
historical_differences=[{'path':r['path'],'historicalSha256':r['sha256'],'startOfThisRunSha256':start_hashes[str(Path(r['path'])).lower()],'currentSha256':hashlib.sha256(Path(r['path']).read_bytes()).hexdigest()} for r in source_originals if hashlib.sha256(Path(r['path']).read_bytes()).hexdigest().lower()!=r['sha256'].lower()]
(e/'historical-baseline-differences.json').write_text(json.dumps(historical_differences,indent=2),encoding='utf-8')
report=f'''# RECYCLE BIN — Local Development Report

Generated: {datetime.datetime.now(datetime.timezone.utc).isoformat()}

**พร้อมสาธิตเฉพาะ Local Photo AI / Guide / Quiz และ Foundation ที่ทดสอบแล้ว — ระบบทั้งโครงการยังไม่ Complete / NOT READY TO DEPLOY**

## 1. Files Created / Modified

สร้าง source ภายใน `web/`, `ai-service/app/`, tests, PostgreSQL migration candidates 4 ไฟล์, model manifests/weights ที่ตรวจ license, scripts, README, architecture/demo/acceptance documents และ evidence จริง ดูรายการพร้อม SHA-256 ใน `docs/evidence/source-inventory.json` (ไม่รวม dependency/runtime cache)

แก้ไฟล์เดิมที่ได้รับผลกระทบ {len(changed)} ไฟล์:
{changed_lines}

เก็บสำเนา bytes เดิมทั้งสี่ใน `docs/evidence/contract-baseline/`: {'PASS' if archived_ok else 'FAIL'}
ต้นฉบับที่คุ้มครองทั้ง 6 ไฟล์: {'PASS — SHA-256 ไม่เปลี่ยนจาก baseline ตอนเริ่มรอบนี้' if originals_ok else 'FAIL'}
ข้อแตกต่างจาก baseline M1 เก่า: Poster `Recycle Bin (2).png` มี hash ปัจจุบัน `ecd3210fcf452dc4e20e4422d1d878b367f109c90493d51eb9bb18e16e0aacc3` ซึ่งตรงกับ baseline ต้นรอบนี้เวลา 19:39:52 +07:00 แต่ต่างจาก M1 เก่า `6436c1528b160d4c3545c802698019a1645113cf3d1aabe207bbe8195f4356d9` จึงเป็นความต่างที่มีอยู่ก่อนการพัฒนารอบนี้ ไม่ระบุผู้แก้ไขโดยไม่มีหลักฐาน และไม่ปรับ Poster เอง ดู `historical-baseline-differences.json` การรับรอง baseline ประวัติยังรอยืนยันเวอร์ชัน
MongoDB validators, Fresh Plan, historical M1 reports/baselines/inventory คงอยู่ ไม่มีการลบ/ย้ายข้อมูลเดิม ไม่มี Git command/commit/push/remote change `.gitignore` เป็นไฟล์ป้องกัน secrets/runtime ใหม่ ไม่ได้สร้าง Git repository

## 2. M1-A Status

PASS เฉพาะ local contract/schema validation และ SQL/RLS logic: ปรับ active contracts 1.1, actual AI/health responses validate, model manifest validate, references resolve, relational schema/owner FKs/RLS/transactions ทดสอบด้วย PGlite และ synthetic auth stubs ไม่มีผล Hosted Supabase ที่นำมานับ Pass

## 3. M1-B Status

Local dependencies/venv/runtime: PASS. Node 24.22.1, pnpm 11.25.0; ไม่พบ npm บน PATH และไม่ติดตั้ง global package manager. Python 3.12.14 ภายใน project venv. pip 26.2.2 / setuptools 84.1.0. Supabase connectivity: PENDING — ยังไม่มี project/config ที่ได้รับอนุมัติ

PyTorch {gpu['torch']}, torchvision 0.29.1+cu126, CUDA runtime {gpu['cudaRuntime']}. GPU synchronized tensor result {gpu['sumSquares']} เท่ากับ expected {gpu['expected']}: {'PASS' if gpu['tensorPass'] else 'FAIL'}. ไม่เปลี่ยน Driver/Toolkit และไม่ใช้ tensor diagnostic แทนผล AI inference

## 4. M1-C Status

PASS สำหรับ localhost application, responsive navigation/routing, Next/FastAPI health/config/error handling, HTTP proxy, actual build/typecheck/tests. Database readiness แสดง Not Configured อย่างถูกต้อง จึงไม่ประกาศ M1 ทั้งหมด Complete

## 5. M2–M10 Status

| Milestone | สถานะตามหลักฐาน |
|---|---|
| M2 Database/Auth | Source/SSR/forms/RLS/migrations พร้อมสำหรับ integration; Hosted Auth/session/email/DB PENDING |
| M3 Catalog/Rules | Local guide/search ใช้ได้; published data readers และ verified-rule engine มี source; campus facts/Cloud PENDING |
| M4 AI Model | โมเดลจริงใช้งานได้ในเครื่อง เปรียบเทียบ Nano/Tiny/SSDLite/Faster R-CNN; ยังไม่ใช่ waste-specific validated model |
| M5 Photo Scanner | PASS local real photo/multi-object/boxes/confidence/unknown/errors; cloud history ยัง PENDING |
| M6 Real-Time | Continuous sequential HTTP frames/start/stop/snapshot ผ่าน synthetic-camera test; physical webcam/mobile PENDING |
| M7 Website | Public/member/admin routes และ basic management source มีจริง; hosted end-to-end/provider/full review workflow PENDING |
| M8 Integration/QA | Local automated tests PASS; Cloud/RLS JWT/real users/unseen teacher cases PENDING |
| M9 Release Review | NOT READY TO DEPLOY; ไม่ใช่ deployment approval |
| M10 Submission | README, run guide, architecture, DB/model summaries, status/evidence/demo script/screenshots/checklist จัดทำแล้ว; final teacher acceptance ยัง PENDING |

## 6. Website Localhost URL

- Website: http://127.0.0.1:3000
- Photo/Camera Scanner: http://127.0.0.1:3000/scanner
- AI readiness: http://127.0.0.1:8000/health/ready
- Web database readiness: http://127.0.0.1:3000/api/health/ready (503 Not Configured เป็นผลที่คาดเมื่อไม่มี Supabase)

## 7. AI Model Used

`{model['modelVersion']}` — Torchvision Faster R-CNN ResNet50 FPN v2 COCO, real PyTorch CUDA inference. SHA-256 `{model['sha256']}`. ไม่ fine-tune ไม่ดาวน์โหลด dataset ไม่ใช้ cloud GPU และไม่มี mock/random/filename-based predictions

YOLOX-Nano/Tiny และ SSDLite พลาดขวดในภาพทดสอบหลัก จึงไม่เลือกเป็น active model ผลก่อนเลือกเก็บไว้ครบ ไม่ถือผลจากสองภาพเป็น accuracy benchmark โมเดลที่เลือกยังมี false positives ในภาพกองขวด

## 8. AI Classes Actually Supported

Artifact มี 80 COCO object classes (metadata 91 slots รวม background/N/A). Positive source-photo evidence ในรอบนี้คือ **bottle**; ภาพกองขวดมี multi-object results จริง แต่ยังมี false positives เช่น fruit/vase จึงไม่อ้างว่าอีก 79 classes หรือขยะทุกชนิดผ่าน evaluation

จับคู่คู่มือเบื้องต้น 13 labels: bottle, cup, bowl, banana, apple, sandwich, orange, broccoli, carrot, hot dog, pizza, donut, cake. การจับคู่ไม่ใช่การยืนยันวัสดุหรือสถานะขยะ ไม่มี paper/can/battery class โดยตรง สีถังไม่มาจาก AI และ Confidence ไม่ใช่ accuracy

## 9. Database/Auth Status

Supabase PostgreSQL + Supabase Auth เท่านั้น ไม่มี MongoDB/Better Auth ใน active runtime. ยังไม่สร้าง project/account บน Cloud ไม่ execute SQL migration ไม่สร้างข้อมูลผู้ใช้จริง

Local PGlite tests ครอบคลุม schema syntax, A/B/anonymous/admin permissions, profile column limits, cross-owner FKs, scan snapshots, explicit disposal/idempotency/audit rollback, immutable verified rules, private quiz answer keys และ transactional quiz scoring. นี่ไม่ใช่ Supabase Auth/JWT/SMTP/Cloud RLS proof

Cloud-dependent pages แสดง Not Configured ไม่สร้าง user/history/statistics ปลอม การยืนยันทิ้งต้องแยกจาก prediction และมีกฎที่ผ่านการตรวจสอบ; ไม่ให้ AI เดาสีถัง/พิกัด

## 10. Build / Test Results

| Check | Status | Evidence |
|---|---|---|
{test_rows}

Node tests: **{node_count} passed**. Python tests: **{python_count} passed**. Browser: navigation/search/local quiz/photo API/mobile overflow checks; continuous camera ใช้ Chromium synthetic input >=3 frames, max one in flight, tracks stopped/no requests after stop. ไม่ใช่การรับรองกล้องจริง

npm audit: {json.dumps(security['npmAudit'])}. PyPI advisory review ล่าสุด: {json.dumps(security['pythonAdvisoryAudit'])}. Build server-only canary: {security['clientBuildCanary']['status']}. ไม่ถือว่าเป็น full penetration/security certification และ CUDA binary libraries ไม่ได้ audit แยก

พบและแก้ known advisories ของ pip/setuptools/torch ภายใน venv แล้ว; evidence ก่อนแก้อยู่ `runtime-cu128-initial/`. pytest มี deprecation warning ของ TestClient/httpx และ cache permission warning ที่บันทึกใน log ไม่ถูกปิดบัง ผล tests ยัง exit 0

### API performance — latest runtime

Warm median ของ server pipeline รวม decode/preprocess/inference/postprocess จากสองภาพ ทดสอบ 3 ครั้งต่อ input:

| Source | Input | Warm API median |
|---|---|---|
{latencies}

ไม่รวมการจับภาพ/วาด UI ทั้งหมด และไม่ใช่ physical-camera FPS, thermal endurance หรือ accuracy benchmark รายละเอียด cold runs/HTTP RTT อยู่ใน evidence

## 11. Working Features

Local homepage/navigation/responsive layout; searchable guide; original local knowledge content; API-scored practice quiz; real Photo multi-object detection with boxes/labels/confidence; unknown/low confidence/dark/blur heuristic; camera frame loop/snapshot/cleanup validated with synthetic stream; honest unconfigured states

Database integration source ประกอบด้วย profile/contact/feedback/history/summary, admin catalog/material/category/rules/knowledge/quiz/questions/users/source/location forms, private answer keys/grading, verified recommendation และ explicit disposal. ฟีเจอร์เหล่านี้ยังไม่รับรอง Cloud end-to-end

## 12. Pending Features

Hosted DB/Auth/RLS integration, email recovery delivery, Google/LINE, full administrative review/source expiry workflow, rule/bin/location relationship editing, real campus map data, material-condition clarification, approved video content, privacy/retention/account deletion policy, optional private image persistence/thumbnails, physical camera/mobile access, broader unseen-image/class evaluation และ teacher/user acceptance

ภาพผู้ใช้อยู่ใน memory ระหว่าง inference ไม่บันทึกทุกเฟรม ไม่ส่งภาพไป Supabase และไม่มี cloud Storage bucket. Phone localhost หมายถึงโทรศัพท์ ไม่ใช่ Windows server; ไม่เปิด LAN/tunnel/Firewall เพื่อแก้เอง

## 13. Remaining Blockers

Supabase Project/region/URL/publishable key และ approval สำหรับ Cloud SQL/admin bootstrap ยังไม่มี; กฎสีถัง/จุดทิ้ง SPU KK ยังไม่ยืนยัน; OAuth/email provider/test users และข้อมูลอาจารย์ TC04/ผู้ใช้จริง TC13 ยังต้องเตรียม ห้ามนับ Pending เป็น Pass

## 14. Exact Commands to Run

```powershell
# PowerShell จาก project root
& '.\\scripts\\Start-Local.ps1'
& 'C:\\Users\\P.12x_\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\bin\\node.exe' scripts/verify-local.mjs
```

Manual terminal commands และ installation อยู่ใน README. `Start-Local.ps1` ทดสอบเรียกแล้วเมื่อ services ทำงาน; ตรวจ health และไม่เริ่ม process ซ้ำ การเริ่ม hidden background processes หลัง reboot ยังไม่ได้ทดสอบจาก clean boot

## 15. Demo Readiness

**พร้อมสาธิต Local Photo AI / Guide / Practice Quiz** พร้อมเปิดเผย model limitations และ unconfigured cloud state. Camera code มีจริงและทดสอบ transport แล้ว แต่ต้องตรวจ physical webcam ก่อนสาธิตกล้องจริง. ระบบทั้งชุดยังไม่ Complete, TC01–TC13 ไม่ได้รับรอง, Pre-Deployment Gate ไม่ผ่าน และไม่ Deploy

## 16. Next Actions Required From User

1. เปิด localhost และทดสอบภาพ/กล้องจริง พร้อมแจ้งข้อแก้ไข UI หรือผล AI
2. ระบุหรือสร้าง Supabase Free scratch project ด้วยตนเอง และยืนยัน region; ไม่ส่ง secrets ผ่านแชต
3. ตรวจและอนุมัติ SQL 0001–0004 กับ admin bootstrap แยกก่อน Cloud execution
4. ตั้ง URL/publishable key ใน local environment, กำหนด email/provider/test identities ที่อนุญาต
5. ให้ข้อมูลสีถัง/จุดทิ้ง/แหล่งอ้างอิงจริง SPU KK, ข้อมูลทดสอบอาจารย์ และผู้ใช้ทดสอบ
6. ยืนยันว่า Poster เวอร์ชันปัจจุบันเป็นฉบับล่าสุดที่ต้องใช้ เนื่องจากต่างจาก historical M1 baseline อยู่ก่อนเริ่มรอบนี้

## M1-AC01–AC12

| ID | Status | ขอบเขต |
|---|---|---|
| AC01 | {'PENDING historical reconciliation' if historical_differences else 'PASS' if originals_ok and archived_ok else 'FAIL'} | current-run preservation PASS; historical poster version requires confirmation |
| AC02 | PASS | local workspace, no cloud SQL/project/deploy/Git/system changes |
| AC03 | PASS | pinned versions, installed license inventory, compatibility/build and advisory checks |
| AC04 | PASS | project venv only |
| AC05 | PASS local | schema/OpenAPI/actual payloads/local SQL/RLS constraints |
| AC06 | PENDING | hosted Supabase connectivity/authenticated query |
| AC07 | PENDING overall | local atomicity/isolation/idempotency PASS; hosted repetition not run |
| AC08 | {'PASS' if gpu['tensorPass'] else 'FAIL'} | synchronized CUDA arithmetic |
| AC09 | PASS | real localhost Next/FastAPI integration |
| AC10 | PASS | real model readiness and absent-model error tests; model enabled by M4 authorization |
| AC11 | PENDING overall | local origin/config/secret/RLS checks PASS; hosted JWT policies pending |
| AC12 | PASS local | build/typecheck/{node_count} Node/{python_count} Python/browser evidence |

**FINAL STATUS: LOCAL DEMO AVAILABLE / CLOUD INTEGRATION PENDING / PROJECT NOT COMPLETE / STRICT NO DEPLOY**
'''
(root/'docs/LOCAL_DEVELOPMENT_REPORT.md').write_text(report,encoding='utf-8')
print(json.dumps({'nodeTests':int(node_count),'pythonTests':int(python_count),'allLocalVerificationPass':all(r['status']=='PASS' for r in verify['results']),'protectedOriginalsUnchanged':originals_ok,'activeOriginalsArchived':archived_ok,'modifiedBaselineFiles':len(changed)}))
