-- Append after0007 within reviewed release. No seed/no destructive data operation.
begin;
-- Direct writes retain draft editing, but publication must run in the actual
-- SECURITY DEFINER owner context, not a client-settable configuration flag.
create function private.guard_pin_publication() returns trigger language plpgsql set search_path='' as $$begin
 if tg_table_name='waste_bins' and tg_op='UPDATE' and current_user in ('anon','authenticated') and (to_jsonb(old)-'verification_status'-'verified_at') is distinct from (to_jsonb(new)-'verification_status'-'verified_at') then new.verification_status:='pending';new.verified_at:=null;return new;end if;
 if current_user in ('anon','authenticated') and (new.verification_status='verified' or new.verified_at is not null) then raise exception 'use_verified_pin_rpc';end if;
 return new;
end;$$;
revoke all on function private.guard_pin_publication() from public;
create trigger z_pin_publication_guard before insert or update on public.locations for each row execute function private.guard_pin_publication();
create trigger z_bin_publication_guard before insert or update on public.waste_bins for each row execute function private.guard_pin_publication();
create function private.invalidate_bin_locations() returns trigger language plpgsql security definer set search_path='' as $$declare bin uuid;prior_bin uuid;begin
 if tg_table_name='waste_bins' then
  if to_jsonb(old) is not distinct from to_jsonb(new) then return new;end if;
  bin:=new.id;
 else bin:=(to_jsonb(new)->>'bin_id')::uuid;prior_bin:=(to_jsonb(old)->>'bin_id')::uuid;end if;
 update public.locations set verification_status='pending',verified_at=null where verification_status='verified' and id in(select location_id from public.location_bins where bin_id in(bin,prior_bin));
 if tg_table_name='location_bins' then
  update public.locations set verification_status='pending',verified_at=null where verification_status='verified' and id in((to_jsonb(old)->>'location_id')::uuid,(to_jsonb(new)->>'location_id')::uuid);
 end if;
 return coalesce(new,old);
end;$$;
revoke all on function private.invalidate_bin_locations() from public;
create trigger invalidate_linked_locations after update on public.waste_bins for each row execute function private.invalidate_bin_locations();
create trigger invalidate_category_membership after insert or update or delete on public.bin_accepted_categories for each row execute function private.invalidate_bin_locations();
create trigger invalidate_location_membership after insert or update or delete on public.location_bins for each row execute function private.invalidate_bin_locations();
create function private.invalidate_category_locations() returns trigger language plpgsql security definer set search_path='' as $$begin
 if to_jsonb(old) is distinct from to_jsonb(new) then update public.locations set verification_status='pending',verified_at=null where verification_status='verified' and id in(select x.location_id from public.location_bins x join public.bin_accepted_categories c on c.bin_id=x.bin_id where c.category_id=new.id);end if;return new;
end;$$;
revoke all on function private.invalidate_category_locations() from public;
create trigger invalidate_category_locations after update on public.waste_categories for each row execute function private.invalidate_category_locations();
create function private.invalidate_source_locations() returns trigger language plpgsql security definer set search_path='' as $$begin
 if to_jsonb(old) is distinct from to_jsonb(new) then
 update public.locations set verification_status='pending',verified_at=null where verification_status='verified' and (source_id=new.id or id in(select x.location_id from public.location_bins x join public.waste_bins b on b.id=x.bin_id where b.source_id=new.id));
 end if;return new;
end;$$;
revoke all on function private.invalidate_source_locations() from public;
create trigger invalidate_source_locations after update on public.data_sources for each row execute function private.invalidate_source_locations();
create function private.audit_pin_junction() returns trigger language plpgsql security definer set search_path='' as $$begin
 insert into private.audit_logs(actor_id,event,entity_id,entity_table) values(auth.uid(),lower(tg_op)||'_pin_relationship',coalesce((to_jsonb(new)->>'location_id')::uuid,(to_jsonb(old)->>'location_id')::uuid,(to_jsonb(new)->>'bin_id')::uuid,(to_jsonb(old)->>'bin_id')::uuid),tg_table_name);return coalesce(new,old);
end;$$;
revoke all on function private.audit_pin_junction() from public;
create trigger audit_pin_junction after insert or update or delete on public.location_bins for each row execute function private.audit_pin_junction();
create trigger audit_bin_category_junction after insert or update or delete on public.bin_accepted_categories for each row execute function private.audit_pin_junction();
commit;
