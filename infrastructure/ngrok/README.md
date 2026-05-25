# ngrok — phone testing

Expose the local web app + MediaMTX HLS to your phone (or anyone) over the internet via two ngrok tunnels.

## One-time setup

```sh
# Free signup at https://dashboard.ngrok.com/get-started/your-authtoken
ngrok config add-authtoken <your-token>
```

## Each session

```sh
# Terminal 1: start tunnels (both web and HLS)
bun run tunnel
```

ngrok prints two `https://*.ngrok-free.dev` URLs. Note them — one is for **web** (port 3000), one is for **hls** (port 8888).

```sh
# Terminal 2: point the desktop at the ngrok HLS + web URLs so the share
# URL it generates is reachable from the phone.
#
# Edit apps/desktop/.env.local:
VITE_RTMP_HOST=rtmp://localhost:1935            # unchanged — desktop pushes locally
VITE_HLS_HOST=https://<hls-tunnel>.ngrok-free.dev
VITE_WEB_HOST=https://<web-tunnel>.ngrok-free.dev
```

Restart `bun run tauri dev` so it picks up the new env vars.

Click **Go Live** in the desktop app → the share URL pill is now the ngrok web URL. Open it on your phone, click play.

## Why two tunnels?

The web app serves the HTML/JS. The audio player inside that page fetches the `.m3u8` directly from the HLS host. If the HLS host is `localhost:8888`, the phone can't reach it. Both have to be on a public hostname.

## ngrok browser-warning interstitial

ngrok-free shows a "you are about to visit" HTML page on the first request to any new tunnel. `hls.js` can't click through it, so playback fails silently. The ngrok config in [`ngrok.yml`](./ngrok.yml) sends the `ngrok-skip-browser-warning` header on every HLS request, and [AudioPlayer.tsx](../../apps/web/src/components/AudioPlayer.tsx) also injects it on the player side. iOS Safari's native HLS player warms the cache with one preflight fetch first.

When you open the web URL on the phone for the first time, you **will** still see ngrok's warning page. Click **Visit Site** once — afterwards your browser session is whitelisted.

## After testing

```sh
# Ctrl-C the tunnel. Revert apps/desktop/.env.local back to localhost:
VITE_HLS_HOST=http://localhost:8888
VITE_WEB_HOST=http://localhost:3000
```
