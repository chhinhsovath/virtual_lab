'use client';

import { useState, useEffect } from 'react';
import { User } from '@/lib/auth';
import { usePermissions } from '@/hooks/use-permissions';
import { PERMISSIONS, LMS_PERMISSIONS } from '@/lib/permissions';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  User as UserIcon
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

export function ParentPortal({ user }: ParentPortalProps) {
  const permissions = usePermissions(user);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [childGrades, setChildGrades] = useState<ChildGrade[]>([]);
  const [childAttendance, setChildAttendance] = useState<ChildAttendance[]>([]);
  const [teachers, setTeachers] = useState<TeacherContact[]>([]);
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
      const [gradesRes, attendanceRes, teachersRes] = await Promise.all([
        fetch(`/api/parent/child/${childId}/grades`),
        fetch(`/api/parent/child/${childId}/attendance`),
        fetch(`/api/parent/child/${childId}/teachers`)
      ]);

      if (gradesRes.ok) setChildGrades(await gradesRes.json());
      if (attendanceRes.ok) setChildAttendance(await attendanceRes.json());
      if (teachersRes.ok) setTeachers(await teachersRes.json());
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
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
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
              <div className="w-64">
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Overall GPA</p>
                      <p className="text-2xl font-bold">{selectedChild.overallGPA.toFixed(2)}</p>
                    </div>
                    <Award className="h-8 w-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                      <p className="text-2xl font-bold">{selectedChild.attendanceRate}%</p>
                    </div>
                    <CheckCircle className={`h-8 w-8 ${selectedChild.attendanceRate >= 90 ? 'text-green-500' : 'text-orange-500'}`} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Enrolled Courses</p>
                      <p className="text-2xl font-bold">{selectedChild.enrolledCourses}</p>
                    </div>
                    <BookOpen className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending Work</p>
                      <p className="text-2xl font-bold">{selectedChild.pendingAssignments}</p>
                    </div>
                    <FileText className={`h-8 w-8 ${selectedChild.pendingAssignments > 5 ? 'text-red-500' : 'text-orange-500'}`} />
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
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="grades">Grades</TabsTrigger>
                <TabsTrigger value="attendance">Attendance</TabsTrigger>
                <TabsTrigger value="teachers">Teachers</TabsTrigger>
                <TabsTrigger value="communication">Messages</TabsTrigger>
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