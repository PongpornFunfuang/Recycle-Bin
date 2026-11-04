import {createHash,randomUUID} from 'node:crypto';
import {NextRequest,NextResponse} from 'next/server';
import {knowledgeAdmin,knowledgeImageWriter} from '@/lib/waste-knowledge-server';
import {validateEvidenceImage} from '@/lib/validate-evidence-image';
import {error,sameOrigin} from '@/lib/http';

export async function POST(req:NextRequest){
 if(!sameOrigin(req))return error('Origin ไม่ถูกต้อง',403);
 try{
  const auth=await knowledgeAdmin();if(!auth.db||!auth.user)return error('ต้องใช้บัญชี Admin บน Test Project',auth.status);
  if(Number(req.headers.get('content-length')??0)>5_300_000)return error('ภาพใหญ่เกิน 5 MB',413);
  const form=await req.formData(),file=form.get('image');
  if(!(file instanceof File)||file.size<1||file.size>5_242_880)return error('รับภาพขนาดไม่เกิน 5 MB',413);
  const bytes=new Uint8Array(await file.arrayBuffer());
  const mime=await validateEvidenceImage(bytes,file.type);
  if(!mime)return error('รับเฉพาะ JPEG, PNG หรือ WebP ที่อ่านได้จริง',415);
  const id=randomUUID(),sha=createHash('sha256').update(bytes).digest('hex');
  const reserved=await auth.db.rpc('admin_reserve_waste_knowledge_image',{p_id:id,p_mime:mime,p_bytes:bytes.length,p_sha256:sha});
  if(reserved.error||typeof reserved.data!=='string')return error('Storage ยังไม่พร้อมจองไฟล์',503);
  const uploaded=await auth.db.storage.from('waste-knowledge').upload(reserved.data,bytes,{contentType:mime,upsert:false});
  if(uploaded.error)return error('อัปโหลดไม่สำเร็จ รายการจองจะรอล้างภายหลัง',503);
  const downloaded=await auth.db.storage.from('waste-knowledge').download(reserved.data);
  if(downloaded.error||!downloaded.data)return error('อ่านภาพจาก Storage เพื่อตรวจซ้ำไม่ได้',503);
  const actual=new Uint8Array(await downloaded.data.arrayBuffer());
  if(createHash('sha256').update(actual).digest('hex')!==sha||await validateEvidenceImage(actual,mime)!==mime)return error('ไฟล์ใน Storage ไม่ตรงกับภาพต้นฉบับ',503);
  const finalized=await knowledgeImageWriter().rpc('admin_finalize_waste_knowledge_image',{p_id:id});
  if(finalized.error)return error('ยังยืนยันไฟล์ไม่ได้',503);
  return NextResponse.json({id,url:`/api/waste-knowledge-image/${id}`},{headers:{'Cache-Control':'no-store'}});
 }catch{return error('อัปโหลดภาพไม่สำเร็จ',503);}
}
