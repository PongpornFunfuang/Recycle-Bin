-- Recycle Bin schema for Supabase. Run once in Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create or replace function private.is_admin()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;
revoke all on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated;

create or replace function private.handle_new_user()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;
revoke all on function private.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure private.handle_new_user();

create table if not exists public.waste_items (
  id text primary key,
  name_th text not null,
  short_name text not null,
  category text not null check (category in ('plastic','paper','glass','metal','food','hazard','general')),
  bin_label text not null,
  bin_color text not null default '#1689df',
  steps jsonb not null default '[]'::jsonb check (jsonb_typeof(steps) = 'array'),
  reason text not null default '',
  recyclable boolean not null default false,
  carbon_kg numeric(8,3) not null default 0 check (carbon_kg >= 0),
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.user_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  waste_item_id text not null,
  item_name text not null,
  category text not null check (category in ('plastic','paper','glass','metal','food','hazard','general')),
  recyclable boolean not null default false,
  carbon_kg numeric(8,3) not null default 0 check (carbon_kg >= 0),
  created_at timestamptz not null default now()
);

create index if not exists user_events_user_created_idx
  on public.user_events (user_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.waste_items enable row level security;
alter table public.user_events enable row level security;

drop policy if exists "read own profile or admin" on public.profiles;
create policy "read own profile or admin" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select private.is_admin()));

-- Role changes are intentionally unavailable to browser clients. Promote the first
-- administrator with the SQL statement at the end of this file.
revoke all on public.profiles from public, anon, authenticated;
grant select on public.profiles to authenticated;

drop policy if exists "authenticated users read active waste items" on public.waste_items;
create policy "authenticated users read active waste items" on public.waste_items
  for select to authenticated using (is_active or (select private.is_admin()));
drop policy if exists "admins insert waste items" on public.waste_items;
create policy "admins insert waste items" on public.waste_items
  for insert to authenticated with check ((select private.is_admin()));
drop policy if exists "admins update waste items" on public.waste_items;
create policy "admins update waste items" on public.waste_items
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
drop policy if exists "admins delete waste items" on public.waste_items;
create policy "admins delete waste items" on public.waste_items
  for delete to authenticated using ((select private.is_admin()));
revoke all on public.waste_items from public, anon, authenticated;
grant select on public.waste_items to authenticated;
grant insert, update, delete on public.waste_items to authenticated;

drop policy if exists "users read own events" on public.user_events;
create policy "users read own events" on public.user_events
  for select to authenticated using (user_id = (select auth.uid()) or (select private.is_admin()));
drop policy if exists "users create own events" on public.user_events;
create policy "users create own events" on public.user_events
  for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "users delete own events" on public.user_events;
create policy "users delete own events" on public.user_events
  for delete to authenticated using (user_id = (select auth.uid()) or (select private.is_admin()));
revoke all on public.user_events from public, anon, authenticated;
grant select, insert, delete on public.user_events to authenticated;

insert into public.waste_items
  (id,name_th,short_name,category,bin_label,bin_color,steps,reason,recyclable,carbon_kg)
