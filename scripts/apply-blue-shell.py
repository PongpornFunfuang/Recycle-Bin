from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
gate=json.loads((root/'backups/pre-blue-white-redesign/verification.json').read_text())
if gate['status']!='PASS':raise SystemExit('Backup gate not passed')
(root/'web/src/app/page.tsx').write_text('export {default} from "@/components/home";\n',encoding='utf-8')
(root/'web/src/app/layout.tsx').write_text('''import type {Metadata} from "next";
import Link from "next/link";
import Navigation from "@/components/navigation";
import "./globals.css";
export const metadata:Metadata={title:{default:"Recycle Bin — แค่ถ่ายขยะ…ก็รู้ว่าควรแยกยังไง",template:"%s | Recycle Bin"},description:"ผู้ช่วยคัดแยกขยะด้วย AI สำหรับชุมชนมหาวิทยาลัย"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="th"><body><a href="#main-content" className="skip-link">ข้ามไปเนื้อหา</a><Navigation/><main id="main-content">{children}</main><footer><div><Link className="footer-brand" href="/">♻ Recycle Bin</Link><p>แยกขยะชิ้นเล็ก ๆ เพื่อการเปลี่ยนแปลงที่ยั่งยืน</p></div><span className="pilot">มหาวิทยาลัยศรีปทุม วิทยาเขตขอนแก่น</span><Link href="/locations">จุดทิ้งขยะ</Link><Link href="/about">เกี่ยวกับโครงงาน</Link><Link href="/contact">ติดต่อเรา</Link></footer></body></html>;}
''',encoding='utf-8')
(root/'web/src/app/globals.css').write_text('@import "tailwindcss";\n@import "./design-tokens.css";\n@import "./product.css";\n',encoding='utf-8')
print('Blue shell activated after verified backup')
