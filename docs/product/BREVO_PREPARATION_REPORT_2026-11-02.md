> CURRENT UPDATE — 2 November 2026: ผู้ใช้ไม่ยินยอมส่งที่อยู่ จึงพัก Brevo Onboarding ที่2/2 ไม่ให้รอกรอกที่อยู่หรือเดินหน้าต่อ ขณะนี้ตรวจ Gmail SMTP แบบResearch only ตาม GMAIL_SMTP_FEASIBILITY_REVIEW_2026-11-02.md ยังไม่สร้าง App Password/SMTP Credential และไม่เปลี่ยน Supabase/Cloud/Rate Limits ข้อความเก่าด้านล่างเป็นบันทึกตามช่วงเวลา ไม่ใช่สิทธิ์ดำเนินงานปัจจุบัน

# Brevo Free Preparation — Email confirmed / Step 1 passed / Step 2 address required

สถานะล่าสุด:ผู้ใช้ยืนยันการสะกดชื่อภาษาอังกฤษจริงและNon-ecommerceแล้ว ตรวจFirst name/Last name/Organization=`RECYCLE BIN`/ไม่มีเว็บไซต์/Non-ecommerceครบและไม่มีValidation error จึงกดContinueหนึ่งครั้ง ผ่านไปขั้น2/2จริง หน้าถัดไปขอAddress,Postal code,CityและCountryพร้อมระบุว่าจะใส่ที่อยู่องค์กรในทุกอีเมล **หยุดก่อนกรอกที่อยู่หรือกดSelect your plan** และส่งต่อให้ผู้ใช้เลือกข้อมูล/กรอกเองหากยินยอม งบประมาณ0บาท ยังไม่สร้างSMTP credential/API KeyหรือApplySupabase SMTP

วันที่2 พฤศจิกายน2026 · RECYCLE BIN · **PREPARATION ONLY / SUPABASE SMTP NOT CHANGED / NO DEPLOY**

## ขอบเขตที่ผู้ใช้อนุมัติ

อนุมัติเฉพาะเตรียม/ตรวจBrevo Freeด้วยอีเมลเจ้าของ `pongpornx2005@gmail.com` รวมรับอีเมลยืนยันบัญชี/Sender ไม่สร้างSMTP credential/API Key ไม่เปลี่ยนSupabase SMTP ไม่ส่งไปB ไม่สมัครPaid/ซื้อบริการ หากขอข้อมูลส่วนตัวเพิ่มให้หยุด ผู้ใช้เป็นผู้ทำขั้นข้อตกลงและการยืนยันตัวตนที่จำเป็นเอง

## ผลที่สังเกตจริง

