"""Redact callback query credentials from generated local runtime logs only."""
import re,json,datetime
from pathlib import Path
root=Path(__file__).resolve().parents[1]
changed=[]
for folder in [root/'.local/logs',root/'web/.next/dev/logs']:
    if not folder.exists():
        continue
    for path in folder.glob('*.log'):
        original=path.read_text(encoding='utf-8',errors='replace')
        redacted,count=re.subn(r'(/auth/callback)\?[^\s\x1b]*',r'\1?[REDACTED_AUTH_QUERY]',original)
        if count and original!=redacted:
            path.write_text(redacted,encoding='utf-8')
            changed.append({'path':str(path.relative_to(root)),'callbackQueriesRedacted':count})
report={'capturedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'scope':'Generated local runtime logs only; no source documents, backup, Git or database touched','changed':changed,'secretValuesPrinted':False}
(root/'docs/evidence/cloud-migration-fdmohzvuxvsrcaddbjvl/auth-log-redaction.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps({'filesRedacted':len(changed),'secretValuesPrinted':False}))
