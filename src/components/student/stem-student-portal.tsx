'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '../../lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { useLanguage } from '../LanguageProvider';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  FlaskConical,
  Waves,
  Atom,
  Brain,
  BarChart3,
  Beaker,
  Play,
  Clock,
  Star,
  Award,
  Target,
  BookOpen,
  Users,
  Calendar,
  TrendingUp,
  CheckCircle,
  Circle,
  GraduationCap,
  Zap,
  Globe,
  Trophy,
  Sparkles,
  Eye,
  Heart,
  User as UserIcon,
  LogOut
} from 'lucide-react';

interface STEMStudentPortalProps {
  user: User;
}

// Icon mapping for simulations
const iconMap: Record<string, any> = {
  'Physics': Waves,
  'Chemistry': Atom,
  'Biology': Brain,
  'Mathematics': BarChart3,
  'pendulum-lab': Waves,
  'circuit-construction-kit': Zap,
  'build-a-molecule': Atom,
  'gene-expression-essentials': Brain,
  'function-builder': BarChart3,
  'graphing-lines': BarChart3,
  'wave-interference': Waves,
  'natural-selection': Brain,
  'ph-scale': Beaker
};

// Color mapping for subjects
const colorMap: Record<string, string> = {
  'Physics': 'blue',
  'Chemistry': 'green', 
  'Biology': 'purple',
  'Mathematics': 'orange'
};

interface SimulationProgress {
  id: string;
  simulation_name: string;
  display_name_en: string;
  display_name_km: string;
  subject_area: string;
  difficulty_level: string;
  progress_percentage: number;
  time_spent: number; // minutes
  attempts: number;
  best_score: number;
  completed: boolean;
  last_accessed: Date;
}

interface Assignment {
  id: string;
  title: string;
  simulation_id: string;
  simulation_name: string;
  subject: string;
  due_date: Date;
  instructions: string;
  status: 'pending' | 'in_progress' | 'completed' | 'late';
  score?: number;
  max_score: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  unlocked_at: Date;
  points: number;
}

