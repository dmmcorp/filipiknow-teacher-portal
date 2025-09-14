import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dispatch, SetStateAction } from 'react';
import { Doc } from '../../../../convex/_generated/dataModel';

interface SectionFormData {
  name: string;
  gradeLevel: string;
  schoolYear: string;
  teacherId: string;
}

interface SectionFormProps {
  onSubmit: (e: React.FormEvent) => void;
  submitText: string;
  teachers: Doc<'users'>[];
  formData: SectionFormData;
  setFormData: Dispatch<SetStateAction<SectionFormData>>;
}

export const SectionForm = ({
  onSubmit,
  submitText,
  formData,
  setFormData,
  teachers,
}: SectionFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Section Name</Label>
        <Input
          id="name"
          placeholder="e.g., Section A"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="gradeLevel">Grade Level</Label>
        <Select
          value={formData.gradeLevel}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, gradeLevel: value }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select grade level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Grade 9">Grade 9</SelectItem>
            <SelectItem value="Grade 10">Grade 10</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="schoolYear">School Year</Label>
        <Select
          value={formData.schoolYear}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, schoolYear: value }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select school year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2024-2025">2024-2025</SelectItem>
            <SelectItem value="2025-2026">2025-2026</SelectItem>
            <SelectItem value="2026-2027">2026-2027</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Assign Teacher</Label>
        <Select
          value={formData.teacherId}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, teacherId: value }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a teacher" />
          </SelectTrigger>
          <SelectContent>
            {teachers.map((teacher) => (
              <SelectItem key={teacher._id} value={teacher._id}>
                <div className="flex flex-col">
                  <span className="font-medium">
                    {teacher.fname} {teacher.lname}
                  </span>
                  <span className="text-sm text-gray-500">{teacher.email}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DialogFooter>
        <Button type="submit" variant="primary">
          {submitText}
        </Button>
      </DialogFooter>
    </form>
  );
};
