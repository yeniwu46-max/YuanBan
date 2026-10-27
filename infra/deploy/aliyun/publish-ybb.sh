#!/usr/bin/env bash
# Usage: bash publish-ybb.sh bootstrap|tls|release RELEASE_ID
# Run from the uploaded directory containing these configs and site.tar.gz.
set -euo pipefail
mode="${1:?bootstrap, tls or release required}"
release="${2:?unique release id required}"
[[ "$release" =~ ^[0-9]{8}T[0-9]{6}Z-[a-f0-9]{8}$ ]] || { echo 'Invalid release id'; exit 1; }
case "$mode" in bootstrap|tls|release) ;; *) exit 1 ;; esac
base=/var/www/yuanbanban-ybb
conf=/etc/nginx/conf.d/ybb.wuyeni.cn.conf
source_dir="$(cd -- "$(dirname -- "$0")" && pwd)"
mkdir -p "$base/releases" "$base/backups" "$base/acme" "$base/shared-assets"

if [[ "$mode" != tls ]]; then
    test -f "$source_dir/site.tar.gz"
    test ! -e "$base/releases/$release" || { echo 'Release already exists'; exit 1; }
    # The artifact is locally produced; reject traversal before extraction as well.
    if tar -tzf "$source_dir/site.tar.gz" | grep -Eq '(^/|(^|/)\.\.(/|$))'; then exit 1; fi
    mkdir "$base/releases/$release"
    tar -xzf "$source_dir/site.tar.gz" -C "$base/releases/$release" --no-same-owner
    test -f "$base/releases/$release/index.html"
    cp -an "$base/releases/$release/assets/." "$base/shared-assets/"
    chmod -R a+rX "$base/releases/$release" "$base/shared-assets"
    printf '{"release":"%s","mode":"demo","domain":"ybb.wuyeni.cn"}\n' "$release" > "$base/releases/$release/deployment.json"
    # Remember the prior release without deleting or overwriting its files.
    if [[ -L "$base/current" ]]; then
        readlink "$base/current" > "$base/backups/$release.previous-root"
    elif [[ -e "$base/current" ]]; then
        echo 'Existing current is not a managed symlink; refusing to replace it'; exit 1
    fi
    ln -s "$base/releases/$release" "$base/current.next-$release"
    mv -Tf "$base/current.next-$release" "$base/current"
fi

if [[ "$mode" == bootstrap ]]; then
    # Initial setup must not overwrite another operator's vhost or security policy.
    test ! -e "$conf" || { echo 'Vhost already exists; refusing bootstrap'; exit 1; }
    test ! -e "$base/nginx-security.conf" || { echo 'Security file already exists'; exit 1; }
    install -m 644 "$source_dir/ybb-security.conf" "$base/nginx-security.conf"
    install -m 644 "$source_dir/ybb-http.conf" "$conf"
    if ! nginx -t; then
        mv "$conf" "$base/backups/$release.failed-http.conf"
        exit 1
    fi
    systemctl reload nginx
elif [[ "$mode" == tls ]]; then
    test -f "$conf"
    certbot certonly --webroot -w "$base/acme" -d ybb.wuyeni.cn \
        --cert-name ybb.wuyeni.cn --non-interactive --agree-tos --register-unsafely-without-email
    cp -p "$conf" "$base/backups/$release.http.conf"
    install -m 644 "$source_dir/ybb-https.conf" "$conf"
    if ! nginx -t; then
        cp -p "$base/backups/$release.http.conf" "$conf"
        exit 1
    fi
    systemctl reload nginx
    # Restrict renewal reloading to a validated graceful reload, preserving other sites.
    mkdir -p /etc/letsencrypt/renewal-hooks/deploy
    hook=/etc/letsencrypt/renewal-hooks/deploy/yuanbanban-nginx-reload.sh
    if [[ ! -e "$hook" ]]; then
        printf '#!/bin/sh\n/usr/sbin/nginx -t && /usr/bin/systemctl reload nginx\n' > "$hook"
        chmod 755 "$hook"
    fi
fi
if [[ "$mode" != tls ]]; then
    # nginx reload is graceful/asynchronous; don't mistake an old worker's default
    # vhost response for a successful new deployment.
    ready=false
    for attempt in 1 2 3 4 5; do
        if [[ "$(curl -fsS -H 'Host: ybb.wuyeni.cn' http://127.0.0.1/healthz)" == 'ok: yuanbanban demo' ]]; then ready=true; break; fi
        sleep 1
    done
    "$ready" || { echo 'New vhost health check failed'; exit 1; }
else
    ready=false
    for attempt in 1 2 3 4 5; do
        if [[ "$(curl -fsS --resolve ybb.wuyeni.cn:443:127.0.0.1 https://ybb.wuyeni.cn/healthz)" == 'ok: yuanbanban demo' ]]; then ready=true; break; fi
        sleep 1
    done
    "$ready" || { echo 'New TLS vhost health check failed'; exit 1; }
fi
printf '\nPublished %s (%s)\n' "$release" "$mode"
