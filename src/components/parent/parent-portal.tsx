'use client';

import { useState, useEffect } from 'react';
import { User } from '../../lib/auth';
import { usePermissions } from '../../hooks/use-permissions';
import { PERMISSIONS, LMS_PERMISSIONS } from '../../lib/permissions';
import { PermissionGuard } from '../auth/permission-guard';
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

  return (
    <PermissionGuard
      user={user}
      permission={PERMISSIONS.PAGES.PARENT_PORTAL}
      fallbackComponent={
        <div className="text-center p-8">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">You don't have access to the parent portal.</p>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Parent Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-4 sm:p-6 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Avatar className="h-16 w-16 border-2 border-white">
                <AvatarImage src={user.avatarUrl} />
                <AvatarFallback className="bg-white text-green-600 text-xl font-bold">
                  {user.name?.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">
                  Welcome, {user.name?.split(' ')[0]}!
                </h1>
                <p className="text-green-100">
                  Parent Portal • {children.length} Child{children.length !== 1 ? 'ren' : ''}
                </p>
              </div>
            </div>

            {children.length > 1 && (
              <div className="w-full sm:w-64">
                <Select value={selectedChildId} onValueChange={setSelectedChildId}>
                  <SelectTrigger className="bg-white text-gray-900">
                    <SelectValue placeholder="Select a child" />
                  </SelectTrigger>
                  <SelectContent>
                    {children.map((child) => (
                      <SelectItem key={child.id} value={child.id}>
                        {child.firstName} {child.lastName} ({child.grade})
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
            {/* Child Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <Card>
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm font-medium text-gray-600">Overall GPA</p>
                      <p className="text-lg md:text-2xl font-bold">{selectedChild.overallGPA.toFixed(2)}</p>
                    </div>
                    <Award className="h-6 w-6 md:h-8 md:w-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm font-medium text-gray-600">Attendance Rate</p>
                      <p className="text-lg md:text-2xl font-bold">{selectedChild.attendanceRate}%</p>
                    </div>
                    <CheckCircle className={`h-6 w-6 md:h-8 md:w-8 ${selectedChild.attendanceRate >= 90 ? 'text-green-500' : 'text-orange-500'}`} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm font-medium text-gray-600">STEM Simulations</p>
                      <p className="text-lg md:text-2xl font-bold">{selectedChild.enrolledCourses}</p>
                    </div>
                    <FlaskConical className="h-6 w-6 md:h-8 md:w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm font-medium text-gray-600">Pending Work</p>
                      <p className="text-lg md:text-2xl font-bold">{selectedChild.pendingAssignments}</p>
                    </div>
                    <FileText className={`h-6 w-6 md:h-8 md:w-8 ${selectedChild.pendingAssignments > 5 ? 'text-red-500' : 'text-orange-500'}`} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Child Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  {selectedChild.firstName} {selectedChild.lastName}
                </CardTitle>
                <CardDescription>
                  Grade {selectedChild.grade} • {selectedChild.username} • Status: {selectedChild.academicStatus}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedChild.profilePictureUrl} />
                    <AvatarFallback className="text-xl font-bold">
                      {selectedChild.firstName[0]}{selectedChild.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Academic Status:</span>
                        <Badge className="ml-2" variant={selectedChild.academicStatus === 'active' ? 'default' : 'secondary'}>
                          {selectedChild.academicStatus}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium">GPA: </span>
                        <span>{selectedChild.overallGPA.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="font-medium">Attendance: </span>
                        <span>{selectedChild.attendanceRate}%</span>
                      </div>
                      <div>
                        <span className="font-medium">Courses: </span>
                        <span>{selectedChild.enrolledCourses}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Main Content Tabs */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
                <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
                <TabsTrigger value="simulations" className="text-xs sm:text-sm">STEM Labs</TabsTrigger>
                <TabsTrigger value="grades" className="text-xs sm:text-sm">Grades</TabsTrigger>
                <TabsTrigger value="attendance" className="text-xs sm:text-sm hidden md:inline-flex">Attendance</TabsTrigger>
                <TabsTrigger value="teachers" className="text-xs sm:text-sm hidden md:inline-flex">Teachers</TabsTrigger>
                <TabsTrigger value="communication" className="text-xs sm:text-sm hidden md:inline-flex">Messages</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Grades */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Recent Grades
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {getRecentGrades().map((grade) => (
                          <div key={grade.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{grade.assignment}</p>
                              <p className="text-sm text-gray-500">{grade.course}</p>
                              <p className="text-xs text-gray-400">
                                {new Date(grade.date).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">{grade.score}/{grade.maxScore}</p>
                              <Badge variant={grade.percentage >= 90 ? 'default' : grade.percentage >= 70 ? 'secondary' : 'destructive'}>
                                {grade.percentage}%
                              </Badge>
                            </div>
                          </div>
                        ))}
                        {getRecentGrades().length === 0 && (
                          <p className="text-gray-500 text-center py-4">No recent grades</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Attendance */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Recent Attendance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {getRecentAttendance().map((attendance) => (
                          <div key={attendance.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{attendance.course}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(attendance.date).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge variant={
                              attendance.status === 'present' ? 'default' :
                              attendance.status === 'late' ? 'secondary' :
                              attendance.status === 'excused' ? 'outline' : 'destructive'
                            }>
                              {attendance.status}
                            </Badge>
                          </div>
                        ))}
                        {getRecentAttendance().length === 0 && (
                          <p className="text-gray-500 text-center py-4">No attendance records</p>
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
          <Card>
            <CardContent className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Children Found</h3>
              <p className="text-gray-600">No child accounts are linked to your parent account.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </PermissionGuard>
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

  return (
    <div className="space-y-6">
      {/* STEM Statistics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <FlaskConical className="mx-auto h-8 w-8 text-purple-600 mb-2" />
              <p className="text-2xl font-bold text-purple-600">{stats.totalSimulations}</p>
              <p className="text-sm text-gray-600">Total Simulations</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="mx-auto h-8 w-8 text-green-600 mb-2" />
              <p className="text-2xl font-bold text-green-600">{stats.completedSimulations}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="mx-auto h-8 w-8 text-yellow-600 mb-2" />
              <p className="text-2xl font-bold text-yellow-600">{stats.averageScore.toFixed(1)}</p>
              <p className="text-sm text-gray-600">Avg Score</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="mx-auto h-8 w-8 text-blue-600 mb-2" />
              <p className="text-2xl font-bold text-blue-600">{Math.round(stats.totalTimeSpent / 60)}h</p>
              <p className="text-sm text-gray-600">Study Time</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Subject Filter */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5" />
              STEM Simulation Progress
            </CardTitle>
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSimulations.map((simulation) => {
              const SubjectIcon = getSubjectIcon(simulation.subject);
              const subjectColor = getSubjectColor(simulation.subject);
              
              return (
                <Card key={simulation.id} className="border-l-4 border-l-purple-500">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <SubjectIcon className={`h-5 w-5 ${subjectColor}`} />
                          <div>
                            <h4 className="font-medium">{simulation.title}</h4>
                            <p className="text-sm text-gray-500">{simulation.subject}</p>
                          </div>
                        </div>
                        <Badge variant={simulation.progress.completed ? 'default' : 'secondary'}>
                          {simulation.progress.completed ? 'Completed' : 'In Progress'}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span className="font-medium">{simulation.progress.percentage}%</span>
                        </div>
                        <Progress value={simulation.progress.percentage} className="h-2" />
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <p className="font-medium text-blue-600">{simulation.progress.timeSpent}m</p>
                          <p className="text-gray-500">Time Spent</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium text-orange-600">{simulation.progress.attempts}</p>
                          <p className="text-gray-500">Attempts</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium text-green-600">{simulation.progress.bestScore}/10</p>
                          <p className="text-gray-500">Best Score</p>
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