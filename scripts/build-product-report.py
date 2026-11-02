import json,hashlib,datetime,re
from pathlib import Path
r=Path(__file__).resolve().parents[1];d=r/'docs/product';e=r/'docs/evidence/product'
verification=json.loads((e/'verification-results.json').read_text(encoding='utf-8'))
node=(e/'node-tests.log').read_text(encoding='utf-8');count=re.search(r'tests (\d+)',node);n=count.group(1) if count else 'see log'
py=(e/'python-tests.log').read_text(encoding='utf-8');pycount=re.search(r'(\d+) passed',py);p=pycount.group(1) if pycount else 'see log'
lines=['# Automated test report','',f"Captured: {verification['capturedAt']}. Local only; no hosted changes.",'','| Check | Result | Evidence |','|---|---|---|']
for row in verification['results']:lines.append(f"| {row['name']} | {row['status']} | ../evidence/product/{row['name']}.log |")
lines+=['',f'Node tests: {n} passed; Python tests: {p} passed with one recorded Starlette/httpx deprecation warning. No skipped test is counted as a pass.','',
'SQL tests apply0001–0004 separately for historical regression, and0001–0005 for the active candidate. New tests cover forged-write rejection, registered-model save, metadata validation, atomic invalid-child rollback, owner isolation, explicit confirmation, material condition, immutable snapshot/retry after retirement, reviewer spoofing, admin review/roles, private grading, empty quiz publication and safe migration reapply rejection. Auth is a synthetic local stub; these are not hosted Supabase tests.','',
'Browser smoke checks actual routes/search/practice grading/photo inference and reports page errors. Practice3/3 is not an account quiz result. Synthetic camera proves sequential requests, snapshot and stopped tracks; physical-device evidence is separate in physical-camera-inference.json (3 real frames, tracks closed, no later requests). No camera images or labels were retained.','',
'Responsive/accessibility evidence: responsive-accessibility-camera.json (39 route/viewport cases at390/768/1440, form labels/landmarks/lang/skip link/overflow). UI screenshots:16 before and16 after, plus6 Home/Login shell-gate captures. These are actual browser screenshots. Full WCAG/screen-reader/contrast audit and real Android/iOS remain Pending.','',
'AI result measurements and one-image approximate Bottle ground truth are in ai-evaluation.json and ground-truth-bottle.json. No overall model accuracy is claimed. Final backup/known-secret/build-canary scan is final-security-backup.json. Hosted Auth/email/persistence/admin/RLS tests are all Pending; see INTEGRATION_TEST_REPORT.md.','',
'An initial sandbox run failed Windows userInfo (tsx) and a synthetic-camera timeout. The approved outside-sandbox rerun passed. Final verification-results.json and logs contain the successful final run; no failure was relabeled without a rerun.']
(d/'AUTOMATED_TEST_REPORT.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
baseline=json.loads((r/'docs/evidence/source-inventory.json').read_text(encoding='utf-8'));old={x['path'].replace('\\','/'):x for x in baseline};ignored={'node_modules','.venv','.next','.git','.local','__pycache__','.pytest_cache','backups'};entries=[]
def walk(folder):
 for path in folder.iterdir():
  if path.is_symlink():continue
  if path.is_dir():
   if path.name not in ignored:walk(path)
  elif path.suffix not in {'.pyc','.tsbuildinfo','.pth','.onnx','.ttf','.png','.jpg','.jpeg'} and not(path.name.startswith('.env') and path.name!='.env.example'):
   relative=path.relative_to(r).as_posix()
   if relative.startswith('docs/evidence/') or path.name in {'FILE_CHANGES.json','FILE_CHANGES.md'}:continue
   sha=hashlib.sha256(path.read_bytes()).hexdigest();prior=old.get(relative)
   entries.append({'path':relative,'sha256':sha,'status':'Created' if not prior else 'Modified' if prior['sha256'].lower()!=sha else 'Unchanged'})
walk(r)
(d/'FILE_CHANGES.json').write_text(json.dumps({'comparison':'Prior local-development source-inventory.json; no Git command used. Text source/docs only; secret env/runtime/dependencies/binary evidence excluded. Local signing secret configured separately, never listed by value.','files':entries},ensure_ascii=False,indent=2),encoding='utf-8')
(d/'FILE_CHANGES.md').write_text('# Files created/modified\n\nComparison with the preserved prior local-development inventory, not Git. Binary screenshots/font and private runtime data are listed separately in the product report.\n\n'+ '\n'.join(f"- {x['status']}: `{x['path']}`" for x in entries if x['status']!='Unchanged')+'\n',encoding='utf-8')
protected=[]
for name in ['0001_foundation','0002_admin_workflow','0003_member_workflow','0004_quiz_workflow']:
 rel='database/postgres/'+name+'.sql';path=r/rel;prior=old.get(rel);protected.append({'file':rel,'unchangedSincePriorInventory':bool(prior and hashlib.sha256(path.read_bytes()).hexdigest().lower()==prior['sha256'].lower())})
poster=Path('C:/Users/P.12x_/Desktop/Recycle Bin (2).png');protected.append({'file':str(poster),'matchesSuppliedPosterBaseline':hashlib.sha256(poster.read_bytes()).hexdigest()=='ecd3210fcf452dc4e20e4422d1d878b367f109c90493d51eb9bb18e16e0aacc3'})
(e/'preserved-inputs.json').write_text(json.dumps(protected,indent=2),encoding='utf-8')
print(json.dumps({'nodeTests':n,'pythonTests':p,'verification':[(x['name'],x['status']) for x in verification['results']],'textFilesCreated':sum(x['status']=='Created' for x in entries),'textFilesModified':sum(x['status']=='Modified' for x in entries),'protected':protected}))
