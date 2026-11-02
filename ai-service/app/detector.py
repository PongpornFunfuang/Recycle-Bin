"""Local YOLOX-Nano ONNX inference. No filename lookup, fixtures or random predictions.

Pre/postprocessing follows the Apache-2.0 Megvii YOLOX ONNX example.
COCO identifies objects, not waste state, plastic resin, or local bin colors.
"""
import hashlib
import io
import os
import time
import uuid
import warnings
from pathlib import Path

import numpy as np
import onnxruntime as ort
from PIL import Image, ImageFilter, ImageOps, UnidentifiedImageError

ROOT = Path(__file__).resolve().parents[2]
MODEL_PATH = Path(os.environ.get("MODEL_PATH", str(ROOT / "ml/models/yolox_nano.onnx")))
if not MODEL_PATH.is_absolute():
    MODEL_PATH = ROOT / "ai-service" / MODEL_PATH
CLASSES = ("person,bicycle,car,motorcycle,airplane,bus,train,truck,boat,traffic light,fire hydrant,stop sign,parking meter,bench,bird,cat,dog,horse,sheep,cow,elephant,bear,zebra,giraffe,backpack,umbrella,handbag,tie,suitcase,frisbee,skis,snowboard,sports ball,kite,baseball bat,baseball glove,skateboard,surfboard,tennis racket,bottle,wine glass,cup,fork,knife,spoon,bowl,banana,apple,sandwich,orange,broccoli,carrot,hot dog,pizza,donut,cake,chair,couch,potted plant,bed,dining table,toilet,tv,laptop,mouse,remote,keyboard,cell phone,microwave,oven,toaster,sink,refrigerator,book,clock,vase,scissors,teddy bear,hair drier,toothbrush").split(",")
MAPPED = {"bottle", "cup", "bowl", "banana", "apple", "sandwich", "orange", "broccoli", "carrot", "hot dog", "pizza", "donut", "cake"}
Image.MAX_IMAGE_PIXELS = 16_000_000


