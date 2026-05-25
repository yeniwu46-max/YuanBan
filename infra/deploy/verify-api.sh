#!/usr/bin/env bash
# 部署后冒烟：health + SOS trigger + alerts
set -euo pipefail
BASE="${API_BASE:-http://127.0.0.1:8000}"

echo "== GET /health =="
curl -sf "$BASE/health" | head -c 400
echo ""

echo "== POST simulator/trigger (sos) =="
curl -sf -X POST "$BASE/api/v1/simulator/trigger" \
  -H "Content-Type: application/json" \
  -d '{"event_type":"sos","elder_id":"elder-001"}'
echo ""

echo "== GET /api/v1/alerts (first item) =="
curl -sf "$BASE/api/v1/alerts" | head -c 600
echo ""

echo "OK"
