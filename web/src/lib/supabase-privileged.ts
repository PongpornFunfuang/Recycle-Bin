import 'server-only';
import {createClient} from '@supabase/supabase-js';
import {databaseConfig} from './config';
export function verifiedScanWriter(){const config=databaseConfig();const key=process.env.SUPABASE_SECRET_KEY?.trim();if(!config||!key||!key.startsWith('sb_secret_'))return null;return createClient(config.url,key,{auth:{persistSession:false,autoRefreshToken:false}});}
export function evidenceWriter(){
 if(process.env.RB_PIN_WRITES_ENABLED==='0')return null;
 const config=databaseConfig(),key=process.env.SUPABASE_SECRET_KEY?.trim();
 if(!config||!key?.startsWith('sb_secret_'))return null;
 return createClient(config.url,key,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(input,init)=>fetch(input,{...init,signal:AbortSignal.any([...(init?.signal?[init.signal]:[]),AbortSignal.timeout(20000)])})}});
}
