import type {KnowledgeEntry,KnowledgeCase} from './knowledge-catalog';
import {knowledgeForAiLabel,resolveWasteKnowledge} from './knowledge-catalog';
import type {WasteColor} from './waste-colors';

export type PublishedKnowledgeRow={slug:string;visibility:'published'|'unpublished';content:KnowledgeEntry|null};

const colors:Record<string,WasteColor>={
 'ขยะทั่วไป':'blue','ขยะรีไซเคิล':'yellow',
 'ขยะอินทรีย์ / เศษอาหาร':'green','ขยะอันตราย':'red'
};
export function colorForKnowledgeCase(value:Pick<KnowledgeCase,'category'|'material'>):WasteColor|null{
 // A broad object name or category alone does not establish the material/condition.
 return value.material?.trim() ? colors[value.category]??null : null;
}
export function normalizeKnowledgeEntry(entry:KnowledgeEntry):KnowledgeEntry{
 return {...entry,cases:entry.cases.map(value=>({...value,color:colorForKnowledgeCase(value)}))};
}
export function resolvePublishedKnowledge(
 item:{slug:string;name:string;materials?:string[]},rows:PublishedKnowledgeRow[]
):{entry:KnowledgeEntry|null;hidden:boolean}{
 const own=rows.find(row=>row.slug===item.slug);
 if(own?.visibility==='unpublished')return {entry:null,hidden:true};
 if(own?.visibility==='published'&&own.content)return {entry:own.content,hidden:false};
 const matched=resolveWasteKnowledge(item).entry;
 if(matched&&rows.some(row=>row.slug===matched.id&&row.visibility==='unpublished'))return {entry:null,hidden:true};
 const overridden=matched&&rows.find(row=>row.slug===matched.id&&row.visibility==='published');
 return {entry:overridden?.content??matched,hidden:false};
}
export function resolvePublishedAiKnowledge(label:string,rows:PublishedKnowledgeRow[]):KnowledgeEntry|null{
 const original=knowledgeForAiLabel(label);
 if(!original)return null;
 const row=rows.find(candidate=>candidate.slug===original.id);
 if(row?.visibility==='unpublished')return null;
 return row?.visibility==='published'&&row.content?row.content:original;
}
export function isAiKnowledgeUnpublished(label:string,rows:PublishedKnowledgeRow[]):boolean{
 const original=knowledgeForAiLabel(label);
 return !!original&&rows.some(row=>row.slug===original.id&&row.visibility==='unpublished');
}
