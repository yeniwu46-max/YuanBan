# 前端 API 对接清单

下一阶段将 Mock Store 逐步替换为 REST 调用。建议顺序：

## 1. 告警闭环（最高优先级）

| Store / 页面 | API | 状态 |
|--------------|-----|------|
| 老人 `sos` | `POST /api/v1/simulator/trigger` | 已接 |
| 子女 `alert` | `GET/PATCH /api/v1/alerts` | 已接 |
| 社区 `communityWorkorder` | `GET/PATCH /api/v1/work-orders` | 已接 |
| 社区 `communityAlert` | 工单完成联动 | 部分 Mock 详情 |

## 2. 老人档案与体征

| Store | API | 状态 |
|-------|-----|------|
| `elder` | `GET /api/v1/elders/{id}` | 已接（`VITE_USE_API=true`） |
| `health` | `GET /api/v1/elders/{id}/metrics/latest` | 已接 |
| `guardian` | `GET /api/v1/elders` + alerts 聚合 | 已接 |

## 3. 社区工单列表

| Store | API |
|-------|-----|
| `communityWorkorder` | `GET /api/v1/work-orders?tab=` |
| `communityDashboard` | 由 alerts + work-orders 聚合或扩展 stats API |

## 4. 已预留文件

- [`apps/mobile/src/services/apiClient.ts`](../apps/mobile/src/services/apiClient.ts)
- [`apps/mobile/src/services/communityService.ts`](../apps/mobile/src/services/communityService.ts)
- [`apps/mobile/.env.development`](../apps/mobile/.env.development) — `VITE_API_BASE`

## 5. 开发 Header（MVP 认证）

```http
X-Role: family
X-User-Id: family-001
```

正式 JWT 接入后替换。
