# ADR-001：在现有 uni-app 内统一三端 UI

状态：已采用。日期：2026-10-26。

## 背景

保留 Vue 3、TypeScript、Pinia、路由和现有 FastAPI 能力，同时需要 Wot 移动组件、Lucide 图标、shadcn-vue 桌面交互。另起 Web 工程会造成两套业务状态和 APK 包装维护；直接套三套默认样式会损害一致性。

## 决策

1. 保持现有 uni-app 4.29 / Vue 3.4.21 基线，统一 `AppPage`、导航和语义变量。
2. Wot 固定 1.14.0，Sass 固定 1.78.0；锁定 Pinia 2.1.7、Reka UI 2.0.0 及兼容的 VueUse / Vue Router，避免间接升级到要求 Vue 3.5 的依赖。
3. Lucide 使用固定图标映射，不运行时导入全库。
4. shadcn-vue 选取 Table、Tabs、Badge、Skeleton 源码本地改造，保留 Reka 交互、来源和许可，改用 SCSS，不加 Tailwind 重置。Web 组件放在 H5 条件编译边界。
5. H5 采用 esbuild 压缩；当前机器上原压缩路径曾耗尽内存，esbuild 能完成构建。没有因此关闭类型检查。

## 兼容处理及代价

uni-app 当前内置 Vue H5 runtime 的 slot `_` 标记为只读，而 Reka 的转发插槽会更新它，导致运行时异常。`build/uni-slot-compat.ts` 只在指定 runtime 中回移可写标记修复；依据 Vue 3.4.38 的 [componentSlots.ts](https://github.com/vuejs/core/blob/v3.4.38/packages/runtime-core/src/componentSlots.ts)。匹配代码变化时主动报错，升级 uni-app 后应重新评估并移除此补丁。

Vite 为 Reka 使用真实路径别名，解决 uni-app 的 symlink 解析与 pnpm 隔离依赖的冲突。不编辑 `node_modules`，避免每次安装丢失修复。

当前构建保留两类非阻塞告警：Reka 可选 `useId` 在 Vue 3.4 不存在（使用其内部回退）；项目原有 API mapper / familyService 静态与动态导入混用。没有屏蔽告警。已以真实浏览器验证 Tabs 的键盘行为及弹层焦点。

Android 继续内置 H5 的 HTTPS appassets 方案。原签名、包名不变，版本递增；返回键先分发可取消的页面事件关闭弹层，再执行 WebView 历史返回。没有添加原生 JavaScript 对象桥或敏感权限。

## 未选方案

- 新建 React / 独立 Vue Web：本轮不迁移业务栈。
- 全站套用 shadcn + Tailwind：会与 uni / Wot 基础样式重叠，且小程序边界不清晰。
- 为装饰效果生成随机健康曲线：不能反映已有记录，已拒绝。
- 全量升级 uni-app / Vue 3.5：扩大兼容与发布风险，留给单独迁移验收。
