import type {WasteColor} from './waste-colors';
import {knowledgeForSlug} from './knowledge-catalog';

export type BinGuidance={color:WasteColor;wasteType:string;binColorName:string;asset:string;note:string};

const entries:Record<string,BinGuidance>={
  food:{color:'green',wasteType:'ขยะอินทรีย์ / เศษอาหาร',binColorName:'เขียว',asset:'/images/bins/green.svg',note:'ใช้เมื่อยืนยันว่าเป็นเศษอาหารหรือเปลือกผลไม้ที่ต้องการทิ้ง'},
  paper:{color:'yellow',wasteType:'ขยะรีไซเคิล',binColorName:'เหลือง',asset:'/images/bins/yellow.svg',note:'ใช้กับกระดาษสะอาดที่จุดรับรับรีไซเคิล'},
  battery:{color:'red',wasteType:'ขยะอันตราย',binColorName:'แดง',asset:'/images/bins/red.svg',note:'ไม่แกะ เจาะ หรือเผา และตรวจจุดรับเฉพาะก่อนนำไปส่ง'},
  metal:{color:'yellow',wasteType:'ขยะรีไซเคิล',binColorName:'เหลือง',asset:'/images/bins/yellow.svg',note:'ใช้กับกระป๋องโลหะสะอาดที่ไม่มีสารอันตราย'},
  'pet-bottle':{color:'yellow',wasteType:'ขยะรีไซเคิล',binColorName:'เหลือง',asset:'/images/bins/yellow.svg',note:'ใช้เมื่อยืนยันว่าเป็นขวด PET สะอาดและจุดรับรับรีไซเคิล'},
  'aluminium-can':{color:'yellow',wasteType:'ขยะรีไซเคิล',binColorName:'เหลือง',asset:'/images/bins/yellow.svg',note:'ใช้เมื่อเป็นกระป๋องสะอาดและไม่มีสารอันตราย'},
  'clean-paper':{color:'yellow',wasteType:'ขยะรีไซเคิล',binColorName:'เหลือง',asset:'/images/bins/yellow.svg',note:'ใช้กับกระดาษสะอาดที่จุดรับรับรีไซเคิล'},
  cardboard:{color:'yellow',wasteType:'ขยะรีไซเคิล',binColorName:'เหลือง',asset:'/images/bins/yellow.svg',note:'ใช้กับกล่องสะอาดที่แยกสิ่งปนเปื้อนแล้ว'},
  'glass-bottle':{color:'yellow',wasteType:'ขยะรีไซเคิล',binColorName:'เหลือง',asset:'/images/bins/yellow.svg',note:'ใช้กับขวดแก้วที่ปลอดภัยและจุดรับรับรีไซเคิล'},
  'food-scraps':{color:'green',wasteType:'ขยะอินทรีย์ / เศษอาหาร',binColorName:'เขียว',asset:'/images/bins/green.svg',note:'ใช้เมื่อยืนยันว่าเป็นเศษอาหารที่ต้องการทิ้ง'},
  'fruit-peels':{color:'green',wasteType:'ขยะอินทรีย์ / เศษอาหาร',binColorName:'เขียว',asset:'/images/bins/green.svg',note:'แยกบรรจุภัณฑ์ออกก่อนทิ้ง'},
  leaves:{color:'green',wasteType:'ขยะอินทรีย์ / เศษอาหาร',binColorName:'เขียว',asset:'/images/bins/green.svg',note:'ไม่ปะปนพลาสติกหรือของเสียอันตราย'},
  'dirty-wrapper':{color:'blue',wasteType:'ขยะทั่วไป',binColorName:'ฟ้า',asset:'/images/bins/blue.svg',note:'ใช้เมื่อจุดรับไม่รับรีไซเคิลวัสดุชิ้นนี้'},
  'used-tissue':{color:'blue',wasteType:'ขยะทั่วไป',binColorName:'ฟ้า',asset:'/images/bins/blue.svg',note:'แยกจากกระดาษสะอาดที่นำไปรีไซเคิล'},
  'used-battery':{color:'red',wasteType:'ขยะอันตราย',binColorName:'แดง',asset:'/images/bins/red.svg',note:'ไม่แกะ เจาะ หรือเผา และตรวจจุดรับเฉพาะก่อนนำไปส่ง'},
  'used-light-bulb':{color:'red',wasteType:'ขยะอันตราย',binColorName:'แดง',asset:'/images/bins/red.svg',note:'ป้องกันแตกและตรวจแนวทางรับของพื้นที่'}
};

export function binGuidanceForSlug(slug:string){
 const knowledge=knowledgeForSlug(slug);
 if(knowledge?.cases.length===1){const item=knowledge.cases[0];if(item.color){const colorNames={blue:'ฟ้า',yellow:'เหลือง',green:'เขียว',red:'แดง'};return {color:item.color,wasteType:item.category,binColorName:colorNames[item.color],asset:`/images/bins/${item.color}.svg`,note:item.condition};}}
 if(knowledge && knowledge.cases.length>1)return null;
 return entries[slug]??null;
}

// Object detection names alone do not establish material or disposal category.
export function binGuidanceForAiLabel(_label:string):BinGuidance|null{return null;}
