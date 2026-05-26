#!/usr/bin/env bash
# 阿里云完整部署: API + Nginx + HTTPS (api.wuyeni.cn)
set -euo pipefail

DOMAIN="${DOMAIN:-api.wuyeni.cn}"
REPO_URL="${REPO_URL:-https://github.com/yeniwu46-max/YuanBan.git}"
APP_DIR="${APP_DIR:-/opt/yuanbanban}"
API_DIR="$APP_DIR/services/api"
EMAIL="${CERTBOT_EMAIL:-admin@wuyeni.cn}"

export DEBIAN_FRONTEND=noninteractive

echo "==> 依赖"
apt-get update -qq
apt-get install -y -qq git python3 python3-pip nginx certbot python3-certbot-nginx curl

echo "==> 代码"
if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR" && git pull
else
  git clone "$REPO_URL" "$APP_DIR"
fi

echo "==> API"
cd "$API_DIR"
pip3 install -e . -q
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
curl -sf "http://127.0.0.1:8000/health" >/dev/null

echo "==> Nginx (HTTP 先通，再申请证书)"
cat >/etc/nginx/sites-available/yuanbanban-api <<EOF
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

ln -sf /etc/nginx/sites-available/yuanbanban-api /etc/nginx/sites-enabled/yuanbanban-api
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo "==> 检查 DNS: $DOMAIN -> 本机公网 IP"
PUBLIC_IP=$(curl -sf ifconfig.me || curl -sf icanhazip.com)
RESOLVED=$(getent ahosts "$DOMAIN" | awk '{print $1}' | head -1 || true)
echo "公网 IP: $PUBLIC_IP  解析: $RESOLVED"
if [ "$RESOLVED" != "$PUBLIC_IP" ]; then
  echo "警告: 域名可能尚未解析到本机，certbot 可能失败。请在阿里云 DNS 添加 A 记录 api -> $PUBLIC_IP"
fi

echo "==> HTTPS 证书"
certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "$EMAIL" --redirect || {
  echo "certbot 失败: 请确认 api.wuyeni.cn 已解析到 $PUBLIC_IP 且安全组已放行 80/443"
  exit 1
}

echo "==> 完成"
curl -sf "https://$DOMAIN/health"
echo ""
echo "API: https://$DOMAIN"
echo "Docs: https://$DOMAIN/docs"
