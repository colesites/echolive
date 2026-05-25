# Deploy MediaMTX to Hetzner (Phase 1)

End-to-end: ~15 minutes from "no server" to a public HLS endpoint.

## 1. Create the server

Hetzner Cloud Console → New project → Add server:

- **Image:** Ubuntu 24.04
- **Type:** CX22 (€3.79/mo, 2 vCPU, 4 GB)
- **Location:** closest to your listeners (Falkenstein for EU/Africa, Ashburn for US)
- **SSH key:** add your public key
- **Name:** `echolive-ingest`

## 2. Point DNS

In your domain registrar (or Cloudflare DNS):

```
stream.<yourdomain>   A   <server-ipv4>
                      AAAA <server-ipv6>   (optional)
```

Wait until `dig stream.<yourdomain>` returns the IP before continuing — Let's Encrypt will fail otherwise.

## 3. Provision

SSH in as root:

```sh
ssh root@<server-ip>

# Pull and run the bootstrap script
curl -fsSL https://raw.githubusercontent.com/<your-org>/echolive/main/infrastructure/mediamtx/production/bootstrap.sh \
  -o /tmp/bootstrap.sh
REPO_URL=https://github.com/<your-org>/echolive.git bash /tmp/bootstrap.sh
```

The script: installs Docker, opens the firewall (22, 80, 443, 1935), clones the repo, and stops to wait for `.env`.

## 4. Configure

```sh
cd /opt/echolive/infrastructure/mediamtx/production
cp .env.example .env
nano .env
# STREAM_DOMAIN=stream.yourdomain.com
# ACME_EMAIL=you@yourdomain.com
```

## 5. Start

```sh
docker compose -f docker-compose.prod.yml --env-file .env up -d
docker compose -f docker-compose.prod.yml logs -f
```

Watch Caddy's logs — first start fetches a TLS cert from Let's Encrypt. When you see `certificate obtained successfully`, you're live.

## 6. Verify

From your laptop:

```sh
# 1. HLS endpoint responds (404 is fine — no streams yet)
curl -I https://stream.yourdomain.com/

# 2. Push a test stream
ffmpeg -re -f lavfi -i "sine=frequency=440:sample_rate=44100" \
  -c:a aac -b:a 128k -f flv rtmp://<server-ip>:1935/live/testkey

# 3. Play HLS in another terminal
ffplay https://stream.yourdomain.com/live/testkey/index.m3u8
```

If you hear the sine wave, the ingest server is production-ready.

## 7. Wire env in apps

Add to **root `.env.local`** (and Cloudflare Pages env for the deployed web app):

```
NEXT_PUBLIC_HLS_HOST=https://stream.yourdomain.com
RTMP_HOST=rtmp://<server-ip>:1935
```

Desktop reads `RTMP_HOST`, passes it to Convex's `startStream`. Web reads `NEXT_PUBLIC_HLS_HOST` for the `<audio>` source URL.

## Updating

```sh
cd /opt/echolive
git pull
cd infrastructure/mediamtx/production
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

## Hardening (do before going public)

- [ ] Disable root SSH, add a sudo user, key-only auth
- [ ] `unattended-upgrades` for security patches
- [ ] Fail2ban on SSH
- [ ] Switch RTMP → RTMPS (TLS) once the desktop FFmpeg sidecar supports it
- [ ] Convex `runOnPublish` hook to validate stream keys before MediaMTX accepts ingest
- [ ] Hetzner Cloud snapshot before major changes
