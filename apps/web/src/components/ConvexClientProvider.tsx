"use client";

import { type ReactNode, useState } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";

const url = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!url) {
  throw new Error(
    "NEXT_PUBLIC_CONVEX_URL is not set. Copy apps/web/.env.example to .env.local.",
  );
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  // Single client per browser session.
  const [client] = useState(() => new ConvexReactClient(url!));
  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
