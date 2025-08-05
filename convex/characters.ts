import { asyncMap } from 'convex-helpers';
import { v } from 'convex/values';
import { SceneTypes } from '../src/lib/types';
import { Id } from './_generated/dataModel';
import { internalQuery, query } from './_generated/server';

export const getCharacterData = internalQuery({
  args: {
    scenes: v.array(
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
    const scenesWithSpeaker = await asyncMap(args.scenes, async (scene) => {
      if (!scene.speakerId) {
        return null;
      }
      const character = await ctx.db.get(scene.speakerId);
      if (!character) {
        return null;
      }

      const imgUrl = character.image
        ? await ctx.storage.getUrl(character.image as Id<'_storage'>)
        : '';

      return {
        ...scene,
        speaker: {
          name: character.name,
          image: imgUrl,
        },
      };
    });

    //get Character Image

    const filteredScenes = scenesWithSpeaker.filter((scene) => scene !== null);
    return filteredScenes as SceneTypes[];
  },
});

export const getCharacters = query({
  args: {},
  handler: async (ctx) => {
    const characters = await ctx.db.query('characters').collect();
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
