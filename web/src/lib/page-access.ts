import 'server-only';
import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {createServerClient} from '@supabase/ssr';
import {databaseConfig} from './config';
export async function protectPage(admin=false){let config;try{config=databaseConfig();}catch{return;}if(!config)return;const jar=await cookies();const client=createServerClient(config.url,config.key,{cookies:{getAll:()=>jar.getAll(),setAll:()=>{}}});let user;try{const result=await client.auth.getUser();user=result.data.user;}catch{redirect('/login?error=session_unavailable');}if(!user)redirect('/login');if(admin){const result=await client.rpc('current_user_is_admin');if(result.error||result.data!==true)redirect('/profile?error=admin_required');}}
