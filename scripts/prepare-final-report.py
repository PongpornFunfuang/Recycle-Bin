from pathlib import Path
import json,hashlib
r=Path(__file__).resolve().parents[1];p=r/'web/tests/camera-smoke.cjs';s=p.read_text(encoding='utf-8').replace("physicalCamera:'PENDING manual permission/device test'","physicalCamera:'Not covered by this synthetic test; see product/physical-camera-inference.json for separate physical-device results'");p.write_text(s,encoding='utf-8')
records=[]
for p in sorted((r/'database/postgres').glob('000*.sql')):records.append({'file':str(p.relative_to(r)).replace('\\','/'),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'cloudExecuted':False})
(r/'docs/product/MIGRATION_HASHES.json').write_text(json.dumps(records,indent=2)+'\n',encoding='utf-8')
print('Exact SQL hashes recorded; no SQL execution on Cloud')
