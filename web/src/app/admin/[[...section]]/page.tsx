import {protectPage} from "@/lib/page-access";
import AdminWorkspace from "@/components/admin-workspace";
import AdminManager from "@/components/admin-manager";
import AdminWasteKnowledge from "@/components/admin-waste-knowledge";
export default async function Page({params}:{params:Promise<{section?:string[]}>}){await protectPage(true);const {section}=await params;const current=section?.[0]??"overview";return <AdminWorkspace section={current}>{current==='waste-knowledge'?<AdminWasteKnowledge/>:<AdminManager key={current} section={current}/>}</AdminWorkspace>;}
