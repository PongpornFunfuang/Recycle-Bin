begin;
create table if not exists public.disposal_evidence(
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id), item_id uuid null references public.waste_items(id), prediction_id uuid null, detection_id uuid null,
 object_path text not null unique, quantity integer not null check(quantity between 1 and 100), status text not null default 'pending' check(status in ('pending','approved','rejected')),
 rejection_reason text, reviewed_by uuid references public.profiles(id), reviewed_at timestamptz, created_at timestamptz not null default now(), unique(id,user_id)
);
create index if not exists disposal_evidence_user_time on public.disposal_evidence(user_id,created_at desc);
alter table public.disposal_evidence enable row level security;
drop policy if exists disposal_evidence_owner_read on public.disposal_evidence;
create policy disposal_evidence_owner_read on public.disposal_evidence for select to authenticated using(user_id=auth.uid() or public.current_user_is_admin());
revoke all on public.disposal_evidence from anon,authenticated;
grant select on public.disposal_evidence to authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('disposal-evidence','disposal-evidence',false,8388608,array['image/jpeg','image/png','image/webp']) on conflict(id) do nothing;
create or replace function public.admin_disposal_evidence(p_status text default null) returns setof public.disposal_evidence language sql security definer set search_path='' as $$ select * from public.disposal_evidence where public.current_user_is_admin() and (p_status is null or status=p_status) order by created_at desc $$;
create or replace function public.admin_review_disposal_evidence(p_id uuid,p_status text,p_reason text default null) returns public.disposal_evidence language plpgsql security definer set search_path='' as $$ declare r public.disposal_evidence; begin if not public.current_user_is_admin() then raise exception 'admin_required'; end if; if p_status not in ('approved','rejected') then raise exception 'invalid_status'; end if; update public.disposal_evidence set status=p_status,rejection_reason=case when p_status='rejected' then nullif(left(coalesce(p_reason,''),1000),'') else null end,reviewed_by=auth.uid(),reviewed_at=now() where id=p_id and status='pending' returning * into r; if not found then raise exception 'not_pending'; end if; return r; end $$;
revoke all on function public.admin_disposal_evidence(text),public.admin_review_disposal_evidence(uuid,text,text) from public,anon,authenticated;
grant execute on function public.admin_disposal_evidence(text),public.admin_review_disposal_evidence(uuid,text,text) to authenticated;
commit;
