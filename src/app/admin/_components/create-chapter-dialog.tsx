'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';

type NovelType = 'Noli me tangere' | 'El Filibusterismo';

interface CreateChapterDialogProps {
  selectedNovel: NovelType;
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
  scene_bg_image_preview?: string;
}

export default function CreateChapterDialog({
  selectedNovel,
}: CreateChapterDialogProps) {
  const [open, setOpen] = useState(false);
  const [chapter, setChapter] = useState('');
  const [chapterTitle, setChapterTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [backgroundImage, setBackgroundImage] = useState('');
  const [backgroundImagePreview, setBackgroundImagePreview] = useState('');
  const [dialogues, setDialogues] = useState<DialogueScene[]>([
    {
      sceneNumber: 1,
      speakerId: 'narrator',
      text: '',
      position: 'left',
    },
  ]);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const createChapter = useMutation(api.chapters.createChapter);

  // Fetch characters for the selected novel
  const characters = useQuery(api.characters.getCharacters, {
    novel: selectedNovel,
  });

  const handleSceneBackgroundUpload = async (
    file: File,
    sceneIndex: number
  ) => {
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

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);

      // Update the specific scene's background image
      const updatedDialogues = [...dialogues];
      updatedDialogues[sceneIndex] = {
        ...updatedDialogues[sceneIndex],
        scene_bg_image: storageId,
        scene_bg_image_preview: previewUrl,
      };
      setDialogues(updatedDialogues);

      toast.success('Scene background image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload background image');
    } finally {
      setIsUploading(false);
    }
  };

  const removeSceneBackground = (sceneIndex: number) => {
    const updatedDialogues = [...dialogues];
    delete updatedDialogues[sceneIndex].scene_bg_image;
    delete updatedDialogues[sceneIndex].scene_bg_image_preview;
    setDialogues(updatedDialogues);
  };

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

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);

      setBackgroundImage(storageId);
      setBackgroundImagePreview(previewUrl);

      toast.success('Chapter background image uploaded successfully');
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any
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

    if (!chapter.trim() || !chapterTitle.trim() || !summary.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (dialogues.some((d) => !d.text.trim())) {
      toast.error('Please fill in all dialogue texts');
      return;
    }

    setIsCreating(true);
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

      await createChapter({
        novel: selectedNovel,
        chapter: parseInt(chapter),
        chapter_title: chapterTitle.trim(),
        summary: summary.trim(),
        dialogues: formattedDialogues,
        bg_image: backgroundImage || undefined,
      });

      toast.success(
        `Chapter ${chapter}: "${chapterTitle}" created successfully!`
      );
      resetForm();
      setOpen(false);
    } catch (error) {
      console.error('Error creating chapter:', error);
      toast.error(
        'Failed to create chapter. Please check if chapter number already exists.'
      );
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setChapter('');
    setChapterTitle('');
    setSummary('');
    setBackgroundImage('');
    setBackgroundImagePreview('');
    setDialogues([
      {
        sceneNumber: 1,
        speakerId: 'narrator',
        text: '',
        position: 'left',
      },
    ]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Chapter
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto bg-white z-50">
        <DialogHeader>
          <DialogTitle>Create New Chapter</DialogTitle>
          <DialogDescription>
            Add a new chapter with dialogues for {selectedNovel}.
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
                        value={dialogue.speakerId}
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

                  {/* Scene Background Image Section */}
                  <div className="space-y-2 border-t pt-3">
                    <Label className="text-sm">Scene Background Image</Label>
                    {dialogue.scene_bg_image_preview ? (
                      <div className="relative">
                        <Image
                          src={dialogue.scene_bg_image_preview}
                          alt={`Scene ${dialogue.sceneNumber} background`}
                          width={400}
                          height={100}
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                          onClick={() => removeSceneBackground(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-200 rounded-lg p-3">
                        <div className="text-center">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file)
                                handleSceneBackgroundUpload(file, index);
                            }}
                            className="hidden"
                            id={`scene-bg-${index}`}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              document
                                .getElementById(`scene-bg-${index}`)
                                ?.click()
                            }
                            disabled={isUploading}
                          >
                            {isUploading ? (
                              <>
                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="mr-2 h-3 w-3" />
                                Upload Scene Background
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                setOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating || !chapter.trim() || !chapterTitle.trim()}
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Chapter'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
