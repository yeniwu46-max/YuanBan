$PidFile = Join-Path (Split-Path $PSScriptRoot -Parent) ".deploy\pids.json"
if (-not (Test-Path $PidFile)) {
  Write-Host "无运行中的部署记录"
  exit 0
}
$info = Get-Content $PidFile | ConvertFrom-Json
foreach ($p in @($info.apiPid, $info.webPid)) {
  if ($p) { Stop-Process -Id $p -Force -ErrorAction SilentlyContinue }
}
Remove-Item $PidFile -Force
Write-Host "已停止 API 与 H5 服务"
