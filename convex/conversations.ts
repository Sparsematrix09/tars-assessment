import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
// get the Convex user from Clerk auth token
const getActiveConvexUser = async (ctx: QueryCtx | MutationCtx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  
  return await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .unique();
};
export const findOrCreate = mutation({
  args: { targetUserId: v.id("users") },
  handler: async (ctx, args) => {
    const currentUser = await getActiveConvexUser(ctx);
    if (!currentUser) throw new Error("Unauthorized");
    const existingChat = await ctx.db
      .query("conversations")
      .filter((q) =>
        q.or(
          q.and(
            q.eq(q.field("participantOne"), currentUser._id),
            q.eq(q.field("participantTwo"), args.targetUserId)
          ),
          q.and(
            q.eq(q.field("participantOne"), args.targetUserId),
            q.eq(q.field("participantTwo"), currentUser._id)
          )
        )
      )
      .first();
    if (existingChat) return existingChat._id;
    return await ctx.db.insert("conversations", {
      participantOne: currentUser._id,
      participantTwo: args.targetUserId,
    });
  },
});
export const getUserChats = query({
  handler: async (ctx) => {
    const currentUser = await getActiveConvexUser(ctx);
    if (!currentUser) return [];
    const rawChats = await ctx.db
      .query("conversations")
      .filter((q) =>
        q.or(
          q.eq(q.field("participantOne"), currentUser._id),
          q.eq(q.field("participantTwo"), currentUser._id)
        )
      )
      .collect();
    const richChats = await Promise.all(
      rawChats.map(async (chat) => {
        const otherId = chat.participantOne === currentUser._id ? chat.participantTwo : chat.participantOne;
        const otherUser = await ctx.db.get(otherId);       
        const latestMsg = await ctx.db
          .query("messages")
          .withIndex("by_conversation", (q) => q.eq("conversationId", chat._id))
          .order("desc")
          .first();
        return { ...chat, otherUser, latestMsg };
      })
    );
    return richChats.sort((a, b) => {
      const timeA = a.latestMsg?._creationTime || a._creationTime;
      const timeB = b.latestMsg?._creationTime || b._creationTime;
      return timeB - timeA;
    });
  },
});