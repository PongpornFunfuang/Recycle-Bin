import {NextRequest,NextResponse} from 'next/server';
import {createClient} from '@supabase/supabase-js';
import {supabaseServer} from '@/lib/supabase-server';
import {databaseConfig} from '@/lib/config';
import {sameOrigin,error} from '@/lib/http';
import {maximumEvidenceBytes} from '@/lib/evidence-image';
import {validateEvidenceImage} from '@/lib/validate-evidence-image';
import {loadVerifiedLocations} from '@/lib/verified-locations';
import {z} from 'zod';
import {readJson} from '@/lib/read-json';
import {evidenceWriter} from '@/lib/supabase-privileged';
import {cleanupUnusedEvidence,storeValidatedEvidence,EvidenceStoreError} from '@/lib/pin-evidence-store';
export const runtime='nodejs';
async function adminIdentity(){const db=await supabaseServer();if(!db)return null;const {data:{user}}=await db.auth.getUser();if(!user)return null;const role=await db.rpc('current_user_is_admin');return role.data===true&&!role.error?user.id:null;}
async function isAdmin(){return !!await adminIdentity();}
function failure(e:unknown){return e instanceof EvidenceStoreError?NextResponse.json({error:{code:'EVIDENCE_FAILED',message:e.message},recoveryId:e.recoveryId??null},{status:e.status,headers:{'Cache-Control':'no-store'}}):error('ระบบหลักฐานติดต่อไม่ได้ กรุณาลองอีกครั้ง',503);}
export async function POST(req:NextRequest){
 if(!sameOrigin(req))return error('Origin ไม่ถูกต้อง',403);
 try{
  const owner=await adminIdentity();if(!owner)return error('เฉพาะผู้ดูแล',403);
  const writer=evidenceWriter();if(!writer)return error('ระบบจัดเก็บหลักฐานฝั่ง Server ยังไม่พร้อม',503);
  if(Number(req.headers.get('content-length'))>maximumEvidenceBytes)return error('ภาพใหญ่เกิน8MB',413);
  const reader=req.body?.getReader();if(!reader)return error('ไม่มีภาพ',400);
  const chunks:Uint8Array[]=[];let size=0;
  while(true){const part=await reader.read();if(part.done)break;size+=part.value.length;if(size>maximumEvidenceBytes){await reader.cancel();return error('ภาพใหญ่เกิน8MB',413);}chunks.push(part.value);}
  const id=await storeValidatedEvidence(writer,owner,Buffer.concat(chunks),req.headers.get('content-type')?.split(';')[0].trim());
  return NextResponse.json({id,message:'ตรวจภาพและยืนยันไฟล์ใน Private Storage แล้ว'},{headers:{'Cache-Control':'no-store'}});
 }catch(e){return failure(e);}
}
export async function DELETE(req:NextRequest){
 if(!sameOrigin(req))return error('Origin ไม่ถูกต้อง',403);
 try{const owner=await adminIdentity();if(!owner)return error('เฉพาะผู้ดูแล',403);const id=z.object({id:z.uuid()}).parse(await readJson(req,2000)).id;const writer=evidenceWriter();if(!writer)return error('ระบบหลักฐานยังไม่พร้อม',503);await cleanupUnusedEvidence(writer,owner,id);return NextResponse.json({message:'ล้างภาพร่างที่ยังไม่ใช้แล้ว'},{headers:{'Cache-Control':'no-store'}});}catch(e){return failure(e);}
}
export async function GET(req:NextRequest){try{if(req.nextUrl.searchParams.get('cleanup')==='1'){const owner=await adminIdentity();if(!owner)return error('เฉพาะผู้ดูแล',403);const db=await supabaseServer();if(!db)return error('ยังไม่พร้อม',503);const rows=await db.from('pin_evidence').select('id,validation_state,created_at').eq('owner_id',owner).is('bound_at',null).lt('created_at',new Date(Date.now()-300000).toISOString()).order('created_at',{ascending:false}).limit(100);return rows.error?error('ระบบล้างหลักฐานยังไม่พร้อม',503):NextResponse.json({items:rows.data},{headers:{'Cache-Control':'no-store'}});}let id:string|null=null;const preview=req.nextUrl.searchParams.get('id');if(preview){if(!await isAdmin())return error('เฉพาะผู้ดูแล',403);id=z.uuid().parse(preview);}else{const locationId=z.uuid().parse(req.nextUrl.searchParams.get('locationId'));const config=databaseConfig();if(!config)return error('ยังไม่พร้อม',503);const db=createClient(config.url,config.key,{auth:{persistSession:false}});const row=(await loadVerifiedLocations(db)).find(r=>r.id===locationId);id=row?.evidencePhotoId??null;}if(!id||!z.uuid().safeParse(id).success)return error('ไม่พบภาพหลักฐานที่เผยแพร่',404);const db=await supabaseServer();if(!db)return error('ยังไม่พร้อม',503);let objectKey:string;if(preview){const meta=await db.from('pin_evidence').select('object_key').eq('id',id).single();if(meta.error)return error('ไม่พบหลักฐาน',404);objectKey=meta.data.object_key;}else{const config=databaseConfig();if(!config)return error('ยังไม่พร้อม',503);const publicDb=createClient(config.url,config.key,{auth:{persistSession:false}});const locationId=z.uuid().parse(req.nextUrl.searchParams.get('locationId'));const owner=await publicDb.from('locations').select('evidence_photo_id').eq('id',locationId).single();if(!owner.data?.evidence_photo_id)return error('ไม่พบหลักฐาน',404);const download=await publicDb.rpc('pin_evidence_object_key',{p_id:id});if(download.error)return error('ไม่พบภาพที่เผยแพร่',404);objectKey=download.data;}const result=await db.storage.from('pin-evidence').download(objectKey);if(result.error)return error('ไม่พบไฟล์หลักฐาน',404);const bytes=Buffer.from(await result.data.arrayBuffer());const type=await validateEvidenceImage(bytes);if(!type)return error('ภาพไม่ถูกต้อง',415);return new NextResponse(bytes,{headers:{'Content-Type':type,'X-Content-Type-Options':'nosniff','Cache-Control':'no-store','Content-Security-Policy':"default-src 'none'; sandbox"}});}catch{return error('ไม่พบภาพหลักฐาน',404);}}
