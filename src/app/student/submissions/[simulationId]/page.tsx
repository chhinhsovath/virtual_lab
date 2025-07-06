'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { User } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Clock, 
  MessageSquare,
  Award,
  Calendar,
  Target,
  RotateCcw
} from 'lucide-react';

interface ExerciseSubmission {
  id: string;
  exercise_id: string;
  question_number: number;
  question_km: string;
  question_type: string;
  student_answer: string;
  is_correct: boolean;
  points_earned: number;
  max_points: number;
  time_spent: number;
  submitted_at: string;
  attempt_number: number;
  feedback_from_teacher?: string;
  graded_by?: string;
  graded_at?: string;
}

interface SimulationDetails {
  id: string;
  simulation_name: string;
  display_name_en: string;
  display_name_km: string;
  subject_area: string;
  difficulty_level: string;
  description?: string;
}

export default function StudentSubmissionDetailPage() {
  const [user, setUser] = useState<User | null>(null);
  const [submissions, setSubmissions] = useState<ExerciseSubmission[]>([]);
  const [simulationDetails, setSimulationDetails] = useState<SimulationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const simulationId = params.simulationId as string;

  useEffect(() => {
    const fetchSubmissionDetails = async () => {
      try {
        // Fetch user session
        const sessionRes = await fetch('/api/auth/session', { credentials: 'include' });
        if (!sessionRes.ok) {
          router.push('/auth/login');
          return;
        }

        const sessionData = await sessionRes.json();
        setUser(sessionData.user);

        // Fetch simulation details
        const simRes = await fetch(`/api/simulations/${simulationId}`, { credentials: 'include' });
        if (simRes.ok) {
          const simData = await simRes.json();
          setSimulationDetails(simData.simulation);
        }

        // Fetch submissions for this simulation
        const submissionsRes = await fetch(
          `/api/exercises/submit?simulation_id=${simulationId}`,
          { credentials: 'include' }
        );
        
        if (submissionsRes.ok) {
          const submissionsData = await submissionsRes.json();
          setSubmissions(submissionsData.submissions || []);
        }
      } catch (error) {
        console.error('Error fetching submission details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (simulationId) {
      fetchSubmissionDetails();
    }
  }, [simulationId, router]);

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'multiple_choice':
        return '🔘';
      case 'true_false':
        return '✓/✗';
      case 'calculation':
        return '🔢';
      case 'short_answer':
        return '📝';
      default:
        return '❓';
    }
  };

  const getQuestionTypeName = (type: string) => {
    switch (type) {
      case 'multiple_choice':
        return 'Multiple Choice';
      case 'true_false':
        return 'True/False';
      case 'calculation':
        return 'Calculation';
      case 'short_answer':
        return 'Short Answer';
      default:
        return 'Unknown';
    }
  };

  const calculateStats = () => {
    if (submissions.length === 0) return { totalScore: 0, maxScore: 0, percentage: 0, averageTime: 0 };
    
    const totalScore = submissions.reduce((sum, sub) => sum + sub.points_earned, 0);
    const maxScore = submissions.reduce((sum, sub) => sum + sub.max_points, 0);
    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    const averageTime = Math.round(submissions.reduce((sum, sub) => sum + sub.time_spent, 0) / submissions.length);
    
    return { totalScore, maxScore, percentage, averageTime };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-blue-700 font-medium">Loading submission details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/student/history')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to History
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {simulationDetails?.display_name_en || 'Simulation Details'}
                </h1>
                <p className="text-gray-600 mt-1">
                  Review your answers and feedback
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline">{simulationDetails?.subject_area}</Badge>
              <Badge variant="secondary">{simulationDetails?.difficulty_level}</Badge>
            </div>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Score</CardTitle>
              <Award className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalScore}/{stats.maxScore}</div>
              <p className="text-xs text-blue-100">
                {stats.percentage}% accuracy
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Correct Answers</CardTitle>
              <CheckCircle className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {submissions.filter(s => s.is_correct).length}
              </div>
              <p className="text-xs text-green-100">
                of {submissions.length} questions
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Time</CardTitle>
              <Clock className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageTime}s</div>
              <p className="text-xs text-orange-100">
                per question
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attempts</CardTitle>
              <RotateCcw className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {submissions.length > 0 ? submissions[0].attempt_number : 0}
              </div>
              <p className="text-xs text-purple-100">
                total attempts
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Submissions List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Question Responses</h2>
            <Button 
              variant="outline"
              onClick={() => router.push(`/simulation/${simulationId}`)}
            >
              <Target className="h-4 w-4 mr-2" />
              Retry Simulation
            </Button>
          </div>

          {submissions.length > 0 ? (
            submissions
              .sort((a, b) => a.question_number - b.question_number)
              .map((submission, index) => (
                <Card key={submission.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{getQuestionTypeIcon(submission.question_type)}</div>
                        <div>
                          <CardTitle className="text-lg">
                            Question {submission.question_number}
                          </CardTitle>
                          <CardDescription>
                            {getQuestionTypeName(submission.question_type)} • {submission.max_points} points
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {submission.is_correct ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Correct
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">
                            <XCircle className="h-3 w-3 mr-1" />
                            Incorrect
                          </Badge>
                        )}
                        <Badge variant="outline">
                          {submission.points_earned}/{submission.max_points} pts
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Question Text */}
                    {submission.question_km && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Question:</h4>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-gray-700">{submission.question_km}</p>
                        </div>
                      </div>
                    )}

                    {/* Student Answer */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Your Answer:</h4>
                      <div className={`p-3 rounded-lg border-l-4 ${
                        submission.is_correct 
                          ? 'bg-green-50 border-green-400' 
                          : 'bg-red-50 border-red-400'
                      }`}>
                        <p className="text-gray-700">{submission.student_answer}</p>
                      </div>
                    </div>

                    {/* Teacher Feedback */}
                    {submission.feedback_from_teacher && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Teacher Feedback:
                        </h4>
                        <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                          <p className="text-gray-700">{submission.feedback_from_teacher}</p>
                          {submission.graded_by && submission.graded_at && (
                            <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                              <Calendar className="h-3 w-3" />
                              <span>
                                Graded by {submission.graded_by} on{' '}
                                {new Date(submission.graded_at).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Submission Details */}
                    <Separator />
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>Time: {submission.time_spent}s</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Submitted: {new Date(submission.submitted_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline">
                        Attempt #{submission.attempt_number}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions found</h3>
                <p className="text-gray-500 mb-4">
                  You haven't submitted any exercises for this simulation yet.
                </p>
                <Button onClick={() => router.push(`/simulation/${simulationId}`)}>
                  Start Simulation
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Action Buttons */}
        {submissions.length > 0 && (
          <div className="flex justify-center space-x-4">
            <Button 
              variant="outline"
              onClick={() => router.push('/student/history')}
            >
              Back to History
            </Button>
            <Button onClick={() => router.push(`/simulation/${simulationId}`)}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Retry Simulation
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}