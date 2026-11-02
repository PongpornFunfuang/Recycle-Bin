# Installation and local run — Windows

Run in PowerShell at `C:\Users\P.12x_\Desktop\RECYCLE BIN`. Current Node 24.22.1 and Python 3.12.14 are already available with project dependencies. Do not reinstall them or change system PATH, NVIDIA driver, Windows services or firewall to start the existing project.

```powershell
& '.\scripts\Start-Local.ps1'
```

The script starts missing services in hidden windows and binds loopback only. When it starts new processes, logs go to `.local/logs`. Existing running processes may have tool-managed output instead. Open `http://127.0.0.1:3000` and `http://127.0.0.1:3000/scanner`. AI readiness is `http://127.0.0.1:8000/health/ready`. Database readiness is `/api/health/ready`; 503 Not Configured is expected until approved integration, not an AI failure.

For explicit foreground processes in separate terminals:

```powershell
$rbNode = 'C:\Users\P.12x_\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
Set-Location 'C:\Users\P.12x_\Desktop\RECYCLE BIN\web'
& $rbNode node_modules/next/dist/bin/next dev --hostname 127.0.0.1
```

```powershell
Set-Location 'C:\Users\P.12x_\Desktop\RECYCLE BIN\ai-service'
& '.\.venv\Scripts\python.exe' -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Stop foreground processes with Ctrl+C. For hidden processes, identify and verify their exact PID/command before stopping; do not kill unrelated Node/Python processes.

For a separate clean workstation, install supported project runtimes with approval first. Recreate a project Python venv, install the pinned `ai-service/requirements.txt` (CUDA PyTorch versions/index must match the compatibility guide), and run the pinned pnpm lockfile install inside `web`. Do not use global dependency installs. Existing model files have manifests and hashes; do not silently download replacements. A missing model must produce Not Ready.

Full local verification:

```powershell
Set-Location 'C:\Users\P.12x_\Desktop\RECYCLE BIN'
& 'C:\Users\P.12x_\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts/verify-product.mjs
```

This runs typecheck, every `*.test.ts`, Python tests, actual browser/photo smoke, synthetic camera and production build. Test evidence is in `docs/evidence/product`. On this managed Windows environment `tsx` may fail inside sandbox with `uv_os_get_passwd ENOMEM`; the approved outside-sandbox run succeeds. Do not count that environment failure as a pass. Browser scripts require Chrome at their documented absolute path and Playwright from the bundled runtime; adapt those paths on another workstation.
