'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp,
  TrendingDown,
  Minus,
  BookOpen,
  Clock,
  Award,
  Target,
  Calendar,
  GraduationCap,
  BarChart3,
  Activity,
  User,
  Users,
  Star,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface StudentPerformance {
  lab_id: string;
  lab_title: string;
  subject: string;
  final_score: number;
  percentage_score: number;
  letter_grade: string;
  duration_minutes: number;
  submitted_at: string;
  graded_at: string;
  teacher_comments: string;
  class_average_score: number;
}

interface StudentSummary {
  student_id: string;
  student_name: string;
  course_id: string;
  course_name: string;
  total_labs_taken: number;
  avg_percentage: number;
  avg_time_minutes: number;
  grade_a_count: number;
  grade_b_count: number;
  grade_c_count: number;
  grade_d_count: number;
  grade_f_count: number;
  first_score: number;
  latest_score: number;
}

interface RecentActivity {
  lab_title: string;
  subject: string;
  submitted_at: string;
  final_score: number;
  percentage_score: number;
  letter_grade: string;
}

interface Course {
  id: string;
  name: string;
  subject: string;
  grade: string;
}

interface Ranking {
  rank: number;
  total_students: number;
  avg_score: number;
  labs_completed: number;
}

interface Improvement {
  recent_avg: number;
  previous_avg: number;
  recent_count: number;
  previous_count: number;
}

interface StudentAnalyticsProps {
  studentId: string;
  userRole: string;
  userId: string;
  isParentView?: boolean;
}

