# Migration0006 — REVIEW ONLY / NOT APPLIED
Target: recycle-bin / fdmohzvuxvsrcaddbjvl. SHA-256: fcad6b315c0fdfa9b39589d8391f4522c079beb3fb69daa374b133b333104977

เพิ่ม nullable building/floor/zone/evidence_photo_id ให้ Locations เดิม ไม่มี Seed/ตารางใหม่/การลบข้อมูล/การเปลี่ยนสิทธิ์ Admin. ใช้RLSและAuditเดิม Triggerจะเปลี่ยนVerifiedเป็นPendingและล้างverified_atเมื่อพิกัด/หลักฐาน/รายละเอียดเปลี่ยน เพื่อบังคับตรวจใหม่ การแก้ชื่ออย่างเดียวไม่อยู่ในTriggerนี้

ก่อนApplyต้องตรวจSchema5,ไม่มีSchema6/columns/triggerซ้ำและตรวจHashตรง จากนั้นขออนุมัติเฉพาะไฟล์นี้ รันTransactionครั้งเดียว ห้ามรัน0001–0005ซ้ำ หลังApplyตรวจcolumns/constraints/triggers/RLSและpublic visibilityแบบอ่านอย่างเดียว ไม่มีAuto rollbackหรือReset

ผลLocalก่อนรอบล่าสุด: migrationผ่านในPGliteสังเคราะห์และตรวจAdmin/สมาชิก/Audit/การกลับPending แต่ไม่ใช่HostedPASS. ไฟล์นี้ยังไม่รองรับวันที่สำรวจหรือAtomic saveจุดพร้อมถังหลายประเภท จึงยังไม่ใช่MigrationฉบับครบสำหรับEditorที่ผู้ใช้ขอ ต้องออกCandidateเพิ่มเติม/ปรับCandidateพร้อมBackupและทดสอบก่อนเสนอApplyจริง

ภาพหลักฐานเก็บLocal .local/location-evidence ไม่ใช่Supabase Storage; UUIDในDBไม่รับประกันว่าไฟล์อยู่ในเครื่องอื่น ต้องมีRetention/Recoveryก่อนProduction. ห้ามApplyอัตโนมัติจากเอกสารนี้
