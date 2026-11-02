# Auth Settings Approval — recycle-bin / fdmohzvuxvsrcaddbjvl

**SQL0001–0005 already committed once / Auth changes explicitly approved and APPLIED on 2 November 2026 / NO ADMIN OR DEPLOY**

Saved and read back: Site URL127.0.0.1:3000, exactly two approved redirect URLs, minimum password10. Email Confirmation/signup/Email provider/secure email change retained enabled; unrelated settings were not changed. Evidence: auth-urls-applied.jpg, auth-email-applied.jpg and auth-minimum-10.jpg in the cloud-migration evidence directory. The table below preserves the before→approved change specification.

Target: Organization PongpornFunfuang-2005, Free, Singapore, Project `fdmohzvuxvsrcaddbjvl` ONLY. No paid service/OAuth/Admin setup/deployment is included.

| Setting | Observed current | Requested value |
|---|---|---|
| Site URL | http://localhost:3000 | http://127.0.0.1:3000 |
| Redirect URLs | No Redirect URLs | Exactly the two URLs below |
| Minimum password length | 6, visible in the current form screenshot | 10, matching the app |
| Email provider | Enabled | Keep enabled |
| Confirm email | Enabled | Keep enabled; never disable to pass tests |
| Allow signups | Enabled | Keep enabled |
| Anonymous sign-ins / manual linking | Disabled / disabled | Keep disabled |
| Secure email change | Enabled | Keep enabled |
| Secure password change / Require current password platform toggles | Disabled / disabled | No change in this batch; compatibility/recovery review remains before release |
| OTP expiration / length | 3600 seconds /8 digits | No change |
| Sessions/JWT/Rate limits/SMTP | Not changed | No change in this batch |
| Social providers | Disabled | Do not enable Google/LINE or other OAuth |

Redirect allowlist:

1. `http://127.0.0.1:3000/auth/callback`
2. `http://127.0.0.1:3000/auth/callback?next=/reset-password`

Use127.0.0.1 consistently so PKCE cookies belong to the same origin; no wildcard/public domain is proposed. This approval changes only the Site URL, these exact redirect entries, and minimum length10. Read back saved values afterward. It does not register users or create Admins.

## Email and authorized tests — separate decision

Built-in SMTP permits only Organization-member addresses and2 messages/hour. The observed Organization has one member. Do not add Organization access merely to test a second application account. Do not fabricate confirmation or use unapproved email addresses.

User selected and authorized testing only the existing Organization-owner address first, including registration/verification/recovery emails. Owner confirmation delivered and succeeded; recovery delivered but first flow expired before opening, and a fresh request returned429. Full A/B E2E remains blocked until two genuinely deliverable authorized addresses are available. Existing/free new SMTP requires exact provider/sender/server approval. See EMAIL_DELIVERY_DECISION_fdmohzvuxvsrcaddbjvl.md. SMTP passwords/API secrets belong in local private configuration, never chat.

Evidence: `docs/evidence/cloud-migration-fdmohzvuxvsrcaddbjvl/auth-settings-before.jpg`. Further email-provider settings, privileged access, first Admin UUID and credential resets require separate approval.
