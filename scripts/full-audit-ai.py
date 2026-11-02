"""Functional inference/error cases, explicitly NOT an accuracy benchmark."""
import datetime,hashlib,io,json,time,urllib.request,urllib.error,uuid
from pathlib import Path
from PIL import Image,ImageEnhance,ImageFilter
import torch
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'docs/evidence/full-audit-2026-11-02'
def encoded(image,fmt='PNG'):
 buf=io.BytesIO();image.save(buf,format=fmt);return buf.getvalue()
source=Image.open(ROOT/'ml/test-images/empty-bottle.jpg').convert('RGB');source.thumbnail((960,960))
cases=[('blank',encoded(Image.new('RGB',(320,240),'white')),'image/png',200),('dark',encoded(ImageEnhance.Brightness(source).enhance(.04)),'image/png',200),('blurred',encoded(source.filter(ImageFilter.GaussianBlur(20))),'image/png',200),('corrupt',b'not-an-image','image/jpeg',422),('unsupported',b'not-an-image','text/plain',415),('tiny',encoded(Image.new('RGB',(1,1))),'image/png',422),('oversized-dimensions',encoded(Image.new('RGB',(4001,4001),'white')),'image/png',422)]
results=[]
for name,content,mime,expected in cases:
 boundary='audit'+uuid.uuid4().hex
 body=(f'--{boundary}\r\nContent-Disposition: form-data; name="mode"\r\n\r\nphoto\r\n--{boundary}\r\nContent-Disposition: form-data; name="image"; filename="audit"\r\nContent-Type: {mime}\r\n\r\n'.encode()+content+f'\r\n--{boundary}--\r\n'.encode())
 request=urllib.request.Request('http://127.0.0.1:3000/api/ai/detect',body,{'Origin':'http://127.0.0.1:3000','Content-Type':'multipart/form-data; boundary='+boundary})
 start=time.perf_counter()
 try:r=urllib.request.urlopen(request,timeout=40)
 except urllib.error.HTTPError as e:r=e
 data=json.loads(r.read());results.append({'case':name,'http':r.status,'expected':expected,'status':'PASS' if r.status==expected else 'FAIL','wallMs':round((time.perf_counter()-start)*1000,2),'result':data})
model=ROOT/'ml/models/fasterrcnn_resnet50_fpn_v2_coco-dd69338a.pth'
info={'capturedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'scope':'Functional/error/quality tests. Generated and transformed images, no ground-truth boxes. No history saved. NOT accuracy evaluation.','checkpointSha256':hashlib.sha256(model.read_bytes()).hexdigest(),'torch':torch.__version__,'cudaRuntime':torch.version.cuda,'cudaAvailable':torch.cuda.is_available(),'gpu':torch.cuda.get_device_name(0) if torch.cuda.is_available() else None,'accuracyMetrics':'NOT MEASURED','results':results}
(OUT/'ai-functional-cases.json').write_text(json.dumps(info,ensure_ascii=False,indent=2),encoding='utf8');print(json.dumps({'cases':[{k:v for k,v in r.items() if k!='result'} for r in results],'gpu':info['gpu'],'accuracy':'NOT MEASURED'}))
