# RECYCLE BIN — Full System Audit

ตรวจรอบวันที่ 2 พฤศจิกายน 2026 · สรุปเมื่อ 2026-11-02T21:10:31.972212+07:00 · Project `fdmohzvuxvsrcaddbjvl` เท่านั้น

## A. EXECUTIVE SUMMARY

**Production Ready: NO.** ระบบอ่านข้อมูล ค้นหา บทความ แบบฝึกหัด AI ภาพจริง และ Auth บัญชีเจ้าของทำงานในขอบเขตที่ทดสอบ แต่ Admin Pin Save และ Storage จริงยังไม่พร้อม ไม่ได้ทดสอบครบทุก mutation ทุก role บน Hosted และไม่อ้างว่าเสร็จ100%.

P0 ที่ยังเปิดอยู่ 2 กลุ่ม: (1) Hosted ไม่มี pin schema/RPC/bucket ทำให้ Save ใช้งานไม่ได้ (2) Candidate evidence trust path ยังไม่ผ่าน security release gate: API decode แล้วแต่ direct Storage upload อาจข้ามการตรวจ และยังไม่มีการทดสอบ Storage จริง/Recovery ครบ. เป็นความเสี่ยงของ Candidate ที่ยังไม่ได้ Apply ไม่ใช่ข้อพิสูจน์ว่า Anonymous โจมตี Hosted สำเร็จ.

ผลล่าสุด: Node **75 tests PASS**, Python **7 tests PASS**, Component Regression **5 cases PASS**, Typecheck/Build PASS, dependency advisory audit0, secret/backup scan PASS. แบบฝึกหัด3/3ไม่บันทึกบัญชี; Hosted Quiz โหลด4ข้อแต่ไม่ได้สร้าง test attempt. ค้นพบ 79 source files ใน inventory, เปิด20 public/member entry URLs,19 Admin URLs รวมหน้าเดิมที่ซ่อน,28 detail URLs และอ่านประวัติเดิม1รายการ. การเปิดหน้าไม่เท่ากับผ่านการบันทึกหรือทุกปุ่ม.

Matrix: {'PASS': 173, 'BLOCKED': 45, 'NOT TESTED': 10, 'FAIL': 1}. ตัวเลขนี้นับ test cases ไม่ใช่เปอร์เซ็นต์ความพร้อมของเว็บไซต์. ไม่มีการ Apply Migration/แก้ Hosted schema/Storage policy/Seed/SMTP/ส่งอีเมล/สร้าง First Admin/Deploy/Commit/Push. ไม่มีหมุด ประวัติสแกน คะแนน หรือข้อความทดสอบสำเร็จถูกเพิ่มใน Production. SQL Editor อาจบันทึก query draft ตามพฤติกรรม Dashboard แต่คำสั่งทั้งหมดเป็น SELECT.

## B. FEATURE INVENTORY & TEST MATRIX

หลักฐานทั้งหมดอยู่ใน `docs/evidence/full-audit-2026-11-02/`. `source-inventory.json` แจกแจงทุกไฟล์/routes/API methods/forms/buttons/disabled expressions/SQL objects/test suites. Inventory เป็นหลักฐานการค้นพบ ไม่ใช่ PASS ด้านพฤติกรรม. `browser-admin-pages.json` เก็บชื่อปุ่มที่พบ; ปุ่มแก้ข้อมูลไม่ถูกนับ PASS จากการเห็นบนหน้า.

สถานะระบบที่พบ: ใช้งานจริงในขอบเขตที่รัน=public reads/Auth/AI/แบบฝึกหัด; ปิด/ยังไม่เสร็จ=Hosted pin save/private Storage; ซ้ำซ้อน=หน้าเดิม `/admin/bins`, `/admin/reviews` ถูกซ่อนแต่ยังทดสอบการเปิด; Legacy/ไม่ใช่เส้นทาง active=ONNX detector/model files, `location-details-admin` ที่ import แต่ไม่ได้ render ใน AdminManager; สถานะการมีผู้ใช้งานจริงของ componentอื่นไม่ได้วัดจาก analytics. Static guide/practice quiz/DEMO preview ถูกแยกจากข้อมูลจริง ไม่ใช่ Mock AI. Google/LINE ยังปิด; ไม่มี Settings Admin แยกจาก routesที่พบ; ช่องอาคารเป็นข้อความในจุดติดตั้ง ไม่ใช่ building master table. ฟอร์ม Admin ทั่วไปยังไม่มี Search/Sort/Pagination UI และ queryมี limit100; ไม่อ้างว่าทดสอบ controls ที่ไม่มี.

