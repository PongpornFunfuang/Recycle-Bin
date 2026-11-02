-- Additive migration, requires0006. No sample locations or role changes.
begin;
do $$begin if not exists(select 1 from public.recyclebin_schema_version where version=6) or exists(select 1 from public.recyclebin_schema_version where version=7) then raise exception 'schema6_required_and7_must_be_absent';end if;end;$$;
alter table public.locations add column surveyed_at date,add column notes text check(length(notes)<=3000);
create table private.pin_save_requests(request_id uuid primary key,actor_id uuid not null references public.profiles(id),payload jsonb not null,location_id uuid not null references public.locations(id),created_at timestamptz not null default now());
alter table private.pin_save_requests enable row level security;
revoke all on private.pin_save_requests from public,anon,authenticated;
create function public.admin_save_pin(p_id uuid,p_data jsonb) returns uuid language plpgsql security definer set search_path='' as $$
declare loc uuid;src uuid;b jsonb;bin uuid;category text;oldcat uuid;kind uuid;area uuid;request uuid;digest text;existing record;begin
 if not private.is_admin() then raise exception 'not_authorized';end if;
 request:=nullif(p_data->>'request_id','')::uuid;if request is not null then perform pg_advisory_xact_lock(hashtextextended(request::text,0));select * into existing from private.pin_save_requests where request_id=request;if found then if existing.actor_id<>auth.uid() or existing.payload is distinct from jsonb_build_object('id',p_id,'data',p_data) then raise exception 'idempotency_conflict';end if;return existing.location_id;end if;end if;
 if jsonb_typeof(p_data) is distinct from 'object' or length(trim(coalesce(p_data->>'name','')))=0 or length(p_data->>'name')>200 or jsonb_typeof(p_data->'bins') is distinct from 'array' or jsonb_array_length(p_data->'bins') not between 1 and 20 then raise exception 'invalid_pin';end if;
 if nullif(p_data->>'evidence_photo_id','') is not null and not private.pin_evidence_exists((p_data->>'evidence_photo_id')::uuid,auth.uid()) then raise exception 'owned_evidence_object_required';end if;
 area:=(p_data->>'area_id')::uuid;
 if not exists(select 1 from public.areas where id=area and archived_at is null) then raise exception 'active_area_required';end if;
 if length(trim(coalesce(p_data->>'reference','')))=0 or length(p_data->>'reference')>1000 then raise exception 'source_reference_required';end if;
 if p_id is not null then select source_id into src from public.locations where id=p_id and area_id=area and archived_at is null for update;if not found then raise exception 'location_not_found';end if;end if;
 -- New evidence revision; never silently edit an already verified source.
 insert into public.data_sources(title,reference) values('สำรวจ: '||left(p_data->>'name',200),p_data->>'reference') returning id into src;
 if p_id is null then insert into public.locations(area_id,name,latitude,longitude,source_id) values(area,p_data->>'name',(p_data->>'latitude')::float8,(p_data->>'longitude')::float8,src) returning id into loc;
 else loc:=p_id;end if;
 update public.locations set name=p_data->>'name',latitude=(p_data->>'latitude')::float8,longitude=(p_data->>'longitude')::float8,building=nullif(p_data->>'building',''),floor=nullif(p_data->>'floor',''),zone=nullif(p_data->>'zone',''),notes=nullif(p_data->>'notes',''),surveyed_at=nullif(p_data->>'surveyed_at','')::date,evidence_photo_id=nullif(p_data->>'evidence_photo_id','')::uuid,source_id=src,verification_status='pending',verified_at=null where id=loc;
 -- Existing bins remain linked; updates use explicit existing bin IDs.
 for b in select value from jsonb_array_elements(p_data->'bins') loop
 if b->>'color' not in ('น้ำเงิน','แดง','เหลือง','เขียว') or length(trim(coalesce(b->>'code','')))=0 or length(b->>'code')>100 or jsonb_typeof(b->'categories') is distinct from 'array' or jsonb_array_length(b->'categories')<1 then raise exception 'invalid_bin';end if;
 kind:=(b->>'bin_type_id')::uuid;if not exists(select 1 from public.bin_types where id=kind and archived_at is null) then raise exception 'bin_type_required';end if;
 if nullif(b->>'id','') is null then insert into public.waste_bins(area_id,bin_type_id,code,color,source_id) values(area,kind,b->>'code',b->>'color',src) returning id into bin;
 else bin:=(b->>'id')::uuid;if not exists(select 1 from public.location_bins where location_id=loc and bin_id=bin) then raise exception 'bin_not_linked';end if;update public.waste_bins set bin_type_id=kind,code=b->>'code',color=b->>'color',source_id=src,verification_status='pending',verified_at=null where id=bin and area_id=area and archived_at is null;if not found then raise exception 'bin_not_active';end if;end if;
 perform public.admin_link_record('location_bins',loc,bin,true);
 for oldcat in select category_id from public.bin_accepted_categories where bin_id=bin and not (category_id::text in (select jsonb_array_elements_text(b->'categories'))) loop perform public.admin_link_record('bin_accepted_categories',bin,oldcat,false);end loop;
 for category in select jsonb_array_elements_text(b->'categories') loop
 if not exists(select 1 from public.waste_categories where id=category::uuid and archived_at is null) then raise exception 'active_category_required';end if;
 perform public.admin_link_record('bin_accepted_categories',bin,category::uuid,true);
 end loop;
 end loop;
 if request is not null then insert into private.pin_save_requests(request_id,actor_id,payload,location_id) values(request,auth.uid(),jsonb_build_object('id',p_id,'data',p_data),loc);end if;
 return loc;
