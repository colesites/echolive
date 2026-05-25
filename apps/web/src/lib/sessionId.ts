/** Stable per-browser session id, used for presence heartbeat. */
export function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  const KEY = "echolive:sessionId";
  let id = window.localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(KEY, id);
  }
  return id;
}
