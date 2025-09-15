import { v } from 'convex/values';
import { Id } from './_generated/dataModel';
import { mutation, query } from './_generated/server';

export const getChaptersByNovel = query({
  args: {
    novel: v.union(
      v.literal('Noli me tangere'),
      v.literal('El Filibusterismo')
    ),
  },
  handler: async (ctx, args) => {
    const chapters = await ctx.db
      .query('chapters')
      .filter((q) => q.eq(q.field('novel'), args.novel))
      .order('asc')
      .collect();

    return chapters.map((chapter) => ({
      id: chapter._id,
      chapter: chapter.chapter,
      title: chapter.chapter_title,
      displayName: `Chapter ${chapter.chapter} (${chapter.chapter_title})`,
    }));
  },
});

export const getLevelsByChapter = query({
  args: {
    chapterId: v.id('chapters'),
  },
  handler: async (ctx, args) => {
    if (!args.chapterId) return [];

    const levels = await ctx.db
      .query('levels')
      .filter((q) => q.eq(q.field('chapterId'), args.chapterId))
      .collect();

    return levels.map((level) => ({
      id: level._id,
      levelNo: level.levelNo,
      levelType: level.levelType,
    }));
  },
});

export const checkGameExists = query({
  args: {
    chapterId: v.id('chapters'),
    levelNo: v.number(),
    section: v.id('sections'),
    assessmentGameNumber: v.optional(v.number()), // for assessment levels (1-10)
  },
  handler: async (ctx, args) => {
    // First check if level exists
    const level = await ctx.db
      .query('levels')
      .filter((q) =>
        q.and(
          q.eq(q.field('chapterId'), args.chapterId),
          q.eq(q.field('levelNo'), args.levelNo)
        )
      )
      .first();

    if (!level) {
      return false; // Level doesn't exist, so no game exists
    }

    // For assessment levels (level 10), check specific game number
    if (level.levelType === 'assessment' && args.assessmentGameNumber) {
      const existingGame = await ctx.db
        .query('games')
        .filter((q) =>
          q.and(
            q.eq(q.field('levelId'), level._id),
            q.eq(q.field('section'), args.section),
            q.eq(q.field('assessmentGameNumber'), args.assessmentGameNumber)
          )
        )
        .first();
      return !!existingGame;
    }

    // For identification levels (1-9), check if any game exists
    const existingGame = await ctx.db
      .query('games')
      .filter((q) =>
        q.and(
          q.eq(q.field('levelId'), level._id),
          q.eq(q.field('section'), args.section)
        )
      )
      .first();

    return !!existingGame;
  },
});

export const getExistingAssessmentGames = query({
  args: {
    chapterId: v.id('chapters'),
    levelNo: v.number(),
    section: v.id('sections'),
  },
  handler: async (ctx, args) => {
    // First check if level exists
    const level = await ctx.db
      .query('levels')
      .filter((q) =>
        q.and(
          q.eq(q.field('chapterId'), args.chapterId),
          q.eq(q.field('levelNo'), args.levelNo)
        )
      )
      .first();

    if (!level || level.levelType !== 'assessment') {
      return [];
    }

    // Get all existing assessment games for this level and section
    const existingGames = await ctx.db
      .query('games')
      .filter((q) =>
        q.and(
          q.eq(q.field('levelId'), level._id),
          q.eq(q.field('section'), args.section)
        )
      )
      .collect();

    return existingGames.map(game => ({
      gameNumber: game.assessmentGameNumber || 1,
      gameType: game.gameType,
      gameId: game._id,
    })).sort((a, b) => a.gameNumber - b.gameNumber);
  },
});

