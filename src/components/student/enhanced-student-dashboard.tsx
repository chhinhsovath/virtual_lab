'use client';

import { useEffect, useState } from 'react';
import { User } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, 
  Clock, 
  Award, 
  TrendingUp, 
  Calendar, 
  Target,
  Play,
  CheckCircle,
  XCircle,
  BarChart3,
  Activity,
  History,
  Eye,
  ArrowRight,
  Sparkles,
  FlaskConical,
  Atom,
  Brain,
  Waves,
  Zap,
  LogOut,
  User as UserIcon,
  Settings,
  Bell,
  Star,
  Globe,
  Menu,
  Search,
  Filter,
  Users,
  GraduationCap,
  Trophy
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface StudentStats {
  simulations_attempted: number;
  simulations_completed: number;
  total_time_minutes: number;
  average_score: number;
  achievements_earned: number;
  total_points: number;
}

interface SimulationProgress {
  id: string;
  simulation_name: string;
  display_name_en: string;
  display_name_km: string;
  subject_area: string;
  difficulty_level: string;
  status: 'completed' | 'in_progress' | 'not_started';
  progress_percentage: number;
  total_time_spent: number;
  attempts_count: number;
  best_score: number;
  updated_at: string;
}

interface RecentActivity {
  id: string;
  type: 'simulation_start' | 'simulation_complete' | 'exercise_submit';
  simulation_name: string;
  timestamp: string;
  score?: number;
  duration?: number;
}

interface EnhancedStudentDashboardProps {
  user: User;
}

// Icon mapping for subjects
const subjectIcons: Record<string, any> = {
  'Physics': Waves,
  'Chemistry': Atom,
  'Biology': Brain,
  'Mathematics': BarChart3
};

// Color mapping for subjects
const subjectColors: Record<string, string> = {
  'Physics': 'blue',
  'Chemistry': 'green',
  'Biology': 'purple',
  'Mathematics': 'orange'
};

const difficultyColors = {
  "Beginner": "bg-green-100 text-green-800",
  "Intermediate": "bg-yellow-100 text-yellow-800", 
  "Advanced": "bg-red-100 text-red-800"
};

