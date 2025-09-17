'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useMutation } from 'convex/react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';

interface DeleteChapterDialogProps {
  chapterId: Id<'chapters'> | null;
  chapterTitle: string;
  chapterNumber: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DeleteChapterDialog({
  chapterId,
  chapterTitle,
  chapterNumber,
  open,
  onOpenChange,
}: DeleteChapterDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteChapter = useMutation(api.chapters.deleteChapter);

  const handleDelete = async () => {
    if (!chapterId) return;

    setIsDeleting(true);
    try {
      await deleteChapter({ chapterId });
      toast.success(
        `Chapter ${chapterNumber}: "${chapterTitle}" deleted successfully!`
      );
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting chapter:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete chapter';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete Chapter
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the
            chapter and remove all its data.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-800 mb-2">
              You are about to delete:
            </h4>
            <p className="text-red-700">
              <strong>Chapter {chapterNumber}:</strong> {chapterTitle}
            </p>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Warning:</strong> You can only delete chapters that have
              no associated levels or games. If this chapter has levels, please
              delete all levels first.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <AlertTriangle className="mr-2 h-4 w-4" />
                Delete Chapter
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
