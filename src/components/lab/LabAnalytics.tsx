'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  BarChart3,
  Users,
  Clock,
  TrendingUp,
  Download,
  RefreshCw,
  GraduationCap,
  Target,
  Award,
  FileText,
  Calendar,
  PieChart,
  Activity,
  CheckCircle,
  AlertCircle,
  UserCheck,
  Timer,
  BookOpen
} from 'lucide-react';

interface LabAnalytics {
  lab_id: string;
  total_students_attempted: number;
  total_submissions: number;
  completed_submissions: number;
  submission_rate_percentage: number;
  avg_time_minutes: number;
  avg_score: number;
  min_score: number;
  max_score: number;
  grade_a_count: number;
  grade_b_count: number;
  grade_c_count: number;
  grade_d_count: number;
  grade_f_count: number;
  latest_submission: string;
}

interface Student {
  student_id: string;
  student_name: string;
  student_email: string;
  final_score: number;
  percentage_score: number;
  letter_grade: string;
  duration_minutes: number;
  submitted_at: string;
  graded_at: string;
  session_status: string;
}

interface Lab {
  id: string;
  title: string;
  subject: string;
  grade: string;
  course_name: string;
}

interface SubmissionTimeline {
  submission_date: string;
  submissions_count: number;
  avg_score_for_day: number;
}

interface LabAnalyticsProps {
  labId: string;
  userRole: string;
  userId: string;
  onExport?: (format: string) => void;
}

