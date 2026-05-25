"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { MessageSquare, Send } from "lucide-react";
import { api } from "@backend/convex/_generated/api";
import type { Id } from "@backend/convex/_generated/dataModel";
import { loadGuestName, saveGuestName } from "@/lib/guestName";

interface ChatPanelProps {
  streamId: Id<"streams"> | undefined;
}

export function ChatPanel({ streamId }: ChatPanelProps) {
  const messages = useQuery(
    api.chat.list,
    streamId ? { streamId } : "skip",
  );
  const send = useMutation(api.chat.send);

  const [name, setName] = useState("Guest");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setName(loadGuestName());
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!streamId) return;
    const trimmed = body.trim();
    if (!trimmed) return;
    setSending(true);
    setError(null);
    try {
      saveGuestName(name);
      await send({ streamId, guestName: name, body: trimmed });
      setBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <aside className="flex h-full w-full flex-col bg-zinc-950/60 md:w-96 md:border-l md:border-zinc-900">
      <header className="flex items-center justify-between border-b border-zinc-900 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <MessageSquare className="h-4 w-4 text-red-400" />
          Live Chat
        </div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={32}
          aria-label="Your display name"
          className="w-32 rounded-md border border-zinc-800 bg-zinc-900/60 px-2 py-1 text-right text-xs text-zinc-300 outline-none focus:border-zinc-600"
        />
      </header>

      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
      >
        {messages === undefined ? (
          <p className="text-center text-xs text-zinc-600">Loading chat…</p>
        ) : messages.length === 0 ? (
          <p className="mt-12 text-center text-xs text-zinc-600">
            No messages yet. Say hello.
          </p>
        ) : (
          messages.map((m) => (
            <div key={m._id} className="text-sm">
              <div className="mb-0.5 flex items-baseline gap-2">
                <span className="text-xs font-semibold text-red-400">
                  {m.guestName}
                </span>
                <time className="text-[10px] text-zinc-600">
                  {new Date(m.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
              </div>
              <p className="break-words leading-relaxed text-zinc-200">
                {m.body}
              </p>
            </div>
          ))
        )}
      </div>

      <form
        onSubmit={onSubmit}
        className="border-t border-zinc-900 bg-zinc-950/80 p-3"
      >
        {error && (
          <p className="mb-2 rounded border border-red-500/30 bg-red-500/10 px-2 py-1 text-xs text-red-300">
            {error}
          </p>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={500}
            placeholder={streamId ? "Send a message…" : "Loading…"}
            disabled={!streamId || sending}
            className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-red-500/60 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!body.trim() || sending || !streamId}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-600 text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Send"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </aside>
  );
}
