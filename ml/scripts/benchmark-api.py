import io,json,statistics,time,sys,importlib.metadata
from pathlib import Path
import httpx
from PIL import Image,ImageOps
root=Path(__file__).resolve().parents[2]
records=[]
with httpx.Client(timeout=40) as client:
 for name in ['empty-bottle.jpg','bottles-for-recycling.jpg']:
  original=(root/'ml/test-images'/name).read_bytes()
  for kind in ['original-photo','camera-sized-frame']:
   data=original
   if kind=='camera-sized-frame':
    im=ImageOps.exif_transpose(Image.open(io.BytesIO(original))).convert('RGB');im.thumbnail((960,960));out=io.BytesIO();im.save(out,format='JPEG',quality=80);data=out.getvalue()
   runs=[];latencies=[];result=None
   for _ in range(3):
    started=time.perf_counter();response=client.post('http://127.0.0.1:8000/ai/detect',files={'image':('unrelated-name.jpg',data,'image/jpeg')},data={'mode':'photo' if kind=='original-photo' else 'live_snapshot'});response.raise_for_status();result=response.json();runs.append(round((time.perf_counter()-started)*1000,2));latencies.append(result['latencyMs'])
   records.append({'runtime':{'torch':importlib.metadata.version('torch'),'torchvision':importlib.metadata.version('torchvision')},'image':name,'input':kind,'bytes':len(data),'httpRoundTripMs':runs,'apiPipelineMs':latencies,'warmMedianApiMs':statistics.median(latencies[1:]),'detections':[{'label':d['label'],'confidence':round(d['confidence'],4),'decision':d['decision']} for d in result['detections']],'note':'Two source photos only; not accuracy or physical-camera FPS measurement'})
filename='active-model-api-benchmark-optimized.json' if '--optimized' in sys.argv else 'active-model-api-benchmark.json'
(root/'docs/evidence'/filename).write_text(json.dumps(records,indent=2),encoding='utf-8');print(json.dumps(records,indent=2))
