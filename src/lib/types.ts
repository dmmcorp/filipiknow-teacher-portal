import { Id } from "../../convex/_generated/dataModel";

export type AuthFlow = "signIn" | "signUp";

export type NovelType = "Noli me tangere" | "El Filibusterismo";

export interface SceneTypes {
  speaker: {
    image: string;
    name: string;
  };
  sceneNumber: number;
  speakerId: Id<"characters">;
  text: string;
}
