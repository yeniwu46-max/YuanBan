# SOS 三端 E2E 验收脚本

本地 API 需已启动：`cd services/api && python -m app.dev_setup && uvicorn app.main:app --reload`

## 一键冒烟（PowerShell）

```powershell
.\scripts\e2e-smoke.ps1
```

## 手动步骤

### 1. 登录获取 Token

```powershell
$family = Invoke-RestMethod -Method Post -Uri http://localhost:8000/api/v1/auth/phone/verify `
  -ContentType application/json `
  -Body '{"phone":"13000000000","code":"123456","role":"family"}'
$elder = Invoke-RestMethod -Method Post -Uri http://localhost:8000/api/v1/auth/phone/verify `
  -ContentType application/json `
  -Body '{"phone":"13800000001","code":"123456","role":"elder"}'
$community = Invoke-RestMethod -Method Post -Uri http://localhost:8000/api/v1/auth/phone/verify `
  -ContentType application/json `
  -Body '{"phone":"13900000001","code":"123456","role":"community"}'
```

### 2. 老人端触发 SOS

```powershell
$headers = @{ Authorization = "Bearer $($elder.access_token)" }
Invoke-RestMethod -Method Post -Uri http://localhost:8000/api/v1/simulator/trigger `
  -Headers $headers -ContentType application/json `
  -Body '{"event_type":"sos","elder_id":"elder-001","device_id":"d3","location":"卧室"}'
```

### 3. 子女端查看告警

```powershell
$fh = @{ Authorization = "Bearer $($family.access_token)" }
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/alerts?elder_id=elder-001" -Headers $fh
```

### 4. 社区端查看工单详情

```powershell
$ch = @{ Authorization = "Bearer $($community.access_token)" }
Invoke-RestMethod -Uri http://localhost:8000/api/v1/work-orders?tab=urgent -Headers $ch
```

### 5. 权限校验（family-002 未绑定 elder-001 应 403）

```powershell
$other = Invoke-RestMethod -Method Post -Uri http://localhost:8000/api/v1/auth/phone/verify `
  -ContentType application/json `
  -Body '{"phone":"13000000001","code":"123456","role":"family"}'
try {
  Invoke-RestMethod -Uri http://localhost:8000/api/v1/elders/elder-001 `
    -Headers @{ Authorization = "Bearer $($other.access_token)" }
} catch {
  $_.Exception.Response.StatusCode.value__  # 期望 403
}
```

### 6. 前端类型检查

```powershell
cd apps/mobile
pnpm vue-tsc --noEmit
```

## 验收标准

- [ ] 三角色 OTP 登录返回 JWT
- [ ] `/auth/me` 返回绑定老人列表
- [ ] SOS 触发后子女/社区可见新告警/工单
- [ ] 未绑定用户访问 elder-001 返回 403
- [ ] 用药/设备/通知规则重启 API 后仍存在
- [ ] `vue-tsc --noEmit` 通过
