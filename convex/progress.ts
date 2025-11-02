import { v } from 'convex/values';
import { NovelType } from '../src/lib/types';
import { internalMutation, internalQuery } from './_generated/server';

export const getProgress = internalQuery({
  args: {
    studentId: v.id('students'),
    cachedUpdatedAt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query('progress')
      .withIndex('by_studentId', (q) => q.eq('studentId', args.studentId))
      .first();
    if (!progress) {
      throw new Error('Progress not found for the given student ID.');
    }

    if (args.cachedUpdatedAt && progress.updatedAt) {
      if (args.cachedUpdatedAt === progress.updatedAt) {
        return {
          success: true,
          message: 'No updates available',
        };
      }
    }
    return { success: true, progress };
  },
});

export const createProgress = internalMutation({
  args: {
    studentId: v.id('students'),
  },
  handler: async (ctx, args) => {
    const student = await ctx.db.get(args.studentId);
    if (!student) {
      throw new Error('Student not found for the given ID.');
    }
    const hasProgress = await ctx.db
      .query('progress')
      .withIndex('by_studentId', (q) => q.eq('studentId', args.studentId))
      .first();

    if (hasProgress) {
      return hasProgress._id; // Return existing progress ID if it exists
    }

    const current_novel: NovelType =
      student.gradeLevel === 'Grade 9'
        ? 'Noli me tangere'
        : 'El Filibusterismo';

    const progress = {
      studentId: args.studentId,
      novel: current_novel,
      current_chapter: 1, // Start at chapter 1
      current_level: 1, // Start at level 1
      completed: 0,
    };

    const progressId = await ctx.db.insert('progress', progress);
    return progressId;
  },
});
