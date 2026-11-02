$ErrorActionPreference='Stop'
$root=Split-Path -Parent $PSScriptRoot
$testRef='yyprbgvhmncddlyeduyr'
$secretPath=Join-Path $root ".local/secrets/supabase-test-$testRef.json"
if(-not (Test-Path -LiteralPath $secretPath)){throw 'Test-only configuration is missing'}
$test=Get-Content -LiteralPath $secretPath -Raw | ConvertFrom-Json
if($test.projectRef -ne $testRef -or $test.url -ne "https://$testRef.supabase.co"){throw 'Wrong project; no process started'}
if(-not $test.publishableKey.StartsWith('sb_publishable_') -or -not $test.secretKey.StartsWith('sb_secret_')){throw 'Expected test-only publishable and secret keys'}
$node=(Get-Command node).Source
$log=Join-Path $root '.local/logs'
New-Item -ItemType Directory -Force $log | Out-Null
$port=Get-NetTCPConnection -LocalPort 3100 -State Listen -ErrorAction SilentlyContinue
if($port){throw 'Port3100 is in use; inspect the existing process before starting another'}
$envMap=@{
 RB_EXPECT_DATABASE='test'
 RB_TEST_PROJECT_REF=$testRef
 NEXT_PUBLIC_SUPABASE_URL=$test.url
 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$test.publishableKey
 SUPABASE_SECRET_KEY=$test.secretKey
 SCAN_RECEIPT_SECRET=$test.receiptSecret
 NEXT_TELEMETRY_DISABLED='1'
}
$process=Start-Process -FilePath $node -ArgumentList 'node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3100' -WorkingDirectory (Join-Path $root 'web') -Environment $envMap -WindowStyle Hidden -RedirectStandardOutput (Join-Path $log 'test-web-out.log') -RedirectStandardError (Join-Path $log 'test-web-error.log') -PassThru
@{pid=$process.Id;projectRef=$testRef;expectedDatabase='test';port=3100;startedAt=(Get-Date).ToUniversalTime().ToString('o')} | ConvertTo-Json | Set-Content (Join-Path $root '.local/test-web-process.json')
'Test-only web requested on http://127.0.0.1:3100. Production configuration file unchanged.'
