'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinnerCompact } from '@/components/ui/loading-spinner';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Users, 
  BookOpen, 
  FlaskConical,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  MessageSquare,
  Sparkles,
  Play,
  Eye,
  UserPlus,
  FileText,
  TrendingUp,
  Activity,
  Star,
  Award,
  Target,
  Zap,
  Rocket,
  Heart
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import * as design from './design-system';
import { StatCard, FeatureCard, ProgressCard, EmptyState, PageHeader, TabNav } from './ui-components';

interface Module {
  id: string;
  title: string;
  titleKm: string;
  subject: string;
  type: 'simulation' | 'exercise' | 'lesson';
  status: 'active' | 'draft' | 'archived';
  studentsAssigned: number;
  completionRate: number;
  lastModified: string;
}

interface StudentEngagement {
  id: string;
  name: string;
  avatar?: string;
  lastActive: string;
  modulesCompleted: number;
  totalModules: number;
  averageScore: number;
  status: 'active' | 'inactive' | 'struggling';
  recentActivity?: string;
}

interface Activity {
  id: string;
  studentName: string;
  action: string;
  module: string;
  timestamp: string;
  type: 'completed' | 'started' | 'submitted' | 'message';
}

interface TeacherEngagementDashboardProps {
  user: any;
}

export function TeacherEngagementDashboard({ user }: TeacherEngagementDashboardProps) {
  const [modules, setModules] = useState<Module[]>([]);
  const [students, setStudents] = useState<StudentEngagement[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');
  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    // Auto-refresh dashboard data every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch modules data
      const modulesResponse = await fetch('/api/modules', {
        credentials: 'include'
      });
      const modulesData = await modulesResponse.json();
      
      if (modulesData.success && modulesData.modules) {
        setModules(modulesData.modules);
      }

      // Mock student engagement data
      setStudents([
        {
          id: '1',
          name: 'Sokha Chen',
          avatar: '/avatars/student1.jpg',
          lastActive: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          modulesCompleted: 15,
          totalModules: 20,
          averageScore: 85,
          status: 'active',
          recentActivity: 'Completed Physics Simulation'
        },
        {
          id: '2',
          name: 'Dara Kim',
          lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          modulesCompleted: 12,
          totalModules: 20,
          averageScore: 78,
          status: 'active',
          recentActivity: 'Working on Chemistry Lab'
        },
        {
          id: '3',
          name: 'Srey Mom',
          lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
          modulesCompleted: 5,
          totalModules: 20,
          averageScore: 62,
          status: 'struggling',
          recentActivity: 'Started Math Exercise'
        }
      ]);

      // Mock activities
      setActivities([
        {
          id: '1',
          studentName: 'Sokha Chen',
          action: 'completed',
          module: 'Physics: Pendulum Lab',
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          type: 'completed'
        },
        {
          id: '2',
          studentName: 'Dara Kim',
          action: 'started',
          module: 'Chemistry: Reaction Rates',
          timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          type: 'started'
        }
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'struggling':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'completed':
        return CheckCircle2;
      case 'started':
        return Play;
      case 'submitted':
        return FileText;
      case 'message':
        return MessageSquare;
      default:
        return Activity;
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(timestamp).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Rocket },
    { id: 'modules', label: 'Modules', icon: BookOpen, badge: modules.length },
    { id: 'students', label: 'Students', icon: Users, badge: students.length },
    { id: 'activity', label: 'Activity', icon: Activity }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinnerCompact />
      </div>
    );
  }

  return (
    <div className={cn(design.spacing.section, "max-w-7xl mx-auto")}>
      {/* Welcome Section */}
      <div className={cn(
        "rounded-2xl p-6 sm:p-8 mb-8",
        design.gradients.sunset
      )}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
              Welcome back, {user.firstName}! <Sparkles className="h-6 w-6 text-yellow-500" />
            </h2>
            <p className="text-gray-600 mt-1">Ready to inspire young minds today?</p>
          </div>
          <Button 
            onClick={() => router.push('/dashboard/simulations/new')}
            className={cn(design.buttonVariants.primary, "shadow-xl")}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Module
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className={design.grids.stats}>
        <StatCard
          title="Active Students"
          value={students.filter(s => s.status === 'active').length}
          description="Currently engaged"
          icon={Users}
          trend="up"
          trendValue="12%"
          color="primary"
          gradient
        />
        <StatCard
          title="Modules Created"
          value={modules.length}
          description="Total learning modules"
          icon={BookOpen}
          color="secondary"
          gradient
        />
        <StatCard
          title="Completion Rate"
          value="78%"
          description="Average across all students"
          icon={Target}
          trend="up"
          trendValue="5%"
          color="success"
          gradient
        />
        <StatCard
          title="Engagement Score"
          value="4.5"
          description="Out of 5.0"
          icon={Star}
          color="warning"
          gradient
        />
      </div>

      {/* Tab Navigation */}
      <div className="mt-8">
        <TabNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className={design.spacing.section}>
            {/* Quick Actions */}
            <h3 className={cn(design.typography.h3, "mb-4")}>Quick Actions</h3>
            <div className={design.grids.cards}>
              <FeatureCard
                title="Launch Simulation"
                titleKm="ចាប់ផ្តើមការពិសោធន៍"
                description="Start an interactive STEM simulation for your students"
                icon={FlaskConical}
                onClick={() => router.push('/dashboard/simulations/launch')}
                badge="Popular"
                gradient={design.gradients.primary}
              />
              <FeatureCard
                title="Create Exercise"
                titleKm="បង្កើតលំហាត់"
                description="Design custom exercises tailored to your curriculum"
                icon={Edit}
                onClick={() => router.push('/dashboard/exercises/create')}
                gradient={design.gradients.secondary}
              />
              <FeatureCard
                title="View Analytics"
                titleKm="មើលការវិភាគ"
                description="Track student progress and performance insights"
                icon={TrendingUp}
                onClick={() => router.push('/dashboard/analytics')}
                badge="New"
                badgeVariant="secondary"
                gradient={design.gradients.success}
              />
            </div>

            {/* Recent Activities */}
            <h3 className={cn(design.typography.h3, "mt-8 mb-4")}>Recent Student Activity</h3>
            <Card className={design.cardVariants.default}>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {activities.map((activity) => {
                    const ActivityIcon = getActivityIcon(activity.type);
                    return (
                      <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className={cn(
                            "p-2 rounded-lg",
                            activity.type === 'completed' ? 'bg-green-100' :
                            activity.type === 'started' ? 'bg-blue-100' :
                            activity.type === 'submitted' ? 'bg-purple-100' :
                            'bg-gray-100'
                          )}>
                            <ActivityIcon className={cn(
                              "h-4 w-4",
                              activity.type === 'completed' ? 'text-green-600' :
                              activity.type === 'started' ? 'text-blue-600' :
                              activity.type === 'submitted' ? 'text-purple-600' :
                              'text-gray-600'
                            )} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              <span className="font-semibold">{activity.studentName}</span>
                              {' '}{activity.action}{' '}
                              <span className="text-blue-600">{activity.module}</span>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {getTimeAgo(activity.timestamp)}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'modules' && (
          <div className={design.spacing.section}>
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search modules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterSubject} onValueChange={setFilterSubject}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  <SelectItem value="Physics">Physics</SelectItem>
                  <SelectItem value="Chemistry">Chemistry</SelectItem>
                  <SelectItem value="Biology">Biology</SelectItem>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Modules Grid */}
            {modules.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="No modules yet"
                description="Create your first learning module to get started"
                action={{
                  label: "Create Module",
                  onClick: () => router.push('/dashboard/modules/create')
                }}
              />
            ) : (
              <div className={design.grids.cards}>
                {modules.map((module) => (
                  <Card key={module.id} className={cn(
                    design.cardVariants.colorful,
                    "group hover:ring-2 hover:ring-purple-400 hover:ring-offset-2"
                  )}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{module.title}</CardTitle>
                          <p className="text-sm text-gray-600 font-khmer mt-1">{module.titleKm}</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/modules/${module.id}/edit`)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Subject</span>
                          <Badge variant="secondary">{module.subject}</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Students</span>
                          <span className="font-medium">{module.studentsAssigned}</span>
                        </div>
                        <ProgressCard
                          title="Completion"
                          current={module.completionRate}
                          total={100}
                          unit="%"
                          color="primary"
                        />
                      </div>
                      <div className="mt-4 pt-4 border-t flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          Updated {getTimeAgo(module.lastModified)}
                        </span>
                        <Button
                          size="sm"
                          className={design.buttonVariants.primary}
                          onClick={() => router.push(`/dashboard/modules/${module.id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'students' && (
          <div className={design.spacing.section}>
            {/* Student Engagement List */}
            <div className="grid gap-4">
              {students.map((student) => (
                <Card key={student.id} className={cn(
                  design.cardVariants.default,
                  "hover:shadow-md transition-all"
                )}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={student.avatar} />
                          <AvatarFallback className={design.gradients.primary}>
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-gray-900">{student.name}</h4>
                          <p className="text-sm text-gray-600">
                            Last active {getTimeAgo(student.lastActive)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Award className="h-4 w-4 text-yellow-500" />
                          <span className="font-medium">{student.averageScore}%</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Target className="h-4 w-4 text-blue-500" />
                          <span>{student.modulesCompleted}/{student.totalModules} modules</span>
                        </div>
                        <Badge variant={
                          student.status === 'active' ? 'default' :
                          student.status === 'struggling' ? 'destructive' : 'secondary'
                        }>
                          {student.status}
                        </Badge>
                      </div>
                    </div>
                    
                    {student.recentActivity && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Recent:</span> {student.recentActivity}
                        </p>
                      </div>
                    )}
                    
                    <div className="mt-4 flex flex-col sm:flex-row gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push(`/dashboard/students/${student.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Profile
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Send Message
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className={design.spacing.section}>
            <Card className={design.cardVariants.default}>
              <CardHeader>
                <CardTitle>Activity Timeline</CardTitle>
                <CardDescription>Real-time updates from your classroom</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities.map((activity, index) => {
                    const ActivityIcon = getActivityIcon(activity.type);
                    return (
                      <div key={activity.id} className="flex gap-4">
                        <div className="relative">
                          <div className={cn(
                            "p-2 rounded-full",
                            activity.type === 'completed' ? 'bg-green-100' :
                            activity.type === 'started' ? 'bg-blue-100' :
                            activity.type === 'submitted' ? 'bg-purple-100' :
                            'bg-gray-100'
                          )}>
                            <ActivityIcon className={cn(
                              "h-4 w-4",
                              activity.type === 'completed' ? 'text-green-600' :
                              activity.type === 'started' ? 'text-blue-600' :
                              activity.type === 'submitted' ? 'text-purple-600' :
                              'text-gray-600'
                            )} />
                          </div>
                          {index < activities.length - 1 && (
                            <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-0.5 h-16 bg-gray-200" />
                          )}
                        </div>
                        <div className="flex-1 pb-8">
                          <p className="text-sm font-medium text-gray-900">
                            <span className="font-semibold">{activity.studentName}</span>
                            {' '}{activity.action}{' '}
                            <span className="text-blue-600 hover:underline cursor-pointer">
                              {activity.module}
                            </span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {getTimeAgo(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}