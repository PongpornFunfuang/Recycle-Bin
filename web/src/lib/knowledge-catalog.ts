import type {WasteColor} from './waste-colors';

export type KnowledgeCase={condition:string;material:string|null;category:string;steps:string[];sorting:string;color:WasteColor|null;caution:string};
export type KnowledgeEntry={id:string;name:string;english:string;icon:string;sourceUrl:string;checkedAt:string;scope:'general';basis?:'item'|'category';cases:KnowledgeCase[];aliases?:string[];imageId?:string|null};

const source='https://greener.bangkok.go.th/waste-recycle/community-waste-guide/';
const checkedAt='2026-11-04';
const groups={
 recycling:{category:'ขยะรีไซเคิล',color:'yellow' as WasteColor,steps:['ตรวจชนิดวัสดุและสิ่งปนเปื้อน','แยกวัสดุอื่นตามเงื่อนไขของจุดรับ'],sorting:'ส่งจุดรับรีไซเคิลที่รับวัสดุชนิดนี้',caution:'หากเปื้อนมาก เคลือบ หรือผู้รับไม่รับ ต้องตรวจทางเลือกอีกครั้ง'},
 organic:{category:'ขยะอินทรีย์ / เศษอาหาร',color:'green' as WasteColor,steps:['แยกบรรจุภัณฑ์และวัสดุอื่นออก','สะเด็ดน้ำหรือคัดเฉพาะเศษที่ต้องการทิ้ง'],sorting:'ส่งระบบรับเศษอาหารหรืออินทรีย์ที่มีอยู่จริง',caution:'อาหารที่ยังใช้ได้ไม่ควรถือเป็นขยะโดยอัตโนมัติ'},
 general:{category:'ขยะทั่วไป',color:'blue' as WasteColor,steps:['แยกเศษอาหาร ของเหลว และของอันตรายออก','รวบรวมให้มิดชิด'],sorting:'ใช้ช่องขยะทั่วไปเมื่อไม่สามารถส่งรีไซเคิลได้',caution:'หากมีสารอันตรายปนเปื้อน ต้องใช้แนวทางเฉพาะ'},
 hazardous:{category:'ขยะอันตราย',color:'red' as WasteColor,steps:['แยกจากขยะชนิดอื่น','เก็บอย่างปลอดภัยเพื่อป้องกันแตก รั่ว หรือสัมผัสสาร'],sorting:'สอบถามจุดรับของเสียอันตรายที่ตรวจสอบได้',caution:'อย่าแกะ เจาะ เผา หรือทิ้งปะปน และห้ามสมมติจุดรับในมหาวิทยาลัย'}
};
// Preparation follows the physical form, not the broad disposal category.
const preparation={
 bottle:['เทของเหลวที่เหลือออก','ล้างเมื่อจำเป็นและปล่อยให้แห้ง','บีบขวดพลาสติกเพื่อลดพื้นที่เมื่อปลอดภัย','แยกฝาหรือฉลากตามเงื่อนไขของจุดรับ'],
 glassContainer:['เทสิ่งที่เหลือออกและตรวจว่าภาชนะไม่แตก','ล้างเมื่อจำเป็นและปล่อยให้แห้ง','แยกฝาตามเงื่อนไขของจุดรับ'],
 foodContainer:['นำเศษอาหารออก','เช็ดหรือล้างเมื่อจำเป็นและปล่อยให้แห้ง','แยกฝาและวัสดุต่างชนิดตามเงื่อนไขของจุดรับ'],
 drinkCan:['เทเครื่องดื่มที่เหลือออก','ล้างเมื่อจำเป็นและปล่อยให้แห้ง','รวบรวมแยกตามชนิดโลหะที่จุดรับรองรับ'],
 foodCan:['นำเศษอาหารออกอย่างระมัดระวัง','ล้างเมื่อจำเป็นและปล่อยให้แห้ง','ระวังขอบคมและรวบรวมตามชนิดโลหะที่จุดรับรองรับ'],
 dryPaper:['แยกสิ่งที่ไม่ใช่กระดาษออกเมื่อทำได้','เก็บให้แห้งและไม่ปนเปื้อนอาหารหรือสารเคมี','รวบรวมกระดาษตามเงื่อนไขของจุดรับ'],
 cardboard:['นำสิ่งของภายในออก','แยกเทปกาวและวัสดุอื่นเมื่อเหมาะสม','พับกล่องให้แบนและเก็บให้แห้ง'],
 carton:['เทเครื่องดื่มที่เหลือออก','ล้างและผึ่งให้แห้ง','พับให้เล็กและตรวจว่าจุดรับรับกล่องเครื่องดื่ม'],
 cap:['ตรวจชนิดวัสดุของฝา','รวบรวมฝาแยกตามเงื่อนไขของจุดรับ'],
 film:['นำสิ่งของออกและตรวจคราบอาหาร','หากทำความสะอาดได้ ให้ผึ่งจนแห้ง','รวบรวมเฉพาะชนิดที่จุดรับรับ'],
 organic:['แยกออกจากถุงและบรรจุภัณฑ์','คัดของมีคม พลาสติก และสิ่งปนเปื้อนออก','ส่งระบบรับเศษอาหารหรืออินทรีย์ที่มีอยู่จริง'],
 plant:['แยกพลาสติกและของมีคมออก','รวบรวมเศษพืชที่ไม่ปนสารเคมี','ตรวจว่าระบบรับอินทรีย์รับเศษพืชชนิดนี้'],
 wrapper:['นำเศษอาหารออกเมื่อทำได้','รวบรวมซองให้มิดชิด','ตรวจว่ามีผู้รับรีไซเคิลซองชนิดนี้หรือไม่'],
 stainedBag:['หากมีเศษอาหาร ให้แยกออกเมื่อทำได้','รวบรวมถุงเปื้อนให้มิดชิด','ตรวจว่ามีระบบรับถุงชนิดนี้หรือไม่'],
 diaper:['ห่อผ้าอ้อมใช้แล้วให้มิดชิด','ใส่ถุงหรือภาชนะที่ปิดได้','หากเป็นของเสียติดเชื้อ ให้ใช้แนวทางเฉพาะ'],
 tissue:['รวบรวมทิชชูใช้แล้วในถุงที่มัดปิด','แยกจากกระดาษรีไซเคิลสะอาด','หากปนสารอันตรายหรือเชื้อ ให้ใช้แนวทางเฉพาะ'],
 hazardous:['อย่าแกะ เจาะ เผา หรือทำให้เสียหาย','แยกจากขยะทั่วไปและเก็บไม่ให้แตกหรือรั่ว','ตรวจจุดรับของเสียอันตรายที่มีอยู่จริง'],
 electronic:['ปิดอุปกรณ์และลบข้อมูลส่วนตัวเมื่อทำได้อย่างปลอดภัย','อย่าแกะหรือทำให้แบตเตอรี่เสียหาย','ส่งจุดรับขยะอิเล็กทรอนิกส์ที่ตรวจสอบได้'],
 coatedCup:['เทเครื่องดื่มที่เหลือออก','แยกฝาและหลอดตามวัสดุ','ตรวจว่าจุดรับรับแก้วกระดาษเคลือบชนิดนี้หรือไม่']
} as const;
type Preparation=keyof typeof preparation;
const preparationById:Record<string,Preparation>={
 'pet-bottle':'bottle','hdpe-bottle':'bottle','plastic-container':'foodContainer','plastic-cap':'cap','plastic-bag-clean':'film',
 'glass-bottle':'glassContainer','glass-jar':'glassContainer','aluminium-can':'drinkCan','steel-can':'foodCan',
 'clean-paper':'dryPaper','newspaper':'dryPaper','office-paper':'dryPaper','cardboard':'cardboard','milk-carton':'carton',
 'food-scraps':'organic','fruit-peels':'organic','vegetable-scraps':'organic','eggshell':'organic','leaves':'plant','grass-clippings':'plant',
 'dirty-wrapper':'wrapper','food-stained-bag':'stainedBag','used-diaper':'diaper','used-tissue':'tissue',
 'used-battery':'hazardous','used-light-bulb':'hazardous','expired-medicine':'hazardous','spray-can':'hazardous','broken-electronic':'electronic','fluorescent-tube':'hazardous',
 'plastic-cup-clean':'foodContainer','paper-cup-coated':'coatedCup'
};
function entry(id:string,name:string,english:string,icon:string,group:keyof typeof groups,material:string,condition:string,sourceUrl=source):KnowledgeEntry{
 const rule=groups[group];const profile=preparationById[id];return {id,name,english,icon,sourceUrl,checkedAt,scope:'general',cases:[{condition,material,category:rule.category,steps:profile?[...preparation[profile]]:rule.steps,sorting:rule.sorting,color:rule.color,caution:rule.caution}]};
}
export const knowledgeEntries:KnowledgeEntry[]=[
 entry('pet-bottle','ขวดพลาสติก PET','PET bottle','🧴','recycling','พลาสติก PET','ยืนยันชนิด PET และไม่มีสารอันตราย'),
 entry('hdpe-bottle','ขวดพลาสติก HDPE','HDPE bottle','🧴','recycling','พลาสติก HDPE','ยืนยันชนิดพลาสติกและจุดรับรับ'),
 entry('plastic-container','กล่องพลาสติกสะอาด','plastic container','🥡','recycling','พลาสติก','วัสดุสะอาดและจุดรับรับพลาสติกชนิดนี้'),
 entry('plastic-cap','ฝาขวดพลาสติก','plastic cap','🧴','recycling','พลาสติก','แยกฝาและจุดรับรับ'),
 entry('plastic-bag-clean','ถุงพลาสติกสะอาด','clean plastic bag','🛍️','recycling','พลาสติก','ถุงสะอาด แห้ง และจุดรับรับพลาสติกฟิล์ม'),
 entry('glass-bottle','ขวดแก้ว','glass bottle','🍾','recycling','แก้ว','ขวดไม่บรรจุสารอันตรายและจุดรับรับแก้ว'),
 entry('glass-jar','ขวดโหลแก้ว','glass jar','🫙','recycling','แก้ว','ล้างเศษอาหารและจุดรับรับแก้ว'),
 entry('aluminium-can','กระป๋องอะลูมิเนียม','aluminium can','🥫','recycling','อะลูมิเนียม','กระป๋องเครื่องดื่มไม่ปนสารอันตราย'),
 entry('steel-can','กระป๋องเหล็ก','steel can','🥫','recycling','เหล็ก','กระป๋องอาหารที่เทเศษออกและจุดรับรับ'),
 entry('clean-paper','กระดาษสะอาด','clean paper','📄','recycling','กระดาษ','แห้ง ไม่เปื้อน และไม่เคลือบที่จุดรับไม่รับ'),
 entry('newspaper','หนังสือพิมพ์','newspaper','📰','recycling','กระดาษ','แห้งและไม่ปนเปื้อน'),
 entry('office-paper','กระดาษสำนักงาน','office paper','📃','recycling','กระดาษ','แห้งและไม่ปนเปื้อน'),
 {...entry('cardboard','กล่องกระดาษลัง','cardboard','📦','recycling','กระดาษลูกฟูก','กล่องแห้ง ไม่เคลือบพลาสติกและไม่เปื้อนอาหาร','https://www.epa.gov/circulareconomy/what-you-can-do-improve-recycling-rate'),basis:'item',aliases:['กล่องกระดาษ']},
 entry('milk-carton','กล่องเครื่องดื่ม','beverage carton','🧃','recycling','วัสดุผสม','ล้าง ผึ่งแห้ง และจุดรับรับกล่องเครื่องดื่ม'),
 entry('food-scraps','เศษอาหาร','food scraps','🍚','organic','อินทรีย์','ยืนยันว่าเป็นเศษอาหารที่ต้องการทิ้ง'),
 entry('fruit-peels','เปลือกผลไม้','fruit peels','🍌','organic','อินทรีย์','แยกสติกเกอร์และบรรจุภัณฑ์ออก'),
 entry('vegetable-scraps','เศษผัก','vegetable scraps','🥬','organic','อินทรีย์','แยกพลาสติกและสิ่งปนเปื้อนออก'),
 entry('eggshell','เปลือกไข่','eggshell','🥚','organic','อินทรีย์','แยกเปลือกออกจากบรรจุภัณฑ์'),
 entry('leaves','ใบไม้','leaves','🍃','organic','อินทรีย์','ไม่ปะปนพลาสติกหรือของมีคม'),
 entry('grass-clippings','เศษหญ้า','grass clippings','🌿','organic','อินทรีย์','ไม่ปะปนพลาสติกหรือสารเคมี'),
 entry('dirty-wrapper','ซองขนมเปื้อน','dirty snack wrapper','🍬','general','วัสดุผสม','จุดรับไม่รับรีไซเคิลซองชนิดนี้'),
 entry('food-stained-bag','ถุงเปื้อนอาหาร','food-stained bag','🛍️','general','พลาสติก','ทำความสะอาดส่งรีไซเคิลไม่ได้และไม่มีจุดรับ'),
 entry('used-diaper','ผ้าอ้อมสำเร็จรูปใช้แล้ว','used diaper','🧷','general','วัสดุผสม','ห่อให้มิดชิดและไม่มีขยะติดเชื้อที่ต้องจัดการเฉพาะ'),
 entry('used-tissue','กระดาษทิชชูใช้แล้ว','used tissue','🧻','general','กระดาษ','ไม่ได้ปนสารอันตรายหรือของเสียติดเชื้อ','https://greener.bangkok.go.th/en/how-to-ting/tissues/'),
 entry('used-battery','ถ่านไฟฉายและแบตเตอรี่ใช้แล้ว','used battery','🔋','hazardous','แบตเตอรี่','เป็นแบตเตอรี่หมดอายุหรือชำรุด'),
 entry('used-light-bulb','หลอดไฟใช้แล้ว','used light bulb','💡','hazardous','แก้วและชิ้นส่วนไฟฟ้า','หลอดไฟใช้แล้วและป้องกันแตก'),
 entry('expired-medicine','ยาหมดอายุ','expired medicine','💊','hazardous','ยา','ยาหมดอายุที่ไม่ใช่ของเสียติดเชื้อจากสถานพยาบาล'),
 entry('spray-can','กระป๋องสเปรย์ใช้แล้ว','used aerosol can','🧯','hazardous','โลหะและสารเคมี','กระป๋องสเปรย์ใช้แล้ว ห้ามเจาะหรือเผา'),
 entry('broken-electronic','อุปกรณ์อิเล็กทรอนิกส์เสีย','broken electronic device','📱','hazardous','อิเล็กทรอนิกส์','อุปกรณ์เสียที่มีแบตเตอรี่หรือชิ้นส่วนอันตราย','https://greener.bangkok.go.th/waste-recycle/how-to-ting/'),
 entry('fluorescent-tube','หลอดฟลูออเรสเซนต์','fluorescent tube','💡','hazardous','แก้วและสารภายในหลอด','ป้องกันแตกและตรวจจุดรับหลอดไฟ'),
 entry('plastic-cup-clean','แก้วพลาสติกสะอาด','clean plastic cup','🥤','recycling','พลาสติก','ยืนยันชนิดพลาสติก ล้างและจุดรับรับ','https://greener.bangkok.go.th/waste-recycle/how-to-ting/'),
 entry('paper-cup-coated','แก้วกระดาษเคลือบ','coated paper cup','🥤','general','กระดาษเคลือบ','จุดรับไม่รับรีไซเคิลแก้วเคลือบชนิดนี้','https://greener.bangkok.go.th/waste-recycle/how-to-ting/')
];

