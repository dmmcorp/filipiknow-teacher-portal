import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,
  // Your other tables...
  users: defineTable({
    fname: v.string(),
    lname: v.string(),
    mname: v.string(),
    image: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    email: v.string(),
    role: v.union(v.literal("teacher"), v.literal("student")),
    emailVerified: v.optional(v.boolean()),
  }),
});

export default schema;