values
('bottle','ขวดน้ำพลาสติก PET','ขวดน้ำพลาสติก','plastic','ถังรีไซเคิล','#1689df','["เทน้ำที่เหลือออกให้หมด","บีบขวดให้แบนเพื่อลดพื้นที่","แยกฝาและฉลาก หากจุดรับกำหนด"]','ขวด PET สามารถนำกลับไปผลิตเป็นเส้นใยและบรรจุภัณฑ์ใหม่ได้ เมื่อสะอาดและไม่ปนเปื้อน',true,0.040),
('cup','แก้วกาแฟพลาสติก','แก้วกาแฟพลาสติก','plastic','ถังรีไซเคิล*','#1689df','["เทเครื่องดื่มและน้ำแข็งออก","ล้างคราบกาแฟและเศษนม","แยกหลอดและฝา ถ้าทำได้"]','รับรีไซเคิลได้เมื่อเป็นพลาสติกชนิดที่จุดรับรองรับและสะอาด แก้วเปื้อนมากให้ทิ้งตามป้ายของพื้นที่',true,0.030),
('foam','กล่องโฟมใส่อาหาร','กล่องโฟม','general','ถังขยะทั่วไป','#e8a33a','["เทเศษอาหารและน้ำแกงออก","แยกเศษอาหารไปถังขยะเปียก","ไม่ใส่กล่องที่เปื้อนมากลงถังรีไซเคิล"]','กล่องโฟมเปื้อนอาหารมักรีไซเคิลได้ยากและทำให้วัสดุอื่นปนเปื้อน',false,0),
('can','กระป๋องเครื่องดื่ม','กระป๋องอะลูมิเนียม','metal','ถังรีไซเคิล','#1689df','["เทเครื่องดื่มออก","ล้างคราบเหนียวและผึ่งให้แห้ง","บีบกระป๋องเบา ๆ ถ้าปลอดภัย"]','อะลูมิเนียมรีไซเคิลได้หลายครั้ง ควรแยกจากขยะเปียกเพื่อรักษาคุณภาพวัสดุ',true,0.080),
('paper','กระดาษเอกสาร','กระดาษสะอาด','paper','ถังรีไซเคิล','#1689df','["นำคลิปหรือวัสดุอื่นออก","เก็บให้แห้งและไม่เปื้อนอาหาร","พับหรือจัดเรียงให้เป็นระเบียบ"]','กระดาษสะอาดและแห้งนำกลับไปผลิตกระดาษใหม่ได้ ส่วนกระดาษเปื้อนอาหารให้ทิ้งทั่วไป',true,0.020),
('box','กล่องกระดาษลัง','กล่องลัง','paper','ถังรีไซเคิล','#1689df','["แกะเทปและวัสดุกันกระแทกออก","พับให้แบน","ตรวจให้แน่ใจว่าแห้ง ไม่เปื้อนน้ำมัน"]','กล่องลังที่สะอาดและแห้งเป็นวัสดุรีไซเคิลที่มีจุดรับค่อนข้างแพร่หลาย',true,0.050),
('glass','ขวดแก้ว','ขวดแก้ว','glass','ถังรีไซเคิล','#1689df','["เทของเหลวออกและล้างคราบ","ถอดฝาโลหะหรือพลาสติกแยก","วางอย่างระมัดระวัง ไม่โยนให้แตก"]','ขวดแก้วคัดแยกเพื่อนำกลับมาใช้ใหม่ได้ ระวังการแตกและทำตามป้ายถังของมหาวิทยาลัย',true,0.060),
('food','เศษอาหาร','เศษอาหาร','food','ถังขยะเปียก','#40a869','["เทน้ำหรือของเหลวออกก่อน","แยกช้อนส้อมและบรรจุภัณฑ์","ใช้จุดทิ้งเศษอาหาร หากมี"]','การแยกเศษอาหารช่วยลดการปนเปื้อนของวัสดุรีไซเคิล และเอื้อต่อการจัดการขยะอินทรีย์',false,0.010),
('battery','ถ่านไฟฉาย / แบตเตอรี่','ถ่านไฟฉาย','hazard','ถังขยะอันตราย','#df5864','["ห้ามแกะหรือบีบถ่าน","แปะขั้วด้วยเทปก่อนรวบรวมถ้าทำได้","นำไปทิ้งจุดรับขยะอันตรายโดยเฉพาะ"]','ถ่านอาจมีสารเคมีที่เป็นอันตราย ห้ามทิ้งรวมกับขยะทั่วไปหรือถังรีไซเคิล',false,0),
('snack','ถุงขนม / ซองขนม','ถุงขนม','general','ถังขยะทั่วไป','#e8a33a','["เขย่าเศษขนมออก","ถุงหลายชั้นส่วนใหญ่แยกรีไซเคิลยาก","ตรวจว่ามีจุดรับเฉพาะในมหาวิทยาลัยหรือไม่"]','ซองขนมมักประกอบด้วยวัสดุหลายชั้นและมีจุดรับรีไซเคิลจำกัด',false,0),
('milk','กล่องเครื่องดื่ม UHT','กล่องนม UHT','paper','จุดรับกล่องเครื่องดื่ม*','#1689df','["ดื่มให้หมดและล้าง","ผึ่งให้แห้ง แล้วพับให้แบน","นำไปจุดรับที่ระบุว่ารับกล่องเครื่องดื่ม"]','กล่องเครื่องดื่มมีหลายชั้น ควรส่งให้จุดรับเฉพาะที่มีระบบจัดการรองรับ',true,0.030),
('light','หลอดไฟ','หลอดไฟ','hazard','ถังขยะอันตราย','#df5864','["ห่อกันแตกและจับอย่างระมัดระวัง","ห้ามทิ้งรวมกับขยะทั่วไป","นำไปจุดรับขยะอันตรายของมหาวิทยาลัย"]','หลอดไฟบางชนิดมีสารที่ต้องจัดการเป็นพิเศษ และเศษแก้วอาจบาดผู้ปฏิบัติงาน',false,0)
on conflict (id) do nothing;

-- After the first account has registered, run this once in SQL Editor and replace the email.
-- update public.profiles p set role = 'admin'
-- from auth.users u where u.id = p.id and lower(u.email) = lower('admin@university.ac.th');
