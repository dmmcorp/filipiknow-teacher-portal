'use client';
import { ChaptersType } from '@/lib/types';
import ChapterCard from './chapter-card';

interface NovelTabContentProps {
  chapters: ChaptersType[];
}

export default function NovelTabContent({ chapters }: NovelTabContentProps) {
  return (
    <div className="w-full p-0 grid grid-cols-3 gap-4 bg-transparent shado">
      {chapters.map((chapter, index) => (
        <ChapterCard key={index} chapter={chapter} />
      ))}
    </div>
  );
}
