
import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import NoliMeTangereTabContent from './noli-tab-content'
import ElFilibusterismoTabContent from './el-fili-tab-content'
function MainContent() {
  return (
    <div className='flex-1 container bg-green-200 mx-auto py-10 flex'>
       <Tabs defaultValue="noli-me-tangere" className="h-full w-full">
            <TabsList>
                <TabsTrigger value="noli-me-tangere">Noli me tangere</TabsTrigger>
                <TabsTrigger value="el-filibusterismo">El Filibusterismo</TabsTrigger>
            </TabsList>
            <TabsContent value="noli-me-tangere">
                <NoliMeTangereTabContent/>
            </TabsContent>
            <TabsContent value="el-filibusterismo">
              <ElFilibusterismoTabContent/>
            </TabsContent>
        </Tabs>
    </div>
  )
}

export default MainContent