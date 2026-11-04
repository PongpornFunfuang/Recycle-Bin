import {items,type WasteItem} from './catalog';
import {knowledgeForSlug} from './knowledge-catalog';
export const guideGroups=[{id:'all',name:'ทั้งหมด'},{id:'containers',name:'ภาชนะ'},{id:'paper',name:'กระดาษ'},{id:'food',name:'เศษอาหาร'},{id:'general',name:'ขยะทั่วไป'},{id:'special',name:'ของเสียเฉพาะ'},{id:'metal',name:'โลหะ'}];
export function guideGroup(item:WasteItem){
 const knowledge=knowledgeForSlug(item.id);
 if(knowledge){
  const category=knowledge.cases[0]?.category;
  if(category==='ขยะอันตราย')return 'special';
  if(category==='ขยะอินทรีย์ / เศษอาหาร')return 'food';
  if(category==='ขยะทั่วไป')return 'general';
  if(item.material.includes('กระดาษ'))return 'paper';
  if(item.material.includes('โลหะ')||item.material.includes('เหล็ก')||item.material.includes('อะลูมิเนียม'))return 'metal';
  return 'containers';
 }
 return ['bottle','cup','bowl'].includes(item.id)?'containers':item.id==='battery'?'special':['paper','food','metal'].includes(item.id)?item.id:'other';
}
export function referenceItem(slug:string){return items.find(i=>i.id===slug);}
export const referenceArticles=[{slug:'prediction-and-confirmation',title:'ผล AI กับการยืนยันทิ้ง ต่างกันอย่างไร?',summary:'ทำความเข้าใจกรอบวัตถุและ Confidence ก่อนบันทึกการทิ้ง',body:'กรอบและชื่อวัตถุเป็นผลจากโมเดลตรวจจับสิ่งของ ไม่ได้แปลว่าสิ่งนั้นเป็นขยะ หรือมีการทิ้งเกิดขึ้นแล้ว\n\nConfidence คือคะแนนของโมเดล ไม่ใช่ตัวเลขความแม่นยำที่วัดจากขยะในมหาวิทยาลัย แม้คะแนนสูงก็อาจตรวจผิดได้\n\nตรวจชนิดวัสดุและสภาพสิ่งของด้วยตนเอง ค้นแนวทางของพื้นที่ แล้วค่อยยืนยันว่าทิ้งแล้วเมื่อคุณได้ลงมือจริง'}, {slug:'check-local-rules',title:'ทำไมต้องตรวจข้อมูลจุดรับในพื้นที่?',summary:'สีถังและสิ่งที่รับต้องอ้างอิงจากผู้ดูแลพื้นที่',body:'ชื่อวัสดุเพียงอย่างเดียวอาจยังไม่พอเลือกจุดทิ้ง สิ่งปนเปื้อน การเคลือบ และเงื่อนไขของผู้รับมีผลต่อการจัดการ\n\nRecycle Bin แสดงสีถังและตำแหน่งจากข้อมูลพื้นที่ที่ผ่านการตรวจสอบ เมื่อยังไม่มีข้อมูลยืนยัน ระบบจะแสดงรอตรวจสอบแทนการเดา\n\nหากไม่แน่ใจ ให้ตรวจป้ายและสอบถามผู้ดูแลจุดรับก่อนทิ้ง'}, {slug:'scan-a-clear-picture',title:'ถ่ายอย่างไรให้ตรวจจับได้ดีขึ้น?',summary:'เพิ่มแสง เห็นวัตถุครบ และตรวจผลทุกครั้ง',body:'วางสิ่งของให้เห็นรูปร่างครบ ใช้แสงเพียงพอและหลีกเลี่ยงการสั่น ภาพซ้อนกันหรือวัตถุเล็กอาจตรวจได้ไม่ครบ\n\nโมเดลปัจจุบันตรวจสิ่งของทั่วไป เช่น ขวดและถ้วย ยังไม่ใช่ตัวจำแนกวัสดุทุกชนิด ขวดที่ตรวจพบจึงอาจเป็นแก้วหรือพลาสติก\n\nหากไม่พบผลหรือมีความมั่นใจต่ำ ลองถ่ายใหม่หรือใช้หน้าค้นหา อย่าตีความว่าไม่พบผลแล้วภาพนั้นไม่มีขยะ'}];
