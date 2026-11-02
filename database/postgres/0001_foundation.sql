-- REVIEW REQUIRED. Prepared for Supabase; never executed on cloud by this project.
-- auth.users/auth.uid(), anon and authenticated roles are managed by Supabase.
begin;
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null default '' check (length(display_name)<=80),
 created_at timestamptz not null default now()
);
create table private.roles(code text primary key check(code in ('member','admin')));
insert into private.roles(code) values ('member'),('admin');
create table private.user_roles(user_id uuid references public.profiles(id) on delete cascade,role_code text references private.roles(code),primary key(user_id,role_code));
create table private.user_access(user_id uuid primary key references public.profiles(id) on delete cascade,status text not null default 'active' check(status in ('active','suspended')));
create function private.is_active() returns boolean language sql stable security definer set search_path='' as $$ select exists(select 1 from private.user_access where user_id=auth.uid() and status='active'); $$;
create function private.is_admin() returns boolean language sql stable security definer set search_path='' as $$ select private.is_active() and exists(select 1 from private.user_roles where user_id=auth.uid() and role_code='admin'); $$;
revoke all on function private.is_active(),private.is_admin() from public;
grant execute on function private.is_active(),private.is_admin() to authenticated;
create function public.current_user_is_admin() returns boolean language sql stable security invoker set search_path='' as $$select private.is_admin();$$;
revoke all on function public.current_user_is_admin() from public;
grant execute on function public.current_user_is_admin() to authenticated;
create function private.on_user_created() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.profiles(id,display_name) values(new.id,left(coalesce(new.raw_user_meta_data->>'display_name',''),80));
 insert into private.user_access(user_id) values(new.id);
 insert into private.user_roles values(new.id,'member');
 return new;
end; $$;
revoke all on function private.on_user_created() from public;
create trigger create_member_profile after insert on auth.users for each row execute function private.on_user_created();

