#!/usr/bin/env bash
# 宝塔面板服务器：只部署 FastAPI（127.0.0.1:8000），不装/不改 Nginx、不跑 certbot
# 域名与 HTTPS 请在宝塔「网站」里配置反向代理 + Let's Encrypt
set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/yeniwu46-max/YuanBan.git}"
APP_DIR="${APP_DIR:-/opt/yuanbanban}"
API_DIR="$APP_DIR/services/api"

echo "==> 安装 Python 依赖"
if command -v apt-get >/dev/null 2>&1; then
  export DEBIAN_FRONTEND=noninteractive
  apt-get update -qq
  apt-get install -y -qq git python3 python3-pip python3-venv curl
elif command -v yum >/dev/null 2>&1; then
  yum install -y git python3 python3-pip curl
else
  echo "需要 apt-get 或 yum"
  exit 1
fi

echo "==> 拉取代码"
if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR" && git pull
else
  git clone "$REPO_URL" "$APP_DIR"
fi

echo "==> 安装 API"
cd "$API_DIR"
pip3 install -e . -q --break-system-packages 2>/dev/null || pip3 install -e . -q
python3 -m app.dev_setup

if [ ! -f "$API_DIR/.env" ]; then
  cp "$API_DIR/.env.example" "$API_DIR/.env" 2>/dev/null || true
fi
if [ -n "${WECHAT_APP_ID:-}" ]; then
  grep -q '^WECHAT_APP_ID=' "$API_DIR/.env" 2>/dev/null && sed -i "s/^WECHAT_APP_ID=.*/WECHAT_APP_ID=$WECHAT_APP_ID/" "$API_DIR/.env" || echo "WECHAT_APP_ID=$WECHAT_APP_ID" >>"$API_DIR/.env"
fi
if [ -n "${WECHAT_APP_SECRET:-}" ]; then
  grep -q '^WECHAT_APP_SECRET=' "$API_DIR/.env" 2>/dev/null && sed -i "s/^WECHAT_APP_SECRET=.*/WECHAT_APP_SECRET=$WECHAT_APP_SECRET/" "$API_DIR/.env" || echo "WECHAT_APP_SECRET=$WECHAT_APP_SECRET" >>"$API_DIR/.env"
fi

cat >/etc/systemd/system/yuanbanban-api.service <<EOF
[Unit]
Description=Yuanbanban FastAPI
After=network.target

[Service]
Type=simple
WorkingDirectory=$API_DIR
Environment=PYTHONUNBUFFERED=1
ExecStart=/usr/bin/python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable yuanbanban-api
systemctl restart yuanbanban-api
sleep 2

echo "==> 本机健康检查"
curl -sf "http://127.0.0.1:8000/health"
echo ""
echo "完成。请在宝塔添加站点 api.wuyeni.cn → 反向代理 http://127.0.0.1:8000 → 申请 SSL"
