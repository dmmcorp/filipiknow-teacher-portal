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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useMutation, useQuery } from 'convex/react';
import {
  Edit,
  Eye,
  Filter,
  Grid3X3,
  ImageIcon,
  Loader2Icon,
  MessageSquare,
  MoreHorizontal,
  PenTool,
  Puzzle,
  Search,
  Trash2,
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';

type GameType =
  | '4pics1word'
  | 'multipleChoice'
  | 'jigsawPuzzle'
  | 'whoSaidIt'
  | 'identification';
type Novel = 'Noli me tangere' | 'El Filibusterismo';

interface Quiz {
  _id: Id<'games'>;
  teacherId: string;
  section: string;
  gradeLevel: string;
  novel: Novel;
  kabanata: number;
  level: number;
  gameType: GameType;
  createdAt: string;
  assessmentGameNumber?: number; // For assessment levels
  fourPicsOneWord?: {
    imageUrls: string[];
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
    imageUrl: string;
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
  identification?: {
    question: string;
    answer: string;
  };
}

const gameTypeIcons = {
  '4pics1word': ImageIcon,
  multipleChoice: Grid3X3,
  jigsawPuzzle: Puzzle,
  whoSaidIt: MessageSquare,
  identification: PenTool,
};

const gameTypeLabels = {
  '4pics1word': '4 Pics 1 Word',
  multipleChoice: 'Multiple Choice',
  jigsawPuzzle: 'Jigsaw Puzzle',
  whoSaidIt: 'Who Said It',
  identification: 'Identification',
};

function QuizManagement() {
  const { user } = useCurrentUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGameType, setSelectedGameType] = useState<string>('all');
  const [selectedNovel, setSelectedNovel] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [previewQuiz, setPreviewQuiz] = useState<Quiz | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const quizzes = useQuery(api.quiz.getQuizzes, {
    teacherId: user?._id as Id<'users'>,
  }) as Quiz[] | undefined;

  const deleteQuizMutation = useMutation(api.quiz.deleteQuiz);

  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);

  useEffect(() => {
    if (!quizzes) return;

    let filtered = quizzes;

    if (searchTerm) {
      filtered = filtered.filter(
        (quiz) =>
          quiz.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quiz.novel.toLowerCase().includes(searchTerm.toLowerCase()) ||
          gameTypeLabels[quiz.gameType]
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    if (selectedGameType !== 'all') {
      filtered = filtered.filter((quiz) => quiz.gameType === selectedGameType);
    }

    if (selectedNovel !== 'all') {
      filtered = filtered.filter((quiz) => quiz.novel === selectedNovel);
    }

    if (selectedSection !== 'all') {
      filtered = filtered.filter((quiz) => quiz.section === selectedSection);
    }

    setFilteredQuizzes(filtered);
  }, [searchTerm, selectedGameType, selectedNovel, selectedSection, quizzes]);

  const handleEdit = (quiz: Quiz) => {
    // Navigate to edit page or open edit modal
    // For now, just show a toast
    toast.success(`Editing quiz for ${quiz.novel} - Kabanata ${quiz.kabanata}`);
  };

  const handleDelete = async (quiz: Quiz) => {
    if (
      confirm(
        `Are you sure you want to delete this ${gameTypeLabels[quiz.gameType]} quiz?`
      )
    ) {
      try {
        await deleteQuizMutation({ id: quiz._id });
        toast.success('Quiz has been deleted successfully');
      } catch (error) {
        toast.error('Failed to delete quiz. Please try again.');
      }
    }
  };

  if (!quizzes) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <div className="animate-spin">
            <Loader2Icon className="h-6 w-6" />
          </div>
          <span>Loading quizzes...</span>
        </div>
      </div>
    );
  }

  console.log('quizzes:', quizzes);

  const handlePreview = (quiz: Quiz) => {
    setPreviewQuiz(quiz);
    setIsPreviewOpen(true);
  };

  const getUniqueValues = (key: keyof Quiz) => {
    if (!quizzes) return [];
    return Array.from(new Set(quizzes.map((quiz) => quiz[key] as string)));
  };

  const renderPreviewContent = () => {
    if (!previewQuiz) return null;

    switch (previewQuiz.gameType) {
      case '4pics1word':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {previewQuiz.fourPicsOneWord?.imageUrls.map((image, index) => (
                <Image
                  key={index}
                  src={image || '/placeholder.svg'}
                  alt={`Image ${index + 1}`}
                  className="w-full h-24 object-cover rounded border"
                  width={150}
                  height={150}
                />
              ))}
            </div>
            <div>
              <Label className="font-medium">Clue:</Label>
              <p className="text-sm text-gray-600 mt-1">
                {previewQuiz.fourPicsOneWord?.clue}
              </p>
            </div>
            <div>
              <Label className="font-medium">Answer:</Label>
              <p className="text-sm font-medium text-green-600 mt-1">
                {previewQuiz.fourPicsOneWord?.answer}
              </p>
            </div>
          </div>
        );

      case 'multipleChoice':
        return (
          <div className="space-y-4">
            <div>
              <Label className="font-medium">Question:</Label>
              <p className="text-sm text-gray-600 mt-1">
                {previewQuiz.multipleChoice?.question}
              </p>
            </div>
            <div>
              <Label className="font-medium">Options:</Label>
              <div className="space-y-2 mt-2">
                {previewQuiz.multipleChoice?.options.map((option, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded border text-sm ${
                      option.isCorrect
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50'
                    }`}
                  >
                    {option.text}{' '}
                    {option.isCorrect && (
                      <Badge variant="secondary" className="ml-2">
                        Correct
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'whoSaidIt':
        return (
          <div className="space-y-4">
            <div>
              <Label className="font-medium">Question:</Label>
              <p className="text-sm text-gray-600 mt-1">
                {previewQuiz.whoSaidIt?.question}
              </p>
            </div>
            <div>
              <Label className="font-medium">Quote:</Label>
              <p className="text-sm italic text-gray-600 mt-1">
                &quot;{previewQuiz.whoSaidIt?.quote}&quot;
              </p>
            </div>
            {previewQuiz.whoSaidIt?.hint && (
              <div>
                <Label className="font-medium">Hint:</Label>
                <p className="text-sm text-gray-600 mt-1">
                  {previewQuiz.whoSaidIt.hint}
                </p>
              </div>
            )}
            <div>
              <Label className="font-medium">Character Options:</Label>
              <div className="space-y-2 mt-2">
                {previewQuiz.whoSaidIt?.options.map((option, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded border text-sm ${
                      option.isCorrect
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50'
                    }`}
                  >
                    {option.name}{' '}
                    {option.isCorrect && (
                      <Badge variant="secondary" className="ml-2">
                        Correct
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'jigsawPuzzle':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-medium">Rows:</Label>
                <p className="text-sm text-gray-600">
                  {previewQuiz.jigsawPuzzle?.rows}
                </p>
              </div>
              <div>
                <Label className="font-medium">Columns:</Label>
                <p className="text-sm text-gray-600">
                  {previewQuiz.jigsawPuzzle?.columns}
                </p>
              </div>
            </div>
            <div>
              <Label className="font-medium">Puzzle Image:</Label>
              <Image
                src={previewQuiz.jigsawPuzzle?.imageUrl || '/placeholder.svg'}
                alt="Puzzle"
                className="w-full max-w-xs h-48 object-cover rounded border mt-2"
                width={200}
                height={200}
              />
            </div>
          </div>
        );

      case 'identification':
        return (
          <div className="space-y-4">
            <div>
              <Label className="font-medium">Question:</Label>
              <p className="text-sm text-gray-600 mt-1">
                {previewQuiz.identification?.question}
              </p>
            </div>
            <div>
              <Label className="font-medium">Answer:</Label>
              <p className="text-sm font-medium text-green-600 mt-1">
                {previewQuiz.identification?.answer}
              </p>
            </div>
          </div>
        );

      default:
        return <p>No preview available for this quiz type.</p>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quiz Management</h1>
          <p className="text-muted-foreground">
            View, edit, and manage your created quizzes
          </p>
        </div>
        <Button
          onClick={() => (window.location.href = '/teacher/quizzes/create')}
          variant="primary"
        >
          Create New Quiz
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search quizzes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Game Type</Label>
              <Select
                value={selectedGameType}
                onValueChange={setSelectedGameType}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.entries(gameTypeLabels).map(([type, label]) => (
                    <SelectItem key={type} value={type}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Novel</Label>
              <Select value={selectedNovel} onValueChange={setSelectedNovel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Novels</SelectItem>
                  <SelectItem value="Noli me tangere">
                    Noli me tangere
                  </SelectItem>
                  <SelectItem value="El Filibusterismo">
                    El Filibusterismo
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Section</Label>
              <Select
                value={selectedSection}
                onValueChange={setSelectedSection}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sections</SelectItem>
                  {getUniqueValues('section').map((section) => (
                    <SelectItem key={section} value={section}>
                      {section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedGameType('all');
                  setSelectedNovel('all');
                  setSelectedSection('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quizzes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Quizzes</CardTitle>
          <CardDescription>
            Showing {filteredQuizzes.length} of {quizzes?.length || 0} quizzes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Game Type</TableHead>
                <TableHead>Novel</TableHead>
                <TableHead>Kabanata</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuizzes.map((quiz) => {
                const Icon = gameTypeIcons[quiz.gameType];
                return (
                  <TableRow key={quiz._id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">
                          {gameTypeLabels[quiz.gameType]}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{quiz.novel}</Badge>
                    </TableCell>
                    <TableCell>{quiz.kabanata}</TableCell>
                    <TableCell>
                      {quiz.level}
                      {quiz.assessmentGameNumber && (
                        <span className="text-xs text-muted-foreground ml-1">
                          (Game {quiz.assessmentGameNumber})
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{quiz.section}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{quiz.gradeLevel}</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(quiz.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handlePreview(quiz)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(quiz)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(quiz)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl bg-white md:h-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {previewQuiz && (
                <>
                  {(() => {
                    const Icon = gameTypeIcons[previewQuiz.gameType];
                    return <Icon className="h-5 w-5" />;
                  })()}
                  {previewQuiz && gameTypeLabels[previewQuiz.gameType]} -{' '}
                  {previewQuiz?.novel}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {previewQuiz &&
                `Kabanata ${previewQuiz.kabanata}, Level ${previewQuiz.level}${previewQuiz.assessmentGameNumber ? ` (Assessment Game ${previewQuiz.assessmentGameNumber})` : ''} • ${previewQuiz.section} • ${previewQuiz.gradeLevel}`}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {renderPreviewContent()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default QuizManagement;
