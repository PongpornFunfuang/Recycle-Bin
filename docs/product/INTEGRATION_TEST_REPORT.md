# Hosted integration report

**Actual hosted continuation — 2 November 2026. Project fdmohzvuxvsrcaddbjvl configured; SQL0001–0005 executed ONCE previously; approved Auth settings applied. First Admin subsequently approved/executed once and verified8 checks. NOT PRODUCT READY.** Owner-A real hosted tests29 PASS and post-restart checks12 PASS were BEFORE Admin promotion. Those41 checks and the later Admin checks are narrower than the15 H-series end-to-end acceptance procedures below. Local PGlite evidence is never counted as hosted evidence.

| ID | Actual hosted acceptance procedure | Status |
|---|---|---|
| H01 | Register authorized A and verify real email; check trigger-created profile/member/access | PASS — real owner email/callback/profile/active member |
| H02 | Register authorized B independently, confirm email | BLOCKED — B address now authorized for Auth/verification, but not an Organization member; built-in SMTP cannot deliver; no B signup/mail attempted |
| H03 | Login/logout valid/invalid credentials; persisted cookies and CSRF rejection | PASS — owner scope, real SSR cookie jar and cross-origin403 |
| H04 | Unconfirmed login/expired verification links denied correctly | PARTIAL — unconfirmed login denied; invalid callback and expired recovery denied; expired signup-link case still pending |
| H05 | Forgot password delivery → exact local callback → password update → old password fails | FAIL/BLOCKED — delivered, then422 expired flow; retry429; no password change/old-password test |
| H06 | A performs real photo scan, saves signed result; re-read same UUID after reload | PASS — real model35 detections, signed save/retry/read, also after restart |
| H07 | B saves a different real scan and sees only B results | BLOCKED — B not registered; latest B permission is Auth/verification only, no B feature-data writes performed |
| H08 | A/B fetch each other's UUID through app API AND publishable-key/JWT Data API; no private data | BLOCKED — no genuine B JWT; anon/member tests are not A/B isolation |
| H09 | Explicit verified-rule disposal persists; duplicate retry gives same ID; conflicting retry fails | BLOCKED — no authorized verified rule/reference data; confirmed=false is actually rejected |
| H10 | Dashboard/learning equal actual owned row counts/quantities and Bangkok dates | PARTIAL — scan count+1, disposals/items unchanged; learning actual empty; non-empty disposal/quiz/day-boundary cases pending |
| H11 | Member cannot call admin APIs/RPCs, alter own role, forge server scan or review state | PARTIAL — Admin403, self-promote/private schema/audit/writer denied, tamper422; hosted reviewer-state/full metadata cases pending |
| H12 | Trusted admin CRUD, Draft→Verified rules, new versions, archives, links, message review and audit | PARTIAL — approved First Admin created once, API200/role/operator audit/UI verified; CRUD/workflows/reference data still untested |
| H13 | Inspect RLS/grants and test anon/auth/service contexts, private keys/audits inaccessible | PARTIAL — prior cloud structural validation plus real anon/member JWT and actual privileged writer; full A/B contexts pending |
| H14 | Session expiry/refresh/revocation/suspension; protected page/API denied appropriately | PARTIAL — logout/private API denial verified; natural expiry/refresh/suspension pending |
| H15 | Stop/restart local Next/FastAPI; login again; DB records unchanged and isolated | PARTIAL — both local services restarted, same owner scan/feedback/contact UUIDs and totals persist; B isolation pending |

Additional failure tests: missing schema, unavailable project/network, expired HMAC receipt, tampered result, invalid source/material/coordinate, cross-area FK, concurrent duplicate submissions, no partial rows after injected transaction failure. Never disable RLS to obtain a passing result. Do not test destructive failures against unrelated real users.

Use only approved test accounts and source-backed reference/test records. Record time, project reference (not keys), migration hashes, test user aliases, sanitized endpoint/status/assertion and evidence location. Raw credentials, session cookies, student images and email links must not appear in reports. Cleanup/export/rollback needs a separately approved data plan.

## Hosted SQL stage completed — 2 November 2026

User-approved SQL0001–0005 committed once on recycle-bin / fdmohzvuxvsrcaddbjvl. Actual schema/grant validation and Local→Cloud readiness passed; see CLOUD_MIGRATION_REPORT_fdmohzvuxvsrcaddbjvl.md. Subsequent approved Auth/owner tests are reflected above. Admin/deploy remain unapproved. The initial private DB-password copy failed validation and must not be used for direct database access; API connection works with existing keys. Ledger labels corrected with original retained; no migration rerun.

Evidence: docs/evidence/cloud-migration-fdmohzvuxvsrcaddbjvl/owner-hosted-tests.json (29), owner-persistence-after-restart.json (12), owner-email-delivered.jpg, recovery-expired-flow-log.jpg and recovery-rate-limit-log.jpg. Initial sandbox network failure and a corrected readiness test assertion are preserved separately; neither is represented as a product success. Summary report: AUTH_OWNER_CONTINUATION_REPORT_2026-11-02.md.

## First Admin subsequent stage

User explicitly approved exact owner UUID/SQL hash, then First Admin transaction executed once. Before5 checks passed; after8 checks passed; source/Editor hash matched. See FIRST_ADMIN_COMPLETION_REPORT_2026-11-02.md and docs/evidence/first-admin-fdmohzvuxvsrcaddbjvl/. Do not rerun owner-as-ordinary-member scripts on this now-Admin account. Current H-series totals:3 PASS /7 PARTIAL /4 BLOCKED /1 FAIL-BLOCKED. B recipient is approved for Auth/verification, but delivery is blocked by built-in recipient restrictions; new SMTP is a proposal only. Admin UI has a stale Cloud-status notice and undefined Overview title recorded as follow-up defects; API connectivity is verified separately.
