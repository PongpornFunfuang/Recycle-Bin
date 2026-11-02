"""Explicitly invoked download from upstream; never executed on application startup."""
import hashlib
import json
import urllib.request
from pathlib import Path

root = Path(__file__).resolve().parents[2]
target = root / "ml/models/yolox_nano.onnx"
url = "https://github.com/Megvii-BaseDetection/YOLOX/releases/download/0.1.1rc0/yolox_nano.onnx"
if target.exists():
    raise SystemExit("Model exists; preserving existing file")
target.parent.mkdir(parents=True, exist_ok=True)
with urllib.request.urlopen(url, timeout=120) as response:
    content = response.read(50 * 1024 * 1024)
if len(content) < 100_000 or content.lstrip().startswith(b"<"):
    raise SystemExit("Unexpected download; no model written")
target.write_bytes(content)
manifest = {"name":"YOLOX-Nano", "version":"0.1.1rc0", "source":url, "license":"Apache-2.0 (upstream YOLOX)", "licenseReference":"https://github.com/Megvii-BaseDetection/YOLOX/blob/main/LICENSE", "sha256":hashlib.sha256(content).hexdigest(), "bytes":len(content), "dataset":"COCO pretrained; no dataset downloaded; general object detection, not waste-specific training", "runtime":"ONNX Runtime CPU", "input":"1x3x416x416 BGR float32 0..255; top-left letterbox 114", "output":"raw YOLOX grid decoded + per-class NMS", "wasteMappedClasses":["bottle","cup","bowl","banana","apple","sandwich","orange","broccoli","carrot","hot dog","pizza","donut","cake"], "limitations":["No plastic/glass/material certainty","No paper, can or battery classes","No local bin color inference","Confidence is not calibrated accuracy"]}
(root / "ml/manifests").mkdir(exist_ok=True)
(root / "ml/manifests/yolox-nano.json").write_text(json.dumps(manifest,indent=2),encoding="utf-8")
print(json.dumps(manifest,indent=2))
