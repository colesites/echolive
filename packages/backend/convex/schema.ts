import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  streams: defineTable({
    title: v.string(),
    isLive: v.boolean(),
    listeners: v.number(),
    startedAt: v.optional(v.number()),
  }),
  messages: defineTable({
    streamId: v.string(),
    author: v.string(),
    body: v.string(),
    createdAt: v.number(),
  }),
});
