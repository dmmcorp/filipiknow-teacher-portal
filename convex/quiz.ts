import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getChaptersByNovel = query({
    args: {
        novel: v.union(
            v.literal("Noli me tangere"),
            v.literal("El Filibusterismo")
        )
    },
    handler: async (ctx, args) => {
        const chapters = await ctx.db
            .query("chapters")
            .filter((q) => q.eq(q.field("novel"), args.novel))
            .order("asc")
            .collect();

        return chapters.map(chapter => ({
            id: chapter._id,
            chapter: chapter.chapter,
            title: chapter.chapter_title,
            displayName: `Chapter ${chapter.chapter} (${chapter.chapter_title})`
        }));
    }
});

export const getLevelsByChapter = query({
    args: {
        chapterId: v.id("chapters")
    },
    handler: async (ctx, args) => {
        if (!args.chapterId) return [];

        const levels = await ctx.db
            .query("levels")
            .filter((q) => q.eq(q.field("chapterId"), args.chapterId))
            .collect();

        return levels.map(level => ({
            id: level._id,
            levelNo: level.levelNo
        }));
    }
});

export const createQuiz = mutation({
    args: {
        teacherId: v.id("users"),
        section: v.id("sections"),
        novel: v.union(
            v.literal("Noli me tangere"),
            v.literal("El Filibusterismo")
        ),
        chapterId: v.id("chapters"),
        levelId: v.id("levels"),
        gameType: v.union(
            v.literal('4pics1word'),
            v.literal('multipleChoice'),
            v.literal('jigsawPuzzle'),
            v.literal('whoSaidIt'),
            v.literal('identification')
        ),
        instruction: v.string(),
        timeLimit: v.number(),
        points: v.number(),
        fourPicsOneWord: v.optional(v.object({
            images: v.array(v.string()),
            clue: v.string(),
            answer: v.string(),
        })),
        multipleChoice: v.optional(v.object({
            question: v.string(),
            image: v.optional(v.string()),
            options: v.array(v.object({
                text: v.string(),
                isCorrect: v.boolean(),
            })),
        }))
    },
    handler: async (ctx, args) => {

        const chapter = await ctx.db.get(args.chapterId);
        if (!chapter) throw new Error("Chapter not found");

        const section = await ctx.db.get(args.section);
        if (!section) throw new Error("Section not found");

        const quizId = await ctx.db.insert("games", {
            teacherId: args.teacherId,
            section: args.section,
            gradeLevel: section.gradeLevel,
            novel: args.novel,
            chapterId: args.chapterId,
            levelId: args.levelId,
            gameType: "4pics1word",
            fourPicsOneWord: args.fourPicsOneWord,
            multipleChoice: args.multipleChoice,
            instruction: args.instruction,
            time_limit: args.timeLimit,
            points: args.points,
        })

        return quizId;
    }
})