"use client";

import { useEffect, useState } from "react";
import { LogIn } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { openUrl } from "@tauri-apps/plugin-opener";
import { Button } from "../ui/button";
import { env } from "../../lib/convex";
import { loadToken, onTokenChange } from "../../lib/session";

const PROD_DEEP_LINK = "echolive://auth/callback";

/**
 * Topbar entry point for signing in. Renders nothing when the user is
 * already authenticated — the avatar+dropdown in the sidebar is the
 * single source of truth for signed-in state.
 *
 * Dev: spins up a loopback HTTP server on a random port and uses
 * `http://127.0.0.1:<port>/` as the callback so macOS routes the URL
 * to the running dev binary instead of any installed production .app.
 *
 * Prod: uses the registered `echolive://` URL scheme via the bundle's
 * Info.plist — works because the production .app is the only handler.
 */
export function SignInButton() {
  const [authed, setAuthed] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void loadToken().then((token) => setAuthed(!!token));
    return onTokenChange((token) => setAuthed(!!token));
  }, []);

  // Signed in → sidebar UserMenu handles display + sign-out. Nothing here.
  if (authed) return null;

  const onSignIn = async () => {
    setBusy(true);
    try {
      let desktopRedirect: string;
      if (import.meta.env.DEV) {
        const port = await invoke<number>("start_auth_callback_server");
        desktopRedirect = `http://127.0.0.1:${port}/`;
      } else {
        desktopRedirect = PROD_DEEP_LINK;
      }

      // Better Auth doesn't append a bearer to an arbitrary callback URL.
      // Route through `/auth/callback` on the web app, which exchanges the
      // one-time token + mints the Convex JWT, then redirects here.
      const callbackPage = new URL(
        `${env.authHost.replace(/\/$/, "")}/auth/callback`,
      );
      callbackPage.searchParams.set("desktop", desktopRedirect);

      const url = new URL(`${env.authHost.replace(/\/$/, "")}/auth/signin`);
      url.searchParams.set("callbackURL", callbackPage.toString());
      await openUrl(url.toString());
    } catch (err) {
      console.error("[echolive] Sign-in failed to launch:", err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onSignIn}
      disabled={busy}
      className="text-xs"
    >
      <LogIn className="mr-1.5 h-3.5 w-3.5" />
      Sign in
    </Button>
  );
}
