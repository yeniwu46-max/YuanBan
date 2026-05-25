# 鼋伴伴公网演示部署指南

**阶段：** 第 2.5 阶段 — 1 日上线  
**目标：** 公网 HTTPS API + H5 静态站，可选 SOS→告警→工单最小联调

---

## 1. 线上地址（部署后填写）

| 服务 | 地址 |
|------|------|
| API Health | `https://api.<你的域名>/health` |
| API 文档 | `https://api.<你的域名>/docs` |
| H5 应用 | `https://app.<你的域名>/` |

---

## 2. 服务器准备（约 30 分钟）

1. 云主机：建议 2C4G，Ubuntu 22.04+，开放 **80/443**（不要对公网开放 5432、18083）。
2. 安装 Docker：`curl -fsSL https://get.docker.com | sh`
3. 克隆仓库到服务器，例如 `~/yuanbanban`。
4. 配置环境变量：

```bash
cd yuanbanban/infra
cp .env.production.example .env
# 编辑 .env，将 POSTGRES_PASSWORD 改为强密码
```

5. 启动 API 最小栈：

```bash
chmod +x deploy/setup-server.sh
./deploy/setup-server.sh
# 或: docker compose -f docker-compose.prod.yml --env-file .env up -d --build
```

6. 验收（在服务器上）：

```bash
curl -s http://127.0.0.1:8000/health
curl -s -X POST http://127.0.0.1:8000/api/v1/simulator/trigger \
  -H "Content-Type: application/json" \
  -d '{"event_type":"sos","elder_id":"elder-001"}'
curl -s http://127.0.0.1:8000/api/v1/alerts | head -c 500
```

期望：`health` 中 `database` 为 `postgresql`，`mqtt_enabled` 为 `false`。

---

## 3. HTTPS 反向代理

任选其一，配置文件在 [`infra/deploy/`](../infra/deploy/)：

- **Caddy**：复制 [`Caddyfile`](../infra/deploy/Caddyfile)，替换 `api.example.com` / `app.example.com`，运行 `caddy run --config Caddyfile`
- **Nginx**：复制 [`nginx.conf.example`](../infra/deploy/nginx.conf.example)，配合 certbot

API 反代到 `127.0.0.1:8000`；H5 静态根目录见下一节。

---

## 4. H5 前端构建与发布

在**开发机**（已安装 Node 18+、pnpm）：

```powershell
cd apps\mobile
copy .env.production.example .env.production
# 编辑 .env.production:
#   VITE_API_BASE=https://api.<你的域名>
#   VITE_USE_API=true
.\scripts\build-h5.ps1
```

将构建产物（本仓库 uni 输出为 `apps/mobile/dist/build/h5`）上传到服务器 `/var/www/yuanbanban-h5`。

Nginx 需配置 SPA 回退：`try_files $uri $uri/ /index.html;`

---

## 5. 演示脚本（答辩推荐）

### 5.1 仅 API（Swagger）

1. 打开 `https://api.<域名>/docs`
2. `POST /api/v1/simulator/trigger`，body：`{"event_type":"sos","elder_id":"elder-001"}`
3. `GET /api/v1/alerts` 查看新告警
4. `GET /api/v1/work-orders?tab=urgent` 查看工单

### 5.2 三端 H5 联调（需 `VITE_USE_API=true`）

1. 老人端：登录 → SOS → **立即求助**（调用线上 trigger）
2. 社区端：工单 → 紧急 → 打开 `#SOS-018` 同类工单 → **完成闭环**
3. 子女端：守护 → 刷新（onShow 拉取告警）→ 处理告警

### 5.3 MVP 认证 Header（临时）

```http
X-Role: family
X-User-Id: family-001
```

社区端：`X-Role: community`，`X-User-Id: community-001`。正式环境将替换为 JWT。

---

## 6. 回滚

```bash
cd infra
docker compose -f docker-compose.prod.yml down
# 保留数据卷则去掉 -v；完全清空: docker compose -f docker-compose.prod.yml down -v
```

H5：用上一版 `dist` 覆盖 `/var/www/yuanbanban-h5` 即可。

---

## 7. 防火墙建议

| 端口 | 公网 |
|------|------|
| 443 | 开放 |
| 80 | 开放（跳转 HTTPS） |
| 8000 | 仅本机（由反代暴露） |
| 5432 / 6379 / 1883 / 18083 | **关闭** |

---

## 8. 无 Docker 一键部署（推荐本机/答辩）

**不需要 Docker Desktop**，仅需 Python 3.11+、Node/pnpm。

```powershell
# 项目根目录
.\scripts\deploy-no-docker.ps1 -UseApi
```

自动完成：SQLite API（8000）+ H5 静态站（8080，含 SPA 回退），并按 **WLAN IP** 写入 `VITE_API_BASE`。

停止服务：

```powershell
.\scripts\stop-no-docker.ps1
```

若需放行防火墙（管理员 PowerShell）：

```powershell
netsh advfirewall firewall add rule name="Yuanbanban API 8000" dir=in action=allow protocol=TCP localport=8000
netsh advfirewall firewall add rule name="Yuanbanban H5 8080" dir=in action=allow protocol=TCP localport=8080
```

### 公网 H5（PinMe，仅前端）

```powershell
pinme upload apps\mobile\dist\build\h5
```

PinMe 站点为 HTTPS，**无法**直接访问本机 `http://IP:8000` API；完整 SOS 联调请用同网 `http://<WLAN-IP>:8080/`。

## 9. 本地开发预演

```powershell
cd services\api
.\scripts\start-local.ps1

cd apps\mobile
# .env.development 已指向 http://localhost:8000
pnpm dev:h5
```

---

*与 [`api-integration-checklist.md`](./api-integration-checklist.md) 衔接：上线后按清单继续全量 Store API 化。*
