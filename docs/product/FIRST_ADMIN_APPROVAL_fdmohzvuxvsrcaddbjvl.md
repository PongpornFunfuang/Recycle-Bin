# First Admin — APPROVED AND EXECUTED ONCE

User explicitly approved this exact target/hash. Executed once on2 November2026 at03:48:49 UTC (10:48:49 ICT), SQL Editor returned Success. Post-checks8 PASS: isAdmin=true, Admin API200, exact target in permissions directory, exactly one operator bootstrap audit with actor_id=NULL, anonymous401 and logout denial. See FIRST_ADMIN_COMPLETION_REPORT_2026-11-02.md and docs/evidence/first-admin-fdmohzvuxvsrcaddbjvl/. **Do not execute again or request this approval again.** The sections below preserve the approved PRE-EXECUTION review; their candidate/pending wording is historical. The SQL source is frozen to its approved hash, including its original comment.

Target: recycle-bin / `fdmohzvuxvsrcaddbjvl`, Organization PongpornFunfuang-2005, Free, Singapore only.

Candidate: the authorized Organization-owner test account, display name `บัญชีทดสอบเจ้าของ`, Auth UUID `a1fbf6f7-0d34-44bf-a071-f265f61dfebb`.

Actual evidence: owner registration and email confirmation succeeded; hosted SDK returned a non-null email_confirmed_at; trigger-created profile is readable; member_access_status is true; current_user_is_admin is false; member /api/admin and admin_set_role are denied. Evidence: owner-hosted-tests.json and owner-confirmed-profile.jpg. Dashboard Users shows the same UUID. No Admin has been created in this continuation.

## Exact proposed operation

File: `database/operations/first_admin_fdmohzvuxvsrcaddbjvl.sql`

SHA-256: `0c64c4ab2075feeef65eea3520b606b82dfc79b8021072c2ab9047ddb9023566`

This is a separately reviewed operator operation, NOT migration0006. Do not rerun0001–0005. It starts a transaction, locks the role/access tables briefly, requires schema5, rejects any existing active Admin, and requires the exact target's confirmed Auth user + profile + active access. It inserts one `admin` role and one operator audit row. Audit actor_id is NULL because SQL Editor is the operator, not the target user's session. Failure must stop and roll back; do not remove a guard or change RLS to proceed.

Granting this role allows the owner account to manage application reference data and member submissions/access through existing Admin APIs. Its ordinary-member test results remain historical evidence from BEFORE promotion. Future A/B member-isolation tests need suitable separately authorized non-Admin identities. This approval does not authorize reading arbitrary mailbox contents, new recipient accounts or test fixture publication.

Local guard checks:3 PASS in an isolated minimal PGlite fixture (unconfirmed/missing target rejected; confirmed active target + operator audit succeed; repeat rejected). This does not prove hosted bootstrap/full Admin CRUD and does not execute any migration. Hosted bootstrap is still PENDING.

## Approval scope and verification

Approve ONLY the exact file/hash and target above on this one project, followed by read-only verification of the role/audit and authenticated Admin access. Recheck project reference/hash immediately before running. If an active Admin already exists or target state differs, stop for review. Do not apply SMTP settings, other Cloud SQL, fixture content, migrations, paid services, credential resets or Deployment under this approval.

After approval: execute once; check /api/member identity isAdmin=true, /api/admin200 and operator audit. Do not mark H12 complete from those checks alone. Any later role revocation/correction requires its own reviewed operation; no automatic delete/rollback of committed user data is included.

**Approval received and operation completed once. SMTP/new SQL/Deployment remain separate; full Admin CRUD is still untested.**
