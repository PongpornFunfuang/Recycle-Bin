from pathlib import Path
import json
r=Path(__file__).resolve().parents[1]
assert json.loads((r/'backups/pre-blue-white-redesign/verification.json').read_text(encoding='utf-8'))['status']=='PASS'
(r/'README.md').write_text('''# Recycle Bin

ผู้ช่วยคัดแยกขยะด้วย AI: Next.js/React/TypeScript/Tailwind + FastAPI/PyTorch/CUDA + Supabase PostgreSQL/Auth integration source.

**LOCAL PRODUCT IMPLEMENTATION / HOSTED INTEGRATION PENDING / NOT RELEASE READY / NO DEPLOY**

UIฟ้า–ขาวตามโปสเตอร์ พร้อม Photo AI และกล้องจริง ผลทำนายแยกจากการยืนยันทิ้งขยะ ไม่มีการเดาสีถังหรือตำแหน่งมหาวิทยาลัย ระบบบัญชีและPersistenceต้องตั้งค่าSupabaseที่อนุมัติก่อน ไม่มีFakeLoginหรือFakeDatabaseSuccess

เปิดใน PowerShell จากโฟลเดอร์นี้:

```powershell
& '.\\scripts\\Start-Local.ps1'
```

เว็บ http://127.0.0.1:3000 · Scanner http://127.0.0.1:3000/scanner · AI http://127.0.0.1:8000/health/ready

- [รายงานปัจจุบันครบ26ข้อ](docs/product/PRODUCT_REPORT.md)
- [สารบัญเอกสารProduct](docs/product/README.md)
- [ติดตั้ง/เปิด/ทดสอบในเครื่อง](docs/product/INSTALLATION_AND_LOCAL_RUN.md)
- [EnvironmentและSecrets](docs/product/ENVIRONMENT.md)
- [ผลทดสอบจริง](docs/product/AUTOMATED_TEST_REPORT.md)
- [SQLReview](docs/product/MIGRATION_REVIEW.md)
- [SupabaseRunbook](docs/product/SUPABASE_SETUP_RUNBOOK.md)
- [CloudApprovalGate](docs/product/CLOUD_APPROVAL_GATE.md)
- [ข้อจำกัดและReleaseGate](docs/product/RELEASE_READINESS.md)
- [กู้คืนดีไซน์เดิม](backups/pre-blue-white-redesign/RESTORE.md)

Backupดีไซน์เดิมตรวจHashก่อนRedesignแล้ว ไม่Restoreอัตโนมัติ ไม่ลบไฟล์เดิม ไม่เปลี่ยนGit ไม่มีCloudSQL/Project/AuthSettings/บริการเสียเงิน/Deploymentในรอบนี้ เอกสารรายงานเดิมเก็บเป็นประวัติเท่านั้น ไม่ใช่สถานะProductปัจจุบัน
''',encoding='utf-8')
print('Root README now points to product evidence and pending approval gate')
