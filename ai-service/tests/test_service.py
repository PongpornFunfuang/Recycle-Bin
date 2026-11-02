import io
from pathlib import Path
from fastapi.testclient import TestClient
from PIL import Image
from app.main import app, detector

def png(color="white",size=(200,200)):
    output=io.BytesIO();Image.new("RGB",size,color).save(output,format="PNG");return output.getvalue()

def test_liveness_readiness_and_unknown_real_inference():
    with TestClient(app) as client:
        assert client.get("/health/live").status_code==200
        assert client.get("/health/ready").json()["aiScannerReady"] is True
        response=client.post("/ai/detect",files={"image":("blank.png",png(),"image/png")})
        assert response.status_code==200
        result=response.json()
        assert result["sceneDecision"]=="unknown" and result["detections"]==[]
        assert result["historySaved"] is False and result["quality"]=="possibly_blurry"

def test_invalid_file_type_magic_dimensions_and_mode():
    with TestClient(app) as client:
        assert client.post("/ai/detect",files={"image":("x.txt",b"hello","text/plain")}).status_code==415
        assert client.post("/ai/detect",files={"image":("x.jpg",b"not an image","image/jpeg")}).status_code==422
        assert client.post("/ai/detect",files={"image":("tiny.png",png(size=(1,1)),"image/png")}).status_code==422
        assert client.post("/ai/detect",data={"mode":"fake"},files={"image":("x.png",png(),"image/png")}).status_code==422

def test_cross_origin_and_model_missing(monkeypatch):
    with TestClient(app) as client:
        assert client.get("/health/live",headers={"origin":"https://evil.example"}).status_code==403
        monkeypatch.setattr(detector,"session",None)
        assert client.get("/health/ready").status_code==503
        assert client.post("/ai/detect",files={"image":("x.png",png(),"image/png")}).status_code==503

def test_internal_token(monkeypatch):
    with TestClient(app) as client:
        monkeypatch.setenv("AI_INTERNAL_TOKEN","test-secret")
        assert client.post("/ai/detect",files={"image":("x.png",png(),"image/png")}).status_code==403

def test_real_image_geometry_is_finite_and_ordered():
    with TestClient(app) as client:
        image=Path(__file__).resolve().parents[2]/"ml/test-images/bottles-for-recycling.jpg"
        response=client.post("/ai/detect",data={"mode":"live_snapshot"},files={"image":("renamed.jpg",image.read_bytes(),"image/jpeg")})
        assert response.status_code==200
        assert any(d['label']=='bottle' and d['confidence']>=.5 for d in response.json()['detections'])
        for detection in response.json()["detections"]:
            b=detection["box"]
            assert 0<=b["xMin"]<b["xMax"]<=1 and 0<=b["yMin"]<b["yMax"]<=1
            assert 0<=detection["confidence"]<=1

def test_actual_multi_object_low_confidence_and_unknown():
    with TestClient(app) as client:
        image=Path(__file__).resolve().parents[2]/'ml/test-images/bottles-for-recycling.jpg'
        response=client.post('/ai/detect',files={'image':('arbitrary-filename.jpg',image.read_bytes(),'image/jpeg')})
        assert response.status_code==200
        detections=response.json()['detections']
        assert sum(d['label']=='bottle' for d in detections)>=2
        assert any(d['decision']=='low_confidence' for d in detections)
        assert any(d['decision']=='unknown' for d in detections)

def test_exif_orientation_original_dimensions():
    output=io.BytesIO();im=Image.new('RGB',(60,120),'white');exif=Image.Exif();exif[274]=6;im.save(output,format='JPEG',exif=exif)
    with TestClient(app) as client:
        response=client.post('/ai/detect',files={'image':('orientation.jpg',output.getvalue(),'image/jpeg')})
        assert response.status_code==200
        assert response.json()['imageWidth']==120 and response.json()['imageHeight']==60
