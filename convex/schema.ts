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
    role: v.union(
      v.literal("teacher"),
      v.literal("student"),
      v.literal("admin")
    ),
    emailVerified: v.optional(v.boolean()),
    licenseNumber: v.optional(v.string()),
    gradeLevel: v.optional(v.string()),
    certification: v.optional(v.string()),
  }),

  students: defineTable({
    userId: v.id("users"),
    section: v.string(),
    gradeLevel: v.string(),
  }).index("by_userId", ["userId"]),

  dialogues: defineTable({
    novel: v.union(
      v.literal("Noli me tangere"),
      v.literal("El Filibusterismo")
    ), // e.g "Noli me tangere"
    chapter: v.number(), // e.g. 1
    level: v.number(), // e.g. 2
    scenes: v.array(
      v.object({
        sceneNumber: v.number(), // e.g. 1, 2, 3
        speaker: v.id("characters"), // e.g. "Maria Clara"
        text: v.string(), // e.g. "I am Maria Clara"
      })
    ),
  }),

  characters: defineTable({
    novel: v.union(
      v.literal("Noli me tangere"),
      v.literal("El Filibusterismo")
    ),
    name: v.string(), // e.g. "Maria Clara"
    image: v.string(), // e.g. "https://example.com/maria_clara.jpg",
    description: v.string(), // e.g. "Maria Clara is a character in Noli me Tangere"
    role: v.optional(v.string()), // e.g. "Protagonist"
    unlocked: v.optional(v.boolean()), // e.g. true or false
    animationImages: v.optional(v.array(v.string())), // e.g. ["https://example.com/maria_clara_1.jpg", "https://example.com/maria_clara_2.jpg"]
  }),

  progress: defineTable({
    studentId: v.id("students"),
    novel: v.union(
      v.literal("Noli me tangere"),
      v.literal("El Filibusterismo")
    ), // e.g "Noli me tangere"
    current_chapter: v.number(), // e.g. kabanata 1
    current_level: v.number(), // e.g. level 2
    completed: v.number(), // e.g. 0, 1, 2, 3, 4, 5
  }).index("by_studentId", ["studentId"]),
});

export default schema;
