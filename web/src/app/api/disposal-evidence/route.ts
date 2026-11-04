import {NextRequest,NextResponse} from 'next/server';
import {supabaseServer} from '@/lib/supabase-server';
import {evidenceWriter} from '@/lib/supabase-privileged';
import {validateEvidenceImage} from '@/lib/validate-evidence-image';
import {error,sameOrigin} from '@/lib/http';
import {z} from 'zod';

export async function POST(req:NextRequest){
 if(!sameOrigin(req))return error('Origin ไม่ถูกต้อง',403);
 try{const client=await supabaseServer();if(!client)return error('Supabase ยังไม่พร้อม',503);const {data:{user}}=await client.auth.getUser();if(!user)return error('กรุณาเข้าสู่ระบบ',401);
  const form=await req.formData(),file=form.get('image');if(!(file instanceof File))return error('กรุณาแนบรูปหลักฐาน',422);if(file.size<1||file.size>8*1024*1024)return error('ไฟล์ต้องมีขนาดไม่เกิน 8 MB',422);
  const bytes=new Uint8Array(await file.arrayBuffer()),mime=await validateEvidenceImage(bytes,file.type);if(!mime)return error('ไฟล์ภาพไม่ถูกต้องหรืออ่านไม่ได้',422);
  const quantity=z.coerce.number().int().min(1).max(100).parse(form.get('quantity'));
  // The UI can be rendered from the static catalog, where `itemId` may be a
  // slug rather than a database UUID.  Only persist a real UUID so the
  // nullable waste_items FK cannot reject an otherwise valid evidence upload.
  const rawItemId=form.get('itemId');
  const itemId=typeof rawItemId==='string'&&z.string().uuid().safeParse(rawItemId).success?rawItemId:null;
  const predictionId=form.get('predictionId');const detectionId=form.get('detectionId');
  const writer=evidenceWriter();if(!writer)return error('ระบบจัดเก็บหลักฐานยังไม่พร้อม',503);const id=crypto.randomUUID(),path=`${user.id}/${id}.${mime.split('/')[1]}`;
  const upload=await writer.storage.from('disposal-evidence').upload(path,bytes,{contentType:mime,upsert:false});if(upload.error)return error('อัปโหลดหลักฐานไม่สำเร็จ',503);
  const row=await writer.from('disposal_evidence').insert({id,user_id:user.id,item_id:itemId||null,prediction_id:predictionId||null,detection_id:detectionId||null,object_path:path,quantity,status:'pending'}).select('id').single();
  if(row.error){await writer.storage.from('disposal-evidence').remove([path]);return error('บันทึกหลักฐานไม่สำเร็จ',503);}return NextResponse.json({id:row.data.id,status:'pending'},{status:201});
 }catch{return error('ข้อมูลหลักฐานไม่ถูกต้อง',422);}
}
