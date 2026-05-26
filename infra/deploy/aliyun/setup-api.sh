#!/usr/bin/env bash
# 在阿里云 Ubuntu/Debian 上首次部署鼋伴伴 API（无 Docker）
# 用法: curl 下载后 bash setup-api.sh，或 git clone 后:
#   cd yuanbanban/infra/deploy/aliyun && sudo bash setup-api.sh

set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/yeniwu46-max/YuanBan.git}"
APP_DIR="${APP_DIR:-/opt/yuanbanban}"
API_DIR="$APP_DIR/services/api"
PY=python3

echo "==> 安装依赖"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq git "$PY" python3-pip python3-venv

echo "==> 拉取代码"
if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR" && git pull
else
  git clone "$REPO_URL" "$APP_DIR"
fi

echo "==> 安装 Python 包"
cd "$API_DIR"
pip3 install -e . -q
python3 -m app.dev_setup

echo "==> 写入 systemd 服务"
cat >/etc/systemd/system/yuanbanban-api.service <<EOF
[Unit]
Description=Yuanbanban FastAPI
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$API_DIR
Environment=PYTHONUNBUFFERED=1
ExecStart=$PY -m uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable yuanbanban-api
systemctl restart yuanbanban-api

sleep 2
echo "==> 健康检查"
curl -sf "http://127.0.0.1:8000/health" || { journalctl -u yuanbanban-api -n 30 --no-pager; exit 1; }
echo ""
echo "部署完成。公网访问: http://$(curl -sf ifconfig.me 2>/dev/null || echo YOUR_IP):8000/health"
echo "请在阿里云安全组放行: 22, 80, 443, 8000"