end;$$;
create function public.admin_verify_pin(p_id uuid) returns void language plpgsql security definer set search_path='' as $$declare l public.locations%rowtype;b record;begin
 if not private.is_admin() then raise exception 'not_authorized';end if;
 select * into l from public.locations where id=p_id and archived_at is null for update;
 if not found or l.evidence_photo_id is null or l.surveyed_at is null or l.surveyed_at>current_date or l.latitude is null or l.longitude is null or l.source_id is null then raise exception 'complete_evidence_required';end if;
 if not private.pin_evidence_exists(l.evidence_photo_id,null) then raise exception 'actual_evidence_object_required';end if;
 if exists(select 1 from public.locations other where other.id<>l.id and other.source_id=l.source_id) or exists(select 1 from public.disposal_rules where source_id=l.source_id) then raise exception 'source_is_shared_review_separately';end if;
 if not exists(select 1 from public.location_bins x join public.waste_bins w on w.id=x.bin_id where x.location_id=p_id and w.archived_at is null) then raise exception 'bins_required';end if;
 update public.data_sources set verification_status='verified',verified_at=now() where id=l.source_id and archived_at is null;
 for b in select w.* from public.location_bins x join public.waste_bins w on w.id=x.bin_id where x.location_id=p_id and w.archived_at is null loop
 if not exists(select 1 from public.bin_accepted_categories where bin_id=b.id) then raise exception 'category_required';end if;
 if b.source_id is distinct from l.source_id then raise exception 'bin_source_must_match_pin_evidence';end if;
 update public.waste_bins set verification_status='verified',verified_at=now() where id=b.id;
 end loop;
 update public.locations set verification_status='verified',verified_at=now() where id=p_id;
 insert into private.audit_logs(actor_id,event,entity_id,entity_table) values(auth.uid(),'pin_evidence_review_approved',p_id,'locations');
end;$$;
revoke all on function public.admin_save_pin(uuid,jsonb),public.admin_verify_pin(uuid) from public,anon;
grant execute on function public.admin_save_pin(uuid,jsonb),public.admin_verify_pin(uuid) to authenticated;
create or replace function private.recheck_location_change() returns trigger language plpgsql set search_path='' as $$begin
 if old.verification_status='verified' and (to_jsonb(old)-'verification_status'-'verified_at'-'archived_at') is distinct from (to_jsonb(new)-'verification_status'-'verified_at'-'archived_at') then new.verification_status:='pending';new.verified_at:=null;end if;return new;
end;$$;
insert into public.recyclebin_schema_version(version) values(7);
commit;
