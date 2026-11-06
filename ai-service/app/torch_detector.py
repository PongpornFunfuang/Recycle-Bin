"""Actual local COCO detector, selected from measured model comparisons.

Torchvision Faster R-CNN ResNet50 FPN v2 (BSD-3-Clause). No automatic
downloads. It identifies objects, never disposal, material resin or bin colors.
"""
import hashlib,io,os,time,uuid,warnings
from pathlib import Path
import numpy as np
import torch
from PIL import Image,ImageOps,UnidentifiedImageError
from torchvision.models.detection import fasterrcnn_resnet50_fpn_v2,FasterRCNN_ResNet50_FPN_V2_Weights
from torchvision.transforms.functional import pil_to_tensor
from .waste_classifier import WasteClassifier

ROOT=Path(__file__).resolve().parents[2]
MODEL_PATH=Path(os.environ.get('MODEL_PATH',str(ROOT/'ml/models/fasterrcnn_resnet50_fpn_v2_coco-dd69338a.pth')))
if not MODEL_PATH.is_absolute():MODEL_PATH=ROOT/'ai-service'/MODEL_PATH
EXPECTED_HASH='dd69338a24b8d7381807e247652bdc356325bcbaf1cd3e092e00e0a1a58706bf'
MAPPED={'bottle','cup','bowl','banana','apple','sandwich','orange','broccoli','carrot','hot dog','pizza','donut','cake'}
Image.MAX_IMAGE_PIXELS=16_000_000

class Detector:
    version='fasterrcnn-resnet50-fpn-v2-coco-dd69338a'
    def __init__(self):
        self.session=None;self.model_hash=None;self.failure=None;self.classifier=WasteClassifier()
        self.device='cuda' if torch.cuda.is_available() else 'cpu'
        self.provider='pytorch_cuda' if self.device=='cuda' else 'pytorch_cpu'
        self.classes=FasterRCNN_ResNet50_FPN_V2_Weights.COCO_V1.meta['categories']

    def load(self):
        if not MODEL_PATH.is_file():self.failure='model_not_loaded';return
        try:
            self.model_hash=hashlib.sha256(MODEL_PATH.read_bytes()).hexdigest()
            if self.model_hash!=EXPECTED_HASH:raise ValueError('model_integrity_mismatch')
            torch.set_num_threads(4)
            model=fasterrcnn_resnet50_fpn_v2(weights=None,weights_backbone=None,min_size=640,max_size=960)
            model.load_state_dict(torch.load(MODEL_PATH,map_location='cpu',weights_only=True))
            self.session=model.eval().to(self.device)
            self.classifier.load()
        except Exception:
            self.session=None;self.failure='model_load_failed'

    def detect(self,content:bytes,mode:str):
        if self.session is None:raise RuntimeError('model_not_loaded')
        started=time.perf_counter()
        try:
            with warnings.catch_warnings():
                warnings.simplefilter('error',Image.DecompressionBombWarning)
                image=Image.open(io.BytesIO(content))
                if image.format not in {'JPEG','PNG','WEBP'}:raise ValueError('unsupported_image')
                if image.width*image.height>Image.MAX_IMAGE_PIXELS or min(image.size)<32:raise ValueError('image_dimensions_invalid')
                original_width,original_height=image.size
                orientation=image.getexif().get(274,1)
                width,height=(original_height,original_width) if orientation in {5,6,7,8} else (original_width,original_height)
                # JPEG decoder downsampling avoids allocating full camera-resolution
                # RGB copies. Normalized coordinates still refer to original dimensions.
                image.draft('RGB',(1280,1280))
                image=ImageOps.exif_transpose(image)
                image.thumbnail((1280,1280))
                if image.mode in {'RGBA','LA'} or (image.mode=='P' and 'transparency' in image.info):
                    rgba=image.convert('RGBA');background=Image.new('RGBA',rgba.size,'white');image=Image.alpha_composite(background,rgba).convert('RGB')
                else:image=image.convert('RGB')
                image.load()
        except (UnidentifiedImageError,OSError,Image.DecompressionBombError,Image.DecompressionBombWarning) as exc:
            raise ValueError('invalid_image') from exc
        gray=np.asarray(image.resize((128,128)).convert('L'),dtype=np.float32)
        gradients=np.abs(np.diff(gray,axis=0)).mean()+np.abs(np.diff(gray,axis=1)).mean()
        quality='dark' if gray.mean()<25 else 'possibly_blurry' if gradients<5 else 'ok'
        if os.environ.get('DIRECT_CLASSIFICATION_ONLY','false').lower() in {'1','true','yes'}:
            classification=self.classifier.classify_image(image)
            return {'schemaVersion':'1.1','requestId':str(uuid.uuid4()),'predictionId':str(uuid.uuid4()),'mode':mode,'inferenceLocation':'local_server','frameId':None,'sceneDecision':'detected' if classification else 'unknown','imageWidth':width,'imageHeight':height,'detections':[],'classification':classification,'modelVersion':self.classifier.version if classification else self.version,'artifactSha256':self.classifier.model_hash or self.model_hash,'classMapVersion':'trashnet-6class-v1','policyVersion':'local-pending-rules-v1','historySaved':False,'latencyMs':round((time.perf_counter()-started)*1000,2),'quality':quality}
        image.thumbnail((1280,1280))
        tensor=pil_to_tensor(image).float().div(255).to(self.device)
        with torch.inference_mode():
            output=self.session([tensor])[0]
        if self.device=='cuda':torch.cuda.synchronize()
        detections=[]
        for label,score,box in zip(output['labels'].cpu(),output['scores'].cpu(),output['boxes'].cpu()):
            score=float(score)
            if score<.25:continue
            index=int(label);name=self.classes[index]
            b=np.clip(box.numpy()/np.array([image.width,image.height,image.width,image.height]),0,1)
            if not np.isfinite(b).all() or b[0]>=b[2] or b[1]>=b[3]:continue
            normalized_box=dict(zip(('xMin','yMin','xMax','yMax'),map(float,b)))
            detections.append({'detectionId':str(uuid.uuid4()),'box':normalized_box,'classId':str(index),'label':name,'confidence':score,'materialCategoryId':None,'decision':'unknown' if name not in MAPPED else 'accepted' if score>=.5 else 'low_confidence','recommendation':None,'classification':self.classifier.classify(image,normalized_box)})
            if len(detections)>=100:break
        scene='detected' if any(d['decision']=='accepted' for d in detections) else 'uncertain' if any(d['decision']=='low_confidence' for d in detections) else 'unknown'
        return {'schemaVersion':'1.1','requestId':str(uuid.uuid4()),'predictionId':str(uuid.uuid4()),'mode':mode,'inferenceLocation':'local_server','frameId':None,'sceneDecision':scene,'imageWidth':width,'imageHeight':height,'detections':detections,'modelVersion':self.version,'artifactSha256':self.model_hash,'classMapVersion':'torchvision-coco91-contextual-v1','policyVersion':'local-pending-rules-v1','historySaved':False,'latencyMs':round((time.perf_counter()-started)*1000,2),'quality':quality}

