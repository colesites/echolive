import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    streamId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    return await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("streamId"), args.streamId))
      .order("desc")
      .take(limit);
  },
});

export const send = mutation({
  args: {
    streamId: v.string(),
    author: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", {
      streamId: args.streamId,
      author: args.author,
      body: args.body,
      createdAt: Date.now(),
    });
  },
});
