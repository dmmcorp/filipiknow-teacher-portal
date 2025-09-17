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
import { Loader2, Plus, Trash2, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';

type NovelType = 'Noli me tangere' | 'El Filibusterismo';

interface EditChapterDialogProps {
  chapterId: Id<'chapters'> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface DialogueScene {
  sceneNumber: number;
  speakerId: Id<'characters'> | 'narrator';
  text: string;
  position: 'left' | 'center' | 'right';
  highlighted_word?: {
    word: string;
    definition: string;
  };
  scene_bg_image?: string;
}

export default function EditChapterDialog({
  chapterId,
  open,
  onOpenChange,
}: EditChapterDialogProps) {
  const [chapter, setChapter] = useState('');
  const [chapterTitle, setChapterTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [backgroundImage, setBackgroundImage] = useState('');
  const [backgroundImagePreview, setBackgroundImagePreview] = useState('');
  const [backgroundImageChanged, setBackgroundImageChanged] = useState(false);
  const [dialogues, setDialogues] = useState<DialogueScene[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedNovel, setSelectedNovel] =
    useState<NovelType>('Noli me tangere');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const updateChapter = useMutation(api.chapters.updateChapter);

  // Fetch chapter data
  const chapterData = useQuery(
    api.chapters.getChapterById,
    chapterId ? { chapterId } : 'skip'
  );

  // Fetch characters for the selected novel
  const characters = useQuery(api.characters.getCharacters, {
    novel: selectedNovel,
  });

  // Populate form when chapter data is loaded
  useEffect(() => {
    if (chapterData && open) {
      setChapter(chapterData.chapter.toString());
      setChapterTitle(chapterData.chapter_title);
      setSummary(chapterData.summary);
      setSelectedNovel(chapterData.novel);
      setBackgroundImage('');
      setBackgroundImagePreview(chapterData.bg_image || '');
      setBackgroundImageChanged(false);

      // Convert dialogues to the proper format
      const formattedDialogues = chapterData.dialogues.map(
        (dialogue, index) => ({
          sceneNumber: dialogue.sceneNumber || index + 1,
          speakerId: dialogue.speakerId || ('narrator' as const),
          text: dialogue.text,
          position: (dialogue.position || 'left') as
            | 'left'
            | 'center'
            | 'right',
          highlighted_word: dialogue.highlighted_word,
          scene_bg_image: undefined, // Note: scene_bg_image is not included in SceneTypes currently
        })
      );

      setDialogues(formattedDialogues);
    }
  }, [chapterData, open]);

  const handleBackgroundImageUpload = async (file: File) => {
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

      setBackgroundImage(storageId);

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setBackgroundImagePreview(previewUrl);
      setBackgroundImageChanged(true);

      toast.success('Background image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload background image');
    } finally {
      setIsUploading(false);
    }
  };

  const removeBackgroundImage = () => {
    setBackgroundImage('');
    setBackgroundImagePreview('');
    setBackgroundImageChanged(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const addDialogue = () => {
    const newSceneNumber =
      Math.max(...dialogues.map((d) => d.sceneNumber), 0) + 1;
    setDialogues([
      ...dialogues,
      {
        sceneNumber: newSceneNumber,
        speakerId: 'narrator',
        text: '',
        position: 'left',
      },
    ]);
  };

  const removeDialogue = (index: number) => {
    if (dialogues.length > 1) {
      setDialogues(dialogues.filter((_, i) => i !== index));
    }
  };

  const updateDialogue = (
    index: number,
    field: keyof DialogueScene,
    value: string | { word: string; definition: string } | undefined
  ) => {
    const updatedDialogues = [...dialogues];
    updatedDialogues[index] = {
      ...updatedDialogues[index],
      [field]: value,
    };
    setDialogues(updatedDialogues);
  };

  const addHighlightedWord = (index: number) => {
    // Check if there's already a highlighted word in any dialogue
    const hasHighlightedWord = dialogues.some((d) => d.highlighted_word?.word);
    if (hasHighlightedWord) {
      toast.error(
        'Only one highlighted word is allowed per chapter. Please remove the existing one first.'
      );
      return;
    }
    updateDialogue(index, 'highlighted_word', { word: '', definition: '' });
  };

  const removeHighlightedWord = (index: number) => {
    const updatedDialogues = [...dialogues];
    delete updatedDialogues[index].highlighted_word;
    setDialogues(updatedDialogues);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !chapterId ||
      !chapter.trim() ||
      !chapterTitle.trim() ||
      !summary.trim()
    ) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (dialogues.some((d) => !d.text.trim())) {
      toast.error('Please fill in all dialogue texts');
      return;
    }

    setIsUpdating(true);
    try {
      // Format dialogues for database
      const formattedDialogues = dialogues.map((dialogue) => ({
        sceneNumber: dialogue.sceneNumber,
        speakerId:
          dialogue.speakerId !== 'narrator'
            ? (dialogue.speakerId as Id<'characters'>)
            : undefined,
        text: dialogue.text.trim(),
        position: dialogue.position,
        highlighted_word: dialogue.highlighted_word?.word
          ? dialogue.highlighted_word
          : undefined,
        scene_bg_image: dialogue.scene_bg_image || undefined,
      }));

      const updateData: {
        chapterId: Id<'chapters'>;
        chapter?: number;
        chapter_title?: string;
        summary?: string;
        dialogues?: typeof formattedDialogues;
        bg_image?: string;
      } = {
        chapterId,
        chapter: parseInt(chapter),
        chapter_title: chapterTitle.trim(),
        summary: summary.trim(),
        dialogues: formattedDialogues,
      };

      // Only include bg_image if it was changed
      if (backgroundImageChanged) {
        updateData.bg_image = backgroundImage || undefined;
      }

      await updateChapter(updateData);

      toast.success(
        `Chapter ${chapter}: "${chapterTitle}" updated successfully!`
      );
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating chapter:', error);
      toast.error('Failed to update chapter');
    } finally {
      setIsUpdating(false);
    }
  };

  const resetForm = () => {
    setChapter('');
    setChapterTitle('');
    setSummary('');
    setBackgroundImage('');
    setBackgroundImagePreview('');
    setBackgroundImageChanged(false);
    setDialogues([]);
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

  if (!chapterData && chapterId) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto bg-white z-50">
          <DialogHeader>
            <DialogTitle>Loading Chapter...</DialogTitle>
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
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto bg-white z-50">
        <DialogHeader>
          <DialogTitle>Edit Chapter</DialogTitle>
          <DialogDescription>
            Update chapter information for {selectedNovel}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Chapter Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="chapter">Chapter Number *</Label>
              <Input
                id="chapter"
                type="number"
                min="1"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                placeholder="1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Chapter Title *</Label>
              <Input
                id="title"
                value={chapterTitle}
                onChange={(e) => setChapterTitle(e.target.value)}
                placeholder="Ang Piging"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Summary *</Label>
            <Textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Enter chapter summary..."
              rows={3}
              required
            />
          </div>

          {/* Background Image */}
          <div className="space-y-2">
            <Label>Chapter Background Image</Label>
            {backgroundImagePreview ? (
              <div className="relative">
                <Image
                  src={backgroundImagePreview}
                  alt="Background preview"
                  width={800}
                  height={192}
                  className="w-full h-48 object-cover rounded-lg border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={removeBackgroundImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-gray-400" />
                  <div className="mt-2">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleBackgroundImageUpload(file);
                      }}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
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
                          Upload Background
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Dialogues Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Dialogues *</Label>
              <Button
                type="button"
                onClick={addDialogue}
                size="sm"
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Dialogue
              </Button>
            </div>

            <div className="space-y-4 max-h-60 overflow-y-auto">
              {dialogues.map((dialogue, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">
                      Scene {dialogue.sceneNumber}
                    </span>
                    {dialogues.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDialogue(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Speaker</Label>
                      <Select
                        value={dialogue.speakerId as string}
                        onValueChange={(value) =>
                          updateDialogue(index, 'speakerId', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select character..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="narrator">
                            No Speaker (Narrator)
                          </SelectItem>
                          {characters?.map((character) => (
                            <SelectItem
                              key={character._id}
                              value={character._id}
                            >
                              {character.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Position</Label>
                      <Select
                        value={dialogue.position}
                        onValueChange={(value) =>
                          updateDialogue(index, 'position', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">Left</SelectItem>
                          <SelectItem value="center">Center</SelectItem>
                          <SelectItem value="right">Right</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Dialogue Text *</Label>
                    <Textarea
                      value={dialogue.text}
                      onChange={(e) =>
                        updateDialogue(index, 'text', e.target.value)
                      }
                      placeholder="Enter dialogue text..."
                      rows={2}
                      required
                    />
                  </div>

                  {/* Highlighted Word Section */}
                  {dialogue.highlighted_word ? (
                    <div className="space-y-2 border-t pt-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Highlighted Word</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeHighlightedWord(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Word to highlight"
                          value={dialogue.highlighted_word.word}
                          onChange={(e) =>
                            updateDialogue(index, 'highlighted_word', {
                              ...dialogue.highlighted_word!,
                              word: e.target.value,
                            })
                          }
                        />
                        <Input
                          placeholder="Definition"
                          value={dialogue.highlighted_word.definition}
                          onChange={(e) =>
                            updateDialogue(index, 'highlighted_word', {
                              ...dialogue.highlighted_word!,
                              definition: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addHighlightedWord(index)}
                    >
                      Add Highlighted Word
                    </Button>
                  )}
                </div>
              ))}
            </div>
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
              disabled={isUpdating || !chapter.trim() || !chapterTitle.trim()}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Chapter'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
