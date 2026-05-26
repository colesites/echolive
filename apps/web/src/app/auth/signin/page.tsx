"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Radio } from "lucide-react";
import { signIn, signUp } from "@/lib/authClient";

const DEFAULT_CALLBACK =
  process.env.NEXT_PUBLIC_DESKTOP_REDIRECT ?? "echolive://auth/callback";

export default function SignInPage() {
  return (
    <Suspense fallback={<Centered>Loading…</Centered>}>
      <SignInInner />
    </Suspense>
  );
}

function SignInInner() {
  const router = useRouter();
  const search = useSearchParams();
  const callbackURL = search.get("callbackURL") ?? DEFAULT_CALLBACK;

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onGoogle = async () => {
    setError(null);
    setSubmitting(true);
    try {
      // Better Auth handles the entire OAuth dance; it redirects the
      // browser to Google, then back to our convex.site callback, then
      // finally to `callbackURL` (the desktop deep link).
      await signIn.social({ provider: "google", callbackURL });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setSubmitting(false);
    }
  };

  const onEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const fn =
        mode === "signin"
          ? () => signIn.email({ email, password, callbackURL })
          : () => signUp.email({ email, password, name, callbackURL });
      const { error: authError } = await fn();
      if (authError) {
        setError(authError.message ?? "Sign-in failed");
        setSubmitting(false);
        return;
      }
      // Successful email sign-in stays on this origin — manually
      // redirect to the callback URL so the desktop flow completes.
      if (callbackURL.startsWith("echolive://")) {
        window.location.href = callbackURL;
      } else {
        router.push(callbackURL);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-600 shadow-lg shadow-red-900/40">
            <Radio className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Echo Live</h1>
            <p className="text-xs text-zinc-500">
              {mode === "signin" ? "Sign in to your account" : "Create your account"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onGoogle}
          disabled={submitting}
          className="mb-5 flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-100 transition-colors hover:bg-zinc-800 disabled:opacity-50"
        >
          <GoogleGlyph />
          Continue with Google
        </button>

        <Divider />

        <form onSubmit={onEmailSubmit} className="mt-5 space-y-3">
          {mode === "signup" && (
            <Field
              label="Name"
              type="text"
              value={name}
              onChange={setName}
              autoComplete="name"
              required
            />
          )}
          <Field
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            autoComplete="email"
            required
          />
          <Field
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            required
            minLength={8}
          />

          {error && (
            <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-900/30 transition-colors hover:bg-red-500 disabled:opacity-50"
          >
            {submitting ? "Working…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-zinc-500">
          {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
            }}
            className="text-zinc-300 underline-offset-2 hover:underline"
          >
            {mode === "signin" ? "Create one" : "Sign in"}
          </button>
        </p>
      </div>
    </main>
  );
}

type FieldProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value"
> & {
  label: string;
  value: string;
  onChange: (v: string) => void;
};

function Field({ label, value, onChange, type, ...rest }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none transition-colors focus:border-red-500/60"
        {...rest}
      />
    </label>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3 text-[10px] uppercase tracking-wider text-zinc-600">
      <span className="h-px flex-1 bg-zinc-800" />
      or with email
      <span className="h-px flex-1 bg-zinc-800" />
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="m6.3 14.7 6.6 4.8C14.6 16.1 19 13 24 13c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.6 7.1 29.6 5 24 5 16.3 5 9.7 9.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.4 0 10.3-2.1 14-5.4l-6.5-5.5C29.6 34.6 27 36 24 36c-5.3 0-9.7-3.4-11.3-8L6.1 33C9.5 39.4 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.5 5.5C42.8 35.8 44 30.3 44 24c0-1.3-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400">
      {children}
    </main>
  );
}
