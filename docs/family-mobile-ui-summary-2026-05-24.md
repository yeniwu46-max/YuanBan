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
