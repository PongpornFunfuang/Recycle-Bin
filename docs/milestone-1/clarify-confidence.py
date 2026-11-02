from pathlib import Path
root=Path(__file__).resolve().parents[2]
p=root/'web/src/components/scanner.tsx';s=p.read_text(encoding='utf-8').replace('Math.round(d.confidence*100)','(d.confidence*100).toFixed(1)').replace('ผลตรวจจับไม่ใช่การยืนยันว่าทิ้งแล้ว','ผลตรวจจับไม่ใช่การยืนยันว่าทิ้งแล้ว · Confidence ไม่ใช่ความแม่นยำและผลอาจผิดได้');p.write_text(s,encoding='utf-8')
print('Confidence displayed to one decimal with explicit interpretation')
