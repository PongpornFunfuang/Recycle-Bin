$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$python = Join-Path $projectRoot 'ai-service/.venv/Scripts/python.exe'
& $python -c "import socket; s=socket.socket(); s.bind(('127.0.0.1',18010)); s.close()"
if ($LASTEXITCODE -ne 0) { throw 'Port 18010 is occupied; preserving the existing process instead of starting a duplicate.' }
$environmentFile = Join-Path $projectRoot '.local/ai-preview.env'
if (!(Test-Path -LiteralPath $environmentFile)) { throw 'Preview environment file missing' }
foreach ($line in Get-Content -LiteralPath $environmentFile) {
    if ($line -match '^([A-Z][A-Z0-9_]*)=(.*)$') {
        [Environment]::SetEnvironmentVariable($Matches[1], $Matches[2].Trim().Trim('"').Trim("'"), 'Process')
    }
}
if (!$env:AI_INTERNAL_TOKEN) { throw 'Preview token not configured' }
$state = Get-Content -LiteralPath (Join-Path $projectRoot '.local/logs/reconnect-20261107/state.json') -Raw | ConvertFrom-Json
$env:AI_TUNNEL_HOST = ([uri]$state.url).Host
$env:DIRECT_CLASSIFICATION_ONLY = 'false'
$env:WASTE_CLASSIFIER_MODEL = Join-Path $projectRoot 'runs/continual-waste-resnet18/candidate.pth'
$env:WASTE_DETECTOR_MODEL = Join-Path $projectRoot 'runs/serving-fasterrcnn-real-preserved/candidate.pth'
$hasher = [System.Security.Cryptography.SHA256]::Create()
$weightsStream = [System.IO.File]::OpenRead($env:WASTE_DETECTOR_MODEL)
try { $env:WASTE_DETECTOR_SHA256 = [BitConverter]::ToString($hasher.ComputeHash($weightsStream)).Replace('-','').ToLowerInvariant() }
finally { $weightsStream.Dispose(); $hasher.Dispose() }
$env:WASTE_NAME_HEAD_MODEL = Join-Path $projectRoot 'runs/object-name-resnet18-refined/approved-head.pth'
$hasher = [System.Security.Cryptography.SHA256]::Create()
$weightsStream = [System.IO.File]::OpenRead($env:WASTE_NAME_HEAD_MODEL)
try { $env:WASTE_NAME_HEAD_SHA256 = [BitConverter]::ToString($hasher.ComputeHash($weightsStream)).Replace('-','').ToLowerInvariant() }
finally { $weightsStream.Dispose(); $hasher.Dispose() }
Set-Location -LiteralPath (Join-Path $projectRoot 'ai-service')
# Single foreground instance; no service, permanent auto-start, or tunnel restart.
& $python -m uvicorn app.main:app --host 127.0.0.1 --port 18010
exit $LASTEXITCODE