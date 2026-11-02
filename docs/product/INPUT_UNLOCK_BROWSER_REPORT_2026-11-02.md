# Urgent input fix — browser verified / overall work INCOMPLETE

Root cause: SelfPinningAdmin fieldset disabled={busy||!available} locked every field while Hosted schema remained5. Fixed outer fieldset to busy-only. Save remains disabled when schema unavailable or coordinates absent, with explicit aria-describedby status and warning that unsaved in-page draft will not survive reload. No local persistence is falsely represented as DB save.

File modified: web/src/components/self-pinning-admin.tsx. Original protected under backups/input-unlock-2026-11-02. Date input additionally handles onInput because browser test showed filled date was lost on rerender; retest date2026-11-02 remained after editing another field.

Actual browser PASS: name,building,floor,zone,reference,notes,bin-code typed; yellow color selected; second bin added; click and drag updated coordinates while typed text remained. Screenshot docs/evidence/input-unlock-2026-11-02/form-editable.jpg. These values were UNSAVED UI checks only, never inserted on Hosted production.

Dropdown availability: Hosted areas/bin_types/waste_categories returned empty. UI now names each missing reference set, no fabricated options. Therefore cannot claim selecting actual area/type/category PASS. Save/Reload persistence/Evidence/Verify/StudentMap complete E2E NOT TESTED; Save explicitly blocked until safe migrations/storage complete. No upload was attempted this continuation. Mobile/a11y beyond labels/save description NOT TESTED latest.

Typecheck PASS; latest build log in evidence directory. Earlier other-suite results do not count as full validation of this exact final change.

Remaining work from authorized prompt: private Supabase evidence Storage with ownership/actual object verification, secure RPC source/relationship invalidation and direct idempotency assertions, isolated complete browser E2E, reviewed0006–0007 Hosted Apply with fresh preflight, real options administration, final tests, SMTP non-secret preparation/user credential handoff. Existing blanket approval remains valid; no need repeat approval for safe in-scope work. No Cloud migration/SMTP/email/deploy occurred here. Latest observed Hosted schema5/real locations0/bins0 from preceding preflight; not freshly recounted this UI round. Overall NOT COMPLETE / NOT PRODUCT READY.