| ID | หน้า/ระบบ | ฟังก์ชัน | Environment | Status | หลักฐาน | สาเหตุถ้าไม่ผ่าน | วิธีแก้ |
|---|---|---|---|---|---|---|---|
| QA-001 | / | เปิด URL และตรวจหัวหน้า ไม่ใช่ผลยืนยันทุกปุ่ม | Browser + Local Next | PASS | browser-pages.json | — | — |
| QA-002 | /guide | เปิด URL และตรวจหัวหน้า ไม่ใช่ผลยืนยันทุกปุ่ม | Browser + Local Next | PASS | browser-pages.json | — | — |
| QA-003 | /categories | เปิด URL และตรวจหัวหน้า ไม่ใช่ผลยืนยันทุกปุ่ม | Browser + Local Next | PASS | browser-pages.json | — | — |
| QA-004 | /scanner | เปิด URL และตรวจหัวหน้า ไม่ใช่ผลยืนยันทุกปุ่ม | Browser + Local Next | PASS | browser-pages.json | — | — |
| QA-005 | /quiz | เปิด URL และตรวจหัวหน้า ไม่ใช่ผลยืนยันทุกปุ่ม | Browser + Local Next | PASS | browser-pages.json | — | — |
| QA-006 | /about | เปิด URL และตรวจหัวหน้า ไม่ใช่ผลยืนยันทุกปุ่ม | Browser + Local Next | PASS | browser-pages.json | — | — |
| QA-007 | /knowledge | เปิด URL และตรวจหัวหน้า ไม่ใช่ผลยืนยันทุกปุ่ม | Browser + Local Next | PASS | browser-pages.json | — | — |
| QA-008 | /locations | เปิด URL และตรวจหัวหน้า ไม่ใช่ผลยืนยันทุกปุ่ม | Browser + Local Next | PASS | browser-pages.json | — | — |
| QA-009 | /login | เปิด URL และตรวจหัวหน้า ไม่ใช่ผลยืนยันทุกปุ่ม | Browser + Local Next | PASS | browser-pages.json | — | — |
| QA-010 | /register | เปิด URL และตรวจหัวหน้า ไม่ใช่ผลยืนยันทุกปุ่ม | Browser + Local Next | PASS | browser-pages.json | — | — |
| QA-011 | /forgot-password | เปิด URL และตรวจหัวหน้า ไม่ใช่ผลยืนยันทุกปุ่ม | Browser + Local Next | PASS | browser-pages.json | — | — |
| QA-012 | /reset-password | เปิด URL และตรวจหัวหน้า ไม่ใช่ผลยืนยันทุกปุ่ม | Browser + Local Next | PASS | browser-pages.json | — | — |
| QA-013 | /profile | เปิด URL และตรวจหัวหน้า ไม่ใช่ผลยืนยันทุกปุ่ม | Browser + Local Next | PASS | browser-pages.json | — | — |
| QA-014 | /settings | เปิด URL และตรวจหัวหน้า ไม่ใช่ผลยืนยันทุกปุ่ม | Browser + Local Next | PASS | browser-pages.json | — | — |
| QA-015 | /history | เปิด URL และตรวจหัวหน้า ไม่ใช่ผลยืนยันทุกปุ่ม | Browser + Local Next | PASS | browser-pages.json | — | — |
| QA-016 | /disposals | เปิด URL และตรวจหัวหน้า ไม่ใช่ผลยืนยันทุกปุ่ม | Browser + Local Next | PASS | browser-pages.json | — | — |
| QA-017 | /dashboard | เปิด URL และตรวจหัวหน้า ไม่ใช่ผลยืนยันทุกปุ่ม | Browser + Local Next | PASS | browser-pages.json | — | — |
| QA-018 | /feedback | เปิด URL และตรวจหัวหน้า ไม่ใช่ผลยืนยันทุกปุ่ม | Browser + Local Next | PASS | browser-pages.json | — | — |
| QA-019 | /contact | เปิด URL และตรวจหัวหน้า ไม่ใช่ผลยืนยันทุกปุ่ม | Browser + Local Next | PASS | browser-pages.json | — | — |
| QA-020 | /learning | เปิด URL และตรวจหัวหน้า ไม่ใช่ผลยืนยันทุกปุ่ม | Browser + Local Next | PASS | browser-pages.json | — | — |
| QA-021 | /admin/overview | โหลดหน้า Admin และข้อมูลที่อ่านได้ ไม่รวมการบันทึก | Browser + Hosted read | PASS | browser-admin-pages.json | — | — |
| QA-022 | /admin/areas | โหลดหน้า Admin และข้อมูลที่อ่านได้ ไม่รวมการบันทึก | Browser + Hosted read | PASS | browser-admin-pages.json | — | — |
| QA-023 | /admin/areas | บันทึก — การเปลี่ยนข้อมูลสำเร็จและคงอยู่หลัง Reload | Hosted / Browser | BLOCKED | browser-admin-pages.json; B03 | ไม่มี Hosted/Test Environment แยกสำหรับข้อมูลและสิทธิ์ทดสอบ; ไม่ใช้ข้อมูลจริงทดสอบ CRUD | เตรียม B03 แล้วทดสอบและ Cleanup |
| QA-024 | /admin/areas | เก็บรายการ — การเปลี่ยนข้อมูลสำเร็จและคงอยู่หลัง Reload | Hosted / Browser | BLOCKED | browser-admin-pages.json; B03 | ไม่มี Hosted/Test Environment แยกสำหรับข้อมูลและสิทธิ์ทดสอบ; ไม่ใช้ข้อมูลจริงทดสอบ CRUD | เตรียม B03 แล้วทดสอบและ Cleanup |
| QA-025 | /admin/areas | แก้ไข — การเปลี่ยนข้อมูลสำเร็จและคงอยู่หลัง Reload | Hosted / Browser | BLOCKED | browser-admin-pages.json; B03 | ไม่มี Hosted/Test Environment แยกสำหรับข้อมูลและสิทธิ์ทดสอบ; ไม่ใช้ข้อมูลจริงทดสอบ CRUD | เตรียม B03 แล้วทดสอบและ Cleanup |
| QA-026 | /admin/locations | โหลดหน้า Admin และข้อมูลที่อ่านได้ ไม่รวมการบันทึก | Browser + Hosted read | BLOCKED | browser-admin-pages.json | B01: Backend ไม่มี RPC/Schema ใหม่ | แก้ B01/B02 ก่อน Save |
| QA-027 | /admin/locations | บันทึก Pending Verification — การเปลี่ยนข้อมูลสำเร็จและคงอยู่หลัง Reload | Hosted / Browser | BLOCKED | browser-admin-pages.json; B03 | ไม่มี Hosted/Test Environment แยกสำหรับข้อมูลและสิทธิ์ทดสอบ; ไม่ใช้ข้อมูลจริงทดสอบ CRUD | เตรียม B03 แล้วทดสอบและ Cleanup |
| QA-028 | /admin/bins | โหลดหน้า Admin และข้อมูลที่อ่านได้ ไม่รวมการบันทึก | Browser + Hosted read | PASS | browser-admin-pages.json | — | — |
| QA-029 | /admin/bins | บันทึก — การเปลี่ยนข้อมูลสำเร็จและคงอยู่หลัง Reload | Hosted / Browser | BLOCKED | browser-admin-pages.json; B03 | ไม่มี Hosted/Test Environment แยกสำหรับข้อมูลและสิทธิ์ทดสอบ; ไม่ใช้ข้อมูลจริงทดสอบ CRUD | เตรียม B03 แล้วทดสอบและ Cleanup |
| QA-030 | /admin/bin-types | โหลดหน้า Admin และข้อมูลที่อ่านได้ ไม่รวมการบันทึก | Browser + Hosted read | PASS | browser-admin-pages.json | — | — |
| QA-031 | /admin/bin-types | บันทึก — การเปลี่ยนข้อมูลสำเร็จและคงอยู่หลัง Reload | Hosted / Browser | BLOCKED | browser-admin-pages.json; B03 | ไม่มี Hosted/Test Environment แยกสำหรับข้อมูลและสิทธิ์ทดสอบ; ไม่ใช้ข้อมูลจริงทดสอบ CRUD | เตรียม B03 แล้วทดสอบและ Cleanup |
| QA-032 | /admin/bin-types | เก็บรายการ — การเปลี่ยนข้อมูลสำเร็จและคงอยู่หลัง Reload | Hosted / Browser | BLOCKED | browser-admin-pages.json; B03 | ไม่มี Hosted/Test Environment แยกสำหรับข้อมูลและสิทธิ์ทดสอบ; ไม่ใช้ข้อมูลจริงทดสอบ CRUD | เตรียม B03 แล้วทดสอบและ Cleanup |
| QA-033 | /admin/bin-types | แก้ไข — การเปลี่ยนข้อมูลสำเร็จและคงอยู่หลัง Reload | Hosted / Browser | BLOCKED | browser-admin-pages.json; B03 | ไม่มี Hosted/Test Environment แยกสำหรับข้อมูลและสิทธิ์ทดสอบ; ไม่ใช้ข้อมูลจริงทดสอบ CRUD | เตรียม B03 แล้วทดสอบและ Cleanup |
| QA-034 | /admin/reviews | โหลดหน้า Admin และข้อมูลที่อ่านได้ ไม่รวมการบันทึก | Browser + Hosted read | PASS | browser-admin-pages.json | — | — |
| QA-035 | /admin/reviews | บันทึก — การเปลี่ยนข้อมูลสำเร็จและคงอยู่หลัง Reload | Hosted / Browser | BLOCKED | browser-admin-pages.json; B03 | ไม่มี Hosted/Test Environment แยกสำหรับข้อมูลและสิทธิ์ทดสอบ; ไม่ใช้ข้อมูลจริงทดสอบ CRUD | เตรียม B03 แล้วทดสอบและ Cleanup |
| QA-036 | /admin/reviews | เก็บรายการ — การเปลี่ยนข้อมูลสำเร็จและคงอยู่หลัง Reload | Hosted / Browser | BLOCKED | browser-admin-pages.json; B03 | ไม่มี Hosted/Test Environment แยกสำหรับข้อมูลและสิทธิ์ทดสอบ; ไม่ใช้ข้อมูลจริงทดสอบ CRUD | เตรียม B03 แล้วทดสอบและ Cleanup |
| QA-037 | /admin/reviews | แก้ไข — การเปลี่ยนข้อมูลสำเร็จและคงอยู่หลัง Reload | Hosted / Browser | BLOCKED | browser-admin-pages.json; B03 | ไม่มี Hosted/Test Environment แยกสำหรับข้อมูลและสิทธิ์ทดสอบ; ไม่ใช้ข้อมูลจริงทดสอบ CRUD | เตรียม B03 แล้วทดสอบและ Cleanup |
| QA-038 | /admin/catalog | โหลดหน้า Admin และข้อมูลที่อ่านได้ ไม่รวมการบันทึก | Browser + Hosted read | PASS | browser-admin-pages.json | — | — |
| QA-039 | /admin/catalog | บันทึก — การเปลี่ยนข้อมูลสำเร็จและคงอยู่หลัง Reload | Hosted / Browser | BLOCKED | browser-admin-pages.json; B03 | ไม่มี Hosted/Test Environment แยกสำหรับข้อมูลและสิทธิ์ทดสอบ; ไม่ใช้ข้อมูลจริงทดสอบ CRUD | เตรียม B03 แล้วทดสอบและ Cleanup |
| QA-040 | /admin/catalog | เก็บรายการ — การเปลี่ยนข้อมูลสำเร็จและคงอยู่หลัง Reload | Hosted / Browser | BLOCKED | browser-admin-pages.json; B03 | ไม่มี Hosted/Test Environment แยกสำหรับข้อมูลและสิทธิ์ทดสอบ; ไม่ใช้ข้อมูลจริงทดสอบ CRUD | เตรียม B03 แล้วทดสอบและ Cleanup |
| QA-041 | /admin/catalog | แก้ไข — การเปลี่ยนข้อมูลสำเร็จและคงอยู่หลัง Reload | Hosted / Browser | BLOCKED | browser-admin-pages.json; B03 | ไม่มี Hosted/Test Environment แยกสำหรับข้อมูลและสิทธิ์ทดสอบ; ไม่ใช้ข้อมูลจริงทดสอบ CRUD | เตรียม B03 แล้วทดสอบและ Cleanup |
| QA-042 | /admin/materials | โหลดหน้า Admin และข้อมูลที่อ่านได้ ไม่รวมการบันทึก | Browser + Hosted read | PASS | browser-admin-pages.json | — | — |
| QA-043 | /admin/materials | บันทึก — การเปลี่ยนข้อมูลสำเร็จและคงอยู่หลัง Reload | Hosted / Browser | BLOCKED | browser-admin-pages.json; B03 | ไม่มี Hosted/Test Environment แยกสำหรับข้อมูลและสิทธิ์ทดสอบ; ไม่ใช้ข้อมูลจริงทดสอบ CRUD | เตรียม B03 แล้วทดสอบและ Cleanup |
| QA-044 | /admin/categories | โหลดหน้า Admin และข้อมูลที่อ่านได้ ไม่รวมการบันทึก | Browser + Hosted read | PASS | browser-admin-pages.json | — | — |
| QA-045 | /admin/categories | บันทึก — การเปลี่ยนข้อมูลสำเร็จและคงอยู่หลัง Reload | Hosted / Browser | BLOCKED | browser-admin-pages.json; B03 | ไม่มี Hosted/Test Environment แยกสำหรับข้อมูลและสิทธิ์ทดสอบ; ไม่ใช้ข้อมูลจริงทดสอบ CRUD | เตรียม B03 แล้วทดสอบและ Cleanup |
| QA-046 | /admin/categories | เก็บรายการ — การเปลี่ยนข้อมูลสำเร็จและคงอยู่หลัง Reload | Hosted / Browser | BLOCKED | browser-admin-pages.json; B03 | ไม่มี Hosted/Test Environment แยกสำหรับข้อมูลและสิทธิ์ทดสอบ; ไม่ใช้ข้อมูลจริงทดสอบ CRUD | เตรียม B03 แล้วทดสอบและ Cleanup |
| QA-047 | /admin/categories | แก้ไข — การเปลี่ยนข้อมูลสำเร็จและคงอยู่หลัง Reload | Hosted / Browser | BLOCKED | browser-admin-pages.json; B03 | ไม่มี Hosted/Test Environment แยกสำหรับข้อมูลและสิทธิ์ทดสอบ; ไม่ใช้ข้อมูลจริงทดสอบ CRUD | เตรียม B03 แล้วทดสอบและ Cleanup |
| QA-048 | /admin/rules | โหลดหน้า Admin และข้อมูลที่อ่านได้ ไม่รวมการบันทึก | Browser + Hosted read | PASS | browser-admin-pages.json | — | — |
| QA-049 | /admin/rules | บันทึก — การเปลี่ยนข้อมูลสำเร็จและคงอยู่หลัง Reload | Hosted / Browser | BLOCKED | browser-admin-pages.json; B03 | ไม่มี Hosted/Test Environment แยกสำหรับข้อมูลและสิทธิ์ทดสอบ; ไม่ใช้ข้อมูลจริงทดสอบ CRUD | เตรียม B03 แล้วทดสอบและ Cleanup |
| QA-050 | /admin/sources | โหลดหน้า Admin และข้อมูลที่อ่านได้ ไม่รวมการบันทึก | Browser + Hosted read | PASS | browser-admin-pages.json | — | — |
| QA-051 | /admin/sources | บันทึก — การเปลี่ยนข้อมูลสำเร็จและคงอยู่หลัง Reload | Hosted / Browser | BLOCKED | browser-admin-pages.json; B03 | ไม่มี Hosted/Test Environment แยกสำหรับข้อมูลและสิทธิ์ทดสอบ; ไม่ใช้ข้อมูลจริงทดสอบ CRUD | เตรียม B03 แล้วทดสอบและ Cleanup |
| QA-052 | /admin/sources | เก็บรายการ — การเปลี่ยนข้อมูลสำเร็จและคงอยู่หลัง Reload | Hosted / Browser | BLOCKED | browser-admin-pages.json; B03 | ไม่มี Hosted/Test Environment แยกสำหรับข้อมูลและสิทธิ์ทดสอบ; ไม่ใช้ข้อมูลจริงทดสอบ CRUD | เตรียม B03 แล้วทดสอบและ Cleanup |
| QA-053 | /admin/sources | แก้ไข — การเปลี่ยนข้อมูลสำเร็จและคงอยู่หลัง Reload | Hosted / Browser | BLOCKED | browser-admin-pages.json; B03 | ไม่มี Hosted/Test Environment แยกสำหรับข้อมูลและสิทธิ์ทดสอบ; ไม่ใช้ข้อมูลจริงทดสอบ CRUD | เตรียม B03 แล้วทดสอบและ Cleanup |
| QA-054 | /admin/knowledge | โหลดหน้า Admin และข้อมูลที่อ่านได้ ไม่รวมการบันทึก | Browser + Hosted read | PASS | browser-admin-pages.json | — | — |
| QA-055 | /admin/knowledge | บันทึก — การเปลี่ยนข้อมูลสำเร็จและคงอยู่หลัง Reload | Hosted / Browser | BLOCKED | browser-admin-pages.json; B03 | ไม่มี Hosted/Test Environment แยกสำหรับข้อมูลและสิทธิ์ทดสอบ; ไม่ใช้ข้อมูลจริงทดสอบ CRUD | เตรียม B03 แล้วทดสอบและ Cleanup |
| QA-056 | /admin/knowledge | เก็บรายการ — การเปลี่ยนข้อมูลสำเร็จและคงอยู่หลัง Reload | Hosted / Browser | BLOCKED | browser-admin-pages.json; B03 | ไม่มี Hosted/Test Environment แยกสำหรับข้อมูลและสิทธิ์ทดสอบ; ไม่ใช้ข้อมูลจริงทดสอบ CRUD | เตรียม B03 แล้วทดสอบและ Cleanup |
| QA-057 | /admin/knowledge | แก้ไข — การเปลี่ยนข้อมูลสำเร็จและคงอยู่หลัง Reload | Hosted / Browser | BLOCKED | browser-admin-pages.json; B03 | ไม่มี Hosted/Test Environment แยกสำหรับข้อมูลและสิทธิ์ทดสอบ; ไม่ใช้ข้อมูลจริงทดสอบ CRUD | เตรียม B03 แล้วทดสอบและ Cleanup |
| QA-058 | /admin/quiz | โหลดหน้า Admin และข้อมูลที่อ่านได้ ไม่รวมการบันทึก | Browser + Hosted read | PASS | browser-admin-pages.json | — | — |
| QA-059 | /admin/quiz | บันทึก — การเปลี่ยนข้อมูลสำเร็จและคงอยู่หลัง Reload | Hosted / Browser | BLOCKED | browser-admin-pages.json; B03 | ไม่มี Hosted/Test Environment แยกสำหรับข้อมูลและสิทธิ์ทดสอบ; ไม่ใช้ข้อมูลจริงทดสอบ CRUD | เตรียม B03 แล้วทดสอบและ Cleanup |
| QA-060 | /admin/quiz | เก็บรายการ — การเปลี่ยนข้อมูลสำเร็จและคงอยู่หลัง Reload | Hosted / Browser | BLOCKED | browser-admin-pages.json; B03 | ไม่มี Hosted/Test Environment แยกสำหรับข้อมูลและสิทธิ์ทดสอบ; ไม่ใช้ข้อมูลจริงทดสอบ CRUD | เตรียม B03 แล้วทดสอบและ Cleanup |
| QA-061 | /admin/quiz | แก้ไข — การเปลี่ยนข้อมูลสำเร็จและคงอยู่หลัง Reload | Hosted / Browser | BLOCKED | browser-admin-pages.json; B03 | ไม่มี Hosted/Test Environment แยกสำหรับข้อมูลและสิทธิ์ทดสอบ; ไม่ใช้ข้อมูลจริงทดสอบ CRUD | เตรียม B03 แล้วทดสอบและ Cleanup |
| QA-062 | /admin/questions | โหลดหน้า Admin และข้อมูลที่อ่านได้ ไม่รวมการบันทึก | Browser + Hosted read | PASS | browser-admin-pages.json | — | — |
| QA-063 | /admin/questions | บันทึก — การเปลี่ยนข้อมูลสำเร็จและคงอยู่หลัง Reload | Hosted / Browser | BLOCKED | browser-admin-pages.json; B03 | ไม่มี Hosted/Test Environment แยกสำหรับข้อมูลและสิทธิ์ทดสอบ; ไม่ใช้ข้อมูลจริงทดสอบ CRUD | เตรียม B03 แล้วทดสอบและ Cleanup |
| QA-064 | /admin/questions | แก้ไข — การเปลี่ยนข้อมูลสำเร็จและคงอยู่หลัง Reload | Hosted / Browser | BLOCKED | browser-admin-pages.json; B03 | ไม่มี Hosted/Test Environment แยกสำหรับข้อมูลและสิทธิ์ทดสอบ; ไม่ใช้ข้อมูลจริงทดสอบ CRUD | เตรียม B03 แล้วทดสอบและ Cleanup |
| QA-065 | /admin/feedback | โหลดหน้า Admin และข้อมูลที่อ่านได้ ไม่รวมการบันทึก | Browser + Hosted read | PASS | browser-admin-pages.json | — | — |
| QA-066 | /admin/contact | โหลดหน้า Admin และข้อมูลที่อ่านได้ ไม่รวมการบันทึก | Browser + Hosted read | PASS | browser-admin-pages.json | — | — |
| QA-067 | /admin/audit | โหลดหน้า Admin และข้อมูลที่อ่านได้ ไม่รวมการบันทึก | Browser + Hosted read | PASS | browser-admin-pages.json | — | — |
| QA-068 | /admin/users | โหลดหน้า Admin และข้อมูลที่อ่านได้ ไม่รวมการบันทึก | Browser + Hosted read | PASS | browser-admin-pages.json | — | — |
| QA-069 | /admin/users | ถอนสิทธิ์ผู้ดูแล — การเปลี่ยนข้อมูลสำเร็จและคงอยู่หลัง Reload | Hosted / Browser | BLOCKED | browser-admin-pages.json; B03 | ไม่มี Hosted/Test Environment แยกสำหรับข้อมูลและสิทธิ์ทดสอบ; ไม่ใช้ข้อมูลจริงทดสอบ CRUD | เตรียม B03 แล้วทดสอบและ Cleanup |
| QA-070 | /admin/users | ระงับบัญชี — การเปลี่ยนข้อมูลสำเร็จและคงอยู่หลัง Reload | Hosted / Browser | BLOCKED | browser-admin-pages.json; B03 | ไม่มี Hosted/Test Environment แยกสำหรับข้อมูลและสิทธิ์ทดสอบ; ไม่ใช้ข้อมูลจริงทดสอบ CRUD | เตรียม B03 แล้วทดสอบและ Cleanup |
| QA-071 | /admin/relationships | โหลดหน้า Admin และข้อมูลที่อ่านได้ ไม่รวมการบันทึก | Browser + Hosted read | PASS | browser-admin-pages.json | — | — |
| QA-072 | /admin/relationships | บันทึกความสัมพันธ์ — การเปลี่ยนข้อมูลสำเร็จและคงอยู่หลัง Reload | Hosted / Browser | BLOCKED | browser-admin-pages.json; B03 | ไม่มี Hosted/Test Environment แยกสำหรับข้อมูลและสิทธิ์ทดสอบ; ไม่ใช้ข้อมูลจริงทดสอบ CRUD | เตรียม B03 แล้วทดสอบและ Cleanup |
| QA-073 | /guide/pet-bottle | เปิดรายละเอียดตามลิงก์จริง/บทความที่เผยแพร่ | Browser + Hosted/public content | PASS | browser-detail-pages.json | — | — |
| QA-074 | /guide/aluminium-can | เปิดรายละเอียดตามลิงก์จริง/บทความที่เผยแพร่ | Browser + Hosted/public content | PASS | browser-detail-pages.json | — | — |
| QA-075 | /guide/clean-paper | เปิดรายละเอียดตามลิงก์จริง/บทความที่เผยแพร่ | Browser + Hosted/public content | PASS | browser-detail-pages.json | — | — |
| QA-076 | /guide/cardboard | เปิดรายละเอียดตามลิงก์จริง/บทความที่เผยแพร่ | Browser + Hosted/public content | PASS | browser-detail-pages.json | — | — |
| QA-077 | /guide/glass-bottle | เปิดรายละเอียดตามลิงก์จริง/บทความที่เผยแพร่ | Browser + Hosted/public content | PASS | browser-detail-pages.json | — | — |
| QA-078 | /guide/food-scraps | เปิดรายละเอียดตามลิงก์จริง/บทความที่เผยแพร่ | Browser + Hosted/public content | PASS | browser-detail-pages.json | — | — |
| QA-079 | /guide/fruit-peels | เปิดรายละเอียดตามลิงก์จริง/บทความที่เผยแพร่ | Browser + Hosted/public content | PASS | browser-detail-pages.json | — | — |
| QA-080 | /guide/leaves | เปิดรายละเอียดตามลิงก์จริง/บทความที่เผยแพร่ | Browser + Hosted/public content | PASS | browser-detail-pages.json | — | — |
| QA-081 | /guide/dirty-wrapper | เปิดรายละเอียดตามลิงก์จริง/บทความที่เผยแพร่ | Browser + Hosted/public content | PASS | browser-detail-pages.json | — | — |
| QA-082 | /guide/used-tissue | เปิดรายละเอียดตามลิงก์จริง/บทความที่เผยแพร่ | Browser + Hosted/public content | PASS | browser-detail-pages.json | — | — |
| QA-083 | /guide/used-battery | เปิดรายละเอียดตามลิงก์จริง/บทความที่เผยแพร่ | Browser + Hosted/public content | PASS | browser-detail-pages.json | — | — |
| QA-084 | /guide/used-light-bulb | เปิดรายละเอียดตามลิงก์จริง/บทความที่เผยแพร่ | Browser + Hosted/public content | PASS | browser-detail-pages.json | — | — |
| QA-085 | /guide/bottle | เปิดรายละเอียดตามลิงก์จริง/บทความที่เผยแพร่ | Browser + Hosted/public content | PASS | browser-detail-pages.json | — | — |
| QA-086 | /guide/cup | เปิดรายละเอียดตามลิงก์จริง/บทความที่เผยแพร่ | Browser + Hosted/public content | PASS | browser-detail-pages.json | — | — |
| QA-087 | /guide/bowl | เปิดรายละเอียดตามลิงก์จริง/บทความที่เผยแพร่ | Browser + Hosted/public content | PASS | browser-detail-pages.json | — | — |
| QA-088 | /guide/food | เปิดรายละเอียดตามลิงก์จริง/บทความที่เผยแพร่ | Browser + Hosted/public content | PASS | browser-detail-pages.json | — | — |
| QA-089 | /guide/paper | เปิดรายละเอียดตามลิงก์จริง/บทความที่เผยแพร่ | Browser + Hosted/public content | PASS | browser-detail-pages.json | — | — |
| QA-090 | /guide/battery | เปิดรายละเอียดตามลิงก์จริง/บทความที่เผยแพร่ | Browser + Hosted/public content | PASS | browser-detail-pages.json | — | — |
| QA-091 | /guide/metal | เปิดรายละเอียดตามลิงก์จริง/บทความที่เผยแพร่ | Browser + Hosted/public content | PASS | browser-detail-pages.json | — | — |
| QA-092 | /knowledge/prediction-and-confirmation | เปิดรายละเอียดตามลิงก์จริง/บทความที่เผยแพร่ | Browser + Hosted/public content | PASS | browser-detail-pages.json | — | — |
| QA-093 | /knowledge/check-local-rules | เปิดรายละเอียดตามลิงก์จริง/บทความที่เผยแพร่ | Browser + Hosted/public content | PASS | browser-detail-pages.json | — | — |
| QA-094 | /knowledge/scan-a-clear-picture | เปิดรายละเอียดตามลิงก์จริง/บทความที่เผยแพร่ | Browser + Hosted/public content | PASS | browser-detail-pages.json | — | — |
| QA-095 | /knowledge/general-four-types | เปิดรายละเอียดตามลิงก์จริง/บทความที่เผยแพร่ | Browser + Hosted/public content | PASS | browser-detail-pages.json | — | — |
| QA-096 | /knowledge/general-3rs | เปิดรายละเอียดตามลิงก์จริง/บทความที่เผยแพร่ | Browser + Hosted/public content | PASS | browser-detail-pages.json | — | — |
| QA-097 | /knowledge/prepare-recycling | เปิดรายละเอียดตามลิงก์จริง/บทความที่เผยแพร่ | Browser + Hosted/public content | PASS | browser-detail-pages.json | — | — |
| QA-098 | /knowledge/organic-guide | เปิดรายละเอียดตามลิงก์จริง/บทความที่เผยแพร่ | Browser + Hosted/public content | PASS | browser-detail-pages.json | — | — |
| QA-099 | /knowledge/hazardous-guide | เปิดรายละเอียดตามลิงก์จริง/บทความที่เผยแพร่ | Browser + Hosted/public content | PASS | browser-detail-pages.json | — | — |
| QA-100 | /knowledge/campus-waste-reduction | เปิดรายละเอียดตามลิงก์จริง/บทความที่เผยแพร่ | Browser + Hosted/public content | PASS | browser-detail-pages.json | — | — |
| QA-101 | /profile | อ่านข้อมูลบัญชีปัจจุบัน/สถานะว่าง ไม่แก้ข้อมูล | Browser + Hosted owner | PASS | browser-member-pages.json | — | — |
| QA-102 | /settings | อ่านข้อมูลบัญชีปัจจุบัน/สถานะว่าง ไม่แก้ข้อมูล | Browser + Hosted owner | PASS | browser-member-pages.json | — | — |
| QA-103 | /history | อ่านข้อมูลบัญชีปัจจุบัน/สถานะว่าง ไม่แก้ข้อมูล | Browser + Hosted owner | PASS | browser-member-pages.json | — | — |
| QA-104 | /disposals | อ่านข้อมูลบัญชีปัจจุบัน/สถานะว่าง ไม่แก้ข้อมูล | Browser + Hosted owner | PASS | browser-member-pages.json | — | — |
| QA-105 | /dashboard | อ่านข้อมูลบัญชีปัจจุบัน/สถานะว่าง ไม่แก้ข้อมูล | Browser + Hosted owner | PASS | browser-member-pages.json | — | — |
| QA-106 | /feedback | อ่านข้อมูลบัญชีปัจจุบัน/สถานะว่าง ไม่แก้ข้อมูล | Browser + Hosted owner | PASS | browser-member-pages.json | — | — |
| QA-107 | /contact | อ่านข้อมูลบัญชีปัจจุบัน/สถานะว่าง ไม่แก้ข้อมูล | Browser + Hosted owner | PASS | browser-member-pages.json | — | — |
| QA-108 | /learning | อ่านข้อมูลบัญชีปัจจุบัน/สถานะว่าง ไม่แก้ข้อมูล | Browser + Hosted owner | PASS | browser-member-pages.json | — | — |
| QA-109 | /admin/areas | กดบันทึกฟอร์มว่างแล้วถูก native validation ปฏิเสธ | Browser | PASS | browser-form-validation.json | — | — |
| QA-110 | /admin/bins | กดบันทึกฟอร์มว่างแล้วถูก native validation ปฏิเสธ | Browser | PASS | browser-form-validation.json | — | — |
| QA-111 | /admin/bin-types | กดบันทึกฟอร์มว่างแล้วถูก native validation ปฏิเสธ | Browser | PASS | browser-form-validation.json | — | — |
| QA-112 | /admin/reviews | กดบันทึกฟอร์มว่างแล้วถูก native validation ปฏิเสธ | Browser | PASS | browser-form-validation.json | — | — |
| QA-113 | /admin/catalog | กดบันทึกฟอร์มว่างแล้วถูก native validation ปฏิเสธ | Browser | PASS | browser-form-validation.json | — | — |
| QA-114 | /admin/materials | กดบันทึกฟอร์มว่างแล้วถูก native validation ปฏิเสธ | Browser | PASS | browser-form-validation.json | — | — |
| QA-115 | /admin/categories | กดบันทึกฟอร์มว่างแล้วถูก native validation ปฏิเสธ | Browser | PASS | browser-form-validation.json | — | — |
| QA-116 | /admin/rules | กดบันทึกฟอร์มว่างแล้วถูก native validation ปฏิเสธ | Browser | PASS | browser-form-validation.json | — | — |
| QA-117 | /admin/sources | กดบันทึกฟอร์มว่างแล้วถูก native validation ปฏิเสธ | Browser | PASS | browser-form-validation.json | — | — |
| QA-118 | /admin/knowledge | กดบันทึกฟอร์มว่างแล้วถูก native validation ปฏิเสธ | Browser | PASS | browser-form-validation.json | — | — |
| QA-119 | /admin/quiz | กดบันทึกฟอร์มว่างแล้วถูก native validation ปฏิเสธ | Browser | PASS | browser-form-validation.json | — | — |
| QA-120 | /admin/questions | กดบันทึกฟอร์มว่างแล้วถูก native validation ปฏิเสธ | Browser | PASS | browser-form-validation.json | — | — |
| QA-121 | /api/health/live | GET probe แบบ Anonymous/Invalid body ตามหลักฐาน (ไม่ใช่ Happy-path CRUD) | Local API → Hosted/AI | PASS | anonymous-api-probes.json | — | — |
| QA-122 | /api/health/ready | GET probe แบบ Anonymous/Invalid body ตามหลักฐาน (ไม่ใช่ Happy-path CRUD) | Local API → Hosted/AI | PASS | anonymous-api-probes.json | — | — |
| QA-123 | /api/ai/health | GET probe แบบ Anonymous/Invalid body ตามหลักฐาน (ไม่ใช่ Happy-path CRUD) | Local API → Hosted/AI | PASS | anonymous-api-probes.json | — | — |
| QA-124 | /api/public/catalog | GET probe แบบ Anonymous/Invalid body ตามหลักฐาน (ไม่ใช่ Happy-path CRUD) | Local API → Hosted/AI | PASS | anonymous-api-probes.json | — | — |
| QA-125 | /api/public/categories | GET probe แบบ Anonymous/Invalid body ตามหลักฐาน (ไม่ใช่ Happy-path CRUD) | Local API → Hosted/AI | PASS | anonymous-api-probes.json | — | — |
| QA-126 | /api/public/knowledge | GET probe แบบ Anonymous/Invalid body ตามหลักฐาน (ไม่ใช่ Happy-path CRUD) | Local API → Hosted/AI | PASS | anonymous-api-probes.json | — | — |
| QA-127 | /api/public/locations | GET probe แบบ Anonymous/Invalid body ตามหลักฐาน (ไม่ใช่ Happy-path CRUD) | Local API → Hosted/AI | PASS | anonymous-api-probes.json | — | — |
| QA-128 | /api/public/not-a-section | GET probe แบบ Anonymous/Invalid body ตามหลักฐาน (ไม่ใช่ Happy-path CRUD) | Local API → Hosted/AI | PASS | anonymous-api-probes.json | — | — |
| QA-129 | /api/quizzes | GET probe แบบ Anonymous/Invalid body ตามหลักฐาน (ไม่ใช่ Happy-path CRUD) | Local API → Hosted/AI | PASS | anonymous-api-probes.json | — | — |
| QA-130 | /api/admin | GET probe แบบ Anonymous/Invalid body ตามหลักฐาน (ไม่ใช่ Happy-path CRUD) | Local API → Hosted/AI | PASS | anonymous-api-probes.json | — | — |
| QA-131 | /api/member | GET probe แบบ Anonymous/Invalid body ตามหลักฐาน (ไม่ใช่ Happy-path CRUD) | Local API → Hosted/AI | PASS | anonymous-api-probes.json | — | — |
| QA-132 | /api/recommendations?label=bottle | GET probe แบบ Anonymous/Invalid body ตามหลักฐาน (ไม่ใช่ Happy-path CRUD) | Local API → Hosted/AI | PASS | anonymous-api-probes.json | — | — |
| QA-133 | /api/location-evidence?id=00000000-0000-4000-8000-000000000001 | GET probe แบบ Anonymous/Invalid body ตามหลักฐาน (ไม่ใช่ Happy-path CRUD) | Local API → Hosted/AI | PASS | anonymous-api-probes.json | — | — |
| QA-134 | /api/admin | POST probe แบบ Anonymous/Invalid body ตามหลักฐาน (ไม่ใช่ Happy-path CRUD) | Local API → Hosted/AI | PASS | anonymous-api-probes.json | — | — |
| QA-135 | /api/admin | POST probe แบบ Anonymous/Invalid body ตามหลักฐาน (ไม่ใช่ Happy-path CRUD) | Local API → Hosted/AI | PASS | anonymous-api-probes.json | — | — |
| QA-136 | /api/member | POST probe แบบ Anonymous/Invalid body ตามหลักฐาน (ไม่ใช่ Happy-path CRUD) | Local API → Hosted/AI | PASS | anonymous-api-probes.json | — | — |
| QA-137 | /api/member | POST probe แบบ Anonymous/Invalid body ตามหลักฐาน (ไม่ใช่ Happy-path CRUD) | Local API → Hosted/AI | PASS | anonymous-api-probes.json | — | — |
| QA-138 | /api/scans | POST probe แบบ Anonymous/Invalid body ตามหลักฐาน (ไม่ใช่ Happy-path CRUD) | Local API → Hosted/AI | PASS | anonymous-api-probes.json | — | — |
| QA-139 | /api/scans | POST probe แบบ Anonymous/Invalid body ตามหลักฐาน (ไม่ใช่ Happy-path CRUD) | Local API → Hosted/AI | PASS | anonymous-api-probes.json | — | — |
| QA-140 | /api/disposals | POST probe แบบ Anonymous/Invalid body ตามหลักฐาน (ไม่ใช่ Happy-path CRUD) | Local API → Hosted/AI | PASS | anonymous-api-probes.json | — | — |
| QA-141 | /api/disposals | POST probe แบบ Anonymous/Invalid body ตามหลักฐาน (ไม่ใช่ Happy-path CRUD) | Local API → Hosted/AI | PASS | anonymous-api-probes.json | — | — |
| QA-142 | /api/quiz | POST probe แบบ Anonymous/Invalid body ตามหลักฐาน (ไม่ใช่ Happy-path CRUD) | Local API → Hosted/AI | PASS | anonymous-api-probes.json | — | — |
| QA-143 | /api/quiz | POST probe แบบ Anonymous/Invalid body ตามหลักฐาน (ไม่ใช่ Happy-path CRUD) | Local API → Hosted/AI | PASS | anonymous-api-probes.json | — | — |
| QA-144 | /api/auth | POST probe แบบ Anonymous/Invalid body ตามหลักฐาน (ไม่ใช่ Happy-path CRUD) | Local API → Hosted/AI | PASS | anonymous-api-probes.json | — | — |
| QA-145 | /api/auth | POST probe แบบ Anonymous/Invalid body ตามหลักฐาน (ไม่ใช่ Happy-path CRUD) | Local API → Hosted/AI | PASS | anonymous-api-probes.json | — | — |
| QA-146 | /api/ai/detect | POST probe แบบ Anonymous/Invalid body ตามหลักฐาน (ไม่ใช่ Happy-path CRUD) | Local API → Hosted/AI | PASS | anonymous-api-probes.json | — | — |
| QA-147 | /api/ai/detect | POST probe แบบ Anonymous/Invalid body ตามหลักฐาน (ไม่ใช่ Happy-path CRUD) | Local API → Hosted/AI | PASS | anonymous-api-probes.json | — | — |
| QA-148 | /api/location-evidence | POST probe แบบ Anonymous/Invalid body ตามหลักฐาน (ไม่ใช่ Happy-path CRUD) | Local API → Hosted/AI | PASS | anonymous-api-probes.json | — | — |
| QA-149 | /api/location-evidence | POST probe แบบ Anonymous/Invalid body ตามหลักฐาน (ไม่ใช่ Happy-path CRUD) | Local API → Hosted/AI | PASS | anonymous-api-probes.json | — | — |
| QA-150 | Auth | owner_login | Hosted; ephemeral owner session | PASS | hosted-owner-auth.json | — | — |
| QA-151 | Auth | verified_identity | Hosted; ephemeral owner session | PASS | hosted-owner-auth.json | — | — |
| QA-152 | Auth | owner_admin_role | Hosted; ephemeral owner session | PASS | hosted-owner-auth.json | — | — |
| QA-153 | Auth | refresh_token | Hosted; ephemeral owner session | PASS | hosted-owner-auth.json | — | — |
| QA-154 | Auth | own_profile_read | Hosted; ephemeral owner session | PASS | hosted-owner-auth.json | — | — |
| QA-155 | Auth | ephemeral_session_logout | Hosted; ephemeral owner session | PASS | hosted-owner-auth.json | — | — |
| QA-156 | Auth | รหัสผ่านผิด 1 คำขอถูกปฏิเสธ | Hosted | PASS | hosted-invalid-login.json | — | — |
| QA-157 | RLS/profiles | GET ผ่าน Publishable Key โดยไม่มี user token; ตรวจผลตามตาราง | Hosted | PASS | hosted-anonymous-rls.json | — | — |
| QA-158 | RLS/ai_predictions | GET ผ่าน Publishable Key โดยไม่มี user token; ตรวจผลตามตาราง | Hosted | PASS | hosted-anonymous-rls.json | — | — |
| QA-159 | RLS/confirmed_disposals | GET ผ่าน Publishable Key โดยไม่มี user token; ตรวจผลตามตาราง | Hosted | PASS | hosted-anonymous-rls.json | — | — |
| QA-160 | RLS/feedback | GET ผ่าน Publishable Key โดยไม่มี user token; ตรวจผลตามตาราง | Hosted | PASS | hosted-anonymous-rls.json | — | — |
| QA-161 | RLS/contact_messages | GET ผ่าน Publishable Key โดยไม่มี user token; ตรวจผลตามตาราง | Hosted | PASS | hosted-anonymous-rls.json | — | — |
| QA-162 | RLS/quiz_attempts | GET ผ่าน Publishable Key โดยไม่มี user token; ตรวจผลตามตาราง | Hosted | PASS | hosted-anonymous-rls.json | — | — |
| QA-163 | RLS/user_roles | GET ผ่าน Publishable Key โดยไม่มี user token; ตรวจผลตามตาราง | Hosted | PASS | hosted-anonymous-rls.json | — | — |
| QA-164 | RLS/quiz_answer_keys | GET ผ่าน Publishable Key โดยไม่มี user token; ตรวจผลตามตาราง | Hosted | PASS | hosted-anonymous-rls.json | — | — |
| QA-165 | RLS/quizzes | GET ผ่าน Publishable Key โดยไม่มี user token; ตรวจผลตามตาราง | Hosted | PASS | hosted-anonymous-rls.json | — | — |
| QA-166 | RLS/quiz_questions | GET ผ่าน Publishable Key โดยไม่มี user token; ตรวจผลตามตาราง | Hosted | PASS | hosted-anonymous-rls.json | — | — |
| QA-167 | RLS/locations | GET ผ่าน Publishable Key โดยไม่มี user token; ตรวจผลตามตาราง | Hosted | PASS | hosted-anonymous-rls.json | — | — |
| QA-168 | AI | blank HTTP/quality error path | Local real model | PASS | ai-functional-cases.json | — | — |
| QA-169 | AI | dark HTTP/quality error path | Local real model | PASS | ai-functional-cases.json | — | — |
| QA-170 | AI | blurred HTTP/quality error path | Local real model | PASS | ai-functional-cases.json | — | — |
| QA-171 | AI | corrupt HTTP/quality error path | Local real model | PASS | ai-functional-cases.json | — | — |
| QA-172 | AI | unsupported HTTP/quality error path | Local real model | PASS | ai-functional-cases.json | — | — |
| QA-173 | AI | tiny HTTP/quality error path | Local real model | PASS | ai-functional-cases.json | — | — |
| QA-174 | AI | oversized-dimensions HTTP/quality error path | Local real model | PASS | ai-functional-cases.json | — | — |
| QA-175 | Responsive | 360px: 8 หน้าที่ทดสอบไม่มี horizontal overflow; ตรวจ labels ใน DOM | Browser | PASS | responsive.json | — | — |
| QA-176 | Responsive | 390px: 8 หน้าที่ทดสอบไม่มี horizontal overflow; ตรวจ labels ใน DOM | Browser | PASS | responsive.json | — | — |
| QA-177 | Responsive | 768px: 8 หน้าที่ทดสอบไม่มี horizontal overflow; ตรวจ labels ใน DOM | Browser | PASS | responsive.json | — | — |
| QA-178 | Responsive | 1366px: 8 หน้าที่ทดสอบไม่มี horizontal overflow; ตรวจ labels ใน DOM | Browser | PASS | responsive.json | — | — |
| QA-179 | Responsive | 1920px: 8 หน้าที่ทดสอบไม่มี horizontal overflow; ตรวจ labels ใน DOM | Browser | PASS | responsive.json | — | — |
| QA-180 | Search | ค้นแบตเตอรี่พบ 1; คำไม่มีผลลัพธ์แสดง Empty State | Browser | PASS | browser-smoke.json; ทดสอบ CUA ซ้ำ | — | — |
| QA-181 | Quiz | โหลด Hosted 1 ชุด/4 คำถาม ไม่มีเฉลยใน GET | Hosted + Browser | PASS | browser-quiz.json; hosted-anonymous-rls.json | — | — |
| QA-182 | Quiz | แบบฝึกหัดไม่บันทึกบัญชี ได้ 3/3 และแสดงคำอธิบาย | Browser + Local API | PASS | browser-quiz.json | — | — |
| QA-183 | Quiz | ส่งคะแนน Hosted/Reload/History/Member isolation | Hosted | BLOCKED | B03: attempts จริง 0; ไม่สร้างคะแนนทดสอบใน Production | B03: attempts จริง 0; ไม่สร้างคะแนนทดสอบใน Production | ดู Blocker Register และ Final Action Plan |
| QA-184 | Quiz | แสดง feedback หลังตรวจคะแนนสำเร็จ และไม่แสดงก่อน POST | Isolated component fixture | PASS | component-regressions.json | — | — |
| QA-185 | Admin Map | คลิก/ลากอ่านพิกัด เปลี่ยน SVG สีแดง เพิ่ม 2 ถัง และ Cancel | Browser frontend only | PASS | browser-admin-map.json | — | — |
| QA-186 | Admin Map | Save Pending → Reload → Edit → Verify → Student Map | Hosted | BLOCKED | B01/B02/B03; RPC ไม่มี, Bucket ไม่มี | B01/B02/B03; RPC ไม่มี, Bucket ไม่มี | ดู Blocker Register และ Final Action Plan |
| QA-187 | Admin Map | OLD/NEW junction/category/source/bin invalidation, bypass/member denial, rollback/audit/idempotency | Local PGlite + synthetic auth/storage metadata | PASS | pin-lifecycle.log; pin-lifecycle.test.ts; pin-guards.test.ts | — | — |
| QA-188 | Admin Map | GPS Evidence ที่เชื่อถือได้จากการสำรวจจริง | Browser/Physical | NOT TESTED | B05: คลิกแผนที่ไม่ใช่หลักฐาน GPS; ไม่มีการสำรวจจริงในรอบนี้ | B05: คลิกแผนที่ไม่ใช่หลักฐาน GPS; ไม่มีการสำรวจจริงในรอบนี้ | ดู Blocker Register และ Final Action Plan |
| QA-189 | Student Map | แสดง 0 จุด/0 ถัง Empty State; ไม่มี DEMO | Browser + Hosted | PASS | student-map.json; hosted-counts.json | — | — |
| QA-190 | Student Map | กดหมุด Verified จริงและเปิดนำทาง | Hosted/Physical | BLOCKED | B05: Verified physical locations = 0; ไม่สร้างพิกัดแทน | B05: Verified physical locations = 0; ไม่สร้างพิกัดแทน | ดู Blocker Register และ Final Action Plan |
| QA-191 | Navigation | ยุบ/ขยาย Active, Back/Forward, Escape และคืน focus | Browser | PASS | navigation-retest.json | — | — |
| QA-192 | Navigation | Drawer เปิดบนมือถือแล้ว resize เป็น Desktop ต้องไม่ล็อกหน้า | Browser | PASS | drawer-resize-retest.json | — | — |
| QA-193 | Evidence | Decode JPEG/PNG/WebP; ปฏิเสธ fake/truncated/MIME mismatch/SVG/เกิน16MP | Local decoder tests | PASS | evidence-decode.log | — | — |
| QA-194 | Evidence | Upload/Object existence/Owner isolation/Signed URL/Delete/Cleanup | Local Supabase Storage | BLOCKED | B02/B03: Docker/CLI ไม่มี, WSL status exit50; ไม่ใช่ PGlite Storage | B02/B03: Docker/CLI ไม่มี, WSL status exit50; ไม่ใช่ PGlite Storage | ดู Blocker Register และ Final Action Plan |
| QA-195 | Evidence | Upload/Read/Delete/Owner isolation บน Hosted Storage จริง | Hosted Storage | BLOCKED | B01/B02: buckets=[] และยังไม่ Apply candidates | B01/B02: buckets=[] และยังไม่ Apply candidates | ดู Blocker Register และ Final Action Plan |
| QA-196 | History | อ่านผลเดิมเจ้าของและ Reload แล้วพบ 35 detections | Browser + Hosted read | PASS | existing-history-read.json | — | — |
| QA-197 | User flow | Login → Scan → Guidance → Save new history → Reload | Hosted + Browser | BLOCKED | B03: ทดสอบ Scan/Guidance/อ่านเดิมแล้ว แต่ไม่สร้าง test history บน Production | B03: ทดสอบ Scan/Guidance/อ่านเดิมแล้ว แต่ไม่สร้าง test history บน Production | ดู Blocker Register และ Final Action Plan |
| QA-198 | Disposal | Prediction ไม่เพิ่ม disposal อัตโนมัติ; receipt/owner/explicit confirmation | Local PostgreSQL + unit | PASS | node-tests-serial.log | — | — |
| QA-199 | Disposal | ยืนยันทิ้งโดยใช้คำแนะนำทั่วไป ไม่ต้องรอกฎมหาวิทยาลัย | Hosted | BLOCKED | B04: UI/API ยังผูก ruleId verified; disposal_rules=0 | B04: UI/API ยังผูก ruleId verified; disposal_rules=0 | ดู Blocker Register และ Final Action Plan |
| QA-200 | Feedback/Contact | ข้อความหนึ่งตัวอักษรถูกปฏิเสธ ไม่มีข้อความสำเร็จ | Browser + Hosted auth API | PASS | message-validation.json | — | — |
| QA-201 | Feedback/Contact | ส่งข้อความถูกต้อง/Reload/Admin review | Hosted | BLOCKED | B03: ไม่มีบัญชี/ข้อมูลทดสอบแยก; ไม่สร้างข้อความทดสอบใน Production | B03: ไม่มีบัญชี/ข้อมูลทดสอบแยก; ไม่สร้างข้อความทดสอบใน Production | ดู Blocker Register และ Final Action Plan |
| QA-202 | Auth | Register/Duplicate email/Verification/Password reset email | Hosted | BLOCKED | B06: ไม่มี isolated Auth flow; รอบนี้ห้ามส่งอีเมลจริงโดยพลการ | B06: ไม่มี isolated Auth flow; รอบนี้ห้ามส่งอีเมลจริงโดยพลการ | ดู Blocker Register และ Final Action Plan |
| QA-203 | Auth | Password change ผ่าน UI และ Session expiry จริง | Hosted | NOT TESTED | B06: ไม่เปลี่ยนรหัสบัญชีจริง; ต้องบัญชีทดสอบ/เจ้าของกรอก Credential เอง | B06: ไม่เปลี่ยนรหัสบัญชีจริง; ต้องบัญชีทดสอบ/เจ้าของกรอก Credential เอง | ดู Blocker Register และ Final Action Plan |
| QA-204 | Auth | Member B และ cross-user RLS จริง A/B | Hosted | BLOCKED | B03/B06: ไม่มี Session ของ B ที่พร้อมทดสอบ; Local synthetic A/B ผ่าน | B03/B06: ไม่มี Session ของ B ที่พร้อมทดสอบ; Local synthetic A/B ผ่าน | ดู Blocker Register และ Final Action Plan |
| QA-205 | AI | Multi-object ผ่าน UI: 35 boxes, confidence, guidance/source, uncertain labels | Browser + real local Faster R-CNN | PASS | browser-real-ai.json | — | — |
| QA-206 | AI | ภาพขวดหลายชิ้นมี false-positive apple/banana จากการตรวจภาพด้วยตา | Browser + manual image review | FAIL | known-error-observation.json; browser-real-ai.jpg; B07 | known-error-observation.json; browser-real-ai.jpg; B07 | ดู Blocker Register และ Final Action Plan |
| QA-207 | AI | mAP@0.5/mAP@0.5:0.95/Precision/Recall/per-class AP | Labeled held-out benchmark | NOT TESTED | B07: NOT MEASURED; มีภาพ functional เพียง2ภาพ ไม่มี ground truth boxes | B07: NOT MEASURED; มีภาพ functional เพียง2ภาพ ไม่มี ground truth boxes | ดู Blocker Register และ Final Action Plan |
| QA-208 | AI | Fine-tuning/เปลี่ยน Production checkpoint | Local/Production | NOT TESTED | B07: ไม่มี dataset split/license/annotation ที่พร้อม; ไม่เปลี่ยนโมเดล | B07: ไม่มี dataset split/license/annotation ที่พร้อม; ไม่เปลี่ยนโมเดล | ดู Blocker Register และ Final Action Plan |
| QA-209 | AI | Real-time frame/snapshot race/cleanup | Synthetic camera browser fixture | PASS | camera-synthetic.log; snapshot-inflight.log | — | — |
| QA-210 | AI | กล้องจริงที่ชี้ไปขยะบนมือถือ/แสงจริง | Physical Camera | NOT TESTED | B08: ไม่มี physical waste scene ที่จัดให้ทดสอบ; synthetic ไม่ใช่กล้องจริง | B08: ไม่มี physical waste scene ที่จัดให้ทดสอบ; synthetic ไม่ใช่กล้องจริง | ดู Blocker Register และ Final Action Plan |
| QA-211 | Reliability | 503 retry, stable payload, stale result และ quiz in-flight lock | Isolated components | PASS | component-regressions.json | — | — |
| QA-212 | Reliability | Slow network/timeout/VRAM soak/concurrency/deadlock บน PG จริง | Full integration | NOT TESTED | B03/B09: ไม่ทำ load test Production; PGlite ไม่พิสูจน์ concurrency PG server | B03/B09: ไม่ทำ load test Production; PGlite ไม่พิสูจน์ concurrency PG server | ดู Blocker Register และ Final Action Plan |
| QA-213 | Accessibility | Labels ที่ตรวจใน40กรณี; native dialog Escape/focus | Browser | PASS | responsive.json; navigation-retest.json | — | — |
| QA-214 | Accessibility | Full WCAG contrast/screen reader/touch-target ทุก control | Manual/device audit | NOT TESTED | B09: ไม่มี full assistive-technology/contrast run; ไม่อ้าง WCAG compliance | B09: ไม่มี full assistive-technology/contrast run; ไม่อ้าง WCAG compliance | ดู Blocker Register และ Final Action Plan |
| QA-215 | Lint | ESLint | Local | NOT TESTED | B09: ไม่มี ESLint dependency/config/script ในโปรเจกต์ | B09: ไม่มี ESLint dependency/config/script ในโปรเจกต์ | ดู Blocker Register และ Final Action Plan |
| QA-216 | Security | Known-secret scan และ backupเดิม61ไฟล์ | Local | PASS | final-security-backup.json | — | — |
| QA-217 | Security | Dependency advisory audit | npm registry | PASS | dependency-audit.json: vulnerabilities0 | — | — |
| QA-218 | Browser | Console error/warn ในแท็บ CUA ที่ทดสอบ | Browser | PASS | browser-console-summary.json:0; ไม่ใช่ HAR | — | — |
| QA-219 | Browser | HAR ครบทุก failed network request ของทุก control | Browser | NOT TESTED | B09: เก็บ API probes/console แต่ไม่มี full network HAR | B09: เก็บ API probes/console แต่ไม่มี full network HAR | ดู Blocker Register และ Final Action Plan |
| QA-220 | Cloud | Apply 0006 → 0007a → 0007 → 0007b | Hosted | BLOCKED | B01/B02: security/storage release gate ยังไม่ผ่าน | B01/B02: security/storage release gate ยังไม่ผ่าน | ดู Blocker Register และ Final Action Plan |
| QA-221 | Deployment | Public hosting/AI hosting production readiness | Public Internet | NOT TESTED | ไม่ได้ Deploy; AI URL จำกัด loopback ตามโค้ดปัจจุบัน | ไม่ได้ Deploy; AI URL จำกัด loopback ตามโค้ดปัจจุบัน | ดู Blocker Register และ Final Action Plan |
| QA-222 | Automated suite | node-tests | Local (ดู scope ของ suite) | PASS | node-tests-serial.log | — | — |
| QA-223 | Automated suite | python-tests | Local (ดู scope ของ suite) | PASS | python-tests.log | — | — |
| QA-224 | Automated suite | browser-smoke | Local (ดู scope ของ suite) | PASS | browser-smoke.log | — | — |
| QA-225 | Automated suite | camera-synthetic | Local (ดู scope ของ suite) | PASS | camera-synthetic.log | — | — |
| QA-226 | Automated suite | snapshot-inflight | Local (ดู scope ของ suite) | PASS | snapshot-inflight.log | — | — |
| QA-227 | Automated suite | typecheck | Local (ดู scope ของ suite) | PASS | typecheck.log | — | — |
| QA-228 | Automated suite | component-regressions | Local (ดู scope ของ suite) | PASS | component-regressions.log | — | — |
| QA-229 | Automated suite | production-build | Local (ดู scope ของ suite) | PASS | production-build.log | — | — |

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

