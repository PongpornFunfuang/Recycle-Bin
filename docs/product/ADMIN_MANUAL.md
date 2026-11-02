# Admin manual

Requires real configured Supabase, a trusted bootstrap and server-confirmed active admin role. A visible route or hidden button is never the authorization boundary. Until configured, Admin displays the real unavailable state.

Overview queries real counts. Resource sections create/edit materials, categories, items, source references, areas, bin types/bins, locations, rules, knowledge and quiz sets. No seed records represent a real campus. Keep evidence unverified until checked by a responsible reviewer.

Create the area code SPU_KK only with approved source data. Add verified source/time, then published item and linked material. Add bin type, actual bin code/color/source and actual location coordinates/source. Link locations to bins in เชื่อมโยงข้อมูล; composite FKs reject different areas. Archived records are retained and can be restored subject to validation; there is no hard-delete action.

Rules: create Draft with steps, source, area/item and optional material. A new group UUID is generated server-side when blank. Use the existing group for a subsequent version. Link bins while Draft; verify only after all evidence is correct. Verified/retired content cannot be rewritten. Use สร้างเวอร์ชันใหม่ to preserve group/history. Multiple ambiguous rules are not chosen automatically. Retire or archive records rather than changing historical facts. Existing disposal snapshots remain unchanged.

Knowledge is plain text, not arbitrary HTML. Video kind is text content/reference, not a streaming/video-upload subsystem. Quiz: create Draft, add question choices and private answer/explanation, then publish. The server blocks incomplete publication and editing questions already used for scoring; create a new version instead. Ordinary quiz responses contain no private answer keys.

Users: review active/suspended state, grant/revoke admin for another approved account. Self-role/status changes are blocked to prevent lockout; bootstrap and exceptional recovery require an authorized operator. Never elevate by editing profile metadata. Review feedback/contact status as new/in progress/resolved. Audit shows actor/entity/event/time and changed column names, not secret values or message copies.

Current admin list/query limit is100 per resource; it is not a bulk-import or unlimited back-office browser. Hosted admin CRUD, review, relation and versioning flows still require the approved integration tests. Avoid multiple administrators concurrently editing the same draft until conflict resolution behavior is reviewed.

## Continuation 2026-11-02

Draft rule-bin/source links are now protected by database triggers, including direct table writes, and audited. Editing a verified rule requires a new version even when changing only its bin/source relationships. Clone form population and error recovery have isolated browser regression evidence. Use FIRST_ADMIN_REVIEW_TEMPLATE.md only after target-specific Cloud approval; it is not an automatic admin registration mechanism.
