import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// checking identity before sending th e datat
export const fetchByChatId = query({
  args: { chatId: v.id("conversations")},
  handler: async (ctx, { chatId }) =>{
    const identity = await ctx.auth.getUserIdentity();    
    if (!identity){
      console.warn("Unauthorized attempt to fetch messages.");
      return [];
    }
    return await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", chatId))
      .collect();
  },
});

export const send = mutation({
  args: { 
    chatId: v.id("conversations"), 
    text: v.string() 
  },
  handler: async (ctx, { chatId, text }) =>{
    const identity = await ctx.auth.getUserIdentity();
    if (!identity){
      throw new Error("Authentication required to send messages.");
    }
    const messageContent = text.trim();
    if (!messageContent) {
      throw new Error("Message content cannot be empty.");
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user){
      throw new Error("User profile not found in local database.");
    }
    await ctx.db.insert("messages",{
      conversationId: chatId,
      senderId: user._id,
      content: messageContent,
    });
  },
});