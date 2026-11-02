# SMTP Free Plan Review สำหรับบัญชี B

วันที่2 พฤศจิกายน2026 · Project `recycle-bin / fdmohzvuxvsrcaddbjvl` · **PREPARATION APPROVED / SMTP NOT CHANGED / NO DEPLOY**

สถานะล่าสุด:ผู้ใช้อนุมัติเฉพาะเตรียมBrevo Free กดส่งสมัคร/ข้อตกลงเอง และยืนยันอีเมลเจ้าของแล้ว ภายหลังอนุญาตOrganization=`RECYCLE BIN`,ไม่มีเว็บไซต์,ยืนยันชื่ออังกฤษจริงและNon-ecommerce ตรวจครบแล้วกดContinueผ่านขั้น1/2 ขณะนี้หยุดที่ขั้น2/2ซึ่งขอที่อยู่องค์กร/รหัสไปรษณีย์/เมือง/ประเทศ และระบุว่าจะใส่ที่อยู่ในทุกอีเมล ยังไม่กรอกข้อมูลใหม่ ไม่เลือกPlan ไม่ตรวจTransactional/Senderพร้อมใช้งาน ไม่สร้างSMTP credential/API Keyและไม่ApplySupabase SMTP ดู BREVO_PREPARATION_REPORT_2026-11-02.md ส่วนข้อเสนอApplyด้านล่างยังไม่อนุมัติและไม่ใช่คำสั่งให้ทำซ้ำ

## ผลตรวจ Built-in Email

ตรวจหน้า SMTP Settings จริงแล้ว `Enable custom SMTP` ปิดอยู่ และหน้า Team ของ Organization `PongpornFunfuang-2005` มีสมาชิกหนึ่งคนคือเจ้าของ ไม่มี `2548mek@gmail.com` อยู่ใน Team

เอกสารSupabaseระบุว่าบริการBuilt-inปฏิเสธการส่งไปยังอีเมลนอกTeam และจำกัด2ฉบับ/ชั่วโมง ดังนั้น **ภายใต้การตั้งค่าปัจจุบันยังส่งอีเมลยืนยันให้Bไม่ได้** นี่เป็นข้อสรุปจากสถานะการตั้งค่า/Teamและข้อกำหนดทางการ ไม่ใช่ผลอ้างว่าได้ส่งอีเมลBแล้วล้มเหลว รอบนี้ไม่กดสมัครBหรือส่งอีเมลที่ทราบล่วงหน้าว่าผู้รับไม่อยู่ในรายการที่บริการอนุญาต

หลักฐานUI: `docs/evidence/first-admin-fdmohzvuxvsrcaddbjvl/org-members-for-email-check.jpg` และ `smtp-unchanged-disabled.jpg`

