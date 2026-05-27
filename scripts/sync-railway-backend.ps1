# Sync CasaClick backend features required for mobile ↔ website live updates.
# Run from BinRazali folder:  powershell -ExecutionPolicy Bypass -File scripts/sync-railway-backend.ps1
#
# Copies from websitedev (full features) into casaclick (Railway deploy target), then you:
#   cd "C:\Users\Maligalig\APP DEV\casaclick"
#   git add -A && git commit -m "feat: mobile activity logs and live sync for Railway"
#   git push origin main
# Railway will redeploy automatically.

$ErrorActionPreference = 'Stop'

$src = 'C:\Users\Maligalig\websitedev'
$dst = 'C:\Users\Maligalig\APP DEV\casaclick'

if (-not (Test-Path "$src\public\index.php")) {
    Write-Error "websitedev not found at $src"
}
if (-not (Test-Path "$dst\public\index.php")) {
    Write-Error "casaclick not found at $dst"
}

$files = @(
    @{ From = 'src\Service\ActivityLogService.php'; To = 'src\Service\ActivityLogService.php' },
    @{ From = 'src\Service\LiveSyncRevisionService.php'; To = 'src\Service\LiveSyncRevisionService.php' },
    @{ From = 'src\Service\MobileUserProvisioningService.php'; To = 'src\Service\MobileUserProvisioningService.php' },
    @{ From = 'src\Controller\SyncFeedController.php'; To = 'src\Controller\SyncFeedController.php' },
    @{ From = 'src\Controller\ActivityLogController.php'; To = 'src\Controller\ActivityLogController.php' },
    @{ From = 'src\Controller\Api\MobileApiController.php'; To = 'src\Controller\Api\MobileApiController.php' },
    @{ From = 'src\Repository\ActivityLogRepository.php'; To = 'src\Repository\ActivityLogRepository.php' },
    @{ From = 'src\Repository\ProductRepository.php'; To = 'src\Repository\ProductRepository.php' },
    @{ From = 'src\Repository\ApplicationRepository.php'; To = 'src\Repository\ApplicationRepository.php' },
    @{ From = 'src\Repository\PaymentRepository.php'; To = 'src\Repository\PaymentRepository.php' },
    @{ From = 'src\Controller\Admin\AdminBookingController.php'; To = 'src\Controller\Admin\AdminBookingController.php' },
    @{ From = 'templates\admin\logs\index.html.twig'; To = 'templates\admin\logs\index.html.twig' },
    @{ From = 'templates\admin\bookings\index.html.twig'; To = 'templates\admin\bookings\index.html.twig' },
    @{ From = 'templates\admin\index.html.twig'; To = 'templates\admin\index.html.twig' },
    @{ From = 'templates\base.html.twig'; To = 'templates\base.html.twig' },
    @{ From = 'assets\js\live-sync.js'; To = 'assets\js\live-sync.js' },
    @{ From = 'assets\app.js'; To = 'assets\app.js' },
    @{ From = 'migrations\Version20260520130000.php'; To = 'migrations\Version20260520130000.php' }
)

foreach ($f in $files) {
    $from = Join-Path $src $f.From
    $to = Join-Path $dst $f.To
    $dir = Split-Path $to -Parent
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    Copy-Item -Path $from -Destination $to -Force
    Write-Host "OK $($f.To)"
}

Write-Host ''
Write-Host 'Done. Next:'
Write-Host '  cd "' $dst '"'
Write-Host '  php bin/console doctrine:migrations:migrate --no-interaction'
Write-Host '  npm run build   # or encore production if you use webpack'
Write-Host '  git add -A && git commit && git push origin main'
Write-Host 'Then open Railway admin: Activity Logs + Manage Bookings (live ~8s).'
