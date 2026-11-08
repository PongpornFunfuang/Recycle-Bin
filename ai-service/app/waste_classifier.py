import hashlib, os
from pathlib import Path
from typing import Any
import torch
from PIL import Image
from torchvision import models, transforms
import torch.nn as nn

ROOT=Path(__file__).resolve().parents[2]
_default_model = ROOT/'ml/models/resnet18-trashnet-retrained.pth'
if not _default_model.exists():
    _default_model = ROOT/'ml/models/best_resnet18_trashnet.pth'
MODEL_PATH=Path(os.environ.get('WASTE_CLASSIFIER_MODEL',str(_default_model)))
# Class order is part of the TrashNet checkpoint contract. The original
# checkpoint uses the repository's numeric order (not alphabetical order).
# Changing this silently relabels otherwise-correct logits.
CLASSES=('glass','paper','cardboard','plastic','metal','trash')

class JointWasteModel(nn.Module):
    def __init__(self,count):
        super().__init__()
        self.material=models.resnet18(weights=None)
        self.material.fc=nn.Sequential(nn.Linear(512,64),nn.ReLU(),nn.Dropout(.5),nn.Linear(64,9))
        self.item=nn.Linear(64,count)
    def extract_features(self,x):
        m=self.material
        x=m.maxpool(m.relu(m.bn1(m.conv1(x))))
        x=m.layer4(m.layer3(m.layer2(m.layer1(x))))
        return torch.flatten(m.avgpool(x),1)
    def forward(self,x):
        m=self.material;x=self.extract_features(x)
        x=m.fc[2](m.fc[1](m.fc[0](x)))
        return m.fc[3](x),self.item(x)

class WasteClassifier:
    version='trashnet-resnet18-6class-mit'
    def __init__(self):
        self.session=None;self.failure=None;self.model_hash=None
        self.name_head=None;self.name_classes=None;self.name_thresholds={};self.name_hash=None
        self.classes=CLASSES;self.item_classes=None
        self.device=os.environ.get('WASTE_CLASSIFIER_DEVICE','cpu')
        if self.device=='cuda' and not torch.cuda.is_available():self.device='cpu'
        self.transform=transforms.Compose([transforms.Resize((224,224)),transforms.ToTensor(),transforms.Normalize([.485,.456,.406],[.229,.224,.225])])
    def load(self):
        if not MODEL_PATH.is_file():self.failure='classifier_model_not_loaded';return
        try:
            self.model_hash=hashlib.sha256(MODEL_PATH.read_bytes()).hexdigest()
            checkpoint=torch.load(MODEL_PATH,map_location='cpu',weights_only=True)
            if isinstance(checkpoint,dict) and checkpoint.get('modelVersion')=='continual-waste-resnet18-joint-candidate':
                expected=('cardboard','food_organics','glass','metal','miscellaneous_trash','paper','plastic','textile','vegetation')
                if tuple(checkpoint.get('materialClasses',()))!=expected or checkpoint.get('preprocessing')!='resize224-imagenet-normalization':
                    raise ValueError('unsupported_joint_metadata')
                self.classes=expected;self.item_classes=tuple(checkpoint['itemClasses'])
                model=JointWasteModel(len(self.item_classes))
                model.load_state_dict(checkpoint['state_dict'])
                self.session=model.eval().to(self.device)
                self.version='garbage-v2-resnet18-joint-v2' if 'GarbageV2' in checkpoint.get('sources',[]) else 'continual-waste-resnet18-joint-v1'
                name_path=os.environ.get('WASTE_NAME_HEAD_MODEL','').strip()
                if name_path:
                    path=Path(name_path);self.name_hash=hashlib.sha256(path.read_bytes()).hexdigest()
                    if self.name_hash!=os.environ.get('WASTE_NAME_HEAD_SHA256',''):raise ValueError('name_head_integrity_mismatch')
                    named=torch.load(path,map_location='cpu',weights_only=True)
                    if named.get('initialSha256')!=self.model_hash or named.get('preprocessing')!='resize224-imagenet-normalization':raise ValueError('name_head_base_mismatch')
                    self.name_classes=named['classes'];self.name_thresholds=named['supportedThresholds']
                    self.name_head=nn.Sequential(nn.Linear(512,256),nn.ReLU(),nn.Dropout(.3),nn.Linear(256,len(self.name_classes)))
                    self.name_head.load_state_dict(named['head']);self.name_head.eval().to(self.device)
                return
            if isinstance(checkpoint,dict) and 'state_dict' in checkpoint:
                expected=('Cardboard','Food Organics','Glass','Metal','Miscellaneous Trash','Paper','Plastic','Textile Trash','Vegetation')
                if tuple(checkpoint.get('classes',()))!=expected or checkpoint.get('preprocessing')!='resize224-imagenet-normalization':
                    raise ValueError('unsupported_classifier_metadata')
                self.classes=('cardboard','food_organics','glass','metal','miscellaneous_trash','paper','plastic','textile','vegetation')
                self.version='realwaste-resnet18-9class-v1'
                checkpoint=checkpoint['state_dict']
            model=models.resnet18(weights=None)
            model.fc=nn.Sequential(nn.Linear(model.fc.in_features,64),nn.ReLU(),nn.Dropout(.5),nn.Linear(64,len(self.classes)))
            model.load_state_dict(checkpoint);self.session=model.eval().to(self.device)
        except Exception:self.session=None;self.failure='classifier_model_load_failed'
    def classify(self,image:Image.Image,box:dict[str,float])->dict[str,Any]|None:
        if self.session is None:return None
        w,h=image.size
        # Add a small, bounded context margin so thin objects (bottles/cans)
        # are not clipped by detector boxes, while keeping unrelated scene
        # background out of the classifier crop.
        left,top,right,bottom=(box['xMin']*w,box['yMin']*h,box['xMax']*w,box['yMax']*h)
        pad_x=max(2.0,(right-left)*0.08);pad_y=max(2.0,(bottom-top)*0.08)
        crop=image.crop((max(0,left-pad_x),max(0,top-pad_y),min(w,right+pad_x),min(h,bottom+pad_y))).convert('RGB')
        return self._predict(crop)
    def classify_image(self,image:Image.Image)->dict[str,Any]|None:
        if self.session is None:return None
        crop=image.convert('RGB')
        return self._predict(crop)
    def _predict(self,crop):
        with torch.inference_mode():
            x=self.transform(crop).unsqueeze(0).to(self.device)
            if self.name_head is not None:
                features=self.session.extract_features(x);m=self.session.material
                hidden=m.fc[2](m.fc[1](m.fc[0](features)))
                output=(m.fc[3](hidden),self.session.item(hidden))
            else:output=self.session(x)
            material=output[0] if self.item_classes else output
            confidence,index=torch.softmax(material[0],dim=0).max(0)
            result={'label':self.classes[int(index)],'confidence':float(confidence),'modelVersion':self.version}
            if self.item_classes:
                score,item=torch.softmax(output[1][0],dim=0).max(0)
                result['itemPrediction']={'label':self.item_classes[int(item)],'confidence':float(score),'modelVersion':self.version,'status':'experimental'}
            if self.name_head is not None:
                score,index=self.name_head(features).softmax(1)[0].max(0)
                label=self.name_classes[int(index)];threshold=self.name_thresholds.get(label)
                supported=threshold is not None and float(score)>=threshold
                result['itemPrediction']={'label':label,'confidence':float(score),'modelVersion':'resnet18-object-names-v1','status':'supported' if supported else 'uncertain',**({'threshold':threshold} if threshold is not None else {})}
            return result