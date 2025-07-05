'use client';

import { useEffect, useState, useRef } from 'react';
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
  Award, Sparkles, ArrowLeft
} from 'lucide-react';
import { format } from 'date-fns';

interface SimulationData {
  id: string;
  simulation_name: string;
  display_name_en: string;
  display_name_km: string;
  simulation_url: string;
  description_en: string;
  description_km: string;
  subject_area: string;
  difficulty_level: string;
  estimated_duration: number;
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
    options_en: string[];
    options_km: string[];
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
        setSimulation(simData.simulation);
        
        const startRes = await fetch(`/api/simulations/${params.id}/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ assignment_id: assignmentId })
        });
        
        const startData = await startRes.json();
        if (startData.success) {
          setSession(startData.session);
          // Delay initial activity log to ensure session is set
          setTimeout(() => {
            logActivity(
              'Started simulation',
              'បានចាប់ផ្តើមការសាកល្បង',
              `Opened ${simData.simulation.display_name_en}`,
              `បានបើក ${simData.simulation.display_name_km}`
            );
          }, 100);
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
      
      if (data.success && data.exercises) {
        setExercises(data.exercises);
      }
    } catch (error) {
      console.error('Error loading exercises:', error);
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
    return Math.round((answeredCount / exercises.length) * 100);
  };

  const submitExercises = async () => {
    setIsSubmitting(true);
    logActivity(
      'Submitted exercises',
      'បានដាក់ស្នើលំហាត់',
      `Answered ${Object.keys(answers).length}/${exercises.length} questions`,
      `បានឆ្លើយសំណួរ ${Object.keys(answers).length}/${exercises.length}`
    );
    
    try {
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
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyText = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'easy': return 'ងាយ';
      case 'medium': return 'មធ្យម';
      case 'hard': return 'ពិបាក';
      default: return level;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 font-hanuman">កំពុងផ្ទុកការសាកល្បង...</p>
        </div>
      </div>
    );
  }

  if (!simulation) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardContent className="p-6">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-center font-hanuman">រកមិនឃើញការសាកល្បង</p>
            <Button onClick={() => router.push('/student')} className="mt-4 w-full font-hanuman">
              ត្រឡប់ទៅផ្ទាំងគ្រប់គ្រង
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/student')}
                className="hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="h-8 w-px bg-gray-300" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 font-hanuman">
                  {simulation.display_name_km}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {simulation.display_name_en}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDuration(elapsedTime)}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(), 'dd/MM/yyyy')}
              </Badge>
              <Badge className={getDifficultyColor(simulation.difficulty_level)}>
                {getDifficultyText(simulation.difficulty_level)}
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
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center justify-between font-hanuman">
                  <span>ការសាកល្បង</span>
                  <Button onClick={saveProgress} size="sm" variant="outline">
                    <Save className="h-4 w-4 mr-1" />
                    រក្សាទុកវឌ្ឍនភាព
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 rounded-lg overflow-hidden" style={{ height: '600px' }}>
                  <iframe
                    ref={iframeRef}
                    src={simulation.simulation_url}
                    className="w-full h-full"
                    title={simulation.display_name_km}
                    onLoad={() => {
                      if (session?.id) {
                        logActivity(
                          'Simulation loaded',
                          'បានផ្ទុកការសាកល្បង',
                          'Iframe content ready',
                          'មាតិកា Iframe រួចរាល់'
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
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-hanuman">វឌ្ឍនភាព</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2 font-hanuman">
                      <span>ការបញ្ចប់</span>
                      <span>{calculateProgress()}%</span>
                    </div>
                    <Progress value={calculateProgress()} />
                  </div>
                  <div className="text-sm space-y-1 font-hanuman">
                    <div className="flex justify-between">
                      <span>រយៈពេលប្រើប្រាស់:</span>
                      <span className="font-medium">{formatDuration(elapsedTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>សំណួរដែលបានឆ្លើយ:</span>
                      <span className="font-medium">{Object.keys(answers).length}/{exercises.length}</span>
                    </div>
                    {submission && (
                      <div className="flex justify-between font-bold text-green-600">
                        <span>ពិន្ទុ:</span>
                        <span>{submission.total_score}/{submission.max_score}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activity Log */}
            <Card className="border-blue-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                <CardTitle className="text-lg flex items-center gap-2 font-hanuman">
                  <Activity className="h-4 w-4 text-blue-600" />
                  កំណត់ហេតុសកម្មភាព
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {activityLogs.map((log, index) => (
                    <div key={index} className="text-xs border-l-2 border-gray-200 pl-3 py-1">
                      <div className="font-medium font-hanuman">{log.action_km}</div>
                      <div className="text-gray-500 font-hanuman">{log.details_km}</div>
                      <div className="text-gray-400">
                        {format(new Date(log.timestamp), 'HH:mm:ss')}
                        {log.duration && ` • ${formatDuration(log.duration)}`}
                      </div>
                    </div>
                  ))}
                  {activityLogs.length === 0 && (
                    <p className="text-gray-500 text-sm font-hanuman">
                      មិនមានសកម្មភាពនៅឡើយទេ
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Exercises Section */}
        <Card className="mt-6 border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardTitle className="flex items-center gap-2 font-hanuman">
              <BookOpen className="h-5 w-5 text-blue-600" />
              លំហាត់
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="exercises" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="exercises" className="font-hanuman data-[state=active]:bg-blue-600 data-[state=active]:text-white">សំណួរ</TabsTrigger>
                <TabsTrigger value="instructions" className="font-hanuman data-[state=active]:bg-blue-600 data-[state=active]:text-white">ការណែនាំ</TabsTrigger>
              </TabsList>
              
              <TabsContent value="exercises" className="space-y-6 mt-6">
                {exercises.map((exercise, index) => (
                  <div key={exercise.id} className="border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium flex items-center gap-2 font-hanuman">
                          សំណួរទី {index + 1}
                          <Badge variant="outline">{exercise.points} ពិន្ទុ</Badge>
                          {exercise.difficulty_level && (
                            <Badge className={getDifficultyColor(exercise.difficulty_level)}>
                              {getDifficultyText(exercise.difficulty_level)}
                            </Badge>
                          )}
                        </h3>
                        <p className="mt-2 font-medium font-hanuman">
                          {exercise.question_km}
                        </p>
                        {exercise.instructions_km && (
                          <p className="text-sm text-gray-600 mt-1 italic font-hanuman">
                            {exercise.instructions_km}
                          </p>
                        )}
                      </div>
                      {answers[exercise.id] && (
                        <CheckCircle className="h-5 w-5 text-green-500 ml-2" />
                      )}
                    </div>
                    
                    {/* Multiple Choice */}
                    {exercise.question_type === 'multiple_choice' && exercise.options && (
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
                        className="space-y-2 mt-3"
                      >
                        {exercise.options.options_km.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center space-x-2">
                            <RadioGroupItem value={exercise.options!.options_en[optIndex]} id={`${exercise.id}-${optIndex}`} />
                            <Label htmlFor={`${exercise.id}-${optIndex}`} className="cursor-pointer font-hanuman">
                              {option}
                            </Label>
                          </div>
                        ))}
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
                          <RadioGroupItem value="true" id={`${exercise.id}-true`} />
                          <Label htmlFor={`${exercise.id}-true`} className="cursor-pointer font-hanuman">
                            ពិត
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="false" id={`${exercise.id}-false`} />
                          <Label htmlFor={`${exercise.id}-false`} className="cursor-pointer font-hanuman">
                            មិនពិត
                          </Label>
                        </div>
                      </RadioGroup>
                    )}
                    
                    {/* Calculation */}
                    {exercise.question_type === 'calculation' && (
                      <Input
                        type="text"
                        placeholder="បញ្ចូលចម្លើយរបស់អ្នក..."
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
                        className="mt-3 font-hanuman border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    )}
                    
                    {/* Short Answer */}
                    {exercise.question_type === 'short_answer' && (
                      <Textarea
                        placeholder="សរសេរចម្លើយរបស់អ្នក..."
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
                        className="mt-3 font-hanuman border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        rows={3}
                      />
                    )}
                    
                    {/* Hint Button */}
                    {exercise.hints_km && (
                      <div className="mt-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowHint(prev => ({ ...prev, [exercise.id]: !prev[exercise.id] }))}
                          className="text-blue-600 hover:bg-blue-50 font-hanuman"
                        >
                          <HelpCircle className="h-4 w-4 mr-1" />
                          ជំនួយ
                        </Button>
                        {showHint[exercise.id] && (
                          <Alert className="mt-2 border-blue-200 bg-blue-50">
                            <AlertDescription className="font-hanuman text-blue-800">
                              {exercise.hints_km}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    )}
                    
                    {/* Show explanation after submission */}
                    {submission && submission.details?.[exercise.id] && (
                      <Alert className={`mt-3 ${submission.details[exercise.id].is_correct ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                        <AlertDescription>
                          <div className={`font-medium mb-1 font-hanuman ${submission.details[exercise.id].is_correct ? 'text-green-800' : 'text-red-800'}`}>
                            {submission.details[exercise.id].is_correct ? '✓ ត្រឹមត្រូវ!' : '✗ មិនត្រឹមត្រូវ'}
                          </div>
                          {exercise.explanation_km && (
                            <div className="font-hanuman">{exercise.explanation_km}</div>
                          )}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ))}
                
                <div className="flex justify-end gap-3 mt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      saveProgress();
                      router.push('/student');
                    }}
                    className="font-hanuman border-gray-300 hover:bg-gray-50"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    រក្សាទុក និងចាកចេញ
                  </Button>
                  <Button 
                    onClick={submitExercises}
                    disabled={Object.keys(answers).length === 0 || isSubmitting || !!submission}
                    className="font-hanuman bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Send className="h-4 w-4 mr-1" />
                    {isSubmitting ? 'កំពុងដាក់ស្នើ...' : 'ដាក់ស្នើលំហាត់'}
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="instructions" className="mt-6">
                <div className="prose max-w-none font-hanuman">
                  <h3>ការណែនាំ</h3>
                  <p>{simulation.description_km}</p>
                  
                  <h4>របៀបបញ្ចប់ការសាកល្បងនេះ:</h4>
                  <ol>
                    <li>ធ្វើអន្តរកម្មជាមួយការសាកល្បងដើម្បីស្វែងយល់គោលគំនិត</li>
                    <li>សង្កេតមើលរបៀបដែលប៉ារ៉ាម៉ែត្រផ្សេងៗប៉ះពាល់ដល់លទ្ធផល</li>
                    <li>ឆ្លើយសំណួរលំហាត់ទាំងអស់ដោយផ្អែកលើការសង្កេតរបស់អ្នក</li>
                    <li>ដាក់ស្នើចម្លើយរបស់អ្នកនៅពេលបញ្ចប់</li>
                  </ol>
                  
                  <h4>គន្លឹះ:</h4>
                  <ul>
                    <li>ចំណាយពេលដើម្បីយល់ពីការសាកល្បង</li>
                    <li>សាកល្បងតម្លៃផ្សេងៗហើយសង្កេតលំនាំ</li>
                    <li>វឌ្ឍនភាពរបស់អ្នកត្រូវបានរក្សាទុកដោយស្វ័យប្រវត្តិ</li>
                    <li>អ្នកអាចត្រឡប់មកការសាកល្បងនេះក្រោយពេលក្រោយប្រសិនបើចាំបាច់</li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}