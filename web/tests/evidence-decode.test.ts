import {test} from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {validateEvidenceImage} from '../src/lib/validate-evidence-image';
test('evidence fully decodes real JPEG, PNG, WebP and rejects forged headers, truncated bytes and MIME mismatch',async()=>{
 for(const format of ['jpeg','png','webp'] as const){
  const image=await sharp({create:{width:64,height:48,channels:3,background:'#0088cc'}}).toFormat(format).toBuffer();
  assert.equal(await validateEvidenceImage(image,'image/'+format),'image/'+format);
  assert.equal(await validateEvidenceImage(image,'image/svg+xml'),null);
  assert.equal(await validateEvidenceImage(image.subarray(0,16)),null);
 }
 assert.equal(await validateEvidenceImage(Buffer.from([137,80,78,71,13,10,26,10,0,0,0,0,0,0,0,0])) ,null);
 assert.equal(await validateEvidenceImage(Buffer.from('<svg onload="alert(1)"/>')),null);
});
test('evidence rejects decompression-sized dimensions',async()=>{
 const image=await sharp({create:{width:4001,height:4001,channels:3,background:'white'}}).png().toBuffer();
 assert.equal(await validateEvidenceImage(image),null);
});
