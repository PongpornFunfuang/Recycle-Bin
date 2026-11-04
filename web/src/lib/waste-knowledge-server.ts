import 'server-only';
import {createClient} from '@supabase/supabase-js';
import {databaseConfig} from './config';
import {supabaseServer} from './supabase-server';
import type {PublishedKnowledgeRow} from './waste-knowledge-overrides';

export function knowledgeTestGuard(){
 const config=databaseConfig();
 if(process.env.RB_WASTE_KNOWLEDGE_ENABLED!=='1')throw Error('knowledge_feature_not_released');
 if(process.env.RB_EXPECT_DATABASE!=='test'||process.env.RB_TEST_PROJECT_REF!=='yyprbgvhmncddlyeduyr'||config?.url!=='https://yyprbgvhmncddlyeduyr.supabase.co')throw Error('knowledge_test_only');
 return config;
}
export function knowledgeImageWriter(){
 const config=knowledgeTestGuard(),key=process.env.SUPABASE_SECRET_KEY?.trim();
 if(!key?.startsWith('sb_secret_'))throw Error('test_image_writer_unavailable');
 return createClient(config.url,key,{auth:{persistSession:false,autoRefreshToken:false}});
}
export async function knowledgeAdmin(){
 knowledgeTestGuard();
 const db=await supabaseServer();
 if(!db)return {db:null,user:null,status:503};
 const {data:{user},error}=await db.auth.getUser();
 if(error||!user)return {db:null,user:null,status:401};
 const role=await db.rpc('current_user_is_admin');
 if(role.error||role.data!==true)return {db:null,user:null,status:403};
 return {db,user,status:200};
}
export async function publicKnowledgeRows():Promise<PublishedKnowledgeRow[]>{
 if(process.env.RB_EXPECT_DATABASE!=='test'||process.env.RB_WASTE_KNOWLEDGE_ENABLED!=='1')return [];
 const config=databaseConfig();
 if(!config)throw Error('database_not_configured');
 const db=createClient(config.url,config.key,{auth:{persistSession:false}});
 const response=await db.rpc('public_waste_knowledge');
 if(response.error||!Array.isArray(response.data))throw Error('knowledge_snapshot_unavailable');
 return response.data as PublishedKnowledgeRow[];
}
