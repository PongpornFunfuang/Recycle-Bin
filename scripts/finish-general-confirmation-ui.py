from pathlib import Path
r=Path(__file__).resolve().parents[1]
p=r/'web/src/components/member-panel.tsx';s=p.read_text(encoding='utf-8-sig')
s=s.replace('type Row={id:string;', 'type Row={guidance_scope?:string;rule_snapshot?:{itemName?:string};id:string;')
s=s.replace("section==='disposals'?'ผู้ใช้ยืนยัน'", "section==='disposals'?(row.guidance_scope==='general'?'ผู้ใช้ยืนยันตามแนวทางทั่วไป':'ผู้ใช้ยืนยันตามกฎที่ตรวจสอบ')")
s=s.replace("<textarea name=\"message\" rows={5}","<textarea name=\"message\" minLength={3} rows={5}")
p.write_text(s,encoding='utf8')
p=r/'web/src/components/recommendation.tsx';s=p.read_text(encoding='utf-8-sig')
s=s.replace("<label className=\"form\">จำนวนชิ้นที่ทิ้งจริง", "{result?.verified&&<><label className=\"form\">จำนวนชิ้นที่ทิ้งจริง")
s=s.replace("</button>{message&&", "</button></>}{message&&")
p.write_text(s,encoding='utf8')
print('Separated general self-confirmation from local-rule confirmation; added early message validation')
