'use client';

import { useEffect, useState, useRef, Component, ReactNode } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  Clock, Calendar, Activity, BookOpen, CheckCircle, AlertCircle,
  Play, Save, Send, HelpCircle, Globe, ChevronRight, TrendingUp,
  Award, Sparkles, ArrowLeft, FlaskConical, Trophy, Target
} from 'lucide-react';
import { format } from 'date-fns';
import { useGuestSession } from '@/hooks/useGuestSession';
import { EnrollmentPrompt } from '@/components/EnrollmentPrompt';

interface SimulationData {
  id: string;
  simulation_name: string;
  display_name_en: string;
  display_name_km: string;
  simulation_url: string;
  simulation_file_path: string;
  description_en: string;
  description_km: string;
  subject_area: string;
  difficulty_level: string;
  estimated_duration: number;
  exercise_content_en: string;
  exercise_content_km: string;
  instruction_content_en: string;
  instruction_content_km: string;
  learning_objectives_en?: string[];
  learning_objectives_km?: string[];
}

interface SimulationSession {
  id: string;
  started_at: string;
  current_progress: any;
  total_time_spent: number;
}

interface Exercise {
  id: string;
  question_number: number;
  question_type: 'multiple_choice' | 'short_answer' | 'calculation' | 'true_false' | 'fill_blank';
  question_en: string;
  question_km: string;
  instructions_en?: string;
  instructions_km?: string;
  options?: {
    options_en?: string[];
    options_km?: string[];
  };
  correct_answer?: string;
  points: number;
  difficulty_level?: string;
  hints_en?: string;
  hints_km?: string;
  explanation_en?: string;
  explanation_km?: string;
}

interface ActivityLog {
  timestamp: string;
  action: string;
  action_km: string;
  details: string;
  details_km: string;
  duration?: number;
}

