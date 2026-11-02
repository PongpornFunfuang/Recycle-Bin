"""One manually reviewed bottle annotation; not mAP or general accuracy."""
from pathlib import Path
import httpx,json,hashlib,time,statistics
r=Path(__file__).resolve().parents[2];out=r/'docs/evidence/product';out.mkdir(exist_ok=True)
gt={'image':'empty-bottle.jpg','class':'bottle','box':{'xMin':.12,'yMin':.43,'xMax':.825,'yMax':.93},'method':'Manual visual review of original image; approximate axis-aligned box; single bottle-class annotation only. Other classes are not exhaustively annotated.'}
def iou(a,b):
 inter=max(0,min(a['xMax'],b['xMax'])-max(a['xMin'],b['xMin']))*max(0,min(a['yMax'],b['yMax'])-max(a['yMin'],b['yMin']))
 area=lambda x:(x['xMax']-x['xMin'])*(x['yMax']-x['yMin'])
 return inter/(area(a)+area(b)-inter)
records=[]
with httpx.Client(timeout=45) as c:
 for name in ['empty-bottle.jpg','bottles-for-recycling.jpg']:
  data=(r/'ml/test-images'/name).read_bytes();runs=[];result=None
  for _ in range(3):
   start=time.perf_counter();response=c.post('http://127.0.0.1:8000/ai/detect',files={'image':('input.jpg',data,'image/jpeg')},data={'mode':'photo'});response.raise_for_status();result=response.json();runs.append({'httpMs':round((time.perf_counter()-start)*1000,2),'pipelineMs':result['latencyMs']})
  record={'image':name,'sha256':hashlib.sha256(data).hexdigest(),'modelVersion':result['modelVersion'],'runs':runs,'detections':[{k:d[k] for k in ['label','confidence','decision','box']} for d in result['detections']]}
  if name==gt['image']:
   bottles=[d for d in result['detections'] if d['label']=='bottle' and d['decision']=='accepted'];overlaps=[iou(d['box'],gt['box']) for d in bottles];tp=int(any(v>=.5 for v in overlaps));record['bottleOnlyGroundTruth']={'count':1,'iouThreshold':.5,'bestIoU':max(overlaps,default=0),'truePositives':tp,'falseNegatives':1-tp,'falsePositives':len(bottles)-tp,'scope':'One manually annotated image, accepted bottle class only; NOT general accuracy/mAP'}
  else:record['groundTruth']='PENDING exhaustive annotation; no numerical false-positive/negative metric claimed'
  records.append(record)
(out/'ground-truth-bottle.json').write_text(json.dumps(gt,indent=2),encoding='utf-8');(out/'ai-evaluation.json').write_text(json.dumps(records,indent=2),encoding='utf-8');print(json.dumps([{k:v for k,v in x.items() if k!='detections'} for x in records],indent=2))
