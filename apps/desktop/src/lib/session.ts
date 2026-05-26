import { LazyStore } from "@tauri-apps/plugin-store";
import { convex } from "./convex";

/**
 * Persistent session storage backed by `tauri-plugin-store` so the
 * bearer token survives app restarts. The store file lives in the OS
 * standard app-data directory; we never write tokens to JS localStorage.
 *
 * Whenever the token changes we mirror it onto the shared `convex`
 * client so every subsequent mutation/query is authenticated.
 */

const STORE_FILE = "echolive-session.json";
const TOKEN_KEY = "auth.token";

const store = new LazyStore(STORE_FILE);

let cachedToken: string | null | undefined;
const listeners = new Set<(token: string | null) => void>();

function applyToConvex(token: string | null) {
  if (token) {
    // ConvexHttpClient.setAuth takes a raw bearer string.
    convex.setAuth(token);
  } else {
    convex.clearAuth();
  }
}

/** Read the persisted token (cached after the first call). */
export async function loadToken(): Promise<string | null> {
  if (cachedToken !== undefined) return cachedToken;
  const value = (await store.get<string>(TOKEN_KEY)) ?? null;
  cachedToken = value;
  applyToConvex(value);
  return value;
}

/** Persist a new token (or clear it by passing null). */
export async function saveToken(token: string | null): Promise<void> {
  cachedToken = token;
  if (token) {
    await store.set(TOKEN_KEY, token);
  } else {
    await store.delete(TOKEN_KEY);
  }
  await store.save();
  applyToConvex(token);
  for (const listener of listeners) listener(token);
}

/** Subscribe to token changes; returns an unsubscribe fn. */
export function onTokenChange(fn: (token: string | null) => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/** Extract the `?token=...` query param from a deep-link URL. */
export function tokenFromDeepLink(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.searchParams.get("token");
  } catch {
    return null;
  }
}
