"""Explicit contract revision following full local-development authorization."""
import json
from pathlib import Path
root=Path(__file__).resolve().parents[2]
paths=['contracts/schemas/foundation.schema.json','contracts/openapi/application.openapi.json','contracts/openapi/inference.openapi.json']
archive=root/'docs/evidence/contract-baseline'
archive.mkdir(parents=True,exist_ok=True)
for relative in paths:
    destination=archive/Path(relative).name
    if not destination.exists():
        destination.write_bytes((root/relative).read_bytes())
path=root/paths[0]
schema=json.loads(path.read_text(encoding='utf-8-sig'))
defs=schema['$defs']
defs['detectionResult']['properties'].update({'schemaVersion':{'const':'1.1'},'latencyMs':{'type':'number','minimum':0},'quality':{'enum':['ok','dark','possibly_blurry']}})
defs['detectionResult']['required']=list(dict.fromkeys(defs['detectionResult']['required']+['latencyMs','quality']))
defs['liveness']['properties']['aiScannerReady']={'type':'boolean'}
defs['webReadiness']['properties']['checks']['properties']['database']['enum']=['ready','unavailable','not_configured']
defs['aiReadiness']['properties'].update({'status':{'enum':['ready','not_ready']},'reason':{'type':['string','null']},'aiScannerReady':{'type':'boolean'},'modelVersion':{'type':['string','null']},'provider':{'type':['string','null']}})
for field in ['predictionId','detectionId','sessionId','assetId','clientEventId']:
    for definition in defs.values():
        prop=definition.get('properties',{}).get(field)
        if prop and prop.get('type')=='string':prop['format']='uuid'
path.write_text(json.dumps(schema,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
for relative in paths[1:]:
    p=root/relative;doc=json.loads(p.read_text(encoding='utf-8-sig'));doc['info']['version']='1.1.0'
    if 'application.' in relative:
        doc['info']['description']='Local Next.js application. Supabase PostgreSQL/Auth are not configured until explicitly supplied; no cloud migration has been executed. Photo/live snapshots use the local AI proxy. Business persistence operations remain pending integration.'
        route='/api/ai/detect'
    else:
        doc['info']['description']='Local real YOLOX inference. Readiness reflects actual model loading; absent or failed model is 503. Camera uses sequential HTTP frame inference, not a WebSocket endpoint.'
        route='/ai/detect'
        ready=doc['paths']['/health/ready']['get'];ready['summary']='Actual local model readiness';ready['responses']['200']={'description':'Model loaded','content':{'application/json':{'schema':{'$ref':'../schemas/foundation.schema.json#/$defs/aiReadiness'}}}}
        doc['x-future-endpoints']=['WebSocket /ai/stream (not implemented; current real-time mode uses sequential HTTP frames)']
    doc['paths'][route]={'post':{'summary':'Photo or live snapshot real multi-object detection','requestBody':{'required':True,'content':{'multipart/form-data':{'schema':{'type':'object','required':['image'],'properties':{'image':{'type':'string','format':'binary'},'mode':{'enum':['photo','live_snapshot']}}}}}},'responses':{'200':{'description':'Real inference; not proof of disposal','content':{'application/json':{'schema':{'$ref':'../schemas/detection-result.schema.json'}}}},'413':{'description':'Payload too large'},'415':{'description':'Unsupported image'},'422':{'description':'Invalid image'},'429':{'description':'Inference busy'},'503':{'description':'Model/service unavailable'}}}}
    p.write_text(json.dumps(doc,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Revised 3 active contracts; archived original bytes, retained all wrappers and Mongo legacy schemas.')
