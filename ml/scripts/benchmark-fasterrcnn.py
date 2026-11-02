import hashlib,json,statistics,time
from pathlib import Path
import torch
from torchvision.models.detection import fasterrcnn_resnet50_fpn_v2,FasterRCNN_ResNet50_FPN_V2_Weights
from torchvision.transforms.functional import pil_to_tensor
from PIL import Image,ImageOps
root=Path(__file__).resolve().parents[2]
path=root/'ml/models/fasterrcnn_resnet50_fpn_v2_coco-dd69338a.pth'
device='cuda' if torch.cuda.is_available() else 'cpu'
torch.set_num_threads(4)
weights=FasterRCNN_ResNet50_FPN_V2_Weights.COCO_V1
model=fasterrcnn_resnet50_fpn_v2(weights=None,weights_backbone=None,min_size=640,max_size=960)
model.load_state_dict(torch.load(path,map_location='cpu',weights_only=True));model.eval().to(device)
results=[]
for filename in ['empty-bottle.jpg','bottles-for-recycling.jpg']:
 image=ImageOps.exif_transpose(Image.open(root/'ml/test-images'/filename)).convert('RGB');image.thumbnail((1280,1280))
 tensor=pil_to_tensor(image).float().div(255).to(device);runs=[]
 with torch.inference_mode():
  for _ in range(3):
   if device=='cuda':torch.cuda.synchronize()
   started=time.perf_counter();p=model([tensor])[0]
   if device=='cuda':torch.cuda.synchronize()
   runs.append((time.perf_counter()-started)*1000)
 results.append({'image':filename,'runsMs':runs,'warmMedianMs':statistics.median(runs[1:]),'detections':[{'label':weights.meta['categories'][int(label)],'confidence':float(score)} for label,score in zip(p['labels'].cpu(),p['scores'].cpu()) if float(score)>=.25]})
report={'model':'fasterrcnn-resnet50-fpn-v2-coco','device':device,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'peakVramBytes':torch.cuda.max_memory_allocated() if device=='cuda' else None,'results':results}
(root/'docs/evidence/fasterrcnn-benchmark.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps(report,indent=2))
