$ErrorActionPreference = 'Stop'
$rbRoot = Split-Path -Parent $PSScriptRoot
$rbNode = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
$rbListener = @(Get-NetTCPConnection -LocalPort 3000 -State Listen)
if ($rbListener.Count -ne 1 -or $rbListener[0].LocalAddress -ne '127.0.0.1' -or $rbListener[0].OwningProcess -ne 10452) { throw 'Listener changed; inspect again before stopping anything.' }
$rbServer = Get-CimInstance Win32_Process -Filter 'ProcessId=10452'
if (-not $rbServer.CommandLine.Contains((Join-Path $rbRoot 'web\node_modules')) -or -not $rbServer.CommandLine.Contains('start-server.js')) { throw 'Process is not the verified project Next.js server.' }
$rbParent = Get-CimInstance Win32_Process -Filter "ProcessId=$($rbServer.ParentProcessId)"
if (-not $rbParent.CommandLine.Contains('next') -or -not $rbParent.CommandLine.Contains(' dev ') -or -not $rbParent.CommandLine.Contains('127.0.0.1')) { throw 'Parent command not verified; no processes stopped.' }
& (Join-Path $env:WINDIR 'System32\taskkill.exe') /PID $rbServer.ProcessId /F
if ($LASTEXITCODE -ne 0) { throw 'Verified server process did not stop; do not start a duplicate server.' }
if (Get-CimInstance Win32_Process -Filter "ProcessId=$($rbParent.ProcessId)") {
 & (Join-Path $env:WINDIR 'System32\taskkill.exe') /PID $rbParent.ProcessId /F
 if ($LASTEXITCODE -ne 0) { throw 'Verified parent process did not stop.' }
}
$rbLogs = Join-Path $rbRoot '.local\logs'
New-Item -ItemType Directory -Path $rbLogs -Force | Out-Null
$env:NEXT_TELEMETRY_DISABLED = '1'
$rbNewProcess = Start-Process -FilePath $rbNode -ArgumentList 'node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3000' -WorkingDirectory (Join-Path $rbRoot 'web') -WindowStyle Hidden -RedirectStandardOutput (Join-Path $rbLogs 'web-cloud-out.log') -RedirectStandardError (Join-Path $rbLogs 'web-cloud-error.log') -PassThru
Write-Output "Restarted only the verified local Next.js process. New launcher PID: $($rbNewProcess.Id). No Cloud restart or database change."
