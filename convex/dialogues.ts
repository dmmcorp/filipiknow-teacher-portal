import { v } from "convex/values";
import { httpAction, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { NovelType } from "../src/lib/types";
export const getDialogue = httpAction(async (ctx, request) => {
  const url = new URL(request.url);
  const novel = url.searchParams.get("novel");
  const chapter = url.searchParams.get("chapter");
  const level = url.searchParams.get("level");

  if (!novel || !chapter || !level) {
    return new Response(JSON.stringify({ error: "Missing query parameters" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  try {
    const result = await ctx.runQuery(
      internal.dialogues.getDialoguesByProgress,
      {
        novel: novel as NovelType,
        chapter: Number(chapter),
        level: Number(level),
      }
    );

    return new Response(JSON.stringify({ success: true, result }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: error.message || "Error fetching dialogue.",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});

export const getDialoguesByProgress = internalQuery({
  args: {
    novel: v.union(
      v.literal("Noli me tangere"),
      v.literal("El Filibusterismo")
    ), // e.g "Noli me tangere"
    chapter: v.number(), // e.g. 1
    level: v.number(), // e.g. 2
  },
  handler: async (ctx, args) => {
    const dialogue = await ctx.db
      .query("dialogues")
      .filter((q) => q.eq(q.field("novel"), args.novel))
      .filter((q) => q.eq(q.field("chapter"), args.chapter))
      .filter((q) => q.eq(q.field("level"), args.level))
      .first();
    if (!dialogue) {
      throw new Error(
        `No dialogue found using: ${args.novel}, Chapter: ${args.chapter}, Level: ${args.level} `
      );
    }
    return dialogue;
  },
});
