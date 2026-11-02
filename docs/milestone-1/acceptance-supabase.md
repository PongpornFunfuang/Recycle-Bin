# M1 acceptance revision — Supabase local foundation

This revision supersedes active MongoDB requirements without changing the historical acceptance register or completion report. Actual statuses are in LOCAL_DEVELOPMENT_REPORT and verification-results.json.

| ID | Criterion |
|---|---|
| M1-AC01 | Six protected originals unchanged; prior M1 evidence and Mongo validators preserved; three active contract originals archived before revision |
| M1-AC02 | Local source/runtime only, no cloud SQL/project/deploy/commit/push/remote/system changes |
| M1-AC03 | Locked JS/Python dependencies, version/peer/license inventory; npm audit recorded; Python advisory audit distinguished |
| M1-AC04 | Project Python venv; no global installation |
| M1-AC05 | All schema wrappers/OpenAPI references compile/resolve; actual AI/health payloads validate; relational constraints tested |
| M1-AC06 | Next.js -> hosted Supabase connection/authenticated query (Pending without project/approval/config) |
| M1-AC07 | Local PostgreSQL transaction commit/abort/idempotency/isolation tests; hosted Supabase repetition separately Pending |
| M1-AC08 | Actual synchronized CUDA tensor operations; not a substitute for model inference tests |
| M1-AC09 | Next/FastAPI HTTP health and real AI proxy, responsive localhost website |
| M1-AC10 | Missing/failed model reports unavailable; GPU detection alone cannot mark AI ready. Actual model enabled under later M4 authorization |
| M1-AC11 | Loopback apps, approved cloud config boundary, publishable-only public config, cross-origin rejection, RLS negative tests, no private secrets in client build |
| M1-AC12 | Build/typecheck/automated tests with real saved outputs; hosted tests and physical-camera acceptance not silently waived |

M1 cannot be declared fully complete while AC06 and hosted validation are pending. Local foundation can be demo-ready independently. No TC01–TC13 or deployment approval is inferred.
