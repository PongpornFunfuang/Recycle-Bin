"""Read and hash current work before continuation edits; no Git mutation/secrets."""
from pathlib import Path
import hashlib,json,datetime,subprocess
r=Path(__file__).resolve().parents[1];out=r/'docs/evidence/continuation-2026-11-02';out.mkdir(exist_ok=True)
target=out/'recovery-baseline.json'
if target.exists():raise SystemExit('Continuation baseline exists; preserve it')
old=json.loads((r/'docs/product/FILE_CHANGES.json').read_text(encoding='utf-8'));review=[]
for x in old['files']:
 if x['status']=='Unchanged':continue
 p=r/x['path'];data=p.read_bytes();text=data.decode('utf-8-sig');review.append({'path':x['path'],'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),'matchesPriorReport':hashlib.sha256(data).hexdigest()==x['sha256'],'linesInspected':len(text.splitlines())})
ignored={'.git','.next','.venv','node_modules','.local','backups','__pycache__','.pytest_cache'};snapshot=[]
def walk(folder):
 for p in folder.iterdir():
  if p.is_symlink():continue
  if p.is_dir():
   if p.name not in ignored:walk(p)
  elif not(p.name.startswith('.env') and p.name!='.env.example') and p.suffix not in {'.pyc','.tsbuildinfo','.pth','.onnx'}:
   snapshot.append({'path':p.relative_to(r).as_posix(),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size})
walk(r)
manifest=json.loads((r/'backups/pre-blue-white-redesign/manifest.json').read_text(encoding='utf-8'));backup=[]
for x in manifest:
 p=r/'backups/pre-blue-white-redesign'/x['backup'];backup.append({'path':x['source'],'exists':p.is_file(),'hashMatches':p.is_file() and hashlib.sha256(p.read_bytes()).hexdigest()==x['sha256'],'sourceExists':(r/x['source']).exists()})
before=json.loads((r/'docs/evidence/ui-before-redesign/results.json').read_text(encoding='utf-8'));screens=[{'path':x['screenshot'],'exists':(r/'docs/evidence/ui-before-redesign'/x['screenshot']).is_file(),'sha256':hashlib.sha256((r/'docs/evidence/ui-before-redesign'/x['screenshot']).read_bytes()).hexdigest()} for x in before['rows'] if 'screenshot' in x]
report={'capturedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sourceReview':review,'files':snapshot,'backup':backup,'originalScreenshots':screens,'git':'Not a Git repository; status failed. No reset/init/commit performed.','priorVerification':json.loads((r/'docs/evidence/product/verification-results.json').read_text(encoding='utf-8'))}
with target.open('x',encoding='utf-8') as f:json.dump(report,f,ensure_ascii=False,indent=2)
print(json.dumps({'reportedChangedTextFilesInspected':len(review),'changedSincePriorReport':[x['path'] for x in review if not x['matchesPriorReport']],'backupFiles':len(backup),'backupPass':all(x['hashMatches'] and x['sourceExists'] for x in backup),'originalScreenshots':len(screens),'baselineFiles':len(snapshot)}))
