import {protectPage} from "@/lib/page-access";
import AdminWorkspace from "@/components/admin-workspace";
import AdminManager from "@/components/admin-manager";
export default async function Page({params}:{params:Promise<{section?:string[]}>}){await protectPage(true);const {section}=await params;const current=section?.[0]??"overview";return <AdminWorkspace section={current}><AdminManager key={current} section={current}/></AdminWorkspace>;}
