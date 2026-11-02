import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const leaks=[];const directory=path.join(root,'web/.next/static');
function walk(dir){for(const file of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,file.name);if(file.isDirectory())walk(p);else if(/\.(js|json|map)$/.test(file.name)&&fs.readFileSync(p,'utf8').includes('RB_SERVER_ONLY_TEST_CANARY_2026'))leaks.push(path.relative(root,p));}}
if(!fs.existsSync(directory))throw Error('Production build missing');walk(directory);
const audit=JSON.parse(fs.readFileSync(path.join(root,'docs/evidence/npm-audit.json'),'utf8').replace(/^\uFEFF/,''));
const pythonPath=path.join(root,'docs/evidence/python-advisories.json');
const python=fs.existsSync(pythonPath)?JSON.parse(fs.readFileSync(pythonPath,'utf8')):null;
const pythonStatus=python?{checked:python.packages.length,advisoryPackages:python.packages.filter(p=>p.status==='ADVISORIES_FOUND').map(p=>p.name),pending:python.packages.filter(p=>p.status==='PENDING').map(p=>p.name),source:'PyPI version advisories only; CUDA binary libraries not separately audited'}:'PENDING';
const result={clientBuildCanary:{status:leaks.length?'FAIL':'PASS',leakedFiles:leaks,note:'Synthetic server-only marker, not a real credential'},npmAudit:audit.metadata?.vulnerabilities??null,pythonAdvisoryAudit:pythonStatus,cloudRLS:'PENDING; only local PGlite tests executed',deploymentGate:'NOT_READY'};
fs.writeFileSync(path.join(root,'docs/evidence/security-check.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));if(leaks.length)process.exitCode=1;
