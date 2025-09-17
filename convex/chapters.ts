import { asyncMap } from 'convex-helpers';
import { v } from 'convex/values';
import { LevelGames, NovelType, SceneTypes } from '../src/lib/types';
import { internal } from './_generated/api';
import { Id } from './_generated/dataModel';
import { httpAction, internalQuery, mutation, query } from './_generated/server';

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

    // Convert bg_image storage ID to URL
    const bgImageUrl = chapter.bg_image
      ? await ctx.storage.getUrl(chapter.bg_image as Id<'_storage'>)
      : '';

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
      bg_image: bgImageUrl, // Return the URL instead of storage ID
      levels,
      dialogues: scenes,
      characters,
    };
  },
});

export const createChapter = mutation({
  args: {
    novel: v.union(
      v.literal('Noli me tangere'),
      v.literal('El Filibusterismo')
    ),
    chapter: v.number(),
    chapter_title: v.string(),
    dialogues: v.array(
      v.object({
        sceneNumber: v.number(),
        speakerId: v.optional(v.id('characters')),
        text: v.string(),
        position: v.optional(v.union(
          v.literal('left'),
          v.literal('center'),
          v.literal('right')
        )),
        highlighted_word: v.optional(
          v.object({
            word: v.string(),
            definition: v.string(),
          })
        ),
        scene_bg_image: v.optional(v.string()),
      })
    ),
    bg_image: v.optional(v.string()),
    summary: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if chapter already exists
    const existingChapter = await ctx.db
      .query('chapters')
      .withIndex('by_novel', (q) => q.eq('novel', args.novel))
      .filter((q) => q.eq(q.field('chapter'), args.chapter))
      .first();

    if (existingChapter) {
      throw new Error(`Chapter ${args.chapter} already exists for ${args.novel}`);
    }

    // Validate that all speakerIds exist if provided
    for (const dialogue of args.dialogues) {
      if (dialogue.speakerId) {
        const character = await ctx.db.get(dialogue.speakerId);
        if (!character) {
          throw new Error(`Character with ID ${dialogue.speakerId} not found`);
        }
        // Verify the character belongs to the same novel
        if (character.novel !== args.novel) {
          throw new Error(`Character ${character.name} does not belong to ${args.novel}`);
        }
      }
    }

    const chapterId = await ctx.db.insert('chapters', {
      novel: args.novel,
      chapter: args.chapter,
      chapter_title: args.chapter_title,
      dialogues: args.dialogues,
      bg_image: args.bg_image,
      summary: args.summary,
    });

    return chapterId;
  },
});

export const updateChapter = mutation({
  args: {
    chapterId: v.id('chapters'),
    chapter: v.optional(v.number()),
    chapter_title: v.optional(v.string()),
    dialogues: v.optional(v.array(
      v.object({
        sceneNumber: v.number(),
        speakerId: v.optional(v.id('characters')),
        text: v.string(),
        position: v.optional(v.union(
          v.literal('left'),
          v.literal('center'),
          v.literal('right')
        )),
        highlighted_word: v.optional(
          v.object({
            word: v.string(),
            definition: v.string(),
          })
        ),
        scene_bg_image: v.optional(v.string()),
      })
    )),
    bg_image: v.optional(v.string()),
    summary: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { chapterId, ...updates } = args;

    // Check if chapter exists
    const chapter = await ctx.db.get(chapterId);
    if (!chapter) {
      throw new Error('Chapter not found');
    }

    // If updating dialogues, validate speaker IDs
    if (updates.dialogues) {
      for (const dialogue of updates.dialogues) {
        if (dialogue.speakerId) {
          const character = await ctx.db.get(dialogue.speakerId);
          if (!character) {
            throw new Error(`Character with ID ${dialogue.speakerId} not found`);
          }
          if (character.novel !== chapter.novel) {
            throw new Error(`Character ${character.name} does not belong to ${chapter.novel}`);
          }
        }
      }
    }

    // Filter out undefined values
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    await ctx.db.patch(chapterId, filteredUpdates);
    return chapterId;
  },
});

export const deleteChapter = mutation({
  args: {
    chapterId: v.id('chapters'),
  },
  handler: async (ctx, args) => {
    // Check if chapter exists
    const chapter = await ctx.db.get(args.chapterId);
    if (!chapter) {
      throw new Error('Chapter not found');
    }

    // Check if there are any levels associated with this chapter
    const levels = await ctx.db
      .query('levels')
      .withIndex('by_chapterId', (q) => q.eq('chapterId', args.chapterId))
      .collect();

    if (levels.length > 0) {
      throw new Error('Cannot delete chapter with existing levels. Delete all levels first.');
    }

    await ctx.db.delete(args.chapterId);
    return { success: true };
  },
});
