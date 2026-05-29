# 宝塔面板部署 wuyeni.cn

实例名含 **宝塔Linux面板** 时，**不要**使用 `full-deploy.sh`（会与宝塔自带的 Nginx/Certbot 冲突）。

## 一、Workbench 只部署 API

```bash
curl -fsSL https://raw.githubusercontent.com/yeniwu46-max/YuanBan/master/infra/deploy/aliyun/bt-panel-api-only.sh -o /tmp/bt-api.sh || {
  git clone https://github.com/yeniwu46-max/YuanBan.git /opt/yuanbanban
  cp /opt/yuanbanban/infra/deploy/aliyun/bt-panel-api-only.sh /tmp/bt-api.sh
}
chmod +x /tmp/bt-api.sh
sudo WECHAT_APP_ID=wxc8249223ec70d85a \
  WECHAT_APP_SECRET=你的AppSecret \
  bash /tmp/bt-api.sh
```

本机应输出 `{"status":"ok"}` 或类似 JSON。若失败：

```bash
journalctl -u yuanbanban-api -n 50 --no-pager
curl -v http://127.0.0.1:8000/health
```

## 二、宝塔面板配置 API（浏览器）

登录宝塔（一般是 `http://47.102.108.137:8888` 或面板提供的地址）。

### 1. 放行端口

**安全** → 防火墙：放行 **80、443**（22、8888 按需）。

阿里云 **安全组** 同样放行 80、443。

### 2. 添加站点

**网站** → **添加站点**：

| 项 | 值 |
|----|-----|
| 域名 | `api.wuyeni.cn` |
| 根目录 | 任意（仅反代可随便填） |
| PHP | 纯静态或关闭 PHP |

### 3. 反向代理

站点 `api.wuyeni.cn` → **设置** → **反向代理** → 添加：

| 项 | 值 |
|----|-----|
| 代理名称 | yuanbanban-api |
| 目标 URL | `http://127.0.0.1:8000` |
| 发送域名 | `$host` |

保存后访问 `http://api.wuyeni.cn/health` 应返回 JSON（非 502）。

### 4. SSL 证书

站点 **设置** → **SSL** → **Let's Encrypt** → 勾选 `api.wuyeni.cn` → 申请。

开启 **强制 HTTPS**。

### 5. 验证

```powershell
curl.exe https://api.wuyeni.cn/health
```

或浏览器：`https://api.wuyeni.cn/docs`

## 三、H5 站点 app.wuyeni.cn

### 1. DNS

阿里云 DNS 为 `wuyeni.cn` 添加：

| 主机记录 | 类型 | 记录值 |
|----------|------|--------|
| `app` | A | `47.102.108.137` |

### 2. 本机构建

确认 `apps/mobile/.env.production`：

```env
VITE_API_BASE=https://api.wuyeni.cn
VITE_USE_API=true
```

构建：

```powershell
cd apps\mobile
pnpm install
pnpm build:h5
```

产物目录：`apps\mobile\dist\build\h5`。

### 3. 宝塔静态站

宝塔 **网站** → **添加站点**：

| 项 | 值 |
|----|-----|
| 域名 | `app.wuyeni.cn` |
| 根目录 | 上传后的 H5 目录 |
| PHP | 纯静态或关闭 PHP |

把 `dist/build/h5` 内的文件上传到该站点根目录。

若宝塔未自动处理前端路由，站点 **配置文件** 的 `location /` 使用 SPA 回退：

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

站点 **SSL** → **Let's Encrypt** → 勾选 `app.wuyeni.cn` → 申请，并开启 **强制 HTTPS**。

验证：

```powershell
curl.exe https://app.wuyeni.cn/
```

打开浏览器开发者工具，接口请求应指向 `https://api.wuyeni.cn`。

## 四、常见错误

| 现象 | 原因 | 处理 |
|------|------|------|
| HTTPS「连接已关闭」 | 443 无证书或未监听 | 在宝塔申请 SSL，安全组放行 443 |
| HTTP 502 | 反代目标错或 API 未启动 | `systemctl status yuanbanban-api`，确认反代为 `127.0.0.1:8000` |
| 本机 `127.0.0.1:8000` 不通 | Python/依赖失败 | 看 `journalctl -u yuanbanban-api` |
| `app.wuyeni.cn` 无法解析 | 缺少 `app` A 记录 | 阿里云 DNS 添加 `app -> 47.102.108.137` |
| H5 刷新 404 | 未配置 SPA 回退 | 宝塔站点配置 `try_files $uri $uri/ /index.html;` |

## 五、微信

公众平台 → request 合法域名：`https://api.wuyeni.cn`
