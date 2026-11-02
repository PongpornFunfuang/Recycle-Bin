# Reference Data — PARTIAL HOSTED COMPLETE / PIN SAVE STILL BLOCKED

| Table | Before | After | Inserted | Updated | Skipped | Hosted verification |
|---|---:|---:|---:|---:|---:|---|
| areas |0|1|1|0|0|PASS SQL + browser selection|
| bin_types |0|5|5|0|0|PASS SQL + browser selection|
| waste_categories |0|4|4|0|0|PASS SQL + browser selection|

Hosted privileged SELECT confirmed actual empty tables, not hidden API/RLS data. Inserted only user-approved generic choices and officially confirmed campus name. Categories GENERAL/RECYCLABLE/ORGANIC/HAZARDOUS;5 requested container types. No campus buildings/floors/bin coordinates/rules/AI material guesses seeded. Campus source https://khonkaen.spu.ac.th/ ; general taxonomy https://greener.bangkok.go.th/waste-recycle/community-waste-guide/ . Research checked2026-11-02. These sources do not establish university bin-color rules. Bin-type labels are owner-requested administrative choices, not claims about installed campus bins.

Executed SQL is database/seeds/0001a_executed_choices.sql, hash in execution-ledger.json. It is only the choice-table subset of0001_general_reference_choices.sql. data_sources statements in larger prepared file were NOT executed; do not report them seeded. Single transaction with schema5 guard and ON CONFLICT DO NOTHING, no overwrite. Local PGlite test passes repeat execution and Admin-edited name preservation. No old migration repeated.

Browser selected actual campus area, single-bin type, recyclable category. Dropdowns now work from Supabase. Evidence hosted-counts.jpg/dropdowns-cloud.jpg in docs/evidence/reference-data-2026-11-02. Local app used existing Admin session; no new Admin/Auth user created. SQL editor initial SELECT replacement produced a syntax error; corrected and SELECT succeeded before Seed. Long editor text was truncated on extraction; used short exact-match normalized SQL before Run. No unknown SQL version executed.

Still outstanding: Catalog/knowledge/quiz/general-guidance content and source metadata import, actual model-class mapping review, private multi-device Storage, security fixes and Hosted0006–0007, isolated Browser save/reload/verify E2E and final full tests. Latest Hosted schema remains5; actual locations0. Save remains correctly disabled; no false PASS or Seed Complete claim for all modules. Existing Admin areas/bin-types/categories pages provide create/edit/archive and reuse API/RLS; full CRUD browser retest NOT TESTED here. No deployment/SMTP/email or credentials operation.

Missing-data inventory: A general categories/bin choices now populated; catalog/articles/quiz remain empty and eligible for researched import. B campus area name populated from official site; bin positions/buildings/local disposal rules remain user-survey-only. C history/feedback/profile/activity must arise from authorized users, never seeded. D prediction/quiz scores/dashboard counts must arise from real operations, never fabricated.
