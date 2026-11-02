import WasteDetail from '@/components/waste-detail';
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;return <div className="page"><WasteDetail slug={slug}/></div>;}
