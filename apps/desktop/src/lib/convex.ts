import { ConvexHttpClient } from "convex/browser";

const url = import.meta.env.VITE_CONVEX_URL;
if (!url) {
  throw new Error(
    "VITE_CONVEX_URL is not set. Copy apps/desktop/.env.example to .env.local.",
  );
}

// Single shared HTTP client. Phase 1 uses one-shot mutations/queries from
// the Zustand store — no need for ConvexReactClient yet. CP2b reintroduces
// it when we wire auth + live subscriptions in components.
export const convex = new ConvexHttpClient(url);

export const env = {
  rtmpHost: import.meta.env.VITE_RTMP_HOST ?? "rtmp://localhost:1935",
  hlsHost: import.meta.env.VITE_HLS_HOST ?? "http://localhost:8888",
  webHost: import.meta.env.VITE_WEB_HOST ?? "http://localhost:3000",
};
