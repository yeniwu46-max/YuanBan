# wuyeni.cn 上线清单

| 项 | 值 |
|----|-----|
| 服务器 IP | `47.102.108.137` |
| API 域名 | `https://api.wuyeni.cn` |
| H5 域名 | `https://app.wuyeni.cn` |
| 小程序 AppID | `wxc8249223ec70d85a` |

## 一、阿里云 DNS（必做）

控制台 → **云解析 DNS** → 域名 `wuyeni.cn` → 添加记录：

| 主机记录 | 类型 | 记录值 |
|----------|------|--------|
| `api` | A | `47.102.108.137` |
| `app` | A | `47.102.108.137` |

生效后本机执行 `ping api.wuyeni.cn` 和 `ping app.wuyeni.cn` 应显示 `47.102.108.137`。

## 二、安全组

放行：**22、80、443**（8000 可选，上线后可关）。

## 三、服务器部署

### 若实例是「宝塔Linux面板」

**不要用**下面的 `full-deploy.sh`，改看 **[deploy-bt-panel.md](./deploy-bt-panel.md)**（只装 API + 在宝塔里配反代和 SSL）。

### 纯 Ubuntu/Debian（无宝塔）

**轻量/ECS → 远程连接 → Workbench** → 登录后粘贴执行：

```bash
curl -fsSL https://raw.githubusercontent.com/yeniwu46-max/YuanBan/master/infra/deploy/aliyun/full-deploy.sh -o /tmp/full-deploy.sh
chmod +x /tmp/full-deploy.sh
sudo DOMAIN=api.wuyeni.cn CERTBOT_EMAIL=yeniwu46@gmail.com \
  WECHAT_APP_ID=wxc8249223ec70d85a \
  WECHAT_APP_SECRET=你的AppSecret \
  bash /tmp/full-deploy.sh
```

> **注意**：`CERTBOT_EMAIL` 必须是完整邮箱（例如 `xxx@gmail.com`），不能写成 `xxx@gmail`。

成功应输出 `https://api.wuyeni.cn/health` 的 JSON。

若 GitHub 拉取慢，可改用：

```bash
git clone https://github.com/yeniwu46-max/YuanBan.git /opt/yuanbanban
cd /opt/yuanbanban/infra/deploy/aliyun
chmod +x full-deploy.sh
sudo DOMAIN=api.wuyeni.cn bash full-deploy.sh
```

## 四、微信公众平台

1. [mp.weixin.qq.com](https://mp.weixin.qq.com/) → 开发 → 开发管理 → 开发设置  
2. **服务器域名 → request 合法域名** 添加：`https://api.wuyeni.cn`  
3. 保存（每月修改次数有限）

## 五、本机构建 H5 和小程序

H5：

```powershell
cd apps\mobile
pnpm install
pnpm build:h5
```

上传 `apps\mobile\dist\build\h5` 内文件到宝塔 `app.wuyeni.cn` 站点根目录。

小程序：

```powershell
cd apps\mobile
pnpm build:mp-weixin
```

微信开发者工具 → 导入 `apps\mobile\dist\build\mp-weixin` → AppID `wxc8249223ec70d85a` → 上传/预览。

## 六、验证

- 浏览器：`https://api.wuyeni.cn/docs`  
- H5：`https://app.wuyeni.cn/`
- 小程序：老人 SOS → 子女/社区告警与工单变化  
