'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Award,
  MessageSquare,
  FileText,
  Calendar,
  BarChart3,
  Eye,
  Edit3,
  ArrowRight,
  Activity,
  FlaskConical,
  Play,
  Target,
  Sparkles
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TeacherStats {
  total_students: number;
  active_assignments: number;
  pending_submissions: number;
  average_class_score: number;
  completed_simulations: number;
  total_simulations: number;
}

interface SimulationStats {
  total_assigned: number;
  students_started: number;
  students_completed: number;
  average_score: number;
  average_time_spent: number;
  popular_simulations: Array<{
    id: string;
    name: string;
    subject: string;
    completion_rate: number;
    average_score: number;
  }>;
}

interface PendingSubmission {
  id: string;
  student_name: string;
  simulation_name: string;
  submitted_at: string;
  exercise_count: number;
  status: 'pending' | 'graded' | 'needs_review';
}

interface StudentProgress {
  student_id: string;
  student_name: string;
  simulations_completed: number;
  average_score: number;
  last_active: string;
  status: 'on_track' | 'struggling' | 'excelling';
}

interface RecentActivity {
  id: string;
  type: 'submission' | 'assignment' | 'achievement';
  student_name: string;
  action: string;
  timestamp: string;
}

interface EnhancedTeacherDashboardProps {
  user: any;
}

