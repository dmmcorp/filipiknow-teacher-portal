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

export type DialogueType = Doc<'dialogues'>;
export interface ChaptersType {
  chapter: number;
  levels: number;
  chapterTitle: string;
  dialogues: number;
}
