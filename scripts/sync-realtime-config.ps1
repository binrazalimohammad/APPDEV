# Resolve Railway realtime HTTPS URL and set PRODUCTION_REALTIME_ORIGIN in config.ts
# Usage:
#   npm run sync:realtime
#   powershell -File scripts/sync-realtime-config.ps1 -RealtimeUrl "https://realtime-xxxx.up.railway.app"

param(
    [string]$RealtimeUrl = ''
)

$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$secrets = Join-Path $root '.local-secrets'
$webEnv = Join-Path $secrets 'railway-web-WS-vars.env'
$apiOrigin = 'https://web-production-6bdab.up.railway.app'

function Test-RealtimeHealth([string]$Url) {
    try {
        $health = Invoke-RestMethod -Uri "$Url/health" -TimeoutSec 12
        return ($health.ok -eq $true)
    } catch {
        return $false
    }
}

function Get-UrlFromWebEnv {
    if (-not (Test-Path $webEnv)) {
        return $null
    }
    $line = Get-Content $webEnv | Where-Object { $_ -match '^WS_BROADCAST_URL=(https://.+)$' } | Select-Object -First 1
    if (-not $line) {
        return $null
    }
    $url = ($line -replace '^WS_BROADCAST_URL=', '').Trim().TrimEnd('/')
    if ($url -match 'REPLACE|YOUR-REALTIME') {
        return $null
    }
    return $url
}

function Get-UrlFromApi {
    try {
        $res = Invoke-RestMethod -Uri "$apiOrigin/api/mobile/realtime-config" -TimeoutSec 12
        $url = $res.data.realtimeOrigin
        if ([string]::IsNullOrWhiteSpace($url)) {
            return $null
        }
        return $url.Trim().TrimEnd('/')
    } catch {
        return $null
    }
}

if ([string]::IsNullOrWhiteSpace($RealtimeUrl)) {
    $RealtimeUrl = Get-UrlFromWebEnv
}
if ([string]::IsNullOrWhiteSpace($RealtimeUrl)) {
    $RealtimeUrl = Get-UrlFromApi
}

if ([string]::IsNullOrWhiteSpace($RealtimeUrl)) {
    Write-Host 'Could not resolve realtime URL.' -ForegroundColor Yellow
    Write-Host '  1. Railway -> realtime service -> Networking -> copy HTTPS domain'
    Write-Host '  2. Paste into .local-secrets\railway-web-WS-vars.env as WS_BROADCAST_URL=...'
    Write-Host '  3. Redeploy Web (casaclick) with the same URL + WS_INTERNAL_SECRET'
    Write-Host '  4. Re-run: npm run sync:realtime'
    Write-Host ''
    Write-Host 'Or pass the URL directly:'
    Write-Host '  npm run finish:realtime -- -RealtimeUrl "https://YOUR-REALTIME.up.railway.app"'
    exit 1
}

if ($RealtimeUrl -notmatch '^https://') {
    Write-Error 'Realtime URL must start with https://'
}

if (-not (Test-RealtimeHealth $RealtimeUrl)) {
    Write-Warning "Health check failed for ${RealtimeUrl}/health - continuing anyway."
}

& (Join-Path $PSScriptRoot 'finish-realtime-setup.ps1') -RealtimeUrl $RealtimeUrl
Write-Host ''
Write-Host ('PRODUCTION_REALTIME_ORIGIN set to ' + $RealtimeUrl) -ForegroundColor Green
Write-Host 'Rebuild APK: npm run android:release'