export function EnhancedTeacherDashboard({ user }: EnhancedTeacherDashboardProps) {
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [simulationStats, setSimulationStats] = useState<SimulationStats | null>(null);
  const [pendingSubmissions, setPendingSubmissions] = useState<PendingSubmission[]>([]);
  const [studentProgress, setStudentProgress] = useState<StudentProgress[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Mock data for now - replace with actual API calls
        setStats({
          total_students: 32,
          active_assignments: 5,
          pending_submissions: 12,
          average_class_score: 78.5,
          completed_simulations: 145,
          total_simulations: 200
        });

        setSimulationStats({
          total_assigned: 8,
          students_started: 28,
          students_completed: 24,
          average_score: 82.3,
          average_time_spent: 45,
          popular_simulations: [
            {
              id: '1',
              name: 'Physics Pendulum Lab',
              subject: 'Physics',
              completion_rate: 85,
              average_score: 88
            },
            {
              id: '2',
              name: 'Chemistry Reactions',
              subject: 'Chemistry',
              completion_rate: 72,
              average_score: 75
            },
            {
              id: '3',
              name: 'Biology Cell Division',
              subject: 'Biology',
              completion_rate: 68,
              average_score: 79
            }
          ]
        });

        setPendingSubmissions([
          {
            id: '1',
            student_name: 'Sokha Chan',
            simulation_name: 'Physics Pendulum Lab',
            submitted_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            exercise_count: 5,
            status: 'pending'
          },
          {
            id: '2',
            student_name: 'Dara Kim',
            simulation_name: 'Chemistry Reactions',
            submitted_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
            exercise_count: 8,
            status: 'pending'
          },
          {
            id: '3',
            student_name: 'Srey Mom',
            simulation_name: 'Biology Cell Division',
            submitted_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
            exercise_count: 6,
            status: 'needs_review'
          }
        ]);

        setStudentProgress([
          {
            student_id: '1',
            student_name: 'Sokha Chan',
            simulations_completed: 12,
            average_score: 85,
            last_active: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            status: 'excelling'
          },
          {
            student_id: '2',
            student_name: 'Dara Kim',
            simulations_completed: 8,
            average_score: 72,
            last_active: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
            status: 'on_track'
          },
          {
            student_id: '3',
            student_name: 'Srey Mom',
            simulations_completed: 5,
            average_score: 58,
            last_active: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            status: 'struggling'
          }
        ]);

        setRecentActivity([
          {
            id: '1',
            type: 'submission',
            student_name: 'Sokha Chan',
            action: 'submitted Physics Pendulum Lab exercises',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString()
          },
          {
            id: '2',
            type: 'achievement',
            student_name: 'Dara Kim',
            action: 'earned Perfect Score badge',
            timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString()
          },
          {
            id: '3',
            type: 'assignment',
            student_name: 'Class 10B',
            action: 'new assignment created',
            timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString()
          }
        ]);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excelling': return 'bg-green-100 text-green-800';
      case 'on_track': return 'bg-blue-100 text-blue-800';
      case 'struggling': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'graded': return 'bg-green-100 text-green-800';
      case 'needs_review': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'submission': return <FileText className="h-4 w-4 text-blue-600" />;
      case 'achievement': return <Award className="h-4 w-4 text-yellow-600" />;
      case 'assignment': return <BookOpen className="h-4 w-4 text-purple-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-blue-700 font-medium">Loading teacher dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user.firstName || user.username}!
        </h1>
        <p className="text-blue-100">
          You have {stats?.pending_submissions || 0} pending submissions to review
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_students || 0}</div>
            <p className="text-xs text-muted-foreground">
              across all classes
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Class Average</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.average_class_score || 0}%</div>
            <Progress value={stats?.average_class_score || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pending_submissions || 0}</div>
            <p className="text-xs text-muted-foreground">
              submissions awaiting review
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Assignments</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.active_assignments || 0}</div>
            <p className="text-xs text-muted-foreground">
              ongoing assignments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="pending">Pending Reviews</TabsTrigger>
          <TabsTrigger value="simulations">Simulations</TabsTrigger>
          <TabsTrigger value="students">Student Progress</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Pending Submissions</CardTitle>
                  <CardDescription>
                    Review and grade student exercise submissions
                  </CardDescription>
                </div>
                <Button onClick={() => router.push('/dashboard/exercises/submissions')}>
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingSubmissions.map((submission) => (
                  <div key={submission.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{submission.student_name}</h4>
                        <p className="text-sm text-gray-600">{submission.simulation_name}</p>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(submission.submitted_at).toLocaleString()}
                          </span>
                          <span>{submission.exercise_count} exercises</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(submission.status)}>
                        {submission.status.replace('_', ' ')}
                      </Badge>
                      <Button 
                        size="sm"
                        onClick={() => router.push(`/dashboard/exercises/grade/${submission.id}`)}
                      >
                        <Edit3 className="h-4 w-4 mr-1" />
                        Grade
                      </Button>
                    </div>
                  </div>
                ))}
                {pendingSubmissions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No pending submissions at the moment
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="simulations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Simulation Overview Stats */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FlaskConical className="h-5 w-5 text-blue-600" />
                    <CardTitle>Virtual Lab Simulations</CardTitle>
                  </div>
                  <Button 
                    onClick={() => router.push('/dashboard/assignments/new')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Assign New Simulation
                  </Button>
                </div>
                <CardDescription>
                  Track student engagement and performance across STEM simulations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{simulationStats?.total_assigned || 0}</div>
                    <p className="text-sm text-gray-600">Assigned</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{simulationStats?.students_started || 0}</div>
                    <p className="text-sm text-gray-600">Started</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{simulationStats?.students_completed || 0}</div>
                    <p className="text-sm text-gray-600">Completed</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{simulationStats?.average_score || 0}%</div>
                    <p className="text-sm text-gray-600">Avg Score</p>
                  </div>
                  <div className="text-center p-4 bg-pink-50 rounded-lg">
                    <div className="text-2xl font-bold text-pink-600">{simulationStats?.average_time_spent || 0}m</div>
                    <p className="text-sm text-gray-600">Avg Time</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Popular Simulations */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  Popular Simulations
                </CardTitle>
                <CardDescription>
                  Most engaged simulations in your classes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {simulationStats?.popular_simulations.map((sim, index) => (
                    <div key={sim.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            sim.subject === 'Physics' ? 'bg-blue-100' :
                            sim.subject === 'Chemistry' ? 'bg-green-100' :
                            sim.subject === 'Biology' ? 'bg-purple-100' :
                            'bg-orange-100'
                          }`}>
                            <span className="text-sm font-bold">#{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium">{sim.name}</p>
                            <p className="text-sm text-gray-500">{sim.subject}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{sim.completion_rate}% completed</p>
                          <p className="text-sm text-gray-500">Avg: {sim.average_score}%</p>
                        </div>
                      </div>
                      <Progress value={sim.completion_rate} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5 text-blue-600" />
                  Simulation Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/simulations')}
                >
                  <FlaskConical className="h-4 w-4 mr-2" />
                  Browse All Simulations
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/dashboard/assignments')}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Manage Assignments
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/dashboard/exercises')}
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Review Exercises
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/dashboard/analytics')}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Simulation Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Student Progress Overview</CardTitle>
                  <CardDescription>
                    Monitor individual student performance and identify those who need help
                  </CardDescription>
                </div>
                <Button onClick={() => router.push('/dashboard/students')}>
                  Manage Students
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studentProgress.map((student) => (
                  <div key={student.student_id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">{student.student_name.split(' ').map(n => n[0]).join('')}</span>
                      </div>
                      <div>
                        <h4 className="font-medium">{student.student_name}</h4>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                          <span>{student.simulations_completed} simulations</span>
                          <span>•</span>
                          <span>Avg: {student.average_score}%</span>
                          <span>•</span>
                          <span>Last active: {new Date(student.last_active).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(student.status)}>
                        {student.status.replace('_', ' ')}
                      </Badge>
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/dashboard/students/${student.student_id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Class Activity</CardTitle>
              <CardDescription>
                Latest actions and achievements in your classes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="p-2 rounded-full bg-gray-100">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.student_name}</span> {activity.action}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Simulation Completion Rate</CardTitle>
                <CardDescription>
                  Overall progress across all assigned simulations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      {Math.round((stats?.completed_simulations || 0) / (stats?.total_simulations || 1) * 100)}%
                    </span>
                    <Badge variant="secondary">
                      {stats?.completed_simulations} / {stats?.total_simulations}
                    </Badge>
                  </div>
                  <Progress 
                    value={(stats?.completed_simulations || 0) / (stats?.total_simulations || 1) * 100} 
                    className="h-3"
                  />
                  <Button variant="outline" className="w-full" onClick={() => router.push('/dashboard/analytics')}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Detailed Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks for managing your classes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/dashboard/assignments/new')}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Create New Assignment
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/dashboard/messages')}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Class Message
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/dashboard/reports')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Progress Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}