'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  GraduationCap, 
  Users, 
  FileText, 
  Clock, 
  TrendingUp, 
  Calendar,
  Bell,
  Award,
  CheckCircle,
  AlertCircle,
  Bookmark,
  BarChart3,
  UserCheck,
  MessageSquare,
  Settings
} from 'lucide-react';

interface DashboardData {
  user: {
    name: string;
    role: string;
    avatar?: string;
  };
  stats: {
    courses?: number;
    students?: number;
    assignments?: number;
    labs?: number;
    submissions?: number;
    avgScore?: number;
    timeSpent?: number;
    completionRate?: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: string;
    status?: string;
  }>;
  upcomingDeadlines?: Array<{
    id: string;
    title: string;
    type: string;
    dueDate: string;
    status: string;
  }>;
  courses?: Array<{
    id: string;
    title: string;
    code: string;
    role: string;
    progress?: number;
    status: string;
  }>;
  announcements?: Array<{
    id: string;
    title: string;
    content: string;
    priority: string;
    createdAt: string;
  }>;
}

interface MultiPortalDashboardProps {
  role: 'super_admin' | 'admin' | 'teacher' | 'student' | 'parent' | 'guardian' | 'director' | 'partner' | 'mentor' | 'collector' | 'observer' | 'qa';
  data: DashboardData;
  onNavigate?: (path: string) => void;
}

