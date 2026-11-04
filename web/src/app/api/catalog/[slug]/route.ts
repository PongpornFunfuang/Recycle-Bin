import {resolveWasteKnowledge} from '@/lib/knowledge-catalog';
import {NextRequest,NextResponse} from 'next/server';
import {createClient} from '@supabase/supabase-js';
import {databaseConfig} from '@/lib/config';
import {referenceItem} from '@/lib/guide-data';
import {error} from '@/lib/http';
import {publicKnowledgeRows} from '@/lib/waste-knowledge-server';
import {resolvePublishedKnowledge} from '@/lib/waste-knowledge-overrides';
function displayGuidance(slug:string,name:string,materials:string[]){const {entry}=resolveWasteKnowledge({slug,name,materials});if(!entry||entry.cases.length!==1)return null;const advice=entry.cases[0];return {steps:advice.steps,caution:advice.caution,scope:entry.scope,source:{title:'คำแนะนำการคัดแยกทั่วไป',reference:entry.sourceUrl,checkedAt:entry.checkedAt}};}
export async function GET(_req:NextRequest,{params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;if(!/^[a-z0-9-]{1,100}$/.test(slug))return error('ไม่พบรายการ',404);
 const reference=referenceItem(slug);
 let overrides;
 try{overrides=await publicKnowledgeRows();}catch{return error('ยังตรวจสถานะเผยแพร่ไม่ได้',503);}
 try{const config=databaseConfig();if(config){const db=createClient(config.url,config.key,{auth:{persistSession:false}});const {data,error:dbError}=await db.from('waste_items').select('id,slug,name,synonyms,item_materials(material_categories(id,name))').eq('slug',slug).eq('status','published').maybeSingle();
 if(data&&!dbError){const materials=(data.item_materials??[]).flatMap(link=>{return link.material_categories.map(material=>material.name);});if(reference?.material)materials.push(reference.material);const resolved=resolvePublishedKnowledge({slug,name:data.name,materials},overrides);if(resolved.hidden)return error('รายการนี้ปิดเผยแพร่',404);return NextResponse.json({source:'database',generalGuidance:displayGuidance(slug,data.name,materials),item:data,reference:reference??null,knowledge:resolved.entry});}
 if(!reference&&!dbError&&!overrides.some(row=>row.slug===slug&&row.visibility==='published'))return error('ไม่พบรายการที่เผยแพร่',404);}}
 catch{}
 const published=overrides.find(row=>row.slug===slug&&row.visibility==='published')?.content;
 const resolved=resolvePublishedKnowledge({slug,name:reference?.name??published?.name??slug,materials:reference?.material?[reference.material]:[]},overrides);
 if(resolved.hidden)return error('รายการนี้ปิดเผยแพร่',404);
 if(reference||published)return NextResponse.json({source:published?'admin':'reference',generalGuidance:null,item:{id:null,slug,name:published?.name??reference?.name??slug,item_materials:[]},reference:reference??null,knowledge:resolved.entry});
 return error('ยังอ่านรายการนี้ไม่ได้',503);
}
