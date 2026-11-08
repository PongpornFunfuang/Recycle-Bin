import {z} from 'zod';
import {readJson} from '@/lib/read-json';
import {NextRequest,NextResponse} from 'next/server';
import {supabaseServer} from '@/lib/supabase-server';
import {verifiedScanWriter} from '@/lib/supabase-privileged';
import {detectionContract} from '@/lib/detection-contract';
import {receiptSecret,verifyScan} from '@/lib/scan-receipt';
import {sameOrigin,error} from '@/lib/http';
export async function POST(req:NextRequest){if(!sameOrigin(req))return error('Origin ไม่ถูกต้อง',403);if(Number(req.headers.get('content-length'))>155000)return error('ข้อมูลเกินขนาด',413);try{const client=await supabaseServer();if(!client)return error('ระบบบันทึกประวัติยังไม่ได้เชื่อมต่อ',503);const {data:{user}}=await client.auth.getUser();if(!user)return error('กรุณาเข้าสู่ระบบ',401);const raw=z.object({result:z.unknown(),receipt:z.string().max(2048)}).parse(await readJson(req,155000));const result=detectionContract.parse(raw.result);const secret=receiptSecret();const writer=verifiedScanWriter();if(!secret||!writer)return error('ระบบยืนยันแหล่งผลสแกนยังไม่พร้อม กรุณาติดต่อผู้ดูแล',503);if(typeof raw.receipt!=='string'||!verifyScan(raw.receipt,result,user.id,secret))return error('ผลสแกนถูกเปลี่ยน หมดอายุ หรือไม่ได้สแกนในบัญชีนี้ กรุณาสแกนใหม่',422);const {data,error:e}=await writer.rpc('persist_verified_scan',{p_user:user.id,p_result:result});if(e||!data){const known=['model_not_registered','idempotency_conflict','active_owner_required','invalid_result','invalid_result_metadata','unexpected_result_fields'];const reason=known.find(value=>e?.message===value)??'database_error';console.warn('verified_scan_save_failed',{code:e?.code??'empty_result',reason});return error(reason==='model_not_registered'?'รุ่น AI นี้ยังไม่ได้ขึ้นทะเบียนในระบบประวัติ':reason==='active_owner_required'?'สถานะบัญชียังไม่อนุญาตให้บันทึก':`บันทึกไม่สำเร็จ (${e?.code??'empty_result'}) กรุณาตรวจระบบข้อมูล`,400);}return NextResponse.json({saved:true,predictionId:data,provenance:'server_verified'},{headers:{'Cache-Control':'no-store'}});}catch{return error('รูปแบบผลสแกนไม่ถูกต้อง');}}


