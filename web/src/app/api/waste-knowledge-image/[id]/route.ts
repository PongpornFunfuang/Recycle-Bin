import {NextRequest,NextResponse} from 'next/server';
import {createClient} from '@supabase/supabase-js';
import {z} from 'zod';
import {databaseConfig} from '@/lib/config';
import {supabaseServer} from '@/lib/supabase-server';
import {validateEvidenceImage} from '@/lib/validate-evidence-image';
import {error} from '@/lib/http';

export async function GET(_req:NextRequest,{params}:{params:Promise<{id:string}>}){
 try{
  if(process.env.RB_EXPECT_DATABASE!=='test')return error('ไม่พบภาพ',404);
  const id=z.uuid().parse((await params).id),config=databaseConfig();if(!config)return error('Storage ยังไม่พร้อม',503);
  const publicDb=createClient(config.url,config.key,{auth:{persistSession:false}});
  const publicPath=await publicDb.rpc('public_waste_knowledge_image_key',{p_id:id});
  let path=typeof publicPath.data==='string'?publicPath.data:null;
  let client=publicDb;
  if(!path){
   const userDb=await supabaseServer();if(!userDb)return error('ไม่พบภาพ',404);
   const identity=await userDb.auth.getUser(),role=await userDb.rpc('current_user_is_admin');
   if(!identity.data.user||role.data!==true)return error('ไม่พบภาพ',404);
   const image=await userDb.from('waste_knowledge_images').select('object_key').eq('id',id).maybeSingle();
   path=image.data?.object_key??null;client=userDb;
  }
  if(!path)return error('ไม่พบภาพ',404);
  const downloaded=await client.storage.from('waste-knowledge').download(path);
  if(downloaded.error||!downloaded.data)return error('ไม่พบภาพ',404);
  const bytes=new Uint8Array(await downloaded.data.arrayBuffer()),mime=await validateEvidenceImage(bytes);
  if(!mime)return error('ภาพเสียหาย',415);
  return new NextResponse(bytes,{headers:{'Content-Type':mime,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; sandbox"}});
 }catch{return error('ไม่พบภาพ',404);}
}