export function LabAnalytics({
  labId,
  userRole,
  userId,
  onExport
}: LabAnalyticsProps) {
  const [analytics, setAnalytics] = useState<LabAnalytics | null>(null);
  const [lab, setLab] = useState<Lab | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [submissionTimeline, setSubmissionTimeline] = useState<SubmissionTimeline[]>([]);
  const [maxPossibleScore, setMaxPossibleScore] = useState<number>(0);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState('overview');
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
  const [exportOptions, setExportOptions] = useState({
    includeResponses: false,
    includeComments: true
  });

  const isTeacher = ['teacher', 'admin', 'super_admin'].includes(userRole);

  useEffect(() => {
    loadAnalytics();
  }, [labId]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`/api/labs/${labId}/analytics`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to load analytics');
      }

      const data = await response.json();
      setAnalytics(data.analytics);
      setLab(data.lab);
      setStudents(data.students || []);
      setSubmissionTimeline(data.submissionTimeline || []);
      setMaxPossibleScore(data.maxPossibleScore || 0);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const refreshAnalytics = async () => {
    try {
      setRefreshing(true);
      
      // Refresh cache first
      await fetch(`/api/labs/${labId}/analytics`, {
        method: 'POST'
      });
      
      // Then reload data
      await loadAnalytics();
      
    } catch (err) {
      console.error('Error refreshing analytics:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        format: exportFormat,
        include_responses: exportOptions.includeResponses.toString(),
        include_comments: exportOptions.includeComments.toString()
      });

      const response = await fetch(`/api/labs/${labId}/export?${params}`);
      
      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lab_${lab?.title.replace(/[^a-zA-Z0-9]/g, '_')}_export.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      if (onExport) {
        onExport(exportFormat);
      }

    } catch (err) {
      setError('Export failed. Please try again.');
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

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Students Attempted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.total_students_attempted || 0}</div>
            <div className="text-xs text-gray-500">
              {analytics?.completed_submissions || 0} completed
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Submission Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.submission_rate_percentage || 0}%
            </div>
            <Progress value={analytics?.submission_rate_percentage || 0} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.avg_score ? Math.round(analytics.avg_score * 10) / 10 : 'N/A'}
            </div>
            <div className="text-xs text-gray-500">
              Max possible: {maxPossibleScore}
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
              {analytics?.avg_time_minutes ? Math.round(analytics.avg_time_minutes) + 'm' : 'N/A'}
            </div>
            <div className="text-xs text-gray-500">
              Per submission
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grade Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Grade Distribution
          </CardTitle>
          <CardDescription>
            Performance breakdown by letter grade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            {[
              { grade: 'A', count: analytics?.grade_a_count || 0, color: 'bg-green-500' },
              { grade: 'B', count: analytics?.grade_b_count || 0, color: 'bg-blue-500' },
              { grade: 'C', count: analytics?.grade_c_count || 0, color: 'bg-yellow-500' },
              { grade: 'D', count: analytics?.grade_d_count || 0, color: 'bg-orange-500' },
              { grade: 'F', count: analytics?.grade_f_count || 0, color: 'bg-red-500' }
            ].map(({ grade, count, color }) => {
              const total = (analytics?.grade_a_count || 0) + (analytics?.grade_b_count || 0) + 
                           (analytics?.grade_c_count || 0) + (analytics?.grade_d_count || 0) + 
                           (analytics?.grade_f_count || 0);
              const percentage = total > 0 ? (count / total) * 100 : 0;
              
              return (
                <div key={grade} className="text-center">
                  <div className={`${color} h-8 rounded-md mb-2`} 
                       style={{ opacity: percentage / 100 + 0.3 }}></div>
                  <div className="font-semibold">{grade}</div>
                  <div className="text-sm text-gray-500">{count} ({Math.round(percentage)}%)</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Score Range */}
      {analytics && analytics.avg_score && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Score Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-gray-500">Minimum</div>
                <div className="text-xl font-bold text-red-600">
                  {analytics.min_score ? Math.round(analytics.min_score * 10) / 10 : 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Average</div>
                <div className="text-xl font-bold text-blue-600">
                  {Math.round(analytics.avg_score * 10) / 10}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Maximum</div>
                <div className="text-xl font-bold text-green-600">
                  {analytics.max_score ? Math.round(analytics.max_score * 10) / 10 : 'N/A'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderStudents = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Student Performance Details</CardTitle>
          <CardDescription>
            Individual student results and progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {students.map((student) => (
              <div 
                key={student.student_id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium">{student.student_name}</p>
                    <p className="text-sm text-gray-500">{student.student_email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {student.submitted_at && (
                        <Badge variant="secondary" className="text-xs">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(student.submitted_at).toLocaleDateString()}
                        </Badge>
                      )}
                      {student.duration_minutes && (
                        <Badge variant="outline" className="text-xs">
                          <Timer className="h-3 w-3 mr-1" />
                          {student.duration_minutes}m
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Score</div>
                    <div className={`font-bold text-lg ${getScoreColor(student.percentage_score || 0)}`}>
                      {student.final_score ? Math.round(student.final_score * 10) / 10 : 'N/A'}
                    </div>
                  </div>
                  
                  {student.letter_grade && (
                    <Badge variant={getLetterGradeBadge(student.letter_grade)}>
                      {student.letter_grade}
                    </Badge>
                  )}
                  
                  {student.percentage_score !== null && (
                    <div className="w-24">
                      <Progress value={student.percentage_score} className="h-2" />
                      <div className="text-xs text-center mt-1">
                        {Math.round(student.percentage_score)}%
                      </div>
                    </div>
                  )}

                  <div className="text-center min-w-[80px]">
                    <div className="text-xs text-gray-500">Status</div>
                    <Badge variant={student.session_status === 'completed' ? 'default' : 'outline'}>
                      {student.session_status || 'Unknown'}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderExport = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Lab Data
          </CardTitle>
          <CardDescription>
            Download lab performance data in various formats
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Export Format */}
          <div>
            <Label htmlFor="export_format">Export Format</Label>
            <div className="flex gap-2 mt-2">
              <Button
                variant={exportFormat === 'csv' ? 'default' : 'outline'}
                onClick={() => setExportFormat('csv')}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                CSV Spreadsheet
              </Button>
              <Button
                variant={exportFormat === 'pdf' ? 'default' : 'outline'}
                onClick={() => setExportFormat('pdf')}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                PDF Report
              </Button>
            </div>
          </div>

          <Separator />

          {/* Export Options */}
          <div className="space-y-4">
            <h3 className="font-semibold">Export Options</h3>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="include_responses"
                checked={exportOptions.includeResponses}
                onChange={(e) => setExportOptions(prev => ({
                  ...prev,
                  includeResponses: e.target.checked
                }))}
                className="rounded"
              />
              <Label htmlFor="include_responses">Include student responses</Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="include_comments"
                checked={exportOptions.includeComments}
                onChange={(e) => setExportOptions(prev => ({
                  ...prev,
                  includeComments: e.target.checked
                }))}
                className="rounded"
              />
              <Label htmlFor="include_comments">Include teacher comments</Label>
            </div>
          </div>

          <Separator />

          {/* Export Actions */}
          <div className="flex gap-2">
            <Button onClick={handleExport} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export {exportFormat.toUpperCase()}
            </Button>
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
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={loadAnalytics} variant="outline">
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
                <BarChart3 className="h-5 w-5" />
                Lab Analytics
              </CardTitle>
              <CardDescription>
                {lab?.title} - {lab?.subject} ({lab?.grade})
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={refreshAnalytics}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          {isTeacher && <TabsTrigger value="export">Export</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          {renderStudents()}
        </TabsContent>

        {isTeacher && (
          <TabsContent value="export" className="space-y-6">
            {renderExport()}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}