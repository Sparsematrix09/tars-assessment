import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
export const fetchByChatId = query({
  args: { chatId: v.id("conversations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.chatId))
      .collect();
  },
});
export const send = mutation({
  args: { chatId: v.id("conversations"), text: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User profile missing");
    await ctx.db.insert("messages", {
      conversationId: args.chatId,
      senderId: user._id,
      content: args.text,
    });
  },
});