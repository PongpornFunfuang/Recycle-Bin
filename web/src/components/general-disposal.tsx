'use client';
import DisposalEvidence from './disposal-evidence';
export default function GeneralDisposal({predictionId}:{initialItemId?:string;predictionId?:string;detections?:{detectionId:string;label:string}[]}){return <DisposalEvidence predictionId={predictionId??null}/>;}
