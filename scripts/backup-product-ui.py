"""Create and verify a secret-free, non-serving copy before any UI redesign.

Never overwrites an existing backup and never restores application files.
"""
import datetime,hashlib,json,shutil
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
TARGET=ROOT/'backups/pre-blue-white-redesign'
EXCLUDED={'node_modules','.next','.venv','__pycache__','.pytest_cache','.local','.git'}
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
if TARGET.exists():raise SystemExit('Backup already exists: verify/preserve it; do not overwrite')
sources=[];excluded=[]
def visit(folder):
 for p in sorted(folder.iterdir()):
  if p.is_symlink():excluded.append({'path':str(p.relative_to(ROOT)),'reason':'symlink; do not follow external content'});continue
  if p.is_dir():
   if p.name in EXCLUDED:excluded.append({'path':str(p.relative_to(ROOT)),'reason':'dependency/runtime/build/cache/Git data excluded'})
   else:visit(p)
  elif p.name.startswith('.env') and p.name!='.env.example':excluded.append({'path':str(p.relative_to(ROOT)),'reason':'environment secrets excluded; values not read'})
  elif p.suffix in {'.log','.tsbuildinfo','.pyc'}:excluded.append({'path':str(p.relative_to(ROOT)),'reason':'generated/temporary output'})
  else:sources.append(p)
visit(ROOT/'web')
for relative in ['README.md','docs/ARCHITECTURE_CURRENT.md','docs/LOCAL_DEVELOPMENT_REPORT.md','docs/DEMO_SCRIPT.md','docs/milestone-1/compatibility-supabase.md']:
 p=ROOT/relative
 if p.exists():sources.append(p)
TARGET.mkdir(parents=True)
manifest=[]
for source in sources:
 relative=source.relative_to(ROOT);dest=TARGET/'files'/relative
 dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(source,dest)
 manifest.append({'source':str(relative).replace('\\','/'),'backup':'files/'+str(relative).replace('\\','/'),'bytes':source.stat().st_size,'sha256':digest(source)})
def scan(p):
 if p.suffix.lower() not in {'.ts','.tsx','.js','.mjs','.cjs','.json','.md','.example','.css','.yaml','.yml'}:return []
 text=p.read_text(encoding='utf-8-sig',errors='replace');findings=[]
 import re
 for pattern in [r'sb_secret_[A-Za-z0-9_-]{24,}',r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----',r'postgres(?:ql)?://[^\s:]+:[^\s@]+@']:
  if re.search(pattern,text):findings.append(pattern)
 # No raw .env file is ever copied, even if this scan would not recognize a key.
 return findings
findings=[{'path':m['backup'],'patterns':scan(TARGET/m['backup'])} for m in manifest if scan(TARGET/m['backup'])]
checks=[{'path':m['source'],'backupMatchesSource':digest(TARGET/m['backup'])==m['sha256']==digest(ROOT/m['source'])} for m in manifest]
report={'capturedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'PASS' if all(c['backupMatchesSource'] for c in checks) and not findings else 'FAIL','files':len(manifest),'checks':checks,'secretPatternFindings':findings,'secretScope':'Raw credential env files excluded. Pattern scan of copied text files only; fake synthetic fixtures/key names are not credentials.','outsideNextBuildAndPublic':not TARGET.is_relative_to(ROOT/'web'),'restorePerformed':False,'restoreGuideValidation':'Every source/destination resolves inside workspace and SHA-256 matches; no restore executed.'}
(TARGET/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
(TARGET/'excluded.json').write_text(json.dumps(excluded,indent=2),encoding='utf-8')
(TARGET/'verification.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
(TARGET/'RESTORE.md').write_text('''# Original Codex UI backup — manual restore only

This backup is outside web/public and Next.js build inputs. Do not copy it into public assets. Never restore automatically.

1. Stop only the project's frontend process and back up the current working source to a different location first. Keep the existing backups.
2. Review manifest.json. Each `source` is relative to the project root; `backup` identifies its byte-for-byte copy. Verify SHA-256 before copying.
3. Review the changes to backend/API/database since this backup. Restoring old frontend source does not roll back database migrations or hosted configuration. Do not restore SQL/cloud state as part of this operation.
4. Preview an individual copy in PowerShell (run from the project root):

```powershell
Get-FileHash -LiteralPath '.\\backups\\pre-blue-white-redesign\\files\\web\\src\\app\\globals.css' -Algorithm SHA256
Copy-Item -LiteralPath '.\\backups\\pre-blue-white-redesign\\files\\web\\src\\app\\globals.css' -Destination '.\\web\\src\\app\\globals.css' -WhatIf
```

5. Only after deciding which files to restore, manually remove `-WhatIf` for those reviewed copies. To restore the full frontend, review and copy every web/ entry from manifest, preserving relative paths. Do not bulk copy dependencies, env secrets or build caches.
6. New product files created after this snapshot are not automatically deleted. Review route/component compatibility manually. Never use recursive delete, Git reset or automatic cleanup as a restore method.
7. If dependencies changed, review the original package.json + pnpm-lock.yaml together and run project-scoped `pnpm install --frozen-lockfile --store-dir ../.local/pnpm-store --ignore-scripts` inside web. Do not reinstall globally.
8. Run Typecheck/build/tests, then start on 127.0.0.1 and compare with docs/evidence/ui-before-redesign. Preserve test reports from both versions.

Credentials were deliberately not backed up. Supply approved local configuration separately; never recover secrets from screenshots/logs. No actual restore was performed during backup validation.
''',encoding='utf-8')
print(json.dumps({'status':report['status'],'files':len(manifest),'secretFindings':len(findings),'outsideNextBuildAndPublic':report['outsideNextBuildAndPublic'],'restorePerformed':False}))
if report['status']!='PASS':raise SystemExit(1)
