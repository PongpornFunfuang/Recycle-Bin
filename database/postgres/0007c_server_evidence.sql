-- Candidate: after 0007b. Server-attested uploads; no production data or roles seeded.
-- Requires real Storage integration/security tests before hosted application.
begin;
alter table public.pin_evidence
 add column validation_state text not null default 'uploading' check(validation_state in ('uploading','validated','deleting','deleted')),
 add column content_sha256 text check(content_sha256 ~ '^[0-9a-f]{64}$'),
 add column byte_size bigint check(byte_size between 1 and 8388608),
 add column mime_type text check(mime_type in ('image/jpeg','image/png','image/webp')),
 add column validated_at timestamptz,
 add column bound_at timestamptz;
alter table public.locations add constraint locations_pin_evidence_fk
 foreign key(evidence_photo_id) references public.pin_evidence(id);

-- Only the application's authenticated server can reserve/finalize bytes.
-- Admin browsers can read/review, but cannot create metadata or upload/remove objects directly.
revoke insert,update,delete on public.pin_evidence from anon,authenticated;
drop policy evidence_admin_insert on public.pin_evidence;
drop policy pin_evidence_upload on storage.objects;
drop policy pin_evidence_unused_delete on storage.objects;

create function private.evidence_owner_is_admin(p_owner uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from private.user_roles r join private.user_access a on a.user_id=r.user_id
 where r.user_id=p_owner and r.role_code='admin' and a.status='active');
$$;
revoke all on function private.evidence_owner_is_admin(uuid) from public,anon,authenticated;

create function public.reserve_pin_evidence(p_id uuid,p_owner uuid,p_sha256 text,p_size bigint,p_mime text)
returns text language plpgsql security definer set search_path='' as $$
declare object_path text;begin
 if not private.evidence_owner_is_admin(p_owner) then raise exception 'active_admin_required';end if;
 if p_sha256 !~ '^[0-9a-f]{64}$' or p_size not between 1 and 8388608 or p_mime not in ('image/jpeg','image/png','image/webp') or p_sha256 is null or p_size is null or p_mime is null then raise exception 'invalid_image_attestation';end if;
 object_path:=p_owner::text||'/'||p_id::text;
 insert into public.pin_evidence(id,owner_id,object_key,content_sha256,byte_size,mime_type)
 values(p_id,p_owner,object_path,p_sha256,p_size,p_mime);
 insert into private.audit_logs(actor_id,event,entity_id,entity_table) values(p_owner,'evidence_upload_reserved',p_id,'pin_evidence');
 return object_path;
end;$$;

create or replace function private.pin_evidence_exists(p_id uuid,p_owner uuid default null)
returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.pin_evidence e join storage.objects o on o.bucket_id='pin-evidence' and o.name=e.object_key
 where e.id=p_id and (p_owner is null or e.owner_id=p_owner)
 and e.validation_state='validated' and e.validated_at is not null and e.content_sha256 is not null
 and o.metadata->>'mimetype'=e.mime_type and coalesce((o.metadata->>'size')::bigint,0)=e.byte_size);
$$;

create function public.finalize_pin_evidence(p_id uuid,p_owner uuid,p_sha256 text)
returns void language plpgsql security definer set search_path='' as $$
declare e public.pin_evidence%rowtype;begin
 if not private.evidence_owner_is_admin(p_owner) then raise exception 'active_admin_required';end if;
 select * into e from public.pin_evidence where id=p_id and owner_id=p_owner for update;
 if not found or e.validation_state not in ('uploading','validated') or e.content_sha256 is distinct from p_sha256 then raise exception 'evidence_attestation_mismatch';end if;
 if not exists(select 1 from storage.objects o where o.bucket_id='pin-evidence' and o.name=e.object_key
 and o.metadata->>'mimetype'=e.mime_type and coalesce((o.metadata->>'size')::bigint,0)=e.byte_size) then raise exception 'actual_matching_object_required';end if;
 if e.validation_state='validated' then return;end if;
 update public.pin_evidence set validation_state='validated',validated_at=now() where id=p_id;
 insert into private.audit_logs(actor_id,event,entity_id,entity_table) values(p_owner,'evidence_bytes_validated',p_id,'pin_evidence');
