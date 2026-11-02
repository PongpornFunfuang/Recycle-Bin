-- Local test candidate only. Separate approval is required before Cloud execution.
begin;
create function public.admin_member_list() returns table(id uuid,display_name text,status text)
language plpgsql security definer set search_path='' as $$begin
 if not private.is_admin() then raise exception 'not_authorized';end if;
 return query select p.id,p.display_name,a.status from public.profiles p join private.user_access a on a.user_id=p.id order by p.created_at desc limit 100;
end;$$;
create function public.admin_set_member_access(p_user uuid,p_status text) returns void
language plpgsql security definer set search_path='' as $$begin
 if not private.is_admin() or p_status not in ('active','suspended') or p_user=auth.uid() then raise exception 'not_authorized';end if;
 update private.user_access set status=p_status where user_id=p_user;
 if not found then raise exception 'user_not_found';end if;
 insert into private.audit_logs(actor_id,event,entity_id) values(auth.uid(),'member_access_'||p_status,p_user);
end;$$;
revoke all on function public.admin_member_list(),public.admin_set_member_access(uuid,text) from public;
grant execute on function public.admin_member_list(),public.admin_set_member_access(uuid,text) to authenticated;
create function private.protect_rule_version() returns trigger language plpgsql set search_path='' as $$begin
 if old.status in ('verified','retired') and not (old.status='verified' and new.status='retired' and (to_jsonb(old)-'status')=(to_jsonb(new)-'status')) then raise exception 'create_new_rule_version';end if;
 return new;
end;$$;
revoke all on function private.protect_rule_version() from public;
create trigger preserve_rule_history before update on public.disposal_rules for each row execute function private.protect_rule_version();
commit;
