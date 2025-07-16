import { v } from "convex/values";
import { internalQuery } from "./_generated/server";
import { asyncMap } from "convex-helpers";
import { SceneTypes } from "../src/lib/types";
import { Id } from "./_generated/dataModel";

export const getCharacterData = internalQuery({
  args: {
    scenes: v.array(
      v.object({
        sceneNumber: v.number(), // e.g. 1, 2, 3
        speakerId: v.optional(v.id("characters")), // e.g. "Maria Clara"
        text: v.string(), // e.g. "I am Maria Clara"
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
        ? await ctx.storage.getUrl(character.image as Id<"_storage">)
        : "";

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
