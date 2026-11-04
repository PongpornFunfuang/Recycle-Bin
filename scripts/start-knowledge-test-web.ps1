$ErrorActionPreference='Stop'
$root=Split-Path -Parent $PSScriptRoot
$testRef='yyprbgvhmncddlyeduyr'
$secretPath=Join-Path $root ".local/secrets/supabase-test-$testRef.json"
if(-not (Test-Path -LiteralPath $secretPath)){throw 'Test configuration missing'}
$test=Get-Content -LiteralPath $secretPath -Raw | ConvertFrom-Json
if($test.projectRef -ne $testRef -or $test.url -ne "https://$testRef.supabase.co"){throw 'Wrong Test project'}
if(-not $test.publishableKey.StartsWith('sb_publishable_') -or -not $test.secretKey.StartsWith('sb_secret_')){throw 'Invalid Test key format'}
$aiEnvPath=Join-Path $root '.local/ai-preview.env'
if(-not (Test-Path -LiteralPath $aiEnvPath)){throw 'Local AI token configuration missing'}
$aiLine=Get-Content -LiteralPath $aiEnvPath | Where-Object {$_ -match '^AI_INTERNAL_TOKEN='} | Select-Object -First 1
if(-not $aiLine){throw 'Local AI token missing'}
$aiToken=($aiLine -split '=',2)[1].Trim().Trim('"').Trim("'")
if($aiToken.Length -lt 32){throw 'Local AI token invalid'}
if(Get-NetTCPConnection -LocalPort 3100 -State Listen -ErrorAction SilentlyContinue){throw 'Port 3100 already in use'}
$log=Join-Path $root '.local/logs'
New-Item -ItemType Directory -Force $log | Out-Null
$envMap=@{
 RB_EXPECT_DATABASE='test'
 RB_TEST_PROJECT_REF=$testRef
 RB_WASTE_KNOWLEDGE_ENABLED='1'
 RB_NEXT_DIST_DIR='.next-knowledge-test'
 NEXT_PUBLIC_SUPABASE_URL=$test.url
 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$test.publishableKey
 SUPABASE_SECRET_KEY=$test.secretKey
 SCAN_RECEIPT_SECRET=$test.receiptSecret
 AI_INTERNAL_TOKEN=$aiToken
 AI_SERVICE_URL='http://127.0.0.1:8000'
 NEXT_TELEMETRY_DISABLED='1'
}
$node=(Get-Command node).Source
$process=Start-Process -FilePath $node -ArgumentList 'node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3100' -WorkingDirectory (Join-Path $root 'web') -Environment $envMap -WindowStyle Hidden -RedirectStandardOutput (Join-Path $log 'knowledge-test-web-out.log') -RedirectStandardError (Join-Path $log 'knowledge-test-web-error.log') -PassThru
@{pid=$process.Id;projectRef=$testRef;port=3100;mode='knowledge-test';startedAt=(Get-Date).ToUniversalTime().ToString('o')} | ConvertTo-Json | Set-Content (Join-Path $root '.local/knowledge-test-web-process.json')
'Knowledge Test web requested on http://127.0.0.1:3100. Production configuration unchanged.'
