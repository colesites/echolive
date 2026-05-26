import { createAuthClient } from "better-auth/react";
import { convexClient } from "@convex-dev/better-auth/client/plugins";

const baseURL = import.meta.env.VITE_CONVEX_SITE_URL;
if (!baseURL) {
  throw new Error(
    "VITE_CONVEX_SITE_URL is not set. Add it to apps/desktop/.env.local.",
  );
}

export const authClient = createAuthClient({
  baseURL,
  plugins: [convexClient()],
});

export const { signOut, useSession, getSession } = authClient;