1. หน้าLoginไม่มีSessionที่เข้าสู่ระบบ จึงยังพิสูจน์ไม่ได้จากหน้านั้นว่าอีเมลนี้มีบัญชีเดิมหรือไม่ ไม่ลองรหัสผ่านเดา ไม่ใช้รหัสSupabaseไปLogin Brevo และไม่สั่งReset password
2. เปิดฟอร์มSignupจากลิงก์Create an account หน้าแสดง `Free to use – no credit card required` นี่เป็นข้อความบนSignup ยังไม่ใช่ผลยืนยันPlan/Quota/Transactionalของบัญชีที่เปิดใช้งานแล้ว
3. เตรียมอีเมลและรหัสผ่านเริ่มต้นเฉพาะบัญชีBrevoในฟอร์ม โดยเก็บรหัสผ่านในพื้นที่ส่วนตัวที่Git ignore ไม่แสดงค่าในแชต/รายงาน รหัสผ่านฟอร์มแสดงแบบMasked ไม่ได้สร้างSMTP credentialหรือAPI Key
4. หยุดก่อนCreate your account เพราะปุ่มยอมรับTerms of Use/Privacy Policyตามข้อความบนหน้า ผู้ใช้กดสร้างบัญชีเองและแจ้งว่ารอยืนยันอีเมล จากนั้นตรวจUIจริงพบหน้า `Let's verify your email address` ซึ่งแจ้งส่งไปยังเจ้าของ
5. ตรวจเฉพาะอีเมลBrevoในกล่องเจ้าของ พบ `Complete your registration` จากBrevo เวลา11:09 ICT เปิดลิงก์ยืนยันตามขอบเขตที่อนุมัติแล้วเข้าสู่Onboardingหน้า `Welcome! Nice to meet you`, ขั้น1/2
6. หน้า1/2ขอFirst name, Last name, Organization nameและWebsite พร้อมตัวเลือกไม่มีเว็บไซต์ จึงหยุดก่อนกรอก/ส่งข้อมูลเหล่านั้นในครั้งแรก ต่อมาผู้ใช้อนุญาตเฉพาะOrganization=`RECYCLE BIN`และเลือกไม่มีเว็บไซต์ จึงเตรียมสองค่านี้โดยไม่ส่งฟอร์ม เมื่อมีช่องBusiness typeเพิ่มจึงหยุดและรอชื่อที่ยืนยันกับการเลือกBusiness typeจากผู้ใช้ ไม่แต่งองค์กร/ที่อยู่หรืออนุมานชื่อจากรายงานโครงงาน
7. ผู้ใช้ยืนยันชื่อจริงภาษาไทยและNon-ecommerce แต่UIยังไม่เลือกRadioจึงตั้งตามตัวเลือกที่ยืนยัน ชื่อภาษาไทยถูกBrevoปฏิเสธว่า `must only contain standard characters` จึงขอสะกดอังกฤษจากผู้ใช้ ไม่แปลงหรือใช้ชื่อGoogleแทน เมื่อได้รับชื่ออังกฤษแล้วกรอกตรงค่าที่ยืนยันและอ่านทุกช่องก่อนContinue ไม่เปลี่ยนMarketing preferenceหรือยอมรับข้อตกลงใหม่
8. หลังContinueปรากฏขั้น2/2และหัวข้อ `What is your organization address?` ต้องใช้ที่อยู่/รหัสไปรษณีย์/เมือง/ประเทศ จึงหยุดตามขอบเขตที่ผู้ใช้สั่งเมื่อพบข้อมูลเพิ่ม ไม่เติมที่อยู่มหาวิทยาลัยหรือที่อยู่ตัวอย่าง ไม่เลือกประเทศจากการคาดเดา

สถานะ: การสมัคร/ยืนยันอีเมล/Onboarding1/2ผ่าน แต่Onboarding2/2ยังไม่เสร็จ **ยังไม่ตรวจว่าTransactionalเปิดใช้แล้ว ไม่ยืนยันSenderใช้งานจริง ไม่รับรองFree quotaของบัญชีหรือการส่งถึงB** ยังไม่ถึงการเลือกPlanและไม่มีการกดResendโดยไม่จำเป็น

รหัสผ่านที่เตรียมไว้ยังไม่ได้ผ่านการทดสอบPassword Loginแยกต่างหาก จึงไม่อ้างว่าไฟล์รหัสผ่านตรงกับรหัสสุดท้ายหากผู้ใช้แก้ในฟอร์มระหว่างขั้นส่งสมัคร

## ประเด็นการปกป้องข้อมูล

ระหว่างอ่านอีเมลครั้งแรก ตัวกรองปิดบังเฉพาะURLที่มีQueryแต่TokenของBrevoอยู่ในPath จึงมีลิงก์ยืนยันปรากฏในผลเครื่องมือหนึ่งครั้ง ได้ดำเนินการยืนยันแล้วและเปลี่ยนวิธีแสดงผลให้ปิดบังURL/Tokenทั้งหมด ไม่คัดลอกลิงก์หรือRaw email snapshotลงรายงาน/หลักฐาน และไม่บันทึกภาพอีเมลที่เห็นลิงก์ ไม่ทดสอบใช้ลิงก์ซ้ำและไม่อ้างว่าตรวจยืนยันการเพิกถอนTokenแล้ว

