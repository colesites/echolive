import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get the active stream (read-only query, no inserts allowed)
export const getLiveStream = query({
  args: {},
  handler: async (ctx) => {
    const stream = await ctx.db
      .query("streams")
      .order("desc")
      .first();
    return stream;
  },
});

// Initialize a default stream record (call once from frontend on first load)
export const initStream = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("streams").first();
    if (existing) return existing._id;

    const id = await ctx.db.insert("streams", {
      title: "Echo Live Stream",
      isLive: false,
      listeners: 0,
    });
    return id;
  },
});

// Update stream status (Live vs Offline)
export const updateStreamStatus = mutation({
  args: {
    id: v.id("streams"),
    isLive: v.boolean(),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const patch: { isLive: boolean; startedAt?: number; title?: string } = {
      isLive: args.isLive,
    };
    if (args.isLive) {
      patch.startedAt = Date.now();
    }
    if (args.title !== undefined) {
      patch.title = args.title;
    }
    await ctx.db.patch(args.id, patch);
  },
});

// Update stream title
export const updateStreamTitle = mutation({
  args: {
    id: v.id("streams"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { title: args.title });
  },
});

// Change listener count
export const updateListeners = mutation({
  args: {
    id: v.id("streams"),
    delta: v.number(), // +1 or -1
  },
  handler: async (ctx, args) => {
    const stream = await ctx.db
      .query("streams")
      .filter((q) => q.eq(q.field("_id"), args.id))
      .first();
    if (stream) {
      const newListeners = Math.max(0, stream.listeners + args.delta);
      await ctx.db.patch(args.id, { listeners: newListeners });
    }
  },
});
