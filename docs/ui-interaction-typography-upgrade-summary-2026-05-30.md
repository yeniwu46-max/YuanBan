# UI 交互与排版升级 — 阶段沉淀总结

**日期：** 2026-05-30  
**范围：** 三端（老人 / 子女 / 社区）动效令牌、HeroTitle/BigButton 组件化、全量按动反馈、排版扫尾、关键操作 loading 接线

---

## 1. 本阶段完成一览

| 模块 | 内容 | 状态 |
|------|------|------|
| 动效令牌 | `styles/motion.scss`：`pressable` / `pressable-sm` / `fadeUp` + reduced-motion | ✅ |
| 排版工具类 | 全局 `.text-nowrap` / `.text-balance` / `.text-keep-all` / `.title-row` | ✅ |
| HeroTitle 组件 | 统一 hero 标题区，替换 6 处重复 scoped 样式 | ✅ |
| BigButton 完整化 | 组件内迁入 tone 样式；loading 改为 spinner +「处理中…」 | ✅ |
| 全量按动 | iconbtn、row-card、quick-card、QuickActionGrid、companion prompt/send-btn | ✅ |
| 三端排版扫尾 | 子女 / 老人 / 社区四 Tab，分场景 nowrap vs 2-line | ✅ |
| Loading 接线 | SOS 上报、关怀任务完成、切换 mood | ✅ |
| 文档 | [`family-mobile-ui-summary-2026-05-24.md`](./family-mobile-ui-summary-2026-05-24.md) 新增第 8 章「交互规范」 | ✅ |
| 类型检查 | `pnpm vue-tsc --noEmit` 通过 | ✅ |

---

## 2. 核心组件与文件

### 2.1 新增

| 文件 | 说明 |
|------|------|
| `apps/mobile/src/components/HeroTitle.vue` | 统一 hero 标题：`title` / `subtitle` / `pill` / `clamp` / `nowrap` |
| `apps/mobile/src/styles/motion.scss` | 动效令牌与 pressable / fadeUp mixin |

### 2.2 重点改造

| 文件 | 变更 |
|------|------|
| `BigButton.vue` | 完整 tone 样式内聚；loading 显示 spinner +「处理中…」 |
| `styles.scss` | 排版工具类、全局按动、`.red-pill` / `.warm-pill`、deprecated `.bigbtn` alias |
| `CareTaskItem.vue` | 新增 `completing` prop，任务完成时展示 spinner |
| `BoundElderCard.vue` / `home/index.vue` | 原生 bigbtn 改为 `<BigButton>` |
| `stores/care.ts` | 新增 `completingTaskId`，`completeTask` 改为 async |
| `stores/companion.ts` | 新增 `moodLoading`，`setMood` 带 guard |
| `stores/sos.ts` | `triggering` 绑定 SOS 页 BigButton loading |

### 2.3 HeroTitle 替换点

- `GuardScoreCard.vue`、`StatsHero.vue`
- `pages/family/report/index.vue`、`care/index.vue`、`settings/index.vue`
- `pkg-family-detail/family/alert/index.vue`（`nowrap` 单行 ellipsis）

---

## 3. 交互设计约定

### 3.1 按动分级

| 级别 | 元素 | Mixin |
|------|------|-------|
| 主 CTA | BigButton（green/red/warm） | 组件内置 `pressable` |
| 次要 CTA | BigButton white、`.quick` | `pressable` / `pressable-sm` |
| 列表卡片 | `button.item`、`button.row-card` | `pressable` / `pressable-sm` |
| 图标/Tab | `.iconbtn`、`.tabbar-btn`、`.mood`、prompt | `pressable-sm` |
| 静态展示 | `view.row-card.static` | 不加 |

### 3.2 排版策略

| 场景 | 策略 | 工具 |
|------|------|------|
| pill、Tab、stat label、告警标题 | 单行 + ellipsis | `.text-nowrap` / HeroTitle `nowrap` |
| 欢迎语、报告 headline | 最多 2 行 | `.text-balance` / HeroTitle `clamp=2` |
| desc、解读文案 | 中文词内不断行 | `.text-keep-all` |

### 3.3 Loading 接线

| 操作 | Store 字段 | UI 绑定 |
|------|-----------|---------|
| SOS 上报 | `sos.triggering` | BigButton `:loading` |
| 关怀任务完成 | `care.completingTaskId` | CareTaskItem `:completing` |
| 切换 mood | `companion.moodLoading` | mood 按钮 `:disabled` |

原则：loading 与 `uni.showToast` 互斥；失败后 loading 复位，按钮恢复可点。

---

## 4. 三端覆盖范围

### 老人端
- `home/index.vue`：hero-enter、联系家人 BigButton、family-status nowrap
- `companion/index.vue`：prompt/send-btn/suggestion 按动；mood loading；hero 排版
- `health/index.vue`、`service/index.vue`：summary 文案 keep-all / balance

### 子女端
- `guardian/report/care/settings`：HeroTitle、stat 单行、Tab nowrap
- `alert/index.vue`：告警标题单行 ellipsis

### 社区端
- `dashboard/workorders/activity/profile`：StatsHero、QuickActionGrid 按动、stat 单行

---

## 5. 验证结果

| 检查项 | 结果 |
|--------|------|
| `pnpm vue-tsc --noEmit` | ✅ 通过 |
| `pnpm build:mp-weixin` | ⚠️ TabShell.vue 使用 `<component :is>`，小程序编译器不支持（预存 issue，待重构为条件渲染） |
| H5 开发端口 | 5180（避免与 5173 冲突） |

---

## 6. 手动验收清单（抽测）

**老人端：** 首页 BigButton 按动；companion mood 切换 loading；prompt/send-btn 反馈；320px 无单字换行  
**子女端：** 告警标题 ellipsis；关怀任务完成 spinner；报告 Tab 单行  
**社区端：** 工单列表按动；QuickActionGrid 反馈；档案 stat 不换行  
**SOS：** 「立即求助」出现「处理中…」且不可重复点

完整清单见 [`family-mobile-ui-summary-2026-05-24.md` 第 8.7 节](./family-mobile-ui-summary-2026-05-24.md#87-手动验收清单)。

---

## 7. 已知限制与下一步

**当前限制**
- TabShell 动态组件暂不支持微信小程序 build
- 部分操作仍为 Toast 演示（视频、电话、上传等）
- 自动化 Playwright 截图验收未纳入本阶段

**建议下一步**
1. TabShell 重构为 `v-if` 条件渲染，解除小程序 build 阻塞
2. 按 [`e2e-acceptance.md`](./e2e-acceptance.md) 跑通端到端冒烟
3. 微信小程序真机抽测（守护首页 + 社区看板）

---

## 8. 相关文档

- [子女端 UI 总结 + 交互规范（第 8 章）](./family-mobile-ui-summary-2026-05-24.md)
- [移动端优化与 API 接入总结（2026-05-29）](./mobile-optimization-api-summary-2026-05-29.md)
- [API 接入清单](./api-integration-checklist.md)

---

*本文档随 2026-05-30 UI 交互与排版升级 v2 迭代沉淀，供团队接续开发与答辩演示使用。*
