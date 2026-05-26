import { LazyStore } from "@tauri-apps/plugin-store";
import { convex } from "./convex";

/**
 * Persistent session storage backed by `tauri-plugin-store` so tokens
 * survive app restarts. We track TWO bearers:
 *
 * - `token` (Convex JWT) — attached to every Convex query/mutation via
 *   `ConvexHttpClient.setAuth`.
 * - `authToken` (Better Auth session token) — sent as
 *   `Authorization: Bearer <…>` on `/api/auth/*` endpoints (e.g. the
 *   organization plugin). The Convex JWT does NOT work here because
 *   Better Auth's `bearer` plugin expects the session-token format.
 *
 * Whenever a token changes we mirror onto the convex client + notify
 * listeners so the UI re-renders.
 */

const STORE_FILE = "echolive-session.json";
const TOKEN_KEY = "auth.token"; // convex JWT
const AUTH_TOKEN_KEY = "auth.authToken"; // better-auth bearer

const store = new LazyStore(STORE_FILE);

interface Tokens {
  convexJwt: string | null;
  authToken: string | null;
}

let cached: Tokens | undefined;
const listeners = new Set<(tokens: Tokens) => void>();

function applyToConvex(token: string | null) {
  if (token) convex.setAuth(token);
  else convex.clearAuth();
}

function emit() {
  if (!cached) return;
  for (const listener of listeners) listener(cached);
}

/** Read both tokens (cached after the first call). */
export async function loadTokens(): Promise<Tokens> {
  if (cached) return cached;
  const convexJwt = (await store.get<string>(TOKEN_KEY)) ?? null;
  const authToken = (await store.get<string>(AUTH_TOKEN_KEY)) ?? null;
  cached = { convexJwt, authToken };
  applyToConvex(convexJwt);
  return cached;
}

/** Persist both tokens (pass null to clear). */
export async function saveTokens(tokens: Tokens): Promise<void> {
  cached = tokens;
  if (tokens.convexJwt) await store.set(TOKEN_KEY, tokens.convexJwt);
  else await store.delete(TOKEN_KEY);
  if (tokens.authToken) await store.set(AUTH_TOKEN_KEY, tokens.authToken);
  else await store.delete(AUTH_TOKEN_KEY);
  await store.save();
  applyToConvex(tokens.convexJwt);
  emit();
}

export async function clearTokens(): Promise<void> {
  await saveTokens({ convexJwt: null, authToken: null });
}

export function getAuthToken(): string | null {
  return cached?.authToken ?? null;
}

export function onTokenChange(fn: (tokens: Tokens) => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/** Extract both tokens from a callback URL. */
export function tokensFromDeepLink(url: string): Partial<Tokens> {
  try {
    const parsed = new URL(url);
    return {
      convexJwt: parsed.searchParams.get("token") ?? null,
      authToken: parsed.searchParams.get("authToken") ?? null,
    };
  } catch {
    return {};
  }
}

// ───── Back-compat shims (some files still use the old single-token names) ─────

export async function loadToken(): Promise<string | null> {
  return (await loadTokens()).convexJwt;
}

export async function saveToken(token: string | null): Promise<void> {
  // When called with just a Convex JWT, preserve any existing authToken.
  const current = cached ?? (await loadTokens());
  await saveTokens({
    convexJwt: token,
    authToken: token ? current.authToken : null,
  });
}
