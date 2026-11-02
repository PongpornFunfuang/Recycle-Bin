import hashlib,json,urllib.request
from pathlib import Path
root=Path(__file__).resolve().parents[1];folder=root/'web/public/fonts';folder.mkdir(parents=True,exist_ok=True)
base='https://raw.githubusercontent.com/google/fonts/main/ofl/notosansthai/'
sources={'NotoSansThai.ttf':'NotoSansThai%5Bwdth,wght%5D.ttf','OFL.txt':'OFL.txt'}
manifest=[]
for filename,remote in sources.items():
 p=folder/filename
 if p.exists():raise SystemExit('Preserve existing font file: '+filename)
 data=urllib.request.urlopen(base+remote,timeout=60).read()
 if filename.endswith('.ttf') and data[:4] not in {b'\x00\x01\x00\x00',b'OTTO'}:raise SystemExit('Unexpected font format')
 if filename=='OFL.txt' and b'SIL OPEN FONT LICENSE' not in data:raise SystemExit('Unexpected license')
 p.write_bytes(data);manifest.append({'file':filename,'source':base+remote,'sha256':hashlib.sha256(data).hexdigest(),'license':'SIL OFL 1.1'})
(folder/'provenance.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8');print(json.dumps(manifest,indent=2))
