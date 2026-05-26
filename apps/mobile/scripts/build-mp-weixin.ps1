# 微信小程序构建
$Root = Split-Path $PSScriptRoot -Parent
Push-Location $Root

if (-not (Test-Path ".env.mp-weixin")) {
  Copy-Item ".env.mp-weixin.example" ".env.mp-weixin"
  Write-Host "已创建 .env.mp-weixin — 请填写 VITE_MP_APPID 与 VITE_API_BASE 后重新运行" -ForegroundColor Yellow
  Pop-Location
  exit 1
}

$appId = (Get-Content ".env.mp-weixin" | Where-Object { $_ -match '^\s*VITE_MP_APPID=' } | Select-Object -First 1) -replace '^\s*VITE_MP_APPID=\s*', ''
$appId = $appId.Trim().Trim('"').Trim("'")
if ($appId -and $appId -notmatch 'your_appid') {
  $manifestPath = Join-Path $Root "src\manifest.json"
  $json = Get-Content $manifestPath -Raw | ConvertFrom-Json
  $json.'mp-weixin'.appid = $appId
  $json | ConvertTo-Json -Depth 6 | Set-Content $manifestPath -Encoding utf8
  Write-Host "manifest appid -> $appId"
}

pnpm install
pnpm build:mp-weixin

$out = Join-Path $Root "dist\build\mp-weixin"
if (Test-Path $out) {
  Write-Host ""
  Write-Host "构建成功。用微信开发者工具导入目录:" -ForegroundColor Green
  Write-Host "  $out"
  Write-Host ""
  Write-Host "开发阶段 manifest 已设 urlCheck:false；真机预览需在后台配置合法域名。"
} else {
  Write-Host "未找到输出目录，请检查 dist/build/mp-weixin"
}

Pop-Location
