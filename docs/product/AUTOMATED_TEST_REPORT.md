# Automated test report

Captured: 2026-11-01T16:22:44.153Z. Local only; no hosted changes.

| Check | Result | Evidence |
|---|---|---|
| typecheck | PASS | ../evidence/product/typecheck.log |
| node-tests | PASS | ../evidence/product/node-tests.log |
| python-tests | PASS | ../evidence/product/python-tests.log |
| browser-smoke | PASS | ../evidence/product/browser-smoke.log |
| camera-synthetic | PASS | ../evidence/product/camera-synthetic.log |
| production-build | PASS | ../evidence/product/production-build.log |

Node tests: 44 passed; Python tests: 7 passed with one recorded Starlette/httpx deprecation warning. No skipped test is counted as a pass.

SQL tests apply0001–0004 separately for historical regression, and0001–0005 for the active candidate. New tests cover forged-write rejection, registered-model save, metadata validation, atomic invalid-child rollback, owner isolation, explicit confirmation, material condition, immutable snapshot/retry after retirement, reviewer spoofing, admin review/roles, private grading, empty quiz publication and safe migration reapply rejection. Auth is a synthetic local stub; these are not hosted Supabase tests.

Browser smoke checks actual routes/search/practice grading/photo inference and reports page errors. Practice3/3 is not an account quiz result. Synthetic camera proves sequential requests, snapshot and stopped tracks; physical-device evidence is separate in physical-camera-inference.json (3 real frames, tracks closed, no later requests). No camera images or labels were retained.

Responsive/accessibility evidence: responsive-accessibility-camera.json (39 route/viewport cases at390/768/1440, form labels/landmarks/lang/skip link/overflow). UI screenshots:16 before and16 after, plus6 Home/Login shell-gate captures. These are actual browser screenshots. Full WCAG/screen-reader/contrast audit and real Android/iOS remain Pending.

AI result measurements and one-image approximate Bottle ground truth are in ai-evaluation.json and ground-truth-bottle.json. No overall model accuracy is claimed. Final backup/known-secret/build-canary scan is final-security-backup.json. Hosted Auth/email/persistence/admin/RLS tests are all Pending; see INTEGRATION_TEST_REPORT.md.

An initial sandbox run failed Windows userInfo (tsx) and a synthetic-camera timeout. The approved outside-sandbox rerun passed. Final verification-results.json and logs contain the successful final run; no failure was relabeled without a rerun.

## Continuation 2026-11-02

Latest local continuation results and exact changed-file list: [CONTINUATION_REPORT_2026-11-02.md](CONTINUATION_REPORT_2026-11-02.md). Earlier evidence under docs/evidence/product is preserved. No hosted operation or deployment was performed; release remains NOT READY.