export function StudentAnalytics({
  studentId,
  userRole,
  userId,
  isParentView = false
}: StudentAnalyticsProps) {
  const [student, setStudent] = useState<any>(null);
  const [labPerformance, setLabPerformance] = useState<StudentPerformance[]>([]);
  const [summary, setSummary] = useState<StudentSummary | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [ranking, setRanking] = useState<Ranking | null>(null);
  const [improvement, setImprovement] = useState<Improvement | null>(null);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadStudentData();
  }, [studentId, selectedCourse]);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      if (selectedCourse !== 'all') {
        params.append('course_id', selectedCourse);
      }

      const response = await fetch(`/api/labs/student/${studentId}?${params}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to load student data');
      }

      const data = await response.json();
      setStudent(data.student);
      setLabPerformance(data.labPerformance || []);
      setSummary(data.summary);
      setRecentActivity(data.recentActivity || []);
      setCourses(data.courses || []);
      setRanking(data.ranking);
      setImprovement(data.improvement);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load student data');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getLetterGradeBadge = (grade: string): "default" | "secondary" | "destructive" | "outline" => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'A': 'default',
      'B': 'secondary',
      'C': 'outline',
      'D': 'destructive',
      'F': 'destructive'
    };
    return variants[grade] || 'outline';
  };

  const getTrendIcon = () => {
    if (!improvement || improvement.recent_count < 2 || improvement.previous_count < 2) {
      return <Minus className="h-4 w-4 text-gray-500" />;
    }

    const trend = improvement.recent_avg - improvement.previous_avg;
    if (trend > 2) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend < -2) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Labs Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.total_labs_taken || 0}</div>
            <div className="text-xs text-gray-500">
              Across {courses.length} course{courses.length !== 1 ? 's' : ''}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(summary?.avg_percentage || 0)}`}>
              {summary?.avg_percentage ? Math.round(summary.avg_percentage) + '%' : 'N/A'}
            </div>
            <div className="text-xs text-gray-500">
              Overall performance
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Average Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.avg_time_minutes ? Math.round(summary.avg_time_minutes) + 'm' : 'N/A'}
            </div>
            <div className="text-xs text-gray-500">
              Per lab session
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Class Ranking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ranking ? `#${ranking.rank}` : 'N/A'}
            </div>
            <div className="text-xs text-gray-500">
              {ranking ? `of ${ranking.total_students} students` : 'No ranking data'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Trend */}
      {improvement && improvement.recent_count > 0 && improvement.previous_count > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Performance Trend
            </CardTitle>
            <CardDescription>
              Comparing recent performance to earlier work
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className="text-sm text-gray-500">Earlier Average</div>
                <div className="text-xl font-bold">
                  {Math.round(improvement.previous_avg)}%
                </div>
                <div className="text-xs text-gray-500">
                  ({improvement.previous_count} labs)
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {getTrendIcon()}
                <span className="text-sm font-medium">
                  {Math.abs(improvement.recent_avg - improvement.previous_avg).toFixed(1)}% 
                  {improvement.recent_avg > improvement.previous_avg ? ' improvement' : ' change'}
                </span>
              </div>
              
              <div className="text-center">
                <div className="text-sm text-gray-500">Recent Average</div>
                <div className={`text-xl font-bold ${getScoreColor(improvement.recent_avg)}`}>
                  {Math.round(improvement.recent_avg)}%
                </div>
                <div className="text-xs text-gray-500">
                  ({improvement.recent_count} labs)
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grade Distribution */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Grade Distribution
            </CardTitle>
            <CardDescription>
              Breakdown of performance by letter grade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4">
              {[
                { grade: 'A', count: summary.grade_a_count, color: 'bg-green-500' },
                { grade: 'B', count: summary.grade_b_count, color: 'bg-blue-500' },
                { grade: 'C', count: summary.grade_c_count, color: 'bg-yellow-500' },
                { grade: 'D', count: summary.grade_d_count, color: 'bg-orange-500' },
                { grade: 'F', count: summary.grade_f_count, color: 'bg-red-500' }
              ].map(({ grade, count, color }) => {
                const total = summary.total_labs_taken;
                const percentage = total > 0 ? (count / total) * 100 : 0;
                
                return (
                  <div key={grade} className="text-center">
                    <div className={`${color} h-8 rounded-md mb-2`} 
                         style={{ opacity: Math.max(percentage / 100, 0.2) }}></div>
                    <div className="font-semibold">{grade}</div>
                    <div className="text-sm text-gray-500">
                      {count} ({Math.round(percentage)}%)
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Lab Activity
          </CardTitle>
          <CardDescription>
            Latest lab submissions and results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.slice(0, 5).map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{activity.lab_title}</p>
                  <p className="text-sm text-gray-500">{activity.subject}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(activity.submitted_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-center">
                    <div className={`font-bold ${getScoreColor(activity.percentage_score || 0)}`}>
                      {activity.percentage_score ? Math.round(activity.percentage_score) + '%' : 'N/A'}
                    </div>
                  </div>
                  {activity.letter_grade && (
                    <Badge variant={getLetterGradeBadge(activity.letter_grade)}>
                      {activity.letter_grade}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No recent lab activity
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDetailedResults = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>All Lab Results</CardTitle>
          <CardDescription>
            Complete history of lab performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {labPerformance.map((lab, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{lab.lab_title}</h3>
                    <p className="text-sm text-gray-500">{lab.subject}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getLetterGradeBadge(lab.letter_grade || 'F')}>
                      {lab.letter_grade || 'Not Graded'}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div>
                    <div className="text-xs text-gray-500">Your Score</div>
                    <div className={`font-bold ${getScoreColor(lab.percentage_score || 0)}`}>
                      {lab.final_score ? Math.round(lab.final_score * 10) / 10 : 'N/A'}
                      {lab.percentage_score && ` (${Math.round(lab.percentage_score)}%)`}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Class Average</div>
                    <div className="font-medium">
                      {lab.class_average_score ? Math.round(lab.class_average_score * 10) / 10 : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Time Spent</div>
                    <div className="font-medium">
                      {lab.duration_minutes ? lab.duration_minutes + ' min' : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Submitted</div>
                    <div className="font-medium">
                      {new Date(lab.submitted_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {lab.teacher_comments && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Teacher Comments:</div>
                    <div className="text-sm">{lab.teacher_comments}</div>
                  </div>
                )}

                {lab.class_average_score && lab.final_score && (
                  <div className="mt-3">
                    <div className="text-xs text-gray-500 mb-1">
                      Performance vs Class Average
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={Math.min((lab.final_score / lab.class_average_score) * 50, 100)} 
                        className="h-2 flex-1" 
                      />
                      <span className="text-xs">
                        {lab.final_score > lab.class_average_score ? 'Above' : 'Below'} average
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {labPerformance.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No lab results available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading student data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={loadStudentData} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {isParentView ? <User className="h-5 w-5" /> : <GraduationCap className="h-5 w-5" />}
                {isParentView ? 'My Child\'s Progress' : 'My Lab Performance'}
              </CardTitle>
              <CardDescription>
                {student?.name} - Performance Analytics
              </CardDescription>
            </div>
            {courses.length > 1 && (
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Detailed Results</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          {renderDetailedResults()}
        </TabsContent>
      </Tabs>
    </div>
  );
}