import {NextRequest,NextResponse} from "next/server";
import {createServerClient} from "@supabase/ssr";
import {databaseConfig} from "@/lib/config";
export async function proxy(request:NextRequest){
 let response=NextResponse.next({request});
 response.headers.set("Cache-Control","private, no-store");
 try{
  const config=databaseConfig();if(!config)return response;
  const client=createServerClient(config.url,config.key,{cookies:{getAll(){return request.cookies.getAll();},setAll(values){values.forEach(({name,value})=>request.cookies.set(name,value));response=NextResponse.next({request});values.forEach(({name,value,options})=>response.cookies.set(name,value,options));response.headers.set("Cache-Control","private, no-store");}}});
  await client.auth.getClaims();
 }catch{/* APIs enforce identity and report configuration/network errors. */}
 return response;
}
export const config={matcher:["/profile","/settings","/learning","/contact","/history/:path*","/dashboard","/disposals","/feedback","/admin/:path*"]};
