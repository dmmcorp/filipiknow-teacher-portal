'use client';

import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Users } from 'lucide-react';
import { FaLevelUpAlt } from 'react-icons/fa';

interface StatsOverviewProps {
  totalChapters: number;
  totalCharacters: number;
  totalLevels: number;
}

export default function StatsOverview({
  totalChapters,
  totalCharacters,
  totalLevels,
}: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="bg-white/60 backdrop-blur-sm border-white/20 hover:bg-white/80 transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {totalChapters}
              </p>
              <p className="text-sm text-muted-foreground">Total Chapters</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/60 backdrop-blur-sm border-white/20 hover:bg-white/80 transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {totalCharacters}
              </p>
              <p className="text-sm text-muted-foreground">Characters</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* <Card className="bg-white/60 backdrop-blur-sm border-white/20 hover:bg-white/80 transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {totalDialogues}
              </p>
              <p className="text-sm text-muted-foreground">Dialogues</p>
            </div>
          </div>
        </CardContent>
      </Card> */}

      <Card className="bg-white/60 backdrop-blur-sm border-white/20 hover:bg-white/80 transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <FaLevelUpAlt className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalLevels}</p>
              <p className="text-sm text-muted-foreground">Levels</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
