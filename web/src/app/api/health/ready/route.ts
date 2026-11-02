import {databaseConfig} from '@/lib/config';
import {createClient} from '@supabase/supabase-js';
import {databaseProbeStatus} from '@/lib/database-readiness';
export async function GET(){let database='not_configured';try{const config=databaseConfig();if(config){const client=createClient(config.url,config.key,{auth:{persistSession:false}});const {data,error}=await client.rpc('product_health').abortSignal(AbortSignal.timeout(5000));database=databaseProbeStatus(data,error);}}catch{database='unavailable';}return Response.json({component:'web',status:database==='ready'?'ready':'not_ready',milestone:'M1',checks:{database},aiScannerReady:false},{status:database==='ready'?200:503,headers:{'Cache-Control':'no-store'}});}
