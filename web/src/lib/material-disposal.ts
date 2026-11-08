import {binGuidanceForSlug,type BinGuidance} from './bin-guidance';
import {knowledgeForSlug} from './knowledge-catalog';

const specificGuides:Record<string,string>={battery:'used-battery',light_bulb:'used-light-bulb',pcb:'broken-electronic'};
export function aiWasteName(label:string){return label==='battery'?'ถ่านและแบตเตอรี่':label==='light_bulb'?'หลอดไฟ':label==='pcb'?'แผงวงจรอิเล็กทรอนิกส์':null;}
type C={label:string;confidence:number;modelVersion:string}|null|undefined;
export function canRecommendDisposal(label:string,c:C,confidence:number){
 if(!Number.isFinite(confidence)||confidence<(specificGuides[label]?0.8:0.85))return false;
 if(specificGuides[label])return true;
 if(!c||c.confidence<0.8)return false;
 if(label==='bottle')return ['glass','plastic'].includes(c.label);
 if(['banana','apple','orange','broccoli','carrot','sandwich','pizza','cake','donut','hot dog'].includes(label))return ['food_organics','vegetation'].includes(c.label);
 // Generic material predictions do not establish the disposal of an arbitrary
 // COCO object (e.g. a battery predicted as a TV must not become cardboard).
 return false;
}
export function materialDisposal(label:string,c:C):{bin:BinGuidance|null;steps:string[]}|null{
 const slug=specificGuides[label];
 if(slug){
  const entry=knowledgeForSlug(slug);
  const steps=entry?.cases[0]?.steps;
  if(steps)return {bin:label==='pcb'?null:binGuidanceForSlug(slug),steps:label==='pcb'?[...steps,'ส่งจุดรับขยะอิเล็กทรอนิกส์ที่รองรับ ไม่ใส่ถังรีไซเคิลรวม']:steps};
 }
 const material=c&&c.confidence>=0.8?c.label:null;
 const bottle=label==='bottle';
 const organic=['banana','apple','orange','broccoli','carrot','sandwich','pizza','cake','donut','hot dog'].includes(label)||['food_organics','vegetation'].includes(material??'');
 const recyclable=bottle||['paper','cardboard','glass','metal','plastic'].includes(material??'');
 if(!organic&&!recyclable){
  if(material==='textile')return {bin:null,steps:['แยกเสื้อผ้าหรือผ้าที่ใช้ต่อได้ ทำความสะอาดและบริจาค','ส่งจุดรับสิ่งทอที่รองรับ หากไม่มีให้ตรวจแนวทางขยะทั่วไปของพื้นที่']};
  return null;
 }
 const color=organic?'green':'yellow', name=organic?'เขียว':'เหลือง';
 const steps=organic?['แยกถุง ช้อน พลาสติกและของมีคมออก','สะเด็ดน้ำ รวบรวมเฉพาะเศษอาหารหรือเศษพืชที่ต้องการทิ้ง','ส่งระบบอินทรีย์หรือถังสีเขียวที่รับชนิดนี้']:bottle?['เทเครื่องดื่มที่เหลือออก ล้างคราบและผึ่งแห้ง','ขวดแก้วไม่ทุบแตก ขวดพลาสติกบีบลดพื้นที่เมื่อปลอดภัย','แยกฝาตามข้อกำหนดจุดรับ ส่งถังรีไซเคิลสีเหลือง']:['แยกอาหารและสิ่งปนเปื้อนเมื่อปลอดภัย','กระดาษและกล่องเก็บให้แห้ง ภาชนะล้างคราบและผึ่งแห้ง','แยกกระป๋องสเปรย์ ภาชนะสารเคมีและแบตเตอรี่ออกส่งจุดรับอันตราย','ส่งถังรีไซเคิลสีเหลืองเฉพาะวัสดุที่จุดรับรองรับ'];
 return {bin:{color,wasteType:organic?'ขยะอินทรีย์ / เศษอาหาร':'ขยะรีไซเคิล',binColorName:name,asset:'/images/bins/'+color+'.svg',note:'แนวทางทั่วไป: ตรวจความสะอาดและป้ายจุดรับ ไม่ใช้ผลภาพยืนยันสารอันตราย'},steps};
}