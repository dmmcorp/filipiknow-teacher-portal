'use client';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import { useQuery } from 'convex/react';
import { BookOpen, Edit, Search, Trash2, Users } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';
import CreateCharacterDialog from './create-character-dialog';
import DeleteCharacterDialog from './delete-character-dialog';
import EditCharacterDialog from './edit-character-dialog';
type NovelType = 'Noli me tangere' | 'El Filibusterismo';

//NOTE: novel title is case sensitive e.g: Noli me tangere is correct while Noli Me Tangere is wrong.
function AdminDashboard() {
  // const statsOverview = useQuery(api.dialogues.getStatsOverview, {});
  // const chapters = useQuery(api.dialogues.getAllDialogues, {});

  const [selectedNovel, setSelectedNovel] =
    useState<NovelType>('Noli me tangere');
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog states
  const [editCharacterId, setEditCharacterId] =
    useState<Id<'characters'> | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteCharacterId, setDeleteCharacterId] =
    useState<Id<'characters'> | null>(null);
  const [deleteCharacterName, setDeleteCharacterName] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const characters = useQuery(api.characters.getCharacters, {
    novel: selectedNovel,
  });

  // Filter characters based on search query (novel filtering is done by backend)
  const filteredCharacters =
    characters?.filter((character) => {
      const matchesSearch =
        character.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        character.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    }) || [];

  // const filterChapters = () => {
  //   if (selectedNovel === 'El filibusterismo') {
  //     return chapters?.elFili;
  //   } else {
  //     return chapters?.noli;
  //   }
  // };

  // const filteredChapters = filterChapters();

  const handleEditCharacter = (characterId: Id<'characters'>) => {
    setEditCharacterId(characterId);
    setEditDialogOpen(true);
  };

  const handleDeleteCharacter = (
    characterId: Id<'characters'>,
    characterName: string
  ) => {
    setDeleteCharacterId(characterId);
    setDeleteCharacterName(characterName);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="flex-1 container mx-auto py-3 md:py-6 flex flex-col">
      <section className="flex justify-between mb-3">
        <div>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground">
            This dashboard page allows admins to manage chapters and characters
            for &quot;Noli Me Tangere&quot; and &quot;El Filibusterismo&quot;
            with stats, search, and editing features.
          </p>
        </div>
        <Link
          href="/admin/sections"
          className={buttonVariants({
            variant: 'primary',
          })}
        >
          Sections Management
        </Link>
      </section>
      {/* {statsOverview && <StatsOverview {...statsOverview} />} */}
      {/* Novel Selection & Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Tabs
          value={selectedNovel}
          onValueChange={(value) => setSelectedNovel(value as NovelType)}
          className="flex-1"
        >
          <TabsList className="grid w-full grid-cols-2 bg-white/60 backdrop-blur-sm">
            <TabsTrigger
              value="Noli me tangere"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Noli Me Tangere
            </TabsTrigger>
            <TabsTrigger
              value="El Filibusterismo"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              El Filibusterismo
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search chapters or characters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/60 backdrop-blur-sm border-white/20 focus:bg-white/80"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chapters Section */}
        <div className="lg:col-span-2">
          <Card className="bg-white/60 backdrop-blur-sm border-white/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Chapters
                  </CardTitle>
                  <CardDescription>
                    Manage your novel chapters and content
                  </CardDescription>
                </div>
                <Button variant="primary">Add Chapter</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 h-[45vh] max-h-[45vh] overflow-auto">
                {/* {filteredChapters && filteredChapters.length !== 0 ? (
                  filteredChapters.map((chapter) => (
                    <Card
                      key={chapter.chapter}
                      className="bg-white/40 border-white/30 hover:bg-white/60 transition-all duration-200 group"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-gray-900">
                                Chapter {chapter.chapter}:{' '}
                                {chapter.chapterTitle}
                              </h3>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                              <span className="flex items-center gap-1">
                                <BarChart3 className="w-3 h-3" />
                                {chapter.levels.toString()} Levels
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                {chapter.dialogues} dialogues
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <Link
                              href={`/admin/${selectedNovel}/${chapter.chapter}`}
                            >
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                    <BookOpen className="w-8 h-8 mb-2" />
                    <p className="font-medium">
                      No chapters have been added yet.
                    </p>
                    <p className="text-sm">
                      Click &quot;Add Chapter&quot; to create your first
                      chapter.
                    </p>
                  </div>
                )} */}
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                  <BookOpen className="w-8 h-8 mb-2" />
                  <p className="font-medium">
                    No chapters have been added yet.
                  </p>
                  <p className="text-sm">
                    Click &quot;Add Chapter&quot; to create your first chapter.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Characters Section */}
        <div>
          <Card className="bg-white/60 backdrop-blur-sm border-white/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Characters
                    <span className="text-sm font-normal text-muted-foreground">
                      ({filteredCharacters.length})
                    </span>
                  </CardTitle>
                  <CardDescription>
                    Character profiles for {selectedNovel}
                  </CardDescription>
                </div>
                <CreateCharacterDialog selectedNovel={selectedNovel} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3  max-h-[45vh] overflow-auto">
                {filteredCharacters.length > 0 ? (
                  filteredCharacters.map((character) => (
                    <Card
                      key={character._id}
                      className="bg-white/40 border-white/30 hover:bg-white/60 transition-all duration-200 group"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage
                              src={character.image || '/placeholder.svg'}
                            />

                            <AvatarFallback className="">
                              <div className="size-10 flex items-center justify-center rounded-full bg-gray-400">
                                {character.name.charAt(0)}
                              </div>
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 overflow-auto">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-900">
                                {character.name}
                              </h4>
                              {character.role && (
                                <Badge variant="secondary" className="text-xs">
                                  {character.role}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {character.description}
                            </p>
                          </div>

                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={() => handleEditCharacter(character._id)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              onClick={() =>
                                handleDeleteCharacter(
                                  character._id,
                                  character.name
                                )
                              }
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                    <Users className="w-8 h-8 mb-2" />
                    <p className="font-medium">
                      {searchQuery
                        ? 'No characters found'
                        : 'No characters have been added yet.'}
                    </p>
                    <p className="text-sm">
                      {searchQuery
                        ? 'Try adjusting your search terms.'
                        : `Click "Add" to create your first character for ${selectedNovel}.`}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Character Dialog */}
      <EditCharacterDialog
        characterId={editCharacterId}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />

      {/* Delete Character Dialog */}
      <DeleteCharacterDialog
        characterId={deleteCharacterId}
        characterName={deleteCharacterName}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </div>
  );
}

export default AdminDashboard;
