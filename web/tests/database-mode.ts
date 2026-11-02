import {existsSync,readFileSync} from 'node:fs';
const localFile=existsSync('.env.local')?readFileSync('.env.local','utf8'):'';
export const expectedDatabaseMode=process.env.RB_EXPECT_DATABASE??(/^NEXT_PUBLIC_SUPABASE_URL=\s*https:\/\/\S+/m.test(localFile)?'ready':'not_configured');
if(!['ready','not_configured'].includes(expectedDatabaseMode))throw Error('RB_EXPECT_DATABASE must be ready or not_configured');