end;$$;

-- Exclusive row locks serialize a new binding with the cleanup lease. Once bound,
-- retain the evidence even when a later edit replaces it, preserving audit evidence.
create function private.guard_evidence_binding() returns trigger
language plpgsql security definer set search_path='' as $$
declare state text;owner uuid;begin
 if new.evidence_photo_id is null then return new;end if;
 if tg_op='UPDATE' and old.evidence_photo_id is not distinct from new.evidence_photo_id then return new;end if;
 select validation_state,owner_id into state,owner from public.pin_evidence where id=new.evidence_photo_id for update;
 if owner is distinct from auth.uid() or state is distinct from 'validated' or not private.pin_evidence_exists(new.evidence_photo_id,null) then raise exception 'owned_server_validated_evidence_required';end if;
 update public.pin_evidence set bound_at=coalesce(bound_at,now()) where id=new.evidence_photo_id;
 return new;
end;$$;
create trigger a_evidence_binding before insert or update of evidence_photo_id on public.locations
 for each row execute function private.guard_evidence_binding();
revoke all on function private.guard_evidence_binding() from public,anon,authenticated;

create function public.begin_pin_evidence_cleanup(p_id uuid,p_owner uuid) returns text
language plpgsql security definer set search_path='' as $$
declare e public.pin_evidence%rowtype;begin
 if not private.evidence_owner_is_admin(p_owner) then raise exception 'active_admin_required';end if;
 select * into e from public.pin_evidence where id=p_id and owner_id=p_owner for update;
 if not found then return null;end if;
 if e.validation_state='deleted' and not exists(select 1 from storage.objects where bucket_id='pin-evidence' and name=e.object_key) then return null;end if;
 if e.validation_state='uploading' and e.created_at>now()-interval '5 minutes' then raise exception 'upload_recovery_wait';end if;
 if e.bound_at is not null or exists(select 1 from public.locations where evidence_photo_id=p_id) then raise exception 'retained_evidence_cannot_be_deleted';end if;
 update public.pin_evidence set validation_state='deleting',validated_at=null where id=p_id;
 return e.object_key;
end;$$;

create function public.finish_pin_evidence_cleanup(p_id uuid,p_owner uuid) returns void
language plpgsql security definer set search_path='' as $$
declare e public.pin_evidence%rowtype;begin
 if not private.evidence_owner_is_admin(p_owner) then raise exception 'active_admin_required';end if;
 select * into e from public.pin_evidence where id=p_id and owner_id=p_owner for update;
 if not found then return;end if;
 if e.validation_state<>'deleting' or e.bound_at is not null or exists(select 1 from public.locations where evidence_photo_id=p_id)
 or exists(select 1 from storage.objects where bucket_id='pin-evidence' and name=e.object_key) then raise exception 'cleanup_not_complete';end if;
 update public.pin_evidence set validation_state='deleted',validated_at=null where id=p_id;
 insert into private.audit_logs(actor_id,event,entity_id,entity_table) values(p_owner,'unused_evidence_deleted',p_id,'pin_evidence');
end;$$;

revoke all on function public.reserve_pin_evidence(uuid,uuid,text,bigint,text),public.finalize_pin_evidence(uuid,uuid,text),public.begin_pin_evidence_cleanup(uuid,uuid),public.finish_pin_evidence_cleanup(uuid,uuid) from public,anon,authenticated;
grant execute on function public.reserve_pin_evidence(uuid,uuid,text,bigint,text),public.finalize_pin_evidence(uuid,uuid,text),public.begin_pin_evidence_cleanup(uuid,uuid),public.finish_pin_evidence_cleanup(uuid,uuid) to service_role;

create function public.pin_backend_readiness() returns jsonb
language plpgsql stable security definer set search_path='' as $$begin
 if not private.is_admin() then raise exception 'not_authorized';end if;
 return jsonb_build_object('version',1,'ready',exists(select 1 from storage.buckets where id='pin-evidence' and not public and file_size_limit=8388608));
end;$$;
revoke all on function public.pin_backend_readiness() from public,anon;
grant execute on function public.pin_backend_readiness() to authenticated;
commit;
