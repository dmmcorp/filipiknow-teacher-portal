'use client';

import { GameType } from '@/lib/types';
import { useMutation, useQuery } from 'convex/react';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { api } from '../../../../../convex/_generated/api';
import { Id } from '../../../../../convex/_generated/dataModel';

// Define proper types for game data
interface FourPicsOneWordData {
  images: string[];
  imageUrls?: string[];
  clue: string;
  answer: string;
}

interface MultipleChoiceOption {
  text: string;
  isCorrect: boolean;
}

interface MultipleChoiceData {
  question: string;
  image?: string;
  imageUrl?: string;
  options: MultipleChoiceOption[];
}

interface JigsawPuzzleData {
  image: string;
  imageUrl?: string;
  rows: number;
  columns: number;
}

interface WhoSaidItOption {
  name: string;
  image?: string;
  imageUrl?: string;
  isCorrect?: boolean;
}

interface WhoSaidItData {
  question: string;
  quote: string;
  hint?: string;
  options: WhoSaidItOption[];
}

interface IdentificationData {
  question: string;
  answer: string;
}

type GameData =
  | FourPicsOneWordData
  | MultipleChoiceData
  | JigsawPuzzleData
  | WhoSaidItData
  | IdentificationData;

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Loader2, Plus, Trash2, Upload, X } from 'lucide-react';
import Image from 'next/image';

interface QuizEditorProps {
  quizId: Id<'games'>;
}

const gameTypeLabels: Record<GameType, string> = {
  '4pics1word': '4 Pics 1 Word',
  multipleChoice: 'Multiple Choice',
  jigsawPuzzle: 'Jigsaw Puzzle',
  whoSaidIt: 'Who Said It',
  identification: 'Identification',
};

