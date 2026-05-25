# Phase 1 — Checkpoint 1 smoke test

End-to-end check that the local streaming infra works **before** any Convex/web work.

## Prereqs

- Docker Desktop running
- VLC or `ffplay` for playback

## Steps

```sh
# 1. Start MediaMTX
bun run infra:up
bun run infra:logs   # in another terminal — watch for "listener opened on :1935"

# 2. Publish a 440Hz sine to RTMP (simulates the desktop app)
ffmpeg -re -f lavfi -i "sine=frequency=440:sample_rate=44100" \
  -c:a aac -b:a 128k -f flv rtmp://localhost:1935/live/test

# 3. Confirm path is active
bun run infra:status
# Expect:  "name": "live/test", "ready": true, "tracks": ["audio"]

# 4. Play HLS
ffplay http://localhost:8888/live/test/index.m3u8
# Or open in VLC: Media → Open Network Stream
```

If you hear a sine wave through the HLS player, **Checkpoint 1 passes** and the
desktop app's RTMP push will work the same way.

## Known issues (deferred)

- `src-tauri/binaries/ffmpeg-aarch64-apple-darwin` is mislabeled (actually x86_64).
  Replace before shipping an Apple Silicon build. Tracked in CP5.
- FFmpeg sidecar is from 2018; refresh to a current static build before Phase 2
  (we'll need newer encoders for video).
