import hashlib,json,urllib.request
from pathlib import Path
root=Path(__file__).resolve().parents[2]
name='fasterrcnn_resnet50_fpn_v2_coco-dd69338a.pth'
target=root/'ml/models'/name
expected='dd69338a24b8d7381807e247652bdc356325bcbaf1cd3e092e00e0a1a58706bf'
url='https://download.pytorch.org/models/'+name
if not target.exists():
    with urllib.request.urlopen(url,timeout=180) as response:data=response.read(200*1024*1024)
    if hashlib.sha256(data).hexdigest()!=expected:raise SystemExit('Checksum mismatch; no model written')
    target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(data)
if hashlib.sha256(target.read_bytes()).hexdigest()!=expected:raise SystemExit('Existing model checksum mismatch; preserving file')
manifest={'modelVersion':'fasterrcnn-resnet50-fpn-v2-coco-dd69338a','source':url,'sha256':expected,'bytes':target.stat().st_size,'architectureLicense':'BSD-3-Clause','licenseReference':'https://github.com/pytorch/vision/blob/main/LICENSE','weightsReference':'https://docs.pytorch.org/vision/stable/models/generated/torchvision.models.detection.fasterrcnn_resnet50_fpn_v2.html','dataset':'COCO pretrained; no dataset downloaded or fine-tuning performed','device':'CUDA when available, otherwise CPU','preprocessing':'EXIF transpose, RGB, thumbnail <=1280; tensor 0..1; model resize min640/max960','classMap':'Torchvision COCO category metadata (91 slots including background/N/A, 80 object classes)','wasteMappedClasses':['bottle','cup','bowl','banana','apple','sandwich','orange','broccoli','carrot','hot dog','pizza','donut','cake'],'limits':['General object detector, not waste classifier','No can/paper/battery classes','No material or bin-color certainty','False positives observed on crowded image','Confidence is not measured accuracy']}
(root/'ml/manifests').mkdir(exist_ok=True)
(root/'ml/manifests/active-model.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
print(json.dumps(manifest,indent=2))
