import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

const MAX_BODY = 500;
const MAX_NAME = 32;

export const list = query({
  args: { streamId: v.id("streams"), limit: v.optional(v.number()) },
  handler: async (ctx, { streamId, limit }) => {
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_stream", (q) => q.eq("streamId", streamId))
      .order("desc")
      .take(limit ?? 50);
    return messages.reverse().map((m) => ({
      _id: m._id,
      body: m.body,
      guestName: m.guestName,
      createdAt: m._creationTime,
    }));
  },
});

export const send = mutation({
  args: {
    streamId: v.id("streams"),
    guestName: v.string(),
    body: v.string(),
  },
  handler: async (ctx, { streamId, guestName, body }) => {
    const cleanBody = body.trim();
    const cleanName = guestName.trim() || "Guest";
    if (!cleanBody) throw new Error("Empty message");
    if (cleanBody.length > MAX_BODY) throw new Error("Message too long");
    if (cleanName.length > MAX_NAME) throw new Error("Name too long");
    const stream = await ctx.db.get(streamId);
    if (!stream) throw new Error("Stream not found");
    await ctx.db.insert("chatMessages", {
      streamId,
      guestName: cleanName,
      body: cleanBody,
    });
  },
});
