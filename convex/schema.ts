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
    licenseNumber: v.optional(v.string()),
    gradeLevel: v.optional(v.string()),
    certification: v.optional(v.string()),
  }),

  students: defineTable({
    userId: v.id("users"),
    section: v.string(),
    gradeLevel: v.string(),
  }),

  dialogues: defineTable({
    chapter: v.number(), // e.g. 1
    level: v.number(), // e.g. 2
    scenes: v.array(
      v.object({
        speaker: v.string(),
        text: v.string(),
      })
    ),
  }),
});

export default schema;
