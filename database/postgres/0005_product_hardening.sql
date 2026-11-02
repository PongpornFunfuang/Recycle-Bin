-- Forward-only product hardening. Requires 0001--0004. No Cloud execution authorized.
-- No original tables/rows are dropped. New nullable metadata preserves old records.
begin;
do $$begin
 if to_regclass('public.quiz_answers') is null or to_regprocedure('public.grade_quiz(uuid,uuid,jsonb)') is null then raise exception 'apply_0001_through_0004_first';end if;
 if to_regclass('public.recyclebin_schema_version') is not null then raise exception 'migration_0005_already_applied_review_ledger';end if;
end;$$;
create table public.recyclebin_schema_version(version integer primary key,applied_at timestamptz not null default now());
alter table public.recyclebin_schema_version enable row level security;
revoke all on public.recyclebin_schema_version from public,anon,authenticated;
insert into public.recyclebin_schema_version(version) values(5);
create function public.product_health() returns jsonb language sql stable security definer set search_path='' as $$select jsonb_build_object('schemaVersion',version) from public.recyclebin_schema_version where version=5;$$;
revoke all on function public.product_health() from public;
grant execute on function public.product_health() to anon,authenticated;

do $$declare t text;begin
 foreach t in array array['areas','material_categories','waste_categories','bin_types','waste_items','data_sources','waste_bins','locations','disposal_rules','knowledge_entries','quizzes'] loop
 execute format('alter table public.%I add column archived_at timestamptz',t);
 end loop;
end;$$;
alter table public.locations add column verified_at timestamptz;
alter table public.waste_items add column category_id uuid references public.waste_categories(id);
create index waste_item_category on public.waste_items(category_id);
alter table public.confirmed_disposals add column material_id uuid references public.material_categories(id);
alter table public.confirmed_disposals add column rule_snapshot jsonb;
alter table public.feedback add column kind text not null default 'feedback' check(kind in ('feedback','issue'));
alter table public.feedback add column review_status text not null default 'new' check(review_status in ('new','in_progress','resolved'));
alter table public.feedback add column reviewed_at timestamptz;
alter table public.contact_messages add column review_status text not null default 'new' check(review_status in ('new','in_progress','resolved'));
alter table public.contact_messages add column reviewed_at timestamptz;
alter table private.audit_logs add column entity_table text;
alter table private.audit_logs add column changed_fields text[];
create index rules_source_fk on public.disposal_rules(source_id);
create index rule_bins_area on public.rule_bins(area_id);
create index location_bins_area on public.location_bins(area_id);
create index feedback_review_queue on public.feedback(review_status,created_at desc);
create index contact_owner_time on public.contact_messages(user_id,created_at desc);
create index contact_review_queue on public.contact_messages(review_status,created_at desc);
create index audit_time on private.audit_logs(created_at desc,id);

-- Public reference data must be active; admin policies still permit review of archives.
do $$declare t text;begin
 foreach t in array array['areas','material_categories','waste_categories','bin_types'] loop
 execute format('alter policy reference_read on public.%I using(archived_at is null)',t);
 end loop;
end;$$;
alter policy published_read on public.waste_items using(status='published' and archived_at is null);
alter policy published_read on public.data_sources using(verification_status='verified' and archived_at is null);
alter policy published_read on public.knowledge_entries using(status='published' and archived_at is null);
alter policy published_read on public.quizzes using(status='published' and archived_at is null);
alter policy published_read on public.waste_bins using(verification_status='verified' and archived_at is null and exists(select 1 from public.data_sources s where s.id=source_id and s.verification_status='verified' and s.archived_at is null) and exists(select 1 from public.areas a where a.id=area_id and a.archived_at is null));
alter policy published_read on public.locations using(verification_status='verified' and verified_at is not null and latitude is not null and longitude is not null and archived_at is null and exists(select 1 from public.data_sources s where s.id=source_id and s.verification_status='verified' and s.archived_at is null) and exists(select 1 from public.areas a where a.id=area_id and a.archived_at is null));
alter policy published_read on public.disposal_rules using(status='verified' and archived_at is null and exists(select 1 from public.data_sources s where s.id=source_id and s.verification_status='verified' and s.archived_at is null) and exists(select 1 from public.areas a where a.id=area_id and a.archived_at is null) and exists(select 1 from public.waste_items i where i.id=item_id and i.status='published' and i.archived_at is null));
revoke insert on public.feedback,public.contact_messages from authenticated;
grant insert(user_id,message,kind) on public.feedback to authenticated;
grant insert(user_id,subject,message) on public.contact_messages to authenticated;

