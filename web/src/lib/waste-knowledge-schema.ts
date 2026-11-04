import {z} from 'zod';
import type {KnowledgeEntry} from './knowledge-catalog';
import {normalizeKnowledgeEntry} from './waste-knowledge-overrides';

const slug=z.string().regex(/^[a-z0-9][a-z0-9-]{0,99}$/);
const text=(max:number)=>z.string().trim().min(1).max(max);
const optionalText=(max:number)=>z.string().trim().max(max);
const caseSchema=z.object({
 condition:text(500),material:optionalText(120).nullable(),category:text(120),
 steps:z.array(text(500)).min(1).max(20),sorting:text(2000),
 color:z.enum(['blue','yellow','green','red']).nullable(),caution:optionalText(2000)
}).strict();
export const knowledgeEntrySchema=z.object({
 id:slug,name:text(200),english:optionalText(200),icon:optionalText(20),
 sourceUrl:z.url().refine(url=>url.startsWith('https://'),'ใช้ URL แบบ HTTPS'),
 checkedAt:z.iso.date(),scope:z.literal('general'),basis:z.enum(['item','category']).optional(),
 aliases:z.array(text(200)).max(30).optional(),cases:z.array(caseSchema).min(1).max(12),
 imageId:z.uuid().nullable().optional()
}).strict();
export const draftKnowledgeSchema=knowledgeEntrySchema.extend({cases:z.array(caseSchema).max(12),sourceUrl:z.string().max(2000),checkedAt:z.string().max(10)});
export const knowledgeMutationSchema=z.discriminatedUnion('action',[
 z.object({action:z.literal('save'),slug,expectedVersion:z.number().int().nonnegative(),entry:draftKnowledgeSchema}).strict(),
 z.object({action:z.enum(['publish','unpublish']),slug,expectedVersion:z.number().int().nonnegative()}).strict()
]);
export function validateKnowledgeForPublish(raw:unknown):KnowledgeEntry{
 const entry=knowledgeEntrySchema.parse(raw) as KnowledgeEntry;
 return normalizeKnowledgeEntry(entry);
}
