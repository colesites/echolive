import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Echo Live — Convex schema (Phase 1: audio MVP, single-tenant).
 *
 * Phase 1 = one church = one stream. No users table, no ownership checks.
 * CP2b (Better Auth) reintroduces `users` + per-user `ownerId` + auth gates.
 */

export const streamStatus = v.union(
  v.literal("idle"),
  v.literal("connecting"),
  v.literal("live"),
  v.literal("ended"),
  v.literal("error"),
);

export default defineSchema({
  streams: defineTable({
    slug: v.string(),
    title: v.string(),
    status: streamStatus,
    streamKey: v.optional(v.string()),
    streamKeyExpiresAt: v.optional(v.number()),
    // Public HLS URL exposed to viewers while live. Embeds the streamKey,
    // but viewers reach it through `/a/<slug>` — they never see the URL.
    hlsUrl: v.optional(v.string()),
    startedAt: v.optional(v.number()),
    endedAt: v.optional(v.number()),
    listenerCount: v.number(),
    coverStorageId: v.optional(v.id("_storage")),
  })
    .index("by_slug", ["slug"])
    .index("by_stream_key", ["streamKey"])
    .index("by_status", ["status"]),

  chatMessages: defineTable({
    streamId: v.id("streams"),
    guestName: v.string(),
    body: v.string(),
  }).index("by_stream", ["streamId"]),

  presence: defineTable({
    streamId: v.id("streams"),
    sessionId: v.string(),
    lastSeenAt: v.number(),
  })
    .index("by_stream_session", ["streamId", "sessionId"])
    .index("by_stream", ["streamId"]),
});
