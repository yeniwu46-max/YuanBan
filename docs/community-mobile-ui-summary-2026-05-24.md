# 鼋伴伴社区端 uni-app UI 开发总结

**日期：** 2026-05-24  
**范围：** `apps/mobile` 社区端 Mock 演示版（H5 / 微信小程序可构建）

---

## 1. 今日目标与完成情况

| 阶段 | 内容 | 状态 |
|------|------|------|
| 阶段 A | 类型、Mock、Pinia、登录分流、路由骨架 | ✅ 完成 |
| 阶段 B | 看板 / 工单 / 活动 / 档案 四 Tab UI | ✅ 完成 |
| 阶段 C | 告警工单详情、完成回写、页面跳转闭环 | ✅ 完成 |

社区端已可在 H5 完整演示「SOS 工单处理」闭环，**尚未接后端 API**。

---

## 2. 工程结构（社区端相关）

```
apps/mobile/src/
├── types/community.ts
├── mock/community.ts              # 对齐李奶奶 SOS #SOS-018
├── stores/
│   ├── community.ts               # 社区站信息
│   ├── communityDashboard.ts      # 看板统计与紧急列表
│   ├── communityWorkorder.ts      # 工单 Tab 与列表
│   ├── communityActivity.ts       # 活动管理
│   ├── communityProfile.ts        # 老人服务档案
│   └── communityAlert.ts          # 工单详情与闭环
├── components/community/
│   ├── CommunityBottomNav.vue
│   ├── CommunityPageHeader.vue
│   ├── StatsHero.vue
│   ├── WorkOrderCard.vue
│   ├── QuickActionGrid.vue
│   ├── OpsMetricCard.vue
│   └── CommunityEmptyState.vue
└── pages/community/
    ├── login-guide/               # 登录引导
    ├── dashboard/                 # 看板 Tab
    ├── workorders/                # 工单 Tab
    ├── activity/                  # 活动 Tab
    ├── profile/                   # 档案 Tab
    └── alert/                     # 告警工单详情
```

---

## 3. 页面与导航

### 3.1 社区端 Tab（4 个）

- **看板** — 今日工单、运营概览、紧急告警、活动卡片、重点关注老人
- **工单** — 分类 Tab（紧急/上门/设备/完成）、值班分配、小鼋派单建议
- **活动** — 活动总览、签到管理、通知模板
- **档案** — 李奶奶服务档案（健康、风险、服务记录、联系人）

### 3.2 登录路径（社区人员）

```
login-welcome → login-role（选「我是社区人员」）
  → login-phone → login-profile → community/login-guide
  → community/dashboard
```

### 3.3 导航约定

与子女端共用 [`utils/navigate.ts`](../apps/mobile/src/utils/navigate.ts)：`COMMUNITY_TABS` + `reLaunch` 切换 Tab，详情页 `navigateTo`。

---

## 4. 数据与联动

- Mock 与老人端/子女端共享 **李奶奶**（`elder-001`），SOS 工单 `#SOS-018`
- 在告警详情页点击 **完成工单** 后：
  - 看板「待处理 / 紧急」计数减少
  - 紧急列表移除该 SOS 项
  - 工单从「紧急」Tab 移至「完成」

---

## 5. 本地运行与演示

```bash
cd apps/mobile
pnpm dev:h5
```

演示路径：开始使用 → **我是社区人员** → 完成登录 → 看板 → 点击「李奶奶 SOS」→ 完成工单 → 返回看板查看数字变化。

---

## 6. 已知限制与下一步

- 全 Mock，无真实 API / 地图 / 电话
- 档案 Tab 默认仅李奶奶，未做多老人列表
- 与子女端告警 Store 未双向同步（文案已对齐）

**建议下一步：** FastAPI 工单接口、社区站权限、与 MQTT 告警推送对接。

---

## 7. 参考

- HTML 原型：`yuanbanban_community_html_prototype/index.html`
- 子女端总结：[family-mobile-ui-summary-2026-05-24.md](./family-mobile-ui-summary-2026-05-24.md)
