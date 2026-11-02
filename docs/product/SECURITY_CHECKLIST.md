# Security review

| Control | Local state / evidence |
|---|---|
| Backups before UI |61 exact snapshot copies; manifest and final hash check; no automatic restore |
| Secrets | env excluded from backup/public; server-only privileged client; known-value/static-canary scan in final-security-backup.json |
| Input | Zod business contracts; bounded JSON streams; type/size/magic/dimension image checks |
| CSRF/origin | Mutating Next APIs compare Origin with validated loopback Host; cross-origin denied in tests |
| Auth | getUser server verification, SSR refresh/protected pages; invalid/missing config never fake success |
| Owner isolation | Owner RLS + composite FKs, explicit user from session, A/B local synthetic tests |
| Admin escalation | Roles/access private, fixed search_path definer functions, self-role/status protection |
| Predictions | Legacy arbitrary save revoked; HMAC owner/content/expiry; actual-model hash registry; service writer only |
| Disposal | Explicit true flag, validated rule/material/owner, atomic audit/snapshot, immutable historical facts |
| Quiz | Keys private, GET no keys, server grading, answers bounded, concurrent event lock, used question immutability |
| Public data | Only active published/verified references, coordinates/time required, no invented campus facts |
| Browser | nosniff, same-origin referrer, frame DENY, camera self/microphone disabled; plain text content |
| Networking | Local servers loopback, AI URL rejects nonloopback, no public access/deploy |

Earlier same-session package audits report0 known npm advisories and0 queried Python advisories; see original npm-audit.json and Python audit artifacts under docs/evidence. No new package versions were installed for this redesign. This is advisory-database evidence, not a guarantee that dependencies/CUDA binaries are vulnerability-free. Font license is OFL with provenance.

Outstanding release checks: hosted default grants/PostgREST roles, Auth delivery/expiry/recovery, RLS over actual Supabase APIs, credential rotation procedure, account retention/deletion/export policy, sustained rate/resource limits, CSP evaluation, full keyboard/screen-reader/color-contrast audit and real phone devices. Local Accessibility checks are limited to landmarks/language/form labels/skip link/overflow. No claim of full WCAG compliance or completed penetration test.

Server Secret keys inherently bypass RLS. A leak would require immediate key rotation and review; the application limits their use to the verified scan insert RPC but cannot reduce the key's platform privilege. Rotate HMAC by changing the local secret and restarting; outstanding five-minute receipts then expire by signature mismatch, while saved records remain. Never log request tokens, passwords, image bytes or env contents. No private image bucket or original image persistence is enabled.

## Continuation 2026-11-02

Confirmed local issue: verified rule relationships could bypass version protection via direct admin INSERT grants. Fixed in candidate0005 with row-locking parent-state triggers plus audit triggers; regression now passes for inserts/updates/deletes. API rejects invalid scanner modes and corrupt images; practice request bodies are bounded. This does not certify hosted grants/RLS/default privileges. No new dependency, credential, driver, system permission or Cloud setting was installed/changed.
