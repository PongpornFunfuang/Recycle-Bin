"""Local Admin copy/display fixes only. No network, Cloud or Git operations."""
import datetime,hashlib,json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
changes={
 'web/src/app/admin/[[...section]]/page.tsx':[(
  'เปิดเครื่องมือแก้ไขเฉพาะบัญชีที่ผ่านการตรวจสิทธิ์ · Cloud integration ยังรอ Project และอนุมัติ migration',
  'จัดการข้อมูลอ้างอิง สมาชิก และประวัติการใช้งานของโครงงาน')],
 'web/src/components/admin-manager.tsx':[(
  'row.display_name??row.slug??row.id)',
  'row.display_name??row.slug??row.id??(section==="overview"?"สรุปข้อมูลระบบ":"รายการ"))'),(
  'import {resource} from "@/lib/admin-resources";',
  'import {resource} from "@/lib/admin-resources";\nconst displayLabels:Record<string,string>={rules:"กฎคัดแยก",users:"สมาชิก",catalog:"รายการขยะ",pendingMessages:"ข้อความรอตรวจ"};'),(
  '<dt>{k}</dt>', '<dt>{displayLabels[k]??k}</dt>')]
}
prepared=[]
for relative,replacements in changes.items():
 path=root/relative;original=path.read_bytes();text=original.decode('utf-8')
 for old,new in replacements:
  if text.count(old)!=1:raise RuntimeError('Expected unique source match: '+relative)
  text=text.replace(old,new)
 prepared.append((relative,original,text.encode('utf-8')))
backup=root/'backups/local-admin-display-2026-11-02'
backup.mkdir(exist_ok=False)
manifest=[]
for relative,original,updated in prepared:
 destination=backup/'files'/relative;destination.parent.mkdir(parents=True,exist_ok=True);destination.write_bytes(original)
 manifest.append({'source':relative,'backup':'files/'+relative,'beforeSha256':hashlib.sha256(original).hexdigest(),'afterSha256':hashlib.sha256(updated).hexdigest()})
(backup/'manifest.json').write_text(json.dumps({'capturedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'files':manifest},indent=2),encoding='utf-8')
for relative,original,updated in prepared:(root/relative).write_bytes(updated)
print(json.dumps({'sourceFilesModified':len(prepared),'backup':str(backup.relative_to(root)),'cloudOperations':0}))
