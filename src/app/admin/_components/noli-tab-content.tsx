'use client'
import { Card } from '@/components/ui/card'
import React, { useState } from 'react'

export default function NoliMeTangereTabContent() {
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  return (
    <Card className='w-full p-0'>
      <div className="chapters w-1/4 bg-white p-4 rounded-lg shadow-md">
        <h2 className="font-bold text-lg mb-2">Chapters</h2>
        <ul className="list-disc pl-5">
          <li>Chapter 1: Introduction</li>
          <li>Chapter 2: The Rise of the Novel</li>
          <li>Chapter 3: Themes and Motifs</li>
        </ul>
      </div>
    </Card>
  )
}