class Detector:
    def __init__(self):
        self.session = None
        self.model_hash = None
        self.failure = None

    def load(self):
        if not MODEL_PATH.is_file():
            self.failure = "model_not_loaded"
            return
        try:
            options = ort.SessionOptions()
            options.intra_op_num_threads = 4
            options.inter_op_num_threads = 1
            self.session = ort.InferenceSession(str(MODEL_PATH), sess_options=options, providers=["CPUExecutionProvider"])
            self.model_hash = hashlib.sha256(MODEL_PATH.read_bytes()).hexdigest()
        except Exception:
            self.failure = "model_load_failed"

    def detect(self, content: bytes, mode: str):
        if self.session is None:
            raise RuntimeError("model_not_loaded")
        started = time.perf_counter()
        try:
            with warnings.catch_warnings():
                warnings.simplefilter("error", Image.DecompressionBombWarning)
                image = Image.open(io.BytesIO(content))
                if image.format not in {"JPEG", "PNG", "WEBP"}:
                    raise ValueError("unsupported_image")
                if image.width * image.height > Image.MAX_IMAGE_PIXELS or min(image.size) < 32:
                    raise ValueError("image_dimensions_invalid")
                image = ImageOps.exif_transpose(image).convert("RGB")
                image.load()
        except (UnidentifiedImageError, OSError, Image.DecompressionBombError, Image.DecompressionBombWarning) as exc:
            raise ValueError("invalid_image") from exc
        width, height = image.size
        gray = np.asarray(image.resize((128, 128)).convert("L"), dtype=np.float32)
        # A coarse image quality flag, not a guarantee of focus or object visibility.
        gradients = np.abs(np.diff(gray, axis=0)).mean() + np.abs(np.diff(gray, axis=1)).mean()
        quality = "dark" if gray.mean() < 25 else "possibly_blurry" if gradients < 5 else "ok"
        size = 416
        ratio = min(size / width, size / height)
        resized = image.resize((max(1, int(width * ratio)), max(1, int(height * ratio))), Image.Resampling.BILINEAR)
        padded = np.full((size, size, 3), 114, dtype=np.float32)
        # Upstream preprocessing uses BGR values in 0..255, with top-left letterboxing.
        padded[:resized.height, :resized.width] = np.asarray(resized)[:, :, ::-1]
        tensor = np.ascontiguousarray(padded.transpose(2, 0, 1)[None])
        output = self.session.run(None, {self.session.get_inputs()[0].name: tensor})[0][0].copy()
        grids, strides = [], []
        for stride in (8, 16, 32):
            y, x = np.meshgrid(np.arange(size // stride), np.arange(size // stride), indexing="ij")
            grid = np.stack((x, y), -1).reshape(-1, 2)
            grids.append(grid)
            strides.append(np.full((len(grid), 1), stride))
        grid, stride = np.concatenate(grids), np.concatenate(strides)
        if output.shape != (len(grid), 85):
            raise RuntimeError("unexpected_model_output")
        output[:, :2] = (output[:, :2] + grid) * stride
        output[:, 2:4] = np.exp(np.clip(output[:, 2:4], -20, 20)) * stride
        scores = output[:, 4:5] * output[:, 5:]
        labels, confidence = scores.argmax(1), scores.max(1)
        eligible = np.where(np.isfinite(confidence) & (confidence >= .25))[0]
        eligible = eligible[np.argsort(confidence[eligible])[::-1]][:1000]
        xy = output[:, :2]
        wh = output[:, 2:4]
        boxes = np.concatenate((xy - wh / 2, xy + wh / 2), 1) / ratio
        boxes[:, [0, 2]] = np.clip(boxes[:, [0, 2]], 0, width)
        boxes[:, [1, 3]] = np.clip(boxes[:, [1, 3]], 0, height)
        selected = []
        for index in eligible:
            box = boxes[index]
            if not np.isfinite(box).all() or box[2] <= box[0] or box[3] <= box[1]:
                continue
            duplicate = False
            for old in selected:
                if labels[old] != labels[index]:
                    continue
                other = boxes[old]
                inter = np.prod(np.maximum(0, np.minimum(box[2:], other[2:]) - np.maximum(box[:2], other[:2])))
                union = np.prod(box[2:] - box[:2]) + np.prod(other[2:] - other[:2]) - inter
                if inter / max(union, 1e-6) > .45:
                    duplicate = True
                    break
            if not duplicate:
                selected.append(index)
            if len(selected) >= 100:
                break
        detections = []
        for index in selected:
            label = CLASSES[int(labels[index])]
            score = float(confidence[index])
            decision = "unknown" if label not in MAPPED else "accepted" if score >= .5 else "low_confidence"
            b = boxes[index] / np.array([width, height, width, height])
            detections.append({"detectionId": str(uuid.uuid4()), "box": dict(zip(("xMin", "yMin", "xMax", "yMax"), map(float, b))), "classId": str(int(labels[index])), "label": label, "confidence": score, "materialCategoryId": None, "decision": decision, "recommendation": None})
        return {"schemaVersion": "1.1", "requestId": str(uuid.uuid4()), "predictionId": str(uuid.uuid4()), "mode": mode, "inferenceLocation": "local_server", "frameId": None, "sceneDecision": "detected" if any(d["decision"] == "accepted" for d in detections) else "uncertain" if any(d["decision"] == "low_confidence" for d in detections) else "unknown", "imageWidth": width, "imageHeight": height, "detections": detections, "modelVersion": "yolox-nano-coco-0.1.1rc0", "artifactSha256": self.model_hash, "classMapVersion": "coco80-contextual-v1", "policyVersion": "local-pending-rules-v1", "historySaved": False, "latencyMs": round((time.perf_counter() - started) * 1000, 2), "quality": quality}
