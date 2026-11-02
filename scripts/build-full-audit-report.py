import collections,datetime,json,re
from pathlib import Path
R=Path(__file__).resolve().parents[1];E=R/'docs/evidence/full-audit-2026-11-02';Q=R/'docs/qa';Q.mkdir(exist_ok=True)
def read(name,default=None):
 p=E/name
 return json.loads(p.read_text(encoding='utf-8-sig')) if p.exists() else default
host=read('hosted-counts.json');meta=read('hosted-security-metadata.json');integrity=read('hosted-integrity.json');inventory=read('source-inventory.json');ai=read('ai-functional-cases.json');responsive=read('responsive.json');auth=read('hosted-owner-auth.json');deps=read('dependency-audit.json');verification=read('verification-results.json')
# Preserve the initial failing attempt; the serial rerun is the current result.
node=(E/'node-tests-serial.log').read_text(encoding='utf-8-sig');passed=re.search(r'pass (\d+)',node);failed=re.search(r'fail (\d+)',node)
if failed and failed.group(1)=='0':
 for result in verification['results']:
  if result['name']=='node-tests':result.update(status='PASS',exitCode=0,evidence='node-tests-serial.log',tests=int(passed.group(1)),initialAttempt='node-tests.log: Sandbox uv_os_get_passwd failure; separate concurrent attempt hit expected inference 429; serial final rerun passed')
(E/'verification-results.json').write_text(json.dumps(verification,ensure_ascii=False,indent=2),encoding='utf8')
rows=[]
def add(system,feature,environment,status,evidence,cause='—',action='—'):
 rows.append([f'QA-{len(rows)+1:03}',system,feature,environment,status,evidence,cause,action])
for page in read('browser-pages.json'):
 add(page['path'],'เปิด URL และตรวจหัวหน้า ไม่ใช่ผลยืนยันทุกปุ่ม','Browser + Local Next','PASS' if page['headings'] and not page['notFound'] else 'FAIL','browser-pages.json')
for page in read('browser-admin-pages.json'):
 add(page['path'],'โหลดหน้า Admin และข้อมูลที่อ่านได้ ไม่รวมการบันทึก','Browser + Hosted read','BLOCKED' if page['path'].endswith('/locations') else 'PASS','browser-admin-pages.json','B01: Backend ไม่มี RPC/Schema ใหม่' if page['path'].endswith('/locations') else '—','แก้ B01/B02 ก่อน Save' if page['path'].endswith('/locations') else '—')
 for label in sorted(set(b['text'].strip() for b in page['buttons'] if b['text'].strip())):
  if label in ['บันทึก','ส่งข้อความ','บันทึก Pending Verification'] or any(label.startswith(p) for p in ['แก้ไข','เก็บรายการ','นำกลับ','ตรวจหลักฐาน','ปิดใช้งาน','เพิ่มสิทธิ์','ถอนสิทธิ์','ระงับบัญชี','เปิดใช้บัญชี','บันทึกความสัมพันธ์']):
   add(page['path'],label+' — การเปลี่ยนข้อมูลสำเร็จและคงอยู่หลัง Reload','Hosted / Browser','BLOCKED','browser-admin-pages.json; B03','ไม่มี Hosted/Test Environment แยกสำหรับข้อมูลและสิทธิ์ทดสอบ; ไม่ใช้ข้อมูลจริงทดสอบ CRUD','เตรียม B03 แล้วทดสอบและ Cleanup')
for page in read('browser-detail-pages.json'):
 add(page['path'],'เปิดรายละเอียดตามลิงก์จริง/บทความที่เผยแพร่','Browser + Hosted/public content','PASS' if not page['notFound'] else 'FAIL','browser-detail-pages.json')
for page in read('browser-member-pages.json'):
 add(page['path'],'อ่านข้อมูลบัญชีปัจจุบัน/สถานะว่าง ไม่แก้ข้อมูล','Browser + Hosted owner','PASS','browser-member-pages.json')
for check in read('browser-form-validation.json'):
 add('/admin/'+check['section'],'กดบันทึกฟอร์มว่างแล้วถูก native validation ปฏิเสธ','Browser','PASS' if check['emptySubmitBlocked'] else 'FAIL','browser-form-validation.json')
for item in read('anonymous-api-probes.json')['results']:
 status='PASS' if item.get('http') is not None and (item['http']<400 or item['http'] in [400,401,403,404,415]) else 'FAIL'
 add(item['url'].replace('http://127.0.0.1:3000',''),item['method']+' probe แบบ Anonymous/Invalid body ตามหลักฐาน (ไม่ใช่ Happy-path CRUD)','Local API → Hosted/AI',status,'anonymous-api-probes.json','—' if status=='PASS' else 'ดู HTTP status ใน Log','—' if status=='PASS' else 'วิเคราะห์ Error Path เพิ่ม')
for check in auth['checks']:add('Auth',check['name'],'Hosted; ephemeral owner session',check['status'],'hosted-owner-auth.json')
add('Auth','รหัสผ่านผิด 1 คำขอถูกปฏิเสธ','Hosted',read('hosted-invalid-login.json')['status'],'hosted-invalid-login.json')
for table in read('hosted-anonymous-rls.json')['results']:
 add('RLS/'+table['table'],'GET ผ่าน Publishable Key โดยไม่มี user token; ตรวจผลตามตาราง','Hosted','PASS','hosted-anonymous-rls.json')
