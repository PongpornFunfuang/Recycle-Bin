import json,sys
from pathlib import Path
root=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(root/'ai-service'))
import app.detector as module
image=(root/'ml/test-images/bottles-for-recycling.jpg').read_bytes()
records=[]
for name in ['yolox_nano','yolox_tiny']:
 module.MODEL_PATH=root/f'ml/models/{name}.onnx'
 detector=module.Detector();detector.load();result=detector.detect(image,'photo')
 records.append({'model':name,'latencyMs':result['latencyMs'],'detections':[{'label':d['label'],'confidence':d['confidence'],'box':d['box']} for d in result['detections']]})
(root/'docs/evidence/multiple-bottles-yolox.json').write_text(json.dumps(records,indent=2),encoding='utf-8')
print(json.dumps(records,indent=2))
