import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
export const syncProfile = mutation({
  args: { name: v.string(), email: v.string(), image: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (existingUser) {
      return await ctx.db.patch(existingUser._id, {
        name: args.name,
        image: args.image,
      });
    }

    return await ctx.db.insert("users", {
      clerkId: identity.subject,
      name: args.name,
      email: args.email,
      image: args.image,
    });
  },
});
export const searchProfiles = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    let foundUsers;
    if (args.query) {
      foundUsers = await ctx.db
        .query("users")
        .withSearchIndex("search_name", (q) => q.search("name", args.query))
        .collect();
    } else {
      foundUsers = await ctx.db.query("users").collect();
    }
    return foundUsers.filter((u) => u.clerkId !== identity.subject);
  },
});
export const me = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
  },
});