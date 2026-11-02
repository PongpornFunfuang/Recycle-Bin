# Recycle Bin — Product Requirements

Status: LOCAL IMPLEMENTATION / HOSTED INTEGRATION PENDING / NOT RELEASE READY.

Primary users are students and staff of SPU Khon Kaen. The product helps inspect objects, clarify material, consult verified local disposal rules, and learn. A detected object is never proof that waste was disposed of.

| ID | Required behavior | Implementation / validation |
|---|---|---|
| P01 | Blue/white Thai mobile-first UI matching supplied poster | Shared tokens, SVG mascot, navigation; real screenshots before/after |
| P02 | Photo multi-object inference | Actual local Faster R-CNN; file validation, preview, boxes, confidence, unknown/error |
| P03 | Camera multi-object inference | Sequential frames, throttle, start/stop, frozen snapshot re-inference, cleanup |
| P04 | Real account lifecycle | Supabase SSR register/login/logout/callback/recovery; hosted verification pending |
| P05 | Owner-only saved results | Authenticated HMAC-bound result, privileged server RPC, RLS read isolation |
| P06 | Explicit disposal | Separate confirmation, quantity/material, immutable rule/source snapshot, idempotent event |
| P07 | Real statistics | Owner-filtered DB summary, Bangkok daily series; no random counters or impact estimates |
| P08 | Waste guide/categories/detail | Published DB data plus visibly identified authored general guidance; material clarification |
| P09 | Knowledge/learning | Published articles, private server scoring, owner learning history; practice exercises separate |
| P10 | Verified map | Only verified source-backed locations; no guessed coordinates/markers/bin colors |
| P11 | Contact/feedback/issues | Authenticated persistence and owner history; admin review |
| P12 | Admin | Server+DB authorization, catalog/rules/knowledge/quizzes, roles/status, archives, links, audit |
| P13 | Protection and evidence | Backup hashes, bounded input, RLS/transactions, local tests; hosted gate pending |

Release acceptance requires actual A/B user accounts, email delivery/recovery, RLS enforcement through Supabase APIs, persistence after process restart, verified campus rules and coordinates, admin end-to-end flows, real mobile browser review and no unresolved critical issue. A local PGlite pass does not satisfy these hosted requirements.

No automatic image retention, carbon savings estimates, OAuth, cloud model inference, public hosting or paid service is included in this round. Camera images remain in memory; explicit browser snapshot download is controlled by the user. Account deletion/export policy and retention periods require owner decisions before public use.
