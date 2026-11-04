import type {BinGuidance} from '@/lib/bin-guidance';

export default function BinRecommendation({guidance}:{guidance:BinGuidance|null}){
 if(!guidance)return <section className="bin-recommendation bin-unknown"><h3>สีถังที่แนะนำ</h3><p>ยังไม่แนะนำสีถัง เพราะข้อมูลวัสดุหรือประเภทขยะยังยืนยันไม่ได้อย่างน่าเชื่อถือ</p><small>กรุณาตรวจวัสดุ สภาพของสิ่งของ และป้าย ณ จุดทิ้งจริงก่อนตัดสินใจ</small></section>;
 return <section className="bin-recommendation"><img src={guidance.asset} alt={`รูปถังขยะสี${guidance.binColorName} สำหรับ${guidance.wasteType}`}/><div><h3>ถังสี{guidance.binColorName}</h3><p>{guidance.wasteType}</p><small>{guidance.note}</small></div></section>;
}