Hosted introspectionจริง: 37 tables (public/private) เปิดRLSทั้งหมด, 52 policies (รวมstorage), 31 functions, 43 trigger entries, 150 constraints, 75 indexes. Trigger entriesมาจาก information_schema จึงอาจมีหลายeventของtriggerเดียว ไม่ตีความเป็นจำนวนชื่อunique. SECURITY DEFINERที่พบมีsearch_path configuration; metadataการมีRLSไม่ใช่หลักฐานว่าแต่ละpolicyถูกต้องทุกrole.

Anonymous RESTจริง: private application tables6ตารางตอบ401; user_roles/quiz_answer_keysไม่อยู่ในpublic APIตอบ404; quiz_questionsเปิดเฉพาะid/quiz_id/position/prompt/choices. Same-origin mutationsปฏิเสธOriginอื่น403; unauthorized admin/member reads401; evidencepreview403. Local testsตรวจIDOR/RLS/suspended access/role escalation/server-only persistence/receipt tampering/atomic rollback/private grading/immutable rulesผ่าน. Hosted memberBยังไม่ทดสอบ จึงไม่อ้าง cross-user HostedPASS.

APIใช้Zod/structuredSupabase queries; SQLที่operatorรันเป็นstatic SELECT. XSS: popupใช้textContentและSVGสีwhitelist แต่ยังไม่มีdynamic malicious payload E2Eครบทุกinput. ไม่มีfull XSS/SQLi pentest. Rate limitที่ทดสอบได้คือAI semaphore429ในรันconcurrent; ยังไม่มีdistributed load/rate-limitครบทุกAPI. Security headersมีnosniff/frame/referrer/permissions policyตามconfig; secret scanไม่พบknown secretsในขอบเขตที่สแกน และpnpm auditรายงาน0ช่องโหว่ ไม่เท่ากับรับรองไม่มีช่องโหว่.

