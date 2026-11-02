# Supabase Cloud Integration — Preflight Report

**2 พฤศจิกายน 2026 · Project Creation Approval Pending · NOT READY FOR RELEASE**

1. **Project Creation:** เตรียมแบบฟอร์ม `recycle-bin` ใน Organization `PongpornFunfuang-2005` แล้ว รออนุมัติ ยังไม่ได้สร้าง มีBrowserAutomationใช้งานจริงและSessionพร้อม จึงยังไม่ต้องให้ผู้ใช้ไปสร้างเอง
2. **Reference/Region:** Project Referenceใหม่ยังไม่มี; เสนอ/เลือกSingapore `ap-southeast-1` ในแบบฟอร์มเท่านั้น OrganizationRef `eglhhcovwcnnceprvlfx` ไม่ใช่ProjectRef พบProjectเดิมชื่อRecycle Binที่Seoulแต่ไม่แก้ไข/นำมาใช้
3. **SQL Migration:** อ่านและตรวจSHA256ครบ0001–0005ตรงManifestทุกไฟล์;0005ตรงค่าที่ผู้ใช้ระบุ `feb76b37c73c986dcee9dccde36cc0d44d02e67b81e7b16cf292ee2a89d73c09` ไม่แก้SQLหรือHash ไม่มีHosted SQL execution
4. **Authentication:** SSR/Server Client/Proxy/CallbackและProtected APIsเป็นSourceเดิมที่ตรวจแล้ว ยังไม่เปลี่ยนAuth SettingsของCloud การตั้งEmail/Callback/PasswordPolicyจะเสนอพร้อมTargetProjectเพื่ออนุมัติแยกอีกขั้น
5. **Persistence:** Localยังไม่มีSupabase URL/Publishable/Server Secretในไฟล์EnvหรือProcessที่ตรวจ มีเฉพาะLocalHMACที่ไม่เปิดเผยค่า `/api/health/ready`ตอบ503/database=not_configuredตามจริง ไม่อ้างว่าเชื่อมต่อสำเร็จ
6. **Admin:** ยังไม่สร้าง ดู FIRST_ADMIN_REVIEW_TEMPLATE.md ซึ่งยังเป็นTemplateไม่Executed ต้องใช้UUIDบัญชีที่มีอยู่จริงและอนุมัติแยก
7. **Hosted E2E:** ทั้ง15รายการยังPENDING หลักฐานLocalเดิมยังตรงSource:49Node/7Python/4Component/78Responsive/กล้องจริง5Requests ไม่มีการรันซ้ำทั้งหมดเพราะSourceไม่เปลี่ยน ใช้ผลเดิมพร้อมตรวจHash ไม่อ้างเป็นHostedTests
8. **Security:** Backup61ไฟล์ยังตรงHash; ไม่มีSource DriftจากรายการContinuation; ไม่อ่านค่ารหัสผ่านในแบบฟอร์ม ไม่ใส่SecretลงReports/Logs/Bundle โครงการเดิมทั้งหมดไม่เปลี่ยน ค่าความปลอดภัยในแบบฟอร์มยังไม่PersistบนCloud
9. **Blockers:** การอนุมัติสร้างProject, Free quotaที่ต้องตรวจผลตอนสร้าง, ต่อมาคือการอนุมัติSQL/Auth/AdminและบัญชีA/Bที่มีสิทธิ์ใช้อีเมลจริง ยังไม่มีข้อมูลถัง/พิกัด/กฎSPU_KKที่อนุมัติ
10. **User Actions:** ตอบอนุมัติหรือแก้รายละเอียดใน SUPABASE_CREATION_REVIEW_2026-11-02.md ก่อน ผู้ใช้ไม่ต้องส่งKeys/Passwordsในแชต ขั้นSQL/Auth/AdminจะแยกคำขอหลังTargetพร้อม ไม่ถือว่าการอนุมัติสร้างProjectอนุมัติขั้นอื่น
11. **Readiness:** LocalUI/AIอยู่ในสถานะเดิมที่ผ่านในขอบเขตทดสอบ; CloudIntegrationยังไม่Complete; ProductยังNOT READY FOR RELEASE ไม่มีDeploy/Commit/Push/การสร้างProjectหรือแก้CloudในรอบPreflight

