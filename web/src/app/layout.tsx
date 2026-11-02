import type {Metadata} from "next";
import Link from "next/link";
import Navigation from "@/components/navigation";
import "./globals.css";
export const metadata:Metadata={title:{default:"Recycle Bin — แค่ถ่ายขยะ…ก็รู้ว่าควรแยกยังไง",template:"%s | Recycle Bin"},description:"ผู้ช่วยคัดแยกขยะด้วย AI สำหรับชุมชนมหาวิทยาลัย"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="th"><body><a href="#main-content" className="skip-link">ข้ามไปเนื้อหา</a><Navigation/>{process.env.RB_TEST_PROJECT_REF&&<div className="notice info" role="status">TEST ENVIRONMENT — ข้อมูลทดสอบ ไม่ใช่ตำแหน่งถังจริงหรือสถิติ Production</div>}<main id="main-content">{children}</main><footer><div><Link className="footer-brand" href="/">♻ Recycle Bin</Link><p>แยกขยะชิ้นเล็ก ๆ เพื่อการเปลี่ยนแปลงที่ยั่งยืน</p></div><span className="pilot">มหาวิทยาลัยศรีปทุม วิทยาเขตขอนแก่น</span><Link href="/locations">จุดทิ้งขยะ</Link><Link href="/about">เกี่ยวกับโครงงาน</Link><Link href="/contact">ติดต่อเรา</Link></footer></body></html>;}
