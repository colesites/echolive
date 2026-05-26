"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { Radio } from "lucide-react";
import { authClient } from "@/lib/authClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { error: authError } = await authClient.requestPasswordReset({
        email,
        redirectTo: "/auth/reset-password",
      });
      if (authError) throw new Error(authError.message ?? "Request failed.");
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-600 shadow-lg shadow-red-900/40">
            <Radio className="h-5 w-5 text-white" />
          </div>
          <p className="text-lg font-bold">Reset your password</p>
        </div>

        {sent ? (
          <div className="space-y-3">
            <p className="text-sm text-zinc-300">
              If an account exists for <strong>{email}</strong>, a reset link is
              on its way.
            </p>
            <p className="text-xs text-zinc-500">
              Check your inbox (and spam folder). The link expires in 1 hour.
            </p>
            <Link
              href="/auth/signin"
              className="inline-block text-sm text-zinc-300 underline-offset-2 hover:underline"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Email
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                required
                autoComplete="email"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none transition-colors focus:border-red-500/60"
              />
            </label>

            {error && (
              <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy || !email}
              className="flex w-full items-center justify-center rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
            >
              {busy ? "Sending…" : "Send reset link"}
            </button>

            <p className="text-center text-xs text-zinc-500">
              <Link
                href="/auth/signin"
                className="hover:text-zinc-300 hover:underline"
              >
                Back to sign in
              </Link>
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
