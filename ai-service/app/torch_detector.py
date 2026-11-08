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
from torchvision.models.detection.faster_rcnn import FastRCNNPredictor
from torchvision.ops import box_iou
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
        self.expert=None;self.expert_classes=None;self.expert_hash=None
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
            expert_path=os.environ.get('WASTE_DETECTOR_MODEL','').strip()
            if expert_path:
                path=Path(expert_path)
                expected=os.environ.get('WASTE_DETECTOR_SHA256','').strip()
                self.expert_hash=hashlib.sha256(path.read_bytes()).hexdigest()
                if len(expected)!=64 or self.expert_hash!=expected:raise ValueError('expert_integrity_mismatch')
                checkpoint=torch.load(path,map_location='cpu',weights_only=True)
                if checkpoint.get('initialServingSha256')!=EXPECTED_HASH:raise ValueError('expert_base_mismatch')
                if checkpoint['classes'][:90]!=self.classes[1:]:raise ValueError('expert_class_mapping_mismatch')
                # Verify that the serving feature extractor and original class rows
                # were preserved; this adapter must not replace original scores.
                for key,value in model.state_dict().items():
                    trained=checkpoint['state_dict'][key]
                    if key.startswith('roi_heads.box_predictor.'):trained=trained[:value.shape[0]]
                    if not torch.equal(value.cpu(),trained.cpu()):raise ValueError('expert_changed_original_parameters')
                expert=fasterrcnn_resnet50_fpn_v2(weights=None,weights_backbone=None,min_size=640,max_size=960)
                self.expert_classes=['background']+checkpoint['classes']
                expert.roi_heads.box_predictor=FastRCNNPredictor(expert.roi_heads.box_predictor.cls_score.in_features,len(self.expert_classes))
                expert.load_state_dict(checkpoint['state_dict']);self.expert=expert.eval().to(self.device)
                self.version='fasterrcnn-coco-plus-real-waste-preserved-v1'
        except Exception as exc:
            self.session=None
            # Keep a concise diagnostic for hosted health checks; never include
            # credentials or request data in this message.
            self.failure=f'model_load_failed:{type(exc).__name__}:{exc}'[:240]

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
            if self.expert is not None:
                extra=self.expert([tensor])[0]
                # Material-only logits competed with bottle recognition during
                # evaluation. Use only explicit new object classes at this stage.
                accepted=torch.tensor([self.expert_classes[int(i)] in {'battery','light_bulb','pcb'} for i in extra['labels']],device=self.device,dtype=torch.bool)&(extra['scores']>=.8)
                boxes=extra['boxes'][accepted];scores=extra['scores'][accepted];labels=extra['labels'][accepted]
                if len(boxes):
                    keep=box_iou(output['boxes'],boxes).amax(1)<.5
                    output={key:value[keep] for key,value in output.items()}
                    output={key:torch.cat([output[key],value]) for key,value in [('boxes',boxes),('scores',scores),('labels',labels)]}
        if self.device=='cuda':torch.cuda.synchronize()
        detections=[]
        for label,score,box in zip(output['labels'].cpu(),output['scores'].cpu(),output['boxes'].cpu()):
            score=float(score)
            if score<.25:continue
            index=int(label);name=self.classes[index] if index<len(self.classes) else self.expert_classes[index]
            b=np.clip(box.numpy()/np.array([image.width,image.height,image.width,image.height]),0,1)
            if not np.isfinite(b).all() or b[0]>=b[2] or b[1]>=b[3]:continue
            normalized_box=dict(zip(('xMin','yMin','xMax','yMax'),map(float,b)))
            detections.append({'detectionId':str(uuid.uuid4()),'box':normalized_box,'classId':str(index),'label':name,'confidence':score,'materialCategoryId':None,'decision':'unknown' if name not in MAPPED|{'battery','light_bulb','pcb'} else 'accepted' if score>=.5 else 'low_confidence','recommendation':None,'classification':self.classifier.classify(image,normalized_box)})
            if len(detections)>=100:break
        scene='detected' if any(d['decision']=='accepted' for d in detections) else 'uncertain' if any(d['decision']=='low_confidence' for d in detections) else 'unknown'
        return {'schemaVersion':'1.1','requestId':str(uuid.uuid4()),'predictionId':str(uuid.uuid4()),'mode':mode,'inferenceLocation':'local_server','frameId':None,'sceneDecision':scene,'imageWidth':width,'imageHeight':height,'detections':detections,'modelVersion':self.version,'artifactSha256':self.model_hash,'classMapVersion':'torchvision-coco91-contextual-v1','policyVersion':'local-pending-rules-v1','historySaved':False,'latencyMs':round((time.perf_counter()-started)*1000,2),'quality':quality}

