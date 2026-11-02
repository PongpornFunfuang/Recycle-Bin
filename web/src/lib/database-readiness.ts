type ProbeError={code?:string}|null;
export function databaseProbeStatus(data:unknown,error:ProbeError):'ready'|'schema_pending'|'unavailable'{
 if(error)return ['PGRST202','PGRST205','42883','42P01'].includes(error.code??'')?'schema_pending':'unavailable';
 return data&&typeof data==='object'&&'schemaVersion' in data&&data.schemaVersion===5?'ready':'schema_pending';
}
