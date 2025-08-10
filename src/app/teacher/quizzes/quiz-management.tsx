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
import {
  Edit,
  Eye,
  Filter,
  Grid3X3,
  ImageIcon,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Puzzle,
  Search,
  Trash2,
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type GameType = '4pics1word' | 'multipleChoice' | 'jigsawPuzzle' | 'whoSaidIt';
type Novel = 'Noli me tangere' | 'El Filibusterismo';

interface Quiz {
  _id: string;
  teacherId: string;
  section: string;
  gradeLevel: string;
  novel: Novel;
  kabanata: number;
  level: number;
  gameType: GameType;
  createdAt: string;
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

// Mock data
const mockQuizzes: Quiz[] = [
  {
    _id: 'q1',
    teacherId: 't1',
    section: 'Section A',
    gradeLevel: 'Grade 9',
    novel: 'Noli me tangere',
    kabanata: 1,
    level: 1,
    gameType: '4pics1word',
    createdAt: '2024-01-15',
    fourPicsOneWord: {
      images: [
        '/placeholder.svg?height=100&width=100',
        '/placeholder.svg?height=100&width=100',
        '/placeholder.svg?height=100&width=100',
        '/placeholder.svg?height=100&width=100',
      ],
      clue: "She's known for her devotion and faith in the novel",
      answer: 'Maria Clara',
    },
  },
  {
    _id: 'q2',
    teacherId: 't1',
    section: 'Section A',
    gradeLevel: 'Grade 9',
    novel: 'Noli me tangere',
    kabanata: 1,
    level: 2,
    gameType: 'multipleChoice',
    createdAt: '2024-01-16',
    multipleChoice: {
      question: "Sinong tauhan sa kwento ang nagalit sa 'Tinola'?",
      options: [
        { text: 'Crisostomo Ibarra', isCorrect: true },
        { text: 'Padre Damaso', isCorrect: false },
        { text: 'Maria Clara', isCorrect: false },
        { text: 'Kapitan Tiago', isCorrect: false },
      ],
    },
  },
  {
    _id: 'q3',
    teacherId: 't1',
    section: 'Section B',
    gradeLevel: 'Grade 10',
    novel: 'El Filibusterismo',
    kabanata: 2,
    level: 1,
    gameType: 'whoSaidIt',
    createdAt: '2024-01-17',
    whoSaidIt: {
      question: 'Sino ang nagsabi ng linyang ito:',
      quote: "Ang isang indiyo ay kailanma'y hindi maaring lumampas sa fraile!",
      hint: 'Isa siyang indiyo na naging padre',
      options: [
        { name: 'Padre Damaso', isCorrect: true },
        { name: 'Crisostomo Ibarra', isCorrect: false },
        { name: 'Elias', isCorrect: false },
        { name: 'Kapitan Tiago', isCorrect: false },
      ],
    },
  },
  {
    _id: 'q4',
    teacherId: 't1',
    section: 'Section A',
    gradeLevel: 'Grade 9',
    novel: 'Noli me tangere',
    kabanata: 3,
    level: 1,
    gameType: 'jigsawPuzzle',
    createdAt: '2024-01-18',
    jigsawPuzzle: {
      image: '/placeholder.svg?height=300&width=300',
      rows: 3,
      columns: 3,
    },
  },
];

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

export default function QuizManagement() {
  const [quizzes, setQuizzes] = useState<Quiz[]>(mockQuizzes);
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>(mockQuizzes);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGameType, setSelectedGameType] = useState<string>('all');
  const [selectedNovel, setSelectedNovel] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [previewQuiz, setPreviewQuiz] = useState<Quiz | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Filter quizzes based on search and filters
  const applyFilters = () => {
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
  };

  // Apply filters whenever search term or filters change
  useEffect(() => {
    applyFilters();
  }, [searchTerm, selectedGameType, selectedNovel, selectedSection, quizzes]);

  const handleEdit = (quiz: Quiz) => {
    // Navigate to edit page or open edit modal
    // For now, just show a toast
    toast.success(
      `Editing ${gameTypeLabels[quiz.gameType]} quiz for ${quiz.novel} - Kabanata ${quiz.kabanata}`
    );
  };

  const handleDelete = async (quiz: Quiz) => {
    if (
      confirm(
        `Are you sure you want to delete this ${gameTypeLabels[quiz.gameType]} quiz?`
      )
    ) {
      try {
        // await ctx.runMutation(api.games.delete, { id: quiz._id })

        // Mock implementation
        setQuizzes((prev) => prev.filter((q) => q._id !== quiz._id));

        toast.success('Quiz has been deleted successfully');
      } catch (error) {
        toast.error('Failed to delete quiz. Please try again.');
      }
    }
  };

  const handlePreview = (quiz: Quiz) => {
    setPreviewQuiz(quiz);
    setIsPreviewOpen(true);
  };

  const getUniqueValues = (key: keyof Quiz) => {
    return Array.from(new Set(quizzes.map((quiz) => quiz[key] as string)));
  };

  const renderPreviewContent = () => {
    if (!previewQuiz) return null;

    switch (previewQuiz.gameType) {
      case '4pics1word':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {previewQuiz.fourPicsOneWord?.images.map((image, index) => (
                <Image
                  key={index}
                  src={image || '/placeholder.svg'}
                  alt={`Image ${index + 1}`}
                  className="w-full h-24 object-cover rounded border"
                  fill
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
            <div>
              <Label className="font-medium">Puzzle Image:</Label>
              <Image
                src={previewQuiz.jigsawPuzzle?.image || '/placeholder.svg'}
                alt="Puzzle"
                className="w-full max-w-xs h-48 object-cover rounded border mt-2"
                fill
              />
            </div>
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
        >
          <Plus className="mr-2 h-4 w-4" />
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
            Showing {filteredQuizzes.length} of {quizzes.length} quizzes
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
                    <TableCell>{quiz.level}</TableCell>
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
        <DialogContent className="max-w-2xl bg-white">
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
                `Kabanata ${previewQuiz.kabanata}, Level ${previewQuiz.level} • ${previewQuiz.section} • ${previewQuiz.gradeLevel}`}
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
