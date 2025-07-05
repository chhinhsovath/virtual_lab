'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import ModernSidebar from '../../components/dashboard/ModernSidebar';
import ModernSuperAdminDashboard from '../../components/dashboard/ModernSuperAdminDashboard';
import ExerciseStats from '../../components/dashboard/ExerciseStats';
import { EnhancedTeacherDashboard } from '../../components/dashboard/EnhancedTeacherDashboard';
import { useLanguage } from '../../components/LanguageProvider';
import {
  Users,
  GraduationCap,
  School,
  BookOpen,
  TrendingUp,
  Award,
  Target,
  Bell,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Activity,
  Clock,
  Sparkles,
  Menu
} from 'lucide-react';
import { motion } from 'framer-motion';

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

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const router = useRouter();
  const { t, getFontClass } = useLanguage();

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
        setLoading(false);
      }
    };

    fetchSession();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className={`mt-4 text-slate-600 ${getFontClass()}`}>{t('ui.loading_dashboard')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const stats = [
    {
      title: t('stats.total_students'),
      value: '2,156,890',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'blue',
      description: t('stats.active_learners')
    },
    {
      title: t('stats.schools'),
      value: '7,248',
      change: '+156',
      trend: 'up',
      icon: School,
      color: 'green',
      description: t('stats.participating_schools')
    },
    {
      title: t('stats.teachers'),
      value: '63,475',
      change: '+8.3%',
      trend: 'up',
      icon: BookOpen,
      color: 'purple',
      description: t('stats.certified_educators')
    },
    {
      title: t('stats.assessment_rate'),
      value: '87.4%',
      change: '+3.2%',
      trend: 'up',
      icon: Target,
      color: 'orange',
      description: t('stats.monthly_completion')
    }
  ];

  const recentActivity = [
    { id: 1, action: t('activity.new_assessment'), school: t('activity.battambang_primary'), time: '2 hours ago', type: 'assessment' },
    { id: 2, action: t('activity.teacher_training'), school: t('activity.kampong_cham'), time: '5 hours ago', type: 'training' },
    { id: 3, action: t('activity.student_progress'), school: t('activity.siem_reap'), time: '1 day ago', type: 'report' },
    { id: 4, action: t('activity.new_school'), school: t('activity.prey_veng'), time: '2 days ago', type: 'school' }
  ];

  const learningLevels = [
    { level: t('learning.beginner'), students: 45320, percentage: 35, color: 'bg-red-500' },
    { level: t('learning.letter'), students: 38640, percentage: 30, color: 'bg-orange-500' },
    { level: t('learning.word'), students: 25760, percentage: 20, color: 'bg-yellow-500' },
    { level: t('learning.paragraph'), students: 12880, percentage: 10, color: 'bg-green-500' },
    { level: t('learning.story'), students: 6440, percentage: 5, color: 'bg-blue-500' }
  ];

  // Check if user is super admin
  const isSuperAdmin = user.roles.includes('super_admin');

  // If super admin, show comprehensive dashboard
  if (isSuperAdmin) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <ModernSidebar 
          user={user} 
          onLogout={handleLogout} 
          mobileOpen={mobileMenuOpen}
          onMobileToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          onCollapsedChange={setSidebarCollapsed}
        />

        <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-80'}`}>
          {/* Top Header */}
          <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4">
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
                
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900 font-hanuman">
                    Welcome back, {user.firstName || user.username}! ✨
                  </h1>
                  <p className="text-sm text-gray-600 mt-1 hidden sm:block font-hanuman">
                    Super Admin Dashboard - Complete System Overview
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
                </Button>
                <div className="text-right">
                  <p className={`text-sm font-medium text-gray-900 ${getFontClass()}`}>
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  <p className={`text-xs text-gray-600 ${getFontClass()}`}>
                    {t('ui.today')}
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* Super Admin Dashboard Content */}
          <main className="flex-1 p-4 md:p-8">
            <ModernSuperAdminDashboard />
          </main>
        </div>
      </div>
    );
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
        <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4">
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
              
              <div>
                <h1 className={`text-xl md:text-2xl font-bold text-gray-900 ${getFontClass()}`}>
                  {t('dashboard.welcome')}, {user.firstName || user.username}! ✨
                </h1>
                <p className={`text-sm text-gray-600 mt-1 hidden sm:block ${getFontClass()}`}>
                  {t('dashboard.today')}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
              </Button>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
                <p className="text-xs text-gray-600 font-hanuman">
                  ថ្ងៃនេះ
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className="flex-1 p-4 md:p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-0 bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-lg ${
                        stat.color === 'blue' ? 'bg-blue-50' :
                        stat.color === 'green' ? 'bg-green-50' :
                        stat.color === 'purple' ? 'bg-purple-50' :
                        'bg-orange-50'
                      }`}>
                        <stat.icon className={`h-6 w-6 ${
                          stat.color === 'blue' ? 'text-blue-600' :
                          stat.color === 'green' ? 'text-green-600' :
                          stat.color === 'purple' ? 'text-purple-600' :
                          'text-orange-600'
                        }`} />
                      </div>
                      <div className={`flex items-center text-sm ${
                        stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.trend === 'up' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                        <span className="font-medium">{stat.change}</span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                    <p className="text-sm text-gray-600 mt-1">{stat.title}</p>
                    <p className="text-xs text-gray-500 mt-2">{stat.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Charts and Activity Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            {/* Learning Levels Chart */}
            <Card className="lg:col-span-2 border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className={getFontClass()}>{t('learning.levels')}</span>
                  <Button variant="outline" size="sm">
                    <span className={getFontClass()}>{t('learning.view_details')}</span>
                  </Button>
                </CardTitle>
                <CardDescription className={getFontClass()}>
                  {t('learning.distribution')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {learningLevels.map((level) => (
                    <div key={level.level}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline" className="font-medium">
                            {level.level}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {level.students.toLocaleString()} students
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {level.percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`${level.color} h-3 rounded-full transition-all duration-500`}
                          style={{ width: `${level.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className={getFontClass()}>{t('dashboard.recent_activity')}</span>
                  <Activity className="h-5 w-5 text-gray-400" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${
                        activity.type === 'assessment' ? 'bg-blue-100' :
                        activity.type === 'training' ? 'bg-purple-100' :
                        activity.type === 'report' ? 'bg-green-100' :
                        'bg-orange-100'
                      }`}>
                        {activity.type === 'assessment' && <GraduationCap className="h-4 w-4 text-blue-600" />}
                        {activity.type === 'training' && <Award className="h-4 w-4 text-purple-600" />}
                        {activity.type === 'report' && <BarChart3 className="h-4 w-4 text-green-600" />}
                        {activity.type === 'school' && <School className="h-4 w-4 text-orange-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-xs text-gray-600">{activity.school}</p>
                        <p className="text-xs text-gray-500 flex items-center mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className={getFontClass()}>{t('dashboard.quick_actions')}</CardTitle>
              <CardDescription className={getFontClass()}>
                Common tasks based on your role and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {user.permissions.includes('assessments.create') && (
                  <Button variant="outline" className="h-24 flex-col space-y-2 hover:bg-blue-50 hover:border-blue-300">
                    <Sparkles className="h-6 w-6 text-blue-600" />
                    <span className={getFontClass()}>{t('action.new_assessment')}</span>
                  </Button>
                )}
                
                {user.permissions.includes('students.read') && (
                  <Button variant="outline" className="h-24 flex-col space-y-2 hover:bg-green-50 hover:border-green-300">
                    <Users className="h-6 w-6 text-green-600" />
                    <span className={getFontClass()}>{t('action.view_students')}</span>
                  </Button>
                )}
                
                {user.permissions.includes('reports.read') && (
                  <Button variant="outline" className="h-24 flex-col space-y-2 hover:bg-purple-50 hover:border-purple-300">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                    <span className={getFontClass()}>{t('action.analytics')}</span>
                  </Button>
                )}
                
                {user.permissions.includes('teachers.read') && (
                  <Button variant="outline" className="h-24 flex-col space-y-2 hover:bg-orange-50 hover:border-orange-300">
                    <BookOpen className="h-6 w-6 text-orange-600" />
                    <span className={getFontClass()}>{t('action.teachers')}</span>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Teacher Dashboard */}
          {user.roles.includes('teacher') && (
            <div className="mt-6">
              <EnhancedTeacherDashboard user={user} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}