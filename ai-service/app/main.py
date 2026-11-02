import asyncio
import hmac
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.responses import JSONResponse
from .torch_detector import Detector

detector = Detector()
gate = asyncio.Semaphore(1)

@asynccontextmanager
async def lifespan(app):
    await asyncio.to_thread(detector.load)
    yield

app = FastAPI(title="Recycle Bin Local AI", version="1.1.0", lifespan=lifespan, docs_url="/docs")

@app.middleware("http")
async def local_only(request: Request, call_next):
    # No CORS is enabled: browsers use the same-origin Next.js proxy.
    origin = request.headers.get("origin")
    if origin and origin not in {"http://127.0.0.1:3000", "http://localhost:3000", "http://127.0.0.1:8000"}:
        return JSONResponse({"detail": "origin_rejected"}, status_code=403)
    host = request.headers.get("host", "").split(":")[0]
    if host not in {"localhost", "127.0.0.1", "testserver"}:
        return JSONResponse({"detail": "host_rejected"}, status_code=403)
    length = request.headers.get("content-length")
    if request.method == "POST" and (not length or not length.isdigit() or int(length) > 9 * 1024 * 1024):
        return JSONResponse({"detail": "payload_too_large"}, status_code=413)
    return await call_next(request)

@app.get("/health/live")
def live():
    return {"status": "alive", "component": "ai", "milestone": "M1", "aiScannerReady": detector.session is not None}

@app.get("/health/ready")
def ready():
    available = detector.session is not None
    return JSONResponse({"status": "ready" if available else "not_ready", "component": "ai", "milestone": "M1", "reason": None if available else detector.failure or "model_not_loaded", "aiScannerReady": available, "modelVersion": detector.version if available else None, "provider": detector.provider if available else None}, status_code=200 if available else 503)

@app.post("/ai/detect")
async def detect(request: Request, image: UploadFile = File(...), mode: str = Form("photo")):
    secret = os.environ.get("AI_INTERNAL_TOKEN", "")
    if secret and not hmac.compare_digest(request.headers.get("x-ai-token", ""), secret):
        raise HTTPException(403, "invalid_internal_token")
    if mode not in {"photo", "live_snapshot"}:
        raise HTTPException(422, "invalid_mode")
    if image.content_type not in {"image/jpeg", "image/png", "image/webp"}:
        raise HTTPException(415, "unsupported_image")
    content = await image.read(8 * 1024 * 1024 + 1)
    await image.close()
    if len(content) > 8 * 1024 * 1024:
        raise HTTPException(413, "image_too_large")
    if not content:
        raise HTTPException(422, "empty_image")
    if detector.session is None:
        raise HTTPException(503, "model_not_loaded")
    if gate.locked():
        raise HTTPException(429, "inference_busy")
    try:
        async with gate:
            return await asyncio.to_thread(detector.detect, content, mode)
    except ValueError as exc:
        raise HTTPException(422, str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(503, "inference_unavailable") from exc
