# Gmail SMTP feasibility — research only / no credentials or Cloud change

ตรวจวันที่ 2 พฤศจิกายน 2026 · Project `fdmohzvuxvsrcaddbjvl` · **NO DEPLOY / NOT PRODUCT READY**

## ข้อเสนอ

เสนอ Gmail SMTP ของเจ้าของสำหรับทดสอบ Hosted Auth A/B ในวงจำกัดเป็นตัวเลือกแรกแบบมีเงื่อนไข ค่าใช้บริการเพิ่ม 0 บาท ไม่ต้องซื้อโดเมนหรือสมัคร Google Workspace โดยใช้ Gmail address เดิมเป็นผู้ส่ง ไม่สมมติ `no-reply@` โดเมนที่ไม่ได้เป็นเจ้าของ Supabase Free รวม Custom SMTP แล้ว ส่วน Gmail รองรับ SMTP และ App Password เมื่อบัญชีมีคุณสมบัติครบ ข้อสรุปนี้เป็นการประเมินความเข้ากันได้จากเอกสาร ไม่ใช่ผลส่งจริงจากโปรเจกต์นี้ ยังไม่ตรวจสิทธิ์ App Password ของเจ้าของและยังไม่มีการทดสอบ Gmail SMTP

Brevo **พักตามคำสั่งผู้ใช้** ที่ขั้น2/2 ไม่กรอกที่อยู่และไม่เดินหน้าอีก ผู้ใช้ไม่มีที่อยู่องค์กรที่ได้รับอนุญาต ไม่ใช้ที่อยู่บ้าน/มหาวิทยาลัย/ที่อยู่สมมติ ไม่เปลี่ยนผู้ให้บริการอัตโนมัติ

