// import { v } from 'convex/values';
// import { NovelType, SceneTypes } from '../src/lib/types';
// import { internal } from './_generated/api';
// import { httpAction, internalQuery, query } from './_generated/server';
// import { chaptersData } from './helpers/dialogues';

// export const getDialogue = httpAction(async (ctx, request) => {
//   const url = new URL(request.url);
//   const novel = url.searchParams.get('novel');
//   const chapter = url.searchParams.get('chapter');
//   const level = url.searchParams.get('level');
//   console.log('Params:', { novel, chapter, level });
//   if (!novel || !chapter || !level) {
//     return new Response(JSON.stringify({ error: 'Missing query parameters' }), {
//       status: 400,
//       headers: {
//         'Content-Type': 'application/json',
//         'Access-Control-Allow-Origin': '*',
//       },
//     });
//   }

//   try {
//     const result = await ctx.runQuery(
//       internal.dialogues.getDialoguesByProgress,
//       {
//         novel: novel as NovelType,
//         chapter: Number(chapter),
//         level: Number(level),
//       }
//     );

//     return new Response(JSON.stringify({ success: true, result }), {
//       status: 200,
//       headers: {
//         'Content-Type': 'application/json',
//         'Access-Control-Allow-Origin': '*',
//       },
//     });
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   } catch (error: any) {
//     return new Response(
//       JSON.stringify({
//         error: error.message || 'Error fetching dialogue.',
//       }),
//       {
//         status: 500,
//         headers: {
//           'Content-Type': 'application/json',
//           'Access-Control-Allow-Origin': '*',
//         },
//       }
//     );
//   }
// });

// export const getDialoguesByProgress = internalQuery({
//   args: {
//     novel: v.union(
//       v.literal('Noli me tangere'),
//       v.literal('El Filibusterismo')
//     ), // e.g "Noli me tangere"
//     chapter: v.number(), // e.g. 1
//     level: v.number(), // e.g. 2
//   },
//   handler: async (ctx, args) => {
//     const dialogue = await ctx.db
//       .query('dialogues')
//       .filter((q) => q.eq(q.field('novel'), args.novel))
//       .filter((q) => q.eq(q.field('chapter'), args.chapter))
//       .filter((q) => q.eq(q.field('level'), args.level))
//       .first();

//     if (!dialogue) {
//       throw new Error(
//         `No dialogue found using: ${args.novel}, Chapter: ${args.chapter}, Level: ${args.level} `
//       );
//     }
//     const scenes: SceneTypes[] = await ctx.runQuery(
//       internal.characters.getCharacterData,
//       {
//         scenes: dialogue.scenes,
//       }
//     );
//     const result = {
//       novel_metadata: dialogue,
//       scenes: scenes,
//     };
//     return result;
//   },
// });

// export const getAllDialogues = query({
//   args: {},
//   handler: async (ctx) => {
//     const dialogues = await ctx.db.query('dialogues').collect();

//     const noliDialouges = dialogues.filter(
//       (dialogue) => dialogue.novel === 'Noli me tangere'
//     );
//     const noliChapters = chaptersData(noliDialouges);
//     const elFiliDialouges = dialogues.filter(
//       (dialogue) => dialogue.novel === 'El Filibusterismo'
//     );
//     const elFiliChapters = chaptersData(elFiliDialouges);
//     return {
//       noli: noliChapters,
//       elFili: elFiliChapters,
//     };
//   },
// });

// export const getStatsOverview = query({
//   args: {},
//   handler: async (ctx) => {
//     const dialogues = await ctx.db.query('dialogues').collect();
//     const chapters = chaptersData(dialogues);
//     const totalLevels = chapters.reduce(
//       (sum, chapter) => sum + chapter.levels,
//       0
//     );
//     const totalCharacters = await ctx.db.query('characters').collect();

//     return {
//       totalChapters: chapters.length,
//       totalCharacters: totalCharacters.length,
//       totalLevels,
//     };
//   },
// });

// export const getChapterData = query({
//   args: {
//     novel: v.string(),
//     chapter: v.number(),
//   },
//   handler: async (ctx, args) => {
//     if (isNaN(args.chapter)) {
//       throw new Error('invalid chapter type');
//     }
//     const dialogues = await ctx.db
//       .query('dialogues')
//       .filter((q) => q.eq(q.field('novel'), args.novel))
//       .filter((q) => q.eq(q.field('chapter'), args.chapter))
//       .collect();

//     if (dialogues.length < 1) {
//       return {
//         chapterData: null,
//         levels: null,
//         error: `No chapters have been added yet.`,
//       };
//     }
//     const levels = dialogues.map((dialogue) => {
//       const dialogues = dialogue.scenes;
//       return {
//         level: dialogue.level,
//         dialogues: dialogues,
//       };
//     });
//     const chapter = dialogues[0];
//     return {
//       chapterData: chapter,
//       levels: levels,
//       error: null,
//     };
//   },
// });
