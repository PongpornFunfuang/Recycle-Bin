import { z } from "zod";
import { isIP } from "node:net";

const productionProjectRef="fdmohzvuxvsrcaddbjvl";
const testProjectRef="yyprbgvhmncddlyeduyr";

export function databaseConfig() {
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
 if(!url&&!key)return null;
 if(!url||!key||!z.url().safeParse(url).success||!key.startsWith("sb_publishable_"))throw Error("Supabase configuration is invalid; use a publishable key only");
 const parsed=new URL(url),testRef=process.env.RB_TEST_PROJECT_REF?.trim(),mode=process.env.RB_EXPECT_DATABASE?.trim()??(testRef?"test":"production");
 if(parsed.protocol!=="https:"||parsed.username||parsed.password||parsed.pathname!=="/"||parsed.search||parsed.hash)throw Error("Supabase URL must be an HTTPS project origin");
 if(!["test","production"].includes(mode))throw Error("RB_EXPECT_DATABASE must be test or production");
 if(process.env.VERCEL_ENV==="preview"&&mode!=="test")throw Error("Vercel Preview must use the dedicated Test project");
 if(mode==="test"){
  if(testRef!==testProjectRef||parsed.hostname!==testRef+".supabase.co"||process.env.VERCEL_ENV==="production")throw Error("Test environment must use the dedicated Test project");
 }else if(testRef||parsed.hostname!==productionProjectRef+".supabase.co"){
  throw Error("Production environment must use the Production project only");
 }
 return {url,key};
}

const loopbackHosts=new Set(["localhost","127.0.0.1","[::1]"]);
const publicHostname=/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

export function aiServiceConfig(){
 const raw=process.env.AI_SERVICE_URL?.trim()||"http://127.0.0.1:8000";
 const token=process.env.AI_INTERNAL_TOKEN?.trim();
 let url:URL;
 try{url=new URL(raw);}catch{throw Error("AI_SERVICE_URL must be an absolute URL");}
 if(url.username||url.password||url.search||url.hash||url.pathname!=="/")throw Error("AI_SERVICE_URL must contain only an origin");
 if(loopbackHosts.has(url.hostname)){
  if(url.protocol!=="http:")throw Error("Loopback AI must use HTTP");
  const headers:Record<string,string>={};
  if(token)headers["X-AI-Token"]=token;
  return {url:url.origin,headers};
 }
 const host=url.hostname.toLowerCase();
 if(url.protocol!=="https:"||url.port||isIP(host)!==0||!publicHostname.test(host)||host.endsWith(".localhost")||host.endsWith(".local")||host.endsWith(".internal"))throw Error("Remote AI must use a public HTTPS hostname");
 if(process.env.AI_TUNNEL_HOST?.trim().toLowerCase()!==host)throw Error("Remote AI hostname must match AI_TUNNEL_HOST");
 if(process.env.AI_TUNNEL_MODE?.trim()==="quick"){
  if(!host.endsWith(".trycloudflare.com")||!token)throw Error("Quick Tunnel requires a trycloudflare.com host and AI_INTERNAL_TOKEN");
  return {url:url.origin,headers:{"X-AI-Token":token}};
 }
 const clientId=process.env.CLOUDFLARE_ACCESS_CLIENT_ID?.trim();
 const clientSecret=process.env.CLOUDFLARE_ACCESS_CLIENT_SECRET?.trim();
 if(!clientId||!clientSecret)throw Error("Cloudflare Access service credentials are required for remote AI");
 const headers:Record<string,string>={
  "CF-Access-Client-Id":clientId,
  "CF-Access-Client-Secret":clientSecret
 };
 if(token)headers["X-AI-Token"]=token;
 return {url:url.origin,headers};
}

export function aiUrl(){return aiServiceConfig().url;}
