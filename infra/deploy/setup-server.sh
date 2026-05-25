#!/usr/bin/env bash
# 在云主机（Ubuntu/Debian）上首次部署鼋伴伴 API 最小栈
set -euo pipefail

REPO_DIR="${REPO_DIR:-$HOME/yuanbanban}"
INFRA_DIR="$REPO_DIR/infra"

if [ ! -f "$INFRA_DIR/.env" ]; then
  echo "请先复制并编辑 $INFRA_DIR/.env："
  echo "  cp $INFRA_DIR/.env.example $INFRA_DIR/.env"
  echo "  修改 POSTGRES_PASSWORD"
  exit 1
fi

command -v docker >/dev/null || {
  echo "安装 Docker..."
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker "$USER" || true
}

cd "$INFRA_DIR"
docker compose -f docker-compose.prod.yml --env-file .env up -d --build

echo "等待 API 就绪..."
for i in $(seq 1 30); do
  if curl -sf "http://127.0.0.1:${API_PORT:-8000}/health" >/dev/null; then
    curl -s "http://127.0.0.1:${API_PORT:-8000}/health"
    echo ""
    echo "API 已启动。请配置 Nginx/Caddy HTTPS，见 infra/deploy/"
    exit 0
  fi
  sleep 2
done

echo "API 未在预期时间内响应，请执行: docker compose -f docker-compose.prod.yml logs api"
exit 1
