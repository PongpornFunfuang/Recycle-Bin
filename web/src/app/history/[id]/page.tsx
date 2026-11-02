import {protectPage} from "@/lib/page-access";
import SavedScan from '@/components/saved-scan';
export default async function Page({params}:{params:Promise<{id:string}>}){await protectPage();const {id}=await params;return <div className="page"><SavedScan id={id}/></div>;}
