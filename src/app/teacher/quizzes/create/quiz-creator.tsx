'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import { useCurrentUser } from '@/hooks/use-current-user';
import { useQuery } from 'convex/react';
import {
  Grid3X3,
  ImageIcon,
  MessageSquare,
  Plus,
  Puzzle,
  Upload,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { api } from '../../../../../convex/_generated/api';
import { Id } from '../../../../../convex/_generated/dataModel';

type GameType = '4pics1word' | 'multipleChoice' | 'jigsawPuzzle' | 'whoSaidIt';
type Novel = 'Noli me tangere' | 'El Filibusterismo';

interface QuizData {
  section: Id<'sections'> | undefined;
  novel: Novel;
  kabanata: number;
  level: number;
  gameType: GameType;
  fourPicsOneWord?: {
    images: string[];
    clue: string;
    answer: string;
  };
  multipleChoice?: {
    question: string;
    image?: string;
    options: Array<{
      text: string;
      image?: string;
      isCorrect?: boolean;
    }>;
  };
  jigsawPuzzle?: {
    image: string;
    rows: number;
    columns: number;
  };
  whoSaidIt?: {
    question: string;
    quote: string;
    hint?: string;
    options: Array<{
      name: string;
      image?: string;
      isCorrect?: boolean;
    }>;
  };
}

interface Section {
  _id: Id<'sections'>;
  name: string;
  gradeLevel: string;
  schoolYear: string;
}

export default function QuizCreator() {
  const { user, isLoading } = useCurrentUser();
  const sections = useQuery(api.sections.getSectionsByUserId, {
    userId: user?._id as Id<'users'>,
  }) as Section[] | undefined;

  const [currentStep, setCurrentStep] = useState(1);

  // note this is just the initial value....
  const [quizData, setQuizData] = useState<QuizData>({
    section: undefined,
    novel: 'Noli me tangere',
    kabanata: 1,
    level: 1,
    gameType: '4pics1word',
  });

  const gameTypeIcons = {
    '4pics1word': ImageIcon,
    multipleChoice: Grid3X3,
    jigsawPuzzle: Puzzle,
    whoSaidIt: MessageSquare,
  };

  const gameTypeLabels = {
    '4pics1word': '4 Pics 1 Word',
    multipleChoice: 'Multiple Choice',
    jigsawPuzzle: 'Jigsaw Puzzle',
    whoSaidIt: 'Who Said It',
  };

  const maxKabanata = {
    'Noli me tangere': 64,
    'El Filibusterismo': 39,
  };

  const handleStepNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleStepBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  //TODO PANSAMANTAGAL LANG MUNA PARA MAPUSH
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateQuizData = (field: string, value: any) => {
    setQuizData((prev) => ({ ...prev, [field]: value }));
  };

  const addImagePlaceholder = (gameType: GameType, index?: number) => {
    const placeholder = `/placeholder.svg?height=200&width=200&text=Upload+Image`;

    if (gameType === '4pics1word') {
      const current = quizData.fourPicsOneWord?.images || [];
      if (current.length < 4) {
        updateQuizData('fourPicsOneWord', {
          ...quizData.fourPicsOneWord,
          images: [...current, placeholder],
        });
      }
    }
  };

  const removeImage = (gameType: GameType, index: number) => {
    if (gameType === '4pics1word') {
      const current = quizData.fourPicsOneWord?.images || [];
      updateQuizData('fourPicsOneWord', {
        ...quizData.fourPicsOneWord,
        images: current.filter((_, i) => i !== index),
      });
    }
  };

  const addOption = (gameType: 'multipleChoice' | 'whoSaidIt') => {
    if (gameType === 'multipleChoice') {
      const current = quizData.multipleChoice?.options || [];
      if (current.length < 4) {
        updateQuizData('multipleChoice', {
          ...quizData.multipleChoice,
          options: [...current, { text: '', isCorrect: false }],
        });
      }
    } else if (gameType === 'whoSaidIt') {
      const current = quizData.whoSaidIt?.options || [];
      if (current.length < 4) {
        updateQuizData('whoSaidIt', {
          ...quizData.whoSaidIt,
          options: [...current, { name: '', isCorrect: false }],
        });
      }
    }
  };

  const updateOption = (
    gameType: 'multipleChoice' | 'whoSaidIt',
    index: number,
    field: string,
    // TODO: PANSAMANTAGAL LANG MUNA PARA MAPUSH
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any
  ) => {
    if (gameType === 'multipleChoice') {
      const current = quizData.multipleChoice?.options || [];
      const updated = current.map((option, i) =>
        i === index ? { ...option, [field]: value } : option
      );
      updateQuizData('multipleChoice', {
        ...quizData.multipleChoice,
        options: updated,
      });
    } else if (gameType === 'whoSaidIt') {
      const current = quizData.whoSaidIt?.options || [];
      const updated = current.map((option, i) =>
        i === index ? { ...option, [field]: value } : option
      );
      updateQuizData('whoSaidIt', {
        ...quizData.whoSaidIt,
        options: updated,
      });
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= step
                ? 'bg-background text-white'
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            {step}
          </div>
          {step < 3 && (
            <div
              className={`w-16 h-1 mx-2 ${currentStep > step ? 'bg-background' : 'bg-gray-200'}`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
        <CardDescription>
          Set up the basic details for your quiz
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="section">Section</Label>
          <Select
            value={quizData.section}
            onValueChange={(value) => updateQuizData('section', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a section" />
            </SelectTrigger>
            <SelectContent>
              {sections?.map((section: Section) => (
                <SelectItem key={section._id} value={section._id}>
                  {section.name} ({section.schoolYear})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {quizData.section && (
            <p className="text-sm text-muted-foreground mt-2">
              Grade Level:{' '}
              {sections?.find((s) => s._id === quizData.section)?.gradeLevel}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Novel</Label>
          <Select
            value={quizData.novel}
            onValueChange={(value: Novel) => updateQuizData('novel', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Noli me tangere">Noli me tangere</SelectItem>
              <SelectItem value="El Filibusterismo">
                El Filibusterismo
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="kabanata">Kabanata</Label>
            <Select
              value={quizData.kabanata.toString()}
              onValueChange={(value) =>
                updateQuizData('kabanata', parseInt(value))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: maxKabanata[quizData.novel] }, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    Kabanata {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="level">Level</Label>
            <Select
              value={quizData.level.toString()}
              onValueChange={(value) =>
                updateQuizData('level', parseInt(value))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 8 }, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    Level {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Game Type</CardTitle>
        <CardDescription>
          Choose the type of quiz game you want to create
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(gameTypeLabels).map(([type, label]) => {
            const Icon = gameTypeIcons[type as GameType];
            return (
              <div
                key={type}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-background/70 ${
                  quizData.gameType === type
                    ? 'border-background bg-background/15'
                    : 'border-gray-200'
                }`}
                onClick={() => updateQuizData('gameType', type)}
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <Icon className="w-8 h-8 text-background" />
                  <span className="font-medium">{label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );

  const render4PicsOneWordForm = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Images (4 required)</Label>
        <div className="grid grid-cols-2 gap-4">
          {(quizData.fourPicsOneWord?.images || []).map((image, index) => (
            <div key={index} className="relative">
              <Image
                src={image || '/placeholder.svg'}
                alt={`Image ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border"
                fill
              />
              <Button
                size="sm"
                variant="destructive"
                className="absolute top-2 right-2 w-6 h-6 p-0"
                onClick={() => removeImage('4pics1word', index)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {(quizData.fourPicsOneWord?.images?.length || 0) < 4 && (
            <Button
              variant="outline"
              className="h-32 border-dashed bg-transparent"
              onClick={() => addImagePlaceholder('4pics1word')}
            >
              <Upload className="w-6 h-6 mr-2" />
              Upload Image
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="clue">Clue</Label>
        <Textarea
          id="clue"
          placeholder="e.g., She's known for her devotion and faith in the novel"
          value={quizData.fourPicsOneWord?.clue || ''}
          onChange={(e) =>
            updateQuizData('fourPicsOneWord', {
              ...quizData.fourPicsOneWord,
              clue: e.target.value,
            })
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="answer">Answer</Label>
        <Input
          id="answer"
          placeholder="e.g., Maria Clara"
          value={quizData.fourPicsOneWord?.answer || ''}
          onChange={(e) =>
            updateQuizData('fourPicsOneWord', {
              ...quizData.fourPicsOneWord,
              answer: e.target.value,
            })
          }
        />
      </div>
    </div>
  );

  const renderMultipleChoiceForm = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="question">Question</Label>
        <Textarea
          id="question"
          placeholder="e.g., Sinong tauhan sa kwento ang nagalit sa 'Tinola'?"
          value={quizData.multipleChoice?.question || ''}
          onChange={(e) =>
            updateQuizData('multipleChoice', {
              ...quizData.multipleChoice,
              question: e.target.value,
            })
          }
        />
      </div>

      <div className="space-y-2">
        <Label>Question Image (Optional)</Label>
        <Button
          variant="outline"
          className="w-full h-32 border-dashed bg-transparent"
        >
          <Upload className="w-6 h-6 mr-2" />
          Upload Question Image
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Answer Options</Label>
          <Button
            size="sm"
            variant="outline"
            onClick={() => addOption('multipleChoice')}
            disabled={(quizData.multipleChoice?.options?.length || 0) >= 4}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Option
          </Button>
        </div>

        {(quizData.multipleChoice?.options || []).map((option, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <Label>Option {index + 1}</Label>
              <Checkbox
                checked={option.isCorrect || false}
                onCheckedChange={(checked) =>
                  updateOption('multipleChoice', index, 'isCorrect', checked)
                }
              />
            </div>
            <Input
              placeholder="Enter option text"
              value={option.text}
              onChange={(e) =>
                updateOption('multipleChoice', index, 'text', e.target.value)
              }
            />
            <Button
              variant="outline"
              size="sm"
              className="w-full bg-transparent"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Option Image (Optional)
            </Button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderJigsawPuzzleForm = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Puzzle Image</Label>
        <Button
          variant="outline"
          className="w-full h-48 border-dashed bg-transparent"
        >
          <Upload className="w-6 h-6 mr-2" />
          Upload Puzzle Image
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="rows">Rows</Label>
          <Select
            value={quizData.jigsawPuzzle?.rows?.toString() || '3'}
            onValueChange={(value) =>
              updateQuizData('jigsawPuzzle', {
                ...quizData.jigsawPuzzle,
                rows: Number.parseInt(value),
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2, 3, 4, 5, 6].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} rows
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="columns">Columns</Label>
          <Select
            value={quizData.jigsawPuzzle?.columns?.toString() || '3'}
            onValueChange={(value) =>
              updateQuizData('jigsawPuzzle', {
                ...quizData.jigsawPuzzle,
                columns: Number.parseInt(value),
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2, 3, 4, 5, 6].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} columns
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderWhoSaidItForm = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="question">Question</Label>
        <Input
          id="question"
          placeholder="e.g., Sino sa mga nasa litrato ang nagsabi sa linyang ito:"
          value={quizData.whoSaidIt?.question || ''}
          onChange={(e) =>
            updateQuizData('whoSaidIt', {
              ...quizData.whoSaidIt,
              question: e.target.value,
            })
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="quote">Quote</Label>
        <Textarea
          id="quote"
          placeholder="e.g., Ang isang indiyo ay kailanma'y hindi maaring lumampas sa fraile!"
          value={quizData.whoSaidIt?.quote || ''}
          onChange={(e) =>
            updateQuizData('whoSaidIt', {
              ...quizData.whoSaidIt,
              quote: e.target.value,
            })
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="hint">Hint (Optional)</Label>
        <Input
          id="hint"
          placeholder="e.g., Isa siyang indiyo na naging padre"
          value={quizData.whoSaidIt?.hint || ''}
          onChange={(e) =>
            updateQuizData('whoSaidIt', {
              ...quizData.whoSaidIt,
              hint: e.target.value,
            })
          }
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Character Options</Label>
          <Button
            size="sm"
            variant="outline"
            onClick={() => addOption('whoSaidIt')}
            disabled={(quizData.whoSaidIt?.options?.length || 0) >= 4}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Character
          </Button>
        </div>

        {(quizData.whoSaidIt?.options || []).map((option, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <Label>Character {index + 1}</Label>
              <Checkbox
                checked={option.isCorrect || false}
                onCheckedChange={(checked) =>
                  updateOption('whoSaidIt', index, 'isCorrect', checked)
                }
              />
            </div>
            <Input
              placeholder="Character name"
              value={option.name}
              onChange={(e) =>
                updateOption('whoSaidIt', index, 'name', e.target.value)
              }
            />
            <Button
              variant="outline"
              size="sm"
              className="w-full bg-transparent"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Character Image (Optional)
            </Button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Quiz Content</CardTitle>
        <CardDescription>
          Create content for your {gameTypeLabels[quizData.gameType]} quiz
        </CardDescription>
      </CardHeader>
      <CardContent>
        {quizData.gameType === '4pics1word' && render4PicsOneWordForm()}
        {quizData.gameType === 'multipleChoice' && renderMultipleChoiceForm()}
        {quizData.gameType === 'jigsawPuzzle' && renderJigsawPuzzleForm()}
        {quizData.gameType === 'whoSaidIt' && renderWhoSaidItForm()}
      </CardContent>
    </Card>
  );

  if (isLoading) return <div>Loading....</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">Create New Quiz</h1>
        <p className="text-gray-600 text-center">
          Design engaging quizzes for your students about Noli me tangere and El
          Filibusterismo
        </p>
      </div>

      {renderStepIndicator()}

      <div className="mb-8">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleStepBack}
          disabled={currentStep === 1}
        >
          Back
        </Button>

        <div className="flex gap-2">
          {currentStep < 3 ? (
            <Button onClick={handleStepNext}>Next</Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline">Save as Draft</Button>
              <Button>Publish Quiz</Button>
            </div>
          )}
        </div>
      </div>

      {/* Preview Panel */}
      {currentStep === 3 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quiz Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex gap-2">
                <Badge variant="secondary">{quizData.section}</Badge>
                {/* <Badge variant="secondary">{quizData.gradeLevel}</Badge> */}
                <Badge variant="outline">{quizData.novel}</Badge>
              </div>
              <p>
                <strong>Kabanata:</strong> {quizData.kabanata} |{' '}
                <strong>Level:</strong> {quizData.level}
              </p>
              <p>
                <strong>Game Type:</strong> {gameTypeLabels[quizData.gameType]}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
