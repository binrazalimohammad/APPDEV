$root = Split-Path $PSScriptRoot -Parent
$secrets = Join-Path $root '.local-secrets'
if (-not (Test-Path $secrets)) {
    New-Item -ItemType Directory -Path $secrets -Force | Out-Null
}

$fb = Join-Path $secrets 'firebase-railway-oneline.txt'
if (-not (Test-Path $fb)) {
    & (Join-Path $PSScriptRoot 'prepare-firebase-railway-env.ps1')
}
$firebase = (Get-Content $fb -Raw -Encoding UTF8).Trim()
$ws = [Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))

$realtimePath = Join-Path $secrets 'railway-realtime-COMPLETE.env'
@(
    'SYMFONY_API_ORIGIN=https://web-production-6bdab.up.railway.app'
    "WS_INTERNAL_SECRET=$ws"
    "FIREBASE_SERVICE_ACCOUNT_JSON=$firebase"
) | Set-Content -Path $realtimePath -Encoding UTF8

$webPath = Join-Path $secrets 'railway-web-WS-vars.env'
@(
    'WS_BROADCAST_URL=https://REPLACE-WITH-YOUR-REALTIME-DOMAIN.up.railway.app'
    "WS_INTERNAL_SECRET=$ws"
) | Set-Content -Path $webPath -Encoding UTF8

Write-Host "Realtime vars: $realtimePath"
Write-Host "Web vars:      $webPath"
Write-Host "Secret (both): $ws"
