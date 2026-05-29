# 移动端优化与后端接入 — 阶段沉淀总结

**日期：** 2026-05-29  
**范围：** Tab 导航性能优化、请求缓存、分包、三端 12 Tab 页 API 接入、后端路由扩展

---

## 1. 本阶段完成一览

| 模块 | 内容 | 状态 |
|------|------|------|
| Tab 导航 | custom tabBar + 4 壳页面 + `switchTab` 保活 | ✅ |
| 请求缓存 | `requestCache.ts`（30s TTL + in-flight 去重） | ✅ |
| 分包 | 老人/子女/社区详情页拆至 subPackages | ✅ |
| 老人端 API | ElderOut 扩展、devices/medicines/metrics history/service-summary/companion-state | ✅ |
| 子女端 API | `routers/family.py`（dashboard/reports/care/notification-rules） | ✅ |
| 社区端 API | `routers/community.py`（dashboard/activities/service-profile/work-order 详情） | ✅ |
| 前端接线 | 12 个 Tab 页 Store hydrate + `onShow` 统一 `{ force: false }` | ✅ |
| 文档 | [`api-integration-checklist.md`](./api-integration-checklist.md) 更新 | ✅ |

---

## 2. 架构变化（前后对比）

### 2.1 Tab 切换

**之前：** 底部导航调用 `goMainTab` → 全程 `uni.reLaunch`，每次销毁页面栈并重建组件，触发重复 `onShow` + 网络请求。

**现在：**

```
登录完成 goHome() → reLaunch 到 pages/tabs/tab0
Tab 间切换       → switchTab(tab0~tab3)，页面保活
壳页面           → 按 session.role 动态加载对应 Tab 内容组件
底部栏           → custom-tab-bar/index.vue（三端样式统一）
```

关键文件：

- [`apps/mobile/src/pages/tabs/tab0~3/index.vue`](../apps/mobile/src/pages/tabs/)
- [`apps/mobile/src/utils/tabBar.ts`](../apps/mobile/src/utils/tabBar.ts)
- [`apps/mobile/src/utils/navigate.ts`](../apps/mobile/src/utils/navigate.ts)
- [`apps/mobile/src/custom-tab-bar/index.vue`](../apps/mobile/src/custom-tab-bar/index.vue)

### 2.2 数据请求

**之前：** `App.onLaunch` 与各 Tab 页 `onShow` 双 hydrate，无 TTL，守护页额外重复拉 `/alerts`。

**现在：**

```
App.onLaunch (API 模式)  → force: true 预取 elder/health/guardian
Tab onShow               → hydrate({ force: false })，命中缓存则跳过
guardian.hydrate         → 同步 alerts 到 alertStore，不再单独 hydrate alert
```

关键文件：[`apps/mobile/src/services/requestCache.ts`](../apps/mobile/src/services/requestCache.ts)

### 2.3 分包与路由

详情页从主包迁出，路径前缀变更（示例）：

| 原路径 | 新路径 |
|--------|--------|
| `/pages/sos/index` | `/pkg-elder-detail/sos/index` |
| `/pages/family/alert/index` | `/pkg-family-detail/family/alert/index` |
| `/pages/community/alert/index` | `/pkg-community-detail/community/alert/index` |

路由常量：[`apps/mobile/src/utils/routes.ts`](../apps/mobile/src/utils/routes.ts)

---

## 3. 后端 API 清单（本阶段新增/扩展）

### 3.1 老人端（`routers/api.py`）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/elders/{id}` | 扩展 `guard_score`、`device_count`、`online_status` |
| GET | `/api/v1/elders/{id}/devices` | 设备列表 |
| GET | `/api/v1/elders/{id}/medicines` | 用药计划 |
| GET | `/api/v1/elders/{id}/metrics/{key}/history` | 指标历史 |
| GET | `/api/v1/elders/{id}/service-summary` | 服务页聚合摘要 |
| GET/PATCH | `/api/v1/elders/{id}/companion-state` | 陪伴心情/分数 |

