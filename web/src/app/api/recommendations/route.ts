import {loadVerifiedLocations,filterLocations} from '@/lib/verified-locations';
import {generalGuidance} from '@/lib/general-guidance';
import {NextRequest,NextResponse} from 'next/server';
import {createClient} from '@supabase/supabase-js';
import {databaseConfig} from '@/lib/config';
import {itemForClass} from '@/lib/catalog';
export async function GET(req:NextRequest){const pending={verified:false,reason:'ยังไม่มีกฎพื้นที่ที่ผ่านการยืนยัน',ruleId:null,itemId:null,category:null,locations:[],bins:[],steps:[],sources:[],materials:[]};const response=(body:unknown)=>{const slug=req.nextUrl.searchParams.get('slug')??itemForClass(req.nextUrl.searchParams.get('label')??'')?.id??'';return NextResponse.json({...(body as object),generalGuidance:generalGuidance(slug)},{headers:{'Cache-Control':'no-store'}});};try{
 const config=databaseConfig();if(!config)return response({...pending,reason:'ระบบข้อมูลพื้นที่ยังไม่ได้เชื่อมต่อ'});
 const slug=req.nextUrl.searchParams.get('slug')??itemForClass(req.nextUrl.searchParams.get('label')??'')?.id;const material=req.nextUrl.searchParams.get('materialId')??'';if(!slug||slug.length>100)return response(pending);
 const db=createClient(config.url,config.key,{auth:{persistSession:false}});const [item,area]=await Promise.all([db.from('waste_items').select('id,waste_categories(id,slug,name),item_materials(material_categories(id,name))').eq('slug',slug).eq('status','published').is('archived_at',null).maybeSingle(),db.from('areas').select('id').eq('code','SPU_KK').is('archived_at',null).maybeSingle()]);if(!item.data||!area.data)return response(pending);
 const materials=(item.data.item_materials??[]).flatMap(m=>m.material_categories??[]);const context={...pending,itemId:item.data.id,category:item.data.waste_categories,materials};
 if(material&&!materials.some(m=>m.id===material))return response({...context,reason:'กรุณาเลือกวัสดุที่มีข้อมูลอ้างอิงสำหรับรายการนี้'});
 const rules=await db.from('disposal_rules').select('id,rule_key,version,conditions,steps,source_id').eq('item_id',item.data.id).eq('area_id',area.data.id).eq('status','verified').is('archived_at',null).order('version',{ascending:false}).limit(100);if(rules.error)return response(context);
 const latest=new Map<string,NonNullable<typeof rules.data>[number]>();for(const rule of rules.data??[])if(!latest.has(rule.rule_key))latest.set(rule.rule_key,rule);
 const matches=[...latest.values()].filter(r=>r.conditions&&typeof r.conditions==='object'&&(Object.keys(r.conditions).length===0||(Object.keys(r.conditions).length===1&&r.conditions.material_id===material&&material!=='')));
 if(matches.length!==1)return response({...context,reason:matches.length?'พบหลายกฎที่ใช้ได้ ต้องให้ผู้ดูแลตรวจสอบก่อน':'กรุณายืนยันวัสดุ หรือรอผู้ดูแลตรวจสอบกฎพื้นที่'});
 const rule=matches[0];const [source,bins]=await Promise.all([db.from('data_sources').select('title,reference,verified_at').eq('id',rule.source_id).eq('verification_status','verified').is('archived_at',null).maybeSingle(),db.from('rule_bins').select('waste_bins(id,color,code)').eq('rule_version_id',rule.id)]);if(source.error||!source.data||bins.error)return response(context);
 const allowedBins=(bins.data??[]).flatMap(b=>b.waste_bins??[]);const locations=filterLocations(await loadVerifiedLocations(db),'','',allowedBins.map(b=>b.id));
 return response({...context,locations,verified:true,ruleId:rule.id,materialId:material||null,bins:(bins.data??[]).flatMap(b=>b.waste_bins??[]),steps:rule.steps,sources:[source.data]});
 }catch{return response({...pending,reason:'ตรวจแหล่งอ้างอิงไม่ได้ในขณะนี้'});}}
