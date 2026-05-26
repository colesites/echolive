import { v } from "convex/values";
import { mutation } from "./_generated/server";

const PRESENCE_TTL_MS = 60 * 1000;

export const heartbeat = mutation({
  args: { streamId: v.id("streams"), sessionId: v.string() },
  handler: async (ctx, { streamId, sessionId }) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("presence")
      .withIndex("by_stream_session", (q) =>
        q.eq("streamId", streamId).eq("sessionId", sessionId),
      )
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { lastSeenAt: now });
    } else {
      await ctx.db.insert("presence", { streamId, sessionId, lastSeenAt: now });
    }
    // Opportunistic GC + count update.
    const all = await ctx.db
      .query("presence")
      .withIndex("by_stream", (q) => q.eq("streamId", streamId))
      .collect();
    const cutoff = now - PRESENCE_TTL_MS;
    let active = 0;
    for (const row of all) {
      if (row.lastSeenAt < cutoff) {
        await ctx.db.delete(row._id);
      } else {
        active += 1;
      }
    }
    const stream = await ctx.db.get(streamId);
    if (stream && stream.listenerCount !== active) {
      await ctx.db.patch(streamId, { listenerCount: active });
    }
    return { listeners: active };
  },
});

export const leave = mutation({
  args: { streamId: v.id("streams"), sessionId: v.string() },
  handler: async (ctx, { streamId, sessionId }) => {
    const existing = await ctx.db
      .query("presence")
      .withIndex("by_stream_session", (q) =>
        q.eq("streamId", streamId).eq("sessionId", sessionId),
      )
      .unique();
    if (existing) await ctx.db.delete(existing._id);
  },
});