export function EnhancedStudentDashboard({ user }: EnhancedStudentDashboardProps) {
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [progress, setProgress] = useState<SimulationProgress[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const router = useRouter();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch analytics data
        const [analyticsRes, progressRes] = await Promise.all([
          fetch('/api/analytics/student', { credentials: 'include' }),
          fetch('/api/student/progress?limit=20', { credentials: 'include' })
        ]);

        if (analyticsRes.ok) {
          const analyticsData = await analyticsRes.json();
          setStats(analyticsData.analytics.overall_stats);
          setRecentActivity(analyticsData.analytics.recent_activity || []);
        }

        if (progressRes.ok) {
          const progressData = await progressRes.json();
          setProgress(progressData.progress || []);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = async () => {
    try {
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
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'in_progress': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'បានបញ្ចប់';
      case 'in_progress': return 'កំពុងដំណើរការ';
      default: return 'មិនទាន់ចាប់ផ្តើម';
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner':
      case 'easy': return 'bg-green-100 text-green-800';
      case 'intermediate':
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredProgress = progress.filter(sim => {
    const matchesSubject = selectedSubject === "All" || sim.subject_area === selectedSubject;
    const matchesSearch = sim.display_name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         sim.display_name_km.includes(searchQuery);
    return matchesSubject && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100">
        <div className="text-center">
          <div className="relative">
            <FlaskConical className="h-20 w-20 text-purple-600 mx-auto mb-4 animate-bounce" />
            <Sparkles className="h-8 w-8 text-yellow-400 absolute top-0 right-0 animate-pulse" />
            <Star className="h-6 w-6 text-pink-400 absolute bottom-0 left-0 animate-spin" />
          </div>
          <p className="mt-4 text-purple-700 font-bold text-xl font-hanuman animate-pulse">កំពុងផ្ទុកផ្ទាំងគ្រប់គ្រងរបស់អ្នក...</p>
          <div className="flex justify-center mt-4 space-x-2">
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100 relative overflow-hidden">
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-purple-300 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 -left-20 w-80 h-80 bg-pink-300 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 right-1/3 w-48 h-48 bg-blue-300 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      {/* Navigation */}
      <nav className="border-b bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-lg relative">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between h-14 sm:h-16 items-center">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative group">
                <FlaskConical className="h-8 w-8 sm:h-10 sm:w-10 text-purple-600 transform group-hover:rotate-12 transition-transform" />
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 absolute -top-1 -right-1 sm:-top-2 sm:-right-2 animate-pulse" />
                <Star className="h-3 w-3 text-pink-500 absolute -bottom-1 -left-1 animate-ping" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent animate-gradient-x truncate">
                  <span className="hidden sm:inline">Virtual Lab Cambodia</span>
                  <span className="sm:hidden">Lab</span>
                </h1>
                <p className="text-xs sm:text-sm text-purple-600 font-bold font-hanuman truncate">🚀 វិទ្យាល័យសិស្ស</p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="relative h-8 w-8 sm:h-10 sm:w-10"
                onClick={() => router.push('/student/messages')}
              >
                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="absolute -top-1 -right-1 h-2 w-2 sm:h-3 sm:w-3 bg-red-500 rounded-full animate-pulse"></span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => router.push('/student/profile')}
                className="flex items-center gap-1 sm:gap-2 h-8 sm:h-10 px-2 sm:px-3"
              >
                <UserIcon className="h-4 w-4" />
                <span className="hidden md:inline text-sm">{user.username}</span>
              </Button>
              <Button
                variant="ghost"
                className="flex items-center gap-1 sm:gap-2 h-8 sm:h-10 px-2 sm:px-3"
                onClick={() => {/* Toggle language */}}
              >
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline text-sm">ភាសាខ្មែរ</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-red-600 hover:bg-red-50 h-8 w-8 sm:h-10 sm:w-10"
              >
                <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Header Section */}
      <section className="py-4 sm:py-6 lg:py-8 px-2 sm:px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border-2 border-purple-200 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full -mr-10 -mt-10 sm:-mr-16 sm:-mt-16 opacity-50"></div>
            <div className="flex flex-col gap-4 sm:gap-6">
              <div className="text-center sm:text-left">
                <h1 className="text-xl sm:text-2xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2 font-hanuman animate-gradient-x">
                  សូមស្វាគមន៍ {user.firstName || user.username}! 🌟
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-purple-700 font-semibold font-hanuman">ត្រលប់មកវិញហើយ អ្នករៀនពូកែ! ត្រៀមខ្លួនសម្រាប់ដំណើរផ្សងព្រេងថ្ងៃនេះហើយឬនៅ? 🚀</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button
                  onClick={() => router.push('/simulations')}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-sm sm:text-base lg:text-lg px-4 sm:px-6 py-2 sm:py-3 transform hover:scale-105 transition-all shadow-lg font-hanuman w-full sm:w-auto"
                >
                  <Play className="h-4 w-4 sm:h-5 sm:w-5 mr-2 animate-pulse" />
                  ស្វែងរកការពិសោធន៍ 🧪
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/student/history')}
                  className="border-2 border-purple-400 text-purple-600 hover:bg-purple-50 text-sm sm:text-base lg:text-lg px-4 sm:px-6 py-2 sm:py-3 transform hover:scale-105 transition-all font-hanuman w-full sm:w-auto"
                >
                  <History className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  ដំណើររបស់ខ្ញុំ 📚
                </Button>
              </div>
            </div>

            {/* Stats Overview */}
            {stats && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4 mt-4 sm:mt-6 lg:mt-8">
                <div className="text-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl sm:rounded-2xl p-2 sm:p-4 transform hover:scale-110 transition-all cursor-pointer">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-black text-blue-600 animate-pulse">{stats.simulations_attempted}</div>
                  <div className="text-xs sm:text-sm text-blue-700 font-bold font-hanuman">ព្យាយាម 🎯</div>
                </div>
                <div className="text-center bg-gradient-to-br from-green-50 to-green-100 rounded-xl sm:rounded-2xl p-2 sm:p-4 transform hover:scale-110 transition-all cursor-pointer">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-black text-green-600 animate-pulse">{stats.simulations_completed}</div>
                  <div className="text-xs sm:text-sm text-green-700 font-bold font-hanuman">បានបញ្ចប់ ✅</div>
                </div>
                <div className="text-center bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl sm:rounded-2xl p-2 sm:p-4 transform hover:scale-110 transition-all cursor-pointer">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-black text-purple-600 animate-pulse">{formatDuration(stats.total_time_minutes)}</div>
                  <div className="text-xs sm:text-sm text-purple-700 font-bold font-hanuman">ពេលវេលាសរុប ⏰</div>
                </div>
                <div className="text-center bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl sm:rounded-2xl p-2 sm:p-4 transform hover:scale-110 transition-all cursor-pointer">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-black text-orange-600 animate-pulse">{Math.round(stats.average_score)}%</div>
                  <div className="text-xs sm:text-sm text-orange-700 font-bold font-hanuman">ពិន្ទុមធ្យម 📊</div>
                </div>
                <div className="text-center bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-4 transform hover:scale-110 transition-all cursor-pointer">
                  <div className="text-3xl font-black text-pink-600 animate-pulse">{stats.achievements_earned}</div>
                  <div className="text-sm text-pink-700 font-bold font-hanuman">សមិទ្ធិផល 🏆</div>
                </div>
                <div className="text-center bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-4 transform hover:scale-110 transition-all cursor-pointer">
                  <div className="text-3xl font-black text-indigo-600 animate-pulse">{Math.round(stats.total_points).toLocaleString('km-KH')}</div>
                  <div className="text-sm text-indigo-700 font-bold font-hanuman">ពិន្ទុសរុប 💎</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-2 sm:px-4 pb-16">
        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="simulations" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-4 sm:mb-6 bg-white/80 backdrop-blur rounded-2xl sm:rounded-full p-1 shadow-lg overflow-hidden">
              <TabsTrigger value="simulations" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white rounded-xl sm:rounded-full font-bold transition-all data-[state=active]:scale-105 font-hanuman text-xs sm:text-sm px-2 py-2">
                <FlaskConical className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">ការពិសោធន៍</span>
                <span className="sm:hidden">ពិសោធ</span>
              </TabsTrigger>
              <TabsTrigger value="progress" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white rounded-full font-bold transition-all data-[state=active]:scale-105 font-hanuman">
                <TrendingUp className="h-5 w-5 mr-2" />
                វឌ្ឍនភាពរបស់ខ្ញុំ
              </TabsTrigger>
              <TabsTrigger value="activity" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white rounded-full font-bold transition-all data-[state=active]:scale-105 font-hanuman">
                <Activity className="h-5 w-5 mr-2" />
                កំណត់ត្រា
              </TabsTrigger>
              <TabsTrigger value="achievements" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white rounded-full font-bold transition-all data-[state=active]:scale-105 font-hanuman">
                <Award className="h-5 w-5 mr-2" />
                ស្លាកសញ្ញា
              </TabsTrigger>
            </TabsList>

            <TabsContent value="simulations" className="space-y-6">
              {/* Search and Filter */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <Input
                        placeholder="Search simulations... / ស្វែងរកការធ្វើត្រាប់តាម..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex gap-2">
                      {['All', 'Physics', 'Chemistry', 'Biology', 'Mathematics'].map((subject) => (
                        <Button
                          key={subject}
                          variant={selectedSubject === subject ? "default" : "outline"}
                          onClick={() => setSelectedSubject(subject)}
                          size="sm"
                          className={selectedSubject === subject ? 'bg-blue-600' : ''}
                        >
                          {subject === 'All' ? 'ទាំងអស់' : subject}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Simulations Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProgress.map((sim) => {
                  const SubjectIcon = subjectIcons[sim.subject_area] || BookOpen;
                  const subjectColor = subjectColors[sim.subject_area] || 'gray';
                  
                  return (
                    <Card 
                      key={sim.id} 
                      className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group cursor-pointer border-2 border-transparent hover:border-purple-300 bg-gradient-to-br from-white to-purple-50"
                      onClick={() => router.push(`/simulation/${sim.id}`)}
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-${subjectColor}-100 to-${subjectColor}-200 flex items-center justify-center mb-3 group-hover:scale-110 transition-all shadow-lg`}>
                            <SubjectIcon className={`h-7 w-7 text-${subjectColor}-600 group-hover:animate-pulse`} />
                          </div>
                          <Badge className={`${getDifficultyColor(sim.difficulty_level)} font-bold animate-pulse`}>
                            {sim.difficulty_level} ✨
                          </Badge>
                        </div>
                        <CardTitle className="text-lg leading-tight">
                          <span className="font-black text-purple-800">{sim.display_name_km}</span>
                          <p className="text-sm font-semibold text-purple-600 mt-1">{sim.display_name_en}</p>
                        </CardTitle>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-hanuman">វឌ្ឍនភាព</span>
                            <span>{sim.progress_percentage}%</span>
                          </div>
                          <Progress value={sim.progress_percentage} className="h-3 bg-purple-100" />
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{formatDuration(sim.total_time_spent)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Target className="h-4 w-4" />
                              <span className="font-hanuman">{sim.attempts_count} ដង</span>
                            </div>
                          </div>
                          {sim.best_score > 0 && (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span>{sim.best_score}%</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Badge className={getStatusColor(sim.status)}>
                            {getStatusText(sim.status)}
                          </Badge>
                          
                          <Button 
                            size="sm" 
                            className={`bg-gradient-to-r from-${subjectColor}-500 to-${subjectColor}-600 hover:from-${subjectColor}-600 hover:to-${subjectColor}-700 group-hover:scale-110 transition-all shadow-lg font-bold`}
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/simulation/${sim.id}`);
                            }}
                          >
                            {sim.status === 'completed' ? (
                              <>
                                <Eye className="h-4 w-4 mr-1" />
                                <span className="font-hanuman">មើលឡើងវិញ</span>
                              </>
                            ) : sim.status === 'in_progress' ? (
                              <>
                                <Play className="h-4 w-4 mr-1" />
                                <span className="font-hanuman">បន្ត</span>
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-1" />
                                <span className="font-hanuman">ចាប់ផ្តើម</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Call to Action */}
              <Card className="border-3 border-dashed border-purple-300 hover:border-purple-500 transition-all cursor-pointer group hover:shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
                <CardContent className="p-12 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all shadow-lg animate-pulse">
                    <Sparkles className="h-10 w-10 text-purple-600 group-hover:animate-spin" />
                  </div>
                  <h3 className="text-xl font-black text-purple-800 mb-2">Explore More Adventures! 🌈</h3>
                  <p className="text-purple-600 font-semibold mb-4">Discover amazing experiments and become a science superstar!</p>
                  <Button onClick={() => router.push('/simulations')} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8 py-3 font-bold transform hover:scale-105 transition-all shadow-lg">
                    Discover More Fun! 🎆
                    <ArrowRight className="h-5 w-5 ml-2 animate-pulse" />
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="progress" className="space-y-6">
              <Card className="bg-white/95 backdrop-blur border-2 border-purple-200 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <TrendingUp className="h-7 w-7 text-purple-600 animate-pulse" />
                    <span className="font-hanuman font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">វឌ្ឍនភាពរៀនសូត្ររបស់អ្នក</span>
                  </CardTitle>
                  <CardDescription className="font-hanuman text-purple-600 font-semibold text-lg">តាមដានដំណើរការដ៏អស្ចារ្យរបស់អ្នក! 📊</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {progress.length > 0 ? (
                    <div className="space-y-4">
                      {progress.map((sim) => {
                        const SubjectIcon = subjectIcons[sim.subject_area] || BookOpen;
                        const progressEmoji = sim.progress_percentage === 100 ? '🏆' : sim.progress_percentage >= 50 ? '🚀' : '🌱';
                        
                        return (
                          <div key={sim.id} className="border-2 border-purple-200 rounded-2xl p-5 hover:shadow-lg transition-all hover:border-purple-400 bg-gradient-to-r from-white to-purple-50 group cursor-pointer">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-start gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center group-hover:scale-110 transition-all">
                                  <SubjectIcon className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-lg font-hanuman text-purple-800">{sim.display_name_km}</h4>
                                  <p className="text-sm text-purple-600 font-hanuman">{sim.display_name_en}</p>
                                </div>
                              </div>
                              <Badge className={`${getStatusColor(sim.status)} font-hanuman font-bold`}>
                                {getStatusText(sim.status)}
                              </Badge>
                            </div>
                            
                            <div className="space-y-3">
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="font-hanuman font-bold text-purple-700">វឌ្ឍនភាព {progressEmoji}</span>
                                  <span className="font-black text-purple-800">{sim.progress_percentage}%</span>
                                </div>
                                <Progress value={sim.progress_percentage} className="h-4 bg-purple-100" />
                              </div>
                              
                              <div className="grid grid-cols-3 gap-3 text-center">
                                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-3">
                                  <Trophy className="h-5 w-5 text-yellow-600 mx-auto mb-1" />
                                  <p className="text-xs text-gray-600 font-hanuman">ពិន្ទុខ្ពស់បំផុត</p>
                                  <p className="text-lg font-black text-yellow-700">{sim.best_score}%</p>
                                </div>
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3">
                                  <Target className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                                  <p className="text-xs text-gray-600 font-hanuman">ព្យាយាម</p>
                                  <p className="text-lg font-black text-blue-700">{sim.attempts_count} ដង</p>
                                </div>
                                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3">
                                  <Clock className="h-5 w-5 text-green-600 mx-auto mb-1" />
                                  <p className="text-xs text-gray-600 font-hanuman">ពេលវេលា</p>
                                  <p className="text-lg font-black text-green-700">{Math.round(sim.total_time_spent / 60)}m</p>
                                </div>
                              </div>
                              
                              {sim.progress_percentage < 100 && (
                                <div className="flex justify-center mt-3">
                                  <Button 
                                    size="sm"
                                    onClick={() => router.push(`/simulation/${sim.id}`)}
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 font-hanuman font-bold"
                                  >
                                    បន្តការរៀន 🎯
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="relative inline-block mb-6">
                        <TrendingUp className="h-24 w-24 text-purple-300 mx-auto animate-pulse" />
                        <Sparkles className="h-10 w-10 text-yellow-400 absolute -top-2 -right-2 animate-spin" />
                        <Star className="h-6 w-6 text-pink-400 absolute -bottom-2 -left-2 animate-pulse" />
                      </div>
                      <h3 className="text-2xl font-black text-purple-800 mb-3 font-hanuman">មិនទាន់មានវឌ្ឍនភាពនៅឡើយទេ!</h3>
                      <p className="text-lg text-purple-600 font-semibold mb-6 font-hanuman">ចាប់ផ្តើមការពិសោធន៍ដើម្បីមើលវឌ្ឍនភាពរបស់អ្នក!</p>
                      <Button 
                        onClick={() => router.push('/simulations')}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8 py-4 font-bold font-hanuman"
                      >
                        ចាប់ផ្តើមរៀនឥឡូវនេះ! 🚀
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <Card className="bg-white/95 backdrop-blur border-2 border-purple-200 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Activity className="h-7 w-7 text-purple-600 animate-pulse" />
                    <span className="font-hanuman font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">សកម្មភាពថ្មីៗ</span>
                  </CardTitle>
                  <CardDescription className="font-hanuman text-purple-600 font-semibold text-lg">កំណត់ត្រារៀនសូត្ររបស់អ្នក</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {recentActivity.length > 0 ? (
                    <div className="space-y-4">
                      {recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-2xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all hover:shadow-md cursor-pointer group">
                          <div className={`p-3 rounded-2xl shadow-lg group-hover:scale-110 transition-all ${
                            activity.type === 'simulation_start' ? 'bg-gradient-to-br from-blue-100 to-blue-200' :
                            activity.type === 'simulation_complete' ? 'bg-gradient-to-br from-green-100 to-green-200' :
                            'bg-gradient-to-br from-purple-100 to-purple-200'
                          }`}>
                            {activity.type === 'simulation_start' && <Play className="h-5 w-5 text-blue-600" />}
                            {activity.type === 'simulation_complete' && <CheckCircle className="h-5 w-5 text-green-600" />}
                            {activity.type === 'exercise_submit' && <BookOpen className="h-5 w-5 text-purple-600" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-base font-bold font-hanuman text-purple-800">
                              {activity.type === 'simulation_start' && 'បានចាប់ផ្តើម 🎮'}
                              {activity.type === 'simulation_complete' && 'បានបញ្ចប់ ✅'}
                              {activity.type === 'exercise_submit' && 'បានបញ្ជូនលំហាត់ 📝'}
                              {' '}<span className="text-pink-600">{activity.simulation_name}</span>
                            </p>
                            {activity.score && (
                              <div className="flex items-center gap-2 mt-1">
                                <Trophy className="h-4 w-4 text-yellow-500" />
                                <p className="text-sm text-gray-700 font-hanuman font-semibold">ពិន្ទុ: {activity.score}% 🎆</p>
                              </div>
                            )}
                            {activity.duration && (
                              <div className="flex items-center gap-2 mt-1">
                                <Clock className="h-4 w-4 text-purple-500" />
                                <p className="text-sm text-gray-700 font-hanuman">រយៈពេល: {Math.round(activity.duration / 60)} នាទី</p>
                              </div>
                            )}
                            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(activity.timestamp).toLocaleString('km-KH')}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <ArrowRight className="h-5 w-5 text-purple-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="relative inline-block mb-6">
                        <Activity className="h-20 w-20 text-purple-300 mx-auto animate-pulse" />
                        <Sparkles className="h-8 w-8 text-yellow-400 absolute -top-2 -right-2 animate-spin" />
                      </div>
                      <h3 className="text-xl font-black text-purple-800 mb-3 font-hanuman">មិនទាន់មានសកម្មភាពនៅឡើយទេ!</h3>
                      <p className="text-purple-600 font-semibold font-hanuman">ចាប់ផ្តើមការពិសោធន៍ដើម្បីមើលឃើញសកម្មភាពរបស់អ្នក!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Award className="h-7 w-7 text-yellow-500 animate-pulse" />
                    <span className="font-hanuman font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500">ស្លាកសញ្ញាដ៏អស្ចារ្យរបស់អ្នក!</span>
                  </CardTitle>
                  <CardDescription className="font-hanuman text-lg text-purple-600 font-semibold">ប្រមូលពួកវាទាំងអស់ ហើយក្លាយជាជើងឈ្នះវិទ្យាសាស្ត្រ! 🎆</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { name: 'ជំហានដំបូង', nameEn: 'First Steps', description: 'បញ្ចប់ការពិសោធន៍ដំបូងរបស់អ្នក', icon: GraduationCap, earned: true },
                      { name: 'អ្នករៀនលឿន', nameEn: 'Quick Learner', description: 'បញ្ចប់ការពិសោធន៍ ៥', icon: Zap, earned: true },
                      { name: 'អ្នកស្វែងរកវិទ្យាសាស្ត្រ', nameEn: 'Science Explorer', description: 'សាកល្បងគ្រប់មុខវិជ្ជា', icon: FlaskConical, earned: false },
                      { name: 'ពិន្ទុពេញលេញ', nameEn: 'Perfect Score', description: 'ទទួលបាន ១០០%', icon: Star, earned: false },
                    ].map((achievement, idx) => (
                      <div 
                        key={idx} 
                        className={`text-center p-6 rounded-2xl border-3 transform hover:scale-105 transition-all cursor-pointer ${
                          achievement.earned ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-lg animate-pulse' : 'border-gray-300 opacity-50 grayscale'
                        }`}
                      >
                        <div className="relative inline-block">
                          <achievement.icon className={`h-16 w-16 mx-auto mb-3 ${
                            achievement.earned ? 'text-yellow-500 animate-bounce' : 'text-gray-400'
                          }`} />
                          {achievement.earned && (
                            <Sparkles className="h-6 w-6 text-orange-400 absolute -top-2 -right-2 animate-spin" />
                          )}
                        </div>
                        <h4 className={`font-bold text-base ${achievement.earned ? 'text-orange-700' : 'text-gray-600'}`}>{achievement.name}</h4>
                        <p className={`text-sm mt-1 ${achievement.earned ? 'text-orange-600 font-semibold' : 'text-gray-500'}`}>{achievement.description}</p>
                        {achievement.earned && <p className="text-2xl mt-2">🎉</p>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}