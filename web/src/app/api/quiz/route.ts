import {readJson,InputError} from '@/lib/read-json';
import {NextRequest,NextResponse} from "next/server";
import {questions} from "@/lib/quiz-data";
import {error,sameOrigin} from "@/lib/http";
export async function POST(req:NextRequest){if(!sameOrigin(req))return error("Origin ไม่ถูกต้อง",403);try{const {answers}=await readJson(req,8000) as {answers:Record<string,number>};if(!answers||questions.some(q=>!Number.isInteger(answers[q.id])||answers[q.id]<0||answers[q.id]>=q.options.length))return error("กรุณาตอบให้ครบ");const feedback=questions.map(q=>({id:q.id,correct:answers[q.id]===q.answer,explanation:q.explanation}));return NextResponse.json({score:feedback.filter(f=>f.correct).length,total:questions.length,feedback,saved:false});}catch(e){return error(e instanceof InputError?e.message:"รูปแบบคำตอบไม่ถูกต้อง",e instanceof InputError?e.status:400);}}
