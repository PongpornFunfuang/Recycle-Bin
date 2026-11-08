import {binGuidanceForSlug,type BinGuidance} from './bin-guidance';
import {knowledgeForSlug} from './knowledge-catalog';

const specificGuides:Record<string,string>={battery:'used-battery',light_bulb:'used-light-bulb',pcb:'broken-electronic',aerosol:'spray-can','spray-can':'spray-can',insecticide:'spray-can','beverage-carton':'milk-carton','drink-can':'aluminium-can','electrical-cables':'broken-electronic',keyboard:'broken-electronic','small-appliances':'broken-electronic'};
const ewaste=new Set(['pcb','electrical-cables','keyboard','small-appliances']);
export function aiWasteName(label:string){return label==='battery'?'ถ่านและแบตเตอรี่':label==='light_bulb'?'หลอดไฟ':label==='pcb'?'แผงวงจรอิเล็กทรอนิกส์':null;}
type ItemPrediction={label:string;confidence:number;modelVersion:string;status:string;threshold?:number};
type C={label:string;confidence:number;modelVersion:string;itemPrediction?:ItemPrediction}|null|undefined;
const itemNames:Record<string,string>={'beverage-carton':'กล่องเครื่องดื่ม','cigarette-butt':'ก้นบุหรี่','drink-can':'กระป๋องเครื่องดื่ม','electrical-cables':'สายไฟและสายเคเบิล',gloves:'ถุงมือ',keyboard:'แป้นพิมพ์',masks:'หน้ากาก',medicines:'ยาและบรรจุภัณฑ์ยา','metal-containers':'ภาชนะโลหะ','paper-cup':'แก้วกระดาษ','plastic-bottles':'ขวดพลาสติก','plastic-cups':'แก้วพลาสติก','small-appliances':'เครื่องใช้ไฟฟ้าขนาดเล็ก','spray-can':'กระป๋องสเปรย์',syringe:'กระบอกฉีดยาหรือเข็มฉีดยา'};
Object.assign(itemNames,{'plastic-bottle':'ขวดพลาสติก','plastic-cup':'แก้วพลาสติก','plastic-containers':'ภาชนะพลาสติก',pcb:'แผงวงจรอิเล็กทรอนิกส์',laptops:'คอมพิวเตอร์โน้ตบุ๊ก',smartphones:'โทรศัพท์มือถือ',newspaper:'หนังสือพิมพ์'});
export function disposalIdentity(label:string,confidence:number,c:C){
 if(['battery','light_bulb','pcb'].includes(label)&&confidence>=.8)return {label,confidence,name:aiWasteName(label)!,supported:true};
 const p=c?.itemPrediction;
 if(p?.modelVersion==='resnet18-object-names-v1'&&p.threshold!==undefined&&p.threshold>=.8&&p.confidence>=.8&&itemNames[p.label])return {label:p.label,confidence:p.confidence,name:itemNames[p.label],supported:p.status==='supported'&&p.confidence>=p.threshold};
 return null;
}
export function conditionalItemSteps(label:string):string[]{
 if(['bottle','plastic-bottles','plastic-bottle','plastic-containers','metal-containers'].includes(label))return ['ตรวจฉลากและสิ่งที่เคยบรรจุ ก่อนเท ล้าง บีบ หรือแยกชิ้นส่วน','หากเคยบรรจุยาฆ่าแมลงหรือสารเคมี ให้แยกส่งจุดรับขยะอันตรายตามฉลากและเงื่อนไขพื้นที่','รูปทรงและวัสดุอย่างเดียวไม่เพียงพอที่จะเลือกถังรีไซเคิล'];
 if(['gloves','masks','medicines','syringe'].includes(label))return ['ตรวจสภาพ สิ่งปนเปื้อน และเงื่อนไขการรับก่อนทิ้ง','ค้นคู่มือเฉพาะรายการหรือสอบถามจุดรับ ไม่จัดเป็นขยะรีไซเคิลจากภาพเพียงอย่างเดียว'];
 return ['ตรวจสิ่งปนเปื้อนและเงื่อนไขการรับของพื้นที่','ค้นคู่มือเฉพาะชนิดนี้ก่อนเลือกวิธีทิ้งหรือสีถัง'];
}
export function canRecommendDisposal(label:string,c:C,confidence:number){
 if(!Number.isFinite(confidence)||confidence<(specificGuides[label]?0.8:0.85))return false;
 if(specificGuides[label])return true;
 if(!c||c.confidence<0.8)return false;
 // A bottle-shaped container may contain pesticides or cleaning chemicals.
 // Material and object confidence cannot establish its contents or safe disposal.
 if(label==='bottle')return false;
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
  if(steps)return {bin:ewaste.has(label)?null:binGuidanceForSlug(slug),steps:ewaste.has(label)?[...steps,'ส่งจุดรับขยะอิเล็กทรอนิกส์ที่รองรับ ไม่ใส่ถังรีไซเคิลรวม']:steps};
 }
 if(label==='bottle')return {bin:null,steps:['อ่านฉลากเพื่อยืนยันสิ่งที่เคยบรรจุ ก่อนเท ล้าง บีบ หรือแยกชิ้นส่วน','หากเป็นยาฆ่าแมลง สเปรย์ หรือภาชนะสารเคมี ให้แยกส่งจุดรับขยะอันตรายตามฉลากและเงื่อนไขของพื้นที่','ยังไม่เลือกสีถังจากรูปทรงขวดหรือวัสดุเพียงอย่างเดียว']};
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