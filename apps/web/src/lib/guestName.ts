const ADJECTIVES = [
  "Quiet",
  "Curious",
  "Warm",
  "Faithful",
  "Bright",
  "Gentle",
  "Steady",
  "Bold",
];
const NOUNS = [
  "Listener",
  "Pilgrim",
  "Sparrow",
  "Lantern",
  "Echo",
  "Reed",
  "Anchor",
  "Compass",
];

export function defaultGuestName(): string {
  const a = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const n = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 90 + 10);
  return `${a}${n}${num}`;
}

const KEY = "echolive:guestName";

export function loadGuestName(): string {
  if (typeof window === "undefined") return "Guest";
  return window.localStorage.getItem(KEY) ?? defaultGuestName();
}

export function saveGuestName(name: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, name);
}
