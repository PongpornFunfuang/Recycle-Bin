# Operations and recovery

Check web `/api/health/live`, AI `/health/ready`, and DB `/api/health/ready` independently. AI readiness cannot prove Auth/database readiness. Model hash mismatch/missing weights must fail readiness; no random fallback. Stop a failing process, inspect sanitized logs and exact configuration, then restart only that process. Do not replace driver/toolkit or enable public ports.

Backup of original green/cream UI is `backups/pre-blue-white-redesign`. Read its RESTORE.md and manifest before any restore; restoration was not executed. Copy only reviewed paths to a separate staging comparison, use WhatIf first, protect the new design separately, and request approval before overwriting active files. Do not recursively delete, reset Git or move the backup into public. This backup does not include dependencies, model weights, credentials or database state.

Protect local secrets separately using an appropriate private credential store/file access policy. Do not archive raw `.env.local` with evidence. For a compromised server key, rotate in the approved Supabase project, replace local env and restart; review audit events. For HMAC rotation, generate a fresh random local value and restart; pending receipts become invalid, requiring rescan. Do not rotate Cloud settings without approval.

SQL failures: stop immediately, ROLLBACK an open failed transaction, inspect committed version/ledger/hash. Earlier files may already be committed. Never rerun all scripts, drop schemas or delete Auth users to clean up. Use a reviewed forward migration. Database export/restore procedures must be validated for the actual selected plan/project before production; no assumed PITR on Free.

Monitor RAM/VRAM, request latency/429s, GPU temperature and DB/egress quotas. Close unused dev/build/model processes instead of running parallel training. The GPU pipeline is serial; live camera backpressure is intentional. No long-duration thermal certification exists. Free project inactivity pause is a known operational limitation; verify current Dashboard status before tests.

Keep immutable raw test reports and note subsequent reruns/fixes. A source/build pass does not permit public release. Cloud integration and deployment approvals are separate. No automatic backup restore, SQL execution, test-data cleanup or deployment is scheduled.
