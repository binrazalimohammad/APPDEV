# One-shot: set realtime domain in mobile config + casaclick Railway env template.
# Usage:
#   powershell -ExecutionPolicy Bypass -File scripts\finish-realtime-setup.ps1 -RealtimeUrl "https://realtime-xxxx.up.railway.app"

param(
    [Parameter(Mandatory = $true)]
    [string]$RealtimeUrl
)

$ErrorActionPreference = 'Stop'
$RealtimeUrl = $RealtimeUrl.Trim().TrimEnd('/')
if ($RealtimeUrl -notmatch '^https://') {
    Write-Error 'RealtimeUrl must start with https://'
}

$root = Split-Path $PSScriptRoot -Parent
$wsSecret = $env:WS_INTERNAL_SECRET
if (-not $wsSecret) {
    $secretFile = Join-Path $root '.local-secrets\WS_INTERNAL_SECRET.txt'
    if (Test-Path $secretFile) {
        $wsSecret = (Get-Content $secretFile -Raw).Trim()
    }
}
if (-not $wsSecret) {
    Write-Warning 'Set WS_INTERNAL_SECRET env var or .local-secrets\WS_INTERNAL_SECRET.txt before running.'
    $wsSecret = 'CHANGE-ME-use-same-on-web-and-appdev'
}

# Mobile config.ts
$configPath = Join-Path $root 'src\app\api\config.ts'
$config = Get-Content $configPath -Raw -Encoding UTF8
$config = $config -replace "export const PRODUCTION_REALTIME_ORIGIN = '[^']*';", "export const PRODUCTION_REALTIME_ORIGIN = '$RealtimeUrl';"
Set-Content -Path $configPath -Value $config -Encoding UTF8 -NoNewline
Write-Host "Updated: $configPath"

# Local secrets for Railway web paste
$secrets = Join-Path $root '.local-secrets'
if (-not (Test-Path $secrets)) {
    New-Item -ItemType Directory -Path $secrets -Force | Out-Null
}
$webEnv = @(
    "WS_BROADCAST_URL=$RealtimeUrl"
    "WS_INTERNAL_SECRET=$wsSecret"
) -join "`n"
Set-Content -Path (Join-Path $secrets 'railway-web-WS-vars.env') -Value $webEnv -Encoding UTF8
Set-Content -Path (Join-Path $secrets 'realtime-domain.txt') -Value $RealtimeUrl -Encoding UTF8
Write-Host "Updated: .local-secrets\railway-web-WS-vars.env"

# casaclick .env.railway snippet
$casaclick = 'C:\Users\Maligalig\APP DEV\casaclick'
if (Test-Path $casaclick) {
    $snippet = Join-Path $secrets 'casaclick-railway-WS-snippet.env'
    Set-Content -Path $snippet -Value $webEnv -Encoding UTF8
    Write-Host "Paste into Railway Web service: $snippet"
}

Write-Host ''
Write-Host 'Next:' -ForegroundColor Green
Write-Host '  1. Railway Web (casaclick) -> Variables -> paste railway-web-WS-vars.env'
Write-Host '  2. Redeploy Web + realtime services'
Write-Host '  3. npm run android:release'
Write-Host "  4. Test: $RealtimeUrl/health"
