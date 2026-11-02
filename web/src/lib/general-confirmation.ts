import {generalGuidance} from './general-guidance';
export const generalGuidanceVersion='general-2026-11-02-v1';
export function generalConfirmationSnapshot(item:{slug:string;name:string}){
 const guidance=generalGuidance(item.slug);
 return guidance?{...guidance,version:generalGuidanceVersion,identification:'user_selected',itemSlug:item.slug,itemName:item.name}:null;
}
