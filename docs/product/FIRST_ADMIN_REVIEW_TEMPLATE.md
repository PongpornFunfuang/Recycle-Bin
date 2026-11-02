# First Admin — operator review template, NOT EXECUTED

ใช้หลังได้รับอนุมัติ Project, Migration hashes, Auth Settings และ UUID ของบัญชีทดสอบเป้าหมายแล้วเท่านั้น ไม่รันผ่านเว็บไซต์ ไม่ใช้ Service Key ใน Browser และไม่ส่ง Credentials ในแชต

1. สมัครและยืนยันอีเมลบัญชีเป้าหมายตามขั้นตอนจริงก่อน ตรวจ UUID จาก Supabase Auth Dashboard ให้ตรงกับ public.profiles และ private.user_access
2. ผู้ดูแลที่มีสิทธิ์ SQL Editor ตรวจชื่อ Project/Region และ Ledger ว่า SQL0001–0005 ฉบับ Hash ล่าสุด Commit ครบแล้ว
3. ถ้ามี Active Admin อยู่แล้ว ให้ใช้บัญชีนั้นจัดการสิทธิ์ผ่าน Admin UI ไม่ใช้ Bootstrap ซ้ำ
4. Template ข้างล่างตั้ง UUID เป็นศูนย์และจะปฏิเสธทันทีจนกว่าจะใส่ UUID ที่อนุมัติจริง ไม่ใช่ SQL Migration และไม่ได้ถูกรันโดยสคริปต์ Local ใด ๆ
5. บันทึก Operator/เวลา/Project/Target UUID/ผลไว้ใน Change Ledger แยกต่างหาก Audit actor_id เป็น NULL เพราะ SQL Editor ไม่ใช่ Session ของผู้ใช้เป้าหมาย ห้ามแต่งว่าเป้าหมายเป็นผู้ดำเนินการเอง

```sql
begin;
do $first_admin$
declare
 target uuid := '00000000-0000-0000-0000-000000000000'; -- Replace only after explicit approval
begin
 if target='00000000-0000-0000-0000-000000000000'::uuid then
  raise exception 'approved_target_uuid_required';
 end if;
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
```

ถ้าเกิด Error ให้หยุดและ Rollback Transaction ที่ค้าง ห้ามเปลี่ยน RLS หรือเลี่ยง Guard เพื่อให้ผ่าน Template นี้ยังไม่ทดสอบกับ Supabase จริง; local Auth stub ไม่มี email_confirmed_at จึงไม่อ้างว่า Hosted Bootstrap ผ่าน

หลัง Commit ที่อนุมัติแล้ว: Login บัญชีเป้าหมายผ่านเว็บจริง ตรวจ Admin Dashboard และ Audit แล้วใช้บัญชี A/B ธรรมดาทดสอบว่า `/api/admin` และ Admin RPC ปฏิเสธสิทธิ์ ทดสอบว่าแก้ Profile หรือ Metadata ไม่เพิ่มสิทธิ์ การตั้ง Admin บน Cloud ยังเป็น PENDING
