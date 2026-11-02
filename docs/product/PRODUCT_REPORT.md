# RECYCLE BIN — รายงานพัฒนา Product ในเครื่อง

**สถานะรวม: PARTIALLY READY LOCAL / NOT READY FOR RELEASE / CLOUD APPROVAL PENDING / NO DEPLOY**

รายงานนี้ใช้ Master Prompt8336d0f1 เป็นขอบเขตล่าสุด งานในเครื่องดำเนินการจริงแล้ว ส่วน Supabase Cloud หยุดตามข้อจำกัด ไม่มีการสร้าง Project รัน Cloud SQL เปลี่ยน Auth Settings หรือ Deploy

| ข้อ | ผลงานและหลักฐาน |
|---|---|
| 1 Backup Location | `backups/pre-blue-white-redesign/` อยู่นอก web/public และเส้นทาง Build |
| 2 Backup Verification | PASS —61ไฟล์ SHA256ตรง Snapshot, ต้นทางยังอยู่ครบ, สแกนไม่พบ Secret ที่ตรวจ, HTTPเส้นทางBackupตอบ404; ดู verification.json และ final-security-backup.json |
| 3 Restore | คู่มือ RESTORE.md มีขั้นตรวจ Manifest/WhatIf/คัดลอกเฉพาะไฟล์ ไม่มีการ Restore/ลบ/Reset อัตโนมัติ; ยังไม่ได้ทดลองเขียนทับ Source |
| 4 Screenshots |16ภาพก่อนและ16ภาพหลังจากเว็บจริง Desktop/Mobile ใน docs/evidence/ui-before-redesign และ ui-after-redesign; เพิ่ม6ภาพ Home/Login Desktop/Tablet/Mobile |
| 5 Poster Comparison | ฟ้า#0682dd ฟ้าอ่อน#e9f6fe พื้นขาว การ์ด/ปุ่มโค้ง มาสคอตถังฟ้า SVG และฟอนต์ไทยในเครื่อง; Home/Login/Navผ่านภาพจริงก่อนทำหน้าที่เหลือ ไม่มีการแปะโปสเตอร์ทั้งภาพ |
| 6 Completed Features | UIใช้งานจริง ค้นหา/กรอง/รายละเอียด บทความ Photo AI กล้องจริง/Synthetic Snapshot; เตรียม Sourceบัญชี/ประวัติ/สถิติ/แบบทดสอบ/ข้อความ/Admin เชื่อม Supabase; ไม่มี Fake Success |
| 7 Pending Features | Hosted Auth/Persistence/Admin end-to-end, อีเมล, ข้อมูลมหาวิทยาลัยที่ยืนยันแล้ว, มือถือจริงและAccessibilityเต็มรูปแบบ |
| 8 Files | รายการครบใน FILE_CHANGES.md/JSON; เพิ่ม0005แต่ไม่แก้ SQL0001–0004; รูปก่อน/หลัง ฟอนต์OFL และเอกสารProductเป็นไฟล์ใหม่ ไม่มีการติดตั้งแพ็กเกจเพิ่มในรอบRedesign |
| 9 AI Scanner | PASS local —Photoโมเดลจริง, Multi-object, Bounding Box/Label/Confidence, Unknown/Low Confidence/คุณภาพภาพ; กล้องจริง3เฟรมและกล้องสังเคราะห์ผ่าน Cleanup/Backpressure |
| 10 AI Limits | COCO80object classes ไม่ใช่จำแนกขยะ/วัสดุ;13labelsเชื่อมคู่มือ ขวดไม่เท่ากับพลาสติก; มีFalse Labelบนภาพขวดหนาแน่น ไม่อ้างAccuracyจากภาพเดียว |
| 11 Supabase Schema | PASS local candidate0001–0005;37ตาราง/211คอลัมน์/325Constraints/81Indexes/52PoliciesจากCatalogในเครื่อง; Hosted PENDING |
| 12 RLS | PASS local Synthetic A/B owner isolation/role escalation/transaction/idempotency/private quiz; Hosted API/RLS PENDING |
| 13 Authentication | Sourceสมัคร/เข้า/ออก/Callback/Recovery/Session/Protected Routes/เปลี่ยนรหัสผ่านจริงผ่านSupabase SSR พร้อม; ยังไม่มีCredentialsจึงไม่อ้างLoginสำเร็จ |
| 14 Scan History | Sourceบันทึกผลที่ลงลายเซ็นและเป็นเจ้าของจริง, HMACหมดอายุ5นาที,อ่านรายละเอียด/Pagination; Cloud PENDING; ไม่เก็บภาพต้นฉบับ |
| 15 Dashboard | Queryนับแถว/จำนวนชิ้น/ผลQuizและกราฟ7วันเวลาไทยจริง; Cloud PENDING ไม่มีตัวเลขสุ่ม/น้ำหนัก/Carbonแต่งขึ้น |
| 16 Admin | Sourceตรวจสิทธิ์ทั้งServer/DB จัดการCatalog/Rules/Knowledge/Quiz/Role/Status/Review/Audit/Archive/Links; ใช้กฎVersioning; Hosted CRUD PENDING |
| 17 Local Tests | PASS —Typecheck, Production Build, Node44, Python7, Browser/Search/Photo/PracticeQuiz, Contracts, SQL/RLS;39Responsive cases,16After Screenshots; ดูAUTOMATED_TEST_REPORT |
| 18 Hosted Tests | PENDINGทั้ง15รายการใน INTEGRATION_TEST_REPORT; ไม่มีบัญชีทดสอบหรือCloud Projectที่อนุมัติ |
| 19 Security | ปิดLegacy arbitrary scan write เพิ่มHMAC/Server-only writer/Explicit confirmation/Private quiz keys/Column grants/Owner FKs; ไม่พบKnown Secretในขอบเขตสแกน ไม่อ้างผ่านPentest/WCAGเต็มรูปแบบ |
| 20 Migration Risk | SQLไม่Rerunnable;Transactionต่อไฟล์เท่านั้น;Existing Usersต้องReviewBackfill;0005ซ่อนตำแหน่งเดิมที่หลักฐานไม่ครบ;ไม่มีDestructive Down ScriptหรือCloud Rollbackที่รันแล้ว |
| 21 Setup | คู่มือ SUPABASE_SETUP_RUNBOOK และ INSTALLATION_AND_LOCAL_RUN ตรงEnvironmentและMigrationจริง; Free Plan/Emailมีข้อจำกัด |
| 22 Blockers | TargetProject/Region/Credentials/SQL+Auth Approval, A/B Emails/AdminUUID, SPU_KK Verified Sources/Rules/Locations, PrivacyRetentionOwner |
| 23 Local URLs | http://127.0.0.1:3000 · /scanner · /guide · /login · /admin · AI http://127.0.0.1:8000/health/ready; DB readiness503ตามจริงเมื่อยังไม่ตั้งค่า |
| 24 Commands | เปิดด้วย `& '.\scripts\Start-Local.ps1'`; คำสั่งRuntime/ทดสอบแบบเต็มอยู่ INSTALLATION_AND_LOCAL_RUN ไม่ต้องติดตั้งGlobal |
| 25 User Actions | เลือกProject/Region ตรวจว่ามีข้อมูลเดิมหรือไม่ เตรียมTestAccounts/AdminUUIDและข้อมูลพื้นที่ แล้วอนุมัติCloud batchตามCLOUD_APPROVAL_GATEแยกต่างหาก; ห้ามส่งSecretในแชต |
| 26 Release | NOT READY —ยังไม่มีHosted Auth/Persistence/End-to-end และข้อมูลพื้นที่ครบ; ห้ามDeployทุกHosting จนผ่านPre-Deployment Quality Gateและได้รับอนุมัติแยกต่างหาก |

