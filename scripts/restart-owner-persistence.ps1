$ErrorActionPreference = 'Stop'
$rbRoot = Split-Path -Parent $PSScriptRoot
$rbNode = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
$rbPython = Join-Path $rbRoot 'ai-service\.venv\Scripts\python.exe'
$rbWeb = Get-CimInstance Win32_Process -Filter 'ProcessId=4788'
$rbAI = Get-CimInstance Win32_Process -Filter 'ProcessId=15044'
$rbWebParent = Get-CimInstance Win32_Process -Filter 'ProcessId=5604'
$rbAIParent = Get-CimInstance Win32_Process -Filter 'ProcessId=19576'
$rbListeners = @(Get-NetTCPConnection -State Listen | Where-Object { $_.LocalPort -in 3000,8000 })
if ($rbListeners.Count -ne 2 -or @($rbListeners | Where-Object { $_.LocalAddress -ne '127.0.0.1' }).Count -ne 0) { throw 'Unexpected listener state. No processes stopped.' }
if ((@($rbListeners | Where-Object { $_.LocalPort -eq 3000 -and $_.OwningProcess -eq 4788 })).Count -ne 1 -or (@($rbListeners | Where-Object { $_.LocalPort -eq 8000 -and $_.OwningProcess -eq 15044 })).Count -ne 1) { throw 'Process IDs changed. No processes stopped.' }
if (-not $rbWeb.CommandLine.Contains((Join-Path $rbRoot 'web\node_modules')) -or -not $rbWeb.CommandLine.Contains('start-server.js') -or $rbWeb.ParentProcessId -ne 5604) { throw 'Next child mismatch.' }
if (-not $rbWebParent.CommandLine.Contains('next dev --hostname 127.0.0.1 --port 3000')) { throw 'Next launcher mismatch.' }
if (-not $rbAI.CommandLine.Contains('-m uvicorn app.main:app --host 127.0.0.1 --port 8000') -or $rbAI.ParentProcessId -ne 19576) { throw 'AI child mismatch.' }
if (-not $rbAIParent.CommandLine.Contains($rbPython)) { throw 'AI launcher mismatch.' }
$rbEvidence = Join-Path $rbRoot 'docs\evidence\cloud-migration-fdmohzvuxvsrcaddbjvl'
@{capturedAt=[DateTime]::UtcNow.ToString('o');webPID=4788;webParentPID=5604;aiPID=15044;aiParentPID=19576;loopbackOnly=$true;cloudRestart=$false} | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $rbEvidence 'restart-before.json') -Encoding utf8
foreach ($rbParentPID in @(5604,19576)) {
 & (Join-Path $env:WINDIR 'System32\taskkill.exe') /PID $rbParentPID /T /F
 if ($LASTEXITCODE -ne 0) { throw 'Verified local process did not stop. No duplicate will be started.' }
}
$env:NEXT_TELEMETRY_DISABLED = '1'
$rbLogs = Join-Path $rbRoot '.local\logs'
$rbNewWeb = Start-Process -FilePath $rbNode -ArgumentList 'node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3000' -WorkingDirectory (Join-Path $rbRoot 'web') -WindowStyle Hidden -RedirectStandardOutput (Join-Path $rbLogs 'owner-web-out.log') -RedirectStandardError (Join-Path $rbLogs 'owner-web-error.log') -PassThru
$rbNewAI = Start-Process -FilePath $rbPython -ArgumentList '-m uvicorn app.main:app --host 127.0.0.1 --port 8000' -WorkingDirectory (Join-Path $rbRoot 'ai-service') -WindowStyle Hidden -RedirectStandardOutput (Join-Path $rbLogs 'owner-ai-out.log') -RedirectStandardError (Join-Path $rbLogs 'owner-ai-error.log') -PassThru
@{capturedAt=[DateTime]::UtcNow.ToString('o');webLauncherPID=$rbNewWeb.Id;aiLauncherPID=$rbNewAI.Id;cloudRestart=$false;databaseMutation=$false;readiness='NOT YET TESTED'} | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $rbEvidence 'restart-launchers.json') -Encoding utf8
Write-Output 'Verified project Local processes restarted. Cloud unchanged. Readiness and persistence still require verification.'