หลักฐาน: [Supabase Free pricing](https://supabase.com/pricing), [Supabase Custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp), [Google SMTP protocol](https://developers.google.com/workspace/gmail/imap/imap-smtp), [Google App Password](https://support.google.com/accounts/answer/185833?hl=en).

## ค่าที่เสนอให้อนุมัติภายหลังเท่านั้น

| รายการ | ค่าที่เสนอ |
|---|---|
| Project | recycle-bin / fdmohzvuxvsrcaddbjvl เท่านั้น |
| Host | smtp.gmail.com |
| Port / transport | 587 / STARTTLS เป็นตัวเลือกหลัก; 465 / implicit TLS เป็นทางเลือกที่ต้องตรวจและอนุมัติหากเปลี่ยน |
| Username | อีเมลเต็มของเจ้าของ pongpornx2005@gmail.com |
| Password | App Password เฉพาะงานนี้ ผู้ใช้สร้างและกรอกเองแบบส่วนตัวหลังอนุมัติ ไม่ใช้รหัสผ่าน Google ปกติ |
| Sender email | pongpornx2005@gmail.com ให้ตรงบัญชีที่ยืนยันตัวตน |
| Sender name | RECYCLE BIN |
| Recipient scope | เจ้าของ และ B=2548mek@gmail.com สำหรับ Supabase Auth/การยืนยันตามสิทธิ์เดิมเท่านั้น |
| คงเดิม | Email confirmation ON, Site URL/Redirects/minimum password/Session/Rate limits/SMTP templates และอื่น ๆ ไม่รวมในคำขอเปลี่ยน |

ไม่ใช้ Workspace SMTP relay (`smtp-relay.gmail.com`) ไม่ต้องตั้ง DNS ของ gmail.com ไม่ต้องซื้อ Custom Domain และไม่เปลี่ยนเป็น Google OAuth login ซึ่งเป็นคนละฟังก์ชันกับการส่งเมล Auth

## คุณสมบัติและความปลอดภัย

- ต้องเปิด 2-Step Verification; เมนู App Password อาจไม่มีเมื่อใช้เฉพาะ Security Keys, Advanced Protection หรือมีข้อจำกัดบัญชีองค์กร ห้ามลดการป้องกันเพื่อฝืนให้ใช้ได้ บัญชีเจ้าของยังไม่ได้ตรวจเงื่อนไขนี้
- App Password เป็นรหัสใช้ซ้ำที่ต้องถือเป็น Secret ไม่ใช่ OTP และไม่ใช่ Credential ที่จำกัดสิทธิ์เฉพาะ Supabase อย่างละเอียด ใครได้รหัสอาจนำไปใช้กับบริการเมลที่รองรับได้ Google แนะนำวิธี Sign in with Google เมื่อแอปรองรับ แต่ฟอร์ม SMTP host/user/password ของ Supabase ไม่เท่ากับการเชื่อม OAuth แบบนั้น
- สร้างชื่อเฉพาะเพื่อเพิกถอนได้ง่ายหลังทดสอบ ไม่ใช้รหัสเดียวกับงานอื่น ไม่วางใน Source, NEXT_PUBLIC, Chat, Screenshot, Logs หรือ Backup ให้ผู้ใช้กรอกใน Dashboard แบบส่วนตัวหลังได้รับอนุมัติเท่านั้น เจ้าของอาจเพิกถอนได้ และการเปลี่ยนรหัสผ่าน Google จะเพิกถอน App Passwords
- ใช้ TLS พร้อมตรวจ Certificate ห้ามปิดการตรวจเพื่อแก้ปัญหาเชื่อมต่อ ผู้รับจะเห็น Gmail ผู้ส่งจริง; จึงไม่มีการปกปิดอีเมลส่วนตัวของเจ้าของ และกิจกรรมแอปใช้โควตา/ชื่อเสียงร่วมกับเมลส่วนตัว ไม่เหมาะเป็นข้อรับรองพร้อม Production

อ้างอิง [App Password eligibility and revocation](https://support.google.com/accounts/answer/185833?hl=en), [Gmail client security](https://support.google.com/mail/answer/7126229?hl=en), [SMTP/TLS](https://developers.google.com/workspace/gmail/imap/imap-smtp).

## ข้อจำกัดและต้นทุน

Gmail ส่วนบุคคลอาจจำกัดเมื่อส่งเกิน500ฉบับ/วัน หรือมีผู้รับเกิน500รายในฉบับเดียว เมื่อถูกจำกัดอาจต้องรอ1–24ชั่วโมง ไม่ใช่โควตารับประกันสำหรับSMTPหรือสำหรับแอปนี้ และการป้องกันSpam/บัญชี/ผู้รับอาจทำให้ส่งไม่ได้ก่อนถึงจำนวนดังกล่าว ห้ามอ้างโควตา Workspace 2,000 เป็นโควตาบัญชีนี้ [Google sending limits](https://support.google.com/mail/answer/22839?hl=en)

Supabase ระบุ Custom SMTP เริ่มด้วยข้อจำกัด30ข้อความ/ชั่วโมง แต่ต้องตรวจค่าที่มีผลจริงบนโปรเจกต์หลัง Apply ไม่ถือว่าโควตาเดิมเพิ่มเองหรืออนุญาตให้ปรับ Rate Limits การตั้ง SMTP ถูกต้องก็ยังไม่พิสูจน์ว่า Inbox รับจริง ต้องตรวจการส่งและCallbackแยกกัน การจำกัดเฉพาะผู้รับในOrganizationเป็นเงื่อนไขของ Built-in SMTP; ไม่ควรเพิ่ม B เป็น Organization member เพื่อหลบเงื่อนไขนั้น [Supabase SMTP](https://supabase.com/docs/guides/auth/auth-smtp)

ค่าใช้บริการเพิ่มที่เสนอ: **0บาท** ใช้ Gmail เดิมและ Supabase Free ภายในข้อจำกัด ไม่มีค่าซื้อโดเมน/Workspace/Cloud GPU/Hosting ยังใช้ทรัพยากรเครื่องและอินเทอร์เน็ตเดิม ไม่มี SLA การส่ง/Inbox และยังไม่ผ่าน Hosted A/B tests

## สิ่งที่ผู้ใช้ทำเองและขอบเขตอนุมัติครั้งถัดไป

1. ตรวจใน Google Account ของตนเองว่าเปิด2-Step Verificationหรือไม่ และมีเมนู App Password หรือไม่ แจ้งเพียงสถานะ ไม่ส่งภาพที่มีข้อมูลลับ/รหัส/OTP/Recovery codes และ **ยังไม่สร้าง App Password** ถ้าจะเปิด2SV ให้ผู้ใช้ตัดสินใจและทำขั้นความปลอดภัยนั้นด้วยตัวเอง ไม่มีการเปลี่ยนโดยAgent
2. ยืนยันยอมรับให้อีเมล Gmail เจ้าของเป็น Sender แล้วอนุมัติรายการค่าข้างต้นเฉพาะProjectนี้ รวมการสร้าง Credential โดยผู้ใช้เองและ Apply SMTP จะไม่ตีความการอนุมัติ Brevo preparation เป็นสิทธิ์ Gmail
3. หลังอนุมัติ ผู้ใช้สร้าง App Password ชื่อเฉพาะและกรอกใน Supabase Dashboard ด้วยตัวเองโดยไม่ผ่าน Chat/Agent output ส่วนช่องไม่ลับเตรียมตรวจเทียบรายการก่อน Save ห้ามเปิดดู/คัดลอกค่ารหัสในขั้นตรวจผล
4. หลัง Apply ตรวจเฉพาะสถานะไม่ลับและส่ง Auth ยืนยัน B หนึ่งครั้งตามสิทธิ์เดิม ผู้ใช้ B เปิดอีเมล/ลิงก์บนเครื่องที่เข้าถึง `127.0.0.1:3000` ได้และใช้Browser/PKCE flowเดิม ห้ามถือว่า localhost บนมือถือคนละเครื่องชี้มาคอมเครื่องนี้ บันทึกส่งสำเร็จ/เมลเข้าจริง/ยืนยันEmail/Callback/Profile แยกผล ห้ามขอรหัส Gmail หรือOTPในแชต
5. ถ้า535/429/Timeout/Spam ให้บันทึกชนิดข้อผิดพลาดแบบปิดบังข้อมูลลับและหยุด retry ถี่ ไม่ปิดConfirmationหรือปรับ Rate Limits เพื่อแก้เอง เสนอRollbackเป็นรายการให้อนุมัติ (ปิดCustom SMTPกลับBuilt-in และผู้ใช้เพิกถอน App Password); ยังไม่อนุมัติให้ทำRollbackอัตโนมัติในรอบนี้

การยืนยัน B ไม่ใช่การอนุญาตทำธุรกรรมอื่นกับบัญชี B และไม่ทำให้ Hosted A/B RLS/CRUD ผ่านโดยปริยาย ต้องมีขอบเขตและทดสอบแยกตามแผนเดิม Recovery เจ้าของยังค้างจากExpired flow/429 และไม่มีการส่งซ้ำในรอบนี้

## ทางสำรอง: Supabase Local + Mailpit

เหมาะเมื่อ App Password ใช้ไม่ได้หรือไม่ยินยอมให้บัญชีเมลส่วนตัวส่งให้แอป Mailpit เก็บอีเมลทดสอบในเครื่อง **ไม่ส่งเข้า Gmail ของ B** จึงทดสอบConfirmation/Recovery/Callbackได้ แต่ไม่แทนหลักฐาน Hosted delivery หรือ Hosted A/B isolation [Supabase test Auth flows](https://supabase.com/docs/guides/auth/testing-auth-flows)

แผนภายหลังอนุมัติ: แยกLocal stack/Config/Database/บัญชีสังเคราะห์จากCloudเดิม ใช้Supabase CLIและDocker-compatible runtime ผูกเฉพาะLoopback ตรวจพอร์ตจริงด้วย `supabase status` (ค่าเริ่มต้นAPI54321/Mailpit54324) เปิด `auth.email.enable_confirmations=true` เฉพาะLocal เนื่องจากค่าเริ่มต้นLocalปิดConfirmation ใช้Environment profileแยกและLocal Secret/HMACของตน ไม่คัดลอกHosted keys/Service Secret/Users/Admin เข้าชุดทดสอบ ห้าม `db push`, `db pull`, Remote reset หรือเชื่อมProjectโดยพลการ การเตรียมSchemaถ้าจำเป็นทำเฉพาะLocalและต้องเสนอขอบเขตก่อน ไม่รัน0001–0005ซ้ำบนHosted [Local development](https://supabase.com/docs/guides/local-development)

ตรวจรอบนี้ `Get-Command docker,supabase` ไม่พบในPATH จึงไม่สรุปว่าเครื่องมีRuntimeพร้อมหรือไม่มีซอฟต์แวร์ติดตั้งอยู่ที่อื่น ยังไม่ติดตั้งหรือเริ่มContainer เอกสารDockerระบุเงื่อนไขWSL2/Windowsที่ยังอยู่ในช่วงSupport และEditionในตารางไม่ตรงWindows10Homeที่ผู้ใช้แจ้งทั้งหมด จึงต้องตรวจCompatibilityจริงก่อนเสนอการติดตั้ง ห้ามอัปเกรดOS/ติดตั้งWSL/เปลี่ยนServices/Firewall/PATHโดยไม่มีอนุมัติ สำหรับงานการศึกษาสิทธิ์Docker Desktopใช้ฟรีตามเงื่อนไข แต่ไม่ได้แปลว่าเครื่องนี้รองรับอัตโนมัติ [Windows prerequisites](https://docs.docker.com/desktop/setup/install/windows-install/), [Docker license](https://docs.docker.com/subscription-billing/desktop-license/)

ค่าLicenseที่เสนอ0บาท มีต้นทุนRAM/Disk/ดาวน์โหลดContainerและเวลาSetup เครื่องRAM15.74GBควรทดสอบAuthแยกช่วงจากโหลดโมเดล/Build ไม่ใช้CloudGPU ไม่ซื้อบริการ/ESU/OSเพื่อแก้ข้อจำกัดโดยพลการ หากRuntimeไม่รองรับให้คงแผนLocalเป็นPending ไม่รับรองติดตั้งผ่าน

## สถานะจริงของรอบนี้

ตรวจเอกสารทางการและInventoryแบบอ่านอย่างเดียว ไม่สร้าง Gmail Credential ไม่เปิดดูGoogle security settings ไม่เชื่อมSMTP ไม่ส่งB ไม่เปลี่ยนSupabase/Hosted SQL/Auth/Cloud ไม่รันMigrationซ้ำ ไม่เพิ่มDependencies ไม่Deploy Brevoคงพัก ส่วนLocal Admin UIที่ทำก่อนคำขอGmailมีหลักฐานใน `LOCAL_ADMIN_DISPLAY_REPORT_2026-11-02.md` ยังไม่ใช่การรับรองProduct Ready
