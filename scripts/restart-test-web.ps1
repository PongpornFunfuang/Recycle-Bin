$ErrorActionPreference='Stop'
$root=Split-Path -Parent $PSScriptRoot
$manifest=Get-Content -LiteralPath (Join-Path $root '.local/test-web-process.json') -Raw | ConvertFrom-Json
if($manifest.projectRef -ne 'yyprbgvhmncddlyeduyr' -or $manifest.port -ne 3100){throw 'Unexpected test process manifest'}
$record=Get-CimInstance Win32_Process -Filter "ProcessId=$($manifest.pid)" -ErrorAction SilentlyContinue
if($record -and ($record.Name -ne 'node.exe' -or $record.CommandLine -notmatch 'next.+dev.+3100')){throw 'Unexpected test parent process; stop refused'}
$listeners=Get-NetTCPConnection -LocalPort 3100 -State Listen -ErrorAction SilentlyContinue | Sort-Object OwningProcess -Unique
foreach($listener in $listeners){
 $child=Get-CimInstance Win32_Process -Filter "ProcessId=$($listener.OwningProcess)"
 if(-not $child){continue}
 if($child.ProcessId -ne $manifest.pid -and $child.ParentProcessId -ne $manifest.pid){throw 'Listener is not this task test process; stop refused'}
 if($child.Name -ne 'node.exe'){throw 'Unexpected listener binary'}
 $ownedProcess=[System.Diagnostics.Process]::GetProcessById([int]$child.ProcessId)
 $ownedProcess.Kill()
 $null=$ownedProcess.WaitForExit(3000)
}
if($record -and (Get-Process -Id $manifest.pid -ErrorAction SilentlyContinue)){
 $ownedParent=[System.Diagnostics.Process]::GetProcessById([int]$manifest.pid)
 $ownedParent.Kill()
 $null=$ownedParent.WaitForExit(3000)
}
& (Join-Path $PSScriptRoot 'start-test-web.ps1')
