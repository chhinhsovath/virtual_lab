'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { 
  FileText, CheckCircle, XCircle, Clock, Award, 
  MessageSquare, Save, Search, Filter
} from 'lucide-react';
import { format } from 'date-fns';

interface Simulation {
  id: string;
  display_name_km: string;
  display_name_en: string;
  subject_area: string;
}

interface Submission {
  id: string;
  student_id: number;
  student_name: string;
  exercise_id: string;
  question_number: number;
  question_km: string;
  question_type: string;
  student_answer: string;
  is_correct: boolean | null;
  points_earned: number;
  max_points: number;
  time_spent: number;
  submitted_at: string;
  feedback_from_teacher?: string;
}

export default function SubmissionsPage() {
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSimulation, setSelectedSimulation] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [students, setStudents] = useState<{id: string, name: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [feedback, setFeedback] = useState('');
  const [manualScore, setManualScore] = useState('');
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);

  useEffect(() => {
    loadSimulations();
  }, []);

  useEffect(() => {
    if (selectedSimulation) {
      loadSubmissions();
    }
  }, [selectedSimulation, selectedStudent]);

  const loadSimulations = async () => {
    try {
      const res = await fetch('/api/simulations');
      const data = await res.json();
      if (data.success) {
        setSimulations(data.simulations);
        if (data.simulations.length > 0) {
          setSelectedSimulation(data.simulations[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading simulations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSubmissions = async () => {
    try {
      let url = `/api/exercises/submissions?simulation_id=${selectedSimulation}`;
      if (selectedStudent) {
        url += `&student_id=${selectedStudent}`;
      }
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.success) {
        setSubmissions(data.submissions);
        
        // Extract unique students
        const uniqueStudents = Array.from(new Set(data.submissions.map((s: Submission) => 
          JSON.stringify({id: s.student_id, name: s.student_name})
        ))).map(s => JSON.parse(s));
        setStudents(uniqueStudents);
      }
    } catch (error) {
      console.error('Error loading submissions:', error);
    }
  };

  const handleGradeSubmission = async () => {
    if (!selectedSubmission) return;
    
    try {
      const res = await fetch(`/api/exercises/submissions/${selectedSubmission.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback_from_teacher: feedback,
          points_earned: manualScore ? parseInt(manualScore) : selectedSubmission.points_earned,
          is_correct: manualScore ? (parseInt(manualScore) > 0) : selectedSubmission.is_correct
        })
      });
      
      const data = await res.json();
      if (data.success) {
        loadSubmissions();
        setShowFeedbackDialog(false);
        setFeedback('');
        setManualScore('');
        alert('បានរក្សាទុកមតិយោបល់!');
      }
    } catch (error) {
      console.error('Error saving feedback:', error);
      alert('មានបញ្ហាក្នុងការរក្សាទុក');
    }
  };

  const openFeedbackDialog = (submission: Submission) => {
    setSelectedSubmission(submission);
    setFeedback(submission.feedback_from_teacher || '');
    setManualScore(submission.points_earned.toString());
    setShowFeedbackDialog(true);
  };

  const getScoreColor = (earned: number, max: number) => {
    const percentage = (earned / max) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return minutes > 0 ? `${minutes}ន ${secs}វិ` : `${secs}វិ`;
  };

  const getQuestionTypeText = (type: string) => {
    const types: Record<string, string> = {
      multiple_choice: 'ពហុជម្រើស',
      true_false: 'ពិត/មិនពិត',
      calculation: 'គណនា',
      short_answer: 'ចម្លើយខ្លី',
      fill_blank: 'បំពេញចន្លោះ'
    };
    return types[type] || type;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 font-hanuman">កំពុងផ្ទុក...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-hanuman">ចម្លើយរបស់សិស្ស</h1>
        <p className="text-gray-600 mt-2 font-hanuman">មើល និងដាក់ពិន្ទុចម្លើយលំហាត់របស់សិស្ស</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="font-hanuman">តម្រង</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 font-hanuman">ការសាកល្បង</label>
            <Select value={selectedSimulation} onValueChange={setSelectedSimulation}>
              <SelectTrigger className="w-full font-hanuman">
                <SelectValue placeholder="ជ្រើសរើសការសាកល្បង" />
              </SelectTrigger>
              <SelectContent>
                {simulations.map(sim => (
                  <SelectItem key={sim.id} value={sim.id}>
                    <span className="font-hanuman">{sim.display_name_km}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 font-hanuman">សិស្ស</label>
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger className="w-full font-hanuman">
                <SelectValue placeholder="ទាំងអស់" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">ទាំងអស់</SelectItem>
                {students.map(student => (
                  <SelectItem key={student.id} value={student.id.toString()}>
                    <span className="font-hanuman">{student.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="font-hanuman">ចម្លើយដែលបានដាក់ស្នើ</CardTitle>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <p className="text-center text-gray-500 py-8 font-hanuman">
              មិនមានចម្លើយដែលបានដាក់ស្នើនៅឡើយទេ
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-hanuman">សិស្ស</TableHead>
                    <TableHead className="font-hanuman">សំណួរ</TableHead>
                    <TableHead className="font-hanuman">ប្រភេទ</TableHead>
                    <TableHead className="font-hanuman">ចម្លើយ</TableHead>
                    <TableHead className="font-hanuman">ពិន្ទុ</TableHead>
                    <TableHead className="font-hanuman">រយៈពេល</TableHead>
                    <TableHead className="font-hanuman">កាលបរិច្ឆេទ</TableHead>
                    <TableHead className="font-hanuman">សកម្មភាព</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-hanuman">{submission.student_name}</TableCell>
                      <TableCell>
                        <div>
                          <span className="font-hanuman">សំណួរទី {submission.question_number}</span>
                          <p className="text-sm text-gray-600 mt-1 font-hanuman">{submission.question_km}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getQuestionTypeText(submission.question_type)}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="truncate font-hanuman">{submission.student_answer}</p>
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${getScoreColor(submission.points_earned, submission.max_points)}`}>
                          {submission.points_earned}/{submission.max_points}
                        </span>
                      </TableCell>
                      <TableCell className="font-hanuman">{formatDuration(submission.time_spent)}</TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(submission.submitted_at), 'dd/MM/yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {submission.is_correct !== null && (
                            submission.is_correct ? 
                              <CheckCircle className="h-4 w-4 text-green-500" /> : 
                              <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openFeedbackDialog(submission)}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feedback Dialog */}
      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-hanuman">ដាក់ពិន្ទុ និងផ្តល់មតិយោបល់</DialogTitle>
          </DialogHeader>
          
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2 font-hanuman">សំណួរ:</h4>
                <p className="font-hanuman">{selectedSubmission.question_km}</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2 font-hanuman">ចម្លើយរបស់សិស្ស:</h4>
                <p className="font-hanuman">{selectedSubmission.student_answer}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 font-hanuman">
                  ពិន្ទុ (អតិបរមា: {selectedSubmission.max_points})
                </label>
                <Input
                  type="number"
                  value={manualScore}
                  onChange={(e) => setManualScore(e.target.value)}
                  min="0"
                  max={selectedSubmission.max_points.toString()}
                  className="w-32"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 font-hanuman">មតិយោបល់</label>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                  placeholder="សរសេរមតិយោបល់សម្រាប់សិស្ស..."
                  className="font-hanuman"
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowFeedbackDialog(false)} className="font-hanuman">
                  បោះបង់
                </Button>
                <Button onClick={handleGradeSubmission} className="font-hanuman">
                  <Save className="h-4 w-4 mr-2" />
                  រក្សាទុក
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}