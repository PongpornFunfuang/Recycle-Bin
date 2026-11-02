# ขอบเขตทดสอบ Cloud แยก — recycle-bin-test

Test Project: yyprbgvhmncddlyeduyr / Free / Singapore

Production fdmohzvuxvsrcaddbjvl ไม่อยู่ในขอบเขตการเขียนของขั้นตอนนี้

1. Preflight แบบ SELECT ตรวจว่า Test Project เป็นฐานข้อมูลแอปว่าง และ Auth/Storage ไม่มีข้อมูลจริง
2. ลง Schema 0001–0005 เฉพาะ Test Project ใหม่ ไม่ใช่การรันซ้ำ Production ตามด้วย 0006 → 0007a → 0007 → 0007b → 0007c → 0008
3. SQL เริ่มต้น: docs/evidence/pin-release-2026-11-02/test-release.sql, SHA-256 27c69db13902f3efba752e6f171c9ad8ac5d37d0271880944e76fda5db1e0366; hashรายไฟล์อยู่ใน test-release-hashes.json
4. หากพบปัญหา Compatibility ให้แก้แบบไม่ทำลายข้อมูล ทดสอบใหม่ใน Project นี้ และเก็บ Hash/Log ใหม่ ไม่ส่ง SQL ที่ยังไม่ผ่านไป Production
5. อ่าน/ใช้ Publishable และ Secret Key ของ Test Project ผ่านช่องทาง Local ที่ไม่แสดงในแชต เก็บใน .local/secrets เท่านั้น ถ้าไม่มี Key ที่ใช้งานได้ให้หยุดก่อนสร้าง Key เพิ่ม
6. สร้างบัญชี Auth สังเคราะห์ 3 บัญชีใน Test Project สำหรับ Admin A/Admin C/Member B โดยไม่ส่งอีเมลและไม่ใช้บัญชี Gmail จริง ให้สิทธิ์ Admin เฉพาะ Test เท่านั้น ไม่มีสิทธิ์ Production
7. เพิ่มข้อมูล Fixture ที่ระบุ TEST ชัดเจนใน Test Project เพื่อทดสอบ Storage จริง, Owner Isolation, RLS, Pending/Verify/Student Map, Quiz, History, Feedback และ General Disposal
8. ใช้ Local Web process แยก Port/Build directory/Environment ไม่เขียนทับ Production .env.local ไม่เปิดเว็บไซต์สู่ Public Internet
9. Cleanup เฉพาะข้อมูล/ไฟล์สังเคราะห์ที่สร้างใน Test โดยตรวจ Project ID และ Fixture IDs ก่อนทุกครั้ง ไม่ Reset Project และไม่ลบ Backup
10. ไม่เปลี่ยน SMTP ไม่ส่งอีเมล ไม่ซื้อบริการ ไม่ Deploy ไม่สร้าง First Admin ซ้ำใน Production

การ Apply Production จะทำได้เฉพาะหลัง Security/Real Storage/E2E ผ่าน มี Backup/Recovery และขอบเขตที่อนุมัติรองรับ โดยตรวจ Hash/Schema ใหม่ก่อนเสมอ

บน Windows ห้ามส่งชื่อสีภาษาไทยเป็น literal ผ่าน PowerShell pipeline เข้า Node.js เพราะอาจถูกแปลงเป็น `?` และทำให้ RPC ตอบ `invalid_bin`; ใช้ Unicode escapes ใน diagnostic scripts หรือทดสอบผ่าน Next API ซึ่งส่ง JSON UTF-8. นี่เป็นข้อจำกัดของ test harness ไม่ใช่เหตุผลให้แก้หรือ apply SQL migration.
