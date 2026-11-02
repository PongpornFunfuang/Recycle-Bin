# ข้อเสนอ Test Environment — ยังไม่อนุมัติ Pause/Create

Dashboard ยืนยัน Free active-project limit เต็ม 2 โครงการ ไม่อัปเกรดหรือเสียเงิน

## Project เก่าที่ตรวจแบบ Read-only ตามคำสั่ง

- ชื่อ: Recycle Bin
- ID: sgohryjpxzrjsjpivknf
- Region จากรายการ Organization: ap-northeast-2
- จำนวนจริง: waste_items 12, profiles 0, user_events 0, auth.users 0, Storage buckets 0, Storage objects 0
- มี 3 public tables และเปิด RLS อยู่
- ไม่ใช่ Project หลัก fdmohzvuxvsrcaddbjvl
- ไม่ถือว่าไม่มีแอปภายนอกเชื่อมอยู่จากจำนวนข้อมูลเพียงอย่างเดียว เจ้าของต้องยืนยันก่อน Pause

ข้อเสนอ: พักเฉพาะ Project เก่านี้เพื่อคืน Free slot โดยไม่ลบข้อมูล การเชื่อมต่อ Project เก่าจะใช้งานไม่ได้ระหว่างพัก ห้าม Pause Project หลัก ห้ามลบ ห้ามอัปเกรด

## Test Project ที่เสนอ

- Organization: PongpornFunfuang-2005
- Name: recycle-bin-test
- Free เท่านั้น; Region Singapore / ap-southeast-1; Postgres DEFAULT
- Enable Data API: เปิด; Automatically expose new tables: ปิด
- ไม่มี Public Deployment ไม่มี SMTP Provider/อีเมลจริง ไม่มีค่าใช้จ่าย
- เจ้าของต้องตั้ง Database Password และกดส่งฟอร์มเองใน Dashboard ไม่ส่ง Password/Key ในแชต
- หลังสร้างต้องเสนอ/ยืนยันขอบเขต Test Project ID จริงก่อนเชื่อม API, รัน Schema และสร้างข้อมูลทดสอบ
- ทดสอบ Storage/SQL/RLS/Auth/CRUD/E2E ในโครงการนี้เท่านั้น โดยแยก URL/Keys/Local process ออกจาก Production
- ไม่ย้ายข้อมูล Production มาใช้เป็น Fixture; Test users/pins/scores ต้องอยู่ใน Test Project และ Cleanup ตามแผน

ไฟล์ SQL 0007c_server_evidence.sql เป็น Candidate ใหม่หลัง 0007b เพื่อบังคับ Server-only Upload, decoded-byte hash attestation และ recovery tombstones ยังไม่ Apply บน Hosted ใด

หลักฐาน: docs/evidence/pin-release-2026-11-02/old-project-exact-counts.json และ old-project-review.jpg
