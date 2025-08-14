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
    // section: v.(),
    section: v.id('sections'), // PANSAMANTALA NA ICOMMENT OUT MUNA NEED MA UPDATE YUNG REGISTRATION PART SA GODOT PERO MUKHANG DI NA AABOT FOR NOW COMMENT OUT MUNA PARA SA PRESENTATION NILA SA MONDAY.
    gradeLevel: v.string(),
  }).index('by_userId', ['userId']),

  chapters: defineTable({
    novel: v.union(
      v.literal('Noli me tangere'),
      v.literal('El Filibusterismo')
    ), // e.g "Noli me tangere"
    chapter: v.number(),
    chapter_title: v.string(), // e.g. "Ang Piging"
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
    bg_image: v.optional(v.string()),
    summary: v.string(),
  }),

  levels: defineTable({
    chapterId: v.id('chapters'),
    levelNo: v.number(),
  }).index('by_chapterId', ['chapterId']),

  // dialogues: defineTable({
  //   novel: v.union(
  //     v.literal('Noli me tangere'),
  //     v.literal('El Filibusterismo')
  //   ), // e.g "Noli me tangere"
  //   chapter: v.number(), // e.g. 1
  //   chapter_title: v.string(), // e.g. "Ang Piging"
  //   level: v.number(), // e.g. 2
  //   scenes: v.array(
  //     v.object({
  //       sceneNumber: v.number(), // e.g. 1, 2, 3
  //       speakerId: v.optional(v.id('characters')),
  //       text: v.string(),
  //       highlighted_word: v.optional(
  //         v.object({
  //           word: v.string(), // e.g. "Maria Clara"
  //           definition: v.string(), // e.g. "Maria Clara is a character in Noli me Tangere"
  //         })
  //       ), // e.g. { word: "Maria Clara", definition: "Maria Clara is a character in Noli me Tangere" }
  //       scene_bg_image: v.optional(v.string()), //papalit sa default image ng current dialog
  //     })
  //   ),
  //   bg_image: v.optional(v.string()),
  // }),

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

  games: defineTable({
    levelId: v.id('levels'),
    teacherId: v.id('users'), // who uploaded the game
    section: v.id('sections'), // e.g. "Section 1" links directly to sections
    gradeLevel: v.string(), // e.g. "Grade 9"
    novel: v.union(
      v.literal('Noli me tangere'),
      v.literal('El Filibusterismo')
    ),
    // kabanata: v.number(), // 1–64 for Noli, 1–39 for El Fili
    chapterId: v.id('chapters'),
    // level: v.number(), // 1–8 not sure kung hanggang 8 lang ba talaga or pwede lumagpas, possible itanong pero much better kung last level for each kabanta is hanggang 8 lang
    gameType: v.union(
      v.literal('4pics1word'),
      v.literal('multipleChoice'),
      v.literal('jigsawPuzzle'),
      v.literal('whoSaidIt'),
      v.literal('identification')
    ),

    // Content for 4pics1word
    fourPicsOneWord: v.optional(
      v.object({
        images: v.array(v.string()), // 4 image URLs
        clue: v.string(), // ex: "She's known for her devotion and faith in the novel"
        answer: v.string(), // e.g. "Maria Clara"
      })
    ),

    // Content for multiple choice
    multipleChoice: v.optional(
      v.object({
        question: v.string(), // e.g. "Sinong tauhan sa kwento ang nagalit sa ‘Tinola’?"
        image: v.optional(v.string()), // optional image for the question (e.g. Tinola)
        options: v.array(
          v.object({
            text: v.string(), // e.g. "Crisostomo Ibarra"
            // image: v.optional(v.string()), // optional image for the choice
            isCorrect: v.optional(v.boolean()), // true for the correct answer
          })
        ), // 4 choices, each can have image
      })
    ),

    identification: v.optional(
      v.object({
        question: v.string(), // e.g. "Sinong tauhan sa kwento ang nagalit sa ‘Tinola’?"
        answer: v.string(),
      })
    ),

    // Content for jigsaw puzzle
    jigsawPuzzle: v.optional(
      v.object({
        image: v.string(), // puzzle image
        rows: v.number(), // number of rows
        columns: v.number(), // number of columns
      })
    ),

    whoSaidIt: v.optional(
      v.object({
        question: v.string(), // e.g. "Sino sa mga nasa litrato ang nagsabi sa linyang ito:"
        quote: v.string(), // e.g. "Ang isang indiyo ay kailanma'y hindi maaring lumampas sa fraile!"
        hint: v.optional(v.string()), // e.g. "Isa siyang indiyo na naging padre"
        options: v.array(
          v.object({
            name: v.string(), // e.g. "Padre Damaso"
            image: v.optional(v.string()), // e.g. "https://example.com/padre_damaso.jpg"
            isCorrect: v.optional(v.boolean()), // true for the correct answer
          })
        ),
      })
    ),
    time_limit: v.number(),
    instruction: v.string(),
    points: v.number(),
  })
    .index('by_section_kabanata_level', ['section', 'chapterId', 'levelId'])
    .index('by_levelId', ['levelId']),

  sections: defineTable({
    name: v.string(), // e.g. "Section 1"
    gradeLevel: v.string(), // e.g. "Grade 9"
    schoolYear: v.string(), // e.g. "2025-2026" need to kasi ito lang tanging identification kung which batch yung mga students
  }),

  teacher_sections: defineTable({
    teacherId: v.id('users'),
    sectionId: v.id('sections'),
  })
    .index('by_teacher', ['teacherId'])
    .index('by_section', ['sectionId']),
});

export default schema;
