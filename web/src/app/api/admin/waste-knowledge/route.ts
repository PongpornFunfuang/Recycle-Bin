import {NextRequest,NextResponse} from 'next/server';
import {ZodError} from 'zod';
import {items} from '@/lib/catalog';
import {knowledgeForSlug} from '@/lib/knowledge-catalog';
import {knowledgeAdmin} from '@/lib/waste-knowledge-server';
import {knowledgeMutationSchema,validateKnowledgeForPublish} from '@/lib/waste-knowledge-schema';
import {normalizeKnowledgeEntry} from '@/lib/waste-knowledge-overrides';
import {error,sameOrigin} from '@/lib/http';
import {readJson} from '@/lib/read-json';
import type {KnowledgeEntry} from '@/lib/knowledge-catalog';

export async function GET(req:NextRequest){
 try{
  const auth=await knowledgeAdmin();if(!auth.db)return error('ต้องเข้าสู่ระบบด้วยสิทธิ์ Admin บน Test Project',auth.status);
  const result=await auth.db.from('waste_knowledge_items').select('slug,visibility,row_version,latest_version,published_version,updated_at,updated_by,waste_knowledge_revisions!waste_knowledge_revisions_slug_fkey(version,content,editor_id,created_at)').order('updated_at',{ascending:false});
  if(result.error)return error('ยังไม่ติดตั้ง Knowledge Migration หรืออ่านข้อมูลไม่ได้',503);
  const existing=(result.data??[]).map(row=>{const staticItem=items.find(item=>item.id===row.slug);return {slug:row.slug,visibility:row.visibility,rowVersion:row.row_version,latestVersion:row.latest_version,publishedVersion:row.published_version,updatedAt:row.updated_at,updatedBy:row.updated_by,revisions:row.waste_knowledge_revisions??[],entry:row.latest_version===0&&staticItem?(knowledgeForSlug(row.slug)??{id:row.slug,name:staticItem.name,english:staticItem.english,icon:staticItem.icon,sourceUrl:'',checkedAt:'',scope:'general' as const,cases:[]}):undefined};});
  const slugs=new Set(existing.map(row=>row.slug));
  const baseline=items.filter(item=>!slugs.has(item.id)).map(item=>({slug:item.id,visibility:'baseline',rowVersion:0,latestVersion:0,publishedVersion:null,updatedAt:null,updatedBy:null,revisions:[],entry:knowledgeForSlug(item.id)??{id:item.id,name:item.name,english:item.english,icon:item.icon,sourceUrl:'',checkedAt:'',scope:'general',cases:[]}}));
  const merged=[...existing,...baseline];
  const q=req.nextUrl.searchParams.get('q')?.trim().toLocaleLowerCase()??'';
  const status=req.nextUrl.searchParams.get('status')??'all';
  const category=req.nextUrl.searchParams.get('category')??'all';
  const filtered=merged.filter(row=>{
   const latest=[...row.revisions].sort((a,b)=>b.version-a.version)[0];
   const entry=(latest?.content??('entry' in row?row.entry:null)) as KnowledgeEntry|null;
   return (status==='all'||row.visibility===status)&&(category==='all'||entry?.cases.some(c=>c.category===category))&&(!q||[row.slug,entry?.name??'',...(entry?.aliases??[])].join(' ').toLocaleLowerCase().includes(q));
  });
  const page=Math.max(1,Math.min(10000,Number(req.nextUrl.searchParams.get('page'))||1));
  return NextResponse.json({items:filtered.slice((page-1)*20,page*20),total:filtered.length,page,pageSize:20},{headers:{'Cache-Control':'no-store'}});
 }catch{return error('Admin Knowledge Test ยังไม่พร้อม',503);}
}
export async function POST(req:NextRequest){
 if(!sameOrigin(req))return error('Origin ไม่ถูกต้อง',403);
 try{
  const auth=await knowledgeAdmin();if(!auth.db)return error('ต้องเข้าสู่ระบบด้วยสิทธิ์ Admin บน Test Project',auth.status);
  const input=knowledgeMutationSchema.parse(await readJson(req,40000));
  if(input.action==='save'){
   if(input.entry.id!==input.slug)return error('Stable Slug ไม่ตรงกับรายการ',422);
   const entry=normalizeKnowledgeEntry(input.entry as KnowledgeEntry);
   const all=await auth.db.from('waste_knowledge_items').select('slug,waste_knowledge_revisions!waste_knowledge_revisions_slug_fkey(content)');
   if(all.error)return error('ตรวจข้อมูลซ้ำไม่ได้',503);
   const aliases=new Set([entry.name,...(entry.aliases??[])].map(v=>v.normalize('NFKC').trim().toLocaleLowerCase()));
   for(const item of items){if(item.id!==input.slug&&[item.name,item.english,...item.keywords].some(v=>aliases.has(v.normalize('NFKC').trim().toLocaleLowerCase())))return error('ชื่อหรือ Alias ซ้ำกับรายการเดิม',409);}
   for(const row of all.data??[]){if(row.slug===input.slug)continue;for(const revision of row.waste_knowledge_revisions??[]){const other=revision.content as KnowledgeEntry;if([other.name,...(other.aliases??[])].some(v=>aliases.has(v.normalize('NFKC').trim().toLocaleLowerCase())))return error('ชื่อหรือ Alias ซ้ำกับรายการอื่น',409);}}
   const result=await auth.db.rpc('admin_save_waste_knowledge',{p_slug:input.slug,p_content:entry,p_expected_version:input.expectedVersion});
   if(result.error)return error(result.error.message.includes('version_conflict')?'มีผู้แก้ไขรายการนี้แล้ว กรุณาโหลดข้อมูลใหม่':'บันทึกร่างไม่ได้',result.error.message.includes('version_conflict')?409:422);
   return NextResponse.json({version:result.data,message:'บันทึกร่างแล้ว'});
  }
  if(input.action==='publish'){
   const row=await auth.db.from('waste_knowledge_revisions').select('content').eq('slug',input.slug).order('version',{ascending:false}).limit(1).single();
   if(row.error)return error('ไม่พบฉบับร่าง',404);
   try{validateKnowledgeForPublish(row.data.content);}catch(e){
    if(e instanceof ZodError){
     const details=e.issues.slice(0,4).map(issue=>`${issue.path.join('.')||'ข้อมูล'}: ${issue.message}`).join(' · ');
     return error(`ข้อมูลเผยแพร่ไม่ครบหรือไม่ถูกต้อง${details?` — ${details}`:''}`,422);
    }
    return error('ข้อมูลเผยแพร่ไม่ครบหรือไม่ถูกต้อง',422);
   }
  }
  if(input.action==='unpublish'&&input.expectedVersion===0&&!items.some(item=>item.id===input.slug))return error('ไม่พบรายการตั้งต้น',404);
  const result=input.action==='publish'
   ?await auth.db.rpc('admin_publish_waste_knowledge',{p_slug:input.slug,p_expected_version:input.expectedVersion})
   :await auth.db.rpc('admin_unpublish_waste_knowledge',{p_slug:input.slug,p_expected_version:input.expectedVersion});
  if(result.error)return error(result.error.message.includes('version_conflict')?'ข้อมูลเปลี่ยนแล้ว กรุณาโหลดใหม่':'เปลี่ยนสถานะไม่ได้',result.error.message.includes('version_conflict')?409:422);
  return NextResponse.json({message:input.action==='publish'?'เผยแพร่แล้ว':'ปิดเผยแพร่แล้ว'});
 }catch(e){return error(e instanceof ZodError?'ข้อมูลฟอร์มไม่ถูกต้อง':'ระบบยังไม่พร้อม',e instanceof ZodError?422:503);}
}
