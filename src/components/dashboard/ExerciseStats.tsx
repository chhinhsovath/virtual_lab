'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, Users, FileCheck, TrendingUp, 
  Clock, Award, AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

interface Statistics {
  simulation_id: string;
  display_name_km: string;
  display_name_en: string;
  total_exercises: number;
  total_students: number;
  total_submissions: number;
  avg_score: number;
  max_score: number;
  min_score: number;
  correct_answers: number;
  graded_count: number;
}

interface RecentSubmission {
  id: string;
  student_id: number;
  student_name: string;
  question_km: string;
  question_number: number;
  points_earned: number;
  max_points: number;
  submitted_at: string;
  simulation_name: string;
}

export default function ExerciseStats() {
  const router = useRouter();
  const [statistics, setStatistics] = useState<Statistics[]>([]);
  const [recentSubmissions, setRecentSubmissions] = useState<RecentSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const res = await fetch('/api/exercises/statistics');
      const data = await res.json();
      
      if (data.success) {
        setStatistics(data.statistics);
        setRecentSubmissions(data.recentSubmissions);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number, max: number) => {
    const percentage = (score / max) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalStudents = statistics.reduce((sum, stat) => sum + stat.total_students, 0);
  const totalSubmissions = statistics.reduce((sum, stat) => sum + stat.total_submissions, 0);
  const totalGraded = statistics.reduce((sum, stat) => sum + stat.graded_count, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-hanuman">សិស្សសរុប</p>
                <p className="text-2xl font-bold">{totalStudents}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-hanuman">ចម្លើយសរុប</p>
                <p className="text-2xl font-bold">{totalSubmissions}</p>
              </div>
              <FileCheck className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-hanuman">បានដាក់ពិន្ទុ</p>
                <p className="text-2xl font-bold">{totalGraded}</p>
              </div>
              <Award className="h-8 w-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-hanuman">រង់ចាំពិនិត្យ</p>
                <p className="text-2xl font-bold">{totalSubmissions - totalGraded}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics by Simulation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-hanuman">
            <BarChart3 className="h-5 w-5" />
            ស្ថិតិតាមការសាកល្បង
          </CardTitle>
        </CardHeader>
        <CardContent>
          {statistics.length === 0 ? (
            <p className="text-center text-gray-500 py-8 font-hanuman">
              មិនមានទិន្នន័យនៅឡើយទេ
            </p>
          ) : (
            <div className="space-y-4">
              {statistics.map((stat) => (
                <div key={stat.simulation_id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium font-hanuman">{stat.display_name_km}</h4>
                      <p className="text-sm text-gray-600">{stat.display_name_en}</p>
                    </div>
                    <Badge variant="outline">
                      {stat.total_exercises} លំហាត់
                    </Badge>
                  </div>
                  
                  {stat.total_submissions > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 font-hanuman">សិស្ស:</span>
                        <span className="ml-2 font-medium">{stat.total_students}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 font-hanuman">ចម្លើយ:</span>
                        <span className="ml-2 font-medium">{stat.total_submissions}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 font-hanuman">ពិន្ទុមធ្យម:</span>
                        <span className="ml-2 font-medium">
                          {stat.avg_score ? Math.round(stat.avg_score) : 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 font-hanuman">ត្រឹមត្រូវ:</span>
                        <span className="ml-2 font-medium">{stat.correct_answers}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Submissions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 font-hanuman">
            <Clock className="h-5 w-5" />
            ចម្លើយថ្មីៗ
          </CardTitle>
          <button
            onClick={() => router.push('/dashboard/exercises/submissions')}
            className="text-sm text-blue-600 hover:text-blue-700 font-hanuman"
          >
            មើលទាំងអស់ →
          </button>
        </CardHeader>
        <CardContent>
          {recentSubmissions.length === 0 ? (
            <p className="text-center text-gray-500 py-8 font-hanuman">
              មិនមានចម្លើយថ្មីនៅឡើយទេ
            </p>
          ) : (
            <div className="space-y-3">
              {recentSubmissions.map((submission) => (
                <div key={submission.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex-1">
                    <p className="font-medium font-hanuman">{submission.student_name}</p>
                    <p className="text-sm text-gray-600 font-hanuman">
                      {submission.simulation_name} - សំណួរទី {submission.question_number}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${getScoreColor(submission.points_earned, submission.max_points)}`}>
                      {submission.points_earned}/{submission.max_points} ពិន្ទុ
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(submission.submitted_at), 'dd/MM HH:mm')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}