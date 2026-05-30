# 鼋伴伴子女端 uni-app UI 开发总结

**日期：** 2026-05-24  
**范围：** `apps/mobile` 子女端 Mock 演示版（H5 / 微信小程序可构建）

---

## 1. 今日目标与完成情况

| 阶段 | 内容 | 状态 |
|------|------|------|
| 阶段 A | 类型、Mock、Pinia、登录分流、路由骨架 | ✅ 完成 |
| 阶段 B | 守护 / 告警 / 报告 / 关怀 / 设置 五页 UI | ✅ 完成 |
| 阶段 C | 老人切换联动、告警回写、空态/加载态 | ✅ 完成 |
| 体验修复 | 移动端 H5 跳转优化（导航工具 + Tab reLaunch） | ✅ 完成 |

当前子女端已可在 H5 完整演示业务闭环，**尚未接后端 API**。

---

## 2. 工程结构（子女端相关）

```
apps/mobile/src/
├── composables/useFamilyElderContext.ts   # 当前老人上下文
├── utils/navigate.ts                      # 统一导航（Tab/详情/登录）
├── types/family.ts
├── mock/family.ts
├── stores/
│   ├── session.ts      # 角色：老人 / 家人 / 社区
│   ├── family.ts       # 子女账号
│   ├── guardian.ts     # 绑定老人 + 切换 + 守护摘要
│   ├── alert.ts        # 告警列表与处理
│   ├── care.ts         # 关怀任务与通知规则
│   └── familyReport.ts # 健康报告与异常汇总
├── components/family/  # 子女端专用组件
└── pages/family/       # 子女端页面
    ├── guardian/       # 守护首页（Tab）
    ├── alert/          # 告警详情
    ├── report/         # 健康报告（Tab）
    ├── care/           # 关怀中心（Tab）
    ├── settings/       # 设置绑定（Tab）
    └── login-guide/    # 子女端登录引导
```

---

## 3. 页面与导航

### 3.1 子女端 Tab（4 个）

- **守护** — 安全状态、风险提醒、健康摘要、小鼋建议
- **报告** — 日/周/月报告、趋势、异常汇总
- **关怀** — 快捷关怀、问候语、相册、关怀任务
- **设置** — 绑定老人、通知规则、隐私权限

### 3.2 登录路径（家人）

```
login-welcome → login-role（选「我是家人」）
  → login-phone → login-profile → family/login-guide
  → family/guardian
```

### 3.3 导航约定（`utils/navigate.ts`）

| 场景 | API | 说明 |
|------|-----|------|
| 底部 Tab 切换 | `reLaunch` | 清空页面栈，移动端 H5 更稳定 |
| 告警详情 | `navigateTo` | 支持返回守护首页 |
| 登录步骤 | `redirectTo` | 线性替换，失败降级 `reLaunch` |
| 登录完成 | `reLaunch` | 进入主 Tab，避免栈残留 |

---

## 4. 数据与联动

- Mock 对齐老人端「李奶奶」，并补充「王爷爷」用于切换演示
- 告警处理（已处理 / 稍后处理）会回写：
  - 守护首页 **风险条数**
  - 报告页 **异常记录标签**
- 顶栏 `ElderSwitcher` 切换老人后，守护 / 报告 / 关怀 / 设置 数据联动刷新
- 切换时有约 120ms 骨架屏 + Toast 提示

---

## 5. 本地运行

```bash
cd apps/mobile
pnpm install   # 首次
pnpm dev:h5    # H5：http://localhost:5173/
pnpm build:mp-weixin
pnpm typecheck
```

演示路径：开始使用 → **我是家人** → 完成登录 → 守护首页。

---

## 6. 已知限制与下一步

**当前限制**

- 全 Mock 数据，无真实 API / WebSocket
- 视频、电话、上传等为 Toast 演示
- 社区端仅有 HTML 原型，未做 uni-app
- 仓库尚未配置 Git remote 时需本地先 `git remote add`

