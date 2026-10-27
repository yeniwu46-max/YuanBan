# 深翠健康 UI · 交付与验收记录

日期：2026-10-26。范围：老人、家人、社区三端及登录/详情，手机与桌面 H5、内置 H5 的 Android 演示 APK。没有发布公网，也没有覆盖原 HTML 原型。

## 交付物

- `output/yuanbanban-forest-h5-v0.2.0.zip`：可由静态 HTTP 服务托管的 Mock H5 包。
- `apps/mobile/dist/build/h5/`：同一 H5 构建目录。
- `output/apk/yuanbanban-forest-demo-v0.2.0.apk`：`cn.yuanbanban.demo`，versionCode 2，versionName `0.2.0-forest-demo`，沿用旧演示签名。
- `docs/ui-forest-design-system.md`：设计规范、组件职责和数据边界。
- `docs/decisions/001-forest-ui-integration.md`：依赖接入与 uni-app 兼容说明。
- 组件预览路由：`/#/pages/ui-preview/index`。

交付校验（SHA-256）：

```text
APK  D8A6F3E45AF3749A841BAFEAADFD563ADB58E13A9D4BE48E66CAE7704AAC0550
H5   FF3AF546D5B0817F23FB78A68FC7A5FFDB5C640F7BFFA9932E874E38CCAB2C63
```

关键截图位于 `output/playwright/`：`forest-elder-390.png`、`forest-family-390.png`、`forest-community-390.png`、三端 320/768/1024/1440 对应图片、`forest-workorders-desktop.png`、`forest-report-390.png`、`forest-report-1440.png`、`forest-components.png`、`forest-login-390.png`、`forest-sos-success.png`、`forest-api-error.png`、`forest-text-150.png`。Android 截图位于 `output/apk/yuanbanban-forest-android-*.png`。

## 已执行验证

| 检查 | 结果 / 范围 |
| --- | --- |
| 类型检查 | `pnpm typecheck` 通过；实际通过 npx pnpm 9.15.9 启动 |
| H5 构建 | Mock 与 API 模式均构建通过 |
| 趋势单元检查 | `node scripts/test-trends.mjs`，16 项断言通过 |
| 浏览器主要流程 | `scripts/ui-forest-acceptance.js`，52 项断言通过 |
| 页面巡检 | `scripts/ui-forest-route-audit.js`，32 个登录/主/详情页在 320px 无横向溢出、无未命名按钮、无 JS 运行时错误 |
| API 前端异常状态 | `scripts/ui-forest-api-states.js`，9 项通过；浏览器拦截式测试数据，不是线上后端联调 |
| 响应式 | 三端首页分别覆盖 320、390、768、1024、1440px；桌面工单表格与手机列表不重复 |
| 可访问性 | 导航/按钮键盘操作、Reka Tabs 方向键、通知开关空格键、处理结果单选键盘、弹层焦点移入与 Escape 恢复 |
| 放大与动态 | 390px 老人首页文字放大到 150% 未溢出；844×390 横屏与减少动态效果检查通过 |
| 颜色对比 | 正文/浅底 11.23:1，辅助/白底 5.21:1，白字/主绿 6.56:1，白字/深翠 11.91:1，暖提示 4.98:1，告警提示 5.17:1 |
| APK 签名 | v2 / v3 验证及 zipalign 通过；与旧 APK 证书 SHA-256 相同 |
| APK 升级 | Android API 36 模拟器从 versionCode 1 覆盖安装到 2 成功，未清除应用数据 |
| APK 交互 | 三角色冷启动、老人健康页往返及 SOS 取消、家人切换弹层与 Android 返回键、报告导航、社区工单导航通过；未发现应用进程 WebView / AndroidRuntime 错误 |

主要流程检查包含：三角色登录与单一角色导航、SOS 取消/提交、家人收到并处理告警、社区工单确认完成及已完成筛选、服药记录、心情记录、活动报名、通知规则跨页面保留、长辈切换后不复用另一位长辈的曲线、空搜索、离线提示。API 检查包含加载、过滤无效值、来源标注、同键缓存、空记录、503 错误及重试、401 回登录。

## 复现

在 `apps/mobile` 执行：

```powershell
npx --yes pnpm@9.15.9 install --frozen-lockfile
npx --yes pnpm@9.15.9 typecheck
$env:VITE_USE_API='false'
$env:NODE_OPTIONS='--max-old-space-size=768'
$env:GOMAXPROCS='2'
npx --yes pnpm@9.15.9 build:h5
```

在仓库根目录启动本地构建服务，再在另一个终端运行检查：

```powershell
python -m http.server 5182 --bind 127.0.0.1 --directory apps/mobile/dist/build/h5
```

```powershell
node scripts/test-trends.mjs
npx --yes --package @playwright/cli playwright-cli -s=ybb-accept open http://127.0.0.1:5182 --browser msedge
npx --yes --package @playwright/cli playwright-cli -s=ybb-accept run-code --filename scripts/ui-forest-acceptance.js --raw
npx --yes --package @playwright/cli playwright-cli -s=ybb-accept run-code --filename scripts/ui-forest-route-audit.js --raw
```

API 异常检查需要单独构建：`VITE_USE_API=true`、`VITE_API_BASE=http://127.0.0.1:5183`，以 `UNI_OUTPUT_DIR` 指定独立目录，并将此目录提供在 5183 端口；运行 `scripts/ui-forest-api-states.js`。脚本仅在该浏览器中拦截 `/api/v1/**`，不调用真实用户数据或发送真实求助。

APK 使用原脚本构建，保持本地旧签名文件，不要删除 `apps/android/.local/demo.keystore`：

```powershell
./scripts/build-android-demo.ps1 -WebDist ./apps/mobile/dist/build/h5 -OutputPath ./output/apk/yuanbanban-forest-demo-v0.2.0.apk
./scripts/test-android-forest.ps1 -Serial emulator-5580
```

## 边界与已知事项

- APK 是内置 Mock 演示版，不是真实医疗监护或救援系统。演示操作仅在当前运行会话内联动；跨设备、刷新后的状态持久化依赖后端。
- 本轮未执行真实短信、视频通话、定位导航、硬件接入、支付、生产后端烟测或公网发布。未承诺小程序构建发布验收。
- 实机厂商 WebView、全面屏手势和系统字体差异仍需用户设备复核；模拟器验证不能替代全部机型验收。
- 最新指标接口没有测量时间字段时，摘要不伪造实时测量时间；详情趋势展示接口实际记录时间。
- API 模式部分原有未完成能力保留演示反馈；接口失败保留旧内容时有统一提示。趋势不会用 Mock 结果冒充真实测量。
- 构建保留 Reka `useId` 可选回退和旧混合导入告警，详情见 ADR；这些不是类型错误或运行时异常。
- 此机器同时运行浏览器、模拟器和编译曾出现系统内存分配失败；关闭测试模拟器后复核通过。建议按顺序运行构建、浏览器验收、APK 验收。UIAutomator 冷启动期间偶发空根节点，测试脚本重试后继续；这不属于应用 WebView 错误。
- 采用前端工程技能落实共享组件与可访问性检查；文档技能要求记录兼容取舍及上述验证边界。
