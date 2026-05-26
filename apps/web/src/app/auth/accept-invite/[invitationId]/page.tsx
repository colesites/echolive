"use client";

import { use, useEffect, useState } from "react";
import { Radio } from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/authClient";

interface PageProps {
  params: Promise<{ invitationId: string }>;
}

type Status =
  | { kind: "loading" }
  | { kind: "needs-signin"; org: string | null }
  | { kind: "accepting" }
  | { kind: "accepted"; org: string }
  | { kind: "rejected" }
  | { kind: "error"; message: string };

export default function AcceptInvitePage({ params }: PageProps) {
  const { invitationId } = use(params);
  const [status, setStatus] = useState<Status>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Fetch invitation metadata. Endpoint returns 401 if the user
        // isn't signed in — we surface a sign-in CTA in that case.
        const { data, error } = await authClient.$fetch<{
          invitation: {
            id: string;
            email: string;
            role: string;
            organizationName: string;
            status: string;
          };
        }>(`/organization/get-invitation?id=${invitationId}`);
        if (cancelled) return;
        if (error) {
          if (error.status === 401 || error.status === 403) {
            setStatus({ kind: "needs-signin", org: null });
            return;
          }
          throw new Error(error.message ?? String(error.status));
        }
        setStatus({
          kind: "needs-signin",
          org: data?.invitation?.organizationName ?? null,
        });
      } catch (err) {
        if (cancelled) return;
        setStatus({
          kind: "error",
          message: err instanceof Error ? err.message : String(err),
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [invitationId]);

  const accept = async () => {
    setStatus({ kind: "accepting" });
    try {
      const { data, error } = await authClient.$fetch<{
        member?: { organizationId: string };
        invitation?: { organizationName?: string };
      }>("/organization/accept-invitation", {
        method: "POST",
        body: { invitationId },
      });
      if (error) throw new Error(error.message ?? String(error.status));
      setStatus({
        kind: "accepted",
        org: data?.invitation?.organizationName ?? "the organization",
      });
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : String(err),
      });
    }
  };

  const reject = async () => {
    try {
      await authClient.$fetch("/organization/reject-invitation", {
        method: "POST",
        body: { invitationId },
      });
      setStatus({ kind: "rejected" });
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : String(err),
      });
    }
  };

  return (
    <Shell>
      {status.kind === "loading" && <p className="text-sm text-zinc-400">Loading invitation…</p>}

      {status.kind === "needs-signin" && (
        <div className="space-y-4 text-center">
          <h1 className="text-xl font-bold">
            You&rsquo;ve been invited{status.org ? ` to ${status.org}` : ""}
          </h1>
          <p className="text-sm text-zinc-400">
            Sign in first to accept this invitation.
          </p>
          <Link
            href={`/auth/signin?callbackURL=/auth/accept-invite/${invitationId}`}
            className="inline-block rounded-lg bg-red-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-500"
          >
            Sign in to continue
          </Link>
        </div>
      )}

      {status.kind === "accepting" && (
        <p className="text-sm text-zinc-400">Accepting…</p>
      )}

      {status.kind === "accepted" && (
        <div className="space-y-4 text-center">
          <h1 className="text-xl font-bold">You&rsquo;re in.</h1>
          <p className="text-sm text-zinc-400">
            Welcome to <strong>{status.org}</strong>. Open the desktop app to
            start collaborating.
          </p>
        </div>
      )}

      {status.kind === "rejected" && (
        <p className="text-sm text-zinc-400">Invitation declined.</p>
      )}

      {status.kind === "error" && (
        <div className="space-y-3 text-center">
          <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {status.message}
          </p>
        </div>
      )}

      {/* Only render accept/decline once metadata loaded and signed-in */}
      {status.kind === "needs-signin" && status.org && (
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={reject}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={accept}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
          >
            Accept
          </button>
        </div>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-600 shadow-lg shadow-red-900/40">
            <Radio className="h-5 w-5 text-white" />
          </div>
          <p className="text-lg font-bold">Echo Live</p>
        </div>
        {children}
      </div>
    </main>
  );
}
