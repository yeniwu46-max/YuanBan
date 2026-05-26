# 微信小程序构建与联调

## 1. 配置 AppID

1. 复制 `apps/mobile/.env.mp-weixin.example` → `.env.mp-weixin`
2. 填入 `VITE_MP_APPID`（微信公众平台 AppID）
3. 填入 `VITE_API_BASE`（**必须 HTTPS**，与后端一致）

构建脚本会尝试把 `VITE_MP_APPID` 写入 `src/manifest.json`（若为空则保持占位，开发者工具可选用测试号）。

## 2. 构建

```powershell
cd apps/mobile
.\scripts\build-mp-weixin.ps1
```

或：

```powershell
pnpm build:mp-weixin
```

产物目录：`apps/mobile/dist/build/mp-weixin`

## 3. 微信开发者工具

1. 导入项目 → 选择上述目录
2. AppID：与 `.env.mp-weixin` 一致，或临时选「测试号」
3. 详情 → 本地设置：开发阶段可勾选「不校验合法域名」（与 `urlCheck: false` 一致）

## 4. 真机预览

在微信公众平台配置 **request 合法域名** → `https://你的API域名`  
确保后端已部署且 `VITE_USE_API=true`。

## 5. 与 H5 共用后端

| 角色 | Header |
|------|--------|
| 老人 | `X-Role: elder` `X-User-Id: user-elder-001` |
| 子女 | `X-Role: family` `X-User-Id: family-001` |
| 社区 | `X-Role: community` `X-User-Id: community-001` |

0531 前 JWT 未接入，沿用上述演示头。

## 6. 0531 演示路径

1. 老人端：首页 → SOS → 立即求助  
2. 子女端：守护 → 查看告警 → 处理  
3. 社区端：工单 → 完成 SOS 工单  
