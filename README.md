# Echo Live

Audio + video livestreaming for creators who don't want OBS.

Monorepo:

- **`apps/desktop`** — Tauri + React studio app (creators broadcast from here)
- **`apps/web`** — Next.js listener site (`/` lists live streams, `/a/[slug]` plays one)
- **`packages/backend`** — Convex schema, mutations, queries
- **`infrastructure/mediamtx`** — local + Hetzner ingest server configs

## Phase 1 status (audio MVP)

Working end-to-end on localhost:

- Desktop → mints stream key in Convex → pushes RTMP to MediaMTX
- Web `/a/live` → fetches HLS URL from Convex → plays audio → realtime chat + listener count

Not yet: Better Auth (single-tenant for now), video, recording, multistream.

---

## Prereqs

- [Bun](https://bun.com) (`packageManager: bun@1.3.5`)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — running before `bun run infra:up`
- [FFmpeg](https://ffmpeg.org/) — *only* for the CLI smoke test (`brew install ffmpeg`). The desktop app uses its bundled sidecar.

```sh
bun install
```

## Environment

| App | File | Source |
|---|---|---|
| Backend | `packages/backend/.env.local` | Created by `bunx convex dev` |
| Desktop | `apps/desktop/.env.local` | `cp apps/desktop/.env.example apps/desktop/.env.local` |
| Web | `apps/web/.env.local` | `cp apps/web/.env.example apps/web/.env.local` |

The two `VITE_CONVEX_URL` / `NEXT_PUBLIC_CONVEX_URL` values both come from the Convex deployment URL — same string in both files.

---

## Local end-to-end test

In four terminals:

```sh
# 1. MediaMTX ingest
bun run infra:up
bun run infra:logs   # watch for "listener opened on :1935"

# 2. Convex dev (hot-reloads on schema/function changes)
cd packages/backend
bunx convex dev

# 3. Web listener app  →  http://localhost:3000
cd apps/web
bun run dev

# 4. Desktop studio app
cd apps/desktop
bun run tauri dev
```

Then:

1. In the desktop app, click **Go Live**, enter a title, pick a cover, hit **Start Streaming**
2. The "share URL" pill appears next to the End Stream button — `http://localhost:3000/a/live`
3. Open that URL in your browser — you'll see the cover, listener count, chat, and an audio player
4. Click play → you should hear your mic on a ~3-second delay (HLS low-latency)

If anything fails:

- Modal shows the error in a red banner — read it
- Convex logs: `cd packages/backend && bunx convex logs`
- MediaMTX logs: `bun run infra:logs`
- Active streams: `bun run infra:status`

---

## Deploying

### Backend (Convex)
Already deployed to `bold-raccoon-845`. To redeploy on schema change:
```sh
cd packages/backend
bunx convex deploy
```

### Web (Cloudflare Pages or Vercel)
```sh
cd apps/web
bun run build
```
Set `NEXT_PUBLIC_CONVEX_URL` in the dashboard.

### Ingest (Hetzner)
See [infrastructure/mediamtx/production/DEPLOY.md](infrastructure/mediamtx/production/DEPLOY.md). After it's up, point both apps at it by editing `.env.local`:

```
# apps/desktop/.env.local
VITE_RTMP_HOST=rtmp://<server-ip>:1935
VITE_HLS_HOST=https://stream.<yourdomain>
VITE_WEB_HOST=https://<your-web-domain>

# apps/web/.env.local — no change needed (HLS URL comes from Convex)
```

---

## Roadmap

See [plan.md](plan.md). Currently in Phase 1.
