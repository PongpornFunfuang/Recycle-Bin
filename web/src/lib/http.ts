import {NextRequest,NextResponse} from "next/server";
export function localOrigin(request:NextRequest){
 const host=request.headers.get("host");
 if(!host)throw Error("Missing host");
 if(process.env.VERCEL==="1"){
  if(!host.endsWith(".vercel.app")||!/^[a-z0-9.-]+$/i.test(host))throw Error("Untrusted deployment host");
  return `https://${host}`;
 }
 const parsed=new URL(`http://${host}`);
 if(!["127.0.0.1","localhost","[::1]"].includes(parsed.hostname)||parsed.username||parsed.password||parsed.host!==host)throw Error("Loopback host required");
 return parsed.origin;
}
export function sameOrigin(request:NextRequest){
 try{
  const origin=request.headers.get("origin");
  if(!origin)return false;
  const parsed=new URL(origin);
  if(parsed.protocol!=="https:"||!parsed.hostname.endsWith(".vercel.app"))return false;
  const hosts=[request.headers.get("host"),request.headers.get("x-forwarded-host")].filter(Boolean).flatMap(value=>String(value).split(",").map(item=>item.trim().toLowerCase()));
  return hosts.includes(parsed.host.toLowerCase());
 }catch{return false;}
}
export function error(message:string,status=400){return NextResponse.json({error:{code:status===503?"NOT_CONFIGURED":"REQUEST_FAILED",message},requestId:crypto.randomUUID()},{status,headers:{"Cache-Control":"no-store"}});}
