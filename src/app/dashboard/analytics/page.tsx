'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import ModernSidebar from '@/components/dashboard/ModernSidebar';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
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
  Filter,
  Trophy,
  Bell,
  Menu,
  Zap,
  Activity,
  BookOpenCheck,
  GraduationCap
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
import * as design from '@/components/dashboard/design-system';
import { StatCard, FeatureCard, ProgressCard, EmptyState, TabNav, PageHeader } from '@/components/dashboard/ui-components';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  roles: string[];
  permissions: string[];
  schoolAccess: Array<{
    schoolId: number;
    accessType: string;
    subject: string;
  }>;
  teacherId?: number;
}

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

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#14B8A6'];

export default function TeacherAnalyticsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [analytics, setAnalytics] = useState<ClassAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30');
  const [classFilter, setClassFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const data = await response.json();
          const userData = data.user;
          
          // Check if user is a student and redirect to student portal
          if (userData.roles?.includes('student') || userData.role === 'student') {
            router.push('/student');
            return;
          }
          
          setUser(userData);
        } else {
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Session fetch error:', error);
        router.push('/auth/login');
      } finally {
        setSessionLoading(false);
      }
    };

    fetchSession();
  }, [router]);

  useEffect(() => {
    if (!user) return;
    
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
  }, [user, timeframe, classFilter, subjectFilter]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

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

  if (sessionLoading || loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - handles both desktop and mobile */}
      <ModernSidebar 
        user={user} 
        onLogout={handleLogout} 
        mobileOpen={mobileMenuOpen}
        onMobileToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        onCollapsedChange={setSidebarCollapsed}
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-80'}`}>
        {/* Top Header */}
        <header className="bg-gradient-to-r from-white via-purple-50 to-blue-50 border-b border-gray-200 px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </Button>
              
              <div className="hidden sm:block">
                <p className="text-sm text-gray-600">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="icon" 
                className="relative bg-white/80 backdrop-blur-sm hover:bg-white"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-gradient-to-r from-red-400 to-pink-500 rounded-full animate-pulse"></span>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className={cn("flex-1 overflow-y-auto", design.gradients.sky)}>
          <div className={design.spacing.page}>
          {!analytics ? (
            <EmptyState
              icon={BarChart3}
              title="No analytics data available"
              description="Analytics will appear once students start submitting work"
              action={{
                label: "View Sample Data",
                onClick: () => router.push('/dashboard')
              }}
            />
          ) : (
            <div className={design.spacing.section}>
              {/* Page Header */}
              <PageHeader
                title="Class Analytics & Reports"
                titleKm="របាយការណ៍វិភាគ និងអនុកុលកម្ម"
                description="Comprehensive insights into student performance and progress"
                actions={
                  <div className="flex items-center gap-2">
                    <Button variant="outline" className="bg-white/80 backdrop-blur-sm">
                      <Filter className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Filters</span>
                    </Button>
                    <Button className={cn(design.buttonVariants.primary, "shadow-lg")}>
                      <Download className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Export</span>
                    </Button>
                  </div>
                }
              />

      {/* Controls Section */}
      <Card className={cn(design.cardVariants.gradient, "overflow-hidden")}>
        <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
          <CardTitle className="flex items-center space-x-2">
            <div className={cn("p-2 rounded-lg", design.gradients.primary)}>
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <span>Analytics Controls</span>
          </CardTitle>
          <CardDescription>
            Filter and customize your analytics view
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-40 bg-white/80 backdrop-blur-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 3 months</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger className="w-40 bg-white/80 backdrop-blur-sm">
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  <SelectItem value="10a">Class 10A</SelectItem>
                  <SelectItem value="10b">Class 10B</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={() => exportReport('csv')} variant="outline" size="sm" className="bg-white/80">
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Export</span> CSV
              </Button>
              <Button onClick={() => exportReport('pdf')} size="sm" className={design.buttonVariants.secondary}>
                <FileText className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Generate</span> Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Stats */}
      <div className={design.grids.stats}>
        <StatCard
          title="Total Students"
          value={analytics.overview.total_students}
          description={`${analytics.overview.active_students} active today`}
          icon={Users}
          color="primary"
          gradient={true}
          trend="up"
          trendValue="12%"
        />
        
        <StatCard
          title="Class Average"
          value={`${analytics.overview.average_score}%`}
          description="Overall performance"
          icon={GraduationCap}
          color="success"
          gradient={true}
          trend={analytics.overview.average_score > 75 ? "up" : "down"}
          trendValue="5%"
        />
        
        <StatCard
          title="Completion Rate"
          value={`${analytics.overview.completion_rate}%`}
          description="Assignments completed"
          icon={Target}
          color="secondary"
          gradient={true}
          trend="up"
          trendValue="8%"
        />
        
        <StatCard
          title="Active Learning"
          value={analytics.overview.total_submissions}
          description="Total submissions"
          icon={Activity}
          color="warning"
          gradient={true}
        />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <ProgressCard
          title="Simulations Completed"
          current={12}
          total={analytics.overview.total_simulations}
          unit="labs"
          color="primary"
          icon={BookOpen}
        />
        
        <ProgressCard
          title="Student Engagement"
          current={analytics.overview.active_students}
          total={analytics.overview.total_students}
          unit="students"
          color="success"
          icon={Zap}
        />
        
        <Card className={cn(design.cardVariants.colorful, "group hover:scale-[1.02] transition-all duration-300")}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Need Support</p>
                <h3 className="text-2xl sm:text-3xl font-bold mt-2 bg-gradient-to-r from-red-500 to-pink-600 bg-clip-text text-transparent">
                  {analytics.struggling_students.length}
                </h3>
                <p className="text-xs text-gray-500 mt-1">students need help</p>
              </div>
              <div className={cn("p-3 rounded-xl", design.gradients.danger)}>
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
            </div>
            <Button 
              size="sm" 
              className={cn("w-full mt-4", design.buttonVariants.primary)}
              onClick={() => document.getElementById('individual-reports')?.scrollIntoView({ behavior: 'smooth' })}
            >
              View Students
            </Button>
          </CardContent>
        </Card>
      </div>

        {/* Analytics Insights */}
        <Card className={cn(design.cardVariants.glass, "p-0 overflow-hidden")}>
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardTitle>Analytics Insights</CardTitle>
            <CardDescription>Deep dive into your class performance data</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="performance" className="w-full">
              <div className="px-4 sm:px-6 py-4 border-b">
                <TabsList className="w-full h-auto p-0 bg-transparent">
                  <TabNav
                    tabs={[
                      { id: 'performance', label: 'Trends', icon: TrendingUp },
                      { id: 'subjects', label: 'Subjects', icon: BookOpenCheck },
                      { id: 'simulations', label: 'Labs', icon: Activity },
                      { id: 'students', label: 'Distribution', icon: PieChart },
                      { id: 'individual', label: 'Students', icon: Users, badge: analytics.struggling_students.length }
                    ]}
                    activeTab="performance"
                    onTabChange={(tab) => {
                      const trigger = document.querySelector(`[data-state][value="${tab}"]`) as HTMLElement;
                      trigger?.click();
                    }}
                  />
                </TabsList>
                <div className="hidden">
                  <TabsList>
                    <TabsTrigger value="performance" />
                    <TabsTrigger value="subjects" />
                    <TabsTrigger value="simulations" />
                    <TabsTrigger value="students" />
                    <TabsTrigger value="individual" />
                  </TabsList>
                </div>
              </div>

          <TabsContent value="performance" className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className={design.cardVariants.colorful}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
                      <TrendingUp className="h-4 w-4 text-white" />
                    </div>
                    Class Performance Over Time
                  </CardTitle>
                  <CardDescription>
                    Average scores and submission trends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.performance_trends}>
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        stroke="#6B7280"
                      />
                      <YAxis yAxisId="left" stroke="#6B7280" />
                      <YAxis yAxisId="right" orientation="right" stroke="#6B7280" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="average_score" 
                        stroke="#8B5CF6" 
                        name="Average Score %"
                        strokeWidth={3}
                        dot={{ fill: '#8B5CF6', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Bar 
                        yAxisId="right"
                        dataKey="submissions" 
                        fill="url(#colorSubmissions)" 
                        name="Submissions"
                        radius={[8, 8, 0, 0]}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className={design.cardVariants.colorful}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-teal-600">
                      <Activity className="h-4 w-4 text-white" />
                    </div>
                    Student Activity Trends
                  </CardTitle>
                  <CardDescription>
                    Active students over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={analytics.performance_trends}>
                      <defs>
                        <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        stroke="#6B7280"
                      />
                      <YAxis stroke="#6B7280" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="active_students" 
                        stroke="#3B82F6" 
                        fill="url(#colorActivity)" 
                        strokeWidth={3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="subjects" className="p-6">
            <Card className={cn(design.cardVariants.colorful, "overflow-hidden")}>
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600">
                    <BookOpenCheck className="h-4 w-4 text-white" />
                  </div>
                  Subject Performance Comparison
                </CardTitle>
                <CardDescription>
                  Average scores and completion rates by subject
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={analytics.subject_performance}>
                    <defs>
                      <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                      </linearGradient>
                      <linearGradient id="completionGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="#10B981" stopOpacity={0.3}/>
                      </linearGradient>
                    </defs>
                    <PolarGrid stroke="#E5E7EB" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#6B7280' }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#6B7280' }} />
                    <Radar 
                      name="Average Score" 
                      dataKey="average_score" 
                      stroke="#8B5CF6" 
                      fill="url(#scoreGradient)" 
                      strokeWidth={2}
                    />
                    <Radar 
                      name="Completion Rate" 
                      dataKey="completion_rate" 
                      stroke="#10B981" 
                      fill="url(#completionGradient)" 
                      strokeWidth={2}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
                
                {/* Subject Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  {analytics.subject_performance.map((subject, index) => (
                    <div 
                      key={subject.subject}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all duration-300 hover:scale-[1.02]",
                        "bg-gradient-to-br",
                        index === 0 ? "from-blue-50 to-indigo-50 border-blue-200 hover:border-blue-300" :
                        index === 1 ? "from-purple-50 to-pink-50 border-purple-200 hover:border-purple-300" :
                        index === 2 ? "from-green-50 to-teal-50 border-green-200 hover:border-green-300" :
                        "from-orange-50 to-red-50 border-orange-200 hover:border-orange-300"
                      )}
                    >
                      <h4 className="font-semibold text-gray-900">{subject.subject}</h4>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Average Score</span>
                          <span className={cn(
                            "font-bold",
                            subject.average_score >= 80 ? "text-green-600" :
                            subject.average_score >= 70 ? "text-yellow-600" : "text-red-600"
                          )}>{subject.average_score}%</span>
                        </div>
                        <Progress value={subject.average_score} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="simulations" className="p-6">
            <div className="space-y-4">
              {analytics.simulation_analytics.map((sim, index) => (
                <Card 
                  key={index} 
                  className={cn(
                    design.cardVariants.colorful,
                    "overflow-hidden hover:scale-[1.01] transition-all duration-300"
                  )}
                >
                  <div className={cn(
                    "h-2 bg-gradient-to-r",
                    sim.average_score >= 80 ? "from-green-400 to-emerald-500" :
                    sim.average_score >= 70 ? "from-yellow-400 to-orange-500" :
                    "from-red-400 to-pink-500"
                  )} />
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2 rounded-lg",
                            index === 0 ? design.gradients.primary :
                            index === 1 ? design.gradients.secondary :
                            index === 2 ? design.gradients.success :
                            design.gradients.warning
                          )}>
                            <Activity className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg">{sim.simulation_name}</h4>
                            <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-600">
                              <Badge variant="outline" className="gap-1">
                                <Users className="h-3 w-3" />
                                {sim.attempts} attempts
                              </Badge>
                              <Badge variant="outline" className="gap-1">
                                <Clock className="h-3 w-3" />
                                {sim.average_time} min avg
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">Avg Score</p>
                          <div className={cn(
                            "text-2xl font-bold",
                            sim.average_score >= 80 ? "text-green-600" :
                            sim.average_score >= 70 ? "text-yellow-600" : "text-red-600"
                          )}>
                            {sim.average_score}%
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">Completion</p>
                          <div className="relative w-16 h-16">
                            <svg className="w-16 h-16 transform -rotate-90">
                              <circle
                                cx="32"
                                cy="32"
                                r="28"
                                stroke="#E5E7EB"
                                strokeWidth="4"
                                fill="none"
                              />
                              <circle
                                cx="32"
                                cy="32"
                                r="28"
                                stroke="url(#gradient)"
                                strokeWidth="4"
                                fill="none"
                                strokeDasharray={`${2 * Math.PI * 28 * sim.completion_rate / 100} ${2 * Math.PI * 28}`}
                              />
                              <defs>
                                <linearGradient id="gradient">
                                  <stop offset="0%" stopColor="#8B5CF6" />
                                  <stop offset="100%" stopColor="#EC4899" />
                                </linearGradient>
                              </defs>
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-sm font-bold">{sim.completion_rate}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="students" className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className={design.cardVariants.colorful}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600">
                      <PieChart className="h-4 w-4 text-white" />
                    </div>
                    Performance Distribution
                  </CardTitle>
                  <CardDescription>
                    Students grouped by performance level
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <defs>
                        {COLORS.map((color, index) => (
                          <linearGradient key={`gradient-${index}`} id={`gradient-${index}`}>
                            <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                            <stop offset="100%" stopColor={color} stopOpacity={1} />
                          </linearGradient>
                        ))}
                      </defs>
                      <Pie
                        data={analytics.student_distribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.count} students`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {analytics.student_distribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`url(#gradient-${index})`} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px'
                        }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="space-y-4">
                {analytics.student_distribution.map((level, index) => (
                  <Card 
                    key={level.level}
                    className={cn(
                      "p-4 border-2 transition-all duration-300 hover:scale-[1.02]",
                      index === 0 ? "border-green-200 bg-gradient-to-r from-green-50 to-emerald-50" :
                      index === 1 ? "border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50" :
                      index === 2 ? "border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50" :
                      "border-red-200 bg-gradient-to-r from-red-50 to-pink-50"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">{level.level}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {level.count} students ({level.percentage}%)
                        </p>
                      </div>
                      <div className={cn(
                        "p-3 rounded-full",
                        index === 0 ? "bg-green-100" :
                        index === 1 ? "bg-blue-100" :
                        index === 2 ? "bg-yellow-100" :
                        "bg-red-100"
                      )}>
                        <Trophy className={cn(
                          "h-6 w-6",
                          index === 0 ? "text-green-600" :
                          index === 1 ? "text-blue-600" :
                          index === 2 ? "text-yellow-600" :
                          "text-red-600"
                        )} />
                      </div>
                    </div>
                    <Progress 
                      value={level.percentage} 
                      className="mt-3 h-2"
                    />
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="individual" className="p-6" id="individual-reports">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Struggling Students */}
              <Card className={cn(design.cardVariants.colorful, "border-red-200")}>
                <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50">
                  <CardTitle className="flex items-center space-x-2">
                    <div className={cn("p-2 rounded-lg", design.gradients.danger)}>
                      <AlertCircle className="h-5 w-5 text-white" />
                    </div>
                    <span>Students Needing Support</span>
                  </CardTitle>
                  <CardDescription>
                    Students with performance below 70%
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {analytics.struggling_students.map((student) => (
                      <div 
                        key={student.student_id} 
                        className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-100 hover:border-red-200 transition-all duration-300 hover:shadow-md"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{student.student_name}</h4>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <Badge variant="destructive" className="text-xs">
                              <TrendingDown className="h-3 w-3 mr-1" />
                              Score: {student.average_score}%
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Completion: {student.completion_rate}%
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Last active: {new Date(student.last_active).toLocaleDateString()}
                            </Badge>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          className={cn(design.buttonVariants.primary, "shadow-sm")}
                          onClick={() => router.push(`/dashboard/students/${student.student_id}/report`)}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          View Report
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Performers */}
              <Card className={cn(design.cardVariants.colorful, "border-green-200")}>
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                  <CardTitle className="flex items-center space-x-2">
                    <div className={cn("p-2 rounded-lg", design.gradients.success)}>
                      <Trophy className="h-5 w-5 text-white" />
                    </div>
                    <span>Top Performers</span>
                  </CardTitle>
                  <CardDescription>
                    Students excelling in their studies
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {analytics.top_performers.map((student, index) => (
                      <div 
                        key={student.student_id} 
                        className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 hover:border-green-200 transition-all duration-300 hover:shadow-md"
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg",
                            index === 0 ? "bg-gradient-to-r from-yellow-400 to-orange-500" :
                            index === 1 ? "bg-gradient-to-r from-gray-400 to-gray-500" :
                            "bg-gradient-to-r from-orange-600 to-red-600"
                          )}>
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{student.student_name}</h4>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <Badge className="text-xs bg-green-100 text-green-800">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                Score: {student.average_score}%
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                <BookOpenCheck className="h-3 w-3 mr-1" />
                                {student.simulations_completed} labs
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                <Award className="h-3 w-3 mr-1" />
                                {student.badges_earned} badges
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          className={cn(design.buttonVariants.secondary, "shadow-sm")}
                          onClick={() => router.push(`/dashboard/students/${student.student_id}/report`)}
                        >
                          <FileText className="h-4 w-4 mr-1" />
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
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <FeatureCard
            title="Monthly Report"
            description="Generate comprehensive monthly performance report"
            icon={FileText}
            gradient={design.gradients.primary}
            onClick={() => exportReport('pdf')}
          />
          <FeatureCard
            title="Parent Reports"
            description="Create individual progress reports for parents"
            icon={Users}
            gradient={design.gradients.secondary}
            onClick={() => router.push('/dashboard/reports/parents')}
            badge="New"
            badgeVariant="secondary"
          />
          <FeatureCard
            title="Schedule Reports"
            description="Set up automated weekly or monthly reports"
            icon={Calendar}
            gradient={design.gradients.success}
            onClick={() => router.push('/dashboard/reports/schedule')}
          />
        </div>
            </div>
          )}
          </div>
        </main>
      </div>
    </div>
  );
}