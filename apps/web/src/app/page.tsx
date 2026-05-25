"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { Radio, Users } from "lucide-react";
import { api } from "@backend/convex/_generated/api";

export default function HomePage() {
  const live = useQuery(api.streams.listLive);

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col px-6 py-16">
      <header className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-600 shadow-lg shadow-red-900/40">
          <Radio className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Echo Live</h1>
          <p className="text-xs text-zinc-500">Listen live.</p>
        </div>
      </header>

      <section className="mt-12">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          On air now
        </h2>

        {live === undefined ? (
          <p className="mt-6 text-sm text-zinc-500">Loading…</p>
        ) : live.length === 0 ? (
          <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 text-sm text-zinc-400">
            Nothing is live right now. Check back later.
          </div>
        ) : (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {live.map((s) => (
              <li key={s._id}>
                <Link
                  href={`/a/live/${s.slug}`}
                  className="group flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 transition-colors hover:border-red-500/50 hover:bg-zinc-900"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-zinc-800">
                    {s.coverUrl ? (
                      <img
                        src={s.coverUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Radio className="h-7 w-7 text-red-500/60" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold group-hover:text-white">
                      {s.title}
                    </h3>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
                      <Users className="h-3 w-3" />
                      {s.listenerCount}{" "}
                      {s.listenerCount === 1 ? "listener" : "listeners"}
                    </p>
                  </div>
                  <span className="flex items-center gap-1 rounded-full bg-red-600/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    <span className="h-1 w-1 animate-pulse rounded-full bg-white" />
                    Live
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
