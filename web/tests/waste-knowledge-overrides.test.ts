import test from 'node:test';
import assert from 'node:assert/strict';
import {items} from '../src/lib/catalog';
import {knowledgeForSlug} from '../src/lib/knowledge-catalog';
import {colorForKnowledgeCase,normalizeKnowledgeEntry,resolvePublishedAiKnowledge,resolvePublishedKnowledge} from '../src/lib/waste-knowledge-overrides';
import {knowledgeEntrySchema} from '../src/lib/waste-knowledge-schema';

test('the 39 code catalog entries remain intact and an unpublished baseline cannot reappear',()=>{
 assert.equal(items.length,39);
 const hidden=resolvePublishedKnowledge({slug:'cardboard',name:'กล่องกระดาษ'},[{slug:'cardboard',visibility:'unpublished',content:null}]);
 assert.equal(hidden.hidden,true);assert.equal(hidden.entry,null);
});
test('a published revision supersedes static item guidance while draft cannot',()=>{
 const baseline=knowledgeForSlug('cardboard');assert.ok(baseline);
 const changed={...baseline,name:'กล่องกระดาษปรับปรุง'};
 assert.equal(resolvePublishedKnowledge({slug:'cardboard',name:'กล่องกระดาษ'},[{slug:'cardboard',visibility:'published',content:changed}]).entry?.name,'กล่องกระดาษปรับปรุง');
 assert.equal(resolvePublishedKnowledge({slug:'cardboard',name:'กล่องกระดาษ'},[]).entry?.name,baseline.name);
});
test('AI bottle remains material ambiguous and an unpublished mapping is hidden',()=>{
 assert.equal(resolvePublishedAiKnowledge('bottle',[])?.cases.length,2);
 assert.equal(resolvePublishedAiKnowledge('bottle',[{slug:'bottle',visibility:'unpublished',content:null}]),null);
 assert.equal(resolvePublishedAiKnowledge('unknown',[]),null);
});
test('bin image color derives from category and confirmed material, not a submitted color',()=>{
 const entry=knowledgeForSlug('cardboard');assert.ok(entry);
 const normalized=normalizeKnowledgeEntry({...entry,cases:entry.cases.map(value=>({...value,color:'red'}))});
 assert.equal(normalized.cases[0].color,'yellow');
 assert.equal(colorForKnowledgeCase({category:'ขยะรีไซเคิล',material:null}),null);
 assert.equal(colorForKnowledgeCase({category:'ของมีคม — ต้องจัดการอย่างปลอดภัย',material:'แก้ว'}),null);
 assert.deepEqual(['ขยะทั่วไป','ขยะรีไซเคิล','ขยะอินทรีย์ / เศษอาหาร','ขยะอันตราย'].map(category=>colorForKnowledgeCase({category,material:'ยืนยันแล้ว'})),['blue','yellow','green','red']);
 assert.equal(knowledgeEntrySchema.safeParse(normalized).success,true);
});
test('all 39 original entries retain their intended safe bin colors',()=>{
 for(const item of items){const entry=knowledgeForSlug(item.id);if(!entry)continue;
  for(const value of entry.cases)assert.equal(colorForKnowledgeCase(value),value.color,`${item.id}: ${value.category}`);
 }
});
