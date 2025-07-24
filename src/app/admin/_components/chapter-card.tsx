'use client';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DialogueType } from '@/lib/types';

interface ChapterCardProps {
  chapter: DialogueType;
}

export default function ChapterCard({ chapter }: ChapterCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold">
          Chapter {chapter.chapter}: {chapter.chapter_title}
        </CardTitle>
        <CardDescription className="text-sm text-gray-600">
          <Badge>Level {chapter.level.toString()}</Badge>{' '}
          {chapter.scenes.length}Scenes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-700 truncate">
          First Scene: {chapter.scenes[0].text}
        </p>
      </CardContent>
    </Card>
  );
}