ภาพตัวอย่าง:

- [Home ก่อน](../evidence/ui-before-redesign/home-desktop.png) / [Home หลัง](../evidence/ui-after-redesign/home-desktop.png)
- [Login มือถือหลัง](../evidence/ui-after-redesign/login-mobile.png)
- [Scanner พร้อมผล AI จริง](../evidence/product/scanner-desktop.png)

คำแนะนำถังมาจากแหล่งอ้างอิงพื้นที่เท่านั้น Predictionไม่ใช่Confirmed Disposal การยืนยันต้องมาจากผู้ใช้แยกต่างหากและบันทึกSnapshotกฎ/แหล่งอ้างอิงได้เมื่อฐานข้อมูลพร้อม

ไม่มีการCommit/Push/Reset Git, ลบไฟล์เดิม, เปลี่ยนDriver/Toolkit/Windows/Firewall/PATH, ใช้บริการเสียเงิน หรือเปิดบริการสู่Public Internet เอกสาร/ดีไซน์เก่าที่เก็บในBackupและรายงานเดิมยังคงเป็นหลักฐานประวัติ ไม่ใช่สถานะProductปัจจุบัน

## Continuation 2026-11-02

Latest local continuation results and exact changed-file list: [CONTINUATION_REPORT_2026-11-02.md](CONTINUATION_REPORT_2026-11-02.md). Earlier evidence under docs/evidence/product is preserved. No hosted operation or deployment was performed; release remains NOT READY.
