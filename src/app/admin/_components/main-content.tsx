
'use client';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, geistEfcaFont } from '@/lib/utils';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import NoliMeTangereTabContent from './noli-tab-content';


function MainContent() {
  const dialogues = useQuery(api.dialogues.getAllDialogues, {});

  if (!dialogues) {
    return (
      <div className='flex-1 container bg-gray-100 mx-auto py-10 flex justify-center items-center'>
        <p className='text-gray-500'>Loading dialogues...</p>
      </div>
    );
  }
  return (
    <div className='flex-1 container font bg-green-200 mx-auto py-10 flex'>
      <Tabs defaultValue='noli' className="w-full">
        <TabsList className={cn(geistEfcaFont.className, "grid w-full grid-cols-2")}>
          <TabsTrigger value={"noli"} disabled={dialogues.noli.length === 0} className='text-xl'>
            Noli me tangere
              <Badge variant="secondary" className="ml-2 text-xs">
                {dialogues.noli.length}
              </Badge>
          </TabsTrigger>
          <TabsTrigger value={"elfili"} disabled={dialogues.elFili.length === 0} className='text-xl'>
            El Filibusterismo
              <Badge variant="secondary" className="ml-2 text-xs">
                {dialogues.elFili.length}
              </Badge>
          </TabsTrigger>
        </TabsList>
        <TabsContent value='noli' className="mt-6">
          <NoliMeTangereTabContent dialogues={dialogues.noli} />
        </TabsContent>
    </Tabs>
    </div>
  );
}

export default MainContent;