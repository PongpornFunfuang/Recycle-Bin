export const adminGroups = [
  {id:"locations",label:"จัดการจุดถังขยะ",items:[["areas","พื้นที่"],["locations","จุดติดตั้งถัง"],["bin-types","ชนิดถัง"]]},
  {id:"catalog",label:"จัดการข้อมูลขยะ",items:[["waste-knowledge","รายการขยะ"],["categories","หมวดขยะ"],["sources","แหล่งอ้างอิง"]]},
  {id:"content",label:"บทความและแบบทดสอบ",items:[["knowledge","ความรู้"],["quiz","แบบทดสอบ"],["questions","คำถามและเฉลย"]]},
  {id:"more",label:"เพิ่มเติม",items:[["feedback","ข้อเสนอแนะและปัญหา"],["contact","ข้อความติดต่อ"],["audit","ประวัติการจัดการ"],["users","สมาชิก"],["relationships","เชื่อมโยงข้อมูล"]]},
] as const;
export function adminTitle(section:string){return section==="overview"?"ภาพรวม":section==="bins"?"ถัง (หน้าเดิม)":section==="reviews"?"ตรวจสอบแหล่งอ้างอิง (หน้าเดิม)":adminGroups.map(g=>g.items.find(([path])=>path===section)).find(Boolean)?.[1]??"จัดการข้อมูลโครงงาน";}
