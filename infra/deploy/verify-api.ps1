# 部署后冒烟：health + SOS trigger + alerts
param([string]$Base = "http://127.0.0.1:8000")

Write-Host "== GET /health =="
(Invoke-RestMethod -Uri "$Base/health") | ConvertTo-Json -Compress

Write-Host "== POST simulator/trigger (sos) =="
$body = @{ event_type = "sos"; elder_id = "elder-001" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "$Base/api/v1/simulator/trigger" -ContentType "application/json" -Body $body | ConvertTo-Json -Compress

Write-Host "== GET /api/v1/alerts (top 1) =="
(Invoke-RestMethod -Uri "$Base/api/v1/alerts")[0] | ConvertTo-Json -Compress

Write-Host "OK"
