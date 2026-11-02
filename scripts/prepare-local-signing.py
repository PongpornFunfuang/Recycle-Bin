"""Create only a local signing key; never creates a cloud project/key or prints values."""
import re,secrets
from pathlib import Path
root=Path(__file__).resolve().parents[1];p=root/'web/.env.local'
if p.exists() and re.search(r'^(?:export\s+)?SCAN_RECEIPT_SECRET\s*=',p.read_text(encoding='utf-8-sig'),re.M):
 print('Existing signing configuration preserved (value not displayed)')
else:
 with p.open('a',encoding='utf-8') as f:f.write('\n# Local-only scan receipts; excluded from backup/Git.\nSCAN_RECEIPT_SECRET='+secrets.token_hex(32)+'\n')
 print('Local signing configuration prepared; no cloud values or secrets displayed')