export function MultiPortalDashboard({ role, data, onNavigate }: MultiPortalDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const handleNavigation = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.location.href = path;
    }
  };

  const getRoleColor = (userRole: string) => {
    const colors = {
      'super_admin': 'bg-red-500',
      'admin': 'bg-purple-500',
      'teacher': 'bg-blue-500',
      'student': 'bg-green-500',
      'parent': 'bg-yellow-500',
      'guardian': 'bg-yellow-400',
      'director': 'bg-indigo-500',
      'partner': 'bg-pink-500',
      'mentor': 'bg-teal-500',
      'collector': 'bg-orange-500',
      'observer': 'bg-gray-500',
      'qa': 'bg-cyan-500'
    };
    return colors[userRole as keyof typeof colors] || 'bg-gray-500';
  };

  const getStatusBadge = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'completed': 'default',
      'in_progress': 'secondary',
      'pending': 'outline',
      'overdue': 'destructive',
      'submitted': 'default',
      'graded': 'default',
      'draft': 'secondary'
    };
    return variants[status] || 'outline';
  };

  const renderStatsCards = () => {
    const statsConfig = {
      super_admin: [
        { label: 'Total Courses', value: data.stats.courses, icon: BookOpen, color: 'blue' },
        { label: 'Total Users', value: data.stats.students, icon: Users, color: 'green' },
        { label: 'System Activity', value: data.stats.assignments, icon: TrendingUp, color: 'purple' },
        { label: 'Completion Rate', value: `${data.stats.completionRate}%`, icon: CheckCircle, color: 'green' }
      ],
      admin: [
        { label: 'Managed Courses', value: data.stats.courses, icon: BookOpen, color: 'blue' },
        { label: 'Total Students', value: data.stats.students, icon: Users, color: 'green' },
        { label: 'Assignments', value: data.stats.assignments, icon: FileText, color: 'orange' },
        { label: 'Avg Score', value: `${data.stats.avgScore}%`, icon: Award, color: 'yellow' }
      ],
      teacher: [
        { label: 'My Courses', value: data.stats.courses, icon: BookOpen, color: 'blue' },
        { label: 'Students', value: data.stats.students, icon: Users, color: 'green' },
        { label: 'Assignments', value: data.stats.assignments, icon: FileText, color: 'orange' },
        { label: 'Labs', value: data.stats.labs, icon: GraduationCap, color: 'purple' }
      ],
      student: [
        { label: 'Enrolled Courses', value: data.stats.courses, icon: BookOpen, color: 'blue' },
        { label: 'Completed Labs', value: data.stats.labs, icon: GraduationCap, color: 'purple' },
        { label: 'Submissions', value: data.stats.submissions, icon: FileText, color: 'orange' },
        { label: 'Avg Score', value: `${data.stats.avgScore}%`, icon: Award, color: 'yellow' }
      ],
      parent: [
        { label: 'Children', value: data.stats.students, icon: Users, color: 'green' },
        { label: 'Courses', value: data.stats.courses, icon: BookOpen, color: 'blue' },
        { label: 'Avg Performance', value: `${data.stats.avgScore}%`, icon: TrendingUp, color: 'purple' },
        { label: 'Time Spent', value: `${data.stats.timeSpent}h`, icon: Clock, color: 'gray' }
      ],
      guardian: [
        { label: 'Students', value: data.stats.students, icon: Users, color: 'green' },
        { label: 'Courses', value: data.stats.courses, icon: BookOpen, color: 'blue' },
        { label: 'Progress', value: `${data.stats.completionRate}%`, icon: TrendingUp, color: 'purple' },
        { label: 'Activities', value: data.stats.assignments, icon: FileText, color: 'orange' }
      ],
      director: [
        { label: 'Programs', value: data.stats.courses, icon: BookOpen, color: 'blue' },
        { label: 'Total Students', value: data.stats.students, icon: Users, color: 'green' },
        { label: 'Success Rate', value: `${data.stats.completionRate}%`, icon: CheckCircle, color: 'green' },
        { label: 'Reports', value: data.stats.assignments, icon: BarChart3, color: 'purple' }
      ],
      partner: [
        { label: 'Collaborations', value: data.stats.courses, icon: BookOpen, color: 'blue' },
        { label: 'Resources', value: data.stats.assignments, icon: FileText, color: 'orange' },
        { label: 'Impact', value: data.stats.students, icon: TrendingUp, color: 'purple' },
        { label: 'Engagement', value: `${data.stats.completionRate}%`, icon: UserCheck, color: 'green' }
      ],
      mentor: [
        { label: 'Mentees', value: data.stats.students, icon: Users, color: 'green' },
        { label: 'Sessions', value: data.stats.assignments, icon: Calendar, color: 'blue' },
        { label: 'Progress', value: `${data.stats.avgScore}%`, icon: TrendingUp, color: 'purple' },
        { label: 'Time Invested', value: `${data.stats.timeSpent}h`, icon: Clock, color: 'gray' }
      ],
      collector: [
        { label: 'Data Points', value: data.stats.assignments, icon: BarChart3, color: 'blue' },
        { label: 'Collections', value: data.stats.courses, icon: Bookmark, color: 'purple' },
        { label: 'Quality Score', value: `${data.stats.avgScore}%`, icon: CheckCircle, color: 'green' },
        { label: 'Coverage', value: `${data.stats.completionRate}%`, icon: TrendingUp, color: 'orange' }
      ],
      observer: [
        { label: 'Monitored Items', value: data.stats.assignments, icon: Bookmark, color: 'blue' },
        { label: 'Observations', value: data.stats.courses, icon: FileText, color: 'orange' },
        { label: 'Compliance', value: `${data.stats.completionRate}%`, icon: CheckCircle, color: 'green' },
        { label: 'Issues Found', value: data.stats.students, icon: AlertCircle, color: 'red' }
      ],
      qa: [
        { label: 'Reviews', value: data.stats.assignments, icon: CheckCircle, color: 'green' },
        { label: 'Quality Score', value: `${data.stats.avgScore}%`, icon: Award, color: 'yellow' },
        { label: 'Approved Items', value: data.stats.courses, icon: BookOpen, color: 'blue' },
        { label: 'Pending Review', value: data.stats.students, icon: Clock, color: 'orange' }
      ]
    };

    const currentStats = statsConfig[role] || statsConfig.student;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {currentStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className={`h-4 w-4 text-${stat.color}-600`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value || 0}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderRecentActivity = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.recentActivity.slice(0, 5).map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{activity.title}</p>
                <p className="text-xs text-gray-600">{activity.description}</p>
                <p className="text-xs text-gray-400 mt-1">{activity.timestamp}</p>
              </div>
              {activity.status && (
                <Badge variant={getStatusBadge(activity.status)}>
                  {activity.status}
                </Badge>
              )}
            </div>
          ))}
        </div>
        <Button 
          variant="outline" 
          className="w-full mt-4"
          onClick={() => handleNavigation('/activity')}
        >
          View All Activity
        </Button>
      </CardContent>
    </Card>
  );

  const renderUpcomingDeadlines = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Upcoming Deadlines
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.upcomingDeadlines?.slice(0, 5).map((deadline) => (
            <div key={deadline.id} className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex-1">
                <p className="text-sm font-medium">{deadline.title}</p>
                <p className="text-xs text-gray-600">{deadline.type}</p>
                <p className="text-xs text-gray-400">{deadline.dueDate}</p>
              </div>
              <Badge variant={getStatusBadge(deadline.status)}>
                {deadline.status}
              </Badge>
            </div>
          ))}
        </div>
        <Button 
          variant="outline" 
          className="w-full mt-4"
          onClick={() => handleNavigation('/calendar')}
        >
          View Calendar
        </Button>
      </CardContent>
    </Card>
  );

  const renderCourses = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          {role === 'teacher' ? 'My Courses' : role === 'student' ? 'Enrolled Courses' : 'Courses'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.courses?.slice(0, 4).map((course) => (
            <div key={course.id} className="p-4 rounded-lg border cursor-pointer hover:bg-gray-50"
                 onClick={() => handleNavigation(`/courses/${course.id}`)}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium">{course.title}</h4>
                  <p className="text-sm text-gray-600">{course.code}</p>
                </div>
                <Badge variant="outline">{course.role}</Badge>
              </div>
              {course.progress !== undefined && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                </div>
              )}
            </div>
          ))}
        </div>
        <Button 
          variant="outline" 
          className="w-full mt-4"
          onClick={() => handleNavigation('/courses')}
        >
          View All Courses
        </Button>
      </CardContent>
    </Card>
  );

  const renderAnnouncements = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Announcements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.announcements?.slice(0, 3).map((announcement) => (
            <div key={announcement.id} className="p-3 rounded-lg border">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-sm">{announcement.title}</h4>
                <Badge 
                  variant={announcement.priority === 'high' ? 'destructive' : 'outline'}
                  className="text-xs"
                >
                  {announcement.priority}
                </Badge>
              </div>
              <p className="text-xs text-gray-600 line-clamp-2">{announcement.content}</p>
              <p className="text-xs text-gray-400 mt-1">{announcement.createdAt}</p>
            </div>
          ))}
        </div>
        <Button 
          variant="outline" 
          className="w-full mt-4"
          onClick={() => handleNavigation('/announcements')}
        >
          View All Announcements
        </Button>
      </CardContent>
    </Card>
  );

  const renderQuickActions = () => {
    const actionConfig = {
      super_admin: [
        { label: 'System Settings', icon: Settings, path: '/admin/settings' },
        { label: 'User Management', icon: Users, path: '/admin/users' },
        { label: 'System Reports', icon: BarChart3, path: '/admin/reports' },
        { label: 'Announcements', icon: Bell, path: '/admin/announcements' }
      ],
      admin: [
        { label: 'Manage Courses', icon: BookOpen, path: '/admin/courses' },
        { label: 'User Management', icon: Users, path: '/admin/users' },
        { label: 'Reports', icon: BarChart3, path: '/admin/reports' },
        { label: 'Settings', icon: Settings, path: '/admin/settings' }
      ],
      teacher: [
        { label: 'Create Course', icon: BookOpen, path: '/courses/create' },
        { label: 'Create Assignment', icon: FileText, path: '/assignments/create' },
        { label: 'Create Lab', icon: GraduationCap, path: '/labs/create' },
        { label: 'Grade Submissions', icon: CheckCircle, path: '/grading' }
      ],
      student: [
        { label: 'Browse Courses', icon: BookOpen, path: '/courses' },
        { label: 'My Assignments', icon: FileText, path: '/assignments' },
        { label: 'Lab Activities', icon: GraduationCap, path: '/labs' },
        { label: 'My Progress', icon: TrendingUp, path: '/progress' }
      ],
      parent: [
        { label: 'View Progress', icon: TrendingUp, path: '/children/progress' },
        { label: 'Messages', icon: MessageSquare, path: '/messages' },
        { label: 'Calendar', icon: Calendar, path: '/calendar' },
        { label: 'Reports', icon: BarChart3, path: '/reports' }
      ],
      guardian: [
        { label: 'Student Progress', icon: TrendingUp, path: '/students/progress' },
        { label: 'Communications', icon: MessageSquare, path: '/messages' },
        { label: 'Schedule', icon: Calendar, path: '/schedule' },
        { label: 'Settings', icon: Settings, path: '/settings' }
      ],
      director: [
        { label: 'Program Overview', icon: BarChart3, path: '/programs' },
        { label: 'Performance Reports', icon: TrendingUp, path: '/reports' },
        { label: 'Resource Management', icon: FileText, path: '/resources' },
        { label: 'Strategic Planning', icon: Settings, path: '/planning' }
      ],
      partner: [
        { label: 'Collaborations', icon: Users, path: '/collaborations' },
        { label: 'Resources', icon: FileText, path: '/resources' },
        { label: 'Impact Reports', icon: BarChart3, path: '/reports' },
        { label: 'Communications', icon: MessageSquare, path: '/messages' }
      ],
      mentor: [
        { label: 'My Mentees', icon: Users, path: '/mentees' },
        { label: 'Schedule Session', icon: Calendar, path: '/sessions/create' },
        { label: 'Progress Review', icon: TrendingUp, path: '/progress' },
        { label: 'Resources', icon: FileText, path: '/resources' }
      ],
      collector: [
        { label: 'Data Collection', icon: BarChart3, path: '/data/collect' },
        { label: 'Export Data', icon: FileText, path: '/data/export' },
        { label: 'Quality Check', icon: CheckCircle, path: '/data/quality' },
        { label: 'Reports', icon: TrendingUp, path: '/reports' }
      ],
      observer: [
        { label: 'Observations', icon: Bookmark, path: '/observations' },
        { label: 'Reports', icon: FileText, path: '/reports' },
        { label: 'Compliance', icon: CheckCircle, path: '/compliance' },
        { label: 'Issues', icon: AlertCircle, path: '/issues' }
      ],
      qa: [
        { label: 'Review Queue', icon: CheckCircle, path: '/review' },
        { label: 'Quality Reports', icon: BarChart3, path: '/quality/reports' },
        { label: 'Standards', icon: FileText, path: '/standards' },
        { label: 'Approvals', icon: Award, path: '/approvals' }
      ]
    };

    const actions = actionConfig[role] || actionConfig.student;

    return (
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-20 flex flex-col items-center justify-center gap-2"
                onClick={() => handleNavigation(action.path)}
              >
                <action.icon className="h-5 w-5" />
                <span className="text-xs text-center">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${getRoleColor(role)} flex items-center justify-center text-white font-semibold`}>
              {data.user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {data.user.name}!</h1>
              <p className="text-gray-600 capitalize">{role.replace('_', ' ')} Dashboard</p>
            </div>
          </div>
        </div>
        <Button onClick={() => handleNavigation('/settings')}>
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>

      {/* Stats Cards */}
      {renderStatsCards()}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          {(['super_admin', 'admin', 'director'].includes(role)) && (
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {renderRecentActivity()}
            {renderUpcomingDeadlines()}
            {renderQuickActions()}
          </div>
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderCourses()}
            {renderAnnouncements()}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderRecentActivity()}
            {renderUpcomingDeadlines()}
          </div>
        </TabsContent>

        {(['super_admin', 'admin', 'director'].includes(role)) && (
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Analytics</CardTitle>
                  <CardDescription>
                    Comprehensive system performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>User Engagement</span>
                      <span className="font-semibold">{data.stats.completionRate}%</span>
                    </div>
                    <Progress value={data.stats.completionRate} />
                    
                    <div className="flex justify-between items-center">
                      <span>Course Completion</span>
                      <span className="font-semibold">{data.stats.avgScore}%</span>
                    </div>
                    <Progress value={data.stats.avgScore} />
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleNavigation('/analytics')}
                    >
                      View Detailed Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}