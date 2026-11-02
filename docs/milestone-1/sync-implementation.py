from pathlib import Path
root=Path(__file__).resolve().parents[2]
changes={
 'web/src/components/scanner.tsx': [('dimensions:{width:number;height:number}', 'imageWidth:number;imageHeight:number'),('result?.dimensions.width','result?.imageWidth'),('result?.dimensions.height','result?.imageHeight'),('body.message??','body.error?.message??body.message??')],
 'web/src/components/auth-form.tsx':[('setMessage(data.message)','setMessage(data.message??data.error?.message??"ดำเนินการไม่สำเร็จ")')],
 'web/src/components/member-panel.tsx':[('setMessage(body.message)','setMessage(body.message??body.error?.message??"ดำเนินการไม่สำเร็จ")'),('message?:string;rows?', 'message?:string;error?:{message:string};rows?'),('data.message??"กรุณาเข้าสู่ระบบ"','data.message??data.error?.message??"กรุณาเข้าสู่ระบบ"')],
 'ai-service/app/detector.py':[('"dimensions": {"width": width, "height": height}', '"imageWidth": width, "imageHeight": height'),('"modelArtifactSha256": self.model_hash','"artifactSha256": self.model_hash')],
 'ai-service/app/main.py':[('"service": "ai"','"component": "ai"'),('{"status": "ready" if available else "not_ready",','{"status": "ready" if available else "not_ready", "component": "ai", "milestone": "M1",')],
 'web/src/app/api/health/ready/route.ts':[('{status:database===','{component:"web",status:database===')],
 'web/src/app/api/auth/route.ts':[('{error,sameOrigin}', '{error,sameOrigin,localOrigin}'),('${req.nextUrl.origin}', '${localOrigin(req)}')],
 'web/src/app/auth/callback/route.ts':[('import {supabaseServer}', 'import {localOrigin} from "@/lib/http";\nimport {supabaseServer}'),('req.nextUrl.origin','localOrigin(req)')]
}
for relative,pairs in changes.items():
 p=root/relative;s=p.read_text(encoding='utf-8')
 for old,new in pairs:s=s.replace(old,new)
 p.write_text(s,encoding='utf-8')
print('Implementation aligned with versioned contracts and loopback origin checks')
