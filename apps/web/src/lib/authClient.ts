"use client";

import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";
import {
  convexClient,
  crossDomainClient,
} from "@convex-dev/better-auth/client/plugins";

const baseURL = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;
if (!baseURL) {
  throw new Error(
    "NEXT_PUBLIC_CONVEX_SITE_URL is not set. Add it to apps/web/.env.local " +
      "(value: your-deployment.convex.site).",
  );
}

export const authClient = createAuthClient({
  baseURL,
  plugins: [convexClient(), crossDomainClient(), organizationClient()],
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;