create or replace function private.protect_rule_version() returns trigger language plpgsql set search_path='' as $$begin
 if old.status in ('verified','retired') then
  if (to_jsonb(old)-'status'-'archived_at') is distinct from (to_jsonb(new)-'status'-'archived_at') or (old.status='retired' and new.status<>'retired') or (old.status='verified' and new.status not in ('verified','retired')) then raise exception 'create_new_rule_version';end if;
 end if;return new;
end;$$;
create function private.validate_verified_fact() returns trigger language plpgsql security definer set search_path='' as $$
declare doc jsonb;source uuid;begin
 doc:=to_jsonb(new);
 if doc->>'archived_at' is not null then return new;end if;
 if coalesce(doc->>'verification_status',doc->>'status')='verified' then
  source:=(doc->>'source_id')::uuid;
  if source is null or not exists(select 1 from public.data_sources where id=source and verification_status='verified' and archived_at is null) then raise exception 'verified_source_required';end if;
  if doc->>'verified_at' is null then raise exception 'verification_time_required';end if;
  if not exists(select 1 from public.areas where id=(doc->>'area_id')::uuid and archived_at is null) then raise exception 'active_area_required';end if;
  if tg_table_name='locations' and (doc->>'latitude' is null or doc->>'longitude' is null) then raise exception 'verified_coordinates_required';end if;
  if tg_table_name='disposal_rules' then
   if not exists(select 1 from public.waste_items where id=(doc->>'item_id')::uuid and status='published' and archived_at is null) or jsonb_array_length(doc->'steps')<1 then raise exception 'published_item_and_steps_required';end if;
   if jsonb_typeof(doc->'conditions') is distinct from 'object' or (select count(*) from jsonb_object_keys(doc->'conditions'))>1 or exists(select 1 from jsonb_object_keys(doc->'conditions') k where k<>'material_id') then raise exception 'unsupported_rule_condition';end if;
   if doc->'conditions' ? 'material_id' and not exists(select 1 from public.item_materials m join public.material_categories c on c.id=m.material_id where m.item_id=(doc->>'item_id')::uuid and m.material_id=(doc->'conditions'->>'material_id')::uuid and c.archived_at is null) then raise exception 'material_not_linked_to_item';end if;
  end if;
 end if;return new;
end;$$;
revoke all on function private.validate_verified_fact() from public;
create trigger validate_bin_fact before insert or update on public.waste_bins for each row execute function private.validate_verified_fact();
create trigger validate_location_fact before insert or update on public.locations for each row execute function private.validate_verified_fact();
create trigger validate_rule_fact before insert or update on public.disposal_rules for each row execute function private.validate_verified_fact();
create function private.audit_catalog_change() returns trigger language plpgsql security definer set search_path='' as $$declare fields text[];begin
 if tg_op='UPDATE' and to_jsonb(old)=to_jsonb(new) then return new;end if;
 select array_agg(k) into fields from jsonb_object_keys(to_jsonb(new)) k where tg_op='INSERT' or (to_jsonb(new)->k) is distinct from (to_jsonb(old)->k);
 insert into private.audit_logs(actor_id,event,entity_id,entity_table,changed_fields) values(auth.uid(),lower(tg_op)||'_'||tg_table_name,(to_jsonb(new)->>'id')::uuid,tg_table_name,fields);return new;
end;$$;
revoke all on function private.audit_catalog_change() from public;
do $$declare t text;begin
 foreach t in array array['areas','material_categories','waste_categories','bin_types','waste_items','data_sources','waste_bins','locations','disposal_rules','knowledge_entries','quizzes'] loop
 execute format('create trigger record_catalog_audit after insert or update on public.%I for each row execute function private.audit_catalog_change()',t);
 end loop;
end;$$;

