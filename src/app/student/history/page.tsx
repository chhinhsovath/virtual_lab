'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  Trophy, 
  Eye, 
  Filter, 
  Search, 
  ArrowLeft,
  Calendar,
  BookOpen,
  Target,
  TrendingUp,
  Download,
  Sparkles,
  History
} from 'lucide-react';

interface ExerciseSubmission {
  id: string;
  exercise_id: string;
  simulation_id: string;
  simulation_name: string;
  display_name_en: string;
  display_name_km: string;
  subject_area: string;
  question_number: number;
  question_type: string;
  student_answer: string;
  is_correct: boolean;
  points_earned: number;
  max_points: number;
  time_spent: number;
  submitted_at: string;
  attempt_number: number;
  feedback_from_teacher?: string;
}

interface SimulationHistory {
  id: string;
  simulation_name: string;
  display_name_en: string;
  display_name_km: string;
  subject_area: string;
  difficulty_level: string;
  progress_percentage: number;
  time_spent: number;
  attempts: number;
  best_score: number;
  completed: boolean;
  last_accessed: string;
  submissions: ExerciseSubmission[];
}

export default function StudentHistoryPage() {
  const [user, setUser] = useState<User | null>(null);
  const [history, setHistory] = useState<SimulationHistory[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<SimulationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const router = useRouter();

  useEffect(() => {
    const fetchUserAndHistory = async () => {
      try {
        // Fetch user session
        const sessionRes = await fetch('/api/auth/session', { credentials: 'include' });
        if (!sessionRes.ok) {
          router.push('/auth/login');
          return;
        }

        const sessionData = await sessionRes.json();
        setUser(sessionData.user);

        // Fetch student progress history
        const historyRes = await fetch('/api/student/progress?limit=100', { credentials: 'include' });
        if (historyRes.ok) {
          const historyData = await historyRes.json();
          
          // Fetch submissions for each simulation
          const historyWithSubmissions = await Promise.all(
            historyData.progress.map(async (sim: any) => {
              try {
                const submissionsRes = await fetch(
                  `/api/exercises/submit?simulation_id=${sim.simulation_id}`,
                  { credentials: 'include' }
                );
                const submissionsData = submissionsRes.ok ? await submissionsRes.json() : { submissions: [] };
                
                return {
                  ...sim,
                  submissions: submissionsData.submissions || []
                };
              } catch (error) {
                console.error('Error fetching submissions for simulation:', sim.simulation_id, error);
                return { ...sim, submissions: [] };
              }
            })
          );

          setHistory(historyWithSubmissions);
          setFilteredHistory(historyWithSubmissions);
        }
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndHistory();
  }, [router]);

  useEffect(() => {
    let filtered = history;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(sim => 
        sim.display_name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sim.simulation_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply subject filter
    if (subjectFilter !== 'all') {
      filtered = filtered.filter(sim => sim.subject_area === subjectFilter);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'completed') {
        filtered = filtered.filter(sim => sim.completed);
      } else if (statusFilter === 'in_progress') {
        filtered = filtered.filter(sim => sim.progress_percentage > 0 && !sim.completed);
      } else if (statusFilter === 'not_started') {
        filtered = filtered.filter(sim => sim.progress_percentage === 0);
      }
    }

    setFilteredHistory(filtered);
  }, [history, searchTerm, subjectFilter, statusFilter]);

  const getStatusBadge = (sim: SimulationHistory) => {
    if (sim.completed) {
      return <Badge className="bg-gradient-to-r from-green-100 to-green-200 text-green-800 font-bold border border-green-300">Completed ✅</Badge>;
    } else if (sim.progress_percentage > 0) {
      return <Badge className="bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 font-bold border border-yellow-300 animate-pulse">In Progress 🚀</Badge>;
    } else {
      return <Badge className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 font-bold border border-gray-300">Not Started 🌱</Badge>;
    }
  };

  const exportHistory = () => {
    const csvContent = [
      ['Simulation', 'Subject', 'Progress', 'Score', 'Time Spent', 'Attempts', 'Status', 'Last Accessed'].join(','),
      ...filteredHistory.map(sim => [
        sim.display_name_en,
        sim.subject_area,
        `${sim.progress_percentage}%`,
        `${sim.best_score}%`,
        `${Math.round(sim.time_spent / 60)} min`,
        sim.attempts,
        sim.completed ? 'Completed' : (sim.progress_percentage > 0 ? 'In Progress' : 'Not Started'),
        new Date(sim.last_accessed).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'learning_history.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100">
        <div className="text-center">
          <div className="relative">
            <History className="h-20 w-20 text-purple-600 mx-auto mb-4 animate-bounce" />
            <Sparkles className="h-8 w-8 text-yellow-400 absolute top-0 right-0 animate-pulse" />
          </div>
          <p className="mt-4 text-purple-700 font-bold text-xl animate-pulse">Loading your amazing journey... 🌈</p>
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
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100 p-4 relative overflow-hidden">
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-purple-300 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 -left-20 w-80 h-80 bg-pink-300 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 right-1/3 w-48 h-48 bg-blue-300 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl border-2 border-purple-200 p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full -mr-16 -mt-16 opacity-50"></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push('/student')}
                className="border-2 border-purple-400 text-purple-600 hover:bg-purple-50 font-bold transform hover:scale-105 transition-all"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Fun! 🏠
              </Button>
              <div>
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 animate-gradient-x">My Learning Journey 🎆</h1>
                <p className="text-lg text-purple-700 font-semibold mt-1">
                  See all your amazing achievements and adventures!
                </p>
              </div>
            </div>
            <Button onClick={exportHistory} variant="outline" className="border-2 border-green-400 text-green-600 hover:bg-green-50 font-bold transform hover:scale-105 transition-all">
              <Download className="h-5 w-5 mr-2 animate-bounce" />
              Save My Progress! 💾
            </Button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 transform hover:scale-105 transition-all cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-bold text-blue-700">Total Adventures</CardTitle>
              <BookOpen className="h-6 w-6 text-blue-600 animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-blue-800">{history.length} 🚀</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 transform hover:scale-105 transition-all cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-bold text-green-700">Victories</CardTitle>
              <Target className="h-6 w-6 text-green-600 animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-green-800">{history.filter(h => h.completed).length} ✅</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 transform hover:scale-105 transition-all cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-bold text-orange-700">Super Score</CardTitle>
              <Trophy className="h-6 w-6 text-orange-600 animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-orange-800">
                {history.length > 0 
                  ? Math.round(history.reduce((sum, h) => sum + h.best_score, 0) / history.length) 
                  : 0}% 🏆
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 transform hover:scale-105 transition-all cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-bold text-purple-700">Learning Time</CardTitle>
              <Clock className="h-6 w-6 text-purple-600 animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-purple-800">
                {Math.round(history.reduce((sum, h) => sum + h.time_spent, 0) / 60)}h ⏰
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white/95 backdrop-blur border-2 border-purple-200 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-2xl">
              <Filter className="h-6 w-6 text-purple-600 animate-pulse" />
              <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Find Your Adventures! 🔍</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-base font-bold text-purple-700">Search Magic ✨</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search simulations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-base font-bold text-purple-700">Choose Subject 📚</label>
                <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    <SelectItem value="physics">Physics</SelectItem>
                    <SelectItem value="chemistry">Chemistry</SelectItem>
                    <SelectItem value="biology">Biology</SelectItem>
                    <SelectItem value="mathematics">Mathematics</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-base font-bold text-purple-700">Progress Level 🎯</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="not_started">Not Started</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* History List */}
        <div className="space-y-4">
          {filteredHistory.map((sim) => (
            <Card key={sim.id} className="hover:shadow-2xl transition-all hover:-translate-y-1 border-2 border-transparent hover:border-purple-300 bg-gradient-to-br from-white to-purple-50 cursor-pointer group">
              <CardContent className="p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full -mr-12 -mt-12 opacity-50 group-hover:scale-150 transition-all"></div>
                <div className="flex items-start justify-between relative z-10">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-black text-purple-800">{sim.display_name_en}</h3>
                      {getStatusBadge(sim)}
                      <Badge variant="outline" className="font-bold border-2 border-purple-300 text-purple-700">{sim.subject_area} 🧪</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-gray-500">Progress</p>
                        <div className="flex items-center space-x-2">
                          <Progress value={sim.progress_percentage} className="flex-1 h-3 bg-purple-100" />
                          <span className="text-sm font-medium">{sim.progress_percentage}%</span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Best Score</p>
                        <p className="text-xl font-black text-green-600">{sim.best_score}% 🎆</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Time Spent</p>
                        <p className="text-xl font-black text-purple-600">{Math.round(sim.time_spent / 60)} min ⏱️</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Attempts</p>
                        <p className="text-xl font-black text-blue-600">{sim.attempts} 🎯</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 mt-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Last accessed: {new Date(sim.last_accessed).toLocaleDateString()}</span>
                      </div>
                      {sim.submissions.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="h-4 w-4" />
                          <span>{sim.submissions.length} submissions</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/student/submissions/${sim.simulation_id}`)}
                      className="border-2 border-purple-400 text-purple-600 hover:bg-purple-50 font-bold transform hover:scale-105 transition-all"
                    >
                      <Eye className="h-5 w-5 mr-2 animate-pulse" />
                      See Details 🔍
                    </Button>
                    {!sim.completed && (
                      <Button
                        size="sm"
                        onClick={() => router.push(`/simulation/${sim.simulation_id}`)}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 font-bold transform hover:scale-105 transition-all shadow-lg"
                      >
                        Continue Adventure! 🚀
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredHistory.length === 0 && (
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-3 border-dashed border-purple-300">
              <CardContent className="text-center py-16">
                <div className="relative inline-block mb-6">
                  <BookOpen className="h-20 w-20 text-purple-400 mx-auto animate-bounce" />
                  <Sparkles className="h-8 w-8 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
                </div>
                <h3 className="text-2xl font-black text-purple-800 mb-3">No Adventures Yet! 🌈</h3>
                <p className="text-lg text-purple-600 font-semibold mb-6">
                  {searchTerm || subjectFilter !== 'all' || statusFilter !== 'all' 
                    ? 'Try different filters to find your adventures!'
                    : 'Time to start your amazing science journey!'
                  }
                </p>
                <Button 
                  onClick={() => router.push('/student/simulations')}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8 py-4 font-bold transform hover:scale-105 transition-all shadow-lg"
                >
                  Start My First Adventure! 🚀
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}