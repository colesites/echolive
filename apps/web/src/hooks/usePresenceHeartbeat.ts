"use client";

import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@backend/convex/_generated/api";
import type { Id } from "@backend/convex/_generated/dataModel";
import { getSessionId } from "@/lib/sessionId";

const HEARTBEAT_MS = 20_000;

/** Heartbeat into Convex presence so the listener count stays accurate. */
export function usePresenceHeartbeat(streamId: Id<"streams"> | undefined) {
  const heartbeat = useMutation(api.presence.heartbeat);
  const leave = useMutation(api.presence.leave);

  useEffect(() => {
    if (!streamId) return;
    const sessionId = getSessionId();
    let cancelled = false;

    const tick = () => {
      if (cancelled) return;
      heartbeat({ streamId, sessionId }).catch((err) =>
        console.warn("[echolive] heartbeat failed:", err),
      );
    };
    tick();
    const id = window.setInterval(tick, HEARTBEAT_MS);

    const onUnload = () => {
      // Best-effort — `keepalive` lets the request survive page unload.
      leave({ streamId, sessionId }).catch(() => {});
    };
    window.addEventListener("pagehide", onUnload);

    return () => {
      cancelled = true;
      window.clearInterval(id);
      window.removeEventListener("pagehide", onUnload);
      leave({ streamId, sessionId }).catch(() => {});
    };
  }, [streamId, heartbeat, leave]);
}
