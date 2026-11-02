> CURRENT UPDATE — 2 November 2026: ผู้ใช้ไม่ยินยอมส่งที่อยู่ จึงพัก Brevo Onboarding ที่2/2 ไม่ให้รอกรอกที่อยู่หรือเดินหน้าต่อ ขณะนี้ตรวจ Gmail SMTP แบบResearch only ตาม GMAIL_SMTP_FEASIBILITY_REVIEW_2026-11-02.md ยังไม่สร้าง App Password/SMTP Credential และไม่เปลี่ยน Supabase/Cloud/Rate Limits ข้อความเก่าด้านล่างเป็นบันทึกตามช่วงเวลา ไม่ใช่สิทธิ์ดำเนินงานปัจจุบัน

# Email delivery decision — 2 November 2026

Status: built-in Supabase SMTP retained. Brevo PREPARATION approved; signup/Terms by user and owner email confirmation completed. User-confirmed profile fields passed Onboarding1/2; stopped at2/2 requiring organization address/postal code/city/country, with address disclosed in sent emails. No address submitted/plan selected by agent. No Brevo SMTP credential/API Key or Supabase SMTP change approved/performed. See BREVO_PREPARATION_REPORT_2026-11-02.md.

Latest user decision: B=2548mek@gmail.com is authorized ONLY for Supabase Auth/verification; there is no owned SMTP/sender domain. Current Team still has owner only, and Custom SMTP is OFF. Built-in therefore cannot deliver to B; no B signup/send was attempted. See SMTP_FREE_PLAN_REVIEW_B_2026-11-02.md for current researched options, including Brevo's documented temporary free-email sender replacement. First Admin is now approved/executed separately; it does not change SMTP authorization.

Real owner confirmation mail delivered at 10:03 ICT; real recovery mail delivered at 10:08. Confirmation callback reached /profile. Recovery was opened at 10:18 and the hosted /token log returned422, `invalid flow state, flow state has expired`. This was an expired test flow; successful delivery is not a successful password reset. A new /recover request at10:28 returned429, `email rate limit exceeded`. No rate-limit/OTP/SMTP settings were changed. No further retry is scheduled automatically.

The built-in service permits Organization-member recipient addresses only and2 emails/hour per project. There is one observed Organization member. A second application user must not be granted Organization privileges merely to bypass that restriction. Testing alias addressing is not an approved substitute for two independently deliverable authorized identities.

## Next options

1. Keep built-in SMTP and retry the owner recovery after quota becomes available. Request one fresh link and open it immediately in the same browser; do not do other work before following it. Do not promise a precise reset time from an hourly quota alone. The user must enter/submit the new password themselves under the browser credential-change handoff policy. Never send passwords or email links in chat. A/B remains blocked.
2. Use an existing approved SMTP account if the user already has one. Required non-secret information: provider, SMTP host/port/TLS, sender address/domain, authorized test B recipient, and ownership of sender/domain. Credentials are entered privately. Present exact Supabase changes for approval before saving anything.
3. New free provider proposal: Brevo Free is a candidate (official300 sends/day). It needs sender verification/account approval/Transactional activation. A Gmail domain cannot be authenticated by this project; Brevo separately documents temporary sender replacement for free-email addresses, including Transactional messages. This is a conditional testing option to verify, not a production guarantee. No signup, Terms acceptance, DNS changes, credential creation, SMTP configuration, billing or domain purchase is included in current authorization. Domain absence is now confirmed; request only the new preparation scope in the current review.

Do not choose Resend's default onboarding sender as an A/B solution: unrestricted recipient sending needs a verified owned domain. No new provider is selected until sender/domain and authorized recipients are known.

Official references checked during this continuation:

- https://supabase.com/docs/guides/auth/auth-smtp
- https://supabase.com/docs/guides/auth/rate-limits
- https://supabase.com/docs/guides/auth/sessions/pkce-flow
- https://help.brevo.com/hc/en-us/articles/208589409-About-Brevo-s-pricing-plans
- https://help.brevo.com/hc/en-us/articles/17286219877778-FAQs-About-domain-authentication-Brevo-code-DKIM-DMARC

Email sending limitations are external and can change. Check actual account/provider restrictions again before setup. This document is a decision proposal, not an authorization or a delivery guarantee.
