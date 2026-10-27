#!/usr/bin/env bash
set -eu
printf 'HOST OS\n'
head -n 5 /etc/os-release
printf '\nTOOLS\n'
for tool in nginx certbot python3 tar openssl; do command -v "$tool" || true; done
printf '\nWEB SERVER\n'
systemctl is-active nginx || true
ss -lnt | awk 'NR == 1 || /:80 |:443 /'
printf '\nNGINX VHOST METADATA (no private keys or environment files)\n'
nginx -T 2>&1 | grep -E '^# configuration file|^[[:space:]]*(listen |server_name |root |ssl_certificate )' || true
printf '\nEXISTING YBB RELEASES\n'
ls -ld /var/www/yuanbanban-ybb /etc/nginx/conf.d/ybb.wuyeni.cn.conf 2>/dev/null || true
printf '\nCERTBOT AUTO RENEWAL\n'
systemctl list-timers --all --no-pager | grep -E 'certbot|acme' || true
