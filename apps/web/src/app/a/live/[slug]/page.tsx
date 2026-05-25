"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { Radio, Users } from "lucide-react";
import { api } from "@backend/convex/_generated/api";
import { AudioPlayer } from "@/components/AudioPlayer";
import { ChatPanel } from "@/components/ChatPanel";
import { usePresenceHeartbeat } from "@/hooks/usePresenceHeartbeat";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ListenPage({ params }: PageProps) {
  const { slug } = use(params);
  const stream = useQuery(api.streams.getBySlug, { slug });

  usePresenceHeartbeat(stream?._id);

  if (stream === undefined) {
    return <CenteredMessage>Loading stream…</CenteredMessage>;
  }
  if (stream === null) {
    return (
      <CenteredMessage>
        <p className="text-lg font-medium">No stream at /a/{slug}</p>
        <p className="mt-1 text-sm text-zinc-500">
          The creator hasn&rsquo;t set up this URL yet.
        </p>
      </CenteredMessage>
    );
  }

  const isLive = stream.status === "live";
  const isStarting = stream.status === "connecting";

  return (
    <main className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100 md:flex-row">
      <section className="flex flex-1 flex-col items-center justify-center px-6 py-12 md:py-0">
        <div className="w-full max-w-md">
          {/* Cover */}
          <div className="relative mx-auto aspect-square w-64 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl">
            {stream.coverUrl ? (
              <img
                src={stream.coverUrl}
                alt={stream.title}
                className={cn(
                  "h-full w-full object-cover",
                  isLive && "animate-spin-slow",
                )}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-800">
                <Radio
                  className={cn(
                    "h-24 w-24 text-red-500/60",
                    isLive && "animate-pulse",
                  )}
                />
              </div>
            )}
            {isLive && (
              <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-red-600/90 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-lg">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                Live
              </span>
            )}
          </div>

          {/* Title + meta */}
          <div className="mt-8 text-center">
            <h1 className="text-2xl font-bold tracking-tight">
              {stream.title}
            </h1>
            <div className="mt-2 flex items-center justify-center gap-4 text-sm text-zinc-500">
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                {stream.listenerCount}{" "}
                {stream.listenerCount === 1 ? "listener" : "listeners"}
              </span>
              <StatusPill status={stream.status} />
            </div>
          </div>

          {/* Player */}
          <div className="mt-10">
            {isLive ? (
              <AudioPlayer hlsUrl={stream.hlsUrl ?? null} isLive />
            ) : (
              <OfflineNotice starting={isStarting} />
            )}
          </div>
        </div>
      </section>

      <ChatPanel streamId={stream._id} />
    </main>
  );
}

function StatusPill({ status }: { status: string }) {
  const label = status === "live" ? "On air" : status === "connecting" ? "Connecting" : "Off air";
  const color =
    status === "live"
      ? "text-red-400"
      : status === "connecting"
        ? "text-amber-400"
        : "text-zinc-500";
  return <span className={color}>{label}</span>;
}

function OfflineNotice({ starting }: { starting: boolean }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 text-center">
      <p className="text-sm font-medium text-zinc-300">
        {starting ? "Stream is starting…" : "We&rsquo;re off air right now."}
      </p>
      <p className="mt-1 text-xs text-zinc-500">
        {starting
          ? "The first listener may need a few seconds before audio kicks in."
          : "Check back when the broadcast begins."}
      </p>
    </div>
  );
}

function CenteredMessage({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-center text-zinc-300">
      <div>{children}</div>
    </main>
  );
}
