import json
import statistics
import sys
from pathlib import Path
root=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(root/'ai-service'))
import app.detector as module
image=(root/'ml/test-images/empty-bottle.jpg').read_bytes()
records=[]
for name in ['yolox_nano','yolox_tiny']:
    module.MODEL_PATH=root/f'ml/models/{name}.onnx'
    detector=module.Detector();detector.load()
    runs=[detector.detect(image,'photo') for _ in range(5)]
    records.append({'model':name,'modelSha256':detector.model_hash,'testImage':'empty-bottle.jpg (CC0, single photograph, not accuracy benchmark)','runsMs':[r['latencyMs'] for r in runs],'warmMedianMs':statistics.median(r['latencyMs'] for r in runs[1:]),'detections':[{'label':d['label'],'confidence':d['confidence'],'box':d['box']} for d in runs[-1]['detections']]})
(root/'docs/evidence').mkdir(exist_ok=True)
(root/'docs/evidence/model-comparison.json').write_text(json.dumps(records,indent=2),encoding='utf-8')
print(json.dumps(records,indent=2))