Candidate order/SQL hashดูท้ายรายงาน. ยังไม่ผ่านrelease gate จึงไม่มีHostedApply. การตรวจStorage columnsของHostedจริงไม่แทนการรันStorage API.

## E. DATABASE REPORT

| ตาราง/ค่า | จำนวนหรือสถานะ |
|---|---|
| areas | 1 |
| quizzes | 1 |
| bin_types | 5 |
| locations | 0 |
| waste_bins | 0 |
| answer_keys | 4 |
| waste_items | 12 |
| data_sources | 1 |
| quiz_questions | 4 |
| waste_categories | 4 |
| knowledge_entries | 6 |
| verified_active_locations | 0 |
| attempts | 0 |
| disposals | 0 |
| materials | 0 |
| predictions | 1 |
| disposal_rules | 0 |
| Hosted schemaVersion | 5 |
| Ledger versions | [5] |
| Active admins | 1 |
| Buckets | [] |
| pin_evidence/admin_save_pin/admin_verify_pin | ไม่มีทั้ง3 |
| Invalid/unvalidated constraints | 0 |

`supabase_migrations.schema_migrations` ไม่มีในProjectนี้; application ledgerคือ `public.recyclebin_schema_version` มี[5]. ไม่ถือว่าLedgerนี้มีhashของ0001–0004. ไม่รัน0001–0005ซ้ำ. ตรวจorphan junction/key3กรณีได้ {'location_bins': 0, 'bin_categories': 0, 'questions_without_keys': 0}; ไม่อ้างว่าครบทุกตาราง. มีpublic view scan_history; RLSview/owner isolationตรวจในLocaltests และAnonymousprivateGETถูกปฏิเสธบนHosted.

