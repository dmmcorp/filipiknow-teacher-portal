import { v } from 'convex/values';
import { internal } from './_generated/api';
import { Id } from './_generated/dataModel';
import { httpAction, internalMutation } from './_generated/server';

export const recordStudentScore = httpAction(async (ctx, request) => {
  try {
    const { progressId, score, time_spent, gameId } = await request.json();

    const parsedScore = Number(score);
    const parsedTime = Number(time_spent);
    // Validate inputs
    if (!progressId || isNaN(parsedScore) || isNaN(parsedTime) || !gameId) {
      console.log(progressId, score, time_spent, gameId);
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Run mutation
    const result = await ctx.runMutation(
      internal.student_scores.createStudentScoresRecord,
      {
        progressId: progressId as Id<'progress'>,
        score: Number(score),
        time_spent: Number(time_spent),
        gameId: gameId as Id<'games'>,
      }
    );

    return new Response(JSON.stringify({ success: true, data: result }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('createRecord error:', error);
    if (error.message.includes('Already submitted')) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 403, // or 409 Conflict
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
    return new Response(
      JSON.stringify({
        success: false,
        error: error?.message ?? 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});

export const createStudentScoresRecord = internalMutation({
  args: {
    progressId: v.id('progress'),
    score: v.number(),
    time_spent: v.number(),
    gameId: v.id('games'),
  },
  handler: async (ctx, args) => {
    const studentProgresses = await ctx.db
      .query('student_scores')
      .withIndex('by_progressId', (q) => q.eq('progressId', args.progressId))
      .filter((q) => q.eq(q.field('gameId'), args.gameId))
      .collect();

    if (studentProgresses.length > 0) {
      throw new Error('Already submitted score for this game.');
    }
    const progress = await ctx.db.get(args.progressId);
    if (!progress) throw new Error('No progress found!');
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error('No game found!');
    const level = await ctx.db.get(game.levelId);
    if (!level) throw new Error('No level found!');
    const chapter = await ctx.db.get(level.chapterId);
    if (!chapter) throw new Error('No chapter found!');

    const currentLevel = level.levelNo;
    const isLevelTen = currentLevel === 10;
    const nextLevel = currentLevel >= 10 ? 1 : currentLevel + 1;

    const isNoli =
      chapter.chapter_title.toLocaleLowerCase() === 'noli me tanger';
    const chapterLimit = isNoli ? 64 : 39;

    let currentChapter = chapter.chapter;

    // Only increment chapter if it's level 10 and under the limit
    if (isLevelTen && currentChapter < chapterLimit) {
      currentChapter += 1;
    }
    // Insert record
    const recordId = await ctx.db.insert('student_scores', {
      ...args,
    });

    // Update progress points
    await ctx.db.patch(args.progressId, {
      ...progress,
      total_points: (progress.total_points ?? 0) + args.score,
      current_level: nextLevel,
      current_chapter: currentChapter,
      updatedAt: new Date().toISOString(),
    });

    return {
      recordId,
      updatedPoints: (progress.total_points ?? 0) + args.score,
      nextLevel: nextLevel,
      currentChapter: currentChapter,
      updatedAt: new Date().toISOString(),
    };
  },
});