ไฟล์รหัสผ่านเริ่มต้นอยู่เฉพาะ`.local/secrets/brevo-account-preparation.json`ที่Ignore ใช้สำหรับบัญชีBrevoเท่านั้น ไม่มีSMTP secret/API Key เพิ่มขอบเขตKnown-secret scannerให้ตรวจรหัสนี้ในPublic/static/docs/contracts/Backup/Local logsด้วย ผลตรวจไม่สามารถลบหรือรับรองข้อมูลที่เคยปรากฏในผลเครื่องมือได้

## สิ่งที่ยังไม่ได้ทำ

- ไม่กรอกที่อยู่/รหัสไปรษณีย์/เมือง/ประเทศหรือข้อมูลใหม่ที่ยังไม่ได้รับอนุญาต ชื่อ/องค์กร/ไม่มีเว็บไซต์/Non-ecommerceส่งเฉพาะค่าที่ผู้ใช้ยืนยันแล้วในขั้น1/2
- ไม่สร้างSMTP user/key/credential หรือAPI Key
- ไม่ตั้งSender,Tracking,Transactional activationหรือSubscription
- ไม่เปลี่ยนSupabase SMTP/Email Templates/Rate Limits/Session/Auth settings
- ไม่สร้างB/ส่งเมลB/เพิ่มสมาชิกOrganization
- ไม่รันCloud SQLหรือFirst Adminซ้ำ ไม่ติดตั้งDependencies ไม่แก้Git ไม่Deploy

## ขั้นต่อไป

รอผู้ใช้ตัดสินใจยินยอมส่งที่อยู่องค์กรและกรอกข้อมูลขั้น2/2ด้วยตัวเอง เพราะBrevoระบุว่าจะใส่ในทุกอีเมล ไม่ขอที่อยู่จริง/Gmail password/OTP/API Keyในแชต หากไม่ยินยอมหรือไม่มีที่อยู่ที่ใช้ได้ ให้หยุดการเตรียมที่ขั้นนี้ ไม่ใส่ข้อมูลเท็จ หากพบข้อตกลง/การยืนยันตัวตน/ชำระเงิน/เอกสารหรือข้อมูลอื่นที่ยังไม่ได้รับอนุญาตให้หยุดส่งต่อ

หลังOnboardingพร้อมจึงตรวจPlan/Transactional/SenderแบบRead-onlyภายใต้ขอบเขตที่อนุมัติ หากต้องสร้างCredentialหรือเปลี่ยนค่าใหม่จะเสนอรายการจริงให้อนุมัติก่อน ไม่ใช้การอนุมัติเตรียมบัญชีเป็นการอนุมัติApplySMTP

## หลักฐาน

`docs/evidence/brevo-preparation-2026-11-02/`:

- `signup-before-user-terms.jpg`:ฟอร์มFreeพร้อมTermsก่อนผู้ใช้กดส่งเอง
- `verification-pending.jpg`:หน้าแจ้งส่งอีเมลเจ้าของ
- `email-verified-profile-required.jpg`:ผ่านEmailแล้วแต่ขอข้อมูลOnboardingเพิ่มเติม
- `organization-and-no-website-prepared.jpg`:ค่าที่ได้รับอนุมัติเพิ่มและช่องBusiness typeใหม่ที่ยังไม่เลือก
- `thai-name-validation.jpg`:ชื่อภาษาไทยที่ผู้ใช้ยืนยันถูกForm validationปฏิเสธ จึงไม่ส่งฟอร์ม
- `step2-organization-address-required.jpg`:ผ่านขั้น1/2แล้วและพบข้อกำหนดที่อยู่ในขั้น2/2โดยยังไม่กรอก
- `step1-completed-step2-address-required.json`:ผลตรวจค่าที่อนุมัติ/Validation/การไปหน้าถัดไป โดยไม่เก็บชื่อหรือที่อยู่ลงJSON
- `preparation-state.json`:สถานะไม่บันทึกSecrets
- `final-security-backup.json`:ตรวจBackup/Known secretsตามขอบเขต

รายงานนี้ไม่แทนผลทดสอบการส่งSMTP ไม่ถือว่าพร้อมProduct/Deploy และไม่เปลี่ยนผลทดสอบHosted H01–H15ที่ยังค้าง
