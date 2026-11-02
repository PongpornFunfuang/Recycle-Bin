// General learning guidance supplied by the owner. Never a verified campus rule.
export const wasteColors = [
 {key:'blue',thai:'ขยะทั่วไป',english:'General Waste',color:'#1769bf',symbol:'■',accept:['ซองขนมที่จุดรับไม่รับรีไซเคิล','กระดาษทิชชูใช้แล้ว'],reject:['ถ่านและแบตเตอรี่','เศษอาหารที่แยกได้'],prepare:'แยกของเหลวและของอันตรายออก ตรวจเงื่อนไขจุดรับก่อนทิ้ง'},
 {key:'red',thai:'ขยะอันตราย',english:'Hazardous Waste',color:'#b92b39',symbol:'⚠',accept:['ถ่านไฟฉายใช้แล้ว','หลอดไฟตามเงื่อนไขจุดรับ'],reject:['ขยะทั่วไป','อาหารและบรรจุภัณฑ์อาหาร'],prepare:'ไม่แกะ เจาะ หรือเผา แยกเก็บอย่างปลอดภัยและติดต่อจุดรับเฉพาะ'},
 {key:'yellow',thai:'ขยะรีไซเคิล',english:'Recyclable Waste',color:'#986900',symbol:'♻',accept:['ขวดเครื่องดื่มสะอาดที่จุดรับรับ','กระดาษและกระป๋องตามเงื่อนไข'],reject:['ภาชนะปนสารอันตราย','วัสดุเปื้อนอาหารที่จุดรับไม่รับ'],prepare:'เทของเหลวออกเมื่อปลอดภัย แยกวัสดุและทำความสะอาดตามข้อกำหนดจุดรับ'},
 {key:'green',thai:'ขยะเปียก / ขยะอินทรีย์',english:'Organic Waste',color:'#157340',symbol:'☘',accept:['เศษอาหาร','เปลือกผลไม้ตามเงื่อนไขจุดรับ'],reject:['ถุงพลาสติกและช้อนส้อม','ของเสียอันตราย'],prepare:'แยกบรรจุภัณฑ์ออก ตรวจเงื่อนไขจุดรับก่อนทิ้ง'}
] as const;
export type WasteColor=typeof wasteColors[number]['key'];
export function normalizedColor(value:string|null|undefined):WasteColor|null{const v=value?.trim().toLowerCase().replace(/^สี/,'');return ({blue:'blue',น้ำเงิน:'blue',แดง:'red',red:'red',เหลือง:'yellow',yellow:'yellow',เขียว:'green',green:'green'} as Record<string,WasteColor>)[v??'']??null;}
export function navigationUrl(latitude:number,longitude:number){if(!Number.isFinite(latitude)||!Number.isFinite(longitude)||Math.abs(latitude)>90||Math.abs(longitude)>180)return null;return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=walking`;}
