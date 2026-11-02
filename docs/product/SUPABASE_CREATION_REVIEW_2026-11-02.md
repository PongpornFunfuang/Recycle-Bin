# Supabase Project Creation Review — 2 พฤศจิกายน 2026

**AWAITING EXPLICIT PROJECT-CREATION APPROVAL / NO PROJECT CREATED / NO CLOUD SQL / NO DEPLOY**

ตรวจ Dashboard ผ่าน Browser ที่ลงชื่อเข้าใช้อยู่ได้จริง ไม่มี Supabase connector โดยตรง แบบฟอร์มอยู่ที่ `https://supabase.com/dashboard/new/eglhhcovwcnnceprvlfx` ยังไม่กด Create new project

| รายการขออนุมัติ | ค่าที่เตรียม/ตรวจจาก Dashboard |
|---|---|
| Project name | `recycle-bin` — Projectใหม่ |
| Organization | `PongpornFunfuang-2005` |
| Organization reference | `eglhhcovwcnnceprvlfx` |
| Plan | Free — ไม่สมัครบริการเสียเงิน |
| Region | Southeast Asia (Singapore), `ap-southeast-1` — มีให้เลือกจริง |
| Postgres type | Postgres DEFAULT, ไม่เลือก OrioleDB Beta |
| Enable Data API | เปิด เพื่อให้ supabase-js/Business API ใช้งาน |
| Automatically expose new tables | ปิด เพื่อกำหนด Grantsเองใน Migration |
| Enable automatic RLS | คงค่าปิดในแบบฟอร์ม; MigrationเปิดRLSทุกตารางเองและทดสอบแล้ว |
| GitHub integration | ไม่เชื่อม |
| Database password | ช่องรหัสผ่านถูกปิดบัง ไม่อ่าน/คัดลอก/แสดงค่าจริงในรอบเตรียมนี้ |

พบ Projectเดิมใน Organization 3รายการ รวม `Recycle Bin` ที่ `ap-northeast-2` (Seoul), Reference `sgohryjpxzrjsjpivknf` ไม่ได้เปิดแก้หรือเชื่อมกับ Local และจะไม่ใช้เป็นเป้าหมาย Migrationโดยอัตโนมัติ ชื่อProjectเดิมไม่ใช่หลักฐานว่าฐานข้อมูลว่าง

ภาพแบบฟอร์มที่ยังไม่ส่ง: `docs/evidence/cloud-preflight-2026-11-02/project-name-organization.jpg` และ `project-creation-review.jpg` มีเพียงรหัสผ่านที่ปิดบังอยู่ ไม่มีค่าจริง

การอนุมัติรอบนี้เฉพาะสร้างProjectตามตาราง ไม่ครอบคลุมSQL/Auth Settings/First Admin/การแก้Projectเดิม/บริการเสียเงิน/Deploy เมื่อสร้างสำเร็จจะตรวจProject Reference/Region/ข้อมูลเดิม แล้วจัดชุดขออนุมัติSQLที่ระบุTargetและHashแยกต่างหากตามPhase3

หากติดFree quotaหรือมีคำขออัปเกรด จะหยุด ไม่พัก/ลบProjectอื่นหรือเปลี่ยนPlanเอง หน้า[Pricing](https://supabase.com/pricing)ระบุFreeจำกัด2 Active Projects จึงยังไม่รับรองว่าจะสร้างได้จากจำนวนProjectทั้งหมดเพียงอย่างเดียว

เหตุผลที่ขออนุมัติ: คำสั่งผู้ใช้ฉบับ6d6cc291 Phase2ข้อ5ระบุให้ขออนุมัติ Project Name, Organization, Region, Plan และการสร้างProjectก่อนดำเนินการ
