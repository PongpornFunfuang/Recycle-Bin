import hashlib,importlib.metadata,json,subprocess
from pathlib import Path
root=Path(__file__).resolve().parents[1]
evidence=root/'docs/evidence'
python=[]
for d in importlib.metadata.distributions():
    python.append({'name':d.metadata['Name'],'version':d.version,'license':d.metadata.get('License-Expression') or (d.metadata.get('License') or '')[:700],'licenseClassifiers':[v for v in d.metadata.get_all('Classifier',[]) if v.startswith('License')]})
(evidence/'python-dependencies.json').write_text(json.dumps(sorted(python,key=lambda v:v['name'].lower()),indent=2),encoding='utf-8')
baseline=json.loads((root/'docs/milestone-1/local-development-baseline-2026-11-01.json').read_text(encoding='utf-8-sig'))
checks=[]
for entry in baseline['files']:
    p=Path(entry['path']);actual=hashlib.sha256(p.read_bytes()).hexdigest().upper()
    checks.append({'path':str(p),'unchanged':actual==entry['sha256'],'before':entry['sha256'],'after':actual})
(evidence/'file-protection-check.json').write_text(json.dumps(checks,indent=2),encoding='utf-8')
ignored={'.venv','node_modules','.next','__pycache__','.pytest_cache','.local','.git','backups'}
created=[]
def walk(directory):
 for p in directory.iterdir():
  if p.is_dir() and p.name not in ignored:walk(p)
  elif p.is_file():
   if p.suffix in {'.pyc','.tsbuildinfo'} or (p.name.startswith('.env') and p.name!='.env.example'):continue
   if p==evidence/'source-inventory.json':continue
   created.append({'path':str(p.relative_to(root)).replace('\\','/'),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
walk(root)
(evidence/'source-inventory.json').write_text(json.dumps(created,indent=2),encoding='utf-8')
print(json.dumps({'baselineEntries':len(checks),'unchanged':sum(c['unchanged'] for c in checks),'modified':[c['path'] for c in checks if not c['unchanged']],'inventoryFiles':len(created)}))
