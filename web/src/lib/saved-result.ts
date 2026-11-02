import {z} from 'zod';
const detection=z.object({detectionId:z.string().optional(),label:z.string().max(256),confidence:z.number().finite().min(0).max(1),decision:z.enum(['accepted','low_confidence','unknown'])});
export function readableSavedResult(raw:unknown){
 const snapshot=z.object({modelVersion:z.string().optional(),detections:z.array(z.unknown()).optional()}).safeParse(raw);
 if(!snapshot.success||!snapshot.data.detections)return {modelVersion:snapshot.success?snapshot.data.modelVersion??'':'',detections:[],incomplete:true};
 const values=snapshot.data.detections.map(d=>detection.safeParse(d));
 return {modelVersion:snapshot.data.modelVersion??'',detections:values.flatMap(d=>d.success?[d.data]:[]),incomplete:values.some(d=>!d.success)};
}