**建议下一步（优先级）**

1. FastAPI 后端 + 告警 / 老人 / 报告接口
2. 子女端 API 替换 Mock（guardian、alert、care、report stores）
3. MQTT 设备模拟器 + 告警推送
4. 微信小程序真机订阅消息

---

## 7. 参考文档

- [产品规划](./yuanbanban-product-plan.md)
- [技术选型](./tech-stack-decision.md)
- HTML 原型：`yuanbanban_family_html_prototype/`、`yuanbanban_three_terminal_portal/`

---

*本文档随 2026-05-24 子女端 uni-app UI 迭代沉淀，供团队接续开发与答辩演示使用。*

---

## 8. 交互规范（2026-05-30 补充）

> 本章节覆盖 UI 交互升级（v2 规划）后的设计约定，适用于三端（老人 / 子女 / 社区）所有页面。

### 8.1 动效令牌

文件：`apps/mobile/src/styles/motion.scss`

| 变量 | 值 | 用途 |
|------|----|------|
| `$ease-press` | `cubic-bezier(0.2,0,0,1)` | 按下弹性 |
| `$ease-enter` | `cubic-bezier(0,0,0.2,1)` | 卡片进入 |
| `$duration-press` | `110ms` | 按动时长 |
| `$duration-enter` | `220ms` | 进入动画时长 |
| `$scale-press` | `0.965` | 大按钮/卡片按下缩放 |
| `$scale-press-sm` | `0.975` | 小按钮/icon 按下缩放 |

**使用约定：**
- 主 CTA（BigButton）、列表卡片（`.item`、`.quick`）使用 `@include pressable`（scale 0.965）
- 图标按钮（`.iconbtn`）、小芯片（`.tabbar-btn`）、send-btn、prompt 使用 `@include pressable-sm`（scale 0.975）
- Tab 导航仅对图标元素做 transform，不改变整行高度
- 已在 `@media (prefers-reduced-motion: reduce)` 中降级为 opacity 过渡

### 8.2 排版工具类

全局可用，来自 `styles.scss`：

| Class | 效果 | 适用场景 |
|-------|------|---------|
| `.text-nowrap` | 单行 + ellipsis | pill、Tab label、stat label、告警标题、快捷入口 |
| `.text-balance` | `text-wrap: balance` + fallback | 欢迎语、hero 短标题（1-2 句） |
| `.text-keep-all` | `word-break: keep-all` | 描述文案、解读段落、聊天气泡说明 |
| `.title-row` | flex 行 + min-width:0 | section 标题行，防标题文字溢出 |
| `.metric-inline` | flex nowrap 指标行 | 数值 + 单位并排，防换行 |

**分场景溢出策略：**
- **单行**：pill、Tab、stat label（≤6 字）、告警标题 → `text-nowrap`
- **最多 2 行**：欢迎语、报告/守护 headline → `HeroTitle` 组件（`clamp=2`，默认值）
- **自然换行**：desc、解读文案 → `text-keep-all`（中文词内不断行）

### 8.3 HeroTitle 组件

文件：`apps/mobile/src/components/HeroTitle.vue`

```vue
<HeroTitle
  title="标题文字"
  subtitle="副标题（可选）"
  pill="💚 pill文案（可选）"
  pill-class="warm-pill"
  :clamp="2"
  :nowrap="false"
/>
```

| Prop | 类型 | 说明 |
|------|------|------|
| `title` | `string` | 必填，主标题 |
| `subtitle` | `string?` | 副标题（muted，1.5行高） |
| `pill` | `string?` | pill 文案 |
| `pill-class` | `string?` | pill 颜色变体：`red-pill`、`warm-pill` |
| `nowrap` | `boolean` | 强制单行 + ellipsis（告警场景） |
| `clamp` | `1\|2` | 最大行数（默认 2） |

**已替换的页面：** GuardScoreCard、StatsHero、family/report、family/care、family/settings、family/alert

