'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  ArrowLeft, 
  Play, 
  Edit, 
  Users, 
  Clock, 
  TrendingUp, 
  BookOpen,
  Target,
  Eye,
  Download,
  Share,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  GraduationCap,
  Award,
  Activity,
  Calendar,
  FileText,
  ExternalLink,
  Maximize2,
  Minimize2,
  RefreshCw
} from 'lucide-react';

interface SimulationDetails {
  id: string;
  simulation_name: string;
  display_name_en: string;
  display_name_km: string;
  description_en: string;
  description_km: string;
  subject_area: string;
  difficulty_level: string;
  grade_levels: number[];
  estimated_duration: number;
  learning_objectives_en: string[];
  learning_objectives_km: string[];
  simulation_url: string;
  preview_image: string;
  tags: string[];
  is_featured: boolean;
  is_active: boolean;
  total_attempts: number;
  total_completions: number;
  average_score?: number;
  average_time?: number;
}

interface StudentProgress {
  student_id: string;
  student_name: string;
  attempts: number;
  best_score: number;
  total_time: number;
  status: 'completed' | 'in_progress' | 'not_started';
  last_activity: string;
}

export default function TeacherSimulationPreview() {
  const router = useRouter();
  const params = useParams();
  const simulationId = params.id as string;
  
  const [simulation, setSimulation] = useState<SimulationDetails | null>(null);
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showSimulation, setShowSimulation] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  useEffect(() => {
    fetchSimulationDetails();
    fetchStudentProgress();
  }, [simulationId]);

  const fetchSimulationDetails = async () => {
    try {
      const response = await fetch(`/api/simulations/${simulationId}`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setSimulation(data.simulation);
      }
    } catch (error) {
      console.error('Error fetching simulation:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentProgress = async () => {
    // Mock data for now - this would fetch from API
    setStudents([
      {
        student_id: '1',
        student_name: 'Sokha Kim',
        attempts: 3,
        best_score: 85,
        total_time: 45,
        status: 'completed',
        last_activity: '2 hours ago'
      },
      {
        student_id: '2', 
        student_name: 'Dara Chan',
        attempts: 2,
        best_score: 72,
        total_time: 38,
        status: 'in_progress',
        last_activity: '1 day ago'
      },
      {
        student_id: '3',
        student_name: 'Bopha Sok', 
        attempts: 0,
        best_score: 0,
        total_time: 0,
        status: 'not_started',
        last_activity: 'Never'
      }
    ]);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="h-3 w-3 mr-1" />In Progress</Badge>;
      case 'not_started':
        return <Badge className="bg-gray-100 text-gray-800"><XCircle className="h-3 w-3 mr-1" />Not Started</Badge>;
      default:
        return null;
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'bg-green-100 text-green-800';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'Advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const refreshSimulation = () => {
    setIframeKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        </div>
      </div>
    );
  }

  if (!simulation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Simulation not found</h2>
          <Button onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 font-hanuman">
                {simulation.display_name_km}
              </h1>
              <p className="text-lg text-gray-600 mt-1">{simulation.display_name_en}</p>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard/simulations')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Simulations
              </Button>
              
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/dashboard/simulations/${simulationId}/edit`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                {!showSimulation ? (
                  <Button
                    onClick={() => setShowSimulation(true)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Preview Simulation
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setShowSimulation(false)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Hide Simulation
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold">{students.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold">
                    {students.length > 0 
                      ? Math.round((students.filter(s => s.status === 'completed').length / students.length) * 100)
                      : 0}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg. Score</p>
                  <p className="text-2xl font-bold">
                    {students.filter(s => s.best_score > 0).length > 0
                      ? Math.round(students.filter(s => s.best_score > 0).reduce((sum, s) => sum + s.best_score, 0) / students.filter(s => s.best_score > 0).length)
                      : 0}%
                  </p>
                </div>
                <Award className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg. Time</p>
                  <p className="text-2xl font-bold">
                    {students.filter(s => s.total_time > 0).length > 0
                      ? Math.round(students.filter(s => s.total_time > 0).reduce((sum, s) => sum + s.total_time, 0) / students.filter(s => s.total_time > 0).length)
                      : 0} min
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Simulation Preview */}
        {showSimulation && simulation.simulation_url && (
          <Card className={`mb-6 transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''}`}>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle>Simulation Preview</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refreshSimulation}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleFullscreen}
                  >
                    {isFullscreen ? (
                      <Minimize2 className="h-4 w-4" />
                    ) : (
                      <Maximize2 className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(simulation.simulation_url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className={`p-0 ${isFullscreen ? 'h-[calc(100vh-5rem)]' : 'h-[600px]'}`}>
              <iframe
                key={iframeKey}
                src={simulation.simulation_url}
                className="w-full h-full border-0"
                title={simulation.display_name_en}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="overview">
              <Eye className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="students">
              <Users className="h-4 w-4 mr-2" />
              Students
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Simulation Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Subject</p>
                    <Badge className="bg-blue-100 text-blue-800">{simulation.subject_area}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Difficulty</p>
                    <Badge className={getDifficultyColor(simulation.difficulty_level)}>
                      {simulation.difficulty_level}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Duration</p>
                    <p className="font-medium">{simulation.estimated_duration} minutes</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Grade Levels</p>
                    <p className="font-medium">Grades {simulation.grade_levels.join(', ')}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Description</p>
                  <p className="text-gray-800 font-hanuman">{simulation.description_km}</p>
                  <p className="text-gray-600 mt-2">{simulation.description_en}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Learning Objectives</p>
                  <ul className="space-y-2">
                    {simulation.learning_objectives_en.map((obj, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Target className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          {simulation.learning_objectives_km?.[index] && (
                            <p className="font-hanuman text-gray-800">{simulation.learning_objectives_km[index]}</p>
                          )}
                          <p className="text-gray-600">{obj}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {simulation.tags && simulation.tags.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {simulation.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preview & Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Download Teacher Guide
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Export Student Data
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Share className="h-4 w-4 mr-2" />
                    Share with Students
                  </Button>
                  <Button 
                    variant="outline" 
                    className="justify-start"
                    onClick={() => window.open(simulation.simulation_url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View in New Tab
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Student Progress</CardTitle>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-center">Attempts</TableHead>
                        <TableHead className="text-center">Best Score</TableHead>
                        <TableHead className="text-center">Time Spent</TableHead>
                        <TableHead>Last Activity</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => (
                        <TableRow key={student.student_id}>
                          <TableCell className="font-medium">{student.student_name}</TableCell>
                          <TableCell>{getStatusBadge(student.status)}</TableCell>
                          <TableCell className="text-center">{student.attempts}</TableCell>
                          <TableCell className="text-center">
                            {student.best_score > 0 ? `${student.best_score}%` : '-'}
                          </TableCell>
                          <TableCell className="text-center">
                            {student.total_time > 0 ? `${student.total_time} min` : '-'}
                          </TableCell>
                          <TableCell className="text-gray-600">{student.last_activity}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/dashboard/students/${student.student_id}`)}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Completion Rate</span>
                        <span className="text-sm font-medium">
                          {Math.round((students.filter(s => s.status === 'completed').length / students.length) * 100)}%
                        </span>
                      </div>
                      <Progress 
                        value={(students.filter(s => s.status === 'completed').length / students.length) * 100} 
                        className="h-2"
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Average Score</span>
                        <span className="text-sm font-medium">
                          {students.filter(s => s.best_score > 0).length > 0
                            ? Math.round(students.filter(s => s.best_score > 0).reduce((sum, s) => sum + s.best_score, 0) / students.filter(s => s.best_score > 0).length)
                            : 0}%
                        </span>
                      </div>
                      <Progress 
                        value={students.filter(s => s.best_score > 0).length > 0
                          ? students.filter(s => s.best_score > 0).reduce((sum, s) => sum + s.best_score, 0) / students.filter(s => s.best_score > 0).length
                          : 0} 
                        className="h-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Engagement Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm text-gray-600">Total Attempts</span>
                      <span className="font-medium">{students.reduce((sum, s) => sum + s.attempts, 0)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm text-gray-600">Students Started</span>
                      <span className="font-medium">{students.filter(s => s.attempts > 0).length}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm text-gray-600">Students Completed</span>
                      <span className="font-medium">{students.filter(s => s.status === 'completed').length}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600">Avg. Attempts per Student</span>
                      <span className="font-medium">
                        {students.length > 0 
                          ? (students.reduce((sum, s) => sum + s.attempts, 0) / students.length).toFixed(1)
                          : 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {students
                    .filter(s => s.attempts > 0)
                    .sort((a, b) => {
                      // Sort by last activity (mock sorting for demo)
                      const order = ['2 hours ago', '1 day ago', 'Never'];
                      return order.indexOf(a.last_activity) - order.indexOf(b.last_activity);
                    })
                    .slice(0, 5)
                    .map((student) => (
                      <div key={student.student_id} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div className="flex items-center gap-3">
                          <Activity className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-medium">{student.student_name}</p>
                            <p className="text-sm text-gray-600">
                              {student.status === 'completed' ? 'Completed' : 'In progress'} - Score: {student.best_score}%
                            </p>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">{student.last_activity}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}