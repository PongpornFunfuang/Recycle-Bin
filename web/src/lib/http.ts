import {NextRequest,NextResponse} from "next/server";
export function localOrigin(request:NextRequest){const host=request.headers.get("host");if(!host)throw Error("Missing host");const parsed=new URL(`http://${host}`);if(!["127.0.0.1","localhost","[::1]"].includes(parsed.hostname))throw Error("Loopback host required");return parsed.origin;}
export function sameOrigin(request:NextRequest){try{return request.headers.get("origin")===localOrigin(request);}catch{return false;}}
export function error(message:string,status=400){return NextResponse.json({error:{code:status===503?"NOT_CONFIGURED":"REQUEST_FAILED",message},requestId:crypto.randomUUID()},{status,headers:{"Cache-Control":"no-store"}});}
