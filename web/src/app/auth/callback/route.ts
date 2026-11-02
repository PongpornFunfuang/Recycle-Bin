import {NextRequest,NextResponse} from "next/server";
import {localOrigin} from "@/lib/http";
import {supabaseServer} from "@/lib/supabase-server";
export async function GET(req:NextRequest){const code=req.nextUrl.searchParams.get("code");try{const client=await supabaseServer();if(client&&code){const {error}=await client.auth.exchangeCodeForSession(code);if(!error){const next=req.nextUrl.searchParams.get("next");return NextResponse.redirect(new URL(next==="/reset-password"?next:"/profile",localOrigin(req)));}}}catch{}return NextResponse.redirect(new URL("/login?error=callback_failed",localOrigin(req)));}
