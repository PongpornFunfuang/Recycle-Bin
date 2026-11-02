from pathlib import Path
root=Path(__file__).resolve().parents[2]
p=root/'web/src/components/scanner.tsx';s=p.read_text(encoding='utf-8');s='import SaveScan from "@/components/save-scan";\nimport Recommendation from "@/components/recommendation";\n'+s
# Keep the client directive first.
s=s.replace('"use client";\n','');s='"use client";\n'+s
s=s.replace(' const video=',' const [saved,setSaved]=useState(false);\n useEffect(()=>setSaved(false),[result?.predictionId]);\n const video=')
s=s.replace('<p>สีถัง / จุดทิ้ง: รอตรวจสอบข้อมูล SPU KK</p><button className="button" disabled title="ต้องเชื่อม Supabase และเข้าสู่ระบบก่อน">ยืนยันทิ้งแล้ว · รอฐานข้อมูล</button>','<Recommendation label={d.label} predictionId={result.predictionId} detectionId={d.detectionId} saved={saved}/>')
s=s.replace('<p className="muted">ยังไม่บันทึกประวัติบนฐานข้อมูล · ไม่มีการนับทิ้งอัตโนมัติ</p>','<SaveScan key={result.predictionId} result={result} onSaved={()=>setSaved(true)}/><p className="muted">{saved?"บันทึกผลแล้ว":"ยังไม่บันทึกผลนี้"} · ไม่มีการนับทิ้งอัตโนมัติ</p>')
p.write_text(s,encoding='utf-8')
p=root/'web/src/components/recommendation.tsx';s=p.read_text(encoding='utf-8').replace('useEffect,useState','useEffect,useState,useRef').replace('const [result,setResult]','const event=useRef<{eventId:string;disposedAt:string}|null>(null);const [result,setResult]').replace("try{const r=await fetch('/api/disposals'","event.current??={eventId:crypto.randomUUID(),disposedAt:new Date().toISOString()};try{const r=await fetch('/api/disposals'").replace('eventId:crypto.randomUUID(),itemId:result.itemId','eventId:event.current.eventId,itemId:result.itemId').replace('disposedAt:new Date().toISOString(),predictionId','disposedAt:event.current.disposedAt,predictionId');p.write_text(s,encoding='utf-8')
p=root/'web/tests/database.test.ts';s=p.read_text(encoding='utf-8').replace('await db.exec(readFileSync("../database/postgres/0002_admin_workflow.sql","utf8"));','await db.exec(readFileSync("../database/postgres/0002_admin_workflow.sql","utf8"));await db.exec(readFileSync("../database/postgres/0003_member_workflow.sql","utf8"));')
s=s.replace('assert.equal((await db.query("select * from public.confirmed_disposals")).rows.length,1);});\n await t.test("verified rule','assert.equal((await db.query("select * from public.confirmed_disposals")).rows.length,1);await db.exec("reset role;alter table private.audit_logs disable trigger test_audit_failure");});\n await t.test("verified rule')
p.write_text(s,encoding='utf-8')
print('Wired explicit save/disposal UI; isolated injected failure trigger in tests')
