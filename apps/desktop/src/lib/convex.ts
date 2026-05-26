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
  // `webHost` = where the public listener URL lives (phone/share). Often
  // ngrok in dev so listeners can reach it from outside your LAN.
  webHost: import.meta.env.VITE_WEB_HOST ?? "http://localhost:3000",
  // `authHost` = where the desktop opens the sign-in browser tab. Defaults
  // to localhost in dev so OAuth isn't interrupted by ngrok's interstitial.
  // Set explicitly only if your auth pages live on a different origin
  // than your Next.js dev server.
  authHost:
    import.meta.env.VITE_AUTH_HOST ??
    (import.meta.env.DEV ? "http://localhost:3000" : import.meta.env.VITE_WEB_HOST) ??
    "http://localhost:3000",
};
