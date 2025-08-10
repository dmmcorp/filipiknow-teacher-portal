'use client';

import BackBtn from '@/components/back-btn';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
interface ChapterContentProps {
  novel: string;
  chapterNo: number;
  chapterTitle: string;
}
function ChapterContent({
  novel,
  chapterNo,
  chapterTitle,
}: ChapterContentProps) {
  const [selectedLevel, setSelectedLevel] = useState<string | undefined>();

  // if (!chapterData) {
  //   return <Loading />;
  // }
  return (
    <div className="">
      {/* header */}
      <div className="flex items-center">
        <BackBtn />
        <h1 className="border-l border-l-gray-200 font-semibold text-sm md:text-xl lg:text-3xl px-2">
          Chapter {chapterNo}:{' '}
          <span className="capitalized">{chapterTitle}</span>
        </h1>
      </div>
      {/* if the chapterData has return value of error */}
      {/* {chapterData.error && (
        <Card className="">
          <CardContent>
            <div className="flex flex-col items-center justify-center">
              <BookOpen />
              {chapterData.error}
            </div>
          </CardContent>
        </Card>
      )} */}
      {/* if there are no errors */}
      <div className="md:grid md:grid-cols-3 md:gap-x-3 bg-white shadow rounded-2xl p-3 h-[80vh]">
        <div className="flex items-center h-fit justify-start md:flex-col col-span-3 md:col-span-1">
          <div className="hidden md:block w-full">
            <h3 className=" w-full font-semibold text-xl">Select Level</h3>
            {/* {chapterData.levels?.map((level) => (
              <Button
                key={`Level: ${level.level}`}
                variant={'ghost'}
                type="button"
                onClick={() => setSelectedLevel(level.level.toString())}
                className={cn(
                  selectedLevel === level.level.toString() &&
                    'bg-background text-white border-backround border-2',
                  'w-full border-y border-y-gray-200'
                )}
              >
                Level {level.level}
              </Button>
            ))} */}
          </div>
          <div className="flex-1/4 md:hidden w-full bg-amber-200">
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a level" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Levels</SelectLabel>
                  {/* {chapterData.levels?.map((level) => (
                    <SelectItem
                      key={`Level: ${level.level.toString()}`}
                      value={level.level.toString()}
                    >
                      {level.level}
                    </SelectItem>
                  ))} */}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="col-span-3 md:col-span-2 bg-amber-500 ">
          <h3 className="text-cent w-full">Dialogues</h3>
        </div>
      </div>
    </div>
  );
}

export default ChapterContent;
