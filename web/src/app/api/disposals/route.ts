import {readJson} from '@/lib/read-json';
import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {supabaseServer} from "@/lib/supabase-server";
import {sameOrigin,error} from "@/lib/http";
const input=z.object({eventId:z.uuid(),itemId:z.uuid(),ruleId:z.uuid(),quantity:z.number().int().min(1).max(100),confirmed:z.literal(true),disposedAt:z.iso.datetime(),predictionId:z.uuid().nullable(),detectionId:z.uuid().nullable(),materialId:z.uuid().nullable().optional()});
export async function POST(req:NextRequest){if(!sameOrigin(req))return error("Origin ไม่ถูกต้อง",403);try{const client=await supabaseServer();if(!client)return error("Supabase ยังไม่พร้อม",503);const {data:{user}}=await client.auth.getUser();if(!user)return error("กรุณาเข้าสู่ระบบ",401);const body=input.parse(await readJson(req,40000));const {data,error:e}=await client.rpc('confirm_disposal_v2',{p_event:body.eventId,p_item:body.itemId,p_rule:body.ruleId,p_quantity:body.quantity,p_disposed_at:body.disposedAt,p_prediction:body.predictionId,p_detection:body.detectionId,p_confirmed:body.confirmed,p_material:body.materialId??null});return e?error("ยืนยันไม่ได้ ต้องมีเจ้าของข้อมูลและกฎที่ตรวจสอบแล้ว",400):NextResponse.json({confirmed:true,id:data});}catch{return error("ข้อมูลยืนยันไม่ถูกต้อง");}}