## Migration set ที่ตรวจแล้ว — ยังไม่ขออนุมัติExecuteจนกว่าจะมีTarget

| ลำดับ | ไฟล์ | SHA256 |
|---|---|---|
| 1 | 0001_foundation.sql | `4ec71fc39f989962ae9acace0d1f6509341704daee5a4bb3c96e5e534824629b` |
| 2 | 0002_admin_workflow.sql | `c616550531ea6773cd23ddfd3b8253856ce02b4dc644af2069284a6fa01a7526` |
| 3 | 0003_member_workflow.sql | `5178d1e87d24b6feed756e5b1f5d53e2064808cdd0a40e62cbb30f587ef02747` |
| 4 | 0004_quiz_workflow.sql | `44c7946584d66a47455a4c0fea81896fc16b8441812121c87869883ed25e24f5` |
| 5 | 0005_product_hardening.sql | `feb76b37c73c986dcee9dccde36cc0d44d02e67b81e7b16cf292ee2a89d73c09` |

SchemaCandidateเดิม37ตารางเปิดRLS มีOwner/Composite FKs,Versioned Rules,Private Quiz Keys,HMAC/Server-only scan writer และChecked Admin RPCs ผลLocalไม่ใช่หลักฐานManaged Supabase Compatibility ต้องตรวจGrants/Functions/Triggers/RLSผ่านData APIอีกครั้งหลังอนุมัติจริง แต่ละSQLมีTransactionของตัวเอง ไม่มีDestructive Down Script/การResetฐานข้อมูล การApproveต้องผูกTargetProjectและHashชุดนี้

## Auth proposal ที่จะตรวจ/ขออนุมัติหลังProjectพร้อม

- Email/Password + Email Confirmationเปิด ไม่ปิดเพื่อทำให้Testsผ่าน
- SiteURL `http://127.0.0.1:3000`; Callback `/auth/callback`; RecoveryCallbackพร้อม `?next=/reset-password` ตามรูปแบบRedirectที่Dashboardรองรับจริง ไม่เพิ่มPublicDomain
- นโยบายรหัสผ่านขั้นต่ำให้ตรงกับแอป10ตัวอักษร; Session/JWT/RateLimitคงค่าเดิมจนตรวจและรายงานค่าจริง ไม่สมมติว่าเคยตั้งไว้แล้ว
- Built-in SMTP ส่งได้เฉพาะอีเมลสมาชิกOrganization และปัจจุบัน2ข้อความ/ชั่วโมง การสมัครA/BและRecoveryจึงต้องวางแผนQuotaหรือขออนุมัติSMTPที่เหมาะสมแยก ห้ามใช้Fake Email Confirmation หรือส่งอีเมลที่ไม่ได้รับสิทธิ์
- ไม่เปิดGoogle/LINEหรือบริการเสียเงินเอง ServerSecret/HMACอยู่เฉพาะฝั่งServer Keysไม่แสดงในหน้าเว็บหรือเอกสาร

ข้อจำกัดอีเมลตรวจจาก[Supabase SMTP](https://supabase.com/docs/guides/auth/auth-smtp); Free Plan500MB DB/1GB Storage/5GB Egress/2Active ProjectsและInactivity Pauseตรวจจาก[Pricing](https://supabase.com/pricing) วันที่2พ.ย.2026; SingaporeตรวจจากDashboardจริงและ[Regions](https://supabase.com/docs/guides/platform/regions) ค่าQuotaอาจเปลี่ยน ต้องตรวจDashboardอีกครั้งก่อนใช้งานจริง

หลักฐาน: `docs/evidence/cloud-preflight-2026-11-02/local-preflight.json` ตรวจ27เอกสารProduct,5MigrationHashes,Environment Presenceเท่านั้น,Readiness503,Backup61และSourceDrift0 ไฟล์ใหม่ในรอบนี้มีสคริปต์LocalPreflight รายงานนี้ รีวิวสร้างProject และภาพแบบฟอร์ม2ภาพ ไม่มีการแก้Application Source/Dependencies/Env/Database/Git
