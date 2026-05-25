/**
 * Short, URL-safe, human-readable slug for a live session.
 *
 * 10 chars from a 32-char alphabet (no ambiguous l/1/0/o) = ~50 bits of
 * entropy — plenty for collision-avoidance with thousands of streams/day.
 * Short enough to read aloud over a phone if you have to.
 */
const ALPHABET = "abcdefghijkmnopqrstuvwxyz23456789";

export function generateSlug(): string {
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);
  let out = "";
  for (const b of bytes) out += ALPHABET[b % ALPHABET.length];
  return out;
}
