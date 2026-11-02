# Cloud SQL Approval — recycle-bin / fdmohzvuxvsrcaddbjvl

**Project CREATED / SQL NOT EXECUTED / EXPLICIT SQL APPROVAL REQUIRED**

- Organization: PongpornFunfuang-2005 (`eglhhcovwcnnceprvlfx`), Free
- Project: recycle-bin (`fdmohzvuxvsrcaddbjvl`)
- Region: Singapore (`ap-southeast-1`), Postgres DEFAULT / Nano
- URL: https://fdmohzvuxvsrcaddbjvl.supabase.co
- Dashboard: https://supabase.com/dashboard/project/fdmohzvuxvsrcaddbjvl
- Project creation explicitly approved by user; Dashboard now shows Healthy, No migrations, No backups. public Table Editor shows No tables or views.

## Fresh-data precondition — must verify before any DDL

The project was created in this session. Auth Users view shows "No users in your project" but also "Total:10 users (estimated)". The inconsistent estimate is NOT proof of zero users. No raw SQL has been run, including SELECT. Request approval for the following read-only preflight first, followed by conditional migration execution ONLY when all fresh-project checks pass:

```sql
select table_schema,table_name from information_schema.tables
where table_schema in ('public','private') and table_type='BASE TABLE'
order by table_schema,table_name;
select count(*) as auth_user_count from auth.users;
select to_regnamespace('private') as existing_private_schema;
```

Conditions: no application base tables in public/private; auth_user_count=0; private schema absent. If any condition fails or the query errors, STOP before migrations, preserve data and report. Do not delete/backfill/reset or use the old Seoul project. Built-in managed auth/storage/system objects are expected and will not be dropped.

## Exact approved candidate set — source hashes must match before each Run

| Order | database/postgres file | SHA256 |
|---|---|---|
| 1 | 0001_foundation.sql | `4ec71fc39f989962ae9acace0d1f6509341704daee5a4bb3c96e5e534824629b` |
| 2 | 0002_admin_workflow.sql | `c616550531ea6773cd23ddfd3b8253856ce02b4dc644af2069284a6fa01a7526` |
| 3 | 0003_member_workflow.sql | `5178d1e87d24b6feed756e5b1f5d53e2064808cdd0a40e62cbb30f587ef02747` |
| 4 | 0004_quiz_workflow.sql | `44c7946584d66a47455a4c0fea81896fc16b8441812121c87869883ed25e24f5` |
| 5 | 0005_product_hardening.sql | `feb76b37c73c986dcee9dccde36cc0d44d02e67b81e7b16cf292ee2a89d73c09` |

Dependencies: managed auth.users/auth.uid and anon/authenticated/service_role; ordinary PostgreSQL; no MongoDB, OrioleDB, driver or paid extension. Schema candidate has37 RLS-enabled application tables,211 columns,325 constraints,81 indexes,52 policies.0001 adds the profile/member/access trigger on auth.users.0002 adds checked member administration/rule version protection.0003 adds historical client_reported snapshots;0005 revokes its arbitrary client write path.0004 provides private quiz keys/grading;0005 adds checked writer, explicit disposal snapshots/material validation, admin audit/review/archive/link RPCs and immutable rule-relationship triggers.

Public access is restricted to intended published/verified reference data; owner reads are isolated. Roles/audit/answer keys stay private. New schema does not create an Admin, register a test user, guess campus data or store images. Model registry metadata/health/version/role definitions are intentional seeds, not student/campus fixtures.

## Execution and recovery scope

Run files once, in order, with their existing BEGIN/COMMIT and no edits. Record target/hash/time/result per file locally. Check product_health/version5, tables/RLS/grants/functions/triggers and schema cache afterward using read-only queries. Do not rerun a committed file or disable RLS on failure. On error stop, roll back an open failed transaction, report committed files and request a reviewed forward fix.

Fresh empty project baseline is represented by UI evidence + approved read-only preflight. No user data may be present before execution. Free Dashboard reports No backups; no PITR or automated restore is assumed. A transaction rolls back ONLY its own file; prior committed files remain. There is no destructive down script and no approval for DROP/TRUNCATE/project reset/user deletion.

Approval requested: read-only preflight, conditional exact0001→0005 execution if fresh checks pass, then read-only schema validation on this project ONLY. Excludes Auth provider/redirect/email settings, first Admin creation, paid services, other projects and website deployment. Hosted E2E remains Pending after DDL until separate Auth/config/test-account approvals.
