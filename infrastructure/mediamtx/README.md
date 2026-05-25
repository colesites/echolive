# MediaMTX — Echo Live ingest

Local streaming server for Phase 1 (audio MVP).

## Run

```sh
bun run infra:up        # start
bun run infra:logs      # tail
bun run infra:down      # stop
```

## Endpoints (host network)

| Protocol | URL                                               | Purpose                          |
| -------- | ------------------------------------------------- | -------------------------------- |
| RTMP     | `rtmp://localhost:1935/live/<streamKey>`          | Desktop publishes audio here     |
| HLS      | `http://localhost:8888/live/<streamKey>/index.m3u8` | Web player consumes              |
| API      | `http://localhost:9997/v3/paths/list`             | Health / active publishers       |

## Smoke test (without the desktop app)

```sh
# Publish a sine wave
ffmpeg -re -f lavfi -i "sine=frequency=440:sample_rate=44100" \
  -c:a aac -b:a 128k -f flv rtmp://localhost:1935/live/test

# Then open in another terminal
curl -s http://localhost:9997/v3/paths/list | jq
# Or play in VLC: http://localhost:8888/live/test/index.m3u8
```

## Phase 2+ TODOs

- `runOnPublish` → Convex to validate stream key + flip stream to `live`
- Auth via `externalAuthenticationURL`
- Recording paths → R2
- WebRTC for ultra-low-latency once HLS baseline is solid
