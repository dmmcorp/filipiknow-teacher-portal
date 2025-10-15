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
  const [currentStep, setCurrentStep] = useState(0); // 0 = chapter info, 1+ = scenes
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
    // Navigate to the new scene
    setCurrentStep(dialogues.length + 1);
  };

  const removeDialogue = (index: number) => {
    if (dialogues.length > 1) {
      setDialogues(dialogues.filter((_, i) => i !== index));
      // Navigate to previous step if we deleted the current scene
      if (currentStep === index + 1) {
        setCurrentStep(Math.max(0, currentStep - 1));
      } else if (currentStep > index + 1) {
        setCurrentStep(currentStep - 1);
      }
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
    setCurrentStep(0);
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

  const handleNext = () => {
    // Validate current step before proceeding
    if (currentStep === 0) {
      if (!chapter.trim() || !chapterTitle.trim() || !summary.trim()) {
        toast.error('Please fill in all chapter information');
        return;
      }
    } else {
      const sceneIndex = currentStep - 1;
      if (!dialogues[sceneIndex]?.text.trim()) {
        toast.error('Please fill in the dialogue text');
        return;
      }
    }
    setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    setCurrentStep(Math.max(0, currentStep - 1));
  };

  const totalSteps = dialogues.length + 1; // +1 for chapter info step
  const currentSceneIndex = currentStep - 1;
  const currentDialogue = currentStep > 0 ? dialogues[currentSceneIndex] : null;

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
          <DialogTitle>
            Create New Chapter - Step {currentStep + 1} of {totalSteps}
          </DialogTitle>
          <DialogDescription>
            {currentStep === 0
              ? `Enter chapter information for ${selectedNovel}`
              : `Configure Scene ${currentSceneIndex + 1} of ${dialogues.length}`}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Progress</span>
            <span>
              {currentStep + 1} / {totalSteps}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 0: Chapter Information */}
          {currentStep === 0 && (
            <div className="space-y-4">
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
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Chapter Background Image (Optional)</Label>
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
            </div>
          )}

          {/* Step 1+: Scene Configuration */}
          {currentStep > 0 && currentDialogue && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <h3 className="font-semibold">
                  Scene {currentDialogue.sceneNumber}
                </h3>
                {dialogues.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      toast.warning(
                        `Delete Scene ${currentDialogue.sceneNumber}?`,
                        {
                          action: {
                            label: 'Delete',
                            onClick: () => removeDialogue(currentSceneIndex),
                          },
                          cancel: {
                            label: 'Cancel',
                            onClick: () => {},
                          },
                        }
                      );
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Scene
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Speaker</Label>
                  <Select
                    value={currentDialogue.speakerId}
                    onValueChange={(value) =>
                      updateDialogue(currentSceneIndex, 'speakerId', value)
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
                        <SelectItem key={character._id} value={character._id}>
                          {character.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Character Position</Label>
                  <Select
                    value={currentDialogue.position}
                    onValueChange={(value) =>
                      updateDialogue(currentSceneIndex, 'position', value)
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
                  value={currentDialogue.text}
                  onChange={(e) =>
                    updateDialogue(currentSceneIndex, 'text', e.target.value)
                  }
                  placeholder="Enter dialogue text..."
                  rows={4}
                  required
                />
              </div>

              {/* Highlighted Word Section */}
              <div className="space-y-2 border-t pt-3">
                <Label className="text-sm font-semibold">
                  Highlighted Word (Optional)
                </Label>
                {currentDialogue.highlighted_word ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Only one highlighted word allowed per chapter
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeHighlightedWord(currentSceneIndex)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Remove
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Word to highlight"
                        value={currentDialogue.highlighted_word.word}
                        onChange={(e) =>
                          updateDialogue(
                            currentSceneIndex,
                            'highlighted_word',
                            {
                              ...currentDialogue.highlighted_word!,
                              word: e.target.value,
                            }
                          )
                        }
                      />
                      <Input
                        placeholder="Definition"
                        value={currentDialogue.highlighted_word.definition}
                        onChange={(e) =>
                          updateDialogue(
                            currentSceneIndex,
                            'highlighted_word',
                            {
                              ...currentDialogue.highlighted_word!,
                              definition: e.target.value,
                            }
                          )
                        }
                      />
                    </div>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addHighlightedWord(currentSceneIndex)}
                  >
                    <Plus className="w-3 h-3 mr-2" />
                    Add Highlighted Word
                  </Button>
                )}
              </div>

              {/* Scene Background Image Section */}
              <div className="space-y-2 border-t pt-3">
                <Label className="text-sm font-semibold">
                  Scene Background Image (Optional)
                </Label>
                {currentDialogue.scene_bg_image_preview ? (
                  <div className="relative">
                    <Image
                      src={currentDialogue.scene_bg_image_preview}
                      alt={`Scene ${currentDialogue.sceneNumber} background`}
                      width={400}
                      height={150}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => removeSceneBackground(currentSceneIndex)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
                    <div className="text-center">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file)
                            handleSceneBackgroundUpload(
                              file,
                              currentSceneIndex
                            );
                        }}
                        className="hidden"
                        id={`scene-bg-${currentSceneIndex}`}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          document
                            .getElementById(`scene-bg-${currentSceneIndex}`)
                            ?.click()
                        }
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
                            Upload Scene Background
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <DialogFooter className="flex justify-between items-center">
            <div className="flex gap-2">
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
            </div>

            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                >
                  Previous
                </Button>
              )}

              {currentStep < dialogues.length && (
                <Button type="button" onClick={handleNext}>
                  Next
                </Button>
              )}

              {currentStep > 0 && currentStep === dialogues.length && (
                <Button type="button" variant="outline" onClick={addDialogue}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Scene
                </Button>
              )}

              {currentStep === dialogues.length && (
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Chapter'
                  )}
                </Button>
              )}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