export default function QuizEditor({ quizId }: QuizEditorProps) {
  const router = useRouter();
  const quiz = useQuery(api.quiz.getQuizById, { quizId });
  const updateQuiz = useMutation(api.quiz.updateQuiz);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const [gameType, setGameType] = useState<GameType | null>(null);
  const [instruction, setInstruction] = useState('');
  const [timeLimit, setTimeLimit] = useState(0);
  const [points, setPoints] = useState(10);
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const multipleChoiceImageRef = useRef<HTMLInputElement>(null);
  const jigsawPuzzleImageRef = useRef<HTMLInputElement>(null);
  const whoSaidItImageRefs = useRef<HTMLInputElement[]>([]);

  if (quiz && gameType === null) {
    setGameType(quiz.gameType as GameType);
    setInstruction(quiz.instruction || '');
    setTimeLimit(quiz.time_limit || 0);
    setPoints(quiz.points || 10);

    switch (quiz.gameType) {
      case '4pics1word':
        if (quiz.fourPicsOneWord) {
          setGameData(quiz.fourPicsOneWord as FourPicsOneWordData);
        }
        break;
      case 'multipleChoice':
        if (quiz.multipleChoice) {
          setGameData(quiz.multipleChoice as MultipleChoiceData);
        }
        break;
      case 'jigsawPuzzle':
        if (quiz.jigsawPuzzle) {
          setGameData(quiz.jigsawPuzzle as JigsawPuzzleData);
        }
        break;
      case 'whoSaidIt':
        if (quiz.whoSaidIt) {
          setGameData(quiz.whoSaidIt as WhoSaidItData);
        }
        break;
      case 'identification':
        if (quiz.identification) {
          setGameData(quiz.identification as IdentificationData);
        }
        break;
    }
  }

  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      const { storageId } = await result.json();
      return storageId;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      throw error;
    }
  };

  const handleSubmit = async () => {
    const isAssessmentLevel = quiz && quiz.level === 10;
    const isTimeLimitValid = isAssessmentLevel ? timeLimit > 0 : true;

    if (
      !gameType ||
      !instruction ||
      !isTimeLimitValid ||
      points <= 0 ||
      !gameData
    ) {
      const missingFields = [];
      if (!gameType) missingFields.push('game type');
      if (!instruction) missingFields.push('instruction');
      if (!isTimeLimitValid)
        missingFields.push('time limit (required for assessments)');
      if (points <= 0) missingFields.push('points');
      if (!gameData) missingFields.push('game content');

      toast.error(`Please fill in: ${missingFields.join(', ')}`);
      return;
    }

    setIsLoading(true);
    try {
      interface UpdateData {
        quizId: Id<'games'>;
        gameType: GameType;
        instruction: string;
        timeLimit: number;
        points: number;
        fourPicsOneWord?: Omit<FourPicsOneWordData, 'imageUrls'>;
        multipleChoice?: Omit<MultipleChoiceData, 'imageUrl'>;
        jigsawPuzzle?: Omit<JigsawPuzzleData, 'imageUrl'>;
        whoSaidIt?: Omit<WhoSaidItData, 'options'> & {
          options: Omit<WhoSaidItOption, 'imageUrl'>[];
        };
        identification?: IdentificationData;
      }

      const updateData: UpdateData = {
        quizId,
        gameType,
        instruction,
        timeLimit: isAssessmentLevel ? timeLimit : 0,
        points,
      };

      switch (gameType) {
        case '4pics1word':
          const fourPicsData = gameData as FourPicsOneWordData;
          const { imageUrls, ...fourPicsDataWithoutUrls } = fourPicsData;
          updateData.fourPicsOneWord = fourPicsDataWithoutUrls;
          break;
        case 'multipleChoice':
          const multipleChoiceData = gameData as MultipleChoiceData;
          const { imageUrl, ...multipleChoiceDataWithoutUrl } =
            multipleChoiceData;
          updateData.multipleChoice = multipleChoiceDataWithoutUrl;
          break;
        case 'jigsawPuzzle':
          const jigsawData = gameData as JigsawPuzzleData;
          const { imageUrl: jigsawImageUrl, ...jigsawDataWithoutUrl } =
            jigsawData;
          updateData.jigsawPuzzle = jigsawDataWithoutUrl;
          break;
        case 'whoSaidIt':
          const whoSaidItGameData = gameData as WhoSaidItData;
          const whoSaidItData = {
            ...whoSaidItGameData,
            options:
              whoSaidItGameData.options?.map((option: WhoSaidItOption) => {
                const { imageUrl, ...optionData } = option;
                return optionData;
              }) || [],
          };
          updateData.whoSaidIt = whoSaidItData;
          break;
        case 'identification':
          updateData.identification = gameData as IdentificationData;
          break;
      }

      await updateQuiz(updateData);
      toast.success('Quiz updated successfully!');
      router.push('/teacher/quizzes');
    } catch (error) {
      console.error('Error pdating quiz:', error);
      toast.error('Failed to update quiz');
    } finally {
      setIsLoading(false);
    }
  };

  const render4PicsOneWordForm = () => {
    const data = (gameData as FourPicsOneWordData) || {
      images: [],
      clue: '',
      answer: '',
    };

    const handle4PicsImageUpload = async (file: File, index: number) => {
      const imageId = `4pics-${index}`;
      setUploadingImages((prev) => [...prev, imageId]);

      try {
        const storageId = await handleImageUpload(file);
        const newImages = [...data.images];
        newImages[index] = storageId;
        setGameData({ ...data, images: newImages });
      } catch (error) {
        console.error('Error uploading image:', error);
      } finally {
        setUploadingImages((prev) => prev.filter((id) => id !== imageId));
      }
    };

    const removeImage = (index: number) => {
      const newImages = [...data.images];
      newImages[index] = '';
      setGameData({ ...data, images: newImages });
    };

    return (
      <div className="space-y-4">
        <div>
          <Label>Images (4 required)</Label>
          <div className="grid grid-cols-2 gap-4 mt-2">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className="border border-dashed border-gray-300 rounded-lg p-4"
              >
                {data.images[index] ? (
                  <div className="relative">
                    <Image
                      src={data.imageUrls?.[index] || ''}
                      alt={`Image ${index + 1}`}
                      width={256}
                      height={128}
                      className="w-full h-32 object-cover rounded"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handle4PicsImageUpload(file, index);
                      }}
                      className="mt-2"
                    />
                    {uploadingImages.includes(`4pics-${index}`) && (
                      <div className="mt-2">
                        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="clue">Clue</Label>
          <Input
            id="clue"
            value={data.clue}
            onChange={(e) => setGameData({ ...data, clue: e.target.value })}
            placeholder="Enter clue"
          />
        </div>

        <div>
          <Label htmlFor="answer">Answer</Label>
          <Input
            id="answer"
            value={data.answer}
            onChange={(e) => setGameData({ ...data, answer: e.target.value })}
            placeholder="Enter answer"
          />
        </div>
      </div>
    );
  };

  const renderMultipleChoiceForm = () => {
    const data = (gameData as MultipleChoiceData) || {
      question: '',
      options: [{ text: '', isCorrect: false }],
      image: '',
    };

    const addOption = () => {
      setGameData({
        ...data,
        options: [...data.options, { text: '', isCorrect: false }],
      });
    };

    const removeOption = (index: number) => {
      const newOptions = data.options.filter(
        (_: MultipleChoiceOption, i: number) => i !== index
      );
      setGameData({ ...data, options: newOptions });
    };

    const updateOption = (
      index: number,
      field: keyof MultipleChoiceOption,
      value: string | boolean
    ) => {
      const newOptions = [...data.options];
      if (field === 'isCorrect' && value) {
        // Only one option can be correct
        newOptions.forEach((opt, i) => {
          opt.isCorrect = i === index;
        });
      } else {
        newOptions[index] = { ...newOptions[index], [field]: value };
      }
      setGameData({ ...data, options: newOptions });
    };

    const handleMCImageUpload = async (file: File) => {
      setUploadingImages((prev) => [...prev, 'mc-image']);
      try {
        const storageId = await handleImageUpload(file);
        setGameData({ ...data, image: storageId });
      } catch (error) {
        console.error('Error uploading image:', error);
      } finally {
        setUploadingImages((prev) => prev.filter((id) => id !== 'mc-image'));
      }
    };

    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="question">Question</Label>
          <Textarea
            id="question"
            value={data.question}
            onChange={(e) => setGameData({ ...data, question: e.target.value })}
            placeholder="Enter question"
            rows={3}
          />
        </div>

        <div>
          <Label>Image (Optional)</Label>
          {data.image ? (
            <div className="relative inline-block mt-2">
              <Image
                src={data.imageUrl || ''}
                alt="Question"
                width={128}
                height={128}
                className="w-32 h-32 object-cover rounded"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => setGameData({ ...data, image: '' })}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="border border-dashed border-gray-300 rounded-lg p-4 mt-2">
              <div className="text-center">
                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleMCImageUpload(file);
                  }}
                  className="mt-2"
                />
                {uploadingImages.includes('mc-image') && (
                  <div className="mt-2">
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label>Options</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addOption}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Option
            </Button>
          </div>
          <div className="space-y-2 mt-2">
            {data.options.map((option: MultipleChoiceOption, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={option.text}
                  onChange={(e) => updateOption(index, 'text', e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1"
                />
                <input
                  type="radio"
                  name="correctOption"
                  checked={option.isCorrect}
                  onChange={(e) =>
                    updateOption(index, 'isCorrect', e.target.checked)
                  }
                  className="w-4 h-4"
                />
                <Label className="text-sm">Correct</Label>
                {data.options.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeOption(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderJigsawPuzzleForm = () => {
    const data = (gameData as JigsawPuzzleData) || {
      image: '',
      rows: 3,
      columns: 3,
    };

    const handleJigsawImageUpload = async (file: File) => {
      setUploadingImages((prev) => [...prev, 'jigsaw-image']);
      try {
        const storageId = await handleImageUpload(file);
        setGameData({ ...data, image: storageId });
      } catch (error) {
        console.error('Error uploading image:', error);
      } finally {
        setUploadingImages((prev) =>
          prev.filter((id) => id !== 'jigsaw-image')
        );
      }
    };

    return (
      <div className="space-y-4">
        <div>
          <Label>Puzzle Image</Label>
          {data.image ? (
            <div className="relative inline-block mt-2">
              <Image
                src={data.imageUrl || ''}
                alt="Puzzle"
                width={192}
                height={192}
                className="w-48 h-48 object-cover rounded"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => setGameData({ ...data, image: '' })}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="border border-dashed border-gray-300 rounded-lg p-4 mt-2">
              <div className="text-center">
                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleJigsawImageUpload(file);
                  }}
                  className="mt-2"
                />
                {uploadingImages.includes('jigsaw-image') && (
                  <div className="mt-2">
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="rows">Rows</Label>
            <Input
              id="rows"
              type="number"
              min="2"
              max="6"
              value={data.rows}
              onChange={(e) =>
                setGameData({ ...data, rows: parseInt(e.target.value) || 3 })
              }
            />
          </div>
          <div>
            <Label htmlFor="columns">Columns</Label>
            <Input
              id="columns"
              type="number"
              min="2"
              max="6"
              value={data.columns}
              onChange={(e) =>
                setGameData({ ...data, columns: parseInt(e.target.value) || 3 })
              }
            />
          </div>
        </div>
      </div>
    );
  };

  const renderWhoSaidItForm = () => {
    const data = (gameData as WhoSaidItData) || {
      question: '',
      quote: '',
      hint: '',
      options: [{ name: '', image: '' }],
    };

    const addOption = () => {
      setGameData({
        ...data,
        options: [...data.options, { name: '', image: '' }],
      });
    };

    const removeOption = (index: number) => {
      const newOptions = data.options.filter(
        (_: WhoSaidItOption, i: number) => i !== index
      );
      setGameData({ ...data, options: newOptions });
    };

    const updateOption = (
      index: number,
      field: keyof WhoSaidItOption,
      value: string | boolean
    ) => {
      const newOptions = [...data.options];
      if (field === 'isCorrect' && value) {
        // Only one option can be correct
        newOptions.forEach((opt, i) => {
          opt.isCorrect = i === index;
        });
      } else {
        newOptions[index] = { ...newOptions[index], [field]: value };
      }
      setGameData({ ...data, options: newOptions });
    };

    const handleWhoSaidItImageUpload = async (file: File, index: number) => {
      const imageId = `who-said-${index}`;
      setUploadingImages((prev) => [...prev, imageId]);
      try {
        const storageId = await handleImageUpload(file);
        updateOption(index, 'image', storageId);
      } catch (error) {
        console.error('Error uploading image:', error);
      } finally {
        setUploadingImages((prev) => prev.filter((id) => id !== imageId));
      }
    };

    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="question">Question</Label>
          <Input
            id="question"
            value={data.question}
            onChange={(e) => setGameData({ ...data, question: e.target.value })}
            placeholder="Enter question"
          />
        </div>

        <div>
          <Label htmlFor="quote">Quote</Label>
          <Textarea
            id="quote"
            value={data.quote}
            onChange={(e) => setGameData({ ...data, quote: e.target.value })}
            placeholder="Enter the quote"
            rows={3}
          />
        </div>

        {/* <div>
          <Label htmlFor="hint">Hint (Optional)</Label>
          <Input
            id="hint"
            value={data.hint}
            onChange={(e) => setGameData({ ...data, hint: e.target.value })}
            placeholder="Enter hint"
          />
        </div> */}

        <div>
          <div className="flex items-center justify-between">
            <Label>Character Options</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addOption}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Character
            </Button>
          </div>
          <div className="space-y-4 mt-2">
            {data.options.map((option: WhoSaidItOption, index: number) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Input
                    value={option.name}
                    onChange={(e) =>
                      updateOption(index, 'name', e.target.value)
                    }
                    placeholder={`Character ${index + 1} name`}
                    className="flex-1"
                  />
                  <input
                    type="radio"
                    name="correctCharacter"
                    checked={option.isCorrect}
                    onChange={(e) =>
                      updateOption(index, 'isCorrect', e.target.checked)
                    }
                    className="w-4 h-4"
                  />
                  <Label className="text-sm">Correct</Label>
                  {data.options.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeOption(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* <div>
                  <Label className="text-sm">Character Image</Label>
                  {option.image ? (
                    <div className="relative inline-block mt-2">
                      <Image
                        src={option.imageUrl || ''}
                        alt={option.name}
                        width={96}
                        height={96}
                        className="w-24 h-24 object-cover rounded"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1"
                        onClick={() => updateOption(index, 'image', '')}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border border-dashed border-gray-300 rounded-lg p-2 mt-2">
                      <div className="text-center">
                        <Upload className="mx-auto h-6 w-6 text-gray-400" />
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleWhoSaidItImageUpload(file, index);
                          }}
                          className="mt-2"
                        />
                        {uploadingImages.includes(`who-said-${index}`) && (
                          <div className="mt-2">
                            <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div> */}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderIdentificationForm = () => {
    const data = (gameData as IdentificationData) || {
      question: '',
      answer: '',
    };

    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="question">Question</Label>
          <Textarea
            id="question"
            value={data.question}
            onChange={(e) => setGameData({ ...data, question: e.target.value })}
            placeholder="Enter the identification question"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="answer">Answer</Label>
          <Input
            id="answer"
            value={data.answer}
            onChange={(e) => setGameData({ ...data, answer: e.target.value })}
            placeholder="Enter the correct answer"
          />
        </div>
      </div>
    );
  };

  if (!quiz) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Edit Quiz</h1>
          <p className="text-muted-foreground">
            Chapter {quiz.kabanata}, Level {quiz.level} - {quiz.chapterTitle}
            {quiz.level === 10 && (
              <span className="ml-2 px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                Assessment Level
              </span>
            )}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push('/teacher/quizzes')}
        >
          Cancel
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Basic Information */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>
              Basic Information
              {quiz && quiz.level === 10 && (
                <span className="ml-2 text-sm font-normal text-orange-600">
                  (Assessment Mode)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="gameType">Game Type</Label>
              <Select
                value={gameType || ''}
                onValueChange={(value) => setGameType(value as GameType)}
                disabled={quiz && quiz.level !== 10} // Disable for levels 1-9
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select game type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(gameTypeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {quiz && quiz.level !== 10 && (
                <p className="text-sm text-muted-foreground mt-1">
                  Game type is fixed for levels 1-9
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="instruction">Instruction</Label>
              <Textarea
                id="instruction"
                placeholder="Enter game instruction"
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="timeLimit">
                Time Limit (seconds)
                {quiz && quiz.level === 10 && (
                  <span className="text-red-500">*</span>
                )}
              </Label>
              <Input
                id="timeLimit"
                type="number"
                min={quiz && quiz.level === 10 ? '1' : '0'}
                placeholder={
                  quiz && quiz.level === 10
                    ? 'Enter time limit'
                    : 'No time limit (optional)'
                }
                value={timeLimit || ''}
                onChange={(e) => setTimeLimit(parseInt(e.target.value) || 0)}
              />
              {quiz && quiz.level === 10 ? (
                <p className="text-sm text-muted-foreground mt-1">
                  Time limit is required for assessment levels
                </p>
              ) : (
                <p className="text-sm text-muted-foreground mt-1">
                  Time limit is only for assessments (leave it blank for regular
                  levels)
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="points">Points</Label>
              <Input
                id="points"
                type="number"
                min="1"
                placeholder="Enter points"
                value={points || ''}
                onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Game-Specific Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {gameType
                ? `${gameTypeLabels[gameType]} Settings`
                : 'Select Game Type'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {gameType === '4pics1word' && render4PicsOneWordForm()}
            {gameType === 'multipleChoice' && renderMultipleChoiceForm()}
            {gameType === 'jigsawPuzzle' && renderJigsawPuzzleForm()}
            {gameType === 'whoSaidIt' && renderWhoSaidItForm()}
            {gameType === 'identification' && renderIdentificationForm()}
            {!gameType && (
              <div className="text-center text-muted-foreground py-8">
                Please select a game type to configure the quiz settings.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => router.push('/teacher/quizzes')}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={
            isLoading ||
            !gameType ||
            !instruction ||
            (quiz && quiz.level === 10 && timeLimit <= 0) || // Only require time limit for level 10
            points <= 0 ||
            !gameData
          }
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            'Update Quiz'
          )}
        </Button>
      </div>
    </div>
  );
}
