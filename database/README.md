# Active database: Supabase PostgreSQL

Current schema, RLS design and migration candidates are in `postgres/README.md` and `postgres/0001_foundation.sql` through `0004_quiz_workflow.sql`. None has been executed on Supabase Cloud. Supabase Auth is the sole identity system; normal requests use user JWT and RLS.

MongoDB validators under `schemas/` are retained unchanged as legacy design history. The previous version of this README is archived byte-for-byte in `docs/evidence/contract-baseline/database-README.md`. No MongoDB data/database exists to migrate.

Local SQL/transaction/RLS tests run inside isolated in-process PGlite with synthetic Auth stubs, not the app's active database. Do not substitute those results for real Supabase connectivity, Auth, SMTP or cloud-policy acceptance.

Cloud project creation, migration execution and admin bootstrap require separate user approval. No automatic migration/startup seed is wired into either service.
