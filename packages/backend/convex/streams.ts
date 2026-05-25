import { v } from "convex/values";
import { mutation, query, type MutationCtx } from "./_generated/server";
import { generateStreamKey, STREAM_KEY_TTL_MS } from "./lib/streamKey";
import { generateSlug } from "./lib/slug";

// Each `startStream` creates a fresh row with a random slug, so every
// session gets its own URL like `/a/live/<slug>`. Past streams keep
// their rows for history / replay later.

/** Public read by slug (the URL viewers visit). */
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const stream = await ctx.db
      .query("streams")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!stream) return null;
    // Strip the publish key. `hlsUrl` is fine to expose — viewers can't
    // re-publish to it because MediaMTX blocks concurrent publishes and the
    // key is burned by `endStream` anyway.
    const { streamKey, streamKeyExpiresAt, ...safe } = stream;
    void streamKey;
    void streamKeyExpiresAt;
    const coverUrl = stream.coverStorageId
      ? await ctx.storage.getUrl(stream.coverStorageId)
      : null;
    return { ...safe, coverUrl };
  },
});

/** All currently-live streams (home page feed). */
export const listLive = query({
  args: {},
  handler: async (ctx) => {
    const streams = await ctx.db
      .query("streams")
      .withIndex("by_status", (q) => q.eq("status", "live"))
      .order("desc")
      .take(50);
    return Promise.all(
      streams.map(async (s) => {
        const { streamKey, streamKeyExpiresAt, hlsUrl, ...safe } = s;
        void streamKey;
        void streamKeyExpiresAt;
        void hlsUrl;
        const coverUrl = s.coverStorageId
          ? await ctx.storage.getUrl(s.coverStorageId)
          : null;
        return { ...safe, coverUrl };
      }),
    );
  },
});

/**
 * Create a brand-new stream session + mint its key in one mutation.
 *
 * Returns `{ streamId, slug, streamKey, rtmpUrl, hlsUrl, shareUrl }`. The
 * desktop hands `rtmpUrl` to FFmpeg and displays `shareUrl` for the
 * streamer to copy. `coverStorageId` is optional — if you uploaded a
 * cover before going live, pass its id and it gets bound to the new row.
 */
export const startStream = mutation({
  args: {
    title: v.string(),
    rtmpHost: v.string(),
    hlsHost: v.string(),
    webHost: v.string(),
    coverStorageId: v.optional(v.id("_storage")),
  },
  handler: async (
    ctx,
    { title, rtmpHost, hlsHost, webHost, coverStorageId },
  ) => {
    const slug = await generateUniqueSlug(ctx);
    const streamKey = generateStreamKey();
    const hlsUrl = `${hlsHost}/live/${streamKey}/index.m3u8`;
    const now = Date.now();

    const streamId = await ctx.db.insert("streams", {
      slug,
      title: title.trim() || "Echo Live",
      status: "connecting",
      streamKey,
      streamKeyExpiresAt: now + STREAM_KEY_TTL_MS,
      hlsUrl,
      startedAt: now,
      listenerCount: 0,
      coverStorageId,
    });

    return {
      streamId,
      slug,
      streamKey,
      rtmpUrl: `${rtmpHost}/live/${streamKey}`,
      hlsUrl,
      shareUrl: `${webHost}/a/live/${slug}`,
    };
  },
});

/** Called once FFmpeg reports a healthy connection. */
export const markPublishStarted = mutation({
  args: { streamId: v.id("streams") },
  handler: async (ctx, { streamId }) => {
    const stream = await ctx.db.get(streamId);
    if (!stream) throw new Error("Stream not found");
    await ctx.db.patch(streamId, { status: "live" });
  },
});

export const endStream = mutation({
  args: { streamId: v.id("streams") },
  handler: async (ctx, { streamId }) => {
    const stream = await ctx.db.get(streamId);
    if (!stream) throw new Error("Stream not found");
    await ctx.db.patch(streamId, {
      status: "ended",
      streamKey: undefined,
      streamKeyExpiresAt: undefined,
      hlsUrl: undefined,
      endedAt: Date.now(),
      listenerCount: 0,
    });
  },
});

/** Emergency end: flip every still-live stream to ended (for stuck cleanup). */
export const endAllLive = mutation({
  args: {},
  handler: async (ctx) => {
    const stuck = await ctx.db
      .query("streams")
      .withIndex("by_status", (q) => q.eq("status", "live"))
      .collect();
    const connecting = await ctx.db
      .query("streams")
      .withIndex("by_status", (q) => q.eq("status", "connecting"))
      .collect();
    const now = Date.now();
    for (const s of [...stuck, ...connecting]) {
      await ctx.db.patch(s._id, {
        status: "ended",
        streamKey: undefined,
        streamKeyExpiresAt: undefined,
        hlsUrl: undefined,
        endedAt: now,
        listenerCount: 0,
      });
    }
    return { ended: stuck.length + connecting.length };
  },
});

export const updateTitle = mutation({
  args: { streamId: v.id("streams"), title: v.string() },
  handler: async (ctx, { streamId, title }) => {
    await ctx.db.patch(streamId, { title });
  },
});

/** Generate a Convex Storage upload URL for the cover image. */
export const generateCoverUploadUrl = mutation({
  args: {},
  handler: async (ctx) => await ctx.storage.generateUploadUrl(),
});

// ───── helpers ─────

async function generateUniqueSlug(ctx: MutationCtx): Promise<string> {
  // 50 bits of entropy → collisions are astronomically rare, but defend
  // against them anyway. Try a handful before giving up.
  for (let i = 0; i < 8; i += 1) {
    const slug = generateSlug();
    const clash = await ctx.db
      .query("streams")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!clash) return slug;
  }
  throw new Error("Failed to generate unique slug after 8 attempts");
}
