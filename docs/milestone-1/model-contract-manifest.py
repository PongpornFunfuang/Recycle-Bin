import json
from pathlib import Path
from torchvision.models.detection import FasterRCNN_ResNet50_FPN_V2_Weights
root=Path(__file__).resolve().parents[2]
active=json.loads((root/'ml/manifests/active-model.json').read_text(encoding='utf-8'))
manifest={'schemaVersion':'1.0','modelVersion':active['modelVersion'],'artifactSha256':active['sha256'],'supportedClasses':[c for c in FasterRCNN_ResNet50_FPN_V2_Weights.COCO_V1.meta['categories'] if c not in {'__background__','N/A'}],'runtime':'pytorch','preprocessVersion':'exif-jpeg-draft-thumbnail1280-rgb-v2','postprocessVersion':'torchvision-fpnv2-nms-threshold025-xyxy-v1','licenseReference':active['licenseReference']}
(root/'ml/manifests/active-contract-manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
print(len(manifest['supportedClasses']),'COCO classes in artifact; only bottle has positive manual image evidence in this run')