### 8.4 BigButton 规范

文件：`apps/mobile/src/components/BigButton.vue`

```vue
<BigButton
  tone="green"
  :loading="store.submitting"
  :disabled="false"
  @click="doAction"
>
  按钮文字
</BigButton>
```

| Prop | 值 | 说明 |
|------|----|------|
| `tone` | `green`（默认）/ `red` / `warm` / `white` | 颜色变体 |
| `loading` | `boolean` | 显示 spinner + 「处理中…」，自动禁用重复点击 |
| `disabled` | `boolean` | 半透明，不可点击 |

**loading 接线的关键操作：**

| 操作 | Store 字段 | 绑定方式 |
|------|-----------|---------|
| SOS 上报 | `sos.triggering` | `:loading="sos.triggering"` |
| 关怀任务完成 | `care.completingTaskId` | `CareTaskItem` `:completing` prop |
| 切换 mood | `companion.moodLoading` | mood 按钮 `:disabled` + `.mood--loading` |

**原则：** loading 与 `uni.showToast` 互斥；失败后 loading 复位，按钮恢复可点。

### 8.5 可点击面分级

| 级别 | 元素 | Mixin |
|------|------|-------|
| 主 CTA | BigButton（green/red/warm） | 组件内置 `pressable` |
| 次要 CTA | BigButton（white）、快捷按钮（`.quick`） | `pressable` / `pressable-sm` |
| 列表卡片 | `button.item`、`button.row-card`、`.quick-card` | `pressable` / `pressable-sm` |
| 图标/Tab | `.iconbtn`、`.tabbar-btn`、`.mood`、prompt | `pressable-sm` |
| 静态展示 | `view.row-card.static`、纯文字区 | 不加 |

### 8.6 跨端 CSS 兼容说明

| 属性 | H5 | 微信小程序 |
|------|----|-----------|
| `text-wrap: balance` | ✅ 支持 | ❌ 不支持，已加 `overflow-wrap: break-word` fallback |
| `will-change: transform` | ✅ | 忽略，不影响功能 |
| `:deep()` 穿透 | ✅ | ✅ |
| `<component :is>` 动态组件 | ✅ | ❌ 已知限制，TabShell.vue 小程序 build 会报错（待重构为条件渲染） |

### 8.7 手动验收清单

按角色各抽 2 个 Tab 检查：

**老人端**
- [ ] 首页 hero「和小鼋说话」按钮按下有 scale 反馈
- [ ] 联系家人卡片 3 个按钮按下有反馈
- [ ] companion 页 mood 按钮切换时出现 disabled 状态（处理中）
- [ ] companion 页 prompt 按下有反馈；send-btn 有反馈
- [ ] 320px：mood label、quick-title 无单字换行
- [ ] 390px：hero-copy 最多 2 行

**子女端**
- [ ] 守护首页列表项按下有 scale 反馈
- [ ] 告警标题单行 ellipsis（长标题）
- [ ] 报告页日/周/月 Tab 单行不换行
- [ ] 关怀任务点击「完成」出现 spinner，完成后恢复
- [ ] 设置页 stat card（通知规则/紧急权限/设备协助）单行

**社区端**
- [ ] 工单列表按下有 scale 反馈
- [ ] QuickActionGrid 格子按下有反馈
- [ ] 档案页 stat（健康分/告警/服务/活动）单行不换行
- [ ] 工单分类 Tab 单行不换行

**SOS 专项**
- [ ] SOS 页「立即求助」点击后出现「处理中…」spinner，且「误触取消」变为 disabled
- [ ] 触发成功后 loading 消失，不可重复触发

**技术门禁**
- [ ] `pnpm vue-tsc --noEmit` → exit 0 ✅
- [ ] `pnpm build:mp-weixin` → 已知限制：TabShell.vue 动态组件在小程序中不支持（待修复）；其余 SCSS/TS 无报错
