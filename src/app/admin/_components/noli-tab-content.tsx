'use client';
import { Card } from '@/components/ui/card';
import { DialogueType } from '@/lib/types';
import ChapterCard from './chapter-card';

interface NoliMeTangereTabContentProps {
  dialogues: DialogueType[];
}

export default function NoliMeTangereTabContent({
  dialogues,
}: NoliMeTangereTabContentProps) {
  return (
    <Card className="w-full p-0">
      {dialogues.map((dialogue, index) => (
        <ChapterCard key={index} chapter={dialogue} />
      ))}
    </Card>
  );
}
