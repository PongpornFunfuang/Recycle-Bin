-- Add profile photo data and allow each signed-in user to edit only their own
-- display name and photo. The role column remains non-updatable by browser clients.
alter table public.profiles
  add column if not exists avatar_data text not null default '';

grant update (display_name, avatar_data) on public.profiles to authenticated;

drop policy if exists "users update own profile details" on public.profiles;
create policy "users update own profile details"
  on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));
