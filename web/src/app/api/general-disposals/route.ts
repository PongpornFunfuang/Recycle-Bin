import {NextRequest,NextResponse} from 'next/server';
import {createClient} from '@supabase/supabase-js';
import {z} from 'zod';
import {databaseConfig} from '@/lib/config';
import {supabaseServer} from '@/lib/supabase-server';
import {verifiedScanWriter} from '@/lib/supabase-privileged';
import {generalConfirmationSnapshot,generalGuidanceVersion} from '@/lib/general-confirmation';
import {sameOrigin,error} from '@/lib/http';
import {readJson} from '@/lib/read-json';

export async function GET(){try{
 const config=databaseConfig();if(!config)return error('ฐานข้อมูลยังไม่พร้อม',503);
 const db=createClient(config.url,config.key,{auth:{persistSession:false}});
 const [probe,items]=await Promise.all([db.rpc('general_disposal_readiness'),db.from('waste_items').select('id,slug,name').eq('status','published').is('archived_at',null).limit(200)]);
 if(items.error)return error('อ่านรายการขยะไม่ได้',503);
 return NextResponse.json({available:!probe.error&&probe.data===1&&!!verifiedScanWriter(),version:generalGuidanceVersion,items:(items.data??[]).flatMap(item=>{const guidance=generalConfirmationSnapshot(item);return guidance?[{...item,guidance}]:[];})},{headers:{'Cache-Control':'no-store'}});
 }catch{return error('ระบบยืนยันตามคำแนะนำทั่วไปยังไม่พร้อม',503);}}
const input=z.object({eventId:z.uuid(),itemId:z.uuid(),guidanceVersion:z.literal(generalGuidanceVersion),quantity:z.number().int().min(1).max(100),disposedAt:z.iso.datetime(),confirmed:z.literal(true),predictionId:z.uuid().nullable(),detectionId:z.uuid().nullable()}).strict();
export async function POST(req:NextRequest){if(!sameOrigin(req))return error('Origin ไม่ถูกต้อง',403);try{
 const db=await supabaseServer();if(!db)return error('ระบบบัญชียังไม่พร้อม',503);
 const {data:{user}}=await db.auth.getUser();if(!user)return error('เข้าสู่ระบบก่อนยืนยัน',401);
 const body=input.parse(await readJson(req,4000));
 const writer=verifiedScanWriter();if(!writer)return error('ระบบบันทึกฝั่ง Server ยังไม่พร้อม',503);
 const prior=await db.from('confirmed_disposals').select('id,item_id,quantity,disposed_at,prediction_id,detection_id,guidance_scope,rule_snapshot').eq('user_id',user.id).eq('client_event_id',body.eventId).maybeSingle();
 if(prior.error)return error('ตรวจรายการเดิมไม่ได้',503);
 if(prior.data){const row=prior.data;if(row.guidance_scope!=='general'||row.item_id!==body.itemId||row.quantity!==body.quantity||new Date(row.disposed_at).getTime()!==new Date(body.disposedAt).getTime()||row.prediction_id!==body.predictionId||row.detection_id!==body.detectionId||row.rule_snapshot?.version!==body.guidanceVersion)return error('รายการส่งซ้ำมีข้อมูลต่างจากเดิม',409);return NextResponse.json({confirmed:true,id:row.id},{headers:{'Cache-Control':'no-store'}});}
 const item=await db.from('waste_items').select('id,slug,name').eq('id',body.itemId).eq('status','published').is('archived_at',null).maybeSingle();
 const snapshot=item.data?generalConfirmationSnapshot(item.data):null;if(item.error||!snapshot)return error('รายการนี้ยังไม่มีคำแนะนำทั่วไปที่พร้อมใช้',400);
 const saved=await writer.rpc('confirm_general_disposal',{p_user:user.id,p_event:body.eventId,p_item:body.itemId,p_quantity:body.quantity,p_disposed_at:body.disposedAt,p_confirmed:body.confirmed,p_snapshot:snapshot,p_prediction:body.predictionId,p_detection:body.detectionId});
 return saved.error?error('บันทึกไม่ได้ ตรวจสิทธิ์ รุ่นข้อมูล หรือรายการอ้างอิง',400):NextResponse.json({confirmed:true,id:saved.data},{headers:{'Cache-Control':'no-store'}});
 }catch{return error('ข้อมูลยืนยันไม่ถูกต้อง กรุณาตรวจรายการและจำนวน',400);}}
