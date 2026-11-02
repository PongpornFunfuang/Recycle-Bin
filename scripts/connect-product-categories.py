from pathlib import Path
r=Path(__file__).resolve().parents[1]
p=r/'web/src/app/api/public/[section]/route.ts';s=p.read_text(encoding='utf-8').replace("select('id,slug,name,synonyms')","select('id,slug,name,synonyms,category_id')").replace("if(section==='knowledge')", "if(section==='categories'){const result=await db.from('waste_categories').select('id,slug,name').is('archived_at',null).limit(100);return result.error?error('อ่านหมวดหมู่ไม่ได้',503):NextResponse.json({items:result.data});}if(section==='knowledge')");p.write_text(s,encoding='utf-8')
p=r/'web/src/components/guide.tsx';s=p.read_text(encoding='utf-8').replace('useState<WasteItem[]>([])','useState<(WasteItem&{categoryId?:string})[]>([])').replace("const [query,setQuery]","const [dbCategories,setDbCategories]=useState<{id:string;name:string}[]>([]);\n const [query,setQuery]")
s=s.replace("fetch('/api/public/catalog'", "fetch('/api/public/categories',{signal:controller.signal}).then(r=>r.json()).then(d=>setDbCategories(d.items??[])).catch(()=>{});fetch('/api/public/catalog'")
s=s.replace('name:string;synonyms:string[]','name:string;synonyms:string[];category_id?:string').replace('({id:i.slug,name:i.name','({id:i.slug,categoryId:i.category_id,name:i.name')
s=s.replace('guideGroup(i)===group',"guideGroup(i)===group||('categoryId' in i&&i.categoryId===group)").replace('{guideGroups.map(g=>','{[...guideGroups,...dbCategories].map(g=>')
p.write_text(s,encoding='utf-8')
p=r/'web/src/app/product.css';s=p.read_text(encoding='utf-8')+'\n@media(max-width:600px){.item-card p,.detection p,.detection li{font-size:13px}.item-card .text-link{font-size:12px}.notice{font-size:12px}.bottom-nav a{font-size:10px}.page-intro{font-size:14px}.item-card h2{font-size:20px}}\n';p.write_text(s,encoding='utf-8')
print('Database-backed categories wired; mobile readability improved')