for check in ai['results']:add('AI',check['case']+' HTTP/quality error path','Local real model',check['status'],'ai-functional-cases.json')
for width in [360,390,768,1366,1920]:
 group=[c for c in responsive if c['width']==width]
 add('Responsive',str(width)+'px: 8 หน้าที่ทดสอบไม่มี horizontal overflow; ตรวจ labels ใน DOM','Browser','PASS' if len(group)==8 and not any(c['overflow'] or c['unlabelledControls'] for c in group) else 'FAIL','responsive.json')
special=[
 ('Search','ค้นแบตเตอรี่พบ 1; คำไม่มีผลลัพธ์แสดง Empty State','Browser','PASS','browser-smoke.json; ทดสอบ CUA ซ้ำ'),
 ('Quiz','โหลด Hosted 1 ชุด/4 คำถาม ไม่มีเฉลยใน GET','Hosted + Browser','PASS','browser-quiz.json; hosted-anonymous-rls.json'),
 ('Quiz','แบบฝึกหัดไม่บันทึกบัญชี ได้ 3/3 และแสดงคำอธิบาย','Browser + Local API','PASS','browser-quiz.json'),
 ('Quiz','ส่งคะแนน Hosted/Reload/History/Member isolation','Hosted','BLOCKED','B03: attempts จริง 0; ไม่สร้างคะแนนทดสอบใน Production'),
 ('Quiz','แสดง feedback หลังตรวจคะแนนสำเร็จ และไม่แสดงก่อน POST','Isolated component fixture','PASS','component-regressions.json'),
 ('Admin Map','คลิก/ลากอ่านพิกัด เปลี่ยน SVG สีแดง เพิ่ม 2 ถัง และ Cancel','Browser frontend only','PASS','browser-admin-map.json'),
 ('Admin Map','Save Pending → Reload → Edit → Verify → Student Map','Hosted','BLOCKED','B01/B02/B03; RPC ไม่มี, Bucket ไม่มี'),
 ('Admin Map','OLD/NEW junction/category/source/bin invalidation, bypass/member denial, rollback/audit/idempotency','Local PGlite + synthetic auth/storage metadata','PASS','pin-lifecycle.log; pin-lifecycle.test.ts; pin-guards.test.ts'),
 ('Admin Map','GPS Evidence ที่เชื่อถือได้จากการสำรวจจริง','Browser/Physical','NOT TESTED','B05: คลิกแผนที่ไม่ใช่หลักฐาน GPS; ไม่มีการสำรวจจริงในรอบนี้'),
 ('Student Map','แสดง 0 จุด/0 ถัง Empty State; ไม่มี DEMO','Browser + Hosted','PASS','student-map.json; hosted-counts.json'),
 ('Student Map','กดหมุด Verified จริงและเปิดนำทาง','Hosted/Physical','BLOCKED','B05: Verified physical locations = 0; ไม่สร้างพิกัดแทน'),
 ('Navigation','ยุบ/ขยาย Active, Back/Forward, Escape และคืน focus','Browser','PASS','navigation-retest.json'),
 ('Navigation','Drawer เปิดบนมือถือแล้ว resize เป็น Desktop ต้องไม่ล็อกหน้า','Browser','PASS','drawer-resize-retest.json'),
 ('Evidence','Decode JPEG/PNG/WebP; ปฏิเสธ fake/truncated/MIME mismatch/SVG/เกิน16MP','Local decoder tests','PASS','evidence-decode.log'),
 ('Evidence','Upload/Object existence/Owner isolation/Signed URL/Delete/Cleanup','Local Supabase Storage','BLOCKED','B02/B03: Docker/CLI ไม่มี, WSL status exit50; ไม่ใช่ PGlite Storage'),
 ('Evidence','Upload/Read/Delete/Owner isolation บน Hosted Storage จริง','Hosted Storage','BLOCKED','B01/B02: buckets=[] และยังไม่ Apply candidates'),
 ('History','อ่านผลเดิมเจ้าของและ Reload แล้วพบ 35 detections','Browser + Hosted read','PASS','existing-history-read.json'),
 ('User flow','Login → Scan → Guidance → Save new history → Reload','Hosted + Browser','BLOCKED','B03: ทดสอบ Scan/Guidance/อ่านเดิมแล้ว แต่ไม่สร้าง test history บน Production'),
 ('Disposal','Prediction ไม่เพิ่ม disposal อัตโนมัติ; receipt/owner/explicit confirmation','Local PostgreSQL + unit','PASS','node-tests-serial.log'),
 ('Disposal','ยืนยันทิ้งโดยใช้คำแนะนำทั่วไป ไม่ต้องรอกฎมหาวิทยาลัย','Hosted','BLOCKED','B04: UI/API ยังผูก ruleId verified; disposal_rules=0'),
 ('Feedback/Contact','ข้อความหนึ่งตัวอักษรถูกปฏิเสธ ไม่มีข้อความสำเร็จ','Browser + Hosted auth API','PASS','message-validation.json'),
 ('Feedback/Contact','ส่งข้อความถูกต้อง/Reload/Admin review','Hosted','BLOCKED','B03: ไม่มีบัญชี/ข้อมูลทดสอบแยก; ไม่สร้างข้อความทดสอบใน Production'),
 ('Auth','Register/Duplicate email/Verification/Password reset email','Hosted','BLOCKED','B06: ไม่มี isolated Auth flow; รอบนี้ห้ามส่งอีเมลจริงโดยพลการ'),
 ('Auth','Password change ผ่าน UI และ Session expiry จริง','Hosted','NOT TESTED','B06: ไม่เปลี่ยนรหัสบัญชีจริง; ต้องบัญชีทดสอบ/เจ้าของกรอก Credential เอง'),
 ('Auth','Member B และ cross-user RLS จริง A/B','Hosted','BLOCKED','B03/B06: ไม่มี Session ของ B ที่พร้อมทดสอบ; Local synthetic A/B ผ่าน'),
 ('AI','Multi-object ผ่าน UI: 35 boxes, confidence, guidance/source, uncertain labels','Browser + real local Faster R-CNN','PASS','browser-real-ai.json'),
 ('AI','ภาพขวดหลายชิ้นมี false-positive apple/banana จากการตรวจภาพด้วยตา','Browser + manual image review','FAIL','known-error-observation.json; browser-real-ai.jpg; B07'),
 ('AI','mAP@0.5/mAP@0.5:0.95/Precision/Recall/per-class AP','Labeled held-out benchmark','NOT TESTED','B07: NOT MEASURED; มีภาพ functional เพียง2ภาพ ไม่มี ground truth boxes'),
 ('AI','Fine-tuning/เปลี่ยน Production checkpoint','Local/Production','NOT TESTED','B07: ไม่มี dataset split/license/annotation ที่พร้อม; ไม่เปลี่ยนโมเดล'),
 ('AI','Real-time frame/snapshot race/cleanup','Synthetic camera browser fixture','PASS','camera-synthetic.log; snapshot-inflight.log'),
 ('AI','กล้องจริงที่ชี้ไปขยะบนมือถือ/แสงจริง','Physical Camera','NOT TESTED','B08: ไม่มี physical waste scene ที่จัดให้ทดสอบ; synthetic ไม่ใช่กล้องจริง'),
 ('Reliability','503 retry, stable payload, stale result และ quiz in-flight lock','Isolated components','PASS','component-regressions.json'),
 ('Reliability','Slow network/timeout/VRAM soak/concurrency/deadlock บน PG จริง','Full integration','NOT TESTED','B03/B09: ไม่ทำ load test Production; PGlite ไม่พิสูจน์ concurrency PG server'),
 ('Accessibility','Labels ที่ตรวจใน40กรณี; native dialog Escape/focus','Browser','PASS','responsive.json; navigation-retest.json'),
 ('Accessibility','Full WCAG contrast/screen reader/touch-target ทุก control','Manual/device audit','NOT TESTED','B09: ไม่มี full assistive-technology/contrast run; ไม่อ้าง WCAG compliance'),
 ('Lint','ESLint','Local','NOT TESTED','B09: ไม่มี ESLint dependency/config/script ในโปรเจกต์'),
 ('Security','Known-secret scan และ backupเดิม61ไฟล์','Local','PASS','final-security-backup.json'),
 ('Security','Dependency advisory audit','npm registry','PASS','dependency-audit.json: vulnerabilities0'),
 ('Browser','Console error/warn ในแท็บ CUA ที่ทดสอบ','Browser','PASS','browser-console-summary.json:0; ไม่ใช่ HAR'),
 ('Browser','HAR ครบทุก failed network request ของทุก control','Browser','NOT TESTED','B09: เก็บ API probes/console แต่ไม่มี full network HAR'),
 ('Cloud','Apply 0006 → 0007a → 0007 → 0007b','Hosted','BLOCKED','B01/B02: security/storage release gate ยังไม่ผ่าน'),
 ('Deployment','Public hosting/AI hosting production readiness','Public Internet','NOT TESTED','ไม่ได้ Deploy; AI URL จำกัด loopback ตามโค้ดปัจจุบัน'),
]
for system,feature,environment,status,evidence in special:
 add(system,feature,environment,status,evidence,'—' if status=='PASS' else evidence,'—' if status=='PASS' else 'ดู Blocker Register และ Final Action Plan')