-- Keep old client-reported data, but block new arbitrary client predictions.
revoke all on function public.save_scan(jsonb) from public,anon,authenticated;
insert into public.model_versions(version,artifact_sha256,manifest) values('fasterrcnn-resnet50-fpn-v2-coco-dd69338a','dd69338a24b8d7381807e247652bdc356325bcbaf1cd3e092e00e0a1a58706bf','{"source":"https://download.pytorch.org/models/fasterrcnn_resnet50_fpn_v2_coco-dd69338a.pth","license":"BSD-3-Clause (torchvision)","coverage":"COCO 80 object classes; not material or bin classification"}') on conflict(version) do nothing;
create function public.persist_verified_scan(p_user uuid,p_result jsonb) returns uuid language plpgsql security definer set search_path='' as $$
declare prediction uuid;existing public.ai_predictions%rowtype;d jsonb;model uuid;item uuid;label text;begin
 if p_user is null or not exists(select 1 from private.user_access where user_id=p_user and status='active') then raise exception 'active_owner_required';end if;
 if p_result is null or jsonb_typeof(p_result) is distinct from 'object' or p_result->>'schemaVersion' is distinct from '1.1' or jsonb_typeof(p_result->'detections') is distinct from 'array' or jsonb_array_length(p_result->'detections')>100 or pg_column_size(p_result)>150000 or p_result->>'inferenceLocation' is distinct from 'local_server' then raise exception 'invalid_result';end if;
 if not (p_result ?& array['mode','sceneDecision','quality','imageWidth','imageHeight','modelVersion','artifactSha256','predictionId']) or p_result->>'mode' is null or p_result->>'mode' not in ('photo','live_snapshot') or p_result->>'sceneDecision' is null or p_result->>'sceneDecision' not in ('detected','uncertain','unknown') or p_result->>'quality' is null or p_result->>'quality' not in ('ok','dark','possibly_blurry') or coalesce((p_result->>'imageWidth')::integer,0) not between 1 and 20000 or coalesce((p_result->>'imageHeight')::integer,0) not between 1 and 20000 then raise exception 'invalid_result_metadata';end if;
 if exists(select 1 from jsonb_object_keys(p_result) k where k not in ('schemaVersion','requestId','predictionId','mode','inferenceLocation','frameId','sceneDecision','imageWidth','imageHeight','detections','modelVersion','artifactSha256','classMapVersion','policyVersion','historySaved','latencyMs','quality')) then raise exception 'unexpected_result_fields';end if;
 prediction:=(p_result->>'predictionId')::uuid;
 if prediction is null then raise exception 'prediction_id_required';end if;
 perform pg_advisory_xact_lock(hashtextextended('scan:'||p_user::text||prediction::text,0));
 select * into existing from public.ai_predictions where user_id=p_user and request_key=prediction;
 if found then if existing.result_snapshot is distinct from p_result then raise exception 'idempotency_conflict';end if;return existing.id;end if;
 select id into model from public.model_versions where version=p_result->>'modelVersion' and artifact_sha256=p_result->>'artifactSha256';
 if model is null then raise exception 'model_not_registered';end if;
 insert into public.ai_predictions(id,user_id,request_key,model_version_id,mode,provenance,quality,status,result_snapshot) values(prediction,p_user,prediction,model,p_result->>'mode','server_verified',p_result->>'quality',p_result->>'sceneDecision',p_result);
 for d in select value from jsonb_array_elements(p_result->'detections') loop
  label:=d->>'label';select id into item from public.waste_items where slug=case when label in ('banana','apple','sandwich','orange','broccoli','carrot','hot dog','pizza','donut','cake') then 'food' else label end and status='published' and archived_at is null;
  insert into public.ai_detections(id,prediction_id,user_id,class_key,label,item_id,confidence,decision,x_min,y_min,x_max,y_max) values((d->>'detectionId')::uuid,prediction,p_user,d->>'classId',label,item,(d->>'confidence')::double precision,d->>'decision',(d->'box'->>'xMin')::double precision,(d->'box'->>'yMin')::double precision,(d->'box'->>'xMax')::double precision,(d->'box'->>'yMax')::double precision);
 end loop;
 insert into private.audit_logs(actor_id,event,entity_id,entity_table) values(p_user,'verified_scan_saved',prediction,'ai_predictions');return prediction;
