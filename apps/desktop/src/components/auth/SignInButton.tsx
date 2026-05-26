"use client";

import { useEffect, useState } from "react";
import { LogIn, LogOut, User } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { openUrl } from "@tauri-apps/plugin-opener";
import { Button } from "../ui/button";
import { authClient, signOut } from "../../lib/authClient";
import { env } from "../../lib/convex";
import { loadToken, onTokenChange, saveToken } from "../../lib/session";

const PROD_DEEP_LINK = "echolive://auth/callback";

/**
 * Opens the web sign-in page in the OS default browser.
 *
 * Dev: spins up a loopback HTTP server (port 53682) and uses
 * `http://127.0.0.1:53682/` as the callback. macOS routes the URL to
 * the live dev process, not the installed production .app.
 *
 * Prod: uses the registered `echolive://` URL scheme via the bundle's
 * Info.plist. This works because in prod there's only one .app
 * claiming the scheme.
 */
export function SignInButton() {
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void loadToken().then(async (token) => {
      setAuthed(!!token);
      if (token) await refreshProfile(setEmail);
    });
    return onTokenChange(async (token) => {
      setAuthed(!!token);
      if (token) await refreshProfile(setEmail);
      else setEmail(null);
    });
  }, []);

  const onSignIn = async () => {
    setBusy(true);
    try {
      // Where the desktop ultimately wants the token delivered.
      let desktopRedirect: string;
      if (import.meta.env.DEV) {
        const port = await invoke<number>("start_auth_callback_server");
        desktopRedirect = `http://127.0.0.1:${port}/`;
      } else {
        desktopRedirect = PROD_DEEP_LINK;
      }

      // Better Auth doesn't append a bearer to an arbitrary callback URL.
      // Route through the web `/auth/callback` page which (a) reads the
      // session to get the cross-domain bearer, then (b) forwards to the
      // desktop URL with `?token=...` appended.
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

  const onSignOut = async () => {
    setBusy(true);
    try {
      await signOut().catch(() => {
        // Server may have already expired the session; swallow.
      });
      await saveToken(null);
    } finally {
      setBusy(false);
    }
  };

  if (authed) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={onSignOut}
        disabled={busy}
        title={email ?? "Signed in"}
        className="text-xs text-zinc-400 hover:text-white"
      >
        <User className="mr-1.5 h-3.5 w-3.5" />
        <span className="max-w-[120px] truncate">{email ?? "Signed in"}</span>
        <LogOut className="ml-1.5 h-3 w-3 opacity-60" />
      </Button>
    );
  }

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

async function refreshProfile(setEmail: (v: string | null) => void) {
  try {
    const { data } = await authClient.getSession();
    setEmail(data?.user?.email ?? null);
  } catch {
    setEmail(null);
  }
}