// Error Boundary Component
class SimulationErrorBoundary extends Component<
  { children: ReactNode; onError?: (error: Error) => void },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode; onError?: (error: Error) => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Simulation Error Boundary caught an error:', error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100">
          <Card className="border-2 border-red-300 shadow-2xl max-w-md">
            <CardContent className="p-8 text-center">
              <div className="relative inline-block mb-4">
                <AlertCircle className="h-20 w-20 text-red-400 mx-auto animate-pulse" />
              </div>
              <h2 className="text-2xl font-black text-red-600 font-hanuman mb-4">
                មានបញ្ហាក្នុងការផ្ទុកការសាកល្បង 😓
              </h2>
              <p className="text-red-500 font-hanuman mb-6">
                សូមស្តាបត្រលក់ទំព័រ ឬព្យាយាមម្តងទៀត
              </p>
              <Button 
                onClick={() => window.location.reload()} 
                className="w-full font-hanuman bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg py-3"
              >
                ស្ដាបត្រលក់ទំព័រ 🔄
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function SimulationPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const assignmentId = searchParams.get('assignment');
  
  const [simulation, setSimulation] = useState<SimulationData | null>(null);
  const [session, setSession] = useState<SimulationSession | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHint, setShowHint] = useState<Record<string, boolean>>({});
  const [submission, setSubmission] = useState<any>(null);
  const [showEnrollmentPrompt, setShowEnrollmentPrompt] = useState(false);
  
  const { user, shouldShowEnrollmentPrompt, trackSimulationAccess, getGuestSessionInfo } = useGuestSession();
  
  const startTimeRef = useRef<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    loadSimulation();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (session) {
        saveProgress();
      }
    };
  }, [params.id]);

  useEffect(() => {
    if (session && !intervalRef.current) {
      startTimeRef.current = new Date();
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const elapsed = Math.floor((new Date().getTime() - startTimeRef.current.getTime()) / 1000);
          setElapsedTime(elapsed);
        }
      }, 1000);
    }
  }, [session]);

  const loadSimulation = async () => {
    try {
      const simRes = await fetch(`/api/simulations/${params.id}`);
      const simData = await simRes.json();
      
      if (simData.success) {
        // Process simulation data to ensure proper JSON parsing
        const processedSimulation = { ...simData.simulation };
        
        // Parse learning objectives if they're strings
        try {
          if (typeof processedSimulation.learning_objectives_en === 'string') {
            processedSimulation.learning_objectives_en = JSON.parse(processedSimulation.learning_objectives_en);
          }
          if (typeof processedSimulation.learning_objectives_km === 'string') {
            processedSimulation.learning_objectives_km = JSON.parse(processedSimulation.learning_objectives_km);
          }
        } catch (parseError) {
          console.error('Error parsing learning objectives:', parseError);
          processedSimulation.learning_objectives_en = [];
          processedSimulation.learning_objectives_km = [];
        }
        
        // Ensure arrays exist
        if (!Array.isArray(processedSimulation.learning_objectives_en)) {
          processedSimulation.learning_objectives_en = [];
        }
        if (!Array.isArray(processedSimulation.learning_objectives_km)) {
          processedSimulation.learning_objectives_km = [];
        }
        
        setSimulation(processedSimulation);
        
        // For guest users, create a mock session
        if (user?.isGuest) {
          setSession({
            id: `guest_${user.id}`,
            started_at: new Date().toISOString(),
            current_progress: { percentage: 0 },
            total_time_spent: 0
          });
          
          // Track simulation access for guest
          trackSimulationAccess();
          
          // Log guest activity locally
          setTimeout(() => {
            logActivity(
              'Started simulation as guest',
              'បានចាប់ផ្តើមការសាកល្បងជាភ្ញៀវ',
              `Opened ${simData.simulation.display_name_en}`,
              `បានបើក ${simData.simulation.display_name_km}`
            );
          }, 100);
        } else {
          // Regular authenticated user flow
          const startRes = await fetch(`/api/simulations/${params.id}/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ assignment_id: assignmentId })
          });
          
          const startData = await startRes.json();
          if (startData.success) {
            setSession(startData.session);
            setTimeout(() => {
              logActivity(
                'Started simulation',
                'បានចាប់ផ្តើមការសាកល្បង',
                `Opened ${simData.simulation.display_name_en}`,
                `បានបើក ${simData.simulation.display_name_km}`
              );
            }, 100);
          }
        }
        
        loadExercises();
      }
    } catch (error) {
      console.error('Error loading simulation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadExercises = async () => {
    try {
      const res = await fetch(`/api/exercises?simulation_id=${params.id}`);
      const data = await res.json();
      
      if (data.success && Array.isArray(data.exercises)) {
        // Process exercises to ensure proper JSON parsing
        const processedExercises = data.exercises.map((exercise: any) => {
          try {
            // Parse options if it's a string
            if (typeof exercise.options === 'string') {
              exercise.options = JSON.parse(exercise.options);
            }
            // Ensure options structure exists
            if (!exercise.options) {
              exercise.options = { options_en: [], options_km: [] };
            }
            // Ensure arrays exist within options
            if (!exercise.options.options_en) {
              exercise.options.options_en = [];
            }
            if (!exercise.options.options_km) {
              exercise.options.options_km = [];
            }
            return exercise;
          } catch (parseError) {
            console.error('Error parsing exercise options:', parseError, exercise);
            // Return exercise with empty options if parsing fails
            return {
              ...exercise,
              options: { options_en: [], options_km: [] }
            };
          }
        });
        setExercises(processedExercises);
      } else {
        setExercises([]);
      }
    } catch (error) {
      console.error('Error loading exercises:', error);
      setExercises([]);
    }
  };

  const logActivity = (action: string, actionKm: string, details: string, detailsKm: string) => {
    const log: ActivityLog = {
      timestamp: new Date().toISOString(),
      action,
      action_km: actionKm,
      details,
      details_km: detailsKm,
      duration: elapsedTime
    };
    setActivityLogs(prev => [...prev, log]);
    
    // Only log to server if we have a session
    if (session?.id) {
      fetch('/api/activity-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          simulation_id: params.id,
          session_id: session.id,
          action,
          details,
          timestamp: log.timestamp,
          duration: elapsedTime
        })
      }).catch(error => {
        console.error('Failed to log activity:', error);
      });
    }
  };

  const saveProgress = async () => {
    if (!session) return;
    
    try {
      await fetch(`/api/simulations/${params.id}/start`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_progress: { percentage: calculateProgress() },
          time_spent: elapsedTime,
          simulation_data: { activityLogs, answers }
        })
      });
      
      logActivity(
        'Progress saved',
        'បានរក្សាទុកវឌ្ឍនភាព',
        `${calculateProgress()}% complete`,
        `បានបញ្ចប់ ${calculateProgress()}%`
      );
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const calculateProgress = () => {
    const answeredCount = Object.keys(answers).length;
    const totalExercises = Array.isArray(exercises) ? exercises.length : 0;
    if (totalExercises === 0) return 0;
    return Math.round((answeredCount / totalExercises) * 100);
  };

  const submitExercises = async () => {
    setIsSubmitting(true);
    logActivity(
      'Submitted exercises',
      'បានដាក់ស្នើលំហាត់',
      `Answered ${Object.keys(answers).length}/${Array.isArray(exercises) ? exercises.length : 0} questions`,
      `បានឆ្លើយសំណួរ ${Object.keys(answers).length}/${Array.isArray(exercises) ? exercises.length : 0}`
    );
    
    try {
      // For guest users, simulate submission
      if (user?.isGuest) {
        // Create mock submission for guest
        const totalExercises = Array.isArray(exercises) ? exercises.length : 0;
        const correctAnswers = totalExercises * 0.7; // Assume 70% correct for demo
        const mockSubmission = {
          total_score: Math.round(correctAnswers),
          max_score: totalExercises,
          percentage: totalExercises > 0 ? Math.round((correctAnswers / totalExercises) * 100) : 0,
          details: {}
        };

        setSubmission(mockSubmission);
        
        // Show success message
        setTimeout(() => {
          alert(`បានបញ្ចប់ការសាកល្បង! ពិន្ទុ: ${mockSubmission.total_score}/${mockSubmission.max_score}`);
          
          // Show enrollment prompt after completion
          if (shouldShowEnrollmentPrompt()) {
            setShowEnrollmentPrompt(true);
          }
        }, 1000);
      } else {
        // Regular authenticated user submission
        const res = await fetch('/api/exercises/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            simulation_id: params.id,
            session_id: session?.id,
            assignment_id: assignmentId,
            answers,
            time_spent: elapsedTime
          })
        });
        
        const data = await res.json();
        
        if (res.ok && data.success) {
          setSubmission(data.submission);
          
          await fetch(`/api/simulations/${params.id}/start`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              current_progress: { percentage: 100 },
              time_spent: elapsedTime,
              current_score: data.submission.total_score,
              is_completed: true,
              simulation_data: { 
                activityLogs, 
                answers, 
                completedAt: new Date().toISOString(),
                submission: data.submission
              }
            })
          });
          
          alert(`បានបញ្ចប់ការសាកល្បង! ពិន្ទុ: ${data.submission.total_score}/${data.submission.max_score}`);
        } else {
          console.error('Submission failed:', data);
          alert(data.error || 'មានបញ្ហាក្នុងការដាក់ស្នើលំហាត់។ សូមព្យាយាមម្តងទៀត។');
        }
      }
    } catch (error) {
      console.error('Error submitting exercises:', error);
      alert('មានបញ្ហាក្នុងការដាក់ស្នើលំហាត់។ សូមព្យាយាមម្តងទៀត។');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}ម៉ោង ${minutes}នាទី ${secs}វិនាទី`;
    } else if (minutes > 0) {
      return `${minutes}នាទី ${secs}វិនាទី`;
    }
    return `${secs}វិនាទី`;
  };

  const getDifficultyColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'easy': 
      case 'beginner': return 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300';
      case 'medium': 
      case 'intermediate': return 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300';
      case 'hard': 
      case 'advanced': return 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300';
      default: return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300';
    }
  };

  const getDifficultyText = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'easy': 
      case 'beginner': return 'ងាយ 🌱';
      case 'medium': 
      case 'intermediate': return 'មធ្យម 🌳';
      case 'hard': 
      case 'advanced': return 'ពិបាក 🌲';
      default: return level;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full animate-pulse mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FlaskConical className="h-12 w-12 text-white animate-bounce" />
            </div>
          </div>
          <p className="mt-6 text-2xl font-black text-purple-700 font-hanuman animate-pulse">
            កំពុងផ្ទុកការសាកល្បង... 🚀
          </p>
          <div className="flex justify-center mt-4 space-x-2">
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!simulation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100">
        <Card className="border-2 border-red-300 shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="relative inline-block">
              <AlertCircle className="h-20 w-20 text-red-400 mx-auto mb-4 animate-pulse" />
              <Sparkles className="h-8 w-8 text-yellow-400 absolute -top-2 -right-2 animate-spin" />
            </div>
            <p className="text-2xl font-black text-red-600 font-hanuman mb-4">អូ៎! រកមិនឃើញការសាកល្បង 😢</p>
            <Button 
              onClick={() => router.push('/student')} 
              className="mt-4 w-full font-hanuman bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg py-6 transform hover:scale-105 transition-all shadow-lg"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              ត្រឡប់ទៅផ្ទាំងគ្រប់គ្រង 🏠
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <SimulationErrorBoundary onError={(error) => console.error('Critical simulation error:', error)}>
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100 relative overflow-hidden">
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-purple-300 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 -left-32 w-96 h-96 bg-pink-300 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 right-1/3 w-64 h-64 bg-blue-300 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/4 left-1/2 w-48 h-48 bg-yellow-300 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-md shadow-xl border-b-2 border-purple-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/student')}
                className="hover:bg-purple-100 text-purple-600 transform hover:scale-110 transition-all"
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
              <div className="h-10 w-px bg-gradient-to-b from-purple-300 to-pink-300" />
              <div className="flex items-center gap-3">
                <div className="relative">
                  <FlaskConical className="h-10 w-10 text-purple-600 animate-pulse" />
                  <Sparkles className="h-5 w-5 text-yellow-400 absolute -top-2 -right-2 animate-ping" />
                </div>
                <div>
                  <h1 className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-hanuman">
                    {simulation.display_name_km} 🎮
                  </h1>
                  <p className="text-sm text-purple-600 font-semibold mt-1">
                    {simulation.display_name_en}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 px-4 py-2 text-sm font-bold flex items-center gap-2 shadow-lg">
                <Clock className="h-4 w-4 animate-pulse" />
                {formatDuration(elapsedTime)}
              </Badge>
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 px-4 py-2 text-sm font-bold flex items-center gap-2 shadow-lg">
                <Calendar className="h-4 w-4" />
                {format(new Date(), 'dd/MM/yyyy')}
              </Badge>
              <Badge className={`${getDifficultyColor(simulation.difficulty_level)} font-bold text-sm px-4 py-2 border-2 shadow-lg`}>
                {getDifficultyText(simulation.difficulty_level)} ⭐
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Simulation Area */}
          <div className="lg:col-span-2">
            <Card className="h-full border-2 border-purple-200 shadow-2xl hover:shadow-3xl transition-all bg-gradient-to-br from-white to-purple-50">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b-2 border-purple-200">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-2xl font-black text-purple-800 font-hanuman flex items-center gap-2">
                    <FlaskConical className="h-6 w-6 text-purple-600" />
                    ការសាកល្បង 🧪
                  </span>
                  <Button 
                    onClick={saveProgress} 
                    size="sm" 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold shadow-lg transform hover:scale-105 transition-all"
                  >
                    <Save className="h-4 w-4 mr-1 animate-pulse" />
                    រក្សាទុកវឌ្ឍនភាព 💾
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl overflow-hidden shadow-inner border-2 border-purple-200" style={{ height: '600px' }}>
                  <iframe
                    ref={iframeRef}
                    src={simulation.simulation_url || '#'}
                    className="w-full h-full"
                    title={simulation.display_name_km}
                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                    onLoad={() => {
                      if (session?.id) {
                        logActivity(
                          'Simulation loaded',
                          'បានផ្ទុកការសាកល្បង',
                          `${simulation.display_name_en} ready`,
                          `${simulation.display_name_km} រួចរាល់`
                        );
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Progress Card */}
            <Card className="border-2 border-purple-200 shadow-xl hover:shadow-2xl transition-all bg-gradient-to-br from-white to-purple-50">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b-2 border-purple-200">
                <CardTitle className="text-xl font-black text-purple-800 font-hanuman flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-600 animate-pulse" />
                  វឌ្ឍនភាព 📈
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-3 font-hanuman font-bold">
                      <span className="text-purple-700">ការបញ្ចប់ 🎯</span>
                      <span className="text-2xl font-black text-purple-800 animate-pulse">{calculateProgress()}%</span>
                    </div>
                    <div className="relative">
                      <Progress value={calculateProgress()} className="h-4 bg-purple-200" />
                      <div className="absolute inset-0 h-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-30 animate-pulse" style={{ width: `${calculateProgress()}%` }}></div>
                    </div>
                  </div>
                  <div className="space-y-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
                    <div className="flex justify-between items-center font-hanuman">
                      <span className="text-purple-700 font-bold flex items-center gap-2">
                        <Clock className="h-4 w-4 text-purple-600" />
                        រយៈពេលប្រើប្រាស់
                      </span>
                      <span className="font-black text-purple-800 text-lg">{formatDuration(elapsedTime)}</span>
                    </div>
                    <div className="flex justify-between items-center font-hanuman">
                      <span className="text-purple-700 font-bold flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        សំណួរដែលបានឆ្លើយ
                      </span>
                      <span className="font-black text-purple-800 text-lg">{Object.keys(answers).length}/{Array.isArray(exercises) ? exercises.length : 0}</span>
                    </div>
                    {submission && (
                      <div className="flex justify-between items-center font-bold bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg p-3 border-2 border-green-300">
                        <span className="text-green-700 font-hanuman flex items-center gap-2">
                          <Trophy className="h-5 w-5 text-green-600" />
                          ពិន្ទុ 🏆
                        </span>
                        <span className="text-2xl font-black text-green-800">{submission.total_score}/{submission.max_score}</span>
                      </div>
                    )}
                  </div>
                  {calculateProgress() === 100 && !submission && (
                    <div className="text-center p-3 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl border-2 border-yellow-300">
                      <p className="text-yellow-800 font-bold font-hanuman">ល្អណាស់! ជាន់ដាក់ស្នើចម្លើយ 🎆</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Activity Log */}
            <Card className="border-2 border-blue-200 shadow-xl hover:shadow-2xl transition-all bg-gradient-to-br from-white to-blue-50">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b-2 border-blue-200">
                <CardTitle className="text-xl font-black text-blue-800 flex items-center gap-2 font-hanuman">
                  <Activity className="h-5 w-5 text-blue-600 animate-pulse" />
                  កំណត់ហេតុសកម្មភាព 📋
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                  {Array.isArray(activityLogs) && activityLogs.map((log, index) => (
                    <div key={index} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border-l-4 border-blue-400 hover:shadow-md transition-all transform hover:scale-102">
                      <div className="font-bold text-blue-800 font-hanuman text-sm">{log.action_km}</div>
                      <div className="text-blue-600 font-hanuman text-xs mt-1">{log.details_km}</div>
                      <div className="text-blue-400 text-xs mt-2 flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {format(new Date(log.timestamp), 'HH:mm:ss')}
                        {log.duration && (
                          <>
                            <span className="text-blue-300">•</span>
                            <span className="font-bold">{formatDuration(log.duration)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  {(!Array.isArray(activityLogs) || activityLogs.length === 0) && (
                    <div className="text-center py-8">
                      <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3 animate-pulse" />
                      <p className="text-gray-500 font-hanuman font-semibold">
                        មិនមានសកម្មភាពនៅឡើយទេ 😴
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Exercises Section */}
        <Card className="mt-6 border-2 border-purple-200 shadow-2xl bg-gradient-to-br from-white to-purple-50">
          <CardHeader className="bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 border-b-2 border-purple-200">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-3 text-2xl font-black text-purple-800 font-hanuman">
                <div className="relative">
                  <BookOpen className="h-8 w-8 text-purple-600 animate-pulse" />
                  <Sparkles className="h-4 w-4 text-yellow-400 absolute -top-1 -right-1 animate-ping" />
                </div>
                លំហាត់វិទ្យាសាស្ត្រ 📝
              </span>
              {Array.isArray(exercises) && exercises.length > 0 && (
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg px-4 py-2 font-bold shadow-lg">
                  {Object.keys(answers).length}/{exercises.length} បានឆ្លើយ ✨
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="exercises" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-purple-100 to-pink-100 p-1 rounded-xl">
                <TabsTrigger value="exercises" className="font-hanuman font-bold text-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all">
                  <HelpCircle className="h-5 w-5 mr-2" />
                  សំណួរ 🤔
                </TabsTrigger>
                <TabsTrigger value="instructions" className="font-hanuman font-bold text-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all">
                  <BookOpen className="h-5 w-5 mr-2" />
                  ការណែនាំ 📖
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="exercises" className="space-y-6 mt-6">
                {!Array.isArray(exercises) || exercises.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4 animate-pulse" />
                    <p className="text-gray-500 font-hanuman font-semibold text-xl">
                      មិនមានលំហាត់សម្រាប់ការសាកល្បងនេះនៅឡើយទេ 📝
                    </p>
                    <p className="text-gray-400 font-hanuman text-sm mt-2">
                      សូមភ្ជាប់ទៅការសាកល្បង និងត្រឡប់មកក្រោយ 🔄
                    </p>
                  </div>
                ) : exercises.map((exercise, index) => (
                  <div key={exercise.id} className="border-2 border-purple-200 rounded-2xl p-6 hover:shadow-xl transition-all bg-gradient-to-br from-white to-purple-50 hover:scale-102 transform">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-xl font-black flex items-center gap-3 font-hanuman mb-3">
                          <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            សំណួរទី {index + 1}
                          </span>
                          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-bold px-3 py-1 shadow-md">
                            {exercise.points} ពិន្ទុ ⭐
                          </Badge>
                          {exercise.difficulty_level && (
                            <Badge className={`${getDifficultyColor(exercise.difficulty_level)} font-bold border-2 shadow-md`}>
                              {getDifficultyText(exercise.difficulty_level)}
                            </Badge>
                          )}
                        </h3>
                        <p className="text-lg font-bold text-purple-800 font-hanuman mb-2">
                          {exercise.question_km}
                        </p>
                        {exercise.instructions_km && (
                          <p className="text-sm text-purple-600 bg-purple-50 rounded-lg p-3 italic font-hanuman border border-purple-200">
                            💡 {exercise.instructions_km}
                          </p>
                        )}
                      </div>
                      {answers[exercise.id] && (
                        <div className="relative">
                          <CheckCircle className="h-8 w-8 text-green-500 animate-bounce" />
                          <Sparkles className="h-4 w-4 text-yellow-400 absolute -top-1 -right-1 animate-ping" />
                        </div>
                      )}
                    </div>
                    
                    {/* Multiple Choice */}
                    {exercise.question_type === 'multiple_choice' && exercise.options && Array.isArray(exercise.options.options_km) && exercise.options.options_km.length > 0 && (
                      <RadioGroup
                        value={answers[exercise.id] || ''}
                        onValueChange={(value) => {
                          setAnswers(prev => ({ ...prev, [exercise.id]: value }));
                          logActivity(
                            'Answered question',
                            'បានឆ្លើយសំណួរ',
                            `Question ${index + 1}: ${value}`,
                            `សំណួរទី ${index + 1}: ${value}`
                          );
                        }}
                        className="space-y-3 mt-4"
                      >
                        {exercise.options.options_km.map((option, optIndex) => {
                          if (!option || typeof option !== 'string') return null;
                          return (
                            <div key={optIndex} className="flex items-center space-x-2">
                              <RadioGroupItem value={exercise.options?.options_en?.[optIndex] || option} id={`${exercise.id}-${optIndex}`} className="border-2 border-purple-300 text-purple-600" />
                              <Label htmlFor={`${exercise.id}-${optIndex}`} className="cursor-pointer font-hanuman text-lg font-semibold text-purple-700 hover:text-purple-900 transition-colors flex-1 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 hover:shadow-md transition-all">
                                {String.fromCharCode(65 + optIndex)}. {option}
                              </Label>
                            </div>
                          );
                        })}
                      </RadioGroup>
                    )}
                    
                    {/* True/False */}
                    {exercise.question_type === 'true_false' && (
                      <RadioGroup
                        value={answers[exercise.id] || ''}
                        onValueChange={(value) => {
                          setAnswers(prev => ({ ...prev, [exercise.id]: value }));
                          logActivity(
                            'Answered question',
                            'បានឆ្លើយសំណួរ',
                            `Question ${index + 1}: ${value}`,
                            `សំណួរទី ${index + 1}: ${value}`
                          );
                        }}
                        className="flex gap-4 mt-3"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="true" id={`${exercise.id}-true`} className="border-2 border-green-400 text-green-600" />
                          <Label htmlFor={`${exercise.id}-true`} className="cursor-pointer font-hanuman text-lg font-bold bg-gradient-to-r from-green-50 to-green-100 text-green-700 px-6 py-3 rounded-xl hover:shadow-lg transition-all border-2 border-green-200">
                            ✅ ពិត
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="false" id={`${exercise.id}-false`} className="border-2 border-red-400 text-red-600" />
                          <Label htmlFor={`${exercise.id}-false`} className="cursor-pointer font-hanuman text-lg font-bold bg-gradient-to-r from-red-50 to-red-100 text-red-700 px-6 py-3 rounded-xl hover:shadow-lg transition-all border-2 border-red-200">
                            ❌ មិនពិត
                          </Label>
                        </div>
                      </RadioGroup>
                    )}
                    
                    {/* Calculation */}
                    {exercise.question_type === 'calculation' && (
                      <div className="relative mt-4">
                        <Input
                          type="text"
                          placeholder="បញ្ចូលចម្លើយរបស់អ្នក... 📝"
                          value={answers[exercise.id] || ''}
                          onChange={(e) => {
                            setAnswers(prev => ({ ...prev, [exercise.id]: e.target.value }));
                          }}
                          onBlur={() => logActivity(
                            'Answered question',
                            'បានឆ្លើយសំណួរ',
                            `Question ${index + 1}: ${answers[exercise.id]}`,
                            `សំណួរទី ${index + 1}: ${answers[exercise.id]}`
                          )}
                          className="font-hanuman text-lg border-2 border-purple-300 focus:border-purple-500 focus:ring-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 pl-12 pr-4 py-3 rounded-xl shadow-inner font-bold text-purple-800"
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <span className="text-2xl">📝</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Short Answer */}
                    {exercise.question_type === 'short_answer' && (
                      <div className="relative mt-4">
                        <Textarea
                          placeholder="សរសេរចម្លើយរបស់អ្នក... ✍️"
                          value={answers[exercise.id] || ''}
                          onChange={(e) => {
                            setAnswers(prev => ({ ...prev, [exercise.id]: e.target.value }));
                          }}
                          onBlur={() => logActivity(
                            'Answered question',
                            'បានឆ្លើយសំណួរ',
                            `Question ${index + 1}: Text answer`,
                            `សំណួរទី ${index + 1}: ចម្លើយអត្ថបទ`
                          )}
                          className="font-hanuman text-lg border-2 border-purple-300 focus:border-purple-500 focus:ring-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 pl-12 pr-4 py-3 rounded-xl shadow-inner font-semibold text-purple-800"
                          rows={3}
                        />
                        <div className="absolute left-3 top-4">
                          <span className="text-2xl">✍️</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Hint Button */}
                    {exercise.hints_km && (
                      <div className="mt-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowHint(prev => ({ ...prev, [exercise.id]: !prev[exercise.id] }))}
                          className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white font-hanuman font-bold shadow-lg transform hover:scale-105 transition-all"
                        >
                          <HelpCircle className="h-5 w-5 mr-2 animate-pulse" />
                          ជំនួយ 💡
                        </Button>
                        {showHint[exercise.id] && (
                          <Alert className="mt-3 border-2 border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50 shadow-lg animate-fadeIn">
                            <AlertDescription className="font-hanuman text-yellow-800 font-semibold text-base flex items-start gap-2">
                              <span className="text-2xl">💡</span>
                              <span>{exercise.hints_km}</span>
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    )}
                    
                    {/* Show explanation after submission */}
                    {submission && submission.details && typeof submission.details === 'object' && submission.details[exercise.id] && (
                      <Alert className={`mt-4 border-2 shadow-lg animate-fadeIn ${
                        submission.details[exercise.id].is_correct 
                          ? 'border-green-300 bg-gradient-to-r from-green-50 to-emerald-50' 
                          : 'border-red-300 bg-gradient-to-r from-red-50 to-pink-50'
                      }`}>
                        <AlertDescription>
                          <div className={`text-lg font-black mb-2 font-hanuman flex items-center gap-2 ${
                            submission.details[exercise.id].is_correct 
                              ? 'text-green-800' 
                              : 'text-red-800'
                          }`}>
                            {submission.details[exercise.id].is_correct 
                              ? <><span className="text-3xl">🎉</span> ត្រឹមត្រូវ! ល្អណាស់!</> 
                              : <><span className="text-2xl">😔</span> មិនត្រឹមត្រូវ សាកល្បងម្តងទៀត!</>
                          }
                          </div>
                          {exercise.explanation_km && (
                            <div className="font-hanuman font-semibold">📖 {exercise.explanation_km}</div>
                          )}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ))}
                
                <div className="flex justify-between items-center mt-8">
                  <div className="text-sm font-hanuman text-purple-600 font-semibold">
                    {Object.keys(answers).length === 0 && '📝 សូមឆ្លើយសំណួរទាំងអស់មុនដាក់ស្នើ'}
                    {Object.keys(answers).length > 0 && Object.keys(answers).length < (Array.isArray(exercises) ? exercises.length : 0) && `😊 បានឆ្លើយ ${Object.keys(answers).length}/${Array.isArray(exercises) ? exercises.length : 0} សំណួរ`}
                    {Array.isArray(exercises) && Object.keys(answers).length === exercises.length && !submission && '🎉 ល្អណាស់! អ្នកអាចដាក់ស្នើបានហើយ!'}
                    {submission && '✅ បានដាក់ស្នើរួចរាល់!'}
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        saveProgress();
                        router.push('/student');
                      }}
                      className="font-hanuman border-2 border-purple-300 hover:bg-purple-50 text-purple-700 font-bold transform hover:scale-105 transition-all shadow-lg"
                    >
                      <Save className="h-5 w-5 mr-2 animate-pulse" />
                      រក្សាទុក និងចាកចេញ 💾
                    </Button>
                    <Button 
                      onClick={submitExercises}
                      disabled={Object.keys(answers).length === 0 || isSubmitting || !!submission}
                      className={`font-hanuman font-bold text-lg px-6 py-3 transform transition-all shadow-lg ${
                        isSubmitting 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : submission 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:scale-105'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          កំពុងដាក់ស្នើ... 🚀
                        </>
                      ) : submission ? (
                        <>
                          <CheckCircle className="h-5 w-5 mr-2" />
                          បានដាក់ស្នើរួចរាល់! 🎆
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5 mr-2 animate-pulse" />
                          ដាក់ស្នើលំហាត់ 🚀
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="instructions" className="mt-6">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border-2 border-purple-200 shadow-xl">
                  <h3 className="text-2xl font-black text-purple-800 mb-6 font-hanuman flex items-center gap-3">
                    <BookOpen className="h-8 w-8 text-purple-600" />
                    ការណែនាំ 📖
                  </h3>
                  
                  {/* Teacher-created instruction content */}
                  {simulation.instruction_content_km && (
                    <div className="mb-8">
                      <h4 className="text-xl font-black text-purple-800 mb-4 font-hanuman flex items-center gap-2">
                        <Target className="h-6 w-6 text-purple-600" />
                        ការណែនាំពីគ្រូ 👨‍🏫
                      </h4>
                      <div className="bg-white/80 rounded-xl p-6 border border-purple-200 shadow-md">
                        <div className="text-lg text-purple-700 font-semibold font-hanuman mb-4 whitespace-pre-wrap">
                          {simulation.instruction_content_km}
                        </div>
                        {simulation.instruction_content_en && (
                          <div className="text-base text-purple-600 border-t border-purple-200 pt-4 whitespace-pre-wrap">
                            {simulation.instruction_content_en}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Learning objectives from teacher */}
                  {simulation.learning_objectives_km && Array.isArray(simulation.learning_objectives_km) && simulation.learning_objectives_km.length > 0 && (
                    <div className="mb-8">
                      <h4 className="text-xl font-black text-purple-800 mb-4 font-hanuman flex items-center gap-2">
                        <Target className="h-6 w-6 text-purple-600" />
                        គោលបំណងការរៀន 🎯
                      </h4>
                      <ul className="space-y-3">
                        {simulation.learning_objectives_km.map((objective, index) => {
                          if (!objective || typeof objective !== 'string') return null;
                          return (
                            <li key={index} className="bg-white/70 rounded-xl p-4 border border-purple-200 font-hanuman font-semibold text-purple-700 flex items-start gap-3">
                              <span className="text-2xl">{index + 1}️⃣</span>
                              <span>{objective}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                  
                  {/* Default instructions if no teacher content */}
                  {!simulation.instruction_content_km && (
                    <>
                      <p className="text-lg text-purple-700 font-semibold mb-6 font-hanuman bg-white/70 rounded-xl p-4 border border-purple-200">
                        {simulation.description_km}
                      </p>
                      
                      <div className="mb-8">
                        <h4 className="text-xl font-black text-purple-800 mb-4 font-hanuman flex items-center gap-2">
                          <Target className="h-6 w-6 text-purple-600" />
                          របៀបបញ្ចប់ការសាកល្បងនេះ 🎯
                        </h4>
                        <ol className="space-y-3">
                          <li className="bg-white/70 rounded-xl p-4 border border-purple-200 font-hanuman font-semibold text-purple-700 flex items-start gap-3">
                            <span className="text-2xl">1️⃣</span>
                            <span>ធ្វើអន្តរកម្មជាមួយការសាកល្បងដើម្បីស្វែងយល់គោលគំនិត 🧪</span>
                          </li>
                          <li className="bg-white/70 rounded-xl p-4 border border-purple-200 font-hanuman font-semibold text-purple-700 flex items-start gap-3">
                            <span className="text-2xl">2️⃣</span>
                            <span>សង្កេតមើលរបៀបដែលប៉ារ៉ាម៉ែត្រផ្សេងៗប៉ះពាល់ដល់លទ្ធផល 🔍</span>
                          </li>
                          <li className="bg-white/70 rounded-xl p-4 border border-purple-200 font-hanuman font-semibold text-purple-700 flex items-start gap-3">
                            <span className="text-2xl">3️⃣</span>
                            <span>ឆ្លើយសំណួរលំហាត់ទាំងអស់ដោយផ្អែកលើការសង្កេតរបស់អ្នក ✍️</span>
                          </li>
                          <li className="bg-white/70 rounded-xl p-4 border border-purple-200 font-hanuman font-semibold text-purple-700 flex items-start gap-3">
                            <span className="text-2xl">4️⃣</span>
                            <span>ដាក់ស្នើចម្លើយរបស់អ្នកនៅពេលបញ្ចប់ 🚀</span>
                          </li>
                        </ol>
                      </div>
                    </>
                  )}
                  
                  <div>
                    <h4 className="text-xl font-black text-purple-800 mb-4 font-hanuman flex items-center gap-2">
                      <Sparkles className="h-6 w-6 text-yellow-500" />
                      គន្លឹះពិសេស 💡
                    </h4>
                    <ul className="space-y-3">
                      <li className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-300 font-hanuman font-semibold text-yellow-800 flex items-start gap-3">
                        <span className="text-2xl">⏰</span>
                        <span>ចំណាយពេលដើម្បីយល់ពីការសាកល្បង</span>
                      </li>
                      <li className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-300 font-hanuman font-semibold text-yellow-800 flex items-start gap-3">
                        <span className="text-2xl">🧪</span>
                        <span>សាកល្បងតម្លៃផ្សេងៗហើយសង្កេតលំនាំ</span>
                      </li>
                      <li className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-300 font-hanuman font-semibold text-yellow-800 flex items-start gap-3">
                        <span className="text-2xl">💾</span>
                        <span>វឌ្ឍនភាពរបស់អ្នកត្រូវបានរក្សាទុកដោយស្វ័យប្រវត្តិ</span>
                      </li>
                      <li className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-300 font-hanuman font-semibold text-yellow-800 flex items-start gap-3">
                        <span className="text-2xl">🔄</span>
                        <span>អ្នកអាចត្រឡប់មកការសាកល្បងនេះក្រោយពេលក្រោយប្រសិនបើចាំបាច់</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f3e8ff;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c084fc;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a855f7;
        }
      `}</style>

      {/* Enrollment Prompt for Guest Users */}
      {showEnrollmentPrompt && (
        <EnrollmentPrompt
          simulationTitle={simulation?.display_name_km || 'ការពិសោធន៍'}
          onClose={() => setShowEnrollmentPrompt(false)}
          onRegister={() => router.push('/auth/register')}
          onLogin={() => router.push('/auth/login')}
        />
      )}
      </div>
    </SimulationErrorBoundary>
  );
}