No Production CRUD test rows. PGliteแต่ละsuiteใช้ synthetic identities, ปิดฐานข้อมูลเมื่อจบและไม่มีHosted connection. PGliteไม่มีจริงStorage/auth server/PG multi-sessionจึงไม่พิสูจน์Storageและdeadlock. Database snapshot/restoreจริงบนHostedยังNOT TESTED; ไม่ถือว่าSELECTmetadataเป็นfull backup. ต้องจัดทำbackupที่restoreตรวจได้ก่อนmigrationrelease.

## F. AI REPORT

Active architecture Faster R-CNN ResNet50 FPN v2, checkpoint `dd69338a24b8d7381807e247652bdc356325bcbaf1cd3e092e00e0a1a58706bf`. Manifestตรงกับไฟล์จริง; Torch `2.14.1+cu126`, CUDA runtime `12.6`, device `NVIDIA GeForce RTX 3060 Laptop GPU`. ไม่มีการดาวน์โหลดweights/datasetหรือฝึกใหม่ในรอบนี้.

Inferenceจริงผ่านUI35boxes, model latencyที่หน้าแสดงประมาณ394msในครั้งที่เก็บหลักฐาน (ไม่ใช่SLA). Functional generated/quality/error7กรณีผ่าน; success walltimes [('blank', 294.26), ('dark', 236.35), ('blurred', 217.74)]. GPU snapshotดูgpu-runtime.csv: VRAMใช้1683/6144MiB อุณหภูมิ75°C ณจุดวัด ไม่ใช่peakหรือsoak benchmark.

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

