'use client';

import { useState, useEffect } from 'react';
import { User } from '../../lib/auth';
import { usePermissions } from '../../hooks/use-permissions';
import { PERMISSIONS, LMS_PERMISSIONS } from '../../lib/permissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  Users, 
  FileText, 
  MessageSquare,
  Phone,
  Mail,
  Award,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  User as UserIcon,
  FlaskConical,
  Play,
  Star,
  Zap,
  Brain,
  Atom,
  BarChart3
} from 'lucide-react';

interface ParentPortalProps {
  user: User;
}

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  grade: string;
  profilePictureUrl?: string;
  academicStatus: string;
  overallGPA: number;
  attendanceRate: number;
  enrolledCourses: number;
  pendingAssignments: number;
}

interface ChildGrade {
  id: string;
  course: string;
  assignment: string;
  score: number;
  maxScore: number;
  percentage: number;
  date: Date;
  teacher: string;
}

interface ChildAttendance {
  id: string;
  course: string;
  date: Date;
  status: 'present' | 'absent' | 'late' | 'excused';
  teacher: string;
}

interface TeacherContact {
  id: string;
  name: string;
  subject: string;
  email: string;
  phone?: string;
  courseId: string;
}

interface SimulationProgress {
  id: string;
  simulationId: string;
  simulationName: string;
  title: string;
  titleKm: string;
  subject: string;
  difficulty: string;
  progress: {
    percentage: number;
    timeSpent: number;
    attempts: number;
    bestScore: number;
    completed: boolean;
    lastAccessed: string;
  };
  assignment?: {
    title: string;
    dueDate: string;
    status: string;
    score?: number;
    maxScore?: number;
  };
}

interface SimulationStats {
  totalSimulations: number;
  completedSimulations: number;
  averageScore: number;
  totalTimeSpent: number;
  subjectBreakdown: {
    Physics: number;
    Chemistry: number;
    Biology: number;
    Mathematics: number;
  };
  totalAchievements: number;
}

