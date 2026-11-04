import {NextResponse} from 'next/server';
import {publicKnowledgeRows} from '@/lib/waste-knowledge-server';
import {error} from '@/lib/http';
export async function GET(){
 try{return NextResponse.json({items:await publicKnowledgeRows()},{headers:{'Cache-Control':'no-store'}});}
 catch{return error('ฐานความรู้ที่เผยแพร่ยังไม่พร้อม',503);}
}