| ไฟล์ | SHA-256 |
|---|---|
| 0006_location_evidence.sql | fcad6b315c0fdfa9b39589d8391f4522c079beb3fb69daa374b133b333104977 |
| 0007a_private_evidence.sql | 0eb31f90f201580e117b4a7b2153007079e6eac83bbad9b2b44dc9229ee2281f |
| 0007_self_pinning.sql | 2374c3bd6a29fea767bd3af44184df5dbacfdf25a78ecf54ce3a236be68f4f53 |
| 0007b_pin_guards.sql | 3e29dbca1bdf69270da2a9cd6807966c4cea164c1e0ae600f41436cdf59b0876 |

### Files changed and dependencies

Modified: `web/src/components/self-pinning-admin.tsx`, `database-quiz.tsx`, `admin-workspace.tsx`, `web/src/app/api/ai/detect/route.ts`, `web/src/app/api/location-evidence/route.ts`, `web/package.json`, `web/pnpm-lock.yaml`, `web/tests/scanner-errors.test.ts`, `web/tests/async-components.fixture.tsx`, `scripts/component-regressions.cjs`.

Created: `web/src/lib/pin-save-attempt.ts`, `validate-evidence-image.ts`, tests `pin-save-attempt.test.ts`, `pin-lifecycle.test.ts`, `evidence-decode.test.ts`; audit scripts `full-system-audit.py`, `full-audit-ai.py`, `full-audit-hosted-anon.py`, `full-audit-auth.mjs`, `build-full-audit-report.py`; report/evidenceในโฟลเดอร์นี้. ไม่แก้SQLmigrationหรือGit. Backupcorefilesใน `backups/full-audit-2026-11-02/`; backupเดิม61ไฟล์ยังตรงhash.

