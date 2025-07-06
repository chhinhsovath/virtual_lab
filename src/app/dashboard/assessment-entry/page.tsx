'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Badge } from '../../../components/ui/badge';
import { toast } from 'sonner';
import { FileText, Save, Users } from 'lucide-react';

const assessmentSchema = z.object({
  studentId: z.string().min(1, 'Please select a student'),
  cycle: z.string().min(1, 'Please select a cycle'),
  levelAchieved: z.string().min(1, 'Please select a level achieved'),
  assessmentDate: z.string().min(1, 'Assessment date is required'),
  notes: z.string().optional(),
});

type AssessmentFormData = z.infer<typeof assessmentSchema>;

interface Student {
  chiID: number;
  chiName: string;
  chiGender: string;
  chiClass: number;
}

interface Session {
  userId: number;
  teacherId: number;
  schoolAccess: { schoolId: number; accessType: string; subject?: string }[];
  subject: string;
}

export default function AssessmentEntryPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<AssessmentFormData>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
      assessmentDate: new Date().toISOString().split('T')[0],
    },
  });

  const selectedStudentId = watch('studentId');
  const selectedCycle = watch('cycle');
  const selectedSubject = session?.subject;

  // Assessment levels based on subject
  const assessmentLevels = {
    Khmer: ['Beginner', 'Letter', 'Word', 'Paragraph', 'Story'],
    Math: ['Beginner', '1-Digit', '2-Digit', 'Subtraction', 'Advanced'],
  };

  const levelLabels: Record<string, { en: string; kh: string }> = {
    'Beginner': { en: 'Beginner', kh: 'ចាប់ផ្តើម' },
    'Letter': { en: 'Letter', kh: 'អក្សរ' },
    'Word': { en: 'Word', kh: 'ពាក្យ' },
    'Paragraph': { en: 'Paragraph', kh: 'កថាខណ្ឌ' },
    'Story': { en: 'Story', kh: 'រឿង' },
    '1-Digit': { en: '1-Digit', kh: 'ខ្ទង់តួ ១' },
    '2-Digit': { en: '2-Digit', kh: 'ខ្ទង់តួ ២' },
    'Subtraction': { en: 'Subtraction', kh: 'ការដក' },
    'Advanced': { en: 'Advanced', kh: 'កម្រិតខ្ពស់' },
  };

  useEffect(() => {
    fetchSession();
  }, []);

  useEffect(() => {
    if (session) {
      fetchStudents();
    }
  }, [session]);

  const fetchSession = async () => {
    try {
      const response = await fetch('/api/auth/session');
      if (response.ok) {
        const data = await response.json();
        setSession(data.user);
      }
    } catch (error) {
      console.error('Error fetching session:', error);
    }
  };

  const fetchStudents = async () => {
    if (!session?.schoolAccess?.length) return;

    setIsLoading(true);
    try {
      const firstSchoolId = session.schoolAccess[0]?.schoolId;
      if (!firstSchoolId) {
        toast.error('No school access found');
        return;
      }

      const response = await fetch(`/api/students/${firstSchoolId}`);
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students);
      } else {
        toast.error('Failed to load students');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Error loading students');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: AssessmentFormData) => {
    if (!session) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: parseInt(data.studentId),
          teacherId: session.teacherId,
          schoolId: session.schoolAccess[0]?.schoolId,
          subject: session.subject,
          cycle: data.cycle,
          levelAchieved: data.levelAchieved,
          assessmentDate: data.assessmentDate,
          notes: data.notes,
        }),
      });

      if (response.ok) {
        toast.success('Assessment saved successfully!');
        reset({
          assessmentDate: new Date().toISOString().split('T')[0],
        });
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save assessment');
      }
    } catch (error) {
      console.error('Error saving assessment:', error);
      toast.error('Error saving assessment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedStudent = students.find(s => s.chiID.toString() === selectedStudentId);
  const currentLevels = selectedSubject ? assessmentLevels[selectedSubject as keyof typeof assessmentLevels] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Assessment Entry</h1>
        <p className="font-khmer text-xl text-gray-600">បញ្ចូលការវាយតម្លៃ</p>
        <p className="text-gray-600">
          Enter assessment results for {session?.subject} subject
        </p>
      </div>

      {/* Assessment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>New Assessment</span>
          </CardTitle>
          <CardDescription>
            Fill in the assessment details for a student
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Student Selection */}
              <div className="space-y-2">
                <Label htmlFor="studentId">Student *</Label>
                <Select
                  value={selectedStudentId}
                  onValueChange={(value) => setValue('studentId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoading ? (
                      <SelectItem value="loading" disabled>Loading students...</SelectItem>
                    ) : students.length === 0 ? (
                      <SelectItem value="no-students" disabled>No students found</SelectItem>
                    ) : (
                      students.map((student) => (
                        <SelectItem key={student.chiID} value={student.chiID.toString()}>
                          {student.chiName} (Grade {student.chiClass}, {student.chiGender})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.studentId && (
                  <p className="text-sm text-red-600">{errors.studentId.message}</p>
                )}
              </div>

              {/* Cycle Selection */}
              <div className="space-y-2">
                <Label htmlFor="cycle">Assessment Cycle *</Label>
                <Select
                  value={selectedCycle}
                  onValueChange={(value) => setValue('cycle', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select cycle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Baseline">Baseline</SelectItem>
                    <SelectItem value="Midline">Midline</SelectItem>
                    <SelectItem value="Endline">Endline</SelectItem>
                  </SelectContent>
                </Select>
                {errors.cycle && (
                  <p className="text-sm text-red-600">{errors.cycle.message}</p>
                )}
              </div>
            </div>

            {/* Subject and Level */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Subject</Label>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-base px-3 py-1">
                    {session?.subject}
                  </Badge>
                  <span className="font-khmer text-gray-600">
                    {session?.subject === 'Khmer' ? 'ភាសាខ្មែរ' : 'គណិតវិទ្យា'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="levelAchieved">Level Achieved *</Label>
                <Select
                  value={watch('levelAchieved')}
                  onValueChange={(value) => setValue('levelAchieved', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level achieved" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentLevels.map((level) => {
                      const levelLabel = levelLabels[level] || { en: level, kh: level };
                      return (
                        <SelectItem key={level} value={level}>
                          <div className="flex items-center space-x-2">
                            <span>{levelLabel.en}</span>
                            <span className="font-khmer text-sm text-gray-500">
                              {levelLabel.kh}
                            </span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {errors.levelAchieved && (
                  <p className="text-sm text-red-600">{errors.levelAchieved.message}</p>
                )}
              </div>
            </div>

            {/* Assessment Date */}
            <div className="space-y-2">
              <Label htmlFor="assessmentDate">Assessment Date *</Label>
              <Input
                id="assessmentDate"
                type="date"
                {...register('assessmentDate')}
              />
              {errors.assessmentDate && (
                <p className="text-sm text-red-600">{errors.assessmentDate.message}</p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes about the assessment..."
                className="min-h-[100px]"
                {...register('notes')}
              />
            </div>

            {/* Selected Student Info */}
            {selectedStudent && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900">Selected Student</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <p><strong>Name:</strong> {selectedStudent.chiName}</p>
                    <p><strong>Grade:</strong> {selectedStudent.chiClass}</p>
                    <p><strong>Gender:</strong> {selectedStudent.chiGender}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{isSubmitting ? 'Saving...' : 'Save Assessment'}</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}