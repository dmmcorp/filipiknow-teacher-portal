import { v } from 'convex/values';
import { NovelType, SceneTypes } from '../src/lib/types';
import { internal } from './_generated/api';
import { httpAction, internalQuery } from './_generated/server';

export const getDialogue = httpAction(async (ctx, request) => {
  const url = new URL(request.url);
  const { novel, chapter } = await request.json();
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

    const scenes: SceneTypes[] = await ctx.runQuery(
      internal.characters.getCharacterData,
      {
        dialogues: filteredChapter.dialogues,
      }
    );
    return {
      novel_metadata: filteredChapter,
      scenes: scenes,
    };
  },
});
