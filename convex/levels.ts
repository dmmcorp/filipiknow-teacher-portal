import { asyncMap } from 'convex-helpers';
import { v } from 'convex/values';
import {
  FourPicsOneWord,
  Identification,
  JigsawPuzzle,
  MultipleChoice,
  WhoSaidIt,
} from '../src/lib/types';
import { Id } from './_generated/dataModel';
import { internalQuery } from './_generated/server';

export const getLevelsByChapterId = internalQuery({
  args: {
    chapterId: v.id('chapters'),
    kabanata: v.number(),
  },
  handler: async (ctx, args) => {
    const levels = await ctx.db
      .query('levels')
      .withIndex('by_chapterId', (q) => q.eq('chapterId', args.chapterId))
      .collect();

    const games = await ctx.db
      .query('games')
      .filter((q) => q.eq(q.field('chapterId'), args.chapterId))
      .collect();
    const levelGame = await asyncMap(levels, async (level) => {
      const game = games.find((game) => game.levelId === level._id);
      if (!game) return null;

      return {
        ...level,
        game: game,
      };
    });

    const filteredLevelGame = levelGame.filter((g) => g != null);

    return filteredLevelGame;
  },
});

export const getGamesByTeacherAndSectionId = internalQuery({
  args: {
    chapterId: v.id('chapters'),
    teacherId: v.id('users'),
    sectionId: v.id('sections'),
  },
  handler: async (ctx, args) => {
    const games = await ctx.db
      .query('games')
      .filter((q) =>
        q.and(
          q.eq(q.field('teacherId'), args.teacherId),
          q.eq(q.field('section'), args.sectionId),
          q.eq(q.field('chapterId'), args.chapterId)
        )
      )
      .collect();

    const gamesWithLevel = await asyncMap(games, async (game) => {
      const level = await ctx.db.get(game.levelId);
      const levelNo = level?.levelNo ?? null;

      // Initialize all game-type fields as undefined
      let fourPicsOneWord: FourPicsOneWord | undefined = undefined;
      let multipleChoice: MultipleChoice | undefined = undefined;
      let jigsawPuzzle: JigsawPuzzle | undefined = undefined;
      let whoSaidIt: WhoSaidIt | undefined = undefined;
      let identification: Identification | undefined = undefined;

      switch (game.gameType) {
        case '4pics1word': {
          const images: string[] = [];
          for (const imgId of game.fourPicsOneWord?.images ?? []) {
            const url = await ctx.storage.getUrl(imgId as Id<'_storage'>);
            if (url) images.push(url);
          }
          fourPicsOneWord = {
            ...game.fourPicsOneWord,
            images,
            clue: game.fourPicsOneWord?.clue || '',
            answer: game.fourPicsOneWord?.answer || '',
          };
          break;
        }
        case 'multipleChoice': {
          let questionImage: string | null = null;
          if (game.multipleChoice?.image) {
            questionImage = await ctx.storage.getUrl(
              game.multipleChoice.image as Id<'_storage'>
            );
          }
          multipleChoice = {
            ...game.multipleChoice,
            image: questionImage || undefined,
            question: game.multipleChoice?.question || '',
            options: game.multipleChoice?.options || [],
          };
          break;
        }
        case 'jigsawPuzzle': {
          let puzzleImage: string | null = null;
          if (game.jigsawPuzzle?.image) {
            puzzleImage = await ctx.storage.getUrl(
              game.jigsawPuzzle.image as Id<'_storage'>
            );
          }
          jigsawPuzzle = {
            rows: game.jigsawPuzzle?.rows || 0,
            columns: game.jigsawPuzzle?.columns || 0,
            image: puzzleImage || '',
          };
          break;
        }
        case 'whoSaidIt': {
          const options = await Promise.all(
            (game.whoSaidIt?.options ?? []).map(async (opt) => {
              const imgUrl = opt.image
                ? await ctx.storage.getUrl(opt.image as Id<'_storage'>)
                : undefined;
              return { ...opt, image: imgUrl || undefined };
            })
          );
          whoSaidIt = {
            question: game.whoSaidIt?.question || '',
            quote: game.whoSaidIt?.quote || '',
            hint: game.whoSaidIt?.hint || undefined,
            options,
          };
          break;
        }
        case 'identification': {
          identification = {
            question: game.identification?.question || '',
            answer: game.identification?.answer || '',
          };
          break;
        }
      }

      return {
        ...game,
        level: levelNo,
        fourPicsOneWord,
        multipleChoice,
        jigsawPuzzle,
        whoSaidIt,
        identification,
      };
    });

    // Optional: sort by assessmentGameNumber
    return gamesWithLevel.sort(
      (a, b) => (a.assessmentGameNumber ?? 0) - (b.assessmentGameNumber ?? 0)
    );
  },
});
