import {createHash} from 'node:crypto';
import type {SupabaseClient} from '@supabase/supabase-js';
import {validateEvidenceImage} from './validate-evidence-image';

export class EvidenceStoreError extends Error{
 constructor(message:string,public status=503,public recoveryId?:string){super(message);}
}
export async function cleanupUnusedEvidence(db:SupabaseClient,owner:string,id:string){
 const lease=await db.rpc('begin_pin_evidence_cleanup',{p_id:id,p_owner:owner});
 if(lease.error)throw new EvidenceStoreError('ล้างไม่ได้: ภาพถูกใช้งานแล้ว หรือรายการอัปโหลดใหม่ต้องรอ 5 นาที',409);
 if(!lease.data)return;
 if(lease.data!==owner+'/'+id)throw new EvidenceStoreError('เส้นทางหลักฐานไม่ตรงกับเจ้าของ');
 const removed=await db.storage.from('pin-evidence').remove([lease.data]);
 if(removed.error)throw new EvidenceStoreError('ล้างไฟล์ไม่สำเร็จ เก็บรายการไว้เพื่อให้ลองใหม่',503,id);
 const finished=await db.rpc('finish_pin_evidence_cleanup',{p_id:id,p_owner:owner});
 if(finished.error)throw new EvidenceStoreError('รอยืนยันการล้างไฟล์ กรุณาลองใหม่',503,id);
}
export async function storeValidatedEvidence(db:SupabaseClient,owner:string,bytes:Uint8Array,declaredType?:string){
 const mime=await validateEvidenceImage(bytes,declaredType);
 if(!mime)throw new EvidenceStoreError('รับเฉพาะภาพ JPEG/PNG/WebP ที่อ่านได้จริงและ MIME ตรงกัน ไม่เกิน 16 ล้านพิกเซล',415);
 const id=crypto.randomUUID(),hash=createHash('sha256').update(bytes).digest('hex');
 const reservation=await db.rpc('reserve_pin_evidence',{p_id:id,p_owner:owner,p_sha256:hash,p_size:bytes.length,p_mime:mime});
 if(reservation.error||reservation.data!==owner+'/'+id)throw new EvidenceStoreError('ระบบหลักฐานยังไม่พร้อม หรือบัญชีไม่มีสิทธิ์');
 try{
  const uploaded=await db.storage.from('pin-evidence').upload(reservation.data,bytes,{contentType:mime,upsert:false});
  if(uploaded.error)throw new EvidenceStoreError('อัปโหลดภาพไม่สำเร็จ');
  const downloaded=await db.storage.from('pin-evidence').download(reservation.data);
  if(downloaded.error||!downloaded.data)throw new EvidenceStoreError('ตรวจไฟล์ใน Storage ไม่สำเร็จ');
  const actual=new Uint8Array(await downloaded.data.arrayBuffer());
  if(createHash('sha256').update(actual).digest('hex')!==hash||await validateEvidenceImage(actual,mime)!==mime)throw new EvidenceStoreError('ไฟล์ใน Storage ไม่ตรงกับภาพที่ตรวจสอบ');
  const finalized=await db.rpc('finalize_pin_evidence',{p_id:id,p_owner:owner,p_sha256:hash});
  if(finalized.error)throw new EvidenceStoreError('ยังยืนยันหลักฐานไม่ได้');
  return id;
 }catch{
  // Keep reservations for delayed recovery. Cleanup retains a tombstone against late uploads.
  throw new EvidenceStoreError('ยังไม่ยืนยันภาพ อัปโหลดไม่ครบหรือ Storage ติดต่อไม่ได้ รายการค้างล้างได้หลัง 5 นาที',503,id);
 }
}
