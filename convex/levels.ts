import { asyncMap } from 'convex-helpers';
import { v } from 'convex/values';
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

      return game;
    });

    const filteredLevelGame = levelGame.filter((g) => g != null);

    return filteredLevelGame;
  },
});