const byId=new Map(knowledgeEntries.map(item=>[item.id,item]));
function caseFor(id:string){const found=byId.get(id)?.cases[0];if(!found)throw new Error(`Missing knowledge case: ${id}`);return found;}
export const ambiguousKnowledge:Record<string,KnowledgeEntry>={
 bottle:{id:'bottle',name:'ขวดเครื่องดื่ม',english:'bottle',icon:'🧴',sourceUrl:source,checkedAt,scope:'general',cases:[caseFor('pet-bottle'),caseFor('glass-bottle')]},
 cup:{id:'cup',name:'แก้วหรือถ้วยเครื่องดื่ม',english:'cup',icon:'🥤',sourceUrl:source,checkedAt,scope:'general',cases:[caseFor('plastic-cup-clean'),caseFor('paper-cup-coated')]}
};
const legacyKnowledge:Record<string,KnowledgeEntry>={
 food:{...byId.get('food-scraps')!,id:'food',name:'เศษผักและผลไม้'},
 battery:{...byId.get('used-battery')!,id:'battery',name:'ถ่านและแบตเตอรี่'},
 metal:{id:'metal',name:'กระป๋องโลหะ',english:'can',icon:'🥫',sourceUrl:source,checkedAt,scope:'general',cases:[caseFor('aluminium-can'),caseFor('steel-can')]}
};
const brokenGlass:KnowledgeEntry={id:'broken-glass-guidance',name:'แก้วแตกหรือเศษแก้ว',english:'broken glass',icon:'⚠️',sourceUrl:'https://greener.bangkok.go.th/how-to-ting/เศษแก้ว/',checkedAt,scope:'general',basis:'item',cases:[{condition:'ยืนยันว่าเป็นเศษแก้วจริงและไม่มีสารเคมีปนเปื้อน',material:'แก้ว',category:'ของมีคม — ต้องจัดการอย่างปลอดภัย',steps:['ห่อหรือบรรจุเศษแก้วให้ไม่บาดผู้อื่น','ปิดภาชนะให้แน่นและเขียนกำกับว่าเป็นเศษแก้วแตก','สอบถามจุดรับที่รองรับเศษแก้วห่อแล้ว'],sorting:'อย่าปะปนกับขวดแก้วที่ไม่แตกโดยไม่มีเงื่อนไขจากผู้รับ',color:null,caution:'ห้ามจับเศษแก้วด้วยมือเปล่า และอย่าสมมติว่าถังรีไซเคิลทุกจุดรับเศษแก้ว'}]};
export function knowledgeForSlug(slug:string):KnowledgeEntry|null{return byId.get(slug)??ambiguousKnowledge[slug]??legacyKnowledge[slug]??null;}
function normalizeName(name:string){return name.replace(/^\s*\[TEST\]\s*/i,'').normalize('NFKC').trim().replace(/\s+/g,' ').toLocaleLowerCase();}
export function resolveWasteKnowledge(item:{slug:string;name:string;materials?:string[]}):{entry:KnowledgeEntry|null;level:'item'|'material'|'fallback'}{
 const exact=knowledgeForSlug(item.slug);
 if(exact)return {entry:exact,level:'item'};
 const name=normalizeName(item.name);
 if(name==='แก้วแตก'||name==='เศษแก้ว')return {entry:brokenGlass,level:'item'};
 const candidates=[...knowledgeEntries,...Object.values(ambiguousKnowledge),...Object.values(legacyKnowledge)].filter(candidate=>[candidate.name,candidate.english,...(candidate.aliases??[])].some(alias=>normalizeName(alias)===name));
 if(candidates.length===1)return {entry:candidates[0],level:'item'};
 if(candidates.length>1)return {entry:null,level:'fallback'};
 const materials=[...new Set((item.materials??[]).map(normalizeName))];
 if(materials.length!==1)return {entry:null,level:'fallback'};
 const material=materials[0];
 if(!['กระดาษ','พลาสติก','แก้ว','โลหะ'].includes(material))return {entry:null,level:'fallback'};
 const steps=material==='กระดาษ'?['ตรวจว่ากระดาษแห้ง สะอาด และไม่เคลือบ','แยกส่วนที่ไม่ใช่กระดาษออกเมื่อทำได้','ตรวจเงื่อนไขจุดรับกระดาษก่อนทิ้ง']:['ตรวจชนิดและสภาพของวัสดุ','แยกสิ่งปนเปื้อนเมื่อปลอดภัย','ตรวจว่าจุดรับรับวัสดุชนิดนี้หรือไม่'];
 return {level:'material',entry:{id:`material-${material}`,name:item.name,english:material,icon:'♻',sourceUrl:source,checkedAt,scope:'general',cases:[{condition:`ทราบเพียงว่าเป็นวัสดุ${material} ยังไม่ยืนยันชนิดและสภาพ`,material,category:'ต้องตรวจสอบเพิ่มเติม',steps,sorting:'ตรวจชนิดวัสดุและเงื่อนไขผู้รับก่อนเลือกวิธีทิ้ง',color:null,caution:'ข้อมูลวัสดุอย่างเดียวไม่พอระบุสีถังหรือจุดทิ้ง'}]}};
}
export function knowledgeForAiLabel(label:string):KnowledgeEntry|null{
 if(label==='bottle'||label==='cup')return ambiguousKnowledge[label];
 if(['banana','apple','orange','broccoli','carrot','sandwich','pizza'].includes(label))return knowledgeForSlug('food-scraps');
 return null;
}
