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
      const imgUrl = character.image
        ? await ctx.storage.getUrl(character.image as Id<'_storage'>)
        : '';
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
