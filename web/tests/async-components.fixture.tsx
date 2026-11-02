// Isolated browser-test entry ONLY. Never imported by the product or served by Next.
import {createRoot} from 'react-dom/client';
import AdminManager from '../src/components/admin-manager';
import DatabaseQuiz from '../src/components/database-quiz';
import Recommendation from '../src/components/recommendation';
import SaveScan from '../src/components/save-scan';
import {useState,useMemo} from 'react';
declare global{interface Window{testMount:(kind:string,saved?:boolean)=>void;testSavedResult:(id:string)=>void}}
let mountId=0;
const root=createRoot(document.getElementById('fixture')!);
function SaveHarness(){const [id,setId]=useState('A');window.testSavedResult=setId;const result=useMemo(()=>({predictionId:id}),[id]);return <SaveScan result={result} receipt="synthetic-receipt" onSaved={()=>{throw Error('Injected failure must never become success');}}/>;}
window.testMount=(kind,saved=false)=>root.render(kind==='admin'?<AdminManager section="rules"/>:kind==='quiz'?<DatabaseQuiz key={++mountId}/>:kind==='save'?<SaveHarness/>:<Recommendation label="bottle" predictionId="50000000-0000-4000-8000-000000000001" detectionId="60000000-0000-4000-8000-000000000001" saved={saved}/>);
