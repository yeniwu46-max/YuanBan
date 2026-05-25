# Yuanbanban deploy without Docker (Windows): API SQLite + H5 static server
param(
  [int]$ApiPort = 8000,
  [int]$WebPort = 8080,
  [string]$BindHost = "0.0.0.0",
  [switch]$UseApi,
  [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"
$Root = Split-Path $PSScriptRoot -Parent

function Get-LanIp {
  $candidates = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
    Where-Object {
      $_.IPAddress -notlike '127.*' -and
      $_.IPAddress -notlike '169.254.*'
    }
  $prefer = $candidates | Where-Object {
    $_.InterfaceAlias -match 'WLAN|Wi-?Fi|Ethernet' -and
    $_.InterfaceAlias -notmatch 'VMware|Virtual|Loopback|vEthernet'
  } | Select-Object -First 1
  if ($prefer) { return $prefer.IPAddress }
  $fallback = $candidates | Where-Object {
    $_.InterfaceAlias -notmatch 'VMware|Virtual|Loopback|vEthernet'
  } | Select-Object -First 1
  if ($fallback) { return $fallback.IPAddress }
  return '127.0.0.1'
}

$LanIp = Get-LanIp
# Single-port mode: H5 server proxies /api -> localhost:8000 (one firewall port for phones)
$ApiBase = "http://${LanIp}:${WebPort}"

Write-Host "=== Yuanbanban (no Docker) ===" -ForegroundColor Cyan
Write-Host "LAN IP: $LanIp"
Write-Host "H5+API (one URL): http://${LanIp}:${WebPort}/"
Write-Host "API direct:       http://${LanIp}:${ApiPort}/health"

$ApiDir = Join-Path $Root "services\api"
Push-Location $ApiDir
pip install -e . -q
python -m app.dev_setup
Pop-Location

$MobileDir = Join-Path $Root "apps\mobile"
$EnvProd = Join-Path $MobileDir ".env.production"
$useApiLine = if ($UseApi) { "VITE_USE_API=true" } else { "VITE_USE_API=false" }
$envContent = "VITE_API_BASE=$ApiBase`n$useApiLine`n"
Set-Content -Path $EnvProd -Value $envContent -Encoding utf8

if (-not $SkipBuild) {
  Push-Location $MobileDir
  if (-not (Test-Path "node_modules")) { pnpm install }
  pnpm build:h5
  Pop-Location
}

$H5Dir = Join-Path $MobileDir "dist\build\h5"
if (-not (Test-Path $H5Dir)) {
  throw "H5 build missing: $H5Dir"
}

$DeployDir = Join-Path $Root ".deploy"
New-Item -ItemType Directory -Force -Path $DeployDir | Out-Null
$PidFile = Join-Path $DeployDir "pids.json"

if (Test-Path $PidFile) {
  $old = Get-Content $PidFile | ConvertFrom-Json
  foreach ($p in @($old.apiPid, $old.webPid)) {
    if ($p) { Stop-Process -Id $p -Force -ErrorAction SilentlyContinue }
  }
}

$apiCmd = "Set-Location '$ApiDir'; python -m uvicorn app.main:app --host $BindHost --port $ApiPort"
$apiPs = Start-Process powershell -ArgumentList "-NoProfile", "-Command", $apiCmd -PassThru -WindowStyle Hidden

$h5ServeScript = Join-Path $Root "scripts\serve-h5.py"
$webPs = Start-Process python -ArgumentList $h5ServeScript, $H5Dir, $BindHost, $WebPort -PassThru -WindowStyle Hidden

Start-Sleep -Seconds 4

try {
  $health = Invoke-RestMethod -Uri "http://127.0.0.1:${ApiPort}/health" -TimeoutSec 10
  Write-Host "API health OK: $($health.status) db=$($health.database)" -ForegroundColor Green
} catch {
  Write-Warning "API not ready yet - try /health later"
}

@{
  apiPid = $apiPs.Id
  webPid = $webPs.Id
  apiUrl = $ApiBase
  webUrl = "http://${LanIp}:${WebPort}/"
  startedAt = (Get-Date).ToString("o")
} | ConvertTo-Json | Set-Content $PidFile

Write-Host ""
Write-Host "Started." -ForegroundColor Green
Write-Host "  Phone browser:  http://${LanIp}:${WebPort}/"
Write-Host "  API docs:       http://${LanIp}:${WebPort}/docs"
Write-Host "  If WiFi blocks phone->PC, use phone HOTSPOT: connect PC to hotspot, run this script again."
Write-Host "  Stop:           .\scripts\stop-no-docker.ps1"
