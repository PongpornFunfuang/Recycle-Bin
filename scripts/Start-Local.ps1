$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$nodePath = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $nodePath) { $nodePath = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' }
$pythonPath = Join-Path $projectRoot 'ai-service\.venv\Scripts\python.exe'
if (-not (Test-Path -LiteralPath $nodePath)) { throw 'Node.js not found. Install/authorize a project runtime first.' }
if (-not (Test-Path -LiteralPath $pythonPath)) { throw 'Project Python venv not found.' }
$logDirectory = Join-Path $projectRoot '.local\logs'
New-Item -ItemType Directory -Path $logDirectory -Force | Out-Null
function Test-LocalHealth([string]$url) {
  try { $response = Invoke-RestMethod -Uri $url -TimeoutSec 3; return $response.status -eq 'alive' } catch { return $false }
}
if (-not (Test-LocalHealth 'http://127.0.0.1:8000/health/live')) {
  Start-Process -FilePath $pythonPath -ArgumentList '-m uvicorn app.main:app --host 127.0.0.1 --port 8000' -WorkingDirectory (Join-Path $projectRoot 'ai-service') -WindowStyle Hidden -RedirectStandardOutput (Join-Path $logDirectory 'ai-out.log') -RedirectStandardError (Join-Path $logDirectory 'ai-error.log') | Out-Null
}
if (-not (Test-LocalHealth 'http://127.0.0.1:3000/api/health/live')) {
  $env:NEXT_TELEMETRY_DISABLED = '1'
  Start-Process -FilePath $nodePath -ArgumentList 'node_modules/next/dist/bin/next dev --hostname 127.0.0.1' -WorkingDirectory (Join-Path $projectRoot 'web') -WindowStyle Hidden -RedirectStandardOutput (Join-Path $logDirectory 'web-out.log') -RedirectStandardError (Join-Path $logDirectory 'web-error.log') | Out-Null
}
Write-Output 'Local processes requested. Website: http://127.0.0.1:3000 ; AI health: http://127.0.0.1:8000/health/ready'
Write-Output 'Startup may take a few seconds. Logs: .local/logs. No cloud SQL/project/deploy action is performed.'
