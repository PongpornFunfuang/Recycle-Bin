import hashlib,json,statistics,sys,time
from pathlib import Path
import torch
from torchvision.models.detection import ssdlite320_mobilenet_v3_large,SSDLite320_MobileNet_V3_Large_Weights
from PIL import Image,ImageOps
root=Path(__file__).resolve().parents[2]
path=root/'ml/models/ssdlite320_mobilenet_v3_large_coco-a79551df.pth'
device='cuda' if torch.cuda.is_available() else 'cpu'
weights=SSDLite320_MobileNet_V3_Large_Weights.COCO_V1
model=ssdlite320_mobilenet_v3_large(weights=None,weights_backbone=None)
model.load_state_dict(torch.load(path,map_location='cpu',weights_only=True));model.eval().to(device)
image_file=sys.argv[1] if len(sys.argv)>1 else 'empty-bottle.jpg'
image=ImageOps.exif_transpose(Image.open(root/'ml/test-images'/image_file)).convert('RGB')
tensor=weights.transforms()(image).to(device)
runs=[]
with torch.inference_mode():
 for _ in range(5):
  if device=='cuda':torch.cuda.synchronize()
  t=time.perf_counter();prediction=model([tensor])[0]
  if device=='cuda':torch.cuda.synchronize()
  runs.append((time.perf_counter()-t)*1000)
result={'model':'ssdlite320-mobilenet-v3-large-coco','device':device,'modelSha256':hashlib.sha256(path.read_bytes()).hexdigest(),'runsMs':runs,'warmMedianMs':statistics.median(runs[1:]),'peakVramBytes':torch.cuda.max_memory_allocated() if device=='cuda' else None,'detections':[{'label':weights.meta['categories'][int(label)],'confidence':float(score),'box':box.tolist()} for label,score,box in zip(prediction['labels'].cpu(),prediction['scores'].cpu(),prediction['boxes'].cpu()) if float(score)>=.25]}
result['testImage']=image_file
(root/('docs/evidence/ssdlite-multiple-bottles.json' if len(sys.argv)>1 else 'docs/evidence/ssdlite-benchmark.json')).write_text(json.dumps(result,indent=2),encoding='utf-8');print(json.dumps(result,indent=2))
