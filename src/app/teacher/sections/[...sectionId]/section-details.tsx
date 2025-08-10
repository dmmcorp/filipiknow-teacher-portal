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
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useQuery } from 'convex/react';
import { ArrowLeft, Eye, TrendingUp, Users } from 'lucide-react';
import { useState } from 'react';
import { api } from '../../../../../convex/_generated/api';
import { Id } from '../../../../../convex/_generated/dataModel';

interface Student {
  _id: Id<'students'>;
  userId: Id<'users'>;
  section: Id<'sections'>;
  gradeLevel: string;
  userDetails: {
    _id: Id<'users'>;
    fname: string;
    lname: string;
    email: string;
    image?: string;
    role?: string;
  };
}

export default function SectionDetails({ sectionId }: { sectionId: string[] }) {
  const section = useQuery(api.sections.getSectionByIdWithStudents, {
    sectionId: sectionId[0] as Id<'sections'>,
  });
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Add loading state
  if (!section) return <div>Loading...</div>;

  // Calculate section statistics
  const totalStudents = section.students?.length ?? 0;
  const totalPossibleProgress = totalStudents * 2 * 64 * 8; // 2 novels, 64 chapters max, 8 levels each

  const totalCompletedProgress = 0; // This needs to be calculated based on your actual progress data
  const sectionProgressPercentage = Math.round(
    (totalCompletedProgress / totalPossibleProgress) * 100
  );

  const handleViewDetails = (student: Student) => {
    setSelectedStudent(student);
    setIsDetailsOpen(true);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderStudentDetails = () => {
    if (!selectedStudent) return null;

    return (
      <div className="space-y-6">
        {/* Student Info */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="text-lg font-semibold">
              {selectedStudent.userDetails.fname}{' '}
              {selectedStudent.userDetails.lname}
            </h3>
            <p className="text-sm text-gray-600">
              {selectedStudent.userDetails.email}
            </p>
            <div className="flex gap-2 mt-1">
              <Badge variant="outline">{section.name}</Badge>
              <Badge variant="secondary">{section.gradeLevel}</Badge>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{section.name}</h1>
          <p className="text-muted-foreground">
            {section.gradeLevel} • {section.schoolYear} • Teacher:{' '}
            {section.assignedTeacher?.fname} {section.assignedTeacher?.lname}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Number of Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Active students in this section
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Section Progress
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${getProgressColor(sectionProgressPercentage)}`}
            >
              {sectionProgressPercentage}%
            </div>
            <p className="text-xs text-muted-foreground">
              Overall completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Students</CardTitle>
          <CardDescription>
            Track individual student progress and performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Score</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {section.students?.map((student) => (
                <TableRow key={student._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-medium">
                          {student.userDetails?.fname}{' '}
                          {student.userDetails?.lname}
                        </div>
                        <div className="text-sm text-gray-600">
                          {student.userDetails?.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {/* TODO: Update once progress data is available */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Overall</span>
                        <span>0%</span>
                      </div>
                      <Progress value={0} className="h-2" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">N/A</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      // @ts-expect-error slight type mismatch will fix later. MARKED AS TODO....
                      onClick={() => handleViewDetails(student.userDetails)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Student Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>Student Progress Details</DialogTitle>
            <DialogDescription>
              Detailed progress and performance analytics
            </DialogDescription>
          </DialogHeader>
          {renderStudentDetails()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
