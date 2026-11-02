import importlib.metadata
import json
from pathlib import Path
import torch

report = {"torch": torch.__version__, "cudaRuntime": torch.version.cuda, "cudaAvailable": torch.cuda.is_available(), "note": "Tensor diagnostic only; real AI inference is validated separately"}
if report["cudaAvailable"]:
    x = torch.arange(1024, dtype=torch.float64, device="cuda")
    total = (x*x).sum()
    torch.cuda.synchronize()
    report.update({"device":torch.cuda.get_device_name(0), "sumSquares":total.item(), "expected":sum(i*i for i in range(1024)), "tensorPass":total.item()==sum(i*i for i in range(1024)), "memoryAllocated":torch.cuda.memory_allocated()})
else:
    report["tensorPass"] = False
root = Path(__file__).resolve().parents[1]
(root / "docs/evidence").mkdir(exist_ok=True)
(root / "docs/evidence/gpu-diagnostic.json").write_text(json.dumps(report,indent=2),encoding="utf-8")
print(json.dumps(report,indent=2))
