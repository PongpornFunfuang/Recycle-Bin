from pathlib import Path
r=Path(__file__).resolve().parents[1]
for n in ['admin','member']:
 p=r/f'web/src/app/api/{n}/route.ts';s=p.read_text(encoding='utf-8').replace('const body=await readJson(req,40000);','const body=z.record(z.string(),z.any()).parse(await readJson(req,40000));');s=s.replace('(r.data??[]).map((v:Record<string,unknown>)','(r.data as unknown as Record<string,unknown>[]??[]).map((v:Record<string,unknown>)');p.write_text(s,encoding='utf-8')
p=r/'web/src/app/api/scans/route.ts';s=p.read_text(encoding='utf-8').replace("import {readJson}","import {z} from 'zod';\nimport {readJson}").replace('const raw=await readJson(req,155000);','const raw=z.object({result:z.unknown(),receipt:z.string().max(2048)}).parse(await readJson(req,155000));');p.write_text(s,encoding='utf-8')
p=r/'web/tests/receipt.test.ts';s=p.read_text(encoding='utf-8').replace("verifyScan(token,{...result,quality:'dark'},", "verifyScan(token,Object.assign({},result,{quality:'dark'}),");p.write_text(s,encoding='utf-8')
p=r/'web/tests/camera-smoke.cjs';s=p.read_text(encoding='utf-8').replace("await page.getByRole('button',{name:'หยุด',exact:true}).click();const atStop=calls;", "await page.waitForFunction(()=>document.querySelector('aside')?.textContent.includes('fasterrcnn-'));await page.waitForTimeout(500);const atStop=calls;");s=s.replace("'../docs/evidence/camera-smoke.json'","'../docs/evidence/product/camera-smoke.json'");p.write_text(s,encoding='utf-8')
print('Type fixes and frozen-snapshot camera regression updated')
