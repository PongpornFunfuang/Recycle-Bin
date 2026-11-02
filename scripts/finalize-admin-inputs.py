from pathlib import Path
r=Path(__file__).resolve().parents[1]
p=r/'web/src/lib/admin-resources.ts';s=p.read_text(encoding='utf-8').replace("['rule_key','รหัสกลุ่มกฎ (ใช้เดิมเมื่อเพิ่มเวอร์ชัน)','text']","['rule_key','กลุ่มกฎ (ระบบสร้างให้เมื่อเพิ่มใหม่)','optional-rule-key']");p.write_text(s,encoding='utf-8')
p=r/'web/src/app/api/admin/route.ts';s=p.read_text(encoding='utf-8').replace('"optional-material","optional-category"','"optional-material","optional-category","optional-rule-key"').replace('if(kind==="optional-material")','if(kind==="optional-rule-key")fields.rule_key=value?z.uuid().parse(value):crypto.randomUUID();else if(kind==="optional-material")');p.write_text(s,encoding='utf-8')
p=r/'web/src/components/admin-manager.tsx';s=p.read_text(encoding='utf-8').replace('!["text","textarea","number","lines"].includes(kind)','!["text","textarea","number","lines","optional-rule-key"].includes(kind)').replace('))} required/>', '))} required={kind!=="optional-rule-key"}/>').replace('key={String(row.id)}','key={String(row.id??section)}');p.write_text(s,encoding='utf-8')
print('New rule UUID generated server-side; existing version groups validated')
