# Windows 本地或 CI 验证生产 compose 构建
param(
  [string]$EnvFile = "$PSScriptRoot\..\.env"
)

$InfraDir = Join-Path $PSScriptRoot ".."
Push-Location $InfraDir
try {
  if (-not (Test-Path $EnvFile)) {
    Copy-Item ".env.example" ".env"
    Write-Host "已创建 .env，请修改 POSTGRES_PASSWORD 后重试"
    exit 1
  }
  docker compose -f docker-compose.prod.yml --env-file $EnvFile up -d --build
  Start-Sleep -Seconds 8
  Invoke-RestMethod -Uri "http://localhost:8000/health"
} finally {
  Pop-Location
}
