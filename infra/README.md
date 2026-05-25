# 后端启动说明

## 前置条件

- Docker Desktop（含 `docker compose`）
- 或本地 PostgreSQL 16 + Redis 7 + EMQX 5

## 推荐：Docker 一键启动

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
