# 鼋伴伴 Android 演示包

将 `apps/mobile` 的 uni-app H5 构建资源内置到 Android WebView 中，不依赖电脑的 localhost 服务。此包不是 uni-app App-plus 原生编译，也不新增硬件、短信、视频通话或原生推送能力。

## 安装

- 文件：`output/apk/yuanbanban-jade-demo.apk`。
- 应用名：鼋伴伴·演示版；包名：`cn.yuanbanban.demo`。
- 版本：`0.1.0-jade-demo`；最低 Android 8.0（API 26）。建议保持 Android System WebView 更新。
- 允许你用于安装此 APK 的文件管理器或浏览器「安装未知应用」权限，然后打开文件安装。
- 启动后可在欢迎页选择老人、家人、社区身份。验证码和设备绑定步骤均为原有演示流程。
- 本包使用 Mock 数据。健康指标、设备状态与告警不用于真实监护或紧急求助；不包含在线后台。
- UI 升级范围仍为老人端首页与底栏，其余页面是现有版本。

## 复现构建

先用 `VITE_USE_API=false` 构建 H5。SDK 需包含 `platforms/android-36` 与 `build-tools/36.0.0`；本机需安装 Java JDK。无需 Gradle 或 HBuilderX 云打包账号。

```powershell
$env:VITE_USE_API = 'false'
cd apps/mobile
pnpm install
pnpm typecheck
pnpm build:h5 --minify esbuild
cd ../..
.\scripts\build-android-demo.ps1 -WebDist .\apps\mobile\dist\build\h5
```

构建脚本使用 SDK 的 aapt2、javac、d8、zipalign、apksigner。签名是本地演示证书，不适合上架：`apps/android/.local/demo.keystore` 已加入忽略规则。保留该文件可签名兼容后续更新；丢失后需卸载旧演示包再安装。

## 封装策略

按照 [Android 本地 Web 内容文档](https://developer.android.com/develop/ui/views/layout/webapps/load-local-content) 的 HTTPS 同源加载思路，原生资源拦截器只服务 `https://appassets.androidplatform.net/` 下的内置资源。禁用文件访问、内容 URI 访问与混合内容；无 JavaScript 原生桥、相机、定位、录音和直接拨号权限。外部网页交由浏览器，电话交由拨号界面，由用户确认。

页面资源、DEX、APK 结构与 [签名校验](https://developer.android.com/tools/apksigner) 均在本机完成，不上传用户项目。

## 本次验证（2026-10-04）

- H5 类型检查与 esbuild 构建通过；保留现有 Sass 和动态导入警告。
- APK v2/v3 签名、ZIP 对齐与全部 128 个网页资源路径检查通过。
- Android 16（API 36）独立模拟器安装、冷启动通过。
- 老人端演示登录、新版首页、健康页与返回首页通过。
- 家人端演示登录、守护首页；社区端演示登录、服务工作台通过。
- 修正 Windows 打包工具生成的反斜杠资源路径后，最终测试进程未发现 WebView 或 AndroidRuntime 错误。
- 最低版本由 manifest 声明为 Android 8.0；未进行 Android 8.0 真机测试，不包含后端或真实 SOS 联调。

可用 `scripts/test-android-demo.ps1 -Serial <测试模拟器序列号>` 重跑界面冒烟测试。截图位于 `output/apk/`。