แหล่งทางการ: [Supabase SMTP](https://supabase.com/docs/guides/auth/auth-smtp), [Rate limits](https://supabase.com/docs/guides/auth/rate-limits)

การอนุญาตอีเมลBจากผู้ใช้เป็นสิทธิ์สำหรับทดสอบแอป ไม่ได้ทำให้Bเป็นสมาชิกSupabase Team ห้ามเชิญBเข้าOrganizationเพื่อเลี่ยงข้อจำกัด ห้ามสร้างAdminให้Bหรือใช้Admin APIยืนยันอีเมลแทนเจ้าของกล่อง

## เปรียบเทียบทางเลือกฟรี

| ทางเลือก | Free quotaตามเอกสารปัจจุบัน | ข้อจำกัดที่สำคัญสำหรับเครื่องนี้/ผู้ใช้ |
|---|---|---|
| Brevo Free |300ฉบับ/วัน ไม่สะสมโควตาข้ามวัน | ต้องผ่านการตรวจบัญชี/เปิดTransactionalและยืนยันSender เอกสารระบุการแทนอีเมลGmailด้วยโดเมนของBrevoเป็นมาตรการชั่วคราว จึงเป็นตัวเลือกทดสอบที่ต้องตรวจจริง ยังรับประกันส่งเข้าInboxไม่ได้ |
| SMTP2GO Free |1,000ฉบับ/เดือน,200/วัน;25/ชั่วโมงหากไม่ยืนยันโดเมน | เอกสารการสมัครปัจจุบันไม่รับGmail/Yahoo ต้องใช้อีเมลโดเมนส่วนตัวหรือธุรกิจ จึงยังไม่เหมาะกับข้อมูลที่มี แม้บริการรองรับSingle senderหลังสมัครแล้ว |
| Resend Free |3,000ฉบับ/เดือน,100/วัน | Senderทดสอบ`resend.dev`ส่งได้เฉพาะอีเมลเจ้าของบัญชี ต้องยืนยันโดเมนของตนเพื่อส่งให้B จึงยังไม่แก้ปัญหาสองผู้รับโดยไม่มีโดเมน |

อ้างอิงแต่ละรายการ:

- [Brevo plans](https://help.brevo.com/hc/en-us/articles/208589409-About-Brevo-s-pricing-plans), [Brevo free-email sender replacement รวมTransactional](https://help.brevo.com/hc/en-us/articles/14925263522578-Comply-with-Gmail-Yahoo-and-Microsoft-s-requirements-for-email-senders)
- [SMTP2GO Free Plan](https://support.smtp2go.com/hc/en-gb/articles/223087947-Free-Plan), [SMTP2GO signup restrictions](https://support.smtp2go.com/hc/en-gb/articles/12922807451289-Migrating-to-SMTP2GO-FAQ)
- [Resend quotas](https://resend.com/docs/knowledge-base/account-quotas-and-limits), [ข้อจำกัดresend.dev](https://resend.com/docs/knowledge-base/403-error-resend-dev-domain)

## ข้อเสนอหลัก: ตรวจและเตรียม Brevo Free สำหรับการทดสอบแบบจำกัด

เสนอBrevo Freeเป็นตัวเลือกแรกสำหรับการทดลอง เพราะมีเอกสารรองรับการแทนSenderจากFree emailรวมTransactional แต่ **ยังไม่เลือกเป็นระบบอีเมลพร้อมProduction** เอกสารSMTPของBrevoยังแนะนำโดเมนที่ยืนยันแล้ว จึงต้องตรวจว่าบัญชีใหม่ได้รับอนุมัติTransactionalและSenderที่ใช้งานได้จริงก่อน ไม่ซื้อโดเมน ไม่อัปเกรด ไม่เปลี่ยนการป้องกันเพื่อฝืนส่ง

หากได้รับอนุมัติให้เตรียมบัญชี:

1. ตรวจว่ามีบัญชีBrevoของเจ้าของอยู่แล้วหรือไม่ ถ้าไม่มี ให้เตรียมFreeด้วยอีเมลเจ้าของ `pongpornx2005@gmail.com` และใช้เฉพาะการตั้งค่าทดสอบAuth ไม่มีMarketing Campaign/Contact Import
2. ตรวจFree Planในหน้าจอจริง หยุดหากบังคับชำระเงิน บัตรเครดิต Paid Trial หรือข้อมูลส่วนตัวที่ยังไม่มีสิทธิ์ใช้ ไม่เดาข้อมูลธุรกิจ/ที่อยู่/เบอร์โทร
3. ให้เจ้าของดำเนินขั้นตอนข้อตกลง/CAPTCHA/ยืนยันตัวตนที่ต้องทำเองเมื่อปรากฏ ไม่ขอGmail password/OTP/API Keyในแชต
4. ตรวจTransactional activation และยืนยันSenderของเจ้าของผ่านขั้นตอนProviderที่อนุญาต การส่งอีเมลยืนยันBrevoไปยังเจ้าของต้องอยู่ในคำอนุมัติใหม่นี้ ไม่รวมอีเมลBซึ่งอนุญาตเฉพาะSupabase Auth
5. จัดทำค่าจริงที่พร้อมใช้และผลตรวจSenderให้ทวนสอบ **ยังไม่ApplySupabase SMTPในขั้นเตรียมบัญชีนี้** หากต้องสร้างSMTP credential จะขออนุมัติตามขอบเขตที่ชัดเจน ไม่ขอAPI Keyจากผู้ใช้

## ค่าSupabaseที่คาดว่าจะเสนอหลังProviderพร้อม — ยังไม่อนุมัติApply

| ค่า | ข้อเสนอ |
|---|---|
| Project | `fdmohzvuxvsrcaddbjvl` เท่านั้น |
| Provider/Plan | Brevo Free,ไม่เพิ่มBilling/เสียเงิน |
| Sender name | `Recycle Bin — Auth Test` |
| Sender email | อีเมลเจ้าของที่ยืนยันแล้ว ต้องตรวจการแทนSenderตามกฎBrevo |
| SMTP Host | `smtp-relay.brevo.com` |
| Port |587 โดยตรวจการเชื่อมต่อSTARTTLSตามProviderก่อนApply |
| SMTP Username | ค่าที่Providerแสดงจริง ไม่เดาจากอีเมลเจ้าของ |
| SMTP Password | SMTP credentialเฉพาะงานนี้ จัดการเป็นSecretส่วนตัว ไม่ใช้Gmail passwordหรือAPI Key |
| Click/Open tracking | ต้องตรวจและเสนอปิดสำหรับAuth emailเพื่อรักษาลิงก์ยืนยัน ไม่แก้ก่อนอนุมัติ |
| Supabaseอื่น | คงSite URL/Callback/Email Confirmation/OTP/Sessionตามเดิม ไม่เพิ่มRate Limitเอง |

เอกสารSupabaseระบุว่าการเปิดCustom SMTPจะใช้ข้อจำกัดเริ่มต้น30ฉบับ/ชั่วโมง ต้องอ่านค่าจริงหลังApplyและรายงานผลกระทบ ไม่รับประกันใช้โควตาProvider300/วันได้เต็มโดยไม่ชนข้อจำกัดSupabase

อ้างอิง: [Brevo SMTP configuration](https://help.brevo.com/hc/en-us/articles/7924908994450-Send-transactional-emails-using-Brevo-SMTP), [Transactional activation/troubleshooting](https://help.brevo.com/hc/en-us/articles/115000188150-Troubleshooting-Issues-with-Brevo-SMTP), [Supabase custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp)

## ขอบเขตทดสอบหลังSMTPได้รับอนุมัติและทำงานจริง

- B=`2548mek@gmail.com`: สมัครSupabase Auth/รับและยืนยันอีเมล/Loginตามที่ผู้ใช้อนุญาต ไม่ส่งRecovery/MarketingไปB ไม่สร้างAdmin ไม่ใช้Bสำหรับข้อมูลฟีเจอร์อื่นเกินสิทธิ์ที่ให้
- เจ้าของกล่องBเปิดลิงก์ยืนยันในเบราว์เซอร์ที่สมัครไว้ ไม่ส่งลิงก์/OTP/รหัสผ่านทางแชตและไม่ขอGmail credentials
- ทดสอบEmail Confirmationที่ยังเปิดอยู่ ตรวจผลส่งจริงและCallback ไม่ใช้Account confirmedโดยAdminแทน
- Owner Recoveryยังค้างจากรอบก่อน ต้องขอลิงก์ใหม่และเปิดทันทีเมื่อส่งได้จริง การเปลี่ยนรหัสผ่านผ่านBrowserให้ผู้ใช้กรอกและส่งเอง
- Aเจ้าของเป็นAdminแล้ว การทดสอบA/Bในบริบทสองสมาชิกปกติและการเขียนข้อมูลBยังไม่ถือว่าผ่านหรือได้รับสิทธิ์เพิ่มจากการอนุญาตอีเมลBครั้งนี้

**คำขออนุมัติปัจจุบัน: เตรียม/ตรวจบัญชี Brevo Free และSenderของเจ้าของตามขั้นตอนข้างต้นเท่านั้น ยังไม่ApplySMTP ไม่สร้างCredentialใหม่ ไม่ส่งSupabase mailไปBจนProviderพร้อมและค่าจริงได้รับอนุมัติแยกต่างหาก**

หากไม่อนุมัติ ระบบคงBuilt-in SMTPไว้ ทดสอบเจ้าของต่อได้ภายใต้โควตา แต่BยังติดBlocker การรอให้โควตารีเซ็ตไม่แก้ข้อจำกัดผู้รับนอกTeam
