# Local implementation traceability

| Requirement | Implementation | Evidence / remaining condition |
|---|---|---|
| Real localhost website | web/src/app + responsive global layout | browser-smoke + build; mobile 390px screenshot |
| Supabase PostgreSQL/Auth only | config, SSR server client/proxy, Auth/member/admin APIs | source + local SQL tests; hosted credentials/approval Pending |
| Photo multi-object AI | AI proxy, torch_detector, scanner overlay | actual two-image API tests, positive bottle and multiple bottles |
| Real-time continuous AI | camera frame loop + single-job FastAPI gate | >=3 synthetic-camera frame requests, max1 concurrent; physical Pending |
| Unknown/low confidence/image validation | detection decisions, byte/magic/dimension/quality checks | pytest + API contracts; quality heuristic not validated focus metric |
| Rules independent of AI | catalog guide + recommendations API + verified relational rules | no guessed colors; campus verified facts Pending |
| Predictions separate from disposal | save_scan vs confirm_disposal, distinct tables/API/buttons | transaction/idempotency/no-auto-disposal tests |
| Ownership/RBAC | composite FKs, RLS, private roles/status, admin checks | explicit A/B/anon/admin tests in PGlite; hosted JWT Pending |
| Authentication/recovery | Auth forms/API/callback/proxy | unconfigured states tested; real Auth/SMTP/providers Pending |
| Member history/dashboard/feedback/contact | member UI/API + summary/save RPC | SQL tests, gated UI; cloud persistence Pending |
| Admin catalog/rules/knowledge/quiz/users/review | gated management forms/API + role/status RPC | non-admin rejection, admin access and immutable rule tests; full workflow Pending |
| Knowledge/quiz | local learning cards and API-scored three-question quiz | browser quiz 3/3; DB question editing/private grading tested locally; hosted validation and videos Pending |
| Privacy/storage | in-memory image pipeline; no raw-frame persistence; .gitignore | no cloud images/data, synthetic build-secret check |
| Original protection | baseline and archived revised contract/database readme bytes | file-protection-check + source-inventory |
| Quality gate/deployment | logs/report + explicit NOT_READY | no teacher TC certification, no cloud validation, no real users, no deploy |

The report does not translate these local checks into teacher TC01–TC13 Pass results. Those cases require their full specified inputs and acceptance evidence.
