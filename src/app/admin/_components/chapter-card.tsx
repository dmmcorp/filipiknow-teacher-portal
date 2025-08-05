'use client';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChaptersType } from '@/lib/types';
import { Book } from 'lucide-react';

interface ChapterCardProps {
  chapter: ChaptersType;
}

export default function ChapterCard({ chapter }: ChapterCardProps) {
  return (
    <Card className="hover:shadow-lg transition-all duration-500 ease-in-out">
      <CardHeader>
        <CardTitle className="flex gap-2 text-lg font-bold">
          <Book className="text-2xl text-gray-700 mb-2" />
          <span className="">
            Chapter {chapter.chapter}: {chapter.chapterTitle}
          </span>
        </CardTitle>
        <CardDescription className="text-sm text-gray-600">
          <Badge>{chapter.levels.toString()} Level </Badge>{' '}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
