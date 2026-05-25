# 鼋伴伴后端工程地基总结

**日期：** 2026-05-24  
**范围：** FastAPI + PostgreSQL + Redis + EMQX + 设备模拟器

---

## 1. 目录结构

```text
infra/
  docker-compose.yml
  .env.example
services/
  api/                 # FastAPI 主服务
  device-simulator/    # MQTT CLI 模拟器
firmware/esp32-s3/     # 硬件占位 README
docs/
  mqtt-protocol.md
  api-integration-checklist.md
```

---

## 2. 一键启动

### 方式 A：无 Docker（推荐本地开发）

只需 Python 3.11+，使用 SQLite，**不需要** Postgres / Redis / EMQX：

```powershell
cd services\api
.\scripts\start-local.ps1
```

或手动：

```powershell
cd services\api
pip install -e .
python -m app.dev_setup
python -m uvicorn app.main:app --reload --port 8000
```

验证：`curl http://localhost:8000/health`  
应返回 `"database":"sqlite"`, `"mqtt_enabled":false`

### 方式 B：Docker 全栈（生产/联调 MQTT 时用）

```bash
cd infra
docker compose up -d --build
```

服务地址：

| 服务 | 地址 |
|------|------|
| API | http://localhost:8000 |
| Swagger | http://localhost:8000/docs |
| Health | http://localhost:8000/health |
| EMQX Dashboard | http://localhost:18083 （默认 admin/public） |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

容器启动时会自动执行 `alembic upgrade head` 与 seed（`RUN_SEED=true`）。

---

## 3. 本地开发（不 Docker API）

```bash
cd services/api
pip install -e .
# 需先启动 postgres/redis/emqx：cd infra && docker compose up -d postgres redis emqx
export DATABASE_URL=postgresql+psycopg://yuanbanban:yuanbanban@localhost:5432/yuanbanban
export REDIS_URL=redis://localhost:6379/0
export MQTT_HOST=localhost
alembic upgrade head
python -m app.seed
uvicorn app.main:app --reload --port 8000
```

---

## 4. REST API 清单

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/health` | 健康检查 |
| GET | `/api/v1/elders/{id}` | 老人档案 |
| GET | `/api/v1/elders/{id}/metrics/latest` | 最新体征 |
| GET | `/api/v1/alerts` | 告警列表 |
| PATCH | `/api/v1/alerts/{id}` | 更新告警状态 |
| GET | `/api/v1/work-orders` | 工单列表（`?tab=urgent`） |
| PATCH | `/api/v1/work-orders/{id}` | 完成/更新工单 |
| POST | `/api/v1/simulator/trigger` | HTTP 触发模拟事件 |

---

## 5. 演示：SOS 闭环

```bash
# 方式 A：HTTP
curl -X POST http://localhost:8000/api/v1/simulator/trigger \
  -H "Content-Type: application/json" \
  -d '{"event_type":"sos","elder_id":"elder-001","device_id":"d3","location":"卧室"}'

# 方式 B：MQTT 模拟器
cd services/device-simulator
pip install -r requirements.txt
python simulator.py sos --elder elder-001

# 查询
curl http://localhost:8000/api/v1/alerts?elder_id=elder-001
curl http://localhost:8000/api/v1/work-orders?tab=urgent
```

Seed 数据已包含 **李奶奶**（`elder-001`）与 **#SOS-018** 初始工单。

---

## 6. 下一阶段

见 [`api-integration-checklist.md`](./api-integration-checklist.md)：前端 Store 逐步替换 Mock，优先 SOS 三端同步。
