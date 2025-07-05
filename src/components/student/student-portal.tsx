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
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  GraduationCap, 
  FileText, 
  Users, 
  Award,
  MessageSquare,
  Download,
  Eye,
  Upload
} from 'lucide-react';

interface StudentPortalProps {
  user: User;
}

interface Course {
  id: string;
  name: string;
  code: string;
  teacher: string;
  grade: string;
  attendance: number;
  progress: number;
  status: 'enrolled' | 'completed' | 'dropped';
}

interface Assignment {
  id: string;
  title: string;
  course: string;
  dueDate: Date;
  type: string;
  status: 'pending' | 'submitted' | 'graded';
  score?: number;
  maxScore?: number;
}

interface Grade {
  id: string;
  course: string;
  assignment: string;
  score: number;
  maxScore: number;
  percentage: number;
  date: Date;
  feedback?: string;
}

export function StudentPortal({ user }: StudentPortalProps) {
  const permissions = usePermissions(user);
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      const [coursesRes, assignmentsRes, gradesRes] = await Promise.all([
        fetch('/api/student/courses', { credentials: 'include' }),
        fetch('/api/student/assignments', { credentials: 'include' }),
        fetch('/api/student/grades', { credentials: 'include' })
      ]);

      if (coursesRes.ok) setCourses(await coursesRes.json());
      if (assignmentsRes.ok) setAssignments(await assignmentsRes.json());
      if (gradesRes.ok) setGrades(await gradesRes.json());
    } catch (error) {
      console.error('Failed to fetch student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOverallGPA = () => {
    if (grades.length === 0) return 0;
    const totalPoints = grades.reduce((sum, grade) => sum + (grade.percentage / 100) * 4, 0);
    return (totalPoints / grades.length).toFixed(2);
  };

  const getUpcomingAssignments = () => {
    const upcoming = assignments
      .filter(a => a.status === 'pending' && new Date(a.dueDate) > new Date())
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5);
    return upcoming;
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
      permission={PERMISSIONS.PAGES.STUDENT_PORTAL}
      fallbackComponent={
        <div className="text-center p-8">
          <GraduationCap className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">You don't have access to the student portal.</p>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Student Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16 border-2 border-white">
              <AvatarImage src={user.avatarUrl} />
              <AvatarFallback className="bg-white text-blue-600 text-xl font-bold">
                {user.name?.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">
                Welcome back, {user.name?.split(' ')[0]}!
              </h1>
              <p className="text-blue-100">
                {user.username} • Student Portal
              </p>
              <div className="mt-2 flex items-center space-x-4 text-sm">
                <span>GPA: {getOverallGPA()}</span>
                <span>•</span>
                <span>{courses.length} Courses</span>
                <span>•</span>
                <span>{assignments.filter(a => a.status === 'pending').length} Pending Assignments</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overall GPA</p>
                  <p className="text-2xl font-bold">{getOverallGPA()}</p>
                </div>
                <Award className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Enrolled Courses</p>
                  <p className="text-2xl font-bold">{courses.filter(c => c.status === 'enrolled').length}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Assignments</p>
                  <p className="text-2xl font-bold">{assignments.filter(a => a.status === 'pending').length}</p>
                </div>
                <FileText className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Attendance</p>
                  <p className="text-2xl font-bold">
                    {courses.length > 0 
                      ? Math.round(courses.reduce((sum, c) => sum + c.attendance, 0) / courses.length)
                      : 0}%
                  </p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="courses">My Courses</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="grades">Grades</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upcoming Assignments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Upcoming Assignments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getUpcomingAssignments().map((assignment) => (
                      <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{assignment.title}</p>
                          <p className="text-sm text-gray-500">{assignment.course}</p>
                          <p className="text-xs text-gray-400">
                            Due: {new Date(assignment.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={assignment.type === 'test' ? 'destructive' : 'secondary'}>
                          {assignment.type}
                        </Badge>
                      </div>
                    ))}
                    {getUpcomingAssignments().length === 0 && (
                      <p className="text-gray-500 text-center py-4">No upcoming assignments</p>
                    )}
                  </div>
                </CardContent>
              </Card>

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
                    {grades.slice(0, 5).map((grade) => (
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
                          <p className="text-sm text-gray-500">{grade.percentage}%</p>
                        </div>
                      </div>
                    ))}
                    {grades.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No grades available</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} user={user} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="assignments" className="space-y-6">
            <AssignmentsList assignments={assignments} user={user} />
          </TabsContent>

          <TabsContent value="grades" className="space-y-6">
            <GradesList grades={grades} user={user} />
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <ScheduleView courses={courses} user={user} />
          </TabsContent>
        </Tabs>
      </div>
    </PermissionGuard>
  );
}

function CourseCard({ course, user }: { course: Course; user: User }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{course.name}</CardTitle>
            <CardDescription>{course.code}</CardDescription>
          </div>
          <Badge variant={course.status === 'enrolled' ? 'default' : 'secondary'}>
            {course.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>Teacher:</span>
            <span className="font-medium">{course.teacher}</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress:</span>
              <span>{course.progress}%</span>
            </div>
            <Progress value={course.progress} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Attendance:</span>
              <span>{course.attendance}%</span>
            </div>
            <Progress value={course.attendance} className="h-2" />
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1">
              <BookOpen className="h-4 w-4 mr-1" />
              Content
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <FileText className="h-4 w-4 mr-1" />
              Assignments
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AssignmentsList({ assignments, user }: { assignments: Assignment[]; user: User }) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');

  const filteredAssignments = assignments.filter(a => 
    filter === 'all' || a.status === filter
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>All Assignments</CardTitle>
          <div className="flex gap-2">
            {(['all', 'pending', 'submitted', 'graded'] as const).map((status) => (
              <Button
                key={status}
                variant={filter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {filteredAssignments.map((assignment) => (
            <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium">{assignment.title}</h4>
                <p className="text-sm text-gray-500">{assignment.course}</p>
                <p className="text-xs text-gray-400">
                  Due: {new Date(assignment.dueDate).toLocaleDateString()}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <Badge variant={
                  assignment.status === 'pending' ? 'destructive' :
                  assignment.status === 'submitted' ? 'default' : 'secondary'
                }>
                  {assignment.status}
                </Badge>
                
                {assignment.score !== undefined && (
                  <div className="text-right">
                    <p className="font-bold">{assignment.score}/{assignment.maxScore}</p>
                  </div>
                )}
                
                <div className="flex gap-1">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  {assignment.status === 'pending' && (
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function GradesList({ grades, user }: { grades: Grade[]; user: User }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Grade History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {grades.map((grade) => (
            <div key={grade.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium">{grade.assignment}</h4>
                <p className="text-sm text-gray-500">{grade.course}</p>
                <p className="text-xs text-gray-400">
                  {new Date(grade.date).toLocaleDateString()}
                </p>
                {grade.feedback && (
                  <p className="text-sm text-blue-600 mt-1">{grade.feedback}</p>
                )}
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

function ScheduleView({ courses, user }: { courses: Course[]; user: User }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Weekly Schedule
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-gray-500">
          <Calendar className="mx-auto h-12 w-12 mb-4" />
          <p>Schedule view will be implemented with course times and locations.</p>
        </div>
      </CardContent>
    </Card>
  );
}