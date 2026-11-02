import {test} from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import type {SupabaseClient} from '@supabase/supabase-js';
import {storeValidatedEvidence,cleanupUnusedEvidence,EvidenceStoreError} from '../src/lib/pin-evidence-store';

// Unit transport doubles only: actual Supabase Storage must pass a separate suite.
function transport(bytes:Uint8Array,options:{wrongBytes?:boolean;uploadError?:boolean;leaseError?:boolean;badPath?:boolean}={}){
 const events:string[]=[];let stored:Uint8Array=bytes;
 const client={rpc:async(name:string,args:Record<string,unknown>)=>{events.push(name);if(name==='reserve_pin_evidence')return {data:(options.badPath?'wrong-owner':args.p_owner)+'/'+args.p_id,error:null};if(name==='begin_pin_evidence_cleanup')return {data:'owner/id',error:options.leaseError?{}:null};return {data:null,error:null};},storage:{from:()=>({upload:async(_key:string,data:Uint8Array,config:{upsert:boolean})=>{events.push('upload');assert.equal(config.upsert,false);stored=data;return {error:options.uploadError?{}:null};},download:async()=>{events.push('download');return {error:null,data:new Blob([Buffer.from(options.wrongBytes?new Uint8Array([1,2,3]):stored)])};},remove:async()=>{events.push('remove');return {error:null};}})}};
 return {client:client as unknown as SupabaseClient,events};
}
test('server upload decodes all formats and verifies readback before attestation',async()=>{
 for(const format of ['jpeg','png','webp'] as const){const bytes=await sharp({create:{width:48,height:48,channels:3,background:'blue'}}).toFormat(format).toBuffer();const {client,events}=transport(bytes);assert.match(await storeValidatedEvidence(client,'owner',bytes,'image/'+format),/^[0-9a-f-]{36}$/);assert.deepEqual(events,['reserve_pin_evidence','upload','download','finalize_pin_evidence']);}
});
test('invalid image and wrong owner path never upload; corrupted readback never finalizes',async()=>{
 const bytes=await sharp({create:{width:48,height:48,channels:3,background:'blue'}}).png().toBuffer();
 let mock=transport(bytes);await assert.rejects(storeValidatedEvidence(mock.client,'owner',new Uint8Array([1,2,3]),'image/png'),(e:unknown)=>e instanceof EvidenceStoreError&&e.status===415);assert.equal(mock.events.length,0);
 mock=transport(bytes,{badPath:true});await assert.rejects(storeValidatedEvidence(mock.client,'owner',bytes,'image/png'));assert.equal(mock.events.includes('upload'),false);
 for(const options of [{wrongBytes:true},{uploadError:true}]){mock=transport(bytes,options);await assert.rejects(storeValidatedEvidence(mock.client,'owner',bytes,'image/png'),(e:unknown)=>e instanceof EvidenceStoreError&&!!e.recoveryId);assert.equal(mock.events.includes('finalize_pin_evidence'),false);assert.equal(mock.events.includes('remove'),false);}
});
test('cleanup lease and canonical owner path precede deletion; retained evidence cannot delete',async()=>{
 const mock=transport(new Uint8Array());await cleanupUnusedEvidence(mock.client,'owner','id');assert.deepEqual(mock.events,['begin_pin_evidence_cleanup','remove','finish_pin_evidence_cleanup']);
 const retained=transport(new Uint8Array(),{leaseError:true});await assert.rejects(cleanupUnusedEvidence(retained.client,'owner','id'));assert.equal(retained.events.includes('remove'),false);
 const other=transport(new Uint8Array());await assert.rejects(cleanupUnusedEvidence(other.client,'someone-else','id'));assert.equal(other.events.includes('remove'),false);
});
