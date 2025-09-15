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
}

export interface LevelGames extends Doc<'games'> {
  level: number | null;
}

// //type for getChapterData query in a convex/dialogue.ts
// export interface GetChapterDataType {
//   chapterData: Doc<'dialogues'>;
//   levels: LevelsType[];
// }
