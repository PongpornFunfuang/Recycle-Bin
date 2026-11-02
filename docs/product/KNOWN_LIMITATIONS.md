# Known limitations and blockers

- BLOCKED: no selected/approved Supabase project/region, credentials or Cloud SQL/Auth configuration. Auth, persistence, RLS through hosted APIs, dashboard/admin end-to-end and email tests are Pending. Product is NOT READY for release.
- BLOCKED: verified SPU_KK rules/bin colors/locations have not been supplied. Map remains empty/Pending; recommendations never guess them.
- AI is a general COCO object detector, not a waste/material classifier. Only two functional photos and one approximate Bottle annotation; crowded scene has false labels/misses. No general accuracy claim.
- Physical Windows Chrome camera inference passed; Android/iOS, multiple cameras, prolonged capture, thermal throttling and constrained network tests remain Pending. Phone cannot use this loopback server remotely without a separately authorized secure networking plan.
- Raw photos are not saved to DB/Storage. History stores result metadata only; image assets/storage tables are reserved for later approved retention work.
- Admin resource lists limited100; published catalog limited200; public knowledge/locations limited100; history20/page. No bulk import, full admin pagination/conflict resolution, multi-campus switcher or advanced full-text relevance ranking is claimed.
- No Google/LINE OAuth configuration. Built-in Supabase email restrictions can block real student onboarding; no SMTP signup/payment/setting change was performed.
- Privacy retention/deletion/export responsibilities and public-use consent remain undecided. No account-deletion action is exposed.
- Accessibility checks are partial; full contrast/screen-reader/WCAG and real phone validation remain before release.
- Pytest records one Starlette/httpx deprecation warning. No automatic global dependency upgrade was made.
- No deployment, public internet listener, Git mutation, driver/toolkit/system setting change or paid service in this round.

## Continuation 2026-11-02

Current continuation evidence is separate at docs/evidence/continuation-2026-11-02. Git status/diff are unavailable because the directory has no Git repository; hashes were used without initialization/reset. Python tests pass with an httpx deprecation warning and a cache-write permission warning; no Windows permissions were changed. The bootstrap SQL template is reviewed but NOT executed against hosted Supabase. No hosted Auth/persistence result or general AI accuracy is claimed.
