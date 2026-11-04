"use client";
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {ArrowLeft,Camera} from 'lucide-react';
import WasteColorGuide from './waste-color-guide';
import KnowledgeAdvice from './knowledge-advice';
import BinRecommendation from './bin-recommendation';
import type {KnowledgeEntry} from '@/lib/knowledge-catalog';
import type {WasteItem} from '@/lib/catalog';
import DisposalEvidence from './disposal-evidence';

type Detail={source:string;item:{id:string|null;slug:string;name:string;item_materials?:{material_categories:{name:string}|{name:string}[]|null}[]};reference:WasteItem|null;knowledge:KnowledgeEntry|null};
export default function WasteDetail({slug}:{slug:string}){
 const [data,setData]=useState<Detail|null>(null),[message,setMessage]=useState('');
 useEffect(()=>{const controller=new AbortController();fetch('/api/catalog/'+encodeURIComponent(slug),{signal:controller.signal}).then(async response=>({ok:response.ok,data:await response.json()})).then(response=>{if(response.ok)setData(response.data);else setMessage(response.data.error?.message??'อ่านข้อมูลไม่ได้');}).catch(error=>{if(error.name!=='AbortError')setMessage('ติดต่อข้อมูลไม่ได้');});return()=>controller.abort();},[slug]);
 if(message)return <div className="notice" role="alert">{message}</div>;
 if(!data)return <div className="panel loading-text">กำลังอ่านข้อมูลรายการ…</div>;
 const knowledge=data.knowledge;
 const steps=data.reference?.steps??['ตรวจชนิดวัสดุและสภาพของสิ่งของ','ตรวจป้ายและเงื่อนไขจุดทิ้งจริงก่อนทิ้ง'];
 const caution=data.reference?.caution??'ข้อมูลยังไม่เพียงพอสำหรับระบุประเภทหรือสีถังอย่างปลอดภัย';
 return <><WasteColorGuide/><Link className="text-link" href="/guide"><ArrowLeft size={16}/>กลับไปค้นหา</Link><article className="panel waste-detail-card"><header><div className="detail-visual" role="img" aria-label={`ภาพประกอบ ${data.item.name}`}><img src={knowledge?.imageId?`/api/waste-knowledge-image/${knowledge.imageId}`:'/images/waste-illustration.svg'} alt=""/><span>{knowledge?.imageId?'':data.reference?.icon??'♻'}</span></div><div><h1>{data.item.name}</h1><span className="badge">{data.source==='database'||data.source==='admin'?'รายการเผยแพร่จากฐานข้อมูล':'คู่มือทั่วไป'}</span><Link className="button primary" href="/scanner"><Camera size={17}/>ลองสแกนสิ่งของ</Link></div></header>
 {knowledge?<KnowledgeAdvice entry={knowledge}/>:<><section><h2>วิธีเตรียมก่อนทิ้ง</h2><ol className="steps-list">{steps.map(step=><li key={step}>{step}</li>)}</ol></section><section><h2>คำแนะนำการคัดแยก</h2><p>{caution}</p><p className="notice info">ยังไม่มีคำแนะนำเฉพาะรายการที่ตรวจสอบได้ กรุณาตรวจชนิดวัสดุและเงื่อนไขของผู้รับก่อนทิ้ง</p></section><section><h2>สีถังและรูปถังที่แนะนำ</h2><BinRecommendation guidance={null}/><p className="muted">แนวทางทั่วไปของ RECYCLE BIN ไม่ใช่ข้อมูลถังจริงของมหาวิทยาลัย</p></section></>}
 </article><DisposalEvidence itemId={data.item.id??undefined}/></>;
}
