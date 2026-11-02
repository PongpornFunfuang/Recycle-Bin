-- Candidate, independent of local campus rules. No sample histories or scores.
begin;
alter table public.confirmed_disposals alter column rule_version_id drop not null;
alter table public.confirmed_disposals add column guidance_scope text not null default 'local_verified_rule'
 check(guidance_scope in ('local_verified_rule','general'));
alter table public.confirmed_disposals add constraint disposal_guidance_binding check(
 (guidance_scope='local_verified_rule' and rule_version_id is not null) or
 (guidance_scope='general' and rule_version_id is null and rule_snapshot is not null and coalesce(rule_snapshot->>'scope','')='general'));

create function public.general_disposal_readiness() returns integer
language sql stable set search_path='' as $$select 1;$$;
revoke all on function public.general_disposal_readiness() from public;
grant execute on function public.general_disposal_readiness() to anon,authenticated;

create function public.confirm_general_disposal(p_user uuid,p_event uuid,p_item uuid,p_quantity integer,p_disposed_at timestamptz,p_confirmed boolean,p_snapshot jsonb,p_prediction uuid default null,p_detection uuid default null)
returns uuid language plpgsql security definer set search_path='' as $$
declare existing public.confirmed_disposals%rowtype;result uuid;slug text;begin
 if not exists(select 1 from private.user_access where user_id=p_user and status='active') then raise exception 'active_member_required';end if;
 if p_confirmed is distinct from true or p_event is null then raise exception 'explicit_confirmation_required';end if;
 perform pg_advisory_xact_lock(hashtextextended('disposal:'||p_user::text||p_event::text,0));
 select * into existing from public.confirmed_disposals where user_id=p_user and client_event_id=p_event;
 if found then
  if existing.guidance_scope<>'general' or existing.item_id is distinct from p_item or existing.quantity is distinct from p_quantity or existing.disposed_at is distinct from p_disposed_at or existing.prediction_id is distinct from p_prediction or existing.detection_id is distinct from p_detection or existing.rule_snapshot is distinct from p_snapshot then raise exception 'idempotency_conflict';end if;
  return existing.id;
 end if;
 if p_quantity is null or p_quantity not between 1 and 100 or p_disposed_at is null or p_disposed_at>now()+interval '5 minutes' then raise exception 'invalid_disposal';end if;
 select i.slug into slug from public.waste_items i where i.id=p_item and i.status='published' and i.archived_at is null;
 if not found then raise exception 'published_item_required';end if;
 if p_snapshot is null or jsonb_typeof(p_snapshot) is distinct from 'object' or p_snapshot->>'scope' is distinct from 'general' or p_snapshot->>'identification' is distinct from 'user_selected' or p_snapshot->>'itemSlug' is distinct from slug or p_snapshot->>'version' is distinct from 'general-2026-11-02-v1'
 or jsonb_typeof(p_snapshot->'steps') is distinct from 'array' or jsonb_array_length(p_snapshot->'steps') not between 1 and 30 or p_snapshot#>>'{source,reference}' is distinct from 'https://greener.bangkok.go.th/waste-recycle/community-waste-guide/' or p_snapshot ? 'bins' or p_snapshot ? 'locationId' then raise exception 'invalid_general_guidance';end if;
 if (p_prediction is null)<>(p_detection is null) then raise exception 'invalid_detection_reference';end if;
 if p_detection is not null and not exists(select 1 from public.ai_detections d join public.ai_predictions p on p.id=d.prediction_id where d.id=p_detection and d.prediction_id=p_prediction and d.user_id=p_user and p.provenance='server_verified') then raise exception 'verified_owned_prediction_required';end if;
 insert into public.confirmed_disposals(user_id,item_id,client_event_id,quantity,confirmed,disposed_at,rule_snapshot,guidance_scope,prediction_id,detection_id)
 values(p_user,p_item,p_event,p_quantity,true,p_disposed_at,p_snapshot,'general',p_prediction,p_detection) returning id into result;
 insert into private.audit_logs(actor_id,event,entity_id,entity_table) values(p_user,'general_disposal_confirmed',result,'confirmed_disposals');
 return result;
end;$$;
revoke all on function public.confirm_general_disposal(uuid,uuid,uuid,integer,timestamptz,boolean,jsonb,uuid,uuid) from public,anon,authenticated;
grant execute on function public.confirm_general_disposal(uuid,uuid,uuid,integer,timestamptz,boolean,jsonb,uuid,uuid) to service_role;
insert into public.recyclebin_schema_version(version) values(8);
commit;
