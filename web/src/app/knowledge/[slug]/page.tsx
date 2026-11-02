import Knowledge from '@/components/knowledge';
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;return <div className="page"><Knowledge slug={slug}/></div>;}
