from pathlib import Path
r=Path(__file__).resolve().parents[1]
p=r/'web/src/app/api/admin/route.ts';s=p.read_text(encoding='utf-8-sig')
old="const probe=await auth.client.from('locations').select('surveyed_at,notes').limit(0);"
if old in s:
 s="import {evidenceWriter} from '@/lib/supabase-privileged';\n"+s
 s=s.replace(old,"const probe=await auth.client.rpc('pin_backend_readiness');")
 s=s.replace('available:!probe.error,rows:rows.data.map','available:!probe.error&&probe.data?.ready===true&&probe.data?.version===1&&!!evidenceWriter(),rows:rows.data.map')
 p.write_text(s,encoding='utf8')
p=r/'web/src/components/self-pinning-admin.tsx';s=p.read_text(encoding='utf-8-sig')
anchor=' async function action(row:Record<string,unknown>,verify:boolean)'
if 'async function cleanupUploads()' not in s:
 s=s.replace(anchor,""" async function cleanupUploads(){
 if(!window.confirm('ล้างเฉพาะภาพร่างของบัญชีนี้ที่ไม่เคยใช้กับจุดติดตั้งและมีอายุเกิน 5 นาทีหรือไม่? ภาพที่เคยผูกกับจุดติดตั้งจะเก็บรักษาไว้'))return;
 setBusy(true);try{const response=await fetch('/api/location-evidence?cleanup=1',{cache:'no-store'});const data=await response.json();if(!response.ok)throw Error(data.error?.message??'อ่านรายการค้างไม่ได้');let cleaned=0;for(const item of data.items??[]){const result=await fetch('/api/location-evidence',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:item.id})});if(!result.ok)throw Error('ล้างบางรายการไม่สำเร็จ ลองใหม่ได้ ภาพที่ใช้งานจะไม่ถูกลบ');cleaned++;}setMessage('ตรวจและล้างรายการภาพร่างแล้ว '+cleaned+' รายการ');}catch(e){setMessage(e instanceof Error?e.message:'ติดต่อระบบไม่ได้');}finally{setBusy(false);}
 }
"""+anchor)
 s=s.replace('<section className="panel"><h2>รายการจุดติดตั้ง</h2>','<section className="panel"><h2>รายการจุดติดตั้ง</h2><button type="button" className="button secondary" disabled={!available||busy} onClick={()=>void cleanupUploads()}>ล้างภาพร่างอัปโหลดค้าง</button>')
 p.write_text(s,encoding='utf8')
print('Prepared versioned readiness and owner-scoped draft cleanup UI; no Cloud operations')
p=r/'web/src/app/api/admin/route.ts';s=p.read_text(encoding='utf-8-sig')
if 'pin_release_not_ready' not in s:
 anchor=" if(body.action==='save-pin'){"
 guard=" if(['save-pin','verify-pin','location-details'].includes(body.action)){const readiness=await auth.client.rpc('pin_backend_readiness');if(!evidenceWriter()||readiness.error||readiness.data?.ready!==true||readiness.data?.version!==1)return error('pin_release_not_ready — ระบบหมุดยังไม่พร้อมบันทึก',503);}\n"
 assert anchor in s
 s=s.replace(anchor,guard+anchor)
 p.write_text(s,encoding='utf8')
