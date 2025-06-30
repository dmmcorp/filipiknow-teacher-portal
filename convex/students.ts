import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

export const createStudent = internalMutation({
  args: {
    userId: v.id("users"),
    section: v.string(),
    gradeLevel: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId, section, gradeLevel } = args;

    // Check if the user already has a student record
    const existingStudent = await ctx.db
      .query("students")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (existingStudent) {
      throw new Error("Student record already exists for this user.");
    }
    const student = {
      userId,
      section,
      gradeLevel,
    };

    const studentId = await ctx.db.insert("students", student);
    return studentId;
  },
});