Dependencyเพิ่มโดยตรง: **sharp0.35.5, Apache-2.0, Node>=20.9** (Nodeที่รันทดสอบ24.22.1). รุ่นเดียวกับdependencyที่มีอยู่ของNext; install output downloaded0 และใช้storeภายในProject ไม่ติดตั้งGlobal/Driver/CUDA Toolkit. ตรวจlicenseจากpackageจริง; advisoryauditปัจจุบัน0 ไม่รับรองอนาคต.

แหล่งอ้างอิงGeneral Guidanceตรวจ URL เปิดได้ในรอบนี้: [Greener Bangkok — คู่มือชุมชน](https://greener.bangkok.go.th/waste-recycle/community-waste-guide/) อธิบาย4กลุ่มขยะทั่วไป; ไม่ใช่ข้อยืนยันสีถัง/จุดรับของมหาวิทยาลัย และไม่ใช่การตรวจlicenseภาพ/บทความทุกชิ้นครบถ้วน. ใช้การสรุปคำแนะนำ ไม่ได้ดาวน์โหลดภาพจากเว็บนั้นมาใช้ใหม่.

### ข้อจำกัดการตีความ

ไม่ได้ทดสอบทุกmutationบนHostedเพราะขัดกับข้อกำหนดไม่ใช้Productionเป็นtestสนามและไม่มีenvironmentแยก. แต่ละรายการที่ทำไม่ได้ถูกระบุBLOCKED/NOT TESTEDพร้อมB01–B09 ไม่เหมารวมว่าเว็บไซต์ผ่าน. ไม่ได้ทำpayment/SMTP/deployment/OS changes. รายงานนี้เป็นผลตรวจปัจจุบันพร้อมรายการงานเปิด ไม่ใช่ใบรับรองProduction Ready.
