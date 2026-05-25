# 生产 H5 构建（需先配置 .env.production）
$Root = Split-Path $PSScriptRoot -Parent
Push-Location $Root
if (-not (Test-Path ".env.production")) {
  Copy-Item ".env.production.example" ".env.production"
  Write-Host "已创建 .env.production，请设置 VITE_API_BASE 后重新运行"
  exit 1
}
pnpm install
pnpm build:h5
$out = Join-Path $Root "dist\build\h5"
if (Test-Path $out) {
  Write-Host "H5 产物: $out"
} else {
  Write-Host "产物目录请查看 dist/build/（以 uni 实际输出为准）"
}
Pop-Location