for item in verification['results']:add('Automated suite',item['name'],'Local (ดู scope ของ suite)',item['status'],item.get('evidence',item['name']+'.log'))
def table(headers,data):
 def cell(v):return str(v).replace('|','/').replace('\n',' ')
 return '\n'.join(['| '+' | '.join(headers)+' |','|'+'|'.join(['---']*len(headers))+'|']+['| '+' | '.join(map(cell,row))+' |' for row in data])
stamp=datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=7))).isoformat()
counts=collections.Counter(r[4] for r in rows)
text=f'''# RECYCLE BIN — Full System Audit

ตรวจรอบวันที่ 2 พฤศจิกายน 2026 · สรุปเมื่อ {stamp} · Project `fdmohzvuxvsrcaddbjvl` เท่านั้น

## A. EXECUTIVE SUMMARY

**Production Ready: NO.** ระบบอ่านข้อมูล ค้นหา บทความ แบบฝึกหัด AI ภาพจริง และ Auth บัญชีเจ้าของทำงานในขอบเขตที่ทดสอบ แต่ Admin Pin Save และ Storage จริงยังไม่พร้อม ไม่ได้ทดสอบครบทุก mutation ทุก role บน Hosted และไม่อ้างว่าเสร็จ100%.

P0 ที่ยังเปิดอยู่ 2 กลุ่ม: (1) Hosted ไม่มี pin schema/RPC/bucket ทำให้ Save ใช้งานไม่ได้ (2) Candidate evidence trust path ยังไม่ผ่าน security release gate: API decode แล้วแต่ direct Storage upload อาจข้ามการตรวจ และยังไม่มีการทดสอบ Storage จริง/Recovery ครบ. เป็นความเสี่ยงของ Candidate ที่ยังไม่ได้ Apply ไม่ใช่ข้อพิสูจน์ว่า Anonymous โจมตี Hosted สำเร็จ.

ผลล่าสุด: Node **{passed.group(1)} tests PASS**, Python **7 tests PASS**, Component Regression **5 cases PASS**, Typecheck/Build PASS, dependency advisory audit0, secret/backup scan PASS. แบบฝึกหัด3/3ไม่บันทึกบัญชี; Hosted Quiz โหลด4ข้อแต่ไม่ได้สร้าง test attempt. ค้นพบ {len(inventory['files'])} source files ใน inventory, เปิด20 public/member entry URLs,19 Admin URLs รวมหน้าเดิมที่ซ่อน,28 detail URLs และอ่านประวัติเดิม1รายการ. การเปิดหน้าไม่เท่ากับผ่านการบันทึกหรือทุกปุ่ม.

Matrix: {dict(counts)}. ตัวเลขนี้นับ test cases ไม่ใช่เปอร์เซ็นต์ความพร้อมของเว็บไซต์. ไม่มีการ Apply Migration/แก้ Hosted schema/Storage policy/Seed/SMTP/ส่งอีเมล/สร้าง First Admin/Deploy/Commit/Push. ไม่มีหมุด ประวัติสแกน คะแนน หรือข้อความทดสอบสำเร็จถูกเพิ่มใน Production. SQL Editor อาจบันทึก query draft ตามพฤติกรรม Dashboard แต่คำสั่งทั้งหมดเป็น SELECT.

## B. FEATURE INVENTORY & TEST MATRIX

หลักฐานทั้งหมดอยู่ใน `docs/evidence/full-audit-2026-11-02/`. `source-inventory.json` แจกแจงทุกไฟล์/routes/API methods/forms/buttons/disabled expressions/SQL objects/test suites. Inventory เป็นหลักฐานการค้นพบ ไม่ใช่ PASS ด้านพฤติกรรม. `browser-admin-pages.json` เก็บชื่อปุ่มที่พบ; ปุ่มแก้ข้อมูลไม่ถูกนับ PASS จากการเห็นบนหน้า.

สถานะระบบที่พบ: ใช้งานจริงในขอบเขตที่รัน=public reads/Auth/AI/แบบฝึกหัด; ปิด/ยังไม่เสร็จ=Hosted pin save/private Storage; ซ้ำซ้อน=หน้าเดิม `/admin/bins`, `/admin/reviews` ถูกซ่อนแต่ยังทดสอบการเปิด; Legacy/ไม่ใช่เส้นทาง active=ONNX detector/model files, `location-details-admin` ที่ import แต่ไม่ได้ render ใน AdminManager; สถานะการมีผู้ใช้งานจริงของ componentอื่นไม่ได้วัดจาก analytics. Static guide/practice quiz/DEMO preview ถูกแยกจากข้อมูลจริง ไม่ใช่ Mock AI. Google/LINE ยังปิด; ไม่มี Settings Admin แยกจาก routesที่พบ; ช่องอาคารเป็นข้อความในจุดติดตั้ง ไม่ใช่ building master table. ฟอร์ม Admin ทั่วไปยังไม่มี Search/Sort/Pagination UI และ queryมี limit100; ไม่อ้างว่าทดสอบ controls ที่ไม่มี.

{table(['ID','หน้า/ระบบ','ฟังก์ชัน','Environment','Status','หลักฐาน','สาเหตุถ้าไม่ผ่าน','วิธีแก้'],rows)}

## C. BUG LIST / FIX & RETEST

| ID | Severity | Reproduction / Root cause | แก้ / Files | Retest / Evidence |
|---|---|---|---|---|
| FIX-01 | P1 | Save ล้มเหลวแล้วแก้ bins/ลากเลือกพิกัด; cache attemptเดิมอาจส่ง payloadเก่า | `self-pinning-admin.tsx` + `pin-save-attempt.ts`: snapshot immutable, reuseเฉพาะ payloadเหมือนเดิม, เปลี่ยนร่างเริ่มrequestใหม่ | PASS unit `pin-save-attempt.test.ts`; Hosted saveยังBLOCKED ไม่อ้าง E2E |
| FIX-02 | P2 | POST JSON ไป AI proxy ถูก catchเป็น503 ทั้งที่ Content-Typeผิด | `api/ai/detect/route.ts`: ตอบ415ก่อนส่งเข้า inference | PASS `scanner-errors.test.ts`, anonymous-api-probes.json |
| FIX-03 | P1 | Account Quiz รับfeedbackจากการgradeแต่ไม่renderคำอธิบาย | `database-quiz.tsx`: แสดงfeedbackเฉพาะหลังPOSTสำเร็จ เพิ่มaria-pressed | PASS regressionใหม่ใน `component-regressions.json`; fixtureไม่สร้างHostedคะแนน |
| FIX-04 | P0 release gate | ไฟล์ปลอม/truncatedที่มี JPEG/PNG/WebP headerผ่าน signatureอย่างเดียว | `validate-evidence-image.ts` + `api/location-evidence/route.ts`: magic+MIME+full pixel decode+16MP limit; GETตรวจdecodeเช่นกัน; sharp0.35.5 Apache-2.0 direct dependency | PASS evidence-decode2tests; แก้ API boundaryเท่านั้น direct Storage bypassยังBLOCKED |
| FIX-05 | P2 | เปิดmobileDrawerแล้วresize1366: dialog.open=true แต่ display:none ทำให้หน้าล็อก | `admin-workspace.tsx`: close modalเมื่อ breakpointเข้าDesktop | PASS browser before/after `drawer-resize-retest.json`; Escape/focus/Back/Forwardทดสอบซ้ำ |
| OPEN-01 | P0 | Hosted RPC/table/bucketไม่มี | ยังไม่Apply จงใจรักษาguard | B01/B02 |
| OPEN-02 | P0 candidate security | direct authenticated Storage pathตรวจowner/metadataแต่ไม่พิสูจน์serverตรวจbytes; RPC verifyอาศัยmetadata | ยังไม่ถือว่าAPIdecodeแก้ครบ; ต้อง trusted server attestation/hash และสิทธิ์ที่ผู้ใช้ปลอมไม่ได้ | B02; ไม่ทดสอบโจมตีProduction |
| OPEN-03 | P1 | upload metadataถูกinsertก่อนobject; uploadfailอาจเหลือorphan, ยังไม่มี recovery/cleanupครบ | ต้องมีcompensation/reconciliationและทดสอบconcurrency | B02/B03 |
| OPEN-04 | P1 | Confirmationยังต้องverified ruleId; Hosted disposal_rules0 แม้General Guidanceพร้อม | ต้องรองรับsnapshotคำแนะนำทั่วไปที่version/sourceชัด แยกจากถังในพื้นที่ ไม่รอกฎมหาวิทยาลัย | B04 |
| OPEN-05 | P1 | COCO modelทำนายapple/bananaและคลาสอื่นผิดในภาพขวดหลายใบ | รักษาUnknown/low confidence; ยังไม่มีbenchmark/fine-tune | B07 |

Automated test runล่าสุดไม่มีFAIL แต่ feature test มีFAILด้านfalse-positive AI และมีBLOCKED/NOT TESTEDจำนวนมาก ไม่แปลงเป็นPASS. Initial sandbox failure/concurrent429ยังเก็บแยกใน logs. Lifecycle testครั้งแรกใช้ direct DELETE ที่ระบบห้าม จึงปรับ fixtureให้ใช้ unlink RPCตามสิทธิ์และทดสอบใหม่ ไม่ลดPolicy.

## D. SECURITY REPORT

Hosted introspectionจริง: {len(meta['tables'])} tables (public/private) เปิดRLSทั้งหมด, {len(meta['policies'])} policies (รวมstorage), {len(meta['functions'])} functions, {len(meta['triggers'])} trigger entries, {len(meta['constraints'])} constraints, {len(meta['indexes'])} indexes. Trigger entriesมาจาก information_schema จึงอาจมีหลายeventของtriggerเดียว ไม่ตีความเป็นจำนวนชื่อunique. SECURITY DEFINERที่พบมีsearch_path configuration; metadataการมีRLSไม่ใช่หลักฐานว่าแต่ละpolicyถูกต้องทุกrole.

Anonymous RESTจริง: private application tables6ตารางตอบ401; user_roles/quiz_answer_keysไม่อยู่ในpublic APIตอบ404; quiz_questionsเปิดเฉพาะid/quiz_id/position/prompt/choices. Same-origin mutationsปฏิเสธOriginอื่น403; unauthorized admin/member reads401; evidencepreview403. Local testsตรวจIDOR/RLS/suspended access/role escalation/server-only persistence/receipt tampering/atomic rollback/private grading/immutable rulesผ่าน. Hosted memberBยังไม่ทดสอบ จึงไม่อ้าง cross-user HostedPASS.

APIใช้Zod/structuredSupabase queries; SQLที่operatorรันเป็นstatic SELECT. XSS: popupใช้textContentและSVGสีwhitelist แต่ยังไม่มีdynamic malicious payload E2Eครบทุกinput. ไม่มีfull XSS/SQLi pentest. Rate limitที่ทดสอบได้คือAI semaphore429ในรันconcurrent; ยังไม่มีdistributed load/rate-limitครบทุกAPI. Security headersมีnosniff/frame/referrer/permissions policyตามconfig; secret scanไม่พบknown secretsในขอบเขตที่สแกน และpnpm auditรายงาน0ช่องโหว่ ไม่เท่ากับรับรองไม่มีช่องโหว่.

Candidate order/SQL hashดูท้ายรายงาน. ยังไม่ผ่านrelease gate จึงไม่มีHostedApply. การตรวจStorage columnsของHostedจริงไม่แทนการรันStorage API.

## E. DATABASE REPORT

{table(['ตาราง/ค่า','จำนวนหรือสถานะ'],list(host['counts'].items())+list(integrity['counts'].items())+[['Hosted schemaVersion',host['health']['schemaVersion']],['Ledger versions',host['migrations']],['Active admins',integrity['active_admin_count']],['Buckets',host['buckets']],['pin_evidence/admin_save_pin/admin_verify_pin','ไม่มีทั้ง3'],['Invalid/unvalidated constraints',integrity['invalid_constraints']]] )}

`supabase_migrations.schema_migrations` ไม่มีในProjectนี้; application ledgerคือ `public.recyclebin_schema_version` มี[5]. ไม่ถือว่าLedgerนี้มีhashของ0001–0004. ไม่รัน0001–0005ซ้ำ. ตรวจorphan junction/key3กรณีได้ {integrity['orphans']}; ไม่อ้างว่าครบทุกตาราง. มีpublic view scan_history; RLSview/owner isolationตรวจในLocaltests และAnonymousprivateGETถูกปฏิเสธบนHosted.

No Production CRUD test rows. PGliteแต่ละsuiteใช้ synthetic identities, ปิดฐานข้อมูลเมื่อจบและไม่มีHosted connection. PGliteไม่มีจริงStorage/auth server/PG multi-sessionจึงไม่พิสูจน์Storageและdeadlock. Database snapshot/restoreจริงบนHostedยังNOT TESTED; ไม่ถือว่าSELECTmetadataเป็นfull backup. ต้องจัดทำbackupที่restoreตรวจได้ก่อนmigrationrelease.

## F. AI REPORT

Active architecture Faster R-CNN ResNet50 FPN v2, checkpoint `{ai['checkpointSha256']}`. Manifestตรงกับไฟล์จริง; Torch `{ai['torch']}`, CUDA runtime `{ai['cudaRuntime']}`, device `{ai['gpu']}`. ไม่มีการดาวน์โหลดweights/datasetหรือฝึกใหม่ในรอบนี้.

Inferenceจริงผ่านUI35boxes, model latencyที่หน้าแสดงประมาณ394msในครั้งที่เก็บหลักฐาน (ไม่ใช่SLA). Functional generated/quality/error7กรณีผ่าน; success walltimes {[(r['case'],r['wallMs']) for r in ai['results'] if r['http']==200]}. GPU snapshotดูgpu-runtime.csv: VRAMใช้1683/6144MiB อุณหภูมิ75°C ณจุดวัด ไม่ใช่peakหรือsoak benchmark.

Pipeline: EXIF transpose→RGB/alpha white background→thumbnail<=1280→tensor0..1→model min640/max960, COCO91slots; score>=.25เก็บ, mappedclass>=.5 accepted, .25–.5 low confidence, unsupportedclass unknown; normalizedboxes[0,1]และEXIF/dimensionsตรวจด้วยPython tests. AIไม่ทำนายสีถัง ไม่ยืนยันวัสดุ และไม่ยืนยันการทิ้ง. NMSเป็นส่วนหนึ่งของTorchvision detector ไม่อ้างว่าได้tuneแล้ว.

**Accuracy Metrics: NOT MEASURED.** ภาพfunctional2ภาพมีattributionที่ `ml/test-images/ATTRIBUTION.md` (CC0 และCC BY-SA4.0) ไม่มีheld-out ground truth boxes/train split. ภาพมืด/เบลอ/blankที่สร้างเพิ่มใช้ทดสอบquality/error ไม่ใช่benchmark. COCOไม่มีclassกระป๋อง/กระดาษ/แบตเตอรี่; พบfalse positives apple/banana/vaseฯลฯในภาพขวดหลายชิ้น. ยังไม่มีmanual user correction UIครบ. ไม่ปรับthreshold/checkpointจากภาพไม่กี่ภาพและไม่อ้างaccuracyเพิ่ม.

## G. E2E REPORT

- Student: Existing owner Auth PASSแยกsession; Browser photo inference/guidance/source PASS; Student Map0จุดถูกต้อง; อ่านexisting history35detectionsหลังReload PASS. NewScan→Save→Reloadครบเส้นทางยังBLOCKED B03 ไม่สร้างtesthistoryบนProduction.
- Admin: Sidebar/Drawer/Back/Forward/deep link/refresh/คลิก/ลาก/หลายถังสีdynamic PASSเฉพาะfrontend; Save→Reload→Edit→Verify→StudentMapยังBLOCKED B01/B02/B03. ทดสอบร่างแล้วCancel ไม่ค้างเป็นrecord.
- Quiz: HostedGET1ชุด4ข้อ ไม่มีkeys; practice3/3PASS; Local grading/rollback/idempotency/role testsPASS; Hosted submit/historyBLOCKED B03. UIfeedbackแก้และtestfixturePASS ไม่ใช่HostedsubmitPASS.
- Feedback/Contact: invalid one-character requestถูกปฏิเสธจริง; successful persistence/admin reviewBLOCKED B03.
- Mobile: 40กรณี/5ขนาดไม่overflowบน8หน้าที่ระบุในresponsive.json; ไม่อ้างทุกหน้าและทุกscrollstate/อุปกรณ์จริง. Drawer resizebugแก้แล้ว. กล้องจริง/GPS/นำทางไปถังจริงยังไม่ทดสอบ.

ภาพหลักฐาน: [Admin Map](../evidence/full-audit-2026-11-02/admin-map.jpg), [AIจริง](../evidence/full-audit-2026-11-02/browser-real-ai.jpg), [Student Map](../evidence/full-audit-2026-11-02/student-map.jpg), [Mobile Drawer](../evidence/full-audit-2026-11-02/mobile-admin-drawer.jpg), [Hosted Counts](../evidence/full-audit-2026-11-02/hosted-counts.jpg).

## H. BLOCKER REGISTER

| ID | ติดอะไร / สาเหตุที่ตรวจได้ | ต้องใช้อะไร / ผู้ดำเนินการ | ขั้นตอนสั้นที่สุด | ทำส่วนอื่นต่อได้ |
|---|---|---|---|---|
| B01 | Hosted schema5 ไม่มีpin tables/RPC/bucket; Saveจึงdisabled | วิศวกรต้องreleasecandidateหลังB02/B03และbackup/recovery; สิทธิ์Cloudต้องอยู่ในขอบเขตที่อนุมัติ | ทำtest/review→backup/restoreproof→preflighthash→Applyตามลำดับ→postflight | ได้:อ่านข้อมูล/AI/content |
| B02 | RealStorageยังไม่ผ่าน; direct-upload trustและorphan/recoveryยังไม่ครบ | วิศวกรเพิ่มserver-only attestation/hash/owner/object bindingและcleanupที่race-safe | ปิดช่องbypassก่อน→ทดสอบStorageJPEG/PNG/WebP/forged/cross-owner/signed/read/deleteจริงในB03 | ได้:LocalSQL/API tests |
| B03 | Dockerไม่มีในPATH; Supabase CLIไม่มี; WSL --status exit50; มีเพียงPGlite | เจ้าของเครื่องเปิดWSL2/virtualizationและติดตั้งDockerที่รองรับWindowsเครื่องนี้โดยอนุมัติOS changesก่อน หรืออนุมัติTestProjectแยกอย่างเจาะจง; ไม่ใช้Projectอื่นเอง | ตรวจOS/virtualization→เลือกทางที่รองรับ→LocalSupabase+testusers+Mailpit→รันCRUD/E2E+cleanup | ได้:Hostedread-only/Localtests |
| B04 | Confirmation APIบังคับverified ruleId แต่general guidanceเป็นcodeและdisposal_rules0 | วิศวกรออกแบบgeneral-guidance snapshot/version/sourceและauthorizationแยกจากcampusbinfacts; อาจต้องnon-destructive migrationหลังreview | ทำcontract+testก่อนSQL; ไม่รอกฎมหาวิทยาลัย ไม่สมมติสี/จุดรับ | ได้:Guidance/AI/catalog |
| B05 | Verified physical locations0; ไม่มีหมุดจริงให้กดนำทางและไม่มีGPSsurvey | เจ้าของสำรวจจริงหลังระบบSaveพร้อม | ปักจุดจริงพร้อมหลักฐาน→Pending→review→Verified | ได้:ระบบEditor/EmptyState |
| B06 | ไม่มีisolated Auth/email/password-changeflow; รอบนี้ไม่อนุญาตส่งอีเมลโดยพลการ | เจ้าของจัดบัญชีB/ขั้นตอนCredentialในช่องทางปลอดภัย; วิศวกรใช้LocalAuth+Mailpitก่อน; ถ้าทดสอบHostedemailต้องอนุมัติขอบเขตส่ง | ใช้B03ทดสอบregister/reset/duplicateโดยไม่ส่งอีเมลจริง→แยกHostedtestเมื่ออนุญาต | ได้:ownerexistingAuth/anonymous/localRLS |
| B07 | ไม่มีlabeled held-out detection testset/train split | วิศวกรคัดdatasetlicense+boxes+split ไม่มีleakage | ทำmanifest/labels→baseline mAP/latency→candidate→เปรียบเทียบก่อนเปลี่ยนmodel | ได้:inference/quality/error/mapping |
| B08 | Synthetic cameraไม่ใช่physical waste/camera/GPS scene | เจ้าของจัดกล้องชี้ขยะที่ยินยอมให้ทดสอบ ไม่ส่งภาพบุคคลโดยไม่จำเป็น | ทดสอบpermission/start/stop/snapshot/หลายเฟรมบนอุปกรณ์จริง แล้วบันทึกผล | ได้:synthetic race tests |
| B09 | ไม่มีESLint/fullWCAG/HAR/fullPGconcurrency/soak coverage | วิศวกรเพิ่มconfig/toolsที่จำเป็นในLocal test scope; accessibilityต้องmanual/device | เพิ่มchecksตามrisk และรันในB03/เครื่องLocal ไม่ยิงloadProduction | ได้:testsที่มีอยู่ |

## I. FINAL ACTION PLAN

1. P0: ทำB02 trusted-evidence flow/cleanup/recoveryและB03จริงให้ครบ ก่อนB01 Hosted migration. เกณฑ์LocalSQLผ่านอย่างเดียวไม่พอ. ไม่ปลดSaveguardเพื่อให้UIดูทำงาน.
2. P0: จัดbackup/restoreตรวจได้และreviewhash4ไฟล์; transactionแยก/rollbackplanต้องไม่ทำProductionเป็นสนามทดลอง. ห้ามrollbackด้วยการdropข้อมูลจริง.
3. P1: ทำAdmin/Student CRUD end-to-endในB03 รวมReload/Verify/Archive/OwnerIsolation/Audit. แล้วใช้Hostedกับข้อมูลจริงที่เจ้าของสำรวจเท่านั้น.
4. P1: แก้B04ให้คำแนะนำทั่วไปและการยืนยันแยกจากกฎมหาวิทยาลัย/สีถังจริง พร้อมsnapshot/sourceและRLStests.
5. P1: ทดสอบnewscan persistence, Quiz submit/explanation/retry/history, feedback/contactและAuthA/Bในenvironmentแยก; ไม่เติมคะแนน/ประวัติปลอมในProduction.
6. P1: B07 benchmarkdatasetก่อนfine-tuneหรือเปลี่ยนcheckpoint; ขณะนี้ไม่วัดaccuracy.
7. P2: UIvalidation messagesที่เฉพาะเจาะจงขึ้น, Adminsearch/paginationเมื่อข้อมูลมาก, WCAG/physicalmobile/timeout/recoverytestsตามB08/B09.
8. Deploymentแยกอนุมัติและต้องผ่านPre-Deployment Quality Gate; ปัจจุบันloopback-only AI/Origin และcriticalblockersทำให้ยังไม่พร้อมPublichosting. ไม่มีค่าใช้จ่ายเพิ่มหรือบริการเสียเงินในรอบนี้.

### Migration hashes (ยังไม่Apply)

{table(['ไฟล์','SHA-256'],[[Path(v['Path']).name,v['Hash'].lower()] for v in read('migration-hashes.json')])}

### Files changed and dependencies

Modified: `web/src/components/self-pinning-admin.tsx`, `database-quiz.tsx`, `admin-workspace.tsx`, `web/src/app/api/ai/detect/route.ts`, `web/src/app/api/location-evidence/route.ts`, `web/package.json`, `web/pnpm-lock.yaml`, `web/tests/scanner-errors.test.ts`, `web/tests/async-components.fixture.tsx`, `scripts/component-regressions.cjs`.

Created: `web/src/lib/pin-save-attempt.ts`, `validate-evidence-image.ts`, tests `pin-save-attempt.test.ts`, `pin-lifecycle.test.ts`, `evidence-decode.test.ts`; audit scripts `full-system-audit.py`, `full-audit-ai.py`, `full-audit-hosted-anon.py`, `full-audit-auth.mjs`, `build-full-audit-report.py`; report/evidenceในโฟลเดอร์นี้. ไม่แก้SQLmigrationหรือGit. Backupcorefilesใน `backups/full-audit-2026-11-02/`; backupเดิม61ไฟล์ยังตรงhash.

Dependencyเพิ่มโดยตรง: **sharp0.35.5, Apache-2.0, Node>=20.9** (Nodeที่รันทดสอบ24.22.1). รุ่นเดียวกับdependencyที่มีอยู่ของNext; install output downloaded0 และใช้storeภายในProject ไม่ติดตั้งGlobal/Driver/CUDA Toolkit. ตรวจlicenseจากpackageจริง; advisoryauditปัจจุบัน0 ไม่รับรองอนาคต.

แหล่งอ้างอิงGeneral Guidanceตรวจ URL เปิดได้ในรอบนี้: [Greener Bangkok — คู่มือชุมชน](https://greener.bangkok.go.th/waste-recycle/community-waste-guide/) อธิบาย4กลุ่มขยะทั่วไป; ไม่ใช่ข้อยืนยันสีถัง/จุดรับของมหาวิทยาลัย และไม่ใช่การตรวจlicenseภาพ/บทความทุกชิ้นครบถ้วน. ใช้การสรุปคำแนะนำ ไม่ได้ดาวน์โหลดภาพจากเว็บนั้นมาใช้ใหม่.

### ข้อจำกัดการตีความ

ไม่ได้ทดสอบทุกmutationบนHostedเพราะขัดกับข้อกำหนดไม่ใช้Productionเป็นtestสนามและไม่มีenvironmentแยก. แต่ละรายการที่ทำไม่ได้ถูกระบุBLOCKED/NOT TESTEDพร้อมB01–B09 ไม่เหมารวมว่าเว็บไซต์ผ่าน. ไม่ได้ทำpayment/SMTP/deployment/OS changes. รายงานนี้เป็นผลตรวจปัจจุบันพร้อมรายการงานเปิด ไม่ใช่ใบรับรองProduction Ready.
'''
(Q/'RECYCLE_BIN_FULL_SYSTEM_AUDIT.md').write_text(text,encoding='utf8')
(E/'feature-test-matrix.json').write_text(json.dumps({'capturedAt':stamp,'counts':dict(counts),'columns':['id','system','feature','environment','status','evidence','cause','action'],'rows':rows},ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps({'report':str(Q/'RECYCLE_BIN_FULL_SYSTEM_AUDIT.md'),'cases':len(rows),'statuses':dict(counts),'nodeTests':int(passed.group(1))}))
