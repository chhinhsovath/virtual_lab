'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  MessageSquare,
  Save,
  Send,
  Clock,
  Award,
  FileText,
  AlertCircle,
  Calculator,
  Hash,
  Type,
  CheckSquare
} from 'lucide-react';
import { toast } from 'sonner';

interface ExerciseSubmission {
  id: string;
  exercise_id: string;
  question_number: number;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'calculation' | 'short_answer';
  student_answer: string;
  correct_answer: string;
  is_correct: boolean;
  points_earned: number;
  max_points: number;
  time_spent: number;
  feedback?: string;
}

interface SubmissionDetails {
  id: string;
  student_id: string;
  student_name: string;
  simulation_name: string;
  submitted_at: string;
  total_score: number;
  max_score: number;
  exercises: ExerciseSubmission[];
  overall_feedback?: string;
  graded_at?: string;
}

export default function TeacherGradingPage() {
  const [submission, setSubmission] = useState<SubmissionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});
  const [scores, setScores] = useState<Record<string, number>>({});
  const [overallFeedback, setOverallFeedback] = useState('');
  const router = useRouter();
  const params = useParams();
  const submissionId = params.submissionId as string;

  useEffect(() => {
    const fetchSubmissionDetails = async () => {
      try {
        const response = await fetch(`/api/exercises/submissions/${submissionId}`);
        if (!response.ok) throw new Error('Failed to fetch submission');
        
        const data = await response.json();
        if (data.success && data.submission) {
          const submission = data.submission;
          
          // Transform the data to match our interface
          const transformedSubmission: SubmissionDetails = {
            id: submission.id,
            student_id: submission.student_id,
            student_name: submission.student_name || submission.student_name_km || 'Unknown Student',
            simulation_name: submission.simulation_name || 'Unknown Simulation',
            submitted_at: submission.submitted_at,
            total_score: submission.total_score || 0,
            max_score: submission.max_score || 0,
            exercises: submission.exercises || [],
            overall_feedback: submission.teacher_feedback,
            graded_at: submission.graded_at
          };

          setSubmission(transformedSubmission);
        
          // Initialize scores with current values
          const initialScores: Record<string, number> = {};
          transformedSubmission.exercises.forEach(ex => {
            initialScores[ex.id] = ex.points_earned;
          });
          setScores(initialScores);
        }

      } catch (error) {
        console.error('Error fetching submission:', error);
      } finally {
        setLoading(false);
      }
    };

    if (submissionId) {
      fetchSubmissionDetails();
    }
  }, [submissionId]);

  const getQuestionIcon = (type: string) => {
    switch (type) {
      case 'multiple_choice':
        return <CheckSquare className="h-5 w-5" />;
      case 'true_false':
        return <CheckCircle className="h-5 w-5" />;
      case 'calculation':
        return <Calculator className="h-5 w-5" />;
      case 'short_answer':
        return <Type className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const handleScoreChange = (exerciseId: string, score: number) => {
    setScores(prev => ({ ...prev, [exerciseId]: score }));
  };

  const handleFeedbackChange = (exerciseId: string, feedback: string) => {
    setFeedbacks(prev => ({ ...prev, [exerciseId]: feedback }));
  };

  const calculateTotalScore = () => {
    return Object.values(scores).reduce((sum, score) => sum + score, 0);
  };

  const handleSaveGrading = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/exercises/submissions/${submissionId}/grade`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scores,
          feedbacks,
          overall_feedback: overallFeedback,
          is_draft: true
        })
      });
      
      if (!response.ok) throw new Error('Failed to save grading');
      
      toast.success('Grading saved successfully!');
    } catch (error) {
      toast.error('Failed to save grading');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitGrading = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/exercises/submissions/${submissionId}/grade`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scores,
          feedbacks,
          overall_feedback: overallFeedback,
          is_draft: false
        })
      });
      
      if (!response.ok) throw new Error('Failed to submit grading');
      
      toast.success('Grading submitted successfully!');
      router.push('/dashboard/exercises/submissions');
    } catch (error) {
      toast.error('Failed to submit grading');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-blue-700 font-medium">Loading submission...</p>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Submission not found</h3>
          <Button onClick={() => router.push('/dashboard/exercises/submissions')}>
            Back to Submissions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/dashboard/exercises/submissions')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Submissions
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Grade Submission</h1>
                <p className="text-gray-600 mt-1">
                  Review and provide feedback on student answers
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Score</p>
              <p className="text-2xl font-bold">
                {calculateTotalScore()} / {submission.max_score}
              </p>
            </div>
          </div>
        </div>

        {/* Student Info */}
        <Card>
          <CardHeader>
            <CardTitle>Submission Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Student</p>
                <p className="font-medium">{submission.student_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Simulation</p>
                <p className="font-medium">{submission.simulation_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Submitted</p>
                <p className="font-medium">{new Date(submission.submitted_at).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Questions</p>
                <p className="font-medium">{submission.exercises.length} exercises</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exercise Grading */}
        <div className="space-y-6">
          {submission.exercises.map((exercise, index) => (
            <Card key={exercise.id} className="border-l-4 border-l-blue-500">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      {getQuestionIcon(exercise.question_type)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        Question {exercise.question_number}
                      </CardTitle>
                      <CardDescription className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline">{exercise.question_type.replace('_', ' ')}</Badge>
                        <span>•</span>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {exercise.time_spent}s
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <Label htmlFor={`score-${exercise.id}`} className="text-sm text-gray-600">
                      Score
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id={`score-${exercise.id}`}
                        type="number"
                        min="0"
                        max={exercise.max_points}
                        value={scores[exercise.id] || 0}
                        onChange={(e) => handleScoreChange(exercise.id, parseInt(e.target.value) || 0)}
                        className="w-20"
                      />
                      <span className="text-sm text-gray-500">/ {exercise.max_points}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Question */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Question:</h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p>{exercise.question_text}</p>
                  </div>
                </div>

                {/* Student Answer */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Student Answer:</h4>
                  <div className={`p-3 rounded-lg border-l-4 ${
                    exercise.is_correct 
                      ? 'bg-green-50 border-green-400' 
                      : 'bg-red-50 border-red-400'
                  }`}>
                    <p>{exercise.student_answer}</p>
                  </div>
                </div>

                {/* Correct Answer (if applicable) */}
                {exercise.question_type !== 'short_answer' && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Correct Answer:</h4>
                    <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                      <p>{exercise.correct_answer}</p>
                    </div>
                  </div>
                )}

                {/* Teacher Feedback */}
                <div>
                  <Label htmlFor={`feedback-${exercise.id}`} className="flex items-center space-x-2 mb-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>Feedback (Optional)</span>
                  </Label>
                  <Textarea
                    id={`feedback-${exercise.id}`}
                    placeholder="Provide constructive feedback to help the student improve..."
                    value={feedbacks[exercise.id] || exercise.feedback || ''}
                    onChange={(e) => handleFeedbackChange(exercise.id, e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Overall Feedback */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5" />
              <span>Overall Feedback</span>
            </CardTitle>
            <CardDescription>
              Provide general comments about the student's performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Great work overall! Your understanding of pendulum physics is developing well. Remember to review the relationship between pendulum length and period..."
              value={overallFeedback}
              onChange={(e) => setOverallFeedback(e.target.value)}
              rows={5}
            />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between items-center bg-white rounded-lg shadow-md p-6">
          <div>
            <p className="text-sm text-gray-600">Final Score</p>
            <p className="text-3xl font-bold">
              {calculateTotalScore()} / {submission.max_score}
              <span className="text-lg text-gray-500 ml-2">
                ({Math.round((calculateTotalScore() / submission.max_score) * 100)}%)
              </span>
            </p>
          </div>
          <div className="flex space-x-4">
            <Button
              variant="outline"
              onClick={handleSaveGrading}
              disabled={saving}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button
              onClick={handleSubmitGrading}
              disabled={saving}
            >
              <Send className="h-4 w-4 mr-2" />
              Submit Grading
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}