export const createQuiz = mutation({
  args: {
    teacherId: v.id('users'),
    section: v.id('sections'),
    novel: v.union(
      v.literal('Noli me tangere'),
      v.literal('El Filibusterismo')
    ),
    chapterId: v.id('chapters'),
    levelId: v.optional(v.id('levels')),
    levelNo: v.optional(v.number()),
    assessmentGameNumber: v.optional(v.number()), // 1-10 for assessment levels
    gameType: v.union(
      v.literal('4pics1word'),
      v.literal('multipleChoice'),
      v.literal('jigsawPuzzle'),
      v.literal('whoSaidIt'),
      v.literal('identification')
    ),
    instruction: v.string(),
    timeLimit: v.number(),
    points: v.number(),
    fourPicsOneWord: v.optional(
      v.object({
        images: v.array(v.string()),
        clue: v.string(),
        answer: v.string(),
      })
    ),
    multipleChoice: v.optional(
      v.object({
        question: v.string(),
        image: v.optional(v.string()),
        options: v.array(
          v.object({
            text: v.string(),
            isCorrect: v.boolean(),
          })
        ),
      })
    ),
    jigsawPuzzle: v.optional(
      v.object({
        image: v.string(),
        rows: v.number(),
        columns: v.number(),
      })
    ),
    whoSaidIt: v.optional(
      v.object({
        question: v.string(),
        quote: v.string(),
        hint: v.optional(v.string()),
        options: v.array(
          v.object({
            name: v.string(),
            image: v.optional(v.string()),
            isCorrect: v.optional(v.boolean()),
          })
        ),
      })
    ),
    identification: v.optional(
      v.object({
        question: v.string(),
        answer: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const chapter = await ctx.db.get(args.chapterId);
    if (!chapter) throw new Error('Chapter not found');

    const section = await ctx.db.get(args.section);
    if (!section) throw new Error('Section not found');

    // Check if a game already exists for this chapter, level, and section
    if (args.levelNo) {
      const existingLevel = await ctx.db
        .query('levels')
        .filter((q) =>
          q.and(
            q.eq(q.field('chapterId'), args.chapterId),
            q.eq(q.field('levelNo'), args.levelNo)
          )
        )
        .first();

      if (existingLevel) {

        if (existingLevel.levelType === 'assessment' && args.assessmentGameNumber) {
          const existingGame = await ctx.db
            .query('games')
            .filter((q) =>
              q.and(
                q.eq(q.field('levelId'), existingLevel._id),
                q.eq(q.field('section'), args.section),
                q.eq(q.field('assessmentGameNumber'), args.assessmentGameNumber)
              )
            )
            .first();

          if (existingGame) {
            throw new Error(`Assessment game ${args.assessmentGameNumber} already exists for Chapter ${chapter.chapter}, Level ${args.levelNo}. Please go to Quiz Management to edit the existing game.`);
          }
        } else if (existingLevel.levelType === 'identification') {
          const existingGame = await ctx.db
            .query('games')
            .filter((q) =>
              q.and(
                q.eq(q.field('levelId'), existingLevel._id),
                q.eq(q.field('section'), args.section)
              )
            )
            .first();

          if (existingGame) {
            throw new Error(`A game already exists for Chapter ${chapter.chapter}, Level ${args.levelNo}. Please go to Quiz Management to edit the existing game.`);
          }
        }
      }
    }

    let levelId = args.levelId;
    if (!levelId && args.levelNo) {
      const existingLevel = await ctx.db
        .query('levels')
        .filter((q) =>
          q.and(
            q.eq(q.field('chapterId'), args.chapterId),
            q.eq(q.field('levelNo'), args.levelNo)
          )
        )
        .first();

      if (existingLevel) {
        levelId = existingLevel._id;
      } else {
        // Create new level
        const levelType = args.levelNo <= 9 ? 'identification' : 'assessment';
        levelId = await ctx.db.insert('levels', {
          chapterId: args.chapterId,
          levelNo: args.levelNo,
          levelType,
        });
      }
    }

    if (!levelId) {
      throw new Error('Level ID is required');
    }

    const quizId = await ctx.db.insert('games', {
      teacherId: args.teacherId,
      section: args.section,
      gradeLevel: section.gradeLevel,
      novel: args.novel,
      chapterId: args.chapterId,
      levelId: levelId,
      assessmentGameNumber: args.assessmentGameNumber, // Will be undefined for identification games
      gameType: args.gameType,
      fourPicsOneWord: args.fourPicsOneWord,
      multipleChoice: args.multipleChoice,
      jigsawPuzzle: args.jigsawPuzzle,
      whoSaidIt: args.whoSaidIt,
      identification: args.identification,
      instruction: args.instruction,
      time_limit: args.timeLimit,
      points: args.points,
    });

    return quizId;
  },
});

export const getQuizzes = query({
  args: {
    teacherId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const quizzes = await ctx.db
      .query('games')
      .filter((q) => q.eq(q.field('teacherId'), args.teacherId))
      .order('desc')
      .collect();

    const quizzesWithDetails = await Promise.all(
      quizzes.map(async (quiz) => {
        if (!quiz.chapterId) throw new Error('no chapterId');
        const chapter = await ctx.db.get(quiz.chapterId);
        const level = await ctx.db.get(quiz.levelId);
        const section = await ctx.db.get(quiz.section);

        let fourPicsOneWordWithUrls;
        if (quiz.fourPicsOneWord?.images) {
          const imageUrls = await Promise.all(
            quiz.fourPicsOneWord.images.map(async (imageId) =>
              ctx.storage.getUrl(imageId as Id<'_storage'>)
            )
          );

          fourPicsOneWordWithUrls = {
            ...quiz.fourPicsOneWord,
            imageUrls,
          };
        }

        let multipleChoiceWithUrl;
        if (quiz.multipleChoice) {
          const imageUrl = quiz.multipleChoice.image
            ? await ctx.storage.getUrl(
              quiz.multipleChoice.image as Id<'_storage'>
            )
            : undefined;
          multipleChoiceWithUrl = {
            ...quiz.multipleChoice,
            imageUrl,
          };
        }

        let jigsawPuzzleWithUrl;
        if (quiz.jigsawPuzzle?.image) {
          const imageUrl = await ctx.storage.getUrl(
            quiz.jigsawPuzzle.image as Id<'_storage'>
          );
          jigsawPuzzleWithUrl = {
            ...quiz.jigsawPuzzle,
            imageUrl,
          };
        }

        let whoSaidItWithUrls;
        if (quiz.whoSaidIt?.options) {
          const optionsWithUrls = await Promise.all(
            quiz.whoSaidIt.options.map(async (option) => {
              const imageUrl = option.image
                ? await ctx.storage.getUrl(option.image as Id<'_storage'>)
                : undefined;
              return {
                ...option,
                imageUrl,
              };
            })
          );
          whoSaidItWithUrls = {
            ...quiz.whoSaidIt,
            options: optionsWithUrls,
          };
        }

        return {
          ...quiz,
          kabanata: chapter?.chapter || 0,
          level: level?.levelNo || 0,
          section: section?.name || '',
          createdAt: quiz._creationTime,
          fourPicsOneWord: fourPicsOneWordWithUrls,
          multipleChoice: multipleChoiceWithUrl,
          jigsawPuzzle: jigsawPuzzleWithUrl,
          whoSaidIt: whoSaidItWithUrls,
        };
      })
    );

    return quizzesWithDetails;
  },
});

export const deleteQuiz = mutation({
  args: { id: v.id('games') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