end;$$;
revoke all on function public.persist_verified_scan(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.persist_verified_scan(uuid,jsonb) to service_role;

revoke all on function public.confirm_disposal(uuid,uuid,uuid,integer,timestamptz,uuid,uuid) from public,anon,authenticated;
create function public.confirm_disposal_v2(p_event uuid,p_item uuid,p_rule uuid,p_quantity integer,p_disposed_at timestamptz,p_confirmed boolean,p_prediction uuid default null,p_detection uuid default null,p_material uuid default null) returns uuid language plpgsql security definer set search_path='' as $$
declare existing public.confirmed_disposals%rowtype;r public.disposal_rules%rowtype;result uuid;snapshot jsonb;begin
 if auth.uid() is null or not private.is_active() then raise exception 'not_authorized';end if;
 if p_confirmed is distinct from true or p_event is null then raise exception 'explicit_confirmation_required';end if;
 perform pg_advisory_xact_lock(hashtextextended('disposal:'||auth.uid()::text||p_event::text,0));
 select * into existing from public.confirmed_disposals where user_id=auth.uid() and client_event_id=p_event;
 if found then
  if existing.item_id is distinct from p_item or existing.rule_version_id is distinct from p_rule or existing.quantity is distinct from p_quantity or existing.prediction_id is distinct from p_prediction or existing.detection_id is distinct from p_detection or existing.disposed_at is distinct from p_disposed_at or existing.material_id is distinct from p_material then raise exception 'idempotency_conflict';end if;
  return existing.id;
 end if;
 if p_quantity is null or p_quantity not between 1 and 100 or p_disposed_at is null or p_disposed_at>now()+interval '5 minutes' then raise exception 'invalid_disposal';end if;
 select rules.* into r from public.disposal_rules rules join public.data_sources s on s.id=rules.source_id join public.areas a on a.id=rules.area_id join public.waste_items i on i.id=rules.item_id where rules.id=p_rule and rules.item_id=p_item and rules.status='verified' and rules.archived_at is null and s.verification_status='verified' and s.archived_at is null and a.archived_at is null and i.status='published' and i.archived_at is null;
 if not found then raise exception 'verified_active_rule_required';end if;
 if jsonb_typeof(r.conditions) is distinct from 'object' or (select count(*) from jsonb_object_keys(r.conditions))>1 or exists(select 1 from jsonb_object_keys(r.conditions) k where k<>'material_id') or cardinality(r.steps)<1 then raise exception 'unsupported_or_incomplete_rule';end if;
 if r.conditions ? 'material_id' and (p_material is null or p_material::text is distinct from r.conditions->>'material_id') then raise exception 'material_confirmation_required';end if;
 if p_material is not null and not exists(select 1 from public.item_materials m join public.material_categories c on c.id=m.material_id where m.item_id=p_item and m.material_id=p_material and c.archived_at is null) then raise exception 'invalid_material';end if;
 if (p_prediction is null)<>(p_detection is null) then raise exception 'invalid_detection_reference';end if;
 if p_detection is not null and not exists(select 1 from public.ai_detections d where d.id=p_detection and d.prediction_id=p_prediction and d.user_id=auth.uid() and (d.item_id is null or d.item_id=p_item)) then raise exception 'invalid_owner_or_item';end if;
 snapshot:=jsonb_build_object('ruleId',r.id,'ruleKey',r.rule_key,'version',r.version,'areaId',r.area_id,'steps',r.steps,'warnings',r.warnings,'conditions',r.conditions,'source',(select jsonb_build_object('title',title,'reference',reference,'verifiedAt',verified_at) from public.data_sources where id=r.source_id),'bins',coalesce((select jsonb_agg(jsonb_build_object('id',b.id,'code',b.code,'color',b.color)) from public.rule_bins links join public.waste_bins b on b.id=links.bin_id join public.data_sources s on s.id=b.source_id where links.rule_version_id=r.id and b.verification_status='verified' and b.archived_at is null and s.verification_status='verified' and s.archived_at is null),'[]'::jsonb));
 insert into public.confirmed_disposals(user_id,item_id,rule_version_id,prediction_id,detection_id,client_event_id,quantity,confirmed,disposed_at,material_id,rule_snapshot) values(auth.uid(),p_item,p_rule,p_prediction,p_detection,p_event,p_quantity,true,p_disposed_at,p_material,snapshot) returning id into result;
 insert into private.audit_logs(actor_id,event,entity_id,entity_table) values(auth.uid(),'disposal_confirmed',result,'confirmed_disposals');return result;
end;$$;
revoke all on function public.confirm_disposal_v2(uuid,uuid,uuid,integer,timestamptz,boolean,uuid,uuid,uuid) from public;
grant execute on function public.confirm_disposal_v2(uuid,uuid,uuid,integer,timestamptz,boolean,uuid,uuid,uuid) to authenticated;

create function public.submit_quiz(p_quiz uuid,p_event uuid,p_answers jsonb) returns jsonb language plpgsql security definer set search_path='' as $$begin
 if auth.uid() is null or not private.is_active() or p_event is null then raise exception 'not_authorized';end if;
 if not exists(select 1 from public.quizzes where id=p_quiz and status='published' and archived_at is null) then raise exception 'quiz_not_available';end if;
 perform pg_advisory_xact_lock(hashtextextended('quiz:'||auth.uid()::text||p_event::text,0));
 return public.grade_quiz(p_quiz,p_event,p_answers);
end;$$;
revoke all on function public.grade_quiz(uuid,uuid,jsonb) from public,anon,authenticated;
revoke all on function public.submit_quiz(uuid,uuid,jsonb) from public;
grant execute on function public.submit_quiz(uuid,uuid,jsonb) to authenticated;
create function private.validate_quiz_publication() returns trigger language plpgsql security definer set search_path='' as $$begin
 if tg_op='UPDATE' and exists(select 1 from public.quiz_attempts where quiz_id=old.id) and (new.slug is distinct from old.slug or new.version is distinct from old.version) then raise exception 'graded_quiz_identity_immutable';end if;
 if new.status='published' and new.archived_at is null and ((select count(*) from public.quiz_questions where quiz_id=new.id) not between 1 and 100 or (select count(*) from public.quiz_questions where quiz_id=new.id)<>(select count(*) from public.quiz_questions q join private.quiz_answer_keys k on k.question_id=q.id where q.quiz_id=new.id)) then raise exception 'add_complete_questions_before_publication';end if;return new;
end;$$;
revoke all on function private.validate_quiz_publication() from public;
create trigger validate_quiz_publish before insert or update on public.quizzes for each row execute function private.validate_quiz_publication();

create or replace function public.member_summary() returns jsonb language sql stable security invoker set search_path='' as $$
 select jsonb_build_object('scans',(select count(*) from public.ai_predictions where user_id=auth.uid()),'disposals',(select count(*) from public.confirmed_disposals where user_id=auth.uid()),'items',(select coalesce(sum(quantity),0) from public.confirmed_disposals where user_id=auth.uid()),'quizAttempts',(select count(*) from public.quiz_attempts where user_id=auth.uid()),'quizCorrect',(select coalesce(sum(score),0) from public.quiz_attempts where user_id=auth.uid()),'quizPossible',(select coalesce(sum(max_score),0) from public.quiz_attempts where user_id=auth.uid()),'series',(select jsonb_agg(jsonb_build_object('day',d.day::date,'count',(select count(*) from public.confirmed_disposals where user_id=auth.uid() and (disposed_at at time zone 'Asia/Bangkok')::date=d.day::date)) order by d.day) from generate_series(((now() at time zone 'Asia/Bangkok')::date-6)::timestamp,(now() at time zone 'Asia/Bangkok')::date::timestamp,interval '1 day') d(day)));
$$;
create function public.member_access_status() returns boolean language sql stable security invoker set search_path='' as $$select private.is_active();$$;
revoke all on function public.member_access_status() from public;
grant execute on function public.member_access_status() to authenticated;
create function public.admin_overview() returns jsonb language plpgsql security definer set search_path='' as $$begin
 if not private.is_admin() then raise exception 'not_authorized';end if;
 return jsonb_build_object('users',(select count(*) from public.profiles),'catalog',(select count(*) from public.waste_items where archived_at is null),'rules',(select count(*) from public.disposal_rules where status='verified' and archived_at is null),'pendingMessages',(select count(*) from public.feedback where review_status<>'resolved')+(select count(*) from public.contact_messages where review_status<>'resolved'));
end;$$;
create function public.admin_user_permissions() returns jsonb language plpgsql security definer set search_path='' as $$declare result jsonb;begin
 if not private.is_admin() then raise exception 'not_authorized';end if;
 select coalesce(jsonb_agg(to_jsonb(rows)),'[]'::jsonb) into result from (select p.id,p.display_name,a.status,exists(select 1 from private.user_roles r where r.user_id=p.id and r.role_code='admin') as is_admin from public.profiles p join private.user_access a on a.user_id=p.id order by p.created_at desc limit 100) rows;return result;
end;$$;
create function public.admin_set_role(p_user uuid,p_admin boolean) returns void language plpgsql security definer set search_path='' as $$begin
 if not private.is_admin() or p_user is null or p_admin is null or p_user=auth.uid() then raise exception 'not_authorized';end if;
 if not exists(select 1 from private.user_access where user_id=p_user) then raise exception 'user_not_found';end if;
 if p_admin then insert into private.user_roles(user_id,role_code) values(p_user,'admin') on conflict do nothing;else delete from private.user_roles where user_id=p_user and role_code='admin';end if;
 insert into private.audit_logs(actor_id,event,entity_id,entity_table) values(auth.uid(),case when p_admin then 'admin_role_granted' else 'admin_role_revoked' end,p_user,'user_roles');
end;$$;
create function public.admin_submissions(p_kind text) returns jsonb language plpgsql security definer set search_path='' as $$declare result jsonb;begin
 if not private.is_admin() then raise exception 'not_authorized';end if;
 if p_kind='feedback' then select coalesce(jsonb_agg(to_jsonb(rows)),'[]'::jsonb) into result from (select f.id,f.user_id,p.display_name,f.message,f.kind,f.review_status,f.created_at from public.feedback f join public.profiles p on p.id=f.user_id order by f.created_at desc limit 100) rows;
 elsif p_kind='contact' then select coalesce(jsonb_agg(to_jsonb(rows)),'[]'::jsonb) into result from (select f.id,f.user_id,p.display_name,f.subject,f.message,f.review_status,f.created_at from public.contact_messages f join public.profiles p on p.id=f.user_id order by f.created_at desc limit 100) rows;
 else raise exception 'invalid_submission_kind';end if;return result;
end;$$;
create function public.admin_review_submission(p_kind text,p_id uuid,p_status text) returns void language plpgsql security definer set search_path='' as $$declare tab text;n integer;begin
 if not private.is_admin() or p_id is null or p_status is null or p_status not in ('new','in_progress','resolved') then raise exception 'not_authorized';end if;
 tab:=case p_kind when 'feedback' then 'feedback' when 'contact' then 'contact_messages' end;
 if tab is null then raise exception 'invalid_submission_kind';end if;
 execute format('update public.%I set review_status=$1,reviewed_at=now() where id=$2',tab) using p_status,p_id;get diagnostics n=row_count;
 if n<>1 then raise exception 'submission_not_found';end if;
 insert into private.audit_logs(actor_id,event,entity_id,entity_table,changed_fields) values(auth.uid(),'submission_reviewed',p_id,tab,array['review_status']);
end;$$;
create function public.admin_audit_log() returns jsonb language plpgsql security definer set search_path='' as $$declare result jsonb;begin
 if not private.is_admin() then raise exception 'not_authorized';end if;
 select coalesce(jsonb_agg(to_jsonb(rows)),'[]'::jsonb) into result from (select id,actor_id,event,entity_id,entity_table,changed_fields,created_at from private.audit_logs order by created_at desc,id desc limit 100) rows;return result;
end;$$;
create function public.admin_archive_entity(p_table text,p_id uuid,p_archive boolean) returns void language plpgsql security definer set search_path='' as $$declare n integer;begin
 if not private.is_admin() or p_id is null or p_archive is null then raise exception 'not_authorized';end if;
 if p_table is null or p_table not in ('areas','material_categories','waste_categories','bin_types','waste_items','data_sources','waste_bins','locations','disposal_rules','knowledge_entries','quizzes') then raise exception 'invalid_archive_target';end if;
 execute format('update public.%I set archived_at=case when $1 then now() else null end where id=$2',p_table) using p_archive,p_id;get diagnostics n=row_count;
 if n<>1 then raise exception 'record_not_found';end if;
end;$$;
create function public.admin_link_record(p_kind text,p_left uuid,p_right uuid,p_link boolean default true) returns void language plpgsql security definer set search_path='' as $$declare area uuid;state text;begin
 if not private.is_admin() or p_left is null or p_right is null or p_link is null then raise exception 'not_authorized';end if;
 if p_kind='item_materials' then
  if p_link then insert into public.item_materials(item_id,material_id) values(p_left,p_right) on conflict do nothing;else delete from public.item_materials where item_id=p_left and material_id=p_right;end if;
 elsif p_kind='rule_bins' then
  select area_id,status into area,state from public.disposal_rules where id=p_left and archived_at is null;
  if area is null or state<>'draft' then raise exception 'link_bins_before_verifying_rule';end if;
  if p_link then insert into public.rule_bins(rule_version_id,bin_id,area_id) values(p_left,p_right,area) on conflict do nothing;else delete from public.rule_bins where rule_version_id=p_left and bin_id=p_right;end if;
 elsif p_kind='location_bins' then
  select area_id into area from public.locations where id=p_left and archived_at is null;
  if area is null then raise exception 'location_not_found';end if;
  if p_link then insert into public.location_bins(location_id,bin_id,area_id) values(p_left,p_right,area) on conflict do nothing;else delete from public.location_bins where location_id=p_left and bin_id=p_right;end if;
 elsif p_kind='bin_accepted_categories' then
  if p_link then insert into public.bin_accepted_categories(bin_id,category_id) values(p_left,p_right) on conflict do nothing;else delete from public.bin_accepted_categories where bin_id=p_left and category_id=p_right;end if;
 else raise exception 'invalid_relationship';end if;
 insert into private.audit_logs(actor_id,event,entity_id,entity_table) values(auth.uid(),case when p_link then 'relationship_added' else 'relationship_removed' end,p_left,p_kind);
end;$$;
revoke all on function public.admin_overview(),public.admin_user_permissions(),public.admin_set_role(uuid,boolean),public.admin_submissions(text),public.admin_review_submission(text,uuid,text),public.admin_audit_log(),public.admin_archive_entity(text,uuid,boolean),public.admin_link_record(text,uuid,uuid,boolean) from public;
grant execute on function public.admin_overview(),public.admin_user_permissions(),public.admin_set_role(uuid,boolean),public.admin_submissions(text),public.admin_review_submission(text,uuid,text),public.admin_audit_log(),public.admin_archive_entity(text,uuid,boolean),public.admin_link_record(text,uuid,uuid,boolean) to authenticated;

-- Ordinary admin table grants must not bypass immutable verified rule versions.
-- Lock parents so link editing and concurrent verification serialize.
create function private.protect_rule_relationship() returns trigger language plpgsql security definer set search_path='' as $$
declare old_rule uuid;new_rule uuid;parent record;begin
 if tg_op<>'INSERT' then old_rule:=old.rule_version_id;end if;
 if tg_op<>'DELETE' then new_rule:=new.rule_version_id;end if;
 for parent in select id,status,archived_at from public.disposal_rules where id in (old_rule,new_rule) order by id for update loop
  if parent.status<>'draft' or parent.archived_at is not null then raise exception 'create_new_rule_version_for_relationships';end if;
 end loop;
 if tg_op='DELETE' then return old;end if;return new;
end;$$;
revoke all on function private.protect_rule_relationship() from public;
create trigger preserve_rule_bin_links before insert or update or delete on public.rule_bins for each row execute function private.protect_rule_relationship();
create trigger preserve_rule_source_links before insert or update or delete on public.rule_sources for each row execute function private.protect_rule_relationship();
create function private.audit_rule_relationship() returns trigger language plpgsql security definer set search_path='' as $$
declare rule uuid;begin
 rule:=case when tg_op='DELETE' then old.rule_version_id else new.rule_version_id end;
 insert into private.audit_logs(actor_id,event,entity_id,entity_table) values(auth.uid(),lower(tg_op)||'_rule_relationship',rule,tg_table_name);
 if tg_op='DELETE' then return old;end if;return new;
end;$$;
revoke all on function private.audit_rule_relationship() from public;
create trigger audit_rule_bin_links after insert or update or delete on public.rule_bins for each row execute function private.audit_rule_relationship();
create trigger audit_rule_source_links after insert or update or delete on public.rule_sources for each row execute function private.audit_rule_relationship();
commit;
