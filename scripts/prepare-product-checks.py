from pathlib import Path
r=Path(__file__).resolve().parents[1]
p=r/'web/tests/browser-smoke.cjs';s=p.read_text(encoding='utf-8').replace("path.resolve('../docs/evidence')","path.resolve('../docs/evidence/product')").replace("'/admin']","'/admin','/categories','/guide/bottle','/knowledge/prepare-recycling','/settings','/learning']");p.write_text(s,encoding='utf-8')
# Only inspect presence, never emit local values.
p=r/'web/.env.local';lines=p.read_text(encoding='utf-8').splitlines() if p.exists() else []
print({'localSigningConfigured':any(s.startswith('SCAN_RECEIPT_SECRET=') and len(s.split('=',1)[1])>=32 for s in lines),'cloudKeysConfigured':any(s.startswith('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_') for s in lines)})
