-- General reference choices, NOT verified campus bin colors or disposal rules.
begin;
do $$begin if not exists(select 1 from public.recyclebin_schema_version where version=5) then raise exception 'schema5_required';end if;end;$$;
insert into public.waste_categories(slug,name) values ('general','ขยะทั่วไป'),('recyclable','ขยะรีไซเคิล'),('organic','ขยะอินทรีย์'),('hazardous','ขยะอันตราย') on conflict(slug) do nothing;
insert into public.bin_types(code,name) values ('SINGLE','ถังเดี่ยว'),('MULTI_COMPARTMENT','ถังแยกประเภทหลายช่อง'),('BIN_SET','ชุดถังหลายใบ'),('HAZARDOUS_POINT','ถังขยะอันตรายเฉพาะจุด'),('OTHER','อื่น ๆ') on conflict(code) do nothing;
insert into public.areas(code,name) values('SPU_KK','มหาวิทยาลัยศรีปทุม วิทยาเขตขอนแก่น') on conflict(code) do nothing;
commit;