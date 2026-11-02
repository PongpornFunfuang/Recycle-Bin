import sharp from 'sharp';
import {evidenceImageType} from './evidence-image';

// Header checks alone accept truncated or forged files. Decode every pixel with
// bounded dimensions before the bytes can reach evidence metadata or Storage.
export async function validateEvidenceImage(bytes:Uint8Array,declaredType?:string){
 const type=evidenceImageType(bytes);
 if(!type||(declaredType&&declaredType!==type))return null;
 try{
  const image=sharp(bytes,{limitInputPixels:16_000_000,failOn:'warning'});
  const metadata=await image.metadata();
  const expected={"image/jpeg":"jpeg","image/png":"png","image/webp":"webp"}[type];
  if(metadata.format!==expected||!metadata.width||!metadata.height||(metadata.pages??1)>1)return null;
  await image.raw().toBuffer();
  return type;
 }catch{return null;}
}
