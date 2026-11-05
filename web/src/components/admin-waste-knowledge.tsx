'use client';
import {useCallback,useEffect,useState} from 'react';
import type {KnowledgeCase,KnowledgeEntry} from '@/lib/knowledge-catalog';
import {colorForKnowledgeCase} from '@/lib/waste-knowledge-overrides';
import './admin-waste-knowledge.css';

type Revision={version:number;content:KnowledgeEntry;editor_id:string;created_at:string};
type Row={slug:string;visibility:string;rowVersion:number;latestVersion:number;publishedVersion:number|null;updatedAt:string|null;updatedBy:string|null;revisions:Revision[];entry?:KnowledgeEntry};
type ReferenceSource={id:string;title:string;reference:string;verification_status?:string;archived_at?:string|null};
const emptyCase=():KnowledgeCase=>({condition:'',material:'',category:'',steps:[],sorting:'',color:null,caution:''});
const emptyEntry=():KnowledgeEntry=>({id:'',name:'',english:'',icon:'♻',aliases:[],sourceUrl:'',checkedAt:'',scope:'general',basis:'item',cases:[emptyCase()],imageId:null});
const categories=['ขยะทั่วไป','ขยะรีไซเคิล','ขยะอินทรีย์ / เศษอาหาร','ขยะอันตราย','ยังระบุประเภทไม่ได้'];
function latest(row:Row){return [...row.revisions].sort((a,b)=>b.version-a.version)[0]?.content??row.entry??emptyEntry();}
export default function AdminWasteKnowledge(){
 const [rows,setRows]=useState<Row[]>([]),[total,setTotal]=useState(0),[page,setPage]=useState(1);
 const [query,setQuery]=useState(''),[status,setStatus]=useState('all'),[category,setCategory]=useState('all');
 const [selected,setSelected]=useState<Row|null>(null),[entry,setEntry]=useState<KnowledgeEntry>(emptyEntry());
 const [sources,setSources]=useState<ReferenceSource[]>([]);
 const [message,setMessage]=useState(''),[busy,setBusy]=useState(false);
 const load=useCallback(async()=>{try{const p=new URLSearchParams({q:query,status,category,page:String(page)});const r=await fetch(`/api/admin/waste-knowledge?${p}`,{cache:'no-store'});const data=await r.json();if(!r.ok)throw Error(data.error?.message??'อ่านข้อมูลไม่ได้');setRows(data.items);setTotal(data.total);setMessage('');}catch(e){setRows([]);setMessage(e instanceof Error?e.message:'อ่านข้อมูลไม่ได้');}},[query,status,category,page]);
 useEffect(()=>{void load();},[load]);
 useEffect(()=>{fetch('/api/admin?resource=sources',{cache:'no-store'}).then(r=>r.json()).then(d=>{const rows=(d.rows??[]).filter((s:ReferenceSource)=>s.reference==='https://greener.bangkok.go.th'&&!s.archived_at);setSources(rows.length?rows:[{id:'greener-bangkok-default',title:'Greener Bangkok (แหล่งอ้างอิงแนะนำ)',reference:'https://greener.bangkok.go.th',verification_status:'verified'}]);}).catch(()=>setSources([{id:'greener-bangkok-default',title:'Greener Bangkok (แหล่งอ้างอิงแนะนำ)',reference:'https://greener.bangkok.go.th',verification_status:'verified'}]));},[]);
 function choose(row:Row|null){setSelected(row);setEntry(row?structuredClone(latest(row)):emptyEntry());}
 function patchCase(index:number,changes:Partial<KnowledgeCase>){setEntry(previous=>({...previous,cases:previous.cases.map((item,i)=>i===index?{...item,...changes}:item)}));}
 async function mutate(action:'save'|'publish'|'unpublish'){
  const slug=entry.id.trim();if(!slug){setMessage('กรุณาระบุ Stable Slug');return;}
  if(action==='unpublish'&&!window.confirm('ปิดการเผยแพร่รายการนี้ รวมถึงรายการตั้งต้นที่มีในโค้ด?'))return;
  setBusy(true);try{const body=action==='save'?{action,slug,expectedVersion:selected?.rowVersion??0,entry}:{action,slug,expectedVersion:selected?.rowVersion??0};const r=await fetch('/api/admin/waste-knowledge',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const result=await r.json();if(!r.ok)throw Error(result.error?.message??'บันทึกไม่ได้');setMessage(result.message);choose(null);await load();}catch(e){setMessage(e instanceof Error?e.message:'บันทึกไม่ได้');}finally{setBusy(false);}
 }
 async function upload(file:File){setBusy(true);try{const form=new FormData();form.append('image',file);const r=await fetch('/api/admin/waste-knowledge/image',{method:'POST',body:form});const data=await r.json();if(!r.ok)throw Error(data.error?.message??'อัปโหลดไม่สำเร็จ');setEntry(previous=>({...previous,imageId:data.id}));setMessage('อัปโหลดแล้ว กรุณาบันทึกร่างเพื่อเชื่อมภาพกับรายการ');}catch(e){setMessage(e instanceof Error?e.message:'อัปโหลดไม่สำเร็จ');}finally{setBusy(false);}}
 return <div className="wk-layout">
  <section className="panel wk-list"><h2>ฐานความรู้ขยะ</h2><p className="muted">รายการเดิม 39 รายการและข้อมูลที่ Admin เพิ่ม · การแก้ไขเก็บเป็นฉบับในฐานข้อมูล Test</p>
   <div className="wk-filters"><input aria-label="ค้นหาชื่อหรือ Alias" placeholder="ค้นหาชื่อหรือ Alias" value={query} onChange={e=>{setQuery(e.target.value);setPage(1);}}/>
    <select aria-label="กรองสถานะ" value={status} onChange={e=>{setStatus(e.target.value);setPage(1);}}><option value="all">ทุกสถานะ</option><option value="baseline">รายการตั้งต้น</option><option value="draft">ร่าง</option><option value="published">เผยแพร่</option><option value="unpublished">ปิดเผยแพร่</option></select>
    <select aria-label="กรองประเภทขยะ" value={category} onChange={e=>{setCategory(e.target.value);setPage(1);}}><option value="all">ทุกประเภท</option>{categories.map(value=><option key={value} value={value}>{value}</option>)}</select></div>
   <button type="button" className="button primary" onClick={()=>choose(null)}>เพิ่มรายการขยะ</button>
   <p className="muted">พบ {total} รายการ · หน้า {page}</p>
   {rows.map(row=><article className="wk-row" key={row.slug}><div><strong>{latest(row).name||row.slug}</strong><small>{row.slug} · {row.visibility} · แก้ไข {row.updatedAt?new Date(row.updatedAt).toLocaleString('th-TH'):'ข้อมูลตั้งต้น'}{row.updatedBy?` · ${row.updatedBy.slice(0,8)}`:''}</small></div><button type="button" className="button secondary" onClick={()=>choose(row)}>แก้ไข</button></article>)}
   <div className="wk-pager"><button type="button" disabled={page<=1} onClick={()=>setPage(page-1)}>ก่อนหน้า</button><button type="button" disabled={page*20>=total} onClick={()=>setPage(page+1)}>ถัดไป</button></div>
  </section>
  <section className="panel wk-editor"><h2>{selected?`แก้ไข ${selected.slug}`:'เพิ่มคำแนะนำรายชนิดขยะ'}</h2>{message&&<p className="notice" role="status">{message}</p>}
   <div className="wk-fields"><label>Stable Slug<input value={entry.id} disabled={!!selected} onChange={e=>setEntry({...entry,id:e.target.value})} placeholder="paper-box"/></label>
    <label>ชื่อขยะ<input value={entry.name} onChange={e=>setEntry({...entry,name:e.target.value})}/></label>
    <label>ชื่ออังกฤษหรือ AI Label<input value={entry.english} onChange={e=>setEntry({...entry,english:e.target.value})}/></label>
    <label>Alias (บรรทัดละชื่อ)<textarea value={(entry.aliases??[]).join('\n')} onChange={e=>setEntry({...entry,aliases:e.target.value.split('\n').map(v=>v.trim()).filter(Boolean)})}/></label>
    <label>แหล่งอ้างอิง<select value={entry.sourceUrl} onChange={e=>setEntry({...entry,sourceUrl:e.target.value})}><option value="">เลือกแหล่งอ้างอิงที่บันทึกไว้</option>{sources.map(source=><option key={source.id} value={source.reference}>{source.title} · {source.reference}</option>)}</select>{!sources.length&&<small className="muted">ยังไม่มีแหล่งอ้างอิง กรุณาเพิ่มที่เมนู “แหล่งอ้างอิง” ก่อน</small>}</label>
    <label>วันที่ตรวจสอบแหล่งอ้างอิง<input type="date" value={entry.checkedAt} onChange={e=>setEntry({...entry,checkedAt:e.target.value})}/></label>
    <label>รูปภาพขยะ<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>{const file=e.target.files?.[0];if(file)void upload(file);}}/></label>
    {entry.imageId&&<div className="wk-image"><img src={`/api/waste-knowledge-image/${entry.imageId}`} alt={`ภาพประกอบ ${entry.name}`}/><button type="button" onClick={()=>setEntry({...entry,imageId:null})}>ยกเลิกการเชื่อมรูป</button></div>}</div>
   <h3>คำแนะนำตามวัสดุและสภาพ</h3>{entry.cases.map((item,index)=><fieldset className="wk-case" key={index}><legend>กรณีที่ {index+1}</legend>
    <label>เงื่อนไข<input value={item.condition} onChange={e=>patchCase(index,{condition:e.target.value})}/></label>
    <label>วัสดุ<input value={item.material??''} onChange={e=>patchCase(index,{material:e.target.value||null})}/></label>
    <label>ประเภทขยะ<select value={item.category} onChange={e=>patchCase(index,{category:e.target.value})}><option value="">เลือกประเภท</option>{categories.map(value=><option key={value}>{value}</option>)}</select></label>
    <label>วิธีเตรียมก่อนทิ้ง (บรรทัดละขั้นตอน)<textarea value={item.steps.join('\n')} onChange={e=>patchCase(index,{steps:e.target.value.split('\n').map(v=>v.trim()).filter(Boolean)})}/></label>
    <label>วิธีคัดแยก<textarea value={item.sorting} onChange={e=>patchCase(index,{sorting:e.target.value})}/></label>
    <label>ข้อควรระวัง<textarea value={item.caution} onChange={e=>patchCase(index,{caution:e.target.value})}/></label>
    <p className="muted">รูปถัง: {colorForKnowledgeCase(item)?`/images/bins/${colorForKnowledgeCase(item)}.svg`:'ยังระบุสีถังไม่ได้ — ตรวจวัสดุและประเภทก่อน'}</p>
    {entry.cases.length>1&&<button type="button" onClick={()=>setEntry({...entry,cases:entry.cases.filter((_,i)=>i!==index)})}>ลบกรณีนี้</button>}
   </fieldset>)}<button type="button" className="button secondary" onClick={()=>setEntry({...entry,cases:[...entry.cases,emptyCase()]})}>เพิ่มกรณีวัสดุ</button>
   <div className="wk-actions"><button type="button" className="button secondary" disabled={busy} onClick={()=>void mutate('save')}>บันทึกร่าง</button><button type="button" className="button primary" disabled={busy||!selected||selected.latestVersion===0} onClick={()=>void mutate('publish')}>เผยแพร่ฉบับล่าสุด</button><button type="button" className="button secondary" disabled={busy||!selected} onClick={()=>void mutate('unpublish')}>ปิดเผยแพร่</button></div>
   {selected&&<details><summary>ประวัติการแก้ไข ({selected.revisions.length})</summary><ol>{[...selected.revisions].sort((a,b)=>b.version-a.version).map(rev=><li key={rev.version}>ฉบับ {rev.version} · {new Date(rev.created_at).toLocaleString('th-TH')} · ผู้แก้ {rev.editor_id.slice(0,8)}{selected.publishedVersion===rev.version?' · เผยแพร่':''}</li>)}</ol></details>}
  </section>
 </div>;
}
