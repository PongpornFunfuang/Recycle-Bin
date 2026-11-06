import hashlib, os
from pathlib import Path
from typing import Any
import torch
from PIL import Image
from torchvision import models, transforms
import torch.nn as nn

ROOT=Path(__file__).resolve().parents[2]
MODEL_PATH=Path(os.environ.get('WASTE_CLASSIFIER_MODEL',str(ROOT/'ml/models/best_resnet18_trashnet.pth')))
CLASSES=('cardboard','glass','metal','paper','plastic','trash')

class WasteClassifier:
    version='trashnet-resnet18-6class-mit'
    def __init__(self):
        self.session=None;self.failure=None;self.model_hash=None
        self.device=os.environ.get('WASTE_CLASSIFIER_DEVICE','cpu')
        if self.device=='cuda' and not torch.cuda.is_available():self.device='cpu'
        self.transform=transforms.Compose([transforms.Resize((224,224)),transforms.ToTensor(),transforms.Normalize([.485,.456,.406],[.229,.224,.225])])
    def load(self):
        if not MODEL_PATH.is_file():self.failure='classifier_model_not_loaded';return
        try:
            self.model_hash=hashlib.sha256(MODEL_PATH.read_bytes()).hexdigest()
            model=models.resnet18(weights=None)
            model.fc=nn.Sequential(nn.Linear(model.fc.in_features,64),nn.ReLU(),nn.Dropout(.5),nn.Linear(64,len(CLASSES)))
            model.load_state_dict(torch.load(MODEL_PATH,map_location='cpu',weights_only=True));self.session=model.eval().to(self.device)
        except Exception:self.session=None;self.failure='classifier_model_load_failed'
    def classify(self,image:Image.Image,box:dict[str,float])->dict[str,Any]|None:
        if self.session is None:return None
        w,h=image.size;crop=image.crop((box['xMin']*w,box['yMin']*h,box['xMax']*w,box['yMax']*h)).convert('RGB')
        with torch.inference_mode():
            p=torch.softmax(self.session(self.transform(crop).unsqueeze(0).to(self.device))[0],dim=0);confidence,index=p.max(0)
        return {'label':CLASSES[int(index)],'confidence':float(confidence),'modelVersion':self.version}

