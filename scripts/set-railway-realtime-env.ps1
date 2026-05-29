# Prints Railway variable checklist for the realtime + Symfony services.
# Usage: railway link  (select realtime service)  then  npm run railway:realtime-env

$ErrorActionPreference = 'Stop'

$configPath = Join-Path $PSScriptRoot '..\src\app\api\config.ts'
$config = Get-Content $configPath -Raw
$apiMatch = [regex]::Match($config, "PRODUCTION_API_ORIGIN\s*=\s*'([^']+)'")
$apiOrigin = if ($apiMatch.Success) { $apiMatch.Groups[1].Value } else { 'https://YOUR-SYMFONY.up.railway.app' }

Write-Host ''
Write-Host '=== Railway: realtime-notification service ===' -ForegroundColor Cyan
Write-Host 'Root Directory: services/realtime-notification'
Write-Host ''
Write-Host 'Variables:'
Write-Host "  SYMFONY_API_ORIGIN=$apiOrigin"
Write-Host '  WS_INTERNAL_SECRET=<generate-long-random-string>'
Write-Host '  FIREBASE_SERVICE_ACCOUNT_JSON=<optional-one-line-json>'
Write-Host ''
Write-Host 'After deploy, copy public HTTPS domain into config.ts:'
Write-Host "  PRODUCTION_REALTIME_ORIGIN='https://YOUR-REALTIME.up.railway.app'"
Write-Host ''
Write-Host '=== Railway: Symfony (casaclick) web service ===' -ForegroundColor Cyan
Write-Host "  WS_BROADCAST_URL=https://YOUR-REALTIME.up.railway.app"
Write-Host '  WS_INTERNAL_SECRET=<same-as-realtime>'
Write-Host ''
Write-Host 'Health: curl https://YOUR-REALTIME.up.railway.app/health'
Write-Host ''
