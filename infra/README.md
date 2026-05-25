# 后端启动说明

## 前置条件

- Docker Desktop（含 `docker compose`）
- 或本地 PostgreSQL 16 + Redis 7 + EMQX 5
- 或仅 Python 3.11+（SQLite，见 `services/api/scripts/start-local.ps1`）

## 生产最小栈（推荐上线）

仅 Postgres + API，无 Redis/EMQX：

```bash
cd infra
cp .env.production.example .env   # 修改 POSTGRES_PASSWORD
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
curl http://localhost:8000/health
```

HTTPS 与 H5 发布见 [`docs/deploy-demo.md`](../docs/deploy-demo.md)。

## 全栈 Docker（MQTT 联调）

```bash
cd infra
docker compose up -d --build
curl http://localhost:8000/health
```

OpenAPI：http://localhost:8000/docs

## 模拟 SOS

```bash
curl -X POST http://localhost:8000/api/v1/simulator/trigger \
  -H "Content-Type: application/json" \
  -d "{\"event_type\":\"sos\",\"elder_id\":\"elder-001\"}"
```

详见 [`docs/backend-infra-summary-2026-05-24.md`](../docs/backend-infra-summary-2026-05-24.md)。
