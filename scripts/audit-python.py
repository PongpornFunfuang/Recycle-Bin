"""Read PyPI version advisories for this project's environment; no package install."""
import concurrent.futures,datetime,importlib.metadata,json,urllib.request,urllib.parse
from pathlib import Path
root=Path(__file__).resolve().parents[1]
def check(d):
 name=d.metadata['Name'];version=d.version.split('+')[0]
 try:
  url='https://pypi.org/pypi/'+urllib.parse.quote(name,safe='')+'/'+urllib.parse.quote(version,safe='')+'/json'
  with urllib.request.urlopen(url,timeout=25) as response:metadata=json.load(response)
  advisories=metadata.get('vulnerabilities',[])
  return {'name':name,'installedVersion':d.version,'queriedVersion':version,'status':'ADVISORIES_FOUND' if advisories else 'NO_KNOWN_ADVISORIES','advisories':advisories}
 except Exception as exc:return {'name':name,'installedVersion':d.version,'status':'PENDING','error':type(exc).__name__}
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:rows=list(pool.map(check,list(importlib.metadata.distributions())))
report={'capturedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source':'PyPI version JSON vulnerability metadata; not a complete security certification; CUDA binary libraries not separately audited','packages':sorted(rows,key=lambda r:r['name'].lower())}
(root/'docs/evidence/python-advisories.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps({'checked':len(rows),'advisoryPackages':[r['name'] for r in rows if r['status']=='ADVISORIES_FOUND'],'pending':[r['name'] for r in rows if r['status']=='PENDING']}))
