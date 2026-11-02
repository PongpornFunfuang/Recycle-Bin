import {readJson} from '@/lib/read-json';
import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@supabase/supabase-js";
import {z} from "zod";
import {databaseConfig} from "@/lib/config";
import {supabaseServer} from "@/lib/supabase-server";
import {sameOrigin,error} from "@/lib/http";
export async function GET(){try{const config=databaseConfig();if(!config)return error('แบบทดสอบบัญชียังไม่พร้อม — Supabase Not Configured',503);const db=createClient(config.url,config.key,{auth:{persistSession:false}});const {data,error:e}=await db.from('quizzes').select('id,title,version,quiz_questions(id,prompt,choices,position)').eq('status','published').limit(20);return e?error('อ่านแบบทดสอบไม่ได้',503):NextResponse.json({quizzes:data},{headers:{'Cache-Control':'no-store'}});}catch{return error('ตรวจการตั้งค่าฐานข้อมูล',503);}}
export async function POST(req:NextRequest){if(!sameOrigin(req))return error('Origin ไม่ถูกต้อง',403);try{const client=await supabaseServer();if(!client)return error('Supabase ยังไม่พร้อม',503);const {data:{user}}=await client.auth.getUser();if(!user)return error('เข้าสู่ระบบก่อนส่งคำตอบ',401);const body=z.object({quizId:z.uuid(),eventId:z.uuid(),answers:z.record(z.uuid(),z.number().int().min(0).max(7))}).parse(await readJson(req,40000));const {data,error:e}=await client.rpc('submit_quiz',{p_quiz:body.quizId,p_event:body.eventId,p_answers:body.answers});return e?error('ตรวจคะแนนไม่ได้ กรุณาตรวจคำตอบและสถานะชุดข้อสอบ',400):NextResponse.json(data);}catch{return error('รูปแบบคำตอบไม่ถูกต้อง');}}
