-- REVIEW CANDIDATE ONLY. No Hosted execution without separate hash-specific approval.
-- Local tests use an isolated PGlite instance, never the Hosted project.
begin;
do $$begin
 if not exists(select 1 from public.recyclebin_schema_version where version=5) then raise exception 'schema5_required';end if;
 if exists(select 1 from public.recyclebin_schema_version where version=6) then raise exception 'migration0006_already_applied';end if;
end;$$;
alter table public.locations add column building text check(length(building)<=200),add column floor text check(length(floor)<=100),add column zone text check(length(zone)<=300),add column evidence_photo_id uuid;
create function private.recheck_location_change() returns trigger language plpgsql set search_path='' as $$begin
 if old.verification_status='verified' and (old.latitude,old.longitude,old.source_id,old.building,old.floor,old.zone,old.evidence_photo_id) is distinct from (new.latitude,new.longitude,new.source_id,new.building,new.floor,new.zone,new.evidence_photo_id) then
 new.verification_status:='pending';new.verified_at:=null;
 end if;return new;
end;$$;
revoke all on function private.recheck_location_change() from public;
-- Sort before existing validate_location_fact trigger.
create trigger a_recheck_location before update on public.locations for each row execute function private.recheck_location_change();
insert into public.recyclebin_schema_version(version) values(6);
-- Existing RLS/admin/audit triggers remain. No seed facts, Storage bucket or role changes.
commit;
