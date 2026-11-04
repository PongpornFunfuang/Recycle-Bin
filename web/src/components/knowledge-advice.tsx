import BinRecommendation from './bin-recommendation';
import type {KnowledgeEntry,KnowledgeCase} from '@/lib/knowledge-catalog';
import type {BinGuidance} from '@/lib/bin-guidance';
import {colorForKnowledgeCase} from '@/lib/waste-knowledge-overrides';

function guidance(value:KnowledgeCase):BinGuidance|null{
 const color=colorForKnowledgeCase(value);
 if(!color)return null;
 const names={blue:'ฟ้า',yellow:'เหลือง',green:'เขียว',red:'แดง'};
 return {color,wasteType:value.category,binColorName:names[color],asset:`/images/bins/${color}.svg`,note:value.condition};
}
export default function KnowledgeAdvice({entry,fromAi=false}:{entry:KnowledgeEntry;fromAi?:boolean}){
 return <section className="knowledge-advice"><p className="muted">คำแนะนำทั่วไปของ RECYCLE BIN · ตรวจข้อมูล {entry.checkedAt} · <a href={entry.sourceUrl} target="_blank" rel="noopener noreferrer">แหล่งอ้างอิง</a> ({entry.basis==='item'?'ข้อมูลชนิดขยะ':'หลักการแยกตามหมวดขยะ'}) · ขั้นตอนเรียบเรียงเพื่อการใช้งานในแอป</p>
 {fromAi&&<p className="notice">AI ระบุชื่อวัตถุเท่านั้น โปรดตรวจวัสดุ สภาพสิ่งของ และว่าต้องการทิ้งจริงหรือไม่ ก่อนใช้คำแนะนำตามกรณี</p>}
 {entry.cases.map((item,index)=><div className="knowledge-case" key={index}>
 <h3>{entry.cases.length>1?`กรณีที่ ${index+1}: ${item.condition}`:item.condition}</h3>
 <p>วัสดุ: {item.material??'ยังระบุไม่ได้'} · ประเภท: {item.category}</p>
 <h4>วิธีเตรียมก่อนทิ้ง</h4><ol>{item.steps.map(step=><li key={step}>{step}</li>)}</ol>
 <p><strong>คำแนะนำการคัดแยก:</strong> {item.sorting}</p>
 {fromAi&&<p><strong>สีและรูปถังต่อไปนี้ใช้เฉพาะเมื่อคุณตรวจเงื่อนไขกรณีนี้แล้ว</strong></p>}
 <BinRecommendation guidance={guidance(item)}/>
 <p className="muted">{item.caution}</p>
 </div>)}
 <p className="muted">สีถังเป็นกติกาทั่วไปของ RECYCLE BIN ไม่ใช่หลักฐานสีถังหรือจุดรับของ SPU KK</p></section>;
}
