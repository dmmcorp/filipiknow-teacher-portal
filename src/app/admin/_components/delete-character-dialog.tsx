'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useMutation } from 'convex/react';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';

interface DeleteCharacterDialogProps {
  characterId: Id<'characters'> | null;
  characterName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DeleteCharacterDialog({
  characterId,
  characterName,
  open,
  onOpenChange,
}: DeleteCharacterDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteCharacter = useMutation(api.characters.deleteCharacter);

  const handleDelete = async () => {
    if (!characterId) return;

    setIsDeleting(true);
    try {
      await deleteCharacter({ characterId });
      toast.success(`Character "${characterName}" deleted successfully!`);
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting character:', error);
      toast.error(
        'Failed to delete character. It may be used in existing content.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Character</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &quot;{characterName}&quot;? This
            action cannot be undone.
            <br />
            <br />
            <strong>Warning:</strong> If this character is used in any chapters
            or dialogues, those references may be broken.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Character'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