export function STEMStudentPortal({ user }: STEMStudentPortalProps) {
  const router = useRouter();
  const [simulations, setSimulations] = useState<SimulationProgress[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { t, getFontClass } = useLanguage();

  useEffect(() => {
    loadStudentData();
  }, []);

  const startSimulation = async (simulationId: string, assignmentId?: string) => {
    try {
      // Navigate to the simulation page
      window.location.href = `/simulation/${simulationId}${assignmentId ? `?assignment=${assignmentId}` : ''}`;
    } catch (error) {
      console.error('Error starting simulation:', error);
    }
  };

  const loadStudentData = async () => {
    try {
      // Fetch real student data
      const [progressResponse, assignmentsResponse, achievementsResponse, analyticsResponse] = await Promise.all([
        fetch('/api/student/progress', { credentials: 'include' }),
        fetch('/api/assignments', { credentials: 'include' }),
        fetch('/api/achievements', { credentials: 'include' }),
        fetch('/api/analytics/student', { credentials: 'include' })
      ]);

      // Load student progress
      if (progressResponse.ok) {
        const progressData = await progressResponse.json();
        if (progressData.success) {
          const transformedSims: SimulationProgress[] = progressData.progress.map((sim: any) => ({
            id: sim.id,
            simulation_name: sim.simulation_name,
            display_name_en: sim.display_name_en,
            display_name_km: sim.display_name_km,
            subject_area: sim.subject_area,
            difficulty_level: sim.difficulty_level,
            progress_percentage: sim.progress_percentage || 0,
            time_spent: sim.total_time_spent || 0,
            attempts: sim.attempts_count || 0,
            best_score: sim.best_score ? parseFloat(sim.best_score) : 0,
            completed: sim.status === 'completed',
            last_accessed: new Date(sim.updated_at)
          }));
          setSimulations(transformedSims);
        }
      }

      // Load assignments
      if (assignmentsResponse.ok) {
        const assignmentsData = await assignmentsResponse.json();
        if (assignmentsData.success) {
          const transformedAssignments: Assignment[] = assignmentsData.assignments.map((assignment: any) => ({
            id: assignment.id,
            title: assignment.title,
            simulation_id: assignment.simulation_id,
            simulation_name: assignment.display_name_en,
            subject: assignment.subject_area || 'General',
            due_date: new Date(assignment.due_date),
            instructions: assignment.instructions_en || assignment.description || '',
            status: assignment.submission_status || 'pending',
            score: assignment.student_score ? parseFloat(assignment.student_score) : undefined,
            max_score: parseFloat(assignment.max_score || 100)
          }));
          setAssignments(transformedAssignments);
        }
      }

      // Load achievements
      if (achievementsResponse.ok) {
        const achievementsData = await achievementsResponse.json();
        if (achievementsData.success) {
          const transformedAchievements: Achievement[] = achievementsData.achievements.map((ach: any) => ({
            id: ach.id,
            title: ach.achievement_name || ach.name,
            description: ach.description_en,
            icon: ach.badge_icon || 'trophy',
            category: ach.achievement_type || 'general',
            unlocked_at: new Date(ach.earned_at),
            points: ach.points_earned || ach.points || 0
          }));
          setAchievements(transformedAchievements);
        }
      }

      // Load analytics/stats
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        if (analyticsData.success) {
          setStats({
            total_simulations: analyticsData.analytics.overall_stats.simulations_attempted || 0,
            completed_simulations: analyticsData.analytics.overall_stats.simulations_completed || 0,
            total_time: analyticsData.analytics.overall_stats.total_time_minutes || 0,
            average_score: analyticsData.analytics.overall_stats.average_score || 0,
            total_achievements: analyticsData.analytics.overall_stats.achievements_earned || 0,
            total_points: analyticsData.analytics.overall_stats.total_points || 0
          });
        }
      }

      // If no API responses were successful, use mock data
      if (!progressResponse.ok && !assignmentsResponse.ok && !achievementsResponse.ok) {
        console.warn('All APIs failed, using mock data');
        loadMockData();
      }

    } catch (error) {
      console.error('Error loading student data:', error);
      // Fallback to mock data
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    const mockSimulations: SimulationProgress[] = [
      {
        id: '1',
        simulation_name: 'pendulum-lab',
        display_name_en: 'Pendulum Lab',
        display_name_km: 'ភេនឌុលម៉ាម',
        subject_area: 'Physics',
        difficulty_level: 'Intermediate',
        progress_percentage: 75,
        time_spent: 45,
        attempts: 3,
        best_score: 8.5,
        completed: false,
        last_accessed: new Date('2024-01-15')
      },
      {
        id: '2',
        simulation_name: 'build-a-molecule',
        display_name_en: 'Build a Molecule',
        display_name_km: 'បង្កើតម៉ូលេគុល',
        subject_area: 'Chemistry',
        difficulty_level: 'Beginner',
        progress_percentage: 100,
        time_spent: 30,
        attempts: 2,
        best_score: 9.2,
        completed: true,
        last_accessed: new Date('2024-01-12')
      },
      {
        id: '3',
        simulation_name: 'circuit-construction-kit',
        display_name_en: 'Circuit Construction Kit',
        display_name_km: 'បង្កើតសៀគ្វីអគ្គិសនី',
        subject_area: 'Physics',
        difficulty_level: 'Beginner',
        progress_percentage: 60,
        time_spent: 25,
        attempts: 2,
        best_score: 7.8,
        completed: false,
        last_accessed: new Date('2024-01-14')
      }
    ];

    const mockAssignments: Assignment[] = [
      {
        id: '1',
        title: 'Explore Pendulum Motion',
        simulation_id: '1',
        simulation_name: 'Pendulum Lab',
        subject: 'Physics',
        due_date: new Date('2024-01-20'),
        instructions: 'Complete the pendulum simulation and answer the reflection questions about period and frequency.',
        status: 'in_progress',
        score: 8.5,
        max_score: 10
      },
      {
        id: '2',
        title: 'Molecular Bonding Lab',
        simulation_id: '2',
        simulation_name: 'Build a Molecule',
        subject: 'Chemistry',
        due_date: new Date('2024-01-18'),
        instructions: 'Build 5 different molecules and explain their bonding patterns.',
        status: 'completed',
        score: 9.2,
        max_score: 10
      }
    ];

    const mockAchievements: Achievement[] = [
      {
        id: '1',
        title: 'First Steps in Chemistry',
        description: 'Completed your first chemistry simulation',
        icon: '🧪',
        category: 'Chemistry',
        unlocked_at: new Date('2024-01-12'),
        points: 10
      },
      {
        id: '2',
        title: 'Physics Explorer',
        description: 'Spent 1 hour exploring physics simulations',
        icon: '⚡',
        category: 'Physics',
        unlocked_at: new Date('2024-01-15'),
        points: 20
      }
    ];

    setSimulations(mockSimulations);
    setAssignments(mockAssignments);
    setAchievements(mockAchievements);
    
    // Calculate stats from mock data
    const totalTime = mockSimulations.reduce((sum, sim) => sum + sim.time_spent, 0);
    const avgScore = mockSimulations.reduce((sum, sim) => sum + sim.best_score, 0) / mockSimulations.length;
    const completedCount = mockSimulations.filter(sim => sim.completed).length;
    
    setStats({
      total_simulations: mockSimulations.length,
      completed_simulations: completedCount,
      total_time: totalTime,
      average_score: avgScore.toFixed(1),
      total_achievements: mockAchievements.length,
      total_points: mockAchievements.reduce((sum, ach) => sum + ach.points, 0)
    });
  };

  const getSubjectStats = () => {
    const subjects = ['Physics', 'Chemistry', 'Biology', 'Mathematics'];
    return subjects.map(subject => {
      const subjectSims = simulations.filter(sim => sim.subject_area === subject);
      const completed = subjectSims.filter(sim => sim.completed).length;
      const avgScore = subjectSims.length > 0 
        ? subjectSims.reduce((sum, sim) => sum + sim.best_score, 0) / subjectSims.length 
        : 0;
      
      return {
        subject,
        total: subjectSims.length,
        completed,
        progress: subjectSims.length > 0 ? (completed / subjectSims.length) * 100 : 0,
        avgScore: avgScore.toFixed(1),
        icon: iconMap[subject],
        color: colorMap[subject]
      };
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <FlaskConical className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className={`text-blue-700 font-medium ${getFontClass()}`}>{t('student.loading_journey')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-white">
                <AvatarFallback className="bg-white text-blue-600 text-xl font-bold">
                  {user.name?.split(' ').map(n => n[0]).join('') || 'S'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className={`text-2xl font-bold flex items-center gap-2 ${getFontClass()}`}>
                  <Sparkles className="h-6 w-6" />
                  {t('student.welcome')}, {user.name?.split(' ')[0] || 'Student'}!
                </h1>
                <p className={`text-blue-100 font-medium ${getFontClass()}`}>
                  {t('student.portal_subtitle')}
                </p>
                <div className="mt-2 flex items-center gap-4 text-sm">
                  <span>📊 Avg Score: {stats?.average_score}/10</span>
                  <span>•</span>
                  <span>⏱️ {stats?.total_time}min learned</span>
                  <span>•</span>
                  <span>🏆 {stats?.total_points} points</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-4 w-4" />
                <span className={`text-sm ${getFontClass()}`}>{t('student.vlab_cambodia')}</span>
              </div>
              <div className="flex items-center gap-3">
                <LanguageSwitcher />
                <Button 
                  variant="ghost" 
                  className="text-white hover:bg-white/20"
                  onClick={() => router.push('/student/profile')}
                >
                  <UserIcon className="h-5 w-5 mr-2" />
                  <span className="font-hanuman">ព័ត៌មានផ្ទាល់ខ្លួន</span>
                </Button>
                <Button 
                  variant="ghost" 
                  className="text-white hover:bg-white/20"
                  onClick={async () => {
                    try {
                      // Call logout API
                      const response = await fetch('/api/auth/logout', { 
                        method: 'POST', 
                        credentials: 'include' 
                      });
                      
                      if (response.ok) {
                        // Force a hard redirect to clear all client-side state
                        window.location.href = '/';
                      } else {
                        console.error('Logout failed');
                        // Still redirect even if logout API fails
                        window.location.href = '/';
                      }
                    } catch (error) {
                      console.error('Logout error:', error);
                      // Force redirect even on error
                      window.location.href = '/';
                    }
                  }}
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  <span className="font-hanuman">ចាកចេញ</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Simulations</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {stats?.completed_simulations}/{stats?.total_simulations}
                  </p>
                </div>
                <FlaskConical className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Average Score</p>
                  <p className="text-2xl font-bold text-green-900">{stats?.average_score}/10</p>
                </div>
                <Star className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Learning Time</p>
                  <p className="text-2xl font-bold text-purple-900">{stats?.total_time}min</p>
                </div>
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700">Achievements</p>
                  <p className="text-2xl font-bold text-orange-900">{stats?.total_achievements}</p>
                </div>
                <Trophy className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-5 h-auto p-1">
            <TabsTrigger 
              value="dashboard" 
              className={`${getFontClass()} relative flex items-center justify-center gap-2 py-3 px-4 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 transition-all duration-200`}
            >
              <BarChart3 className="h-4 w-4" />
              {t('tab.dashboard')}
              <Badge className="absolute -top-1 -right-1 h-2 w-2 p-0 bg-blue-500 data-[state=active]:bg-white data-[state=active]:text-blue-600" />
            </TabsTrigger>
            <TabsTrigger 
              value="simulations" 
              className={`${getFontClass()} relative flex items-center justify-center gap-2 py-3 px-4 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 transition-all duration-200`}
            >
              <Beaker className="h-4 w-4" />
              {t('tab.my_simulations')}
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 bg-blue-500 text-white text-xs flex items-center justify-center data-[state=active]:bg-white data-[state=active]:text-blue-600">
                {stats?.completed_simulations || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="assignments" 
              className={`${getFontClass()} relative flex items-center justify-center gap-2 py-3 px-4 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 transition-all duration-200`}
            >
              <Target className="h-4 w-4" />
              {t('tab.assignments')}
              {assignments.filter(a => a.status !== 'completed').length > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 bg-red-500 text-white text-xs flex items-center justify-center data-[state=active]:bg-white data-[state=active]:text-red-600">
                  {assignments.filter(a => a.status !== 'completed').length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="achievements" 
              className={`${getFontClass()} relative flex items-center justify-center gap-2 py-3 px-4 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 transition-all duration-200`}
            >
              <Trophy className="h-4 w-4" />
              {t('tab.achievements')}
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 bg-yellow-500 text-white text-xs flex items-center justify-center data-[state=active]:bg-white data-[state=active]:text-yellow-600">
                {stats?.total_achievements || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="subjects" 
              className={`${getFontClass()} relative flex items-center justify-center gap-2 py-3 px-4 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 transition-all duration-200`}
            >
              <BookOpen className="h-4 w-4" />
              {t('tab.subjects')}
              <Badge className="absolute -top-1 -right-1 h-2 w-2 p-0 bg-green-500 data-[state=active]:bg-white" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Current Assignments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Current Assignments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {assignments.filter(a => a.status !== 'completed').map((assignment) => (
                      <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{assignment.title}</p>
                          <p className="text-sm text-gray-500">{assignment.simulation_name}</p>
                          <p className="text-xs text-gray-400">
                            Due: {assignment.due_date.toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={assignment.status === 'pending' ? 'destructive' : 'default'}>
                            {assignment.status}
                          </Badge>
                          <Button 
                            size="sm" 
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => startSimulation(assignment.simulation_id, assignment.id)}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Start
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {simulations.slice(0, 3).map((sim) => (
                      <div key={sim.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className={`w-10 h-10 rounded-lg bg-${colorMap[sim.subject_area]}-100 flex items-center justify-center`}>
                          {React.createElement(iconMap[sim.simulation_name] || iconMap[sim.subject_area], { 
                            className: `h-5 w-5 text-${colorMap[sim.subject_area]}-600` 
                          })}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{sim.display_name_en}</p>
                          <p className="text-sm text-gray-500">{sim.display_name_km}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={sim.progress_percentage} className="flex-1 h-2" />
                            <span className="text-xs text-gray-500">{sim.progress_percentage}%</span>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => startSimulation(sim.id)}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="simulations" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {simulations.map((sim) => (
                <Card key={sim.id} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className={`w-12 h-12 rounded-xl bg-${colorMap[sim.subject_area]}-100 flex items-center justify-center mb-3`}>
                        {React.createElement(iconMap[sim.simulation_name] || iconMap[sim.subject_area], { 
                          className: `h-6 w-6 text-${colorMap[sim.subject_area]}-600` 
                        })}
                      </div>
                      {sim.completed && (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg leading-tight">
                      {sim.display_name_en}
                      <p className="text-sm font-normal text-gray-600 mt-1">{sim.display_name_km}</p>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress:</span>
                        <span>{sim.progress_percentage}%</span>
                      </div>
                      <Progress value={sim.progress_percentage} className="h-2" />
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{sim.time_spent}min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        <span>{sim.best_score}/10</span>
                      </div>
                      <Badge variant="outline">
                        {sim.difficulty_level}
                      </Badge>
                    </div>
                    
                    <Button 
                      className={`w-full bg-${colorMap[sim.subject_area]}-600 hover:bg-${colorMap[sim.subject_area]}-700`}
                      onClick={() => startSimulation(sim.id)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {sim.completed ? 'Review' : 'Continue'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="assignments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Simulation Assignments</CardTitle>
                <CardDescription>Complete these assignments to master STEM concepts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assignments.map((assignment) => (
                    <div key={assignment.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{assignment.title}</h4>
                          <p className="text-sm text-gray-600">{assignment.simulation_name} • {assignment.subject}</p>
                          <p className="text-xs text-gray-500 mt-1">Due: {assignment.due_date.toLocaleDateString()}</p>
                        </div>
                        <Badge variant={
                          assignment.status === 'completed' ? 'default' :
                          assignment.status === 'in_progress' ? 'secondary' :
                          assignment.status === 'late' ? 'destructive' : 'outline'
                        }>
                          {assignment.status}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-3">{assignment.instructions}</p>
                      
                      <div className="flex items-center justify-between">
                        {assignment.score !== undefined ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Score:</span>
                            <span className="font-bold">{assignment.score}/{assignment.max_score}</span>
                            <Badge variant="secondary">
                              {Math.round((assignment.score / assignment.max_score) * 100)}%
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Not submitted</span>
                        )}
                        
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                          {assignment.status !== 'completed' && (
                            <Button 
                              size="sm" 
                              className="bg-blue-600 hover:bg-blue-700"
                              onClick={() => startSimulation(assignment.simulation_id, assignment.id)}
                            >
                              <Play className="h-4 w-4 mr-1" />
                              {assignment.status === 'in_progress' ? 'Continue' : 'Start'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Your Achievements
                </CardTitle>
                <CardDescription>
                  Unlock badges as you explore and master STEM concepts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.map((achievement) => (
                    <div key={achievement.id} className="border rounded-lg p-4 text-center">
                      <div className="text-4xl mb-2">{achievement.icon}</div>
                      <h4 className="font-semibold mb-1">{achievement.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                      <div className="flex items-center justify-between text-xs">
                        <Badge variant="secondary">{achievement.category}</Badge>
                        <span className="text-blue-600 font-medium">+{achievement.points} pts</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {achievement.unlocked_at.toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subjects" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {getSubjectStats().map((subject) => (
                <Card key={subject.subject} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="text-center">
                    <div className={`w-16 h-16 mx-auto rounded-2xl bg-${subject.color}-100 flex items-center justify-center mb-4`}>
                      {React.createElement(subject.icon, { className: `h-8 w-8 text-${subject.color}-600` })}
                    </div>
                    <CardTitle className="text-xl">{subject.subject}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{subject.completed}/{subject.total}</p>
                      <p className="text-sm text-gray-500">Simulations Completed</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress:</span>
                        <span>{Math.round(subject.progress)}%</span>
                      </div>
                      <Progress value={subject.progress} className="h-2" />
                    </div>
                    
                    <div className="text-center">
                      <p className="text-lg font-semibold">{subject.avgScore}/10</p>
                      <p className="text-sm text-gray-500">Average Score</p>
                    </div>
                    
                    <Button variant="outline" className="w-full">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Explore {subject.subject}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}