# 前端 API 对接清单

下一阶段将 Mock Store 逐步替换为 REST 调用。建议顺序：

## 1. 告警闭环（最高优先级）

| Store / 页面 | API | 说明 |
|--------------|-----|------|
| 老人 `sos` | `POST /api/v1/simulator/trigger` `{ event_type: "sos" }` | 或直连 MQTT 后由后端消费 |
| 子女 `alert` | `GET/PATCH /api/v1/alerts` | 列表与确认/关闭 |
| 社区 `communityAlert` | `GET/PATCH /api/v1/work-orders` | 工单详情与完成 |

## 2. 老人档案与体征

| Store | API |
|-------|-----|
| `elder` | `GET /api/v1/elders/{id}` |
| `health` | `GET /api/v1/elders/{id}/metrics/latest` |

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