export function ParentPortal({ user }: ParentPortalProps) {
  const permissions = usePermissions(user);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [childGrades, setChildGrades] = useState<ChildGrade[]>([]);
  const [childAttendance, setChildAttendance] = useState<ChildAttendance[]>([]);
  const [teachers, setTeachers] = useState<TeacherContact[]>([]);
  const [simulations, setSimulations] = useState<SimulationProgress[]>([]);
  const [simulationStats, setSimulationStats] = useState<SimulationStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchParentData();
  }, []);

  useEffect(() => {
    if (selectedChildId) {
      fetchChildData(selectedChildId);
    }
  }, [selectedChildId]);

  const fetchParentData = async () => {
    try {
      const response = await fetch('/api/parent/children');
      if (response.ok) {
        const data = await response.json();
        setChildren(data.children);
        if (data.children.length > 0) {
          setSelectedChildId(data.children[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch parent data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChildData = async (childId: string) => {
    try {
      const [gradesRes, attendanceRes, teachersRes, simulationsRes] = await Promise.all([
        fetch(`/api/parent/child/${childId}/grades`),
        fetch(`/api/parent/child/${childId}/attendance`),
        fetch(`/api/parent/child/${childId}/teachers`),
        fetch(`/api/parent/child/${childId}/simulations`)
      ]);

      if (gradesRes.ok) setChildGrades(await gradesRes.json());
      if (attendanceRes.ok) setChildAttendance(await attendanceRes.json());
      if (teachersRes.ok) setTeachers(await teachersRes.json());
      if (simulationsRes.ok) {
        const simData = await simulationsRes.json();
        if (simData.success) {
          setSimulations(simData.simulations);
          setSimulationStats(simData.stats);
        }
      }
    } catch (error) {
      console.error('Failed to fetch child data:', error);
    }
  };

  const selectedChild = children.find(child => child.id === selectedChildId);

  const getRecentGrades = () => {
    return childGrades
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  };

  const getRecentAttendance = () => {
    return childAttendance
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  };

  const getAttendanceStats = () => {
    const total = childAttendance.length;
    const present = childAttendance.filter(a => a.status === 'present').length;
    const late = childAttendance.filter(a => a.status === 'late').length;
    const absent = childAttendance.filter(a => a.status === 'absent').length;
    const excused = childAttendance.filter(a => a.status === 'excused').length;

    return {
      total,
      present,
      late,
      absent,
      excused,
      presentRate: total > 0 ? Math.round((present / total) * 100) : 0,
      lateRate: total > 0 ? Math.round((late / total) * 100) : 0
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Check if user has parent or guardian role
  if (user.role !== 'parent' && user.role !== 'guardian') {
    return (
      <div className="text-center p-8">
        <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
        <p className="text-gray-600">You don't have access to the parent portal.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen p-4 sm:p-6">
        {/* Parent Header - Simplified and Larger */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-white shadow-lg">
                <AvatarImage src={user.avatarUrl} />
                <AvatarFallback className="bg-white text-blue-700 text-2xl sm:text-3xl font-bold">
                  {user.name?.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold font-hanuman">
                  សូមស្វាគមន៍ {user.name?.split(' ')[0]}!
                </h1>
                <p className="text-xl sm:text-2xl text-blue-100 mt-2 font-hanuman">
                  ទំព័រមាតាបិតា • កូន {children.length} នាក់
                </p>
              </div>
            </div>

            {children.length > 1 && (
              <div className="w-full sm:w-80">
                <Select value={selectedChildId} onValueChange={setSelectedChildId}>
                  <SelectTrigger className="bg-white text-gray-900 h-14 text-lg font-hanuman border-2 border-blue-300">
                    <SelectValue placeholder="ជ្រើសរើសកូន" />
                  </SelectTrigger>
                  <SelectContent>
                    {children.map((child) => (
                      <SelectItem key={child.id} value={child.id} className="text-lg py-3 font-hanuman">
                        {child.firstName} {child.lastName} (ថ្នាក់ទី {child.grade})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        {selectedChild && (
          <>
            {/* Child Summary Cards - Larger and Clearer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <Card className="border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <Award className="h-12 w-12 sm:h-16 sm:w-16 text-yellow-500 mb-3" />
                    <p className="text-lg sm:text-xl font-bold text-gray-700 mb-1 font-hanuman">ពិន្ទុសរុប</p>
                    <p className="text-sm text-gray-500 mb-2">Overall Score</p>
                    <p className="text-3xl sm:text-4xl font-bold text-blue-700">{selectedChild.overallGPA.toFixed(1)}/10</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <CheckCircle className={`h-12 w-12 sm:h-16 sm:w-16 mb-3 ${selectedChild.attendanceRate >= 90 ? 'text-green-500' : 'text-orange-500'}`} />
                    <p className="text-lg sm:text-xl font-bold text-gray-700 mb-1 font-hanuman">វត្តមាន</p>
                    <p className="text-sm text-gray-500 mb-2">Attendance</p>
                    <p className="text-3xl sm:text-4xl font-bold text-green-700">{selectedChild.attendanceRate}%</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <FlaskConical className="h-12 w-12 sm:h-16 sm:w-16 text-purple-500 mb-3" />
                    <p className="text-lg sm:text-xl font-bold text-gray-700 mb-1 font-hanuman">មេរៀនវិទ្យាសាស្ត្រ</p>
                    <p className="text-sm text-gray-500 mb-2">Science Lessons</p>
                    <p className="text-3xl sm:text-4xl font-bold text-purple-700">{selectedChild.enrolledCourses}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <FileText className={`h-12 w-12 sm:h-16 sm:w-16 mb-3 ${selectedChild.pendingAssignments > 3 ? 'text-red-500' : 'text-blue-500'}`} />
                    <p className="text-lg sm:text-xl font-bold text-gray-700 mb-1 font-hanuman">កិច្ចការមិនទាន់បញ្ចប់</p>
                    <p className="text-sm text-gray-500 mb-2">Homework Left</p>
                    <p className={`text-3xl sm:text-4xl font-bold ${selectedChild.pendingAssignments > 3 ? 'text-red-600' : 'text-blue-700'}`}>
                      {selectedChild.pendingAssignments}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Child Details - Simplified and Larger */}
            <Card className="border-2 border-blue-200 shadow-lg bg-blue-50">
              <CardHeader className="bg-blue-100 pb-6">
                <CardTitle className="flex items-center gap-3 text-2xl sm:text-3xl">
                  <UserIcon className="h-8 w-8 sm:h-10 sm:w-10 text-blue-700" />
                  <div>
                    <p className="font-hanuman text-blue-900">{selectedChild.firstName} {selectedChild.lastName}</p>
                    <p className="text-lg sm:text-xl text-blue-700 font-normal mt-1">ថ្នាក់ទី {selectedChild.grade}</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-blue-300">
                    <AvatarImage src={selectedChild.profilePictureUrl} />
                    <AvatarFallback className="text-2xl sm:text-3xl font-bold bg-blue-100 text-blue-700">
                      {selectedChild.firstName[0]}{selectedChild.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 w-full">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <p className="text-gray-600 mb-1 font-hanuman">ស្ថានភាពសិក្សា</p>
                        <p className="text-xs text-gray-500">Academic Status</p>
                        <Badge className="mt-2" variant="default">
                          <span className="text-lg py-1 font-hanuman">សកម្ម</span>
                        </Badge>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <p className="text-gray-600 mb-1 font-hanuman">អាសយដ្ឋានអ៊ីមែល</p>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-lg font-medium text-blue-700 mt-1">{selectedChild.username}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Main Content Tabs - Larger and Clearer */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 bg-white p-2 h-auto">
                <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white py-3 sm:py-4 text-base sm:text-lg font-hanuman">
                  <div className="text-center">
                    <p>ទិដ្ឋភាពទូទៅ</p>
                    <p className="text-xs mt-1">Overview</p>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="simulations" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white py-3 sm:py-4 text-base sm:text-lg font-hanuman">
                  <div className="text-center">
                    <p>មន្ទីរពិសោធន៍</p>
                    <p className="text-xs mt-1">STEM Labs</p>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="grades" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white py-3 sm:py-4 text-base sm:text-lg font-hanuman">
                  <div className="text-center">
                    <p>ពិន្ទុ</p>
                    <p className="text-xs mt-1">Grades</p>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="attendance" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white py-3 sm:py-4 text-base sm:text-lg font-hanuman">
                  <div className="text-center">
                    <p>វត្តមាន</p>
                    <p className="text-xs mt-1">Attendance</p>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="teachers" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white py-3 sm:py-4 text-base sm:text-lg font-hanuman">
                  <div className="text-center">
                    <p>គ្រូបង្រៀន</p>
                    <p className="text-xs mt-1">Teachers</p>
                  </div>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Grades - Clearer Design */}
                  <Card className="border-2 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 pb-6">
                      <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl">
                        <Award className="h-8 w-8 text-yellow-600" />
                        <span className="font-hanuman">ពិន្ទុថ្មីៗ</span>
                        <span className="text-base text-gray-600 ml-2">Recent Grades</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {getRecentGrades().map((grade) => (
                          <div key={grade.id} className="flex items-center justify-between p-4 bg-gray-50 border-2 rounded-xl hover:bg-gray-100 transition-colors">
                            <div className="flex-1">
                              <p className="font-bold text-lg">{grade.assignment}</p>
                              <p className="text-gray-600 font-hanuman">{grade.course}</p>
                              <p className="text-sm text-gray-500 mt-1">
                                {new Date(grade.date).toLocaleDateString('km-KH', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </p>
                            </div>
                            <div className="text-center ml-4">
                              <p className="text-2xl font-bold text-blue-700">{grade.score}/{grade.maxScore}</p>
                              <Badge 
                                className="mt-2 text-base px-3 py-1"
                                variant={grade.percentage >= 90 ? 'default' : grade.percentage >= 70 ? 'secondary' : 'destructive'}
                              >
                                {grade.percentage}%
                              </Badge>
                            </div>
                          </div>
                        ))}
                        {getRecentGrades().length === 0 && (
                          <div className="text-center py-8">
                            <Award className="h-16 w-16 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 text-lg font-hanuman">មិនមានពិន្ទុថ្មីៗទេ</p>
                            <p className="text-gray-400">No recent grades</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Attendance - Clearer Design */}
                  <Card className="border-2 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 pb-6">
                      <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl">
                        <Calendar className="h-8 w-8 text-green-600" />
                        <span className="font-hanuman">វត្តមានថ្មីៗ</span>
                        <span className="text-base text-gray-600 ml-2">Recent Attendance</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {getRecentAttendance().map((attendance) => (
                          <div key={attendance.id} className="flex items-center justify-between p-4 bg-gray-50 border-2 rounded-xl hover:bg-gray-100 transition-colors">
                            <div className="flex-1">
                              <p className="font-bold text-lg">{attendance.course}</p>
                              <p className="text-gray-600 mt-1">
                                {new Date(attendance.date).toLocaleDateString('km-KH', { 
                                  weekday: 'long',
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </p>
                            </div>
                            <Badge 
                              className="text-base px-4 py-2"
                              variant={
                                attendance.status === 'present' ? 'default' :
                                attendance.status === 'late' ? 'secondary' :
                                attendance.status === 'excused' ? 'outline' : 'destructive'
                              }
                            >
                              <span className="font-hanuman">
                                {attendance.status === 'present' ? 'វត្តមាន' :
                                 attendance.status === 'late' ? 'យឺត' :
                                 attendance.status === 'excused' ? 'សុំច្បាប់' : 'អវត្តមាន'}
                              </span>
                            </Badge>
                          </div>
                        ))}
                        {getRecentAttendance().length === 0 && (
                          <div className="text-center py-8">
                            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 text-lg font-hanuman">មិនមានកំណត់ត្រាវត្តមានទេ</p>
                            <p className="text-gray-400">No attendance records</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="simulations" className="space-y-6">
                <SimulationsDetailView simulations={simulations} stats={simulationStats} />
              </TabsContent>

              <TabsContent value="grades" className="space-y-6">
                <GradesDetailView grades={childGrades} />
              </TabsContent>

              <TabsContent value="attendance" className="space-y-6">
                <AttendanceDetailView attendance={childAttendance} stats={getAttendanceStats()} />
              </TabsContent>

              <TabsContent value="teachers" className="space-y-6">
                <TeachersContactView teachers={teachers} />
              </TabsContent>

              <TabsContent value="communication" className="space-y-6">
                <CommunicationView user={user} childId={selectedChildId} />
              </TabsContent>
            </Tabs>
          </>
        )}

        {children.length === 0 && (
          <Card className="border-2 shadow-lg">
            <CardContent className="text-center py-12">
              <Users className="mx-auto h-20 w-20 text-gray-300 mb-6" />
              <h3 className="text-2xl font-bold text-gray-700 mb-3 font-hanuman">មិនមានកូនភ្ជាប់ទេ</h3>
              <p className="text-lg text-gray-600">No children linked</p>
              <p className="text-gray-500 mt-4">សូមទាក់ទងគ្រូបង្រៀនដើម្បីភ្ជាប់គណនីកូនរបស់អ្នក។</p>
              <p className="text-gray-400">Please contact the teacher to link your child's account.</p>
            </CardContent>
          </Card>
        )}
      </div>
  );
}

function GradesDetailView({ grades }: { grades: ChildGrade[] }) {
  const [courseFilter, setCourseFilter] = useState<string>('all');
  
  const courses = Array.from(new Set(grades.map(g => g.course)));
  const filteredGrades = courseFilter === 'all' ? grades : grades.filter(g => g.course === courseFilter);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Grade Details</CardTitle>
          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courses.map((course) => (
                <SelectItem key={course} value={course}>{course}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {filteredGrades.map((grade) => (
            <div key={grade.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium">{grade.assignment}</h4>
                <p className="text-sm text-gray-500">{grade.course}</p>
                <p className="text-xs text-gray-400">
                  {new Date(grade.date).toLocaleDateString()} • {grade.teacher}
                </p>
              </div>
              
              <div className="text-right">
                <p className="font-bold text-lg">{grade.score}/{grade.maxScore}</p>
                <p className="text-sm text-gray-500">{grade.percentage}%</p>
                <Badge variant={grade.percentage >= 90 ? 'default' : grade.percentage >= 70 ? 'secondary' : 'destructive'}>
                  {grade.percentage >= 90 ? 'A' : grade.percentage >= 80 ? 'B' : grade.percentage >= 70 ? 'C' : grade.percentage >= 60 ? 'D' : 'F'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function AttendanceDetailView({ attendance, stats }: { attendance: ChildAttendance[]; stats: any }) {
  return (
    <div className="space-y-6">
      {/* Attendance Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.present}</p>
            <p className="text-sm text-gray-600">Present</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">{stats.late}</p>
            <p className="text-sm text-gray-600">Late</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
            <p className="text-sm text-gray-600">Absent</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.excused}</p>
            <p className="text-sm text-gray-600">Excused</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{stats.presentRate}%</p>
            <p className="text-sm text-gray-600">Present Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Records */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {attendance.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{record.course}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(record.date).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant={
                  record.status === 'present' ? 'default' :
                  record.status === 'late' ? 'secondary' :
                  record.status === 'excused' ? 'outline' : 'destructive'
                }>
                  {record.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TeachersContactView({ teachers }: { teachers: TeacherContact[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Teacher Contacts</CardTitle>
        <CardDescription>Contact information for your child's teachers</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teachers.map((teacher) => (
            <Card key={teacher.id}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium">{teacher.name}</h4>
                    <p className="text-sm text-gray-500">{teacher.subject}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4" />
                      <a href={`mailto:${teacher.email}`} className="text-blue-600 hover:underline">
                        {teacher.email}
                      </a>
                    </div>
                    {teacher.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4" />
                        <a href={`tel:${teacher.phone}`} className="text-blue-600 hover:underline">
                          {teacher.phone}
                        </a>
                      </div>
                    )}
                  </div>
                  
                  <Button variant="outline" size="sm" className="w-full">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SimulationsDetailView({ simulations, stats }: { simulations: SimulationProgress[]; stats: SimulationStats | null }) {
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  
  const subjects = Array.from(new Set(simulations.map(s => s.subject)));
  const filteredSimulations = subjectFilter === 'all' ? simulations : simulations.filter(s => s.subject === subjectFilter);

  const getSubjectIcon = (subject: string) => {
    switch (subject) {
      case 'Physics': return Zap;
      case 'Chemistry': return Atom;
      case 'Biology': return Brain;
      case 'Mathematics': return BarChart3;
      default: return FlaskConical;
    }
  };

  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case 'Physics': return 'text-blue-600';
      case 'Chemistry': return 'text-green-600';
      case 'Biology': return 'text-purple-600';
      case 'Mathematics': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getSubjectName = (subject: string) => {
    switch (subject) {
      case 'Physics': return 'រូបវិទ្យា';
      case 'Chemistry': return 'គីមីវិទ្យា';
      case 'Biology': return 'ជីវវិទ្យា';
      case 'Mathematics': return 'គណិតវិទ្យា';
      default: return 'វិទ្យាសាស្ត្រ';
    }
  };

  return (
    <div className="space-y-6 mt-6">
      {/* STEM Statistics - Larger and Clearer */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="border-2 shadow-lg">
            <CardContent className="p-6 text-center">
              <FlaskConical className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-purple-600 mb-3" />
              <p className="text-3xl sm:text-4xl font-bold text-purple-600">{stats.totalSimulations}</p>
              <p className="text-lg font-hanuman text-gray-700 mt-1">មេរៀនសរុប</p>
              <p className="text-sm text-gray-500">Total Lessons</p>
            </CardContent>
          </Card>
          <Card className="border-2 shadow-lg">
            <CardContent className="p-6 text-center">
              <CheckCircle className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-green-600 mb-3" />
              <p className="text-3xl sm:text-4xl font-bold text-green-600">{stats.completedSimulations}</p>
              <p className="text-lg font-hanuman text-gray-700 mt-1">បានបញ្ចប់</p>
              <p className="text-sm text-gray-500">Completed</p>
            </CardContent>
          </Card>
          <Card className="border-2 shadow-lg">
            <CardContent className="p-6 text-center">
              <Star className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-yellow-600 mb-3" />
              <p className="text-3xl sm:text-4xl font-bold text-yellow-600">{stats.averageScore.toFixed(1)}/10</p>
              <p className="text-lg font-hanuman text-gray-700 mt-1">ពិន្ទុមធ្យម</p>
              <p className="text-sm text-gray-500">Average Score</p>
            </CardContent>
          </Card>
          <Card className="border-2 shadow-lg">
            <CardContent className="p-6 text-center">
              <Clock className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-blue-600 mb-3" />
              <p className="text-3xl sm:text-4xl font-bold text-blue-600">{Math.round(stats.totalTimeSpent / 60)}ម៉ោង</p>
              <p className="text-lg font-hanuman text-gray-700 mt-1">ពេលសិក្សា</p>
              <p className="text-sm text-gray-500">Study Time</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Subject Filter - Clearer Design */}
      <Card className="border-2 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl">
              <FlaskConical className="h-8 w-8 text-purple-600" />
              <span className="font-hanuman">វឌ្ឍនភាពមន្ទីរពិសោធន៍</span>
              <span className="text-base text-gray-600 ml-2">Lab Progress</span>
            </CardTitle>
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-full sm:w-64 h-12 text-lg border-2">
                <SelectValue placeholder="ជ្រើសរើសមុខវិជ្ជា" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-lg py-3 font-hanuman">មុខវិជ្ជាទាំងអស់</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject} value={subject} className="text-lg py-3 font-hanuman">
                    {getSubjectName(subject)} ({subject})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredSimulations.map((simulation) => {
              const SubjectIcon = getSubjectIcon(simulation.subject);
              const subjectColor = getSubjectColor(simulation.subject);
              
              return (
                <Card key={simulation.id} className="border-2 border-l-8 border-l-purple-500 shadow-lg hover:shadow-xl transition-all">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`p-3 rounded-xl bg-purple-100`}>
                            <SubjectIcon className={`h-8 w-8 ${subjectColor}`} />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-lg sm:text-xl font-hanuman">{simulation.titleKm}</h4>
                            <p className="text-gray-600 mt-1">{simulation.title}</p>
                            <p className="text-sm text-gray-500 mt-1">{getSubjectName(simulation.subject)}</p>
                          </div>
                        </div>
                        <Badge 
                          className="text-base px-3 py-1"
                          variant={simulation.progress.completed ? 'default' : 'secondary'}
                        >
                          <span className="font-hanuman">
                            {simulation.progress.completed ? 'បានបញ្ចប់' : 'កំពុងរៀន'}
                          </span>
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between text-base">
                          <span className="font-hanuman text-gray-700">វឌ្ឍនភាព</span>
                          <span className="font-bold text-lg">{simulation.progress.percentage}%</span>
                        </div>
                        <Progress value={simulation.progress.percentage} className="h-4 bg-gray-200" />
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-blue-50 rounded-lg p-3">
                          <p className="text-2xl font-bold text-blue-700">{simulation.progress.timeSpent}នាទី</p>
                          <p className="text-sm text-gray-600 font-hanuman">ពេលវេលា</p>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-3">
                          <p className="text-2xl font-bold text-orange-700">{simulation.progress.attempts}ដង</p>
                          <p className="text-sm text-gray-600 font-hanuman">ព្យាយាម</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3">
                          <p className="text-2xl font-bold text-green-700">{simulation.progress.bestScore}/10</p>
                          <p className="text-sm text-gray-600 font-hanuman">ពិន្ទុខ្ពស់</p>
                        </div>
                      </div>

                      {simulation.assignment && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-sm">{simulation.assignment.title}</p>
                              <p className="text-xs text-gray-500">
                                Due: {new Date(simulation.assignment.dueDate).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge variant={
                              simulation.assignment.status === 'completed' ? 'default' :
                              simulation.assignment.status === 'pending' ? 'secondary' : 'destructive'
                            }>
                              {simulation.assignment.status}
                            </Badge>
                          </div>
                          {simulation.assignment.score && (
                            <p className="text-sm mt-1">
                              Score: {simulation.assignment.score}/{simulation.assignment.maxScore}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {filteredSimulations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FlaskConical className="mx-auto h-12 w-12 mb-4" />
              <p>No simulations found for the selected filter.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CommunicationView({ user, childId }: { user: User; childId: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Communication Center
        </CardTitle>
        <CardDescription>Messages and announcements</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-gray-500">
          <MessageSquare className="mx-auto h-12 w-12 mb-4" />
          <p>Communication features will be implemented here.</p>
          <p className="text-sm">View messages from teachers and school announcements.</p>
        </div>
      </CardContent>
    </Card>
  );
}