# Gmail SMTP Apply proposal — NOT APPROVED / NOT EXECUTED

Project: recycle-bin / fdmohzvuxvsrcaddbjvl เท่านั้น. ค่าใช้บริการเพิ่ม0บาท ไม่ซื้อDomain/Workspace. ผู้ใช้ยืนยันเปิด2SVและเข้าถึงเมนูApp Passwordsได้แล้ว ยังไม่สร้างรหัส

ค่าที่ขออนุมัติภายหลัง: Custom SMTP ON; Host smtp.gmail.com; Port587 STARTTLS; Username/From pongpornx2005@gmail.com; Sender name RECYCLE BIN; Passwordใช้App Passwordเฉพาะงานนี้ โดยเจ้าของสร้างและกรอกในDashboardเองหลังอนุมัติ ไม่ส่งรหัสในChat/Logs/Screenshots. ไม่ใช้รหัสผ่านGoogleปกติ ไม่เปลี่ยนRate Limits/Templates/Confirmation/Redirects/SessionหรือCloud SQL

เจ้าของต้องยอมรับให้Gmailของตนเป็นผู้ส่งและใช้โควตาร่วมกับเมลส่วนตัว ก่อนสร้างCredentialและSaveค่าจริงให้ตรวจรายการอีกครั้ง หากApp Passwordใช้ไม่ได้ให้หยุด ไม่ลดการป้องกันบัญชี

หลังอนุมัติทดสอบEmail Confirmationบัญชี B=2548mek@gmail.com หนึ่งคำขอ ตรวจSMTP accepted,เมลถึงจริง,ลิงก์ยืนยัน,CallbackและสถานะAuthแยกกัน. ลิงก์127.0.0.1ต้องเปิดในเครื่องที่รันแอปและBrowser flowเดิม ไม่ขอOTP/ลิงก์ลับในChat. ห้ามเพิ่มBเป็นOrganization memberเพื่อเลี่ยงข้อจำกัด Built-in. สิทธิ์นี้ไม่รวมสร้างAdminหรือทำข้อมูลธุรกิจของB

เมื่อ535/429/Timeoutให้หยุดRetryถี่และรายงานโดยปิดบังSecrets ไม่มีRollback/Rate-limit changeอัตโนมัติ. การส่งสำเร็จไม่เท่ากับHosted A/B RLSผ่าน. ยังไม่รับรองProductionหรือDeploy

อ้างอิงตรวจวันที่2พฤศจิกายน2026: https://supabase.com/docs/guides/auth/auth-smtp ; https://supabase.com/pricing ; https://support.google.com/accounts/answer/185833 ; https://developers.google.com/workspace/gmail/imap/imap-smtp ; https://support.google.com/mail/answer/22839
