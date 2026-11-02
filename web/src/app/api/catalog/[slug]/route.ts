import {generalGuidance} from '@/lib/general-guidance';
import {NextRequest,NextResponse} from 'next/server';
import {createClient} from '@supabase/supabase-js';
import {databaseConfig} from '@/lib/config';
import {referenceItem} from '@/lib/guide-data';
import {error} from '@/lib/http';
export async function GET(req:NextRequest,{params}:{params:Promise<{slug:string}>}){const {slug}=await params;if(!/^[a-z0-9-]{1,100}$/.test(slug))return error('ไม่พบรายการ',404);const reference=referenceItem(slug);try{const config=databaseConfig();if(config){const db=createClient(config.url,config.key,{auth:{persistSession:false}});const {data,error:e}=await db.from('waste_items').select('id,slug,name,synonyms,item_materials(material_categories(id,name))').eq('slug',slug).eq('status','published').maybeSingle();if(data&&!e)return NextResponse.json({source:'database',generalGuidance:generalGuidance(slug),item:data,reference:reference??null});if(!reference&&!e)return error('ไม่พบรายการที่เผยแพร่',404);}}catch{}return reference?NextResponse.json({source:'reference',generalGuidance:generalGuidance(slug),item:{id:null,slug,name:reference.name,item_materials:[]},reference}):error('ยังอ่านรายการนี้ไม่ได้',503);}
