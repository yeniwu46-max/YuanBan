# 阿里云部署指南（公网 IP：47.102.108.137）

## 重要说明

| 用途 | 能否只用 IP |
|------|-------------|
| 浏览器 / curl 测 API | 可以：`http://47.102.108.137:8000/health` |
| **微信小程序真机** | **不行**，必须 **域名 + HTTPS**，并在微信后台登记合法域名 |

建议在同一阿里云账号 **购买域名**（约几十元/年），增加解析：`api` → `47.102.108.137`。

---

## 第一步：安全组放行端口

阿里云控制台 → **轻量应用服务器 / ECS** → 你的实例 → **防火墙 / 安全组**：

| 端口 | 用途 |
|------|------|
| 22 | SSH 登录 |
| 80 | HTTP（申请证书、跳转 HTTPS） |
| 443 | HTTPS（小程序正式用） |
| 8000 | 临时直连 API（调试用，上线后可关） |

来源建议：演示期 `0.0.0.0/0`；生产可收紧。

---

## 第二步：SSH 登录服务器

Windows PowerShell（把 `root` 换成你的登录名）：

```powershell
ssh root@47.102.108.137
```

首次登录按提示确认指纹。

---

## 第三步：一键部署 API（无 Docker）

在服务器上执行：

```bash
apt-get update && apt-get install -y git
git clone https://github.com/yeniwu46-max/YuanBan.git /opt/yuanbanban
cd /opt/yuanbanban/infra/deploy/aliyun
chmod +x setup-api.sh
sudo bash setup-api.sh
```

验证（在你自己电脑浏览器）：

```text
http://47.102.108.137:8000/health
http://47.102.108.137:8000/docs
```

应看到 `status: ok`。

---

## 第四步：购买域名并解析（小程序必需）

1. 阿里云 → **域名** → 注册域名，例如 `yuanbanban.cn`
2. **解析设置** → 添加记录：
   - 记录类型：`A`
   - 主机记录：`api`
   - 记录值：`47.102.108.137`
   - TTL：10 分钟
3. 等待生效后，本地 `ping api.你的域名` 应指向该 IP

---

## 第五步：配置 HTTPS（免费证书）

在服务器上（Ubuntu）：

```bash
apt-get install -y nginx certbot python3-certbot-nginx
# 先把 nginx-https.conf.example 中 YOUR_DOMAIN 替换后放到 sites-enabled，或:
certbot --nginx -d api.你的域名.com
```

验证：

```text
https://api.你的域名.com/health
```

---

## 第六步：微信小程序配置

本机 `apps/mobile/.env.mp-weixin`：

```env
VITE_MP_APPID=wxc8249223ec70d85a
VITE_API_BASE=https://api.你的域名.com
VITE_USE_API=true
```

重新构建：

```powershell
cd apps\mobile
.\scripts\build-mp-weixin.ps1
```

微信公众平台 → **开发设置** → **request 合法域名** → 添加：

```text
https://api.你的域名.com
```

---

## 第七步：后端微信密钥（可选，仅服务端）

SSH 到服务器后：

```bash
nano /opt/yuanbanban/services/api/.env
```

写入（勿提交 Git）：

```env
WECHAT_APP_ID=wxc8249223ec70d85a
WECHAT_APP_SECRET=你的密钥
```

当前 MVP 登录仍可用 Header 演示，Secret 供后续微信登录接口使用。

---

## 常用运维命令

```bash
systemctl status yuanbanban-api
systemctl restart yuanbanban-api
journalctl -u yuanbanban-api -f
cd /opt/yuanbanban && git pull && systemctl restart yuanbanban-api
```

---

## 当前进度检查清单

- [ ] 安全组已放行 8000/80/443
- [ ] `http://47.102.108.137:8000/health` 可访问
- [ ] 已买域名，`api` 解析到 `47.102.108.137`
- [ ] `https://api.域名/health` 可访问
- [ ] 微信后台已填合法域名
- [ ] 小程序已用 HTTPS 地址重新构建