### 3.2 子女端（`routers/family.py`）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/family/dashboard?elder_id=` | 守护首页聚合 |
| GET | `/api/v1/family/reports?elder_id=&period=` | 健康报告 |
| GET | `/api/v1/family/care/tasks?elder_id=` | 关怀任务 |
| GET | `/api/v1/family/care/stats?elder_id=` | 关怀统计 |
| GET/PATCH | `/api/v1/family/notification-rules` | 通知规则 |

### 3.3 社区端（`routers/community.py`）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/community/dashboard` | 看板聚合 |
| GET | `/api/v1/community/activities` | 活动列表 |
| GET | `/api/v1/community/service-profile?elder_id=` | 老人服务档案 |
| GET | `/api/v1/community/work-orders/{id}` | 工单详情 |

演示数据：[`services/api/app/data/demo_content.py`](../services/api/app/data/demo_content.py)（care tasks、activities、notification rules 等）

---

## 4. 三端 Tab 页 API 覆盖

| 端 | Tab | Store / Service | API 模式数据源 |
|----|-----|-----------------|----------------|
| 老人 | 首页 / 健康 | `elder` + `health` | elders + metrics/latest |
| 老人 | 小鼋 | `companion` | companion/chat |
| 老人 | 服务 | （页面静态 + 跳转详情） | service-summary（可扩展） |
| 子女 | 守护 | `guardian` + `alert` | elders + alerts |
| 子女 | 报告 | `familyReport` | family/reports |
| 子女 | 关怀 | `care` | family/care/* |
| 子女 | 设置 | `care`（通知规则） | family/notification-rules |
| 社区 | 看板 | `communityDashboard` | community/dashboard |
| 社区 | 工单 | `communityWorkorder` | work-orders |
| 社区 | 活动 | `communityActivity` | community/activities |
| 社区 | 档案 | `communityProfile` | community/service-profile |

完整对接表：[`api-integration-checklist.md`](./api-integration-checklist.md)

---

## 5. 本地验证步骤

### 5.1 启动后端

```powershell
cd services\api
.\scripts\start-local.ps1
# 或: python -m app.dev_setup && uvicorn app.main:app --reload
```

验证：http://localhost:8000/health  
期望：`database: sqlite`，路由数约 31 条

### 5.2 启动前端（API 模式）

在 `apps/mobile/.env.development` 中设置：

```env
VITE_USE_API=true
VITE_API_BASE=http://localhost:8000
```

```powershell
cd apps\mobile
pnpm dev:h5
```

### 5.3 验收要点

1. 登录后进入对应端 Tab，底部栏显示正常（custom tabBar）
2. Tab 间切换无明显白屏，`switchTab` 保活
3. Network：30s 内重复进入同一 Tab 不重复请求 `/alerts`、`/metrics/latest`
4. 三端 Tab 页在 API 模式下有数据展示（非空 Mock 占位）
5. `vue-tsc --noEmit` 通过

---

## 6. 已知限制与下一阶段

| 项 | 说明 |
|----|------|
| Mock 模板合并 | API 模式下 guardian 等仍用 mock 模板补 UI 字段，待 ElderOut 字段补全后逐步去除 |
| 登录认证 | 仍用 `X-Role` + `X-User-Id` Header，无 JWT/OTP |
| 实时推送 | 无 WebSocket，告警需手动刷新或重新进入页面 |
| 微信小程序 | 分包与 custom tabBar 需在 MP build 上再验一遍 |
| companion-state / 通知规则 | 部分写操作存内存/demo JSON，重启 API 后重置 |

**建议下一阶段：**

1. JWT 登录与角色绑定
2. WebSocket/SSE 告警推送
3. 详情页（device/medicine 等）Store 接 API
4. 微信小程序 + H5 双端 build CI

---

## 7. 相关文档索引

| 文档 | 用途 |
|------|------|
| [api-integration-checklist.md](./api-integration-checklist.md) | API 对接状态清单 |
| [backend-infra-summary-2026-05-24.md](./backend-infra-summary-2026-05-24.md) | 后端工程结构 |
| [family-mobile-ui-summary-2026-05-24.md](./family-mobile-ui-summary-2026-05-24.md) | 子女端 UI |
| [community-mobile-ui-summary-2026-05-24.md](./community-mobile-ui-summary-2026-05-24.md) | 社区端 UI |
| [deploy-wuyeni-cn.md](./deploy-wuyeni-cn.md) | 生产部署 |
