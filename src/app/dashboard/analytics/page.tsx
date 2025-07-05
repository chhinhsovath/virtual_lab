'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft,
  Download,
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  Clock,
  Award,
  Target,
  AlertCircle,
  BarChart3,
  PieChart,
  Calendar,
  FileText,
  Filter
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

interface ClassAnalytics {
  overview: {
    total_students: number;
    active_students: number;
    average_score: number;
    completion_rate: number;
    total_simulations: number;
    total_submissions: number;
  };
  performance_trends: Array<{
    date: string;
    average_score: number;
    submissions: number;
    active_students: number;
  }>;
  subject_performance: Array<{
    subject: string;
    average_score: number;
    completion_rate: number;
    total_students: number;
  }>;
  student_distribution: Array<{
    level: string;
    count: number;
    percentage: number;
  }>;
  simulation_analytics: Array<{
    simulation_name: string;
    attempts: number;
    average_score: number;
    completion_rate: number;
    average_time: number;
  }>;
  struggling_students: Array<{
    student_id: string;
    student_name: string;
    average_score: number;
    completion_rate: number;
    last_active: string;
  }>;
  top_performers: Array<{
    student_id: string;
    student_name: string;
    average_score: number;
    simulations_completed: number;
    badges_earned: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function TeacherAnalyticsPage() {
  const [analytics, setAnalytics] = useState<ClassAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30');
  const [classFilter, setClassFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const router = useRouter();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Mock data - replace with actual API call
        const mockAnalytics: ClassAnalytics = {
          overview: {
            total_students: 32,
            active_students: 28,
            average_score: 78.5,
            completion_rate: 72,
            total_simulations: 15,
            total_submissions: 420
          },
          performance_trends: [
            { date: '2024-01-01', average_score: 72, submissions: 45, active_students: 25 },
            { date: '2024-01-08', average_score: 74, submissions: 52, active_students: 26 },
            { date: '2024-01-15', average_score: 76, submissions: 58, active_students: 27 },
            { date: '2024-01-22', average_score: 78, submissions: 63, active_students: 28 },
            { date: '2024-01-29', average_score: 78.5, submissions: 68, active_students: 28 }
          ],
          subject_performance: [
            { subject: 'Physics', average_score: 82, completion_rate: 78, total_students: 32 },
            { subject: 'Chemistry', average_score: 76, completion_rate: 70, total_students: 30 },
            { subject: 'Biology', average_score: 79, completion_rate: 75, total_students: 31 },
            { subject: 'Mathematics', average_score: 74, completion_rate: 68, total_students: 32 }
          ],
          student_distribution: [
            { level: 'Excelling (90-100%)', count: 5, percentage: 15.6 },
            { level: 'Proficient (80-89%)', count: 12, percentage: 37.5 },
            { level: 'Developing (70-79%)', count: 10, percentage: 31.3 },
            { level: 'Struggling (<70%)', count: 5, percentage: 15.6 }
          ],
          simulation_analytics: [
            { simulation_name: 'Physics Pendulum Lab', attempts: 89, average_score: 85, completion_rate: 92, average_time: 25 },
            { simulation_name: 'Chemical Reactions', attempts: 76, average_score: 78, completion_rate: 85, average_time: 30 },
            { simulation_name: 'Cell Division', attempts: 82, average_score: 80, completion_rate: 88, average_time: 28 },
            { simulation_name: 'Quadratic Equations', attempts: 71, average_score: 72, completion_rate: 75, average_time: 35 }
          ],
          struggling_students: [
            { student_id: '1', student_name: 'Student A', average_score: 58, completion_rate: 45, last_active: '2024-01-28' },
            { student_id: '2', student_name: 'Student B', average_score: 62, completion_rate: 50, last_active: '2024-01-25' },
            { student_id: '3', student_name: 'Student C', average_score: 65, completion_rate: 55, last_active: '2024-01-29' }
          ],
          top_performers: [
            { student_id: '4', student_name: 'Student D', average_score: 95, simulations_completed: 15, badges_earned: 8 },
            { student_id: '5', student_name: 'Student E', average_score: 92, simulations_completed: 14, badges_earned: 7 },
            { student_id: '6', student_name: 'Student F', average_score: 90, simulations_completed: 15, badges_earned: 6 }
          ]
        };

        setAnalytics(mockAnalytics);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeframe, classFilter, subjectFilter]);

  const exportReport = (format: 'csv' | 'pdf') => {
    // Implementation for exporting reports
    console.log(`Exporting report as ${format}`);
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-blue-700 font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No analytics data available</h3>
          <p className="text-gray-500">Analytics will appear once students start submitting work</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/dashboard')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Class Analytics & Reports</h1>
                <p className="text-gray-600 mt-1">
                  Comprehensive insights into student performance and progress
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 3 months</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => exportReport('csv')} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button onClick={() => exportReport('pdf')}>
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.total_students}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.overview.active_students} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Class Average</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getPerformanceColor(analytics.overview.average_score)}`}>
                {analytics.overview.average_score}%
              </div>
              <Progress value={analytics.overview.average_score} className="mt-2 h-1" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.completion_rate}%</div>
              <Progress value={analytics.overview.completion_rate} className="mt-2 h-1" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Simulations</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.total_simulations}</div>
              <p className="text-xs text-muted-foreground">
                assigned
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Submissions</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.total_submissions}</div>
              <p className="text-xs text-muted-foreground">
                total received
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Need Help</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{analytics.struggling_students.length}</div>
              <p className="text-xs text-muted-foreground">
                students struggling
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics Content */}
        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="performance">Performance Trends</TabsTrigger>
            <TabsTrigger value="subjects">Subject Analysis</TabsTrigger>
            <TabsTrigger value="simulations">Simulation Insights</TabsTrigger>
            <TabsTrigger value="students">Student Distribution</TabsTrigger>
            <TabsTrigger value="individual">Individual Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Class Performance Over Time</CardTitle>
                  <CardDescription>
                    Average scores and submission trends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.performance_trends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => new Date(date).toLocaleDateString()}
                      />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="average_score" 
                        stroke="#8884d8" 
                        name="Average Score %"
                        strokeWidth={2}
                      />
                      <Bar 
                        yAxisId="right"
                        dataKey="submissions" 
                        fill="#82ca9d" 
                        name="Submissions"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Student Activity Trends</CardTitle>
                  <CardDescription>
                    Active students over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={analytics.performance_trends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => new Date(date).toLocaleDateString()}
                      />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="active_students" 
                        stroke="#8884d8" 
                        fill="#8884d8" 
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="subjects" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Subject Performance Comparison</CardTitle>
                <CardDescription>
                  Average scores and completion rates by subject
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={analytics.subject_performance}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis />
                    <Radar 
                      name="Average Score" 
                      dataKey="average_score" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.6} 
                    />
                    <Radar 
                      name="Completion Rate" 
                      dataKey="completion_rate" 
                      stroke="#82ca9d" 
                      fill="#82ca9d" 
                      fillOpacity={0.6} 
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="simulations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Simulation Performance Analysis</CardTitle>
                <CardDescription>
                  Detailed metrics for each simulation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.simulation_analytics.map((sim, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{sim.simulation_name}</h4>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <span>{sim.attempts} attempts</span>
                          <span>•</span>
                          <span>{sim.average_time} min avg</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Avg Score</p>
                          <p className={`text-lg font-semibold ${getPerformanceColor(sim.average_score)}`}>
                            {sim.average_score}%
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Completion</p>
                          <p className="text-lg font-semibold">{sim.completion_rate}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Performance Distribution</CardTitle>
                <CardDescription>
                  Distribution of students by performance level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={analytics.student_distribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.level}: ${entry.count}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {analytics.student_distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="individual" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Struggling Students */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <span>Students Needing Support</span>
                  </CardTitle>
                  <CardDescription>
                    Students with performance below 70%
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.struggling_students.map((student) => (
                      <div key={student.student_id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div>
                          <h4 className="font-medium">{student.student_name}</h4>
                          <div className="flex items-center space-x-3 text-sm text-gray-600 mt-1">
                            <span>Score: {student.average_score}%</span>
                            <span>•</span>
                            <span>Completion: {student.completion_rate}%</span>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => router.push(`/dashboard/students/${student.student_id}/report`)}
                        >
                          View Report
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Performers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <span>Top Performers</span>
                  </CardTitle>
                  <CardDescription>
                    Students excelling in their studies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.top_performers.map((student, index) => (
                      <div key={student.student_id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-medium">{student.student_name}</h4>
                            <div className="flex items-center space-x-3 text-sm text-gray-600 mt-1">
                              <span>Score: {student.average_score}%</span>
                              <span>•</span>
                              <span>{student.simulations_completed} completed</span>
                              <span>•</span>
                              <span>{student.badges_earned} badges</span>
                            </div>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => router.push(`/dashboard/students/${student.student_id}/report`)}
                        >
                          View Report
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Report Actions</CardTitle>
            <CardDescription>
              Generate and share comprehensive reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Generate Monthly Report
              </Button>
              <Button variant="outline" className="w-full">
                <Users className="h-4 w-4 mr-2" />
                Parent Progress Reports
              </Button>
              <Button variant="outline" className="w-full">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Report Email
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}