# Private Evidence security progress — INCOMPLETE / NO HOSTED APPLY

Continued P0 without reseeding reference tables. Added candidate0007a_private_evidence.sql: private bucket8MB/jpeg/png/webp, evidence registry owner/path binding, Admin upload/read, verified-location image read only, unused owner deletion policy, RPC object existence helper joining storage.objects with MIME/size. Evidence API now uses Supabase session Storage rather than local disk. Public photo resolves through a checked RPC. Removed local-file precondition from Verify API.

Updated0007 save to require owned existing object when photo supplied; verify requires actual object and rejects shared source with other location/rule. Bin source must match pin source rather than implicitly approving unrelated source. No claim that all source/junction lifecycle gaps resolved.

Actual Typecheck PASS. Isolated PGlite DB suite PASS6 before and after direct idempotency assertions. Test includes identical request same ID; changed payload same request rejected; unknown photo UUID rejected; pending2bin save, missing-evidence verification denial, verified public row, member denial, coordinate edit→pending, archive. Storage schema/object metadata are SYNTHETIC TEST scaffolding, not actual Hosted upload/network/blob tests. No Cloud bucket, Storage policy or Migration applied. Production Storage readiness NOT TESTED.

Execution order for candidate is0006→0007a→0007 (0007a references0006 columns). Historical docs saying0006→0007 alone are stale. Hashes in candidate-hashes.json. Hosted latest verified schema5;1 area/5bin types/4categories already seeded and must not be seeded again. Real locations0 as prior verified SQL, no fake production pins.

Remaining blockers before Apply: full invalidation on bin/category/junction edits, direct-table Admin bypass/evidence constraints and row lifecycle audit review, upload-file decode vs signature security, orphan cleanup recovery, current-bucket collision checks, actual Supabase storage schema compatibility verification, isolated full Browser E2E and latest final suites. Candidate should not be applied merely because6localtests passed. No credential or SMTP changes, no mail, noDeploy.

P1 content seed remains undone beyond earlier choices: Catalog/knowledge/quiz/general guidance/source metadata. AI model remains existingFasterRCNN; no candidate training/change or accuracy improvement claimed. Need labeled heldout testset and baseline metrics before any model replacement. Existing functional inference tests are not accuracy metrics.
