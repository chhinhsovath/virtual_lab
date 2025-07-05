'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft,
  TrendingUp, 
  TrendingDown,
  Clock, 
  Award, 
  Target,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  BookOpen,
  Trophy,
  Users,
  Download
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface StudentAnalytics {
  overall_stats: {
    simulations_attempted: number;
    simulations_completed: number;
    total_time_minutes: number;
    average_score: number;
    achievements_earned: number;
    total_points: number;
  };
  subject_performance: Array<{
    subject_area: string;
    simulations_attempted: number;
    simulations_completed: number;
    average_score: number;
    total_time_minutes: number;
  }>;
  recent_activity: Array<{
    id: string;
    simulation_name: string;
    display_name_en: string;
    subject_area: string;
    status: string;
    progress_percentage: number;
    total_time_spent: number;
    updated_at: string;
  }>;
  learning_patterns: Array<{
    activity_date: string;
    sessions_count: number;
    daily_time_minutes: number;
    daily_average_score: number;
  }>;
  performance_comparison: {
    student_average: number;
    total_students: number;
    students_below: number;
    percentile_rank: number;
  } | null;
  timeframe: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function StudentAnalyticsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [analytics, setAnalytics] = useState<StudentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30');
  const router = useRouter();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Fetch user session
        const sessionRes = await fetch('/api/auth/session', { credentials: 'include' });
        if (!sessionRes.ok) {
          router.push('/auth/login');
          return;
        }

        const sessionData = await sessionRes.json();
        setUser(sessionData.user);

        // Fetch analytics data
        const analyticsRes = await fetch(
          `/api/analytics/student?timeframe=${timeframe}`,
          { credentials: 'include' }
        );
        
        if (analyticsRes.ok) {
          const analyticsData = await analyticsRes.json();
          setAnalytics(analyticsData.analytics);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeframe, router]);

  const exportAnalytics = () => {
    if (!analytics) return;
    
    const data = {
      generated_at: new Date().toISOString(),
      timeframe: `${timeframe} days`,
      overall_stats: analytics.overall_stats,
      subject_performance: analytics.subject_performance,
      learning_patterns: analytics.learning_patterns,
      performance_comparison: analytics.performance_comparison
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student_analytics_${timeframe}days.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatChartData = () => {
    if (!analytics) return [];
    
    return analytics.learning_patterns.map(pattern => ({
      date: new Date(pattern.activity_date).toLocaleDateString(),
      sessions: pattern.sessions_count,
      time: Math.round(pattern.daily_time_minutes),
      score: Math.round(pattern.daily_average_score)
    })).reverse();
  };

  const getSubjectChartData = () => {
    if (!analytics) return [];
    
    return analytics.subject_performance.map(subject => ({
      name: subject.subject_area,
      score: Math.round(subject.average_score),
      time: Math.round(subject.total_time_minutes),
      completed: subject.simulations_completed
    }));
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
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No analytics data available</h3>
          <p className="text-gray-500">Start learning to see your progress analytics!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/student')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Learning Analytics</h1>
                <p className="text-gray-600 mt-1">
                  Insights into your learning progress and performance
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
              <Button onClick={exportAnalytics} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <Target className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.overall_stats.simulations_attempted > 0 
                  ? Math.round((analytics.overall_stats.simulations_completed / analytics.overall_stats.simulations_attempted) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-blue-100">
                {analytics.overall_stats.simulations_completed} of {analytics.overall_stats.simulations_attempted} completed
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <Award className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(analytics.overall_stats.average_score)}%</div>
              <div className="flex items-center space-x-1 text-xs text-green-100">
                {analytics.performance_comparison && (
                  <>
                    <span>Top {100 - Math.round(analytics.performance_comparison.percentile_rank)}% of students</span>
                    <TrendingUp className="h-3 w-3" />
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Study Time</CardTitle>
              <Clock className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(analytics.overall_stats.total_time_minutes / 60)}h
              </div>
              <p className="text-xs text-orange-100">
                ~{Math.round(analytics.overall_stats.total_time_minutes / (parseInt(timeframe) || 30))} min/day
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Days</CardTitle>
              <Calendar className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.learning_patterns.length}</div>
              <p className="text-xs text-purple-100">
                in last {timeframe} days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Learning Progress Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Learning Progress Over Time</span>
              </CardTitle>
              <CardDescription>
                Daily study sessions and performance trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={formatChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar 
                    yAxisId="left"
                    dataKey="sessions" 
                    fill="#8884d8" 
                    name="Sessions"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="score" 
                    stroke="#82ca9d" 
                    name="Avg Score %"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Subject Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="h-5 w-5" />
                <span>Subject Performance</span>
              </CardTitle>
              <CardDescription>
                Performance breakdown by subject area
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getSubjectChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="score" fill="#8884d8" name="Avg Score %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Subject Performance Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Subject Performance Details</span>
            </CardTitle>
            <CardDescription>
              Detailed breakdown of your performance in each subject
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.subject_performance.map((subject, index) => (
                <div key={subject.subject_area} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <div>
                      <h4 className="font-medium capitalize">{subject.subject_area}</h4>
                      <p className="text-sm text-gray-500">
                        {subject.simulations_completed} completed, {Math.round(subject.total_time_minutes)} min
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-lg font-semibold">{Math.round(subject.average_score)}%</div>
                      <Progress value={subject.average_score} className="w-20" />
                    </div>
                    <Badge variant={subject.average_score >= 80 ? "default" : subject.average_score >= 60 ? "secondary" : "destructive"}>
                      {subject.average_score >= 80 ? "Excellent" : subject.average_score >= 60 ? "Good" : "Needs Improvement"}
                    </Badge>
                  </div>
                </div>
              ))}
              {analytics.subject_performance.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No subject performance data available yet. Complete some simulations to see your progress!
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Performance Comparison */}
        {analytics.performance_comparison && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Performance Comparison</span>
              </CardTitle>
              <CardDescription>
                How you compare to other students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {Math.round(analytics.performance_comparison.student_average)}%
                  </div>
                  <p className="text-sm text-gray-500">Your Average Score</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {Math.round(analytics.performance_comparison.percentile_rank)}%
                  </div>
                  <p className="text-sm text-gray-500">Percentile Rank</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {analytics.performance_comparison.total_students}
                  </div>
                  <p className="text-sm text-gray-500">Total Students</p>
                </div>
              </div>
              <div className="mt-6">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Performance Distribution</span>
                  <span>You performed better than {analytics.performance_comparison.students_below} students</span>
                </div>
                <Progress 
                  value={analytics.performance_comparison.percentile_rank} 
                  className="h-3"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Recent Learning Activity</span>
            </CardTitle>
            <CardDescription>
              Your latest simulation sessions and progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.recent_activity.slice(0, 5).map((activity, index) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <h4 className="font-medium text-sm">{activity.display_name_en}</h4>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Badge variant="outline" className="text-xs">{activity.subject_area}</Badge>
                        <span>•</span>
                        <span>{new Date(activity.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{activity.progress_percentage}%</div>
                    <div className="text-xs text-gray-500">
                      {Math.round(activity.total_time_spent / 60)} min
                    </div>
                  </div>
                </div>
              ))}
              {analytics.recent_activity.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No recent activity. Start learning to see your progress here!
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}