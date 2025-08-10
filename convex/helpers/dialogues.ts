// import { DialogueType } from '../../src/lib/types';

// export const chaptersData = (dialogues: DialogueType[]) => {
//   const uniqueChapters = new Set<number>();
//   dialogues.forEach((dialogue) => {
//     if (dialogue.chapter !== undefined && dialogue.chapter !== null) {
//       uniqueChapters.add(dialogue.chapter);
//     }
//   });
//   const result = Array.from(uniqueChapters).map((chapter) => {
//     const chapterDialogues = dialogues.filter(
//       (dialogue) => dialogue.chapter === chapter
//     );

//     const noOfDialogues = chapterDialogues.reduce(
//       (sum, dialogue) => sum + (dialogue.scenes ? dialogue.scenes.length : 0),
//       0
//     );
//     // Get the first title found for this chapter, or undefined if not present
//     const chapterTitle = chapterDialogues[0]?.chapter_title ?? '';
//     return {
//       chapter: chapter,
//       levels: chapterDialogues.length,
//       chapterTitle: chapterTitle,
//       dialogues: noOfDialogues,
//     };
//   });
//   return result;
// };

// export const countLevelsPerChapter = (dialogues: DialogueType[]) => {
//   const levelsPerChapter: Record<number, number> = {};
//   dialogues.forEach((dialogue) => {
//     if (dialogue.chapter !== undefined && dialogue.chapter !== null) {
//       const chapter = dialogue.chapter;
//       const levels = dialogue.scenes ? dialogue.scenes.length : 0;
//       levelsPerChapter[chapter] = (levelsPerChapter[chapter] || 0) + levels;
//     }
//   });
//   return levelsPerChapter;
// };
