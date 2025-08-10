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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useMutation, useQuery } from 'convex/react';
import {
  Calendar,
  Edit,
  MoreHorizontal,
  Plus,
  School,
  Trash2,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';
import { SectionForm } from './section-form';

interface SectionFormData {
  name: string;
  gradeLevel: string;
  schoolYear: string;
  teacherId: string;
}

interface RawSection {
  _id: Id<'sections'>;
  name: string;
  gradeLevel: string;
  schoolYear: string;
  assignedTeacher?: {
    _id: Id<'users'>;
    fname: string;
    lname: string;
  } | null;
}

interface Section {
  _id: Id<'sections'>;
  name: string;
  gradeLevel: string;
  schoolYear: string;
  assignedTeacher?: {
    _id: Id<'users'>;
    fname: string;
    lname: string;
  };
}

export const SectionsPanel = () => {
  const rawSections = useQuery(api.sections.getAllSections) || [];
  const sections: Section[] = rawSections.map((section: RawSection) => ({
    ...section,
    assignedTeacher: section.assignedTeacher
      ? {
          _id: section.assignedTeacher._id,
          fname: section.assignedTeacher.fname,
          lname: section.assignedTeacher.lname,
        }
      : undefined,
  }));
  const teachers = useQuery(api.sections.getAllTeachers) || [];
  const create = useMutation(api.sections.create);
  const update = useMutation(api.sections.update);
  const remove = useMutation(api.sections.remove);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [formData, setFormData] = useState<SectionFormData>({
    name: '',
    gradeLevel: '',
    schoolYear: '',
    teacherId: '',
  });

  const createSection = async (data: SectionFormData) => {
    try {
      await create({
        name: data.name,
        gradeLevel: data.gradeLevel,
        schoolYear: data.schoolYear,
        teacherId: data.teacherId as Id<'users'>,
      });

      toast.success('Section created successfully');
    } catch (error) {
      toast.error('Failed to create section. Please try again');
    }
  };

  const updateSection = async (
    sectionId: Id<'sections'>,
    data: SectionFormData
  ) => {
    try {
      await update({
        id: sectionId,
        name: data.name,
        gradeLevel: data.gradeLevel,
        schoolYear: data.schoolYear,
        teacherId: data.teacherId as Id<'users'>,
      });

      toast.success('Section updated');
    } catch (error) {
      toast.error('Failed to update section. Please try again.');
    }
  };

  const deleteSection = async (sectionId: Id<'sections'>) => {
    try {
      await remove({
        id: sectionId,
      });

      toast.success('Section deleted');
    } catch (error) {
      toast.error('Failed to delete section. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      gradeLevel: '',
      schoolYear: '',
      teacherId: '',
    });
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createSection(formData);
    setIsCreateDialogOpen(false);
    resetForm();
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSection) {
      await updateSection(editingSection._id, formData);
      setIsEditDialogOpen(false);
      setEditingSection(null);
      resetForm();
    }
  };

  const handleEdit = (section: Section) => {
    setEditingSection(section);
    setFormData({
      name: section.name,
      gradeLevel: section.gradeLevel,
      schoolYear: section.schoolYear,
      teacherId: section.assignedTeacher?._id || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (section: Section) => {
    await deleteSection(section._id);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Section Management
          </h1>
          <p className="text-muted-foreground">
            Create and manage school sections with teacher assignments
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Create Section
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-white">
            <DialogHeader>
              <DialogTitle>Create New Section</DialogTitle>
              <DialogDescription>
                Add a new section and assign teachers to it.
              </DialogDescription>
            </DialogHeader>
            <SectionForm
              onSubmit={handleCreateSubmit}
              submitText="Create Section"
              formData={formData}
              setFormData={setFormData}
              teachers={teachers}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Sections
            </CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sections.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Teachers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teachers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current School Year
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2024-2025</div>
          </CardContent>
        </Card>
      </div>

      {/* Sections Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sections</CardTitle>
          <CardDescription>
            Manage all sections and their assigned teachers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Section Name</TableHead>
                <TableHead>Grade Level</TableHead>
                <TableHead>School Year</TableHead>
                <TableHead>Assigned Teacher</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sections.map((section) => (
                <TableRow key={section._id}>
                  <TableCell className="font-medium">{section.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{section.gradeLevel}</Badge>
                  </TableCell>
                  <TableCell>{section.schoolYear}</TableCell>
                  <TableCell>
                    {section.assignedTeacher ? (
                      <Badge variant="outline" className="text-xs">
                        {section.assignedTeacher.fname}{' '}
                        {section.assignedTeacher.lname}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        No teacher assigned
                      </span>
                    )}
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
                        <DropdownMenuItem onClick={() => handleEdit(section)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(section)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle>Edit Section</DialogTitle>
            <DialogDescription>
              Update section details and teacher assignments.
            </DialogDescription>
          </DialogHeader>
          <SectionForm
            onSubmit={handleEditSubmit}
            submitText="Update Section"
            formData={formData}
            setFormData={setFormData}
            teachers={teachers}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
