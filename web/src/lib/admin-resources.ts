export const resources={
 materials:{table:"material_categories",title:"วัสดุ",fields:[["slug","รหัสวัสดุ","text"],["name","ชื่อวัสดุ","text"]]},
 categories:{table:"waste_categories",title:"หมวดขยะ",fields:[["slug","รหัสหมวด","text"],["name","ชื่อหมวด","text"]]},
 questions:{table:"quiz_questions",title:"คำถามและเฉลย",fields:[["quiz_id","ชุดแบบทดสอบ","quizzes"],["position","ลำดับคำถาม","number"],["prompt","คำถาม","textarea"],["choices","ตัวเลือก (บรรทัดละข้อ)","lines"],["answer","ข้อที่ถูกต้อง (เริ่มที่ 1)","number"],["explanation","คำอธิบาย","textarea"]]},
 catalog:{table:"waste_items",title:"รายการขยะ",fields:[['slug','รหัสรายการ','text'],['name','ชื่อรายการ','text'],['category_id','หมวดขยะ (ไม่บังคับ)','optional-category'],['status','สถานะ','draft,published,retired']]},
 rules:{table:"disposal_rules",title:"กฎคัดแยก",fields:[['item_id','รายการขยะ','waste_items'],['area_id','พื้นที่','areas'],['rule_key','กลุ่มกฎ (ระบบสร้างให้เมื่อเพิ่มใหม่)','optional-rule-key'],['version','เวอร์ชัน','number'],['material_id','วัสดุที่ต้องยืนยัน (ไม่บังคับ)','optional-material'],['source_id','แหล่งอ้างอิง','data_sources'],['steps','ขั้นตอน (บรรทัดละข้อ)','lines'],['status','สถานะ','draft,verified,retired']]},
 knowledge:{table:"knowledge_entries",title:"เนื้อหาความรู้",fields:[['slug','รหัสบทความ','text'],['title','หัวข้อ','text'],['body','เนื้อหา','textarea'],['kind','ประเภท','article,tip,video'],['status','สถานะ','draft,published,retired']]},
 quiz:{table:"quizzes",title:"ชุดแบบทดสอบ",fields:[['slug','รหัสชุด','text'],['title','ชื่อแบบทดสอบ','text'],['version','เวอร์ชัน','number'],['status','สถานะ','draft,published,retired']]},
 areas:{table:"areas",title:"พื้นที่",fields:[['code','รหัสพื้นที่','text'],['name','ชื่อพื้นที่','text']]},
 sources:{table:"data_sources",title:"หลักฐานอ้างอิง",fields:[['title','ชื่อเอกสาร','text'],['reference','ที่มา / URL','text'],['verification_status','สถานะ','pending,verified,expired']]},
 reviews:{table:"data_sources",title:"ตรวจสอบแหล่งอ้างอิง",fields:[['title','ชื่อเอกสาร','text'],['reference','ที่มา / URL','text'],['verification_status','ผลการตรวจ','pending,verified,expired']]},
 bins:{table:"waste_bins",title:"ข้อมูลถัง",fields:[['area_id','พื้นที่','areas'],['bin_type_id','ชนิดถัง','bin_types'],['code','รหัสถัง','text'],['color','สีตามหลักฐาน','text'],['source_id','หลักฐาน','data_sources'],['verification_status','สถานะ','pending,verified,expired']]},
 "bin-types":{table:"bin_types",title:"ชนิดถัง",fields:[['code','รหัสชนิด','text'],['name','ชื่อชนิด','text']]},
 locations:{table:"locations",title:"ตำแหน่ง",fields:[['area_id','พื้นที่','areas'],['name','ชื่อจุด','text'],['latitude','ละติจูด','number'],['longitude','ลองจิจูด','number'],['source_id','หลักฐาน','data_sources'],['verification_status','สถานะ','pending,verified,expired']]}
} as const;
export type ResourceKey=keyof typeof resources;
export function resource(key:string){return Object.hasOwn(resources,key)?resources[key as ResourceKey]:null;}