create table public.areas(id uuid primary key default gen_random_uuid(),code text not null unique,name text not null);
create table public.material_categories(id uuid primary key default gen_random_uuid(),slug text not null unique,name text not null);
create table public.waste_categories(id uuid primary key default gen_random_uuid(),slug text not null unique,name text not null);
create table public.waste_items(id uuid primary key default gen_random_uuid(),slug text not null unique,name text not null,synonyms text[] not null default '{}',status text not null default 'draft' check(status in ('draft','published','retired')));
create table public.item_materials(item_id uuid references public.waste_items(id),material_id uuid references public.material_categories(id),primary key(item_id,material_id));
create table public.data_sources(id uuid primary key default gen_random_uuid(),title text not null,reference text not null,verification_status text not null default 'pending' check(verification_status in ('pending','verified','expired')),verified_at timestamptz,check(verification_status<>'verified' or verified_at is not null));
create table public.bin_types(id uuid primary key default gen_random_uuid(),code text not null unique,name text not null);
create table public.waste_bins(id uuid primary key default gen_random_uuid(),area_id uuid not null references public.areas(id),bin_type_id uuid not null references public.bin_types(id),code text not null,color text,source_id uuid references public.data_sources(id),verification_status text not null default 'pending' check(verification_status in ('pending','verified','expired')),verified_at timestamptz,unique(area_id,code),unique(id,area_id),check(verification_status<>'verified' or (source_id is not null and verified_at is not null)));
create table public.bin_accepted_categories(bin_id uuid references public.waste_bins(id),category_id uuid references public.waste_categories(id),primary key(bin_id,category_id));
create table public.locations(id uuid primary key default gen_random_uuid(),area_id uuid not null references public.areas(id),name text not null,latitude double precision check(latitude between -90 and 90),longitude double precision check(longitude between -180 and 180),source_id uuid references public.data_sources(id),verification_status text not null default 'pending' check(verification_status in ('pending','verified','expired')),unique(id,area_id),check(verification_status<>'verified' or source_id is not null));
create table public.location_bins(location_id uuid,bin_id uuid,area_id uuid not null,primary key(location_id,bin_id),foreign key(location_id,area_id) references public.locations(id,area_id),foreign key(bin_id,area_id) references public.waste_bins(id,area_id));
create table public.disposal_rules(id uuid primary key default gen_random_uuid(),rule_key uuid not null default gen_random_uuid(),version integer not null check(version>0),item_id uuid not null references public.waste_items(id),area_id uuid not null references public.areas(id),category_id uuid references public.waste_categories(id),conditions jsonb not null default '{}',steps text[] not null default '{}',warnings text[] not null default '{}',status text not null default 'draft' check(status in ('draft','verified','retired')),source_id uuid references public.data_sources(id),verified_at timestamptz,unique(rule_key,version),unique(id,area_id),check(status<>'verified' or (source_id is not null and verified_at is not null)));
create table public.rule_bins(rule_version_id uuid,bin_id uuid,area_id uuid not null,primary key(rule_version_id,bin_id),foreign key(rule_version_id,area_id) references public.disposal_rules(id,area_id),foreign key(bin_id,area_id) references public.waste_bins(id,area_id));
create table public.rule_sources(rule_version_id uuid references public.disposal_rules(id),source_id uuid references public.data_sources(id),primary key(rule_version_id,source_id));
create table public.model_versions(id uuid primary key default gen_random_uuid(),version text not null unique,artifact_sha256 text not null check(artifact_sha256 ~ '^[0-9a-f]{64}$'),manifest jsonb not null);
create table public.scan_sessions(id uuid primary key default gen_random_uuid(),user_id uuid not null references public.profiles(id),mode text not null check(mode in ('photo','realtime')),status text not null check(status in ('created','running','paused','stopped','expired','error')),created_at timestamptz not null default now(),unique(id,user_id));
create table public.image_assets(id uuid primary key default gen_random_uuid(),user_id uuid not null references public.profiles(id),provider text not null check(provider in ('local','supabase')),object_key text not null check(object_key !~ '(^/|\.\.|:)'),mime text not null,bytes integer not null check(bytes between 1 and 8388608),expires_at timestamptz,created_at timestamptz not null default now(),unique(id,user_id),unique(provider,object_key));
create table public.ai_predictions(id uuid primary key default gen_random_uuid(),user_id uuid not null references public.profiles(id),session_id uuid,asset_id uuid,model_version_id uuid references public.model_versions(id),request_key uuid not null,mode text not null check(mode in ('photo','live_snapshot')),provenance text not null default 'client_reported' check(provenance in ('client_reported','server_verified')),quality text not null,status text not null check(status in ('detected','uncertain','unknown','failed')),created_at timestamptz not null default now(),unique(id,user_id),unique(user_id,request_key),foreign key(session_id,user_id) references public.scan_sessions(id,user_id),foreign key(asset_id,user_id) references public.image_assets(id,user_id));
create table public.ai_detections(id uuid primary key default gen_random_uuid(),prediction_id uuid not null,user_id uuid not null,class_key text not null,label text not null,item_id uuid references public.waste_items(id),confidence double precision not null check(confidence between 0 and 1),decision text not null check(decision in ('accepted','low_confidence','unknown')),x_min double precision not null check(x_min between 0 and 1),y_min double precision not null check(y_min between 0 and 1),x_max double precision not null check(x_max between 0 and 1),y_max double precision not null check(y_max between 0 and 1),check(x_min<x_max and y_min<y_max),foreign key(prediction_id,user_id) references public.ai_predictions(id,user_id),unique(id,prediction_id,user_id),unique(id,user_id));
create table public.prediction_recommendations(id uuid primary key default gen_random_uuid(),user_id uuid not null,detection_id uuid not null,rule_version_id uuid,area_id uuid,snapshot jsonb not null,created_at timestamptz not null default now(),foreign key(detection_id,user_id) references public.ai_detections(id,user_id),foreign key(rule_version_id,area_id) references public.disposal_rules(id,area_id));
create table public.confirmed_disposals(id uuid primary key default gen_random_uuid(),user_id uuid not null references public.profiles(id),item_id uuid not null references public.waste_items(id),rule_version_id uuid not null references public.disposal_rules(id),prediction_id uuid,detection_id uuid,client_event_id uuid not null,quantity integer not null check(quantity between 1 and 100),confirmed boolean not null check(confirmed),disposed_at timestamptz not null,created_at timestamptz not null default now(),unique(user_id,client_event_id),check((prediction_id is null)=(detection_id is null)),foreign key(detection_id,prediction_id,user_id) references public.ai_detections(id,prediction_id,user_id));
create table public.feedback(id uuid primary key default gen_random_uuid(),user_id uuid not null references public.profiles(id),message text not null check(length(message) between 3 and 2000),created_at timestamptz not null default now());
create table public.ai_feedback(id uuid primary key default gen_random_uuid(),user_id uuid not null,detection_id uuid not null,verdict text not null,comment text check(length(comment)<=2000),created_at timestamptz not null default now(),foreign key(detection_id,user_id) references public.ai_detections(id,user_id));
create table public.knowledge_entries(id uuid primary key default gen_random_uuid(),slug text not null unique,title text not null,body text not null,kind text not null check(kind in ('article','tip','video')),source_id uuid references public.data_sources(id),status text not null default 'draft' check(status in ('draft','published','retired')));
create table public.quizzes(id uuid primary key default gen_random_uuid(),slug text not null,version integer not null check(version>0),title text not null,status text not null default 'draft' check(status in ('draft','published','retired')),unique(slug,version));
create table public.quiz_questions(id uuid primary key default gen_random_uuid(),quiz_id uuid not null references public.quizzes(id),position integer not null,prompt text not null,choices jsonb not null check(jsonb_typeof(choices)='array'),unique(quiz_id,position),unique(id,quiz_id));
create table private.quiz_answer_keys(question_id uuid primary key references public.quiz_questions(id),answer integer not null check(answer>=0),explanation text not null);
create table public.quiz_attempts(id uuid primary key default gen_random_uuid(),user_id uuid not null references public.profiles(id),quiz_id uuid not null references public.quizzes(id),client_attempt_key uuid not null,score integer not null check(score>=0),max_score integer not null check(max_score>=score),created_at timestamptz not null default now(),unique(user_id,client_attempt_key),unique(id,quiz_id,user_id));
create table public.quiz_answers(attempt_id uuid,question_id uuid,user_id uuid not null,quiz_id uuid not null,selected_choice integer not null check(selected_choice>=0),primary key(attempt_id,question_id),foreign key(attempt_id,quiz_id,user_id) references public.quiz_attempts(id,quiz_id,user_id),foreign key(question_id,quiz_id) references public.quiz_questions(id,quiz_id));
create table public.contact_messages(id uuid primary key default gen_random_uuid(),user_id uuid not null references public.profiles(id),subject text not null check(length(subject)<=150),message text not null check(length(message)<=3000),created_at timestamptz not null default now());
create table private.audit_logs(id uuid primary key default gen_random_uuid(),actor_id uuid references public.profiles(id),event text not null,entity_id uuid,created_at timestamptz not null default now());
create table public.m1_health(id integer primary key check(id=1));
insert into public.m1_health values(1);

