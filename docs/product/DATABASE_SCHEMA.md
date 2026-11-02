# PostgreSQL schema and integrity

Source of truth: `database/postgres/0001_foundation.sql` through `0005_product_hardening.sql`. Full generated local catalog: [schema-catalog.json](schema-catalog.json), including every column/default/nullability, PK/FK/check/unique constraint, index, RLS flag and policy. This catalog is generated from PGlite, not from hosted Supabase.

| Domain | Tables and important keys |
|---|---|
| Identity | auth.users → profiles(id PK/FK); private.roles(code PK), private.user_roles(user_id,role_code composite PK); private.user_access(user_id PK/FK) |
| Catalog | areas(id PK, code unique); material_categories/waste_categories(id PK, slug unique); waste_items(id PK, slug unique, nullable category_id FK added0005); item_materials(item_id,material_id PK/FKs) |
| Evidence | data_sources(id PK, verified state/time); bin_types; waste_bins(id PK, unique area/code and id/area); bin_accepted_categories composite PK |
| Geography | locations(id PK, coordinate bounds, id/area unique); location_bins composite PK + paired area FKs prevent cross-area links |
| Recommendations | disposal_rules(id PK, rule_key/version unique, item/area/source FKs); rule_bins same-area composite FKs; rule_sources composite FKs |
| AI | model_versions(id PK, unique version); scan_sessions(id,user_id unique); image_assets reserved private asset metadata; ai_predictions(id PK, owner/request unique, paired owner session/asset FKs); ai_detections(id PK, confidence/box checks, owner/prediction composite FK); prediction_recommendations reserved snapshots |
| Disposal | confirmed_disposals(id PK, owner/client_event unique, quantity1–100, confirmed=true, owned detection/prediction FK); material_id and immutable rule_snapshot added0005 |
| Learning | knowledge_entries; quizzes(slug/version unique); quiz_questions(quiz/position unique); private.quiz_answer_keys(question FK/PK); quiz_attempts(owner/event unique); quiz_answers(attempt/question PK + owner/quiz composite FKs) |
| Messages/audit | feedback, ai_feedback, contact_messages owner FKs; private.audit_logs actor/entity/event/time; 0005 adds review queue fields and audit table/changed-column metadata |
| Health/version | m1_health; recyclebin_schema_version(version PK), readonly minimal product_health() |

All37 public/private base tables enable RLS in the local catalog. Private schemas are not a public API surface. Owners can read only their private records; only display_name is directly profile-updateable. Roles/status are separate from profile metadata. AI/results/scores/confirmed disposals have no ordinary client direct-write grant; their approved functions enforce invariants. Authenticated feedback/contact INSERT is column-limited so review state cannot be spoofed.

Public reads require active published/verified source data. Verified locations also need timestamp and coordinates; older locations without these fields become hidden until reverified. Archived records remain in the DB for audit/history. No hard-delete admin control is exposed. `on delete cascade` from Auth in the historical schema is significant: never delete users as a routine rollback.

Indexes include owner/time history, status/public lookups, rule item/area/version, FK support, new category/source and review/audit queues; PK/unique constraints create indexes too. Current local catalog lists81 indexes and325 constraints. See generated catalog for exact definitions; hosted query plans and real data-volume tuning remain pending.
