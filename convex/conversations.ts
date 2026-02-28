import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { v } from "convex/values";

const getAuthenticatedUser =async (ctx: QueryCtx | MutationCtx) =>{
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  
  return await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .unique();
};

export const findOrCreate =mutation({
  args: { targetUserId: v.id("users") },
  handler: async (ctx, { targetUserId }) => {
    const currentUser = await getAuthenticatedUser(ctx);
    if (!currentUser) throw new Error("Unauthorized access.");

    const existingChat =await ctx.db
      .query("conversations")
      .filter((q) =>
        q.or(
          q.and(
            q.eq(q.field("participantOne"), currentUser._id),
            q.eq(q.field("participantTwo"), targetUserId)
          ),
          q.and(
            q.eq(q.field("participantOne"), targetUserId),
            q.eq(q.field("participantTwo"), currentUser._id)
          )
        )
      )
      .first();

    if (existingChat) return existingChat._id;
    return await ctx.db.insert("conversations",{
      participantOne: currentUser._id,
      participantTwo: targetUserId,
    });
  },
});

export const getUserChats =query({
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) return [];

    const conversationList = await ctx.db
      .query("conversations")
      .filter((q) =>
        q.or(
          q.eq(q.field("participantOne"), user._id),
          q.eq(q.field("participantTwo"), user._id)
        )
      )
      .collect();

    const chatPreviews =await Promise.all(
      conversationList.map(async(convo) =>{
        const partnerId = convo.participantOne === user._id ? convo.participantTwo : convo.participantOne;
        const otherUser = await ctx.db.get(partnerId);       
        
        const latestMsg = await ctx.db
          .query("messages")
          .withIndex("by_conversation", (q) => q.eq("conversationId", convo._id))
          .order("desc")
          .first();

        return { ...convo, otherUser, latestMsg};
      })
    );

    return chatPreviews.sort((a, b) =>{
      const timestampA=a.latestMsg?._creationTime ?? a._creationTime;
      const timestampB=b.latestMsg?._creationTime ?? b._creationTime;
      return timestampB-timestampA;
    });
  },
});