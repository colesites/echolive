"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Radio } from "lucide-react";
import { authClient } from "@/lib/authClient";

const DEFAULT_REDIRECT =
  process.env.NEXT_PUBLIC_DESKTOP_REDIRECT ?? "echolive://auth/callback";

/**
 * OAuth completion bridge.
 *
 * After a sign-in, Better Auth's `crossDomain` plugin appends `?ott=<id>`
 * to this page's URL. The flow is:
 *
 *   1. Exchange the OTT for a real session by POSTing it to
 *      `/api/auth/cross-domain/one-time-token/verify`. The response sets
 *      the cross-domain cookie + returns the session payload.
 *   2. GET `/api/auth/convex/token` to mint the Convex JWT — that's the
 *      bearer the desktop needs to authenticate Convex queries.
 *   3. Redirect to the `?desktop=...` URL (loopback in dev, custom
 *      scheme in prod) with `?token=<jwt>` appended.
 *
 * Without these two steps, `getSession()` returns null and the desktop
 * never receives a usable token.
 */
export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<Status text="Loading…" />}>
      <CallbackInner />
    </Suspense>
  );
}

function CallbackInner() {
  const search = useSearchParams();
  const [status, setStatus] = useState("Finishing sign-in…");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const ott = search.get("ott");
      if (!ott) {
        setStatus(
          "Sign-in didn't complete (no token). You can close this tab.",
        );
        return;
      }

      try {
        // 1. Exchange the OTT for a session. `authClient.$fetch` runs
        //    through the `crossDomain` client hooks which persist the
        //    cookie into localStorage and replay it as the
        //    `Better-Auth-Cookie` header on subsequent calls.
        const { error: verifyError } = await authClient.$fetch(
          "/cross-domain/one-time-token/verify",
          { method: "POST", body: { token: ott } },
        );
        if (verifyError) {
          throw new Error(
            `OTT exchange failed: ${verifyError.message ?? verifyError.status}`,
          );
        }

        // 2a. Mint the Convex JWT — used as the bearer on Convex queries.
        const { data: tokenData, error: tokenError } = await authClient.$fetch<{
          token: string;
        }>("/convex/token", { method: "GET" });
        if (tokenError) {
          throw new Error(
            `Convex token mint failed: ${tokenError.message ?? tokenError.status}`,
          );
        }
        const convexJwt = tokenData?.token;

        // 2b. Pick up the Better Auth session token (separate from the
        //     Convex JWT). The desktop uses this to call
        //     `/api/auth/organization/*` and other auth endpoints that
        //     the `bearer` plugin authorises via `Authorization: Bearer`.
        const { data: sessionData } = await authClient.getSession();
        const authToken = sessionData?.session?.token ?? null;

        if (cancelled) return;
        if (!convexJwt) {
          setStatus("Sign-in completed but no Convex token was issued.");
          return;
        }

        // 3. Hand off both tokens to the desktop.
        const redirect = search.get("desktop") ?? DEFAULT_REDIRECT;
        const url = new URL(redirect);
        url.searchParams.set("token", convexJwt);
        if (authToken) url.searchParams.set("authToken", authToken);
        setStatus("Returning you to Echo Live…");
        window.location.href = url.toString();
      } catch (err) {
        if (cancelled) return;
        console.error("[echolive] auth callback failed", err);
        setStatus(
          err instanceof Error
            ? `Sign-in failed: ${err.message}`
            : "Sign-in failed.",
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [search]);

  return <Status text={status} />;
}

function Status({ text }: { text: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-600 shadow-lg shadow-red-900/40">
          <Radio className="h-6 w-6 text-white" />
        </div>
        <p className="text-sm text-zinc-300">{text}</p>
        <p className="text-xs text-zinc-600">
          If nothing happens, return to the desktop app and try again.
        </p>
      </div>
    </main>
  );
}
