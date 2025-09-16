import { asyncMap } from 'convex-helpers';
import { v } from 'convex/values';
import { SceneTypes } from '../src/lib/types';
import { Id } from './_generated/dataModel';
import { internalQuery, mutation, query } from './_generated/server';

export const getCharacterData = internalQuery({
  args: {
    dialogues: v.array(
      v.object({
        sceneNumber: v.number(), // e.g. 1, 2, 3
        speakerId: v.optional(v.id('characters')),
        text: v.string(),
        highlighted_word: v.optional(
          v.object({
            word: v.string(), // e.g. "Maria Clara"
            definition: v.string(), // e.g. "Maria Clara is a character in Noli me Tangere"
          })
        ), // e.g. { word: "Maria Clara", definition: "Maria Clara is a character in Noli me Tangere" }
        scene_bg_image: v.optional(v.string()), //papalit sa default image ng current dialog
      })
    ),
  },
  handler: async (ctx, args) => {
    const scenesWithSpeaker = await asyncMap(
      args.dialogues,
      async (dialogue) => {
        if (!dialogue.speakerId) {
          const bgImgUrl = dialogue.scene_bg_image
            ? await ctx.storage.getUrl(
              dialogue.scene_bg_image as Id<'_storage'>
            )
            : '';
          return {
            ...dialogue,
            scene_bg_image: bgImgUrl,
          };
        }
        const character = await ctx.db.get(dialogue.speakerId);
        if (!character) {
          return null;
        }

        const imgUrl = character.image
          ? await ctx.storage.getUrl(character.image as Id<'_storage'>)
          : '';

        const bgImgUrl = dialogue.scene_bg_image
          ? await ctx.storage.getUrl(dialogue.scene_bg_image as Id<'_storage'>)
          : '';

        return {
          ...dialogue,
          speaker: {
            name: character.name,
            image: imgUrl,
          },
          scene_bg_image: bgImgUrl,
        };
      }
    );

    //get Character Image

    const filteredScenes = scenesWithSpeaker.filter((scene) => scene !== null);
    return filteredScenes as SceneTypes[];
  },
});

export const getCharacters = query({
  args: {
    novel: v.optional(v.union(
      v.literal('Noli me tangere'),
      v.literal('El Filibusterismo')
    )),
  },
  handler: async (ctx, args) => {
    let charactersQuery = ctx.db.query('characters');

    if (args.novel) {
      charactersQuery = charactersQuery.filter((q) => q.eq(q.field('novel'), args.novel));
    }

    const characters = await charactersQuery.collect();
    const result = await asyncMap(characters, async (character) => {
      let imgUrl = '';
      if (character.image) {
        // Check if it's already a URL (starts with http)
        if (character.image.startsWith('http')) {
          imgUrl = character.image;
        } else {
          // It's a storage ID, get the URL
          try {
            const url = await ctx.storage.getUrl(character.image as Id<'_storage'>);
            imgUrl = url || '';
          } catch (error) {
            console.error('Error getting storage URL:', error);
            imgUrl = '';
          }
        }
      }
      return {
        ...character,
        image: imgUrl,
      };
    });
    return result;
  },
});

export const createCharacter = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    novel: v.union(
      v.literal('Noli me tangere'),
      v.literal('El Filibusterismo')
    ),
    image: v.optional(v.string()),
    role: v.optional(v.string()),
    unlocked: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const characterId = await ctx.db.insert('characters', {
      name: args.name,
      description: args.description,
      novel: args.novel,
      image: args.image,
      role: args.role,
      unlocked: args.unlocked ?? true,
    });

    return characterId;
  },
});

export const updateCharacter = mutation({
  args: {
    characterId: v.id('characters'),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    novel: v.optional(v.union(
      v.literal('Noli me tangere'),
      v.literal('El Filibusterismo')
    )),
    image: v.optional(v.string()),
    role: v.optional(v.string()),
    unlocked: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { characterId, ...updates } = args;

    // Check if character exists
    const character = await ctx.db.get(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    // Filter out undefined values
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    await ctx.db.patch(characterId, filteredUpdates);
    return characterId;
  },
});

export const deleteCharacter = mutation({
  args: {
    characterId: v.id('characters'),
  },
  handler: async (ctx, args) => {
    // Check if character exists
    const character = await ctx.db.get(args.characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    // TODO: Check if character is used in any dialogues/chapters before deleting
    // For now, we'll allow deletion

    await ctx.db.delete(args.characterId);
    return { success: true };
  },
});

export const getCharacterById = query({
  args: {
    characterId: v.id('characters'),
  },
  handler: async (ctx, args) => {
    const character = await ctx.db.get(args.characterId);
    if (!character) {
      return null;
    }

    let imgUrl = '';
    if (character.image) {
      // Check if it's already a URL (starts with http)
      if (character.image.startsWith('http')) {
        imgUrl = character.image;
      } else {
        // It's a storage ID, get the URL
        try {
          const url = await ctx.storage.getUrl(character.image as Id<'_storage'>);
          imgUrl = url || '';
        } catch (error) {
          console.error('Error getting storage URL:', error);
          imgUrl = '';
        }
      }
    }

    return {
      ...character,
      image: imgUrl,
    };
  },
});
