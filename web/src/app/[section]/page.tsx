import {protectPage} from "@/lib/page-access";
import {notFound} from "next/navigation";
import Link from "next/link";
import AuthForm from "@/components/auth-form";
import MemberPanel from "@/components/member-panel";
import Knowledge from "@/components/knowledge";
import DisposalMap from "@/components/disposal-map";
import Mascot from "@/components/mascot";
import {databaseConfig} from "@/lib/config";
const titles:Record<string,string>={about:"เกี่ยวกับ Recycle Bin",knowledge:"ความรู้เรื่องการแยกขยะ",contact:"ติดต่อเรา",login:"ยินดีต้อนรับกลับ",register:"เริ่มต้นเส้นทางการแยกขยะ",profile:"โปรไฟล์ของฉัน",history:"ประวัติการสแกน",disposals:"ประวัติยืนยันทิ้งขยะ",dashboard:"สถิติของฉัน",feedback:"ความคิดเห็นและแจ้งปัญหา",locations:"จุดทิ้งขยะในมหาวิทยาลัย",settings:"ตั้งค่าบัญชี",learning:"ผลการเรียนรู้","forgot-password":"ลืมรหัสผ่าน","reset-password":"ตั้งรหัสผ่านใหม่"};
const modes:Record<string,"login"|"register"|"forgot"|"reset">={login:"login",register:"register","forgot-password":"forgot","reset-password":"reset"};
export default async function Page({params}:{params:Promise<{section:string}>}){const {section}=await params;if(!titles[section])notFound();if(["profile","settings","history","disposals","dashboard","feedback","contact","learning"].includes(section))await protectPage();let configured=false;try{configured=!!databaseConfig();}catch{}return <div className="page"><div className="eyebrow">Recycle Bin · แยกขยะอย่างเข้าใจ</div><h1>{titles[section]}</h1>{modes[section]?<AuthForm mode={modes[section]} configured={configured}/>:section==='knowledge'?<Knowledge/>:section==='locations'?<><p className="page-intro">พื้นที่นำร่อง มหาวิทยาลัยศรีปทุม วิทยาเขตขอนแก่น · แสดงเฉพาะข้อมูลที่ตรวจสอบแล้ว</p><DisposalMap/></>:section==='about'?<div className="panel"><div className="about-brand"><Mascot/><div><h2>แค่ถ่ายขยะ…ก็รู้ว่าควรแยกยังไง</h2><p className="page-intro">Recycle Bin ช่วยค้นข้อมูล ตรวจจับสิ่งของด้วย AI และเรียนรู้การคัดแยกขยะสำหรับชุมชนมหาวิทยาลัย เชื่อมโยง SDG 11, 12 และ 13</p></div></div><p>AI ตรวจจับสิ่งของ กฎคัดแยกอ้างอิงข้อมูลพื้นที่ และผู้ใช้เป็นผู้ยืนยันการทิ้ง ทั้งสามขั้นตอนแยกจากกันเพื่อให้ข้อมูลตรวจสอบย้อนกลับได้</p><p>โมเดลปัจจุบันยังไม่รู้จักขยะทุกประเภท Confidence ไม่ใช่ Accuracy และไม่ยืนยันชนิดวัสดุหรือสีถังจากภาพ</p><Link href="/scanner" className="button primary">เริ่มสแกนขยะ</Link></div>:<MemberPanel section={section}/>}</div>;}
