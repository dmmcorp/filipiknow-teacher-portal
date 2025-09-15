import { asyncMap } from 'convex-helpers';
import { v } from 'convex/values';
import { LevelGames, NovelType, SceneTypes } from '../src/lib/types';
import { internal } from './_generated/api';
import { Id } from './_generated/dataModel';
import { httpAction, internalQuery, query } from './_generated/server';

export const getDialogue = httpAction(async (ctx, request) => {
  const url = new URL(request.url);
  const { novel, chapter, teacherId, sectionId } = await request.json();
  if (!novel || !chapter) {
    return new Response(JSON.stringify({ error: 'Missing query parameters' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  try {
    const result = await ctx.runQuery(internal.chapters.getChaptersDialogues, {
      novel: novel as NovelType,
      chapterNo: Number(chapter),
      teacherId: teacherId as Id<'users'>,
      sectionId: sectionId as Id<'sections'>,
    });

    return new Response(JSON.stringify({ success: true, result }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: error.message || 'Error fetching dialogue.',
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

export const getChaptersDialogues = internalQuery({
  args: {
    novel: v.string(),
    chapterNo: v.number(),
    teacherId: v.id('users'),
    sectionId: v.id('sections'),
  },
  handler: async (ctx, args) => {
    const chapter = await ctx.db.query('chapters').collect();
    const filteredChapter = chapter.find(
      (chapter) =>
        //same novel title & same chapter number
        chapter.novel.toLocaleLowerCase() === args.novel.toLocaleLowerCase() &&
        chapter.chapter == args.chapterNo
    );

    if (!filteredChapter)
      throw new Error(
        `No Chapter found using ${args.novel} - Chapter: ${args.chapterNo}`
      );

    const bgImgUrl = filteredChapter.bg_image
      ? await ctx.storage.getUrl(filteredChapter.bg_image as Id<'_storage'>)
      : '';

    const scenes: SceneTypes[] = await ctx.runQuery(
      internal.characters.getCharacterData,
      {
        dialogues: filteredChapter.dialogues,
      }
    );

    const levels: LevelGames[] = await ctx.runQuery(
      internal.levels.getGamesByTeacherAndSectionId,
      {
        chapterId: filteredChapter._id,
        teacherId: args.teacherId,
        sectionId: args.sectionId,
      }
    );
    return {
      novel_metadata: {
        ...filteredChapter,
        bg_image: bgImgUrl,
      },
      scenes: scenes,
      levels: levels,
    };
  },
});

export const getChapters = query({
  args: {
    novel: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.novel) return [];
    const chapters = await ctx.db
      .query('chapters')
      .filter((q) => q.eq(q.field('novel'), args.novel))
      .collect();
    const chapterWIthLevelsAndDialogues = await asyncMap(
      chapters,
      async (chapter) => {
        const levels = await ctx.db
          .query('levels')
          .withIndex('by_chapterId', (q) => q.eq('chapterId', chapter._id))
          .collect();
        const dialogues = chapter.dialogues.length;
        return {
          ...chapter,
          levels,
          noOfDialogues: dialogues,
        };
      }
    );
    return chapterWIthLevelsAndDialogues;
  },
});

export const getChapterById = query({
  args: {
    chapterId: v.id('chapters'),
  },
  handler: async (ctx, args) => {
    const chapter = await ctx.db.get(args.chapterId);
    if (!chapter) throw new Error(`Chapter not found: ${args.chapterId}`);
    const levels = await ctx.db
      .query('levels')
      .withIndex('by_chapterId', (q) => q.eq('chapterId', args.chapterId))
      .collect();
    const scenes: SceneTypes[] = await ctx.runQuery(
      internal.characters.getCharacterData,
      {
        dialogues: chapter.dialogues,
      }
    );
    const characters = [...new Set(scenes.map((scene) => scene.speakerId))];
    return {
      ...chapter,
      levels,
      dialogues: scenes,
      characters,
    };
  },
});
