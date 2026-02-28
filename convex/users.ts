import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
export const syncProfile = mutation({
  args: { 
    name: v.string(), 
    email: v.string(), 
    image: v.string() 
  },
  handler: async (ctx, { name, email, image }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required to sync profile.");
    }
    const clerkId = identity.subject;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (user) {
      await ctx.db.patch(user._id, { name, image });
      return user._id;
    }
    return await ctx.db.insert("users", {
      clerkId,
      name,
      email,
      image,
    });
  },
});
export const searchProfiles = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, { searchTerm }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    let users;
    
    if (searchTerm.trim()) {
      users = await ctx.db
        .query("users")
        .withSearchIndex("search_name", (q) => q.search("name", searchTerm))
        .collect();
    } else {
      users = await ctx.db.query("users").collect();
    }
    return users.filter((user) => user.clerkId !== identity.subject);
  },
});

export const me =query({ 
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
  },
});