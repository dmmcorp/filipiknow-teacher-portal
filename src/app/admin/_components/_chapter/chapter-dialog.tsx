'use client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Eye } from 'lucide-react';
import { useState } from 'react';
interface ChapterDialogProps {
  chapter: number;
  title: string;
}
export default function ChapterDialog({ chapter, title }: ChapterDialogProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <Button
        onClick={() => setDialogOpen(true)}
        size="sm"
        variant="ghost"
        className="h-8 w-8 p-0"
      >
        <Eye className="w-5 h-5" />
      </Button>
      <DialogContent className="bg-white md:max-w-full lg:max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{`Chapter ${chapter}: ${title}`}</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
