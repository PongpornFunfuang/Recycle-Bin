from pathlib import Path
r=Path(__file__).resolve().parents[1]
p=r/'web/src/components/scanner.tsx';s=p.read_text(encoding='utf-8-sig')
if "import GeneralDisposal" not in s:
 s=s.replace('"use client";','"use client";\nimport GeneralDisposal from \'./general-disposal\';').replace("'use client';","'use client';\nimport GeneralDisposal from './general-disposal';")
 needle='<p className="muted">{saved?'
 assert needle in s
 s=s.replace(needle,'{!live&&<GeneralDisposal key={result.predictionId} predictionId={saved?result.predictionId:undefined} detections={result.detections}/>}'+needle)
 p.write_text(s,encoding='utf8')
p=r/'web/src/components/waste-detail.tsx';s=p.read_text(encoding='utf-8-sig')
if 'import GeneralDisposal' not in s:
 s=s.replace('"use client";','"use client";\nimport GeneralDisposal from \'./general-disposal\';')
 needle='<Link className="text-link" href="/locations">ดูจุดทิ้งที่ตรวจสอบแล้ว →</Link>'
 assert needle in s
 s=s.replace(needle,needle+'<GeneralDisposal key={data.item.id??slug} initialItemId={data.item.id??undefined}/>')
 p.write_text(s,encoding='utf8')
print('Connected explicit general confirmation to scanner and guide; Cloud still guarded by readiness')
