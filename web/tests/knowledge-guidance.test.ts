import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {items} from '../src/lib/catalog';
import {knowledgeEntries,knowledgeForAiLabel,resolveWasteKnowledge} from '../src/lib/knowledge-catalog';
import {binGuidanceForAiLabel,binGuidanceForSlug} from '../src/lib/bin-guidance';

test('all 39 catalog entries have safe mapping and all 32 knowledge entries have metadata',()=>{
 assert.equal(knowledgeEntries.length,32);
 assert.equal(items.length,39);
 assert.equal(new Set(items.map(item=>item.id)).size,39);
 const colors:Record<string,string>={'ขยะรีไซเคิล':'yellow','ขยะอินทรีย์ / เศษอาหาร':'green','ขยะทั่วไป':'blue','ขยะอันตราย':'red'};
 const levels={item:0,material:0,fallback:0};
 for(const item of items){
  const {entry,level}=resolveWasteKnowledge({slug:item.id,name:item.name,materials:item.material.includes('ต้องยืนยัน')?[]:[item.material]});
  levels[level]++;
  if(level==='fallback'){assert.equal(entry,null);assert.equal(binGuidanceForSlug(item.id),null);continue;}
  assert.ok(entry,item.id);
  assert.match(entry.sourceUrl,/^https:\/\/(greener\.bangkok\.go\.th|www\.epa\.gov)\//);
  assert.equal(entry.checkedAt,'2026-11-04');
  assert.equal(entry.scope,'general');
  assert.ok(entry.cases.length);
  for(const advice of entry.cases){
   assert.ok(advice.condition&&advice.category&&advice.steps.length&&advice.sorting&&advice.caution,item.id);
   if(advice.color){assert.equal(advice.color,colors[advice.category],item.id);assert.ok(existsSync(`public/images/bins/${advice.color}.svg`),item.id);}
  }
 }
 assert.deepEqual(levels,{item:37,material:1,fallback:1});
});

test('cardboard uses dry paper preparation, including the existing Test database name',()=>{
 for(const input of [{slug:'cardboard',name:'[TEST] กล่องกระดาษ'},{slug:'different-database-slug',name:'[TEST] กล่องกระดาษ'}]){
  const result=resolveWasteKnowledge(input);
  assert.equal(result.entry?.id,'cardboard');
  assert.equal(result.level,'item');
  assert.match(result.entry!.cases[0].steps.join(' '),/พับกล่องให้แบน/);
  assert.doesNotMatch(result.entry!.cases[0].steps.join(' '),/เทของเหลว|บีบขวด|ล้าง/);
 }
 assert.equal(resolveWasteKnowledge({slug:'unknown',name:'[TEST] ขวด'}).level,'fallback');
});

test('physical forms do not inherit bottle steps from recyclable category',()=>{
 for(const item of knowledgeEntries){
  const advice=item.cases[0];
  assert.ok(advice.material&&advice.category&&advice.steps.length&&advice.sorting&&advice.caution&&item.sourceUrl);
  if(['กระดาษ','กระดาษลูกฟูก'].includes(advice.material))assert.doesNotMatch(advice.steps.join(' '),/เทของเหลว|บีบขวด|ล้าง/);
  if(advice.category==='ขยะอินทรีย์ / เศษอาหาร')assert.doesNotMatch(advice.steps.join(' '),/เทของเหลว|บีบขวด|ล้าง/);
  if(advice.category==='ขยะอันตราย')assert.doesNotMatch(advice.steps.join(' '),/ล้าง|บีบขวด|เทของเหลว/);
  assert.doesNotMatch(advice.steps.join(' '),/ตรวจชนิดวัสดุและสิ่งปนเปื้อน/,'item lacks a preparation profile: '+item.id);
 }
 assert.match(resolveWasteKnowledge({slug:'pet-bottle',name:'ขวด PET'}).entry!.cases[0].steps.join(' '),/บีบขวด/);
 assert.match(resolveWasteKnowledge({slug:'aluminium-can',name:'กระป๋อง'}).entry!.cases[0].steps.join(' '),/เทเครื่องดื่ม/);
 assert.match(resolveWasteKnowledge({slug:'used-battery',name:'ถ่าน'}).entry!.cases[0].steps.join(' '),/อย่าแกะ เจาะ/);
});

test('broken glass, ambiguous AI labels and unknown material remain conditional',()=>{
 const glass=resolveWasteKnowledge({slug:'unknown-glass',name:'[TEST] แก้วแตก'}).entry;
 assert.ok(glass);
 assert.match(glass.cases[0].steps.join(' '),/เศษแก้วแตก/);
 assert.equal(glass.cases[0].color,null);
 assert.equal(knowledgeForAiLabel('bottle')?.cases.length,2);
 assert.equal(knowledgeForAiLabel('cup')?.cases.length,2);
 assert.equal(binGuidanceForAiLabel('bottle'),null);
 assert.equal(binGuidanceForSlug('bottle'),null);
 assert.equal(binGuidanceForSlug('cup'),null);
 assert.equal(resolveWasteKnowledge({slug:'unknown',name:'ไม่ทราบชนิด'}).level,'fallback');
});
