export type DetectionBox = { xMin:number; yMin:number; xMax:number; yMax:number };
export type DetectionLike = { box:DetectionBox; confidence:number };

function area(box:DetectionBox){return Math.max(0,box.xMax-box.xMin)*Math.max(0,box.yMax-box.yMin);}
function iou(a:DetectionBox,b:DetectionBox){
  const xMin=Math.max(a.xMin,b.xMin), yMin=Math.max(a.yMin,b.yMin);
  const xMax=Math.min(a.xMax,b.xMax), yMax=Math.min(a.yMax,b.yMax);
  const intersection=Math.max(0,xMax-xMin)*Math.max(0,yMax-yMin);
  const union=area(a)+area(b)-intersection;
  return union>0?intersection/union:0;
}
function containment(a:DetectionBox,b:DetectionBox){
  const xMin=Math.max(a.xMin,b.xMin), yMin=Math.max(a.yMin,b.yMin);
  const xMax=Math.min(a.xMax,b.xMax), yMax=Math.min(a.yMax,b.yMax);
  const intersection=Math.max(0,xMax-xMin)*Math.max(0,yMax-yMin);
  const smaller=Math.min(area(a),area(b));
  return smaller>0?intersection/smaller:0;
}

/** Remove duplicate cross-class boxes while retaining nearby distinct objects. */
export function suppressOverlappingDetections<T extends DetectionLike>(detections:T[]):T[]{
  const ordered=detections.map((d,index)=>({d,index})).sort((a,b)=>b.d.confidence-a.d.confidence);
  const kept:T[]=[];
  for(const candidate of ordered){
    const duplicate=kept.some(existing=>iou(existing.box,candidate.d.box)>=0.65 || containment(existing.box,candidate.d.box)>=0.9);
    if(!duplicate)kept.push(candidate.d);
  }
  return kept;
}

