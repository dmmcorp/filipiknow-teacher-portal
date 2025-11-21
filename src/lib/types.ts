import { Doc, Id } from '../../convex/_generated/dataModel';

export type AuthFlow = 'signIn' | 'signUp';

export type NovelType = 'Noli me tangere' | 'El Filibusterismo';

export interface SceneTypes {
  speaker: {
    image: string;
    name: string;
  };
  sceneNumber: number;
  highlighted_word:
    | {
        word: string;
        definition: string;
      }
    | undefined;
  speakerId: Id<'characters'>;
  text: string;
  position?: 'left' | 'center' | 'right';
}

export interface ChaptersType {
  chapter: number;
  levels: number;
  chapterTitle: string;
  dialogues: number;
}

export interface LevelsType {
  level: number;
  dialogues: CharacterDialogueType[];
}

export interface CharacterDialogueType {
  speakerId?: Id<'characters'> | undefined;
  highlighted_word?:
    | {
        word: string;
        definition: string;
      }
    | undefined;
  scene_bg_image?: string | undefined;
  sceneNumber: number;
  text: string;
  position?: 'left' | 'center' | 'right';
}

export interface LevelGames extends Doc<'games'> {
  level: number | null;
}

// 1️⃣ Four Pics One Word
export interface FourPicsOneWord {
  images: string[]; // 4 image URLs
  clue: string;
  answer: string;
}

// 2️⃣ Multiple Choice
export interface MultipleChoiceOption {
  text: string;
  isCorrect?: boolean;
  // image?: string; // Uncomment if choices can have images
}

export interface MultipleChoice {
  question: string;
  image?: string; // optional question image
  options: MultipleChoiceOption[];
}

// 3️⃣ Identification
export interface Identification {
  question: string;
  answer: string;
}

// 4️⃣ Jigsaw Puzzle
export interface JigsawPuzzle {
  image: string; // puzzle image
  rows: number;
  columns: number;
}

// 5️⃣ Who Said It
export interface WhoSaidItOption {
  name: string;
  image?: string;
  isCorrect?: boolean;
}

export interface WhoSaidIt {
  question: string;
  quote: string;
  hint?: string;
  options: WhoSaidItOption[];
}

// ✅ Combined Game Type
export interface GameContent {
  fourPicsOneWord?: FourPicsOneWord;
  multipleChoice?: MultipleChoice;
  identification?: Identification;
  jigsawPuzzle?: JigsawPuzzle;
  whoSaidIt?: WhoSaidIt;
}

export type GameType =
  | '4pics1word'
  | 'multipleChoice'
  | 'jigsawPuzzle'
  | 'whoSaidIt'
  | 'identification';

// //type for getChapterData query in a convex/dialogue.ts
// export interface GetChapterDataType {
//   chapterData: Doc<'dialogues'>;
//   levels: LevelsType[];
// }
