# Active database: Supabase PostgreSQL

Supabase Auth is the only identity system. Next.js is the business boundary; normal queries use the publishable key plus verified user JWT and RLS. FastAPI does not hold database credentials. Local Private Storage is the development choice; no image storage cloud upload is implemented.

`0001_foundation.sql` through `0004_quiz_workflow.sql` are migration candidates, NOT executed on cloud. It is tested with an isolated in-process PostgreSQL-compatible PGlite harness using synthetic auth stubs. This does not establish hosted Supabase connectivity, real Auth, SMTP, RLS JWT integration, or production readiness. Do not run the file on an existing project without a separate review/approval and backup.

Keep all MongoDB `../schemas/*.validator.json`, original plans and M1 evidence intact. There is no MongoDB data to migrate. All relational business keys are UUIDs, time is timestamptz, and joins use FKs. Catalog facts are versioned/verified; unverified SPU KK bin colors and locations are not seeded.

Private schema: roles, role membership, account status, quiz answer keys, audit. User metadata cannot assign admin. Column grants restrict profile edits to display_name. AI and quiz authoritative fields have no direct client write grant. Confirmed disposal uses a narrow transactional RPC, verified rule checks, explicit user action and idempotency. A prediction never creates a disposal.

Indexes cover owner/date history, rule item/area, area verification and asset expiry. Additional query-specific indexes require measurements. Raw frames are not saved. No retention/deletion jobs are activated without policy approval. Private image assets must use opaque keys; never absolute Windows paths or Base64 rows.

Remaining integration: atomic prediction persistence RPC/server provenance, hosted validation of quiz grading, full CRUD review workflows, account deletion/retention, source-version immutability workflow, cloud tests and SMTP. The local quiz API is separately functional and does not claim database persistence.
