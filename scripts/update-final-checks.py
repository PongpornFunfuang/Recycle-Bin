from pathlib import Path
r=Path(__file__).resolve().parents[1]
p=r/'scripts/product-browser-checks.cjs';p.write_text(p.read_text(encoding='utf-8').replace("skipLink!=='#main'","skipLink!=='#main-content'"),encoding='utf-8')
p=r/'web/tests/browser-smoke.cjs';p.write_text(p.read_text(encoding='utf-8').replace('/knowledge/prepare-recycling','/knowledge/prediction-and-confirmation'),encoding='utf-8')
