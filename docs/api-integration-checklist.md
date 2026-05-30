# 前端 API 对接清单

`VITE_USE_API=true` 时使用 JWT 或开发 Header 走 REST。

## 1. 认证

| 能力 | API | 状态 |
|------|-----|------|
| 手机 OTP 登录 | `POST /api/v1/auth/phone/otp` + `verify` | 已接 |
| 微信小程序登录 | `POST /api/v1/auth/wechat/login` | 已接 |
| 会话恢复 | `GET /api/v1/auth/me` + localStorage token | 已接 |
| 子女绑定老人 | `POST /api/v1/auth/bind-elder` | 已接 |

## 2. 告警闭环

| Store / 页面 | API | 状态 |
|--------------|-----|------|
| 老人 `sos` | `POST /api/v1/simulator/trigger` | 已接 |
| 子女 `alert` | `GET/PATCH /api/v1/alerts` | 已接 |
| 社区 `communityWorkorder` | `GET/PATCH /api/v1/work-orders` | 已接 |
| 社区 `communityAlert` | `GET /community/work-orders/{id}/detail` | 已接 |
| 实时推送 | `GET /api/v1/events/stream?token=` | 已接（子女守护页） |

## 3. 三端 Tab 页（12 页）

全部已接 API，数据来自 DB（非 demo 内存）。

## 4. 详情页

| 能力 | API | 状态 |
|------|-----|------|
| 设备列表 | `GET /elders/{id}/devices` | 已接 |
| 用药 | `GET/PATCH /elders/{id}/medicines/{id}` | 已接 |
| 指标历史 | `GET /elders/{id}/metrics/{key}/history` | 已接 |
| 服务中心摘要 | `GET /elders/{id}/service-summary` | 已接 |
| 陪伴状态 | `GET/PATCH /elders/{id}/companion-state` | 已接（DB） |
| 通知规则 | `GET/PATCH /family/notification-rules` | 已接（DB） |

## 5. 权限

- JWT / `AUTH_DEV_BYPASS` Header
- elder/alert/work-order 按 binding / 社区站过滤
- `family-002` 未绑定访问 `elder-001` → 403

## 6. 验收

```powershell
.\scripts\e2e-smoke.ps1
cd apps/mobile && pnpm vue-tsc --noEmit
```

详见 [e2e-acceptance.md](./e2e-acceptance.md)
