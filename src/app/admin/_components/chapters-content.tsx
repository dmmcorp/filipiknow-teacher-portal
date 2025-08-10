'use client';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn, geistEfcaFont } from '@/lib/utils';
import { useState } from 'react';
import ChapterForm from './chapter-form';

function MainContent() {
  // const dialogues = useQuery(api.dialogues.getAllDialogues, {});
  const [selectedNovel, setSelectedNovel] = useState<string>('noli');

  // if (!dialogues) {
  //   return (
  //     <div className="flex-1 container bg-gray-100 mx-auto py-10 flex justify-center items-center">
  //       <p className="text-gray-500">Loading dialogues...</p>
  //     </div>
  //   );
  // }

  // const noli = dialogues.noli;
  // const elFili = dialogues.elFili;
  console.log(selectedNovel);
  return (
    <div className="flex-1 container mx-auto flex">
      <Card className="w-full p-0 bg-white shadow-md min-h-[75vh]">
        <Tabs
          defaultValue={selectedNovel}
          onValueChange={setSelectedNovel}
          className="w-full"
        >
          <TabsList
            className={cn(geistEfcaFont.className, 'grid  grid-cols-2')}
          >
            <TabsTrigger
              value={'noli'}
              // disabled={noli.length === 0}
              className="text-xl"
            >
              Noli me tangere
              <Badge variant="secondary" className="ml-2 text-xs">
                {/* {noli.length} */}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value={'elfili'}
              // disabled={elFili.length === 0}
              className="text-xl"
            >
              El Filibusterismo
              <Badge variant="secondary" className="ml-2 text-xs">
                {/* {elFili.length} */}
              </Badge>
            </TabsTrigger>
          </TabsList>
          <TabsContent
            value="noli"
            className="px-3 md:px-6 grid grid-cols-12 gap-5"
          >
            <div className="col-span-7  overflow-auto h-[65vh]">
              {/* <NovelTabContent chapters={noli} /> */}
            </div>
            <div className="col-span-5 shadow p-2  h-[65vh] max-h-[65vh] overflow-auto">
              <ChapterForm />
            </div>
          </TabsContent>
          <TabsContent
            value="elfili"
            className="px-3 md:px-6 grid grid-cols-12 gap-5"
          >
            <div className="col-span-7  overflow-auto h-[65vh]">
              {/* <NovelTabContent chapters={elFili} /> */}
            </div>
            <div className="col-span-5  h-[65vh] max-h-[65vh] overflow-auto">
              <ChapterForm />
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}

export default MainContent;
