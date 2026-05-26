"use client";

import { Suspense, type FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Radio } from "lucide-react";
import { authClient } from "@/lib/authClient";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Shell>Loading…</Shell>}>
      <Inner />
    </Suspense>
  );
}

function Inner() {
  const router = useRouter();
  const search = useSearchParams();
  const token = search.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Missing reset token.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { error: authError } = await authClient.resetPassword({
        newPassword: password,
        token,
      });
      if (authError) throw new Error(authError.message ?? "Reset failed.");
      setDone(true);
      setTimeout(() => router.push("/auth/signin"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  if (!token) {
    return (
      <Shell>
        <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          Missing or invalid reset link.
        </p>
        <Link
          href="/auth/forgot-password"
          className="mt-3 inline-block text-sm text-zinc-300 underline-offset-2 hover:underline"
        >
          Request a new one
        </Link>
      </Shell>
    );
  }

  if (done) {
    return (
      <Shell>
        <p className="text-sm text-emerald-300">
          Password updated. Redirecting to sign in…
        </p>
      </Shell>
    );
  }

  return (
    <Shell>
      <form onSubmit={submit} className="space-y-4">
        <PasswordField
          label="New password"
          value={password}
          onChange={setPassword}
          autoFocus
          autoComplete="new-password"
        />
        <PasswordField
          label="Confirm new password"
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
        />
        {error && (
          <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="flex w-full items-center justify-center rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
        >
          {busy ? "Updating…" : "Update password"}
        </button>
      </form>
    </Shell>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  autoFocus,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoFocus?: boolean;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
        {label}
      </span>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus={autoFocus}
        autoComplete={autoComplete}
        required
        minLength={8}
        className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none transition-colors focus:border-red-500/60"
      />
    </label>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-600 shadow-lg shadow-red-900/40">
            <Radio className="h-5 w-5 text-white" />
          </div>
          <p className="text-lg font-bold">Choose a new password</p>
        </div>
        {children}
      </div>
    </main>
  );
}
