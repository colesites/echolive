/**
 * Generate a cryptographically random, URL-safe stream key.
 *
 * Format: 32 bytes → base64url (~43 chars). Long enough that brute-forcing
 * an unknown active key is infeasible, short enough to paste into FFmpeg.
 */
export function generateStreamKey(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Stream keys are good for 24h after `startStream`. `endStream` burns
// them immediately. The expiry is a safety net for crashed clients.
export const STREAM_KEY_TTL_MS = 24 * 60 * 60 * 1000;
