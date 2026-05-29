# 前端 API 对接清单

`VITE_USE_API=true` 时走 REST；本地默认 Mock。

## 1. 告警闭环

| Store / 页面 | API | 状态 |
|--------------|-----|------|
| 老人 `sos` | `POST /api/v1/simulator/trigger` | 已接 |
| 子女 `alert` | `GET/PATCH /api/v1/alerts` | 已接 |
| 社区 `communityWorkorder` | `GET/PATCH /api/v1/work-orders` | 已接 |
| 社区 `communityAlert` | `GET /api/v1/community/work-orders/{id}` | 已接 |

## 2. 三端 Tab 页（12 页）

| 端 | Tab 页 | API | 状态 |
|----|--------|-----|------|
| 老人 | home / health | `GET /elders/{id}`、`GET /metrics/latest` | 已接 |
| 老人 | companion | `POST /companion/chat` | 已接 |
| 老人 | service | `GET /elders/{id}/service-summary` | 已接 |
| 子女 | guardian | `GET /elders` + `GET /alerts` + `GET /family/dashboard` | 已接 |
| 子女 | report | `GET /family/reports?period=` | 已接 |
| 子女 | care | `GET /family/care/tasks`、`GET /family/care/stats` | 已接 |
| 子女 | settings | `GET/PATCH /family/notification-rules` | 已接 |
| 社区 | dashboard | `GET /community/dashboard` | 已接 |
| 社区 | workorders | `GET/PATCH /work-orders` | 已接 |
| 社区 | activity | `GET /community/activities` | 已接 |
| 社区 | profile | `GET /community/service-profile` | 已接 |

## 3. 性能优化

| 项 | 说明 | 状态 |
|----|------|------|
| Tab 导航 | `pages/tabs/tab0-3` + custom tabBar + `switchTab` | 已完成 |
| 请求缓存 | `services/requestCache.ts` TTL 30s + in-flight 去重 | 已完成 |
| 分包 | `pkg-elder-detail` / `pkg-family-detail` / `pkg-community-detail` | 已完成 |

## 4. 扩展读接口（详情页）

| 能力 | API | 状态 |
|------|-----|------|
| 设备列表 | `GET /elders/{id}/devices` | 已接 |
| 用药 | `GET /elders/{id}/medicines` | 已接 |
| 指标历史 | `GET /elders/{id}/metrics/{key}/history` | 已接 |
| 陪伴状态 | `GET/PATCH /elders/{id}/companion-state` | 已接 |

## 5. 开发 Header（MVP 认证）

```http
X-Role: family
X-User-Id: family-001
```

正式 JWT 接入后替换。

## 6. 关键文件

- [`apps/mobile/src/services/apiClient.ts`](../apps/mobile/src/services/apiClient.ts)
- [`apps/mobile/src/services/requestCache.ts`](../apps/mobile/src/services/requestCache.ts)
- [`apps/mobile/src/utils/tabBar.ts`](../apps/mobile/src/utils/tabBar.ts)
- [`services/api/app/routers/family.py`](../services/api/app/routers/family.py)
- [`services/api/app/routers/community.py`](../services/api/app/routers/community.py)
