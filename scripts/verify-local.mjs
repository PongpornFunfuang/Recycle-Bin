import {spawnSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const evidence=path.join(root,'docs/evidence');mkdirSync(evidence,{recursive:true});
const python=path.join(root,'ai-service/.venv/Scripts/python.exe');
const steps=[['typecheck',process.execPath,['node_modules/typescript/bin/tsc','--noEmit'],'web'],['node-tests',process.execPath,['--import','tsx','--test','tests/contracts.test.ts','tests/database.test.ts','tests/http.test.ts','tests/rules.test.ts'],'web'],['python-tests',python,['-m','pytest','tests','-q'],'ai-service'],['browser-smoke',process.execPath,['tests/browser-smoke.cjs'],'web'],['camera-synthetic',process.execPath,['tests/camera-smoke.cjs'],'web'],['production-build',process.execPath,['node_modules/next/dist/bin/next','build'],'web']];
const records=[];
for(const [name,command,args,directory] of steps){console.log('RUN',name);const started=new Date().toISOString();const result=spawnSync(command,args,{cwd:path.join(root,directory),env:{...process.env,NEXT_TELEMETRY_DISABLED:'1',AI_INTERNAL_TOKEN:name==='production-build'?'RB_SERVER_ONLY_TEST_CANARY_2026':process.env.AI_INTERNAL_TOKEN??''},encoding:'utf8',timeout:180000,maxBuffer:4*1024*1024});const output=(result.stdout??'')+(result.stderr??'');writeFileSync(path.join(evidence,name+'.log'),output);records.push({name,started,exitCode:result.status,status:result.status===0?'PASS':'FAIL',error:result.error?.message??null});console.log(name,records.at(-1).status);if(result.status!==0)console.log(output.slice(-5000));}
writeFileSync(path.join(evidence,'verification-results.json'),JSON.stringify({capturedAt:new Date().toISOString(),scope:'Local tests only; camera uses Chromium synthetic stream; no cloud writes or deployment',results:records},null,2));
if(records.some(r=>r.status!=='PASS'))process.exitCode=1;