create index predictions_owner_time on public.ai_predictions(user_id,created_at desc,id);
create index disposals_owner_time on public.confirmed_disposals(user_id,disposed_at desc,id);
create index sessions_owner_time on public.scan_sessions(user_id,created_at desc);
create index detections_prediction_owner on public.ai_detections(prediction_id,user_id);
create index rules_item_area on public.disposal_rules(item_id,area_id,status);
create index bins_area_status on public.waste_bins(area_id,verification_status);
create index locations_area_status on public.locations(area_id,verification_status);
create index assets_owner on public.image_assets(user_id,created_at desc);
create index assets_expiry on public.image_assets(expires_at);
create index feedback_owner on public.feedback(user_id,created_at desc);
create index attempts_owner on public.quiz_attempts(user_id,created_at desc);

-- Default deny: explicitly grant only the intended operations below.
do $$ declare t text; begin
 foreach t in array array['profiles','areas','material_categories','waste_categories','waste_items','item_materials','data_sources','bin_types','waste_bins','bin_accepted_categories','locations','location_bins','disposal_rules','rule_bins','rule_sources','model_versions','scan_sessions','image_assets','ai_predictions','ai_detections','prediction_recommendations','confirmed_disposals','feedback','ai_feedback','knowledge_entries','quizzes','quiz_questions','quiz_attempts','quiz_answers','contact_messages','m1_health'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on public.%I from public, anon, authenticated',t);
 end loop;
end $$;
revoke all on all tables in schema private from public,anon,authenticated;
alter table private.roles enable row level security;
alter table private.user_roles enable row level security;
alter table private.user_access enable row level security;
alter table private.quiz_answer_keys enable row level security;
alter table private.audit_logs enable row level security;

grant select on public.m1_health to anon,authenticated;
create policy health_read on public.m1_health for select to anon,authenticated using(true);
grant select on public.profiles to authenticated;
grant update(display_name) on public.profiles to authenticated;
create policy profile_read on public.profiles for select to authenticated using(id=auth.uid() and private.is_active());
create policy profile_update on public.profiles for update to authenticated using(id=auth.uid() and private.is_active()) with check(id=auth.uid() and private.is_active());

-- Reference dimensions are public metadata; factual rules/bins require verification.
do $$ declare t text; begin
 foreach t in array array['areas','material_categories','waste_categories','bin_types'] loop
 execute format('grant select on public.%I to anon,authenticated',t);
 execute format('create policy reference_read on public.%I for select to anon,authenticated using(true)',t);
 end loop;
end $$;
do $$ declare entry record; begin
 for entry in select * from (values ('waste_items','status = ''published'''),('data_sources','verification_status = ''verified'''),('waste_bins','verification_status = ''verified'' and exists(select 1 from public.data_sources s where s.id=source_id and s.verification_status=''verified'')'),('locations','verification_status = ''verified'' and exists(select 1 from public.data_sources s where s.id=source_id and s.verification_status=''verified'')'),('disposal_rules','status = ''verified'' and exists(select 1 from public.data_sources s where s.id=source_id and s.verification_status=''verified'')'),('knowledge_entries','status = ''published'''),('quizzes','status = ''published''')) as x(name,predicate) loop
 execute format('grant select on public.%I to anon,authenticated',entry.name);
 execute format('create policy published_read on public.%I for select to anon,authenticated using(%s)',entry.name,entry.predicate);
 end loop;
end $$;
-- Junction visibility follows visible parents, so drafts cannot leak through joins.
grant select on public.item_materials,public.bin_accepted_categories,public.location_bins,public.rule_bins,public.rule_sources,public.quiz_questions to anon,authenticated;
create policy items_visible on public.item_materials for select to anon,authenticated using(exists(select 1 from public.waste_items i where i.id=item_id));
create policy bins_visible on public.bin_accepted_categories for select to anon,authenticated using(exists(select 1 from public.waste_bins b where b.id=bin_id));
create policy locations_visible on public.location_bins for select to anon,authenticated using(exists(select 1 from public.locations l where l.id=location_id) and exists(select 1 from public.waste_bins b where b.id=bin_id));
create policy rules_bins_visible on public.rule_bins for select to anon,authenticated using(exists(select 1 from public.disposal_rules r where r.id=rule_version_id) and exists(select 1 from public.waste_bins b where b.id=bin_id));
create policy sources_visible on public.rule_sources for select to anon,authenticated using(exists(select 1 from public.disposal_rules r where r.id=rule_version_id) and exists(select 1 from public.data_sources s where s.id=source_id));
create policy questions_visible on public.quiz_questions for select to anon,authenticated using(exists(select 1 from public.quizzes q where q.id=quiz_id));
do $$ declare t text; begin
 foreach t in array array['areas','material_categories','waste_categories','waste_items','item_materials','data_sources','bin_types','waste_bins','bin_accepted_categories','locations','location_bins','disposal_rules','rule_bins','rule_sources','model_versions','knowledge_entries','quizzes','quiz_questions'] loop
 execute format('grant select,insert,update on public.%I to authenticated',t);
 execute format('create policy admin_manage on public.%I for all to authenticated using(private.is_admin()) with check(private.is_admin())',t);
 end loop;
end $$;
do $$ declare t text; begin
 foreach t in array array['scan_sessions','image_assets','ai_predictions','ai_detections','prediction_recommendations','confirmed_disposals','feedback','ai_feedback','quiz_attempts','quiz_answers','contact_messages'] loop
 execute format('grant select on public.%I to authenticated',t);
 execute format('create policy owner_read on public.%I for select to authenticated using(user_id=auth.uid() and private.is_active())',t);
 end loop;
end $$;
grant insert on public.feedback,public.ai_feedback,public.contact_messages to authenticated;
create policy feedback_write on public.feedback for insert to authenticated with check(user_id=auth.uid() and private.is_active());
create policy ai_feedback_write on public.ai_feedback for insert to authenticated with check(user_id=auth.uid() and private.is_active());
create policy contact_write on public.contact_messages for insert to authenticated with check(user_id=auth.uid() and private.is_active());
-- No direct client insert/update of AI evidence, quiz scores or disposal logs.
-- Narrow RPCs must validate/derive ownership, verified rule and idempotency.
create function public.confirm_disposal(p_event uuid,p_item uuid,p_rule uuid,p_quantity integer,p_disposed_at timestamptz,p_prediction uuid default null,p_detection uuid default null)
returns uuid language plpgsql security definer set search_path='' as $$
declare existing uuid; result uuid;
begin
 if auth.uid() is null or not private.is_active() then raise exception 'not_authorized'; end if;
 if p_quantity is null or p_quantity<1 or p_quantity>100 or p_disposed_at is null or p_disposed_at>now()+interval '5 minutes' then raise exception 'invalid_disposal'; end if;
 if not exists(select 1 from public.disposal_rules r join public.data_sources s on s.id=r.source_id where r.id=p_rule and r.item_id=p_item and r.status='verified' and s.verification_status='verified') then raise exception 'unverified_or_mismatched_rule'; end if;
 if (p_prediction is null)<>(p_detection is null) then raise exception 'invalid_detection_reference'; end if;
 if p_detection is not null and not exists(select 1 from public.ai_detections d where d.id=p_detection and d.prediction_id=p_prediction and d.user_id=auth.uid() and (d.item_id is null or d.item_id=p_item)) then raise exception 'invalid_owner_or_item'; end if;
 select id into existing from public.confirmed_disposals where user_id=auth.uid() and client_event_id=p_event;
 if existing is not null then
  if not exists(select 1 from public.confirmed_disposals where id=existing and item_id=p_item and rule_version_id=p_rule and quantity=p_quantity and prediction_id is not distinct from p_prediction and detection_id is not distinct from p_detection and disposed_at=p_disposed_at) then raise exception 'idempotency_conflict'; end if;
  return existing;
 end if;
 insert into public.confirmed_disposals(user_id,item_id,rule_version_id,prediction_id,detection_id,client_event_id,quantity,confirmed,disposed_at) values(auth.uid(),p_item,p_rule,p_prediction,p_detection,p_event,p_quantity,true,p_disposed_at) returning id into result;
 insert into private.audit_logs(actor_id,event,entity_id) values(auth.uid(),'disposal_confirmed',result);
 return result;
end; $$;
revoke all on function public.confirm_disposal(uuid,uuid,uuid,integer,timestamptz,uuid,uuid) from public;
grant execute on function public.confirm_disposal(uuid,uuid,uuid,integer,timestamptz,uuid,uuid) to authenticated;
create view public.scan_history with(security_invoker=true) as select id,user_id,mode,status,quality,created_at from public.ai_predictions;
grant select on public.scan_history to authenticated;
commit;
