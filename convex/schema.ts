import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,
  users: defineTable({
    fname: v.string(),
    lname: v.string(),
    image: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    email: v.string(),
    role: v.union(v.literal("teacher"), v.literal("student")),
    emailVerified: v.optional(v.boolean()),
    licenseNumber: v.string(),
    gradeLevel: v.string(),
  }),
});

export default schema;
