-- PENDING explicit target-specific approval. NOT a migration. Do not auto-run.
-- Target project: recycle-bin / fdmohzvuxvsrcaddbjvl only.
begin;
-- Serialize bootstrap attempts and access/role changes during the short guard.
lock table private.user_roles, private.user_access in share row exclusive mode;
do $first_admin$
declare
 target uuid := 'a1fbf6f7-0d34-44bf-a071-f265f61dfebb';
begin
 if not exists(select 1 from public.recyclebin_schema_version where version=5) then
  raise exception 'approved_schema_version_required';
 end if;
 if exists(select 1 from private.user_roles r join private.user_access a on a.user_id=r.user_id
           where r.role_code='admin' and a.status='active') then
  raise exception 'active_admin_already_exists_use_admin_workflow';
 end if;
 if not exists(select 1 from auth.users u join public.profiles p on p.id=u.id
               join private.user_access a on a.user_id=p.id
               where u.id=target and u.email_confirmed_at is not null and a.status='active') then
  raise exception 'confirmed_auth_profile_active_access_required';
 end if;
 insert into private.user_roles(user_id,role_code) values(target,'admin');
 insert into private.audit_logs(actor_id,event,entity_id,entity_table,changed_fields)
 values(null,'operator_first_admin_bootstrap',target,'user_roles',array['role_code']);
 if not exists(select 1 from private.user_roles where user_id=target and role_code='admin') then
  raise exception 'bootstrap_verification_failed';
 end if;
end;
$first_admin$;
commit;
