import { authTables } from '@convex-dev/auth/server';
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

const schema = defineSchema({
  ...authTables,
  users: defineTable({
    fname: v.string(),
    lname: v.string(),
    image: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    email: v.string(),
    role: v.union(
      v.literal('teacher'),
      v.literal('student'),
      v.literal('admin')
    ),
    emailVerified: v.optional(v.boolean()),
    licenseNumber: v.optional(v.string()),
    gradeLevel: v.optional(v.string()),
    certification: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
  }),

  students: defineTable({
    userId: v.id('users'),
    section: v.string(),
    gradeLevel: v.string(),
  }).index('by_userId', ['userId']),

  dialogues: defineTable({
    novel: v.union(
      v.literal('Noli me tangere'),
      v.literal('El Filibusterismo')
    ), // e.g "Noli me tangere"
    chapter: v.number(), // e.g. 1
    chapter_title: v.string(), // e.g. "Ang Piging"
    level: v.number(), // e.g. 2
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
    bg_image: v.optional(v.string()),
  }),

  mini_games: defineTable({
    dialogueId: v.id('dialogues'),
    identification: v.object({
      question: v.string(), // e.g. "Who is Maria Clara?"
      hint: v.optional(v.string()), // e.g. "Choose the correct word to fill in the blank."
      answer: v.string(), // e.g. "Maria Clara"
    }),
    pictureWord: v.object({
      images: v.array(v.string()), // e.g. ["https://example.com/maria_clara.jpg"]
      hint: v.optional(v.string()), // e.g. "Choose the correct word to fill in the blank."
      answer: v.string(), // e.g. "Maria Clara"
    }),
    whoSaidIt: v.object({
      question: v.string(), // e.g. "Who said 'I love you, Maria
      quote: v.string(), // e.g. "I love you, Maria Clara"
      hint: v.optional(v.string()), // e.g. "Choose the correct character."}),
      answer: v.string(), // e.g. "Crisostomo Ibarra"
      options: v.array(
        v.object({
          name: v.string(), // e.g. "Crisostomo Ibarra"
          image: v.optional(v.string()), // e.g. "https://example.com/crisostomo_ibarra.jpg"
        })
      ),
    }),
  }),
  characters: defineTable({
    novel: v.union(
      v.literal('Noli me tangere'),
      v.literal('El Filibusterismo')
    ),
    name: v.string(), // e.g. "Maria Clara"
    image: v.optional(v.string()), // e.g. "https://example.com/maria_clara.jpg",
    description: v.string(), // e.g. "Maria Clara is a character in Noli me Tangere"
    role: v.optional(v.string()), // e.g. "Protagonist"
    unlocked: v.optional(v.boolean()), // e.g. true or false
    animationImages: v.optional(v.array(v.string())), // e.g. ["https://example.com/maria_clara_1.jpg", "https://example.com/maria_clara_2.jpg"]
  }),

  progress: defineTable({
    studentId: v.id('students'),
    novel: v.union(
      v.literal('Noli me tangere'),
      v.literal('El Filibusterismo')
    ), // e.g "Noli me tangere"
    current_chapter: v.number(), // e.g. kabanata 1
    current_level: v.number(), // e.g. level 2
    completed: v.number(), // e.g. 0, 1, 2, 3, 4, 5
  }).index('by_studentId', ['studentId']),
});

export default schema;
