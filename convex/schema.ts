import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    image: v.string(),
    clerkId: v.string(),
  })
    .index("by_clerkId", ["clerkId"])
    .searchIndex("search_name", { searchField: "name" }),
  conversations: defineTable({
    participantOne: v.id("users"),
    participantTwo: v.id("users"),
  }),
  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),
  }).index("by_conversation", ["conversationId"]),
});