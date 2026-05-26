# 检查 wuyeni.cn 部署是否就绪
$api = "https://api.wuyeni.cn/health"
Write-Host "DNS api.wuyeni.cn ->" -NoNewline
try {
  $dns = Resolve-DnsName api.wuyeni.cn -Type A -ErrorAction Stop | Select-Object -First 1 -ExpandProperty IPAddress
  Write-Host " $dns"
} catch {
  Write-Host " 未解析（请在阿里云添加 A 记录 api -> 47.102.108.137）" -ForegroundColor Yellow
}

Write-Host "HTTPS API:" -NoNewline
try {
  $h = Invoke-RestMethod -Uri $api -TimeoutSec 15
  Write-Host " OK  $($h | ConvertTo-Json -Compress)" -ForegroundColor Green
} catch {
  Write-Host " 失败 - $($_.Exception.Message)" -ForegroundColor Red
  Write-Host "请在阿里云 Workbench 执行 docs/deploy-wuyeni-cn.md 第三节命令"
}
