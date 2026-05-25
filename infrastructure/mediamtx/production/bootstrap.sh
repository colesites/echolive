#!/usr/bin/env bash
# Provision a fresh Hetzner Ubuntu 24.04 box for Echo Live MediaMTX.
# Run as root on the new server:
#   curl -fsSL https://raw.githubusercontent.com/<you>/echolive/main/infrastructure/mediamtx/production/bootstrap.sh | bash
# Or copy this file over and `bash bootstrap.sh`.

set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/your-org/echolive.git}"
INSTALL_DIR="/opt/echolive"

echo "==> Updating apt"
apt-get update -y
apt-get upgrade -y

echo "==> Installing prerequisites"
apt-get install -y ca-certificates curl gnupg git ufw

echo "==> Installing Docker"
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

. /etc/os-release
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $VERSION_CODENAME stable" \
  > /etc/apt/sources.list.d/docker.list
apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

echo "==> Configuring firewall"
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp     comment 'ssh'
ufw allow 80/tcp     comment 'http (acme + redirect)'
ufw allow 443/tcp    comment 'https (hls via caddy)'
ufw allow 1935/tcp   comment 'rtmp ingest'
ufw --force enable

echo "==> Cloning repo to $INSTALL_DIR"
if [ ! -d "$INSTALL_DIR" ]; then
  git clone "$REPO_URL" "$INSTALL_DIR"
else
  git -C "$INSTALL_DIR" pull
fi

cd "$INSTALL_DIR/infrastructure/mediamtx/production"

if [ ! -f .env ]; then
  echo "==> No .env found. Copy .env.example to .env and edit before starting:"
  echo "      cp .env.example .env && \$EDITOR .env"
  echo "    Then run: docker compose -f docker-compose.prod.yml --env-file .env up -d"
  exit 0
fi

echo "==> Starting stack"
docker compose -f docker-compose.prod.yml --env-file .env up -d

echo
echo "==> Done."
echo "    HLS:  https://\$(grep STREAM_DOMAIN .env | cut -d= -f2)"
echo "    RTMP: rtmp://<server-ip>:1935/live/<streamKey>"
echo
echo "    Logs:    docker compose -f docker-compose.prod.yml logs -f"
echo "    Status:  curl -s http://127.0.0.1:9997/v3/paths/list | jq"
