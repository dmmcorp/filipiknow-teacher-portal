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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQuery } from 'convex/react';
import { Loader2, Upload, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';

type NovelType = 'Noli me tangere' | 'El Filibusterismo';

interface EditCharacterDialogProps {
  characterId: Id<'characters'> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditCharacterDialog({
  characterId,
  open,
  onOpenChange,
}: EditCharacterDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [novel, setNovel] = useState<NovelType>('Noli me tangere');
  const [role, setRole] = useState('');
  const [image, setImage] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageChanged, setImageChanged] = useState(false); // Track if image was changed
  const [isUploading, setIsUploading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const updateCharacter = useMutation(api.characters.updateCharacter);

  // Fetch character data
  const character = useQuery(
    api.characters.getCharacterById,
    characterId ? { characterId } : 'skip'
  );

  // Populate form when character data is loaded
  useEffect(() => {
    if (character && open) {
      setName(character.name);
      setDescription(character.description);
      setNovel(character.novel);
      setRole(character.role || '');
      setImage(''); // We'll set this only when uploading a new image
      setImagePreview(character.image || '');
      setImageChanged(false); // Reset the change flag
    }
  }, [character, open]);

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setIsUploading(true);
    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      const { storageId } = await result.json();

      setImage(storageId);

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setImageChanged(true); // Mark that image was changed

      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    setImage('');
    setImagePreview('');
    setImageChanged(true); // Mark that image was changed (removed)
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!characterId || !name.trim() || !description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsUpdating(true);
    try {
      const updateData: any = {
        characterId,
        name: name.trim(),
        description: description.trim(),
        novel,
        role: role.trim() || undefined,
      };

      // Only include image field if it was changed
      if (imageChanged) {
        updateData.image = image || undefined; // undefined will remove the image
      }

      await updateCharacter(updateData);

      toast.success(`Character "${name}" updated successfully!`);
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating character:', error);
      toast.error('Failed to update character');
    } finally {
      setIsUpdating(false);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setNovel('Noli me tangere');
    setRole('');
    setImage('');
    setImagePreview('');
    setImageChanged(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  if (!character && characterId) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle>Loading Character...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle>Edit Character</DialogTitle>
          <DialogDescription>
            Update the character information for {character?.novel}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Character Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Padre Damaso"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="novel">Novel *</Label>
              <Select
                value={novel}
                onValueChange={(value) => setNovel(value as NovelType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Noli me tangere">
                    Noli me tangere
                  </SelectItem>
                  <SelectItem value="El Filibusterismo">
                    El Filibusterismo
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role (Optional)</Label>
            <Input
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Antagonist, Protagonist, Supporting Character"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Isang mapang-abusong prayle na may malakas na impluwensiya sa lipunan at simbahan."
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Character Image (Optional)</Label>
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Character preview"
                  className="w-full h-48 object-cover rounded-lg border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Image
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    PNG, JPG up to 5MB
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUpdating || !name.trim() || !description.trim()}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Character'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
