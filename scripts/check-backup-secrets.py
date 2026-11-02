import json,hashlib,re
from pathlib import Path
r=Path(__file__).resolve().parents[1];b=r/'backups/pre-blue-white-redesign'
doc=json.loads((b/'manifest.json').read_text(encoding='utf-8'))
print({'manifestType':type(doc).__name__,'manifestKeys':list(doc) if isinstance(doc,dict) else 'list'})
