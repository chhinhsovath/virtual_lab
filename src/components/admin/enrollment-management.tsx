'use client';

import { useState, useEffect } from 'react';
import { User } from '@/lib/auth';
import { usePermissions } from '@/hooks/use-permissions';
import { PERMISSIONS } from '@/lib/permissions';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Plus, 
  Search,
  Filter,
  Download,
  Upload,
  UserPlus,
  UserMinus,
  BookOpen,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  GraduationCap
} from 'lucide-react';

interface EnrollmentManagementProps {
  user: User;
}

interface Student {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email?: string;
  grade: string;
  academicStatus: 'active' | 'inactive' | 'suspended' | 'graduated';
  profilePictureUrl?: string;
  currentEnrollments: number;
  maxEnrollments: number;
}

interface Course {
  id: string;
  name: string;
  code: string;
  subject: string;
  gradeLevel: string;
  teacher: string;
  maxStudents: number;
  enrolledStudents: number;
  status: 'active' | 'inactive' | 'completed' | 'cancelled';
  startDate: Date;
  endDate: Date;
}

interface Enrollment {
  id: string;
  student: {
    id: string;
    name: string;
    username: string;
    grade: string;
  };
  course: {
    id: string;
    name: string;
    code: string;
    subject: string;
  };
  enrollmentDate: Date;
  completionDate?: Date;
  status: 'enrolled' | 'completed' | 'dropped' | 'pending' | 'transferred';
  finalGrade?: string;
  gradePoints?: number;
  attendancePercentage?: number;
}

export function EnrollmentManagement({ user }: EnrollmentManagementProps) {
  const permissions = usePermissions(user);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
  const [isBulkEnrollOpen, setIsBulkEnrollOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [studentsRes, coursesRes, enrollmentsRes] = await Promise.all([
        fetch('/api/admin/students'),
        fetch('/api/admin/courses'),
        fetch('/api/admin/enrollments')
      ]);

      if (studentsRes.ok) setStudents(await studentsRes.json());
      if (coursesRes.ok) setCourses(await coursesRes.json());
      if (enrollmentsRes.ok) setEnrollments(await enrollmentsRes.json());
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollStudent = async (enrollmentData: any) => {
    try {
      const response = await fetch('/api/admin/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enrollmentData)
      });

      if (response.ok) {
        fetchData();
        setIsEnrollDialogOpen(false);
      }
    } catch (error) {
      console.error('Failed to enroll student:', error);
    }
  };

  const handleBulkEnroll = async (courseId: string) => {
    if (selectedStudents.length === 0) return;

    try {
      const response = await fetch('/api/admin/enrollments/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentIds: selectedStudents, courseId })
      });

      if (response.ok) {
        fetchData();
        setIsBulkEnrollOpen(false);
        setSelectedStudents([]);
      }
    } catch (error) {
      console.error('Failed to bulk enroll students:', error);
    }
  };

  const handleUpdateEnrollment = async (enrollmentId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/enrollments/${enrollmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Failed to update enrollment:', error);
    }
  };

  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchesSearch = enrollment.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         enrollment.student.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         enrollment.course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         enrollment.course.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || enrollment.status === statusFilter;
    const matchesCourse = courseFilter === 'all' || enrollment.course.id === courseFilter;
    const matchesGrade = gradeFilter === 'all' || enrollment.student.grade === gradeFilter;
    
    return matchesSearch && matchesStatus && matchesCourse && matchesGrade;
  });

  const getEnrollmentStats = () => {
    const stats = {
      total: enrollments.length,
      enrolled: enrollments.filter(e => e.status === 'enrolled').length,
      completed: enrollments.filter(e => e.status === 'completed').length,
      dropped: enrollments.filter(e => e.status === 'dropped').length,
      pending: enrollments.filter(e => e.status === 'pending').length,
      avgAttendance: enrollments.length > 0 
        ? Math.round(enrollments.reduce((sum, e) => sum + (e.attendancePercentage || 0), 0) / enrollments.length)
        : 0
    };
    return stats;
  };

  const stats = getEnrollmentStats();
  const grades = Array.from(new Set(students.map(s => s.grade)));

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
      permission={PERMISSIONS.COURSES.MANAGE_ENROLLMENT}
      fallbackComponent={
        <div className="text-center p-8">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">You don't have permission to manage enrollments.</p>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Enrollment Management</h2>
            <p className="text-gray-600">Manage student enrollments in courses</p>
          </div>
          
          <div className="flex gap-2">
            {selectedStudents.length > 0 && (
              <Dialog open={isBulkEnrollOpen} onOpenChange={setIsBulkEnrollOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Bulk Enroll ({selectedStudents.length})
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Bulk Enrollment</DialogTitle>
                    <DialogDescription>
                      Enroll {selectedStudents.length} selected students into a course
                    </DialogDescription>
                  </DialogHeader>
                  <BulkEnrollForm
                    courses={courses.filter(c => c.status === 'active')}
                    onSubmit={handleBulkEnroll}
                    onCancel={() => setIsBulkEnrollOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            )}
            
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            
            <Dialog open={isEnrollDialogOpen} onOpenChange={setIsEnrollDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Enroll Student
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Enroll Student</DialogTitle>
                  <DialogDescription>
                    Enroll a student into a course
                  </DialogDescription>
                </DialogHeader>
                <EnrollmentForm
                  students={students.filter(s => s.academicStatus === 'active')}
                  courses={courses.filter(c => c.status === 'active')}
                  onSubmit={handleEnrollStudent}
                  onCancel={() => setIsEnrollDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Enrollments</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold">{stats.enrolled}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                </div>
                <GraduationCap className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Dropped</p>
                  <p className="text-2xl font-bold">{stats.dropped}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Attendance</p>
                  <p className="text-2xl font-bold">{stats.avgAttendance}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-teal-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="enrollments" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
          </TabsList>

          <TabsContent value="enrollments" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-64">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search students, courses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="enrolled">Enrolled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="dropped">Dropped</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={courseFilter} onValueChange={setCourseFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Course" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Courses</SelectItem>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.name} ({course.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={gradeFilter} onValueChange={setGradeFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Grade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Grades</SelectItem>
                      {grades.map((grade) => (
                        <SelectItem key={grade} value={grade}>Grade {grade}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Enrollments Table */}
            <Card>
              <CardHeader>
                <CardTitle>Enrollments ({filteredEnrollments.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Enrollment Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Performance</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEnrollments.map((enrollment) => (
                      <TableRow key={enrollment.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {enrollment.student.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{enrollment.student.name}</div>
                              <div className="text-sm text-gray-500">
                                {enrollment.student.username} • Grade {enrollment.student.grade}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div>
                            <div className="font-medium">{enrollment.course.name}</div>
                            <div className="text-sm text-gray-500">
                              {enrollment.course.code} • {enrollment.course.subject}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="text-sm">
                            {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                          </div>
                          {enrollment.completionDate && (
                            <div className="text-xs text-gray-500">
                              Completed: {new Date(enrollment.completionDate).toLocaleDateString()}
                            </div>
                          )}
                        </TableCell>

                        <TableCell>
                          <Badge variant={
                            enrollment.status === 'enrolled' ? 'default' :
                            enrollment.status === 'completed' ? 'secondary' :
                            enrollment.status === 'pending' ? 'outline' :
                            'destructive'
                          }>
                            {enrollment.status}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-1">
                            {enrollment.finalGrade && (
                              <div className="text-sm font-medium">Grade: {enrollment.finalGrade}</div>
                            )}
                            {enrollment.gradePoints && (
                              <div className="text-sm text-gray-500">GPA: {enrollment.gradePoints}</div>
                            )}
                            {enrollment.attendancePercentage && (
                              <div className="text-sm text-gray-500">
                                Attendance: {enrollment.attendancePercentage}%
                              </div>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex gap-1">
                            <Select
                              value={enrollment.status}
                              onValueChange={(value) => handleUpdateEnrollment(enrollment.id, value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="enrolled">Enrolled</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="dropped">Dropped</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="transferred">Transferred</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            <StudentsForEnrollment
              students={students}
              selectedStudents={selectedStudents}
              onSelectionChange={setSelectedStudents}
            />
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            <CoursesEnrollmentView courses={courses} />
          </TabsContent>
        </Tabs>
      </div>
    </PermissionGuard>
  );
}

function EnrollmentForm({ students, courses, onSubmit, onCancel }: {
  students: Student[];
  courses: Course[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    studentId: '',
    courseId: '',
    enrollmentDate: new Date().toISOString().split('T')[0],
    status: 'enrolled'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="studentId">Student</Label>
        <Select value={formData.studentId} onValueChange={(value) => setFormData(prev => ({ ...prev, studentId: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select student" />
          </SelectTrigger>
          <SelectContent>
            {students.map((student) => (
              <SelectItem key={student.id} value={student.id}>
                {student.firstName} {student.lastName} ({student.username}) - Grade {student.grade}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="courseId">Course</Label>
        <Select value={formData.courseId} onValueChange={(value) => setFormData(prev => ({ ...prev, courseId: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select course" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.name} ({course.code}) - {course.enrolledStudents}/{course.maxStudents} students
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="enrollmentDate">Enrollment Date</Label>
        <Input
          id="enrollmentDate"
          type="date"
          value={formData.enrollmentDate}
          onChange={(e) => setFormData(prev => ({ ...prev, enrollmentDate: e.target.value }))}
          required
        />
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" className="flex-1">Enroll Student</Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
      </div>
    </form>
  );
}

function BulkEnrollForm({ courses, onSubmit, onCancel }: {
  courses: Course[];
  onSubmit: (courseId: string) => void;
  onCancel: () => void;
}) {
  const [selectedCourse, setSelectedCourse] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCourse) {
      onSubmit(selectedCourse);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="courseId">Select Course</Label>
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger>
            <SelectValue placeholder="Select course for bulk enrollment" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.name} ({course.code}) - {course.maxStudents - course.enrolledStudents} spots available
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" className="flex-1" disabled={!selectedCourse}>
          Enroll Students
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
}

function StudentsForEnrollment({ students, selectedStudents, onSelectionChange }: {
  students: Student[];
  selectedStudents: string[];
  onSelectionChange: (selected: string[]) => void;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = gradeFilter === 'all' || student.grade === gradeFilter;
    
    return matchesSearch && matchesGrade;
  });

  const grades = Array.from(new Set(students.map(s => s.grade)));

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Students Available for Enrollment</CardTitle>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                {grades.map((grade) => (
                  <SelectItem key={grade} value={grade}>Grade {grade}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onSelectionChange(filteredStudents.map(s => s.id));
                    } else {
                      onSelectionChange([]);
                    }
                  }}
                />
              </TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Current Enrollments</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map((student) => (
              <TableRow key={student.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedStudents.includes(student.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        onSelectionChange([...selectedStudents, student.id]);
                      } else {
                        onSelectionChange(selectedStudents.filter(id => id !== student.id));
                      }
                    }}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={student.profilePictureUrl} />
                      <AvatarFallback>
                        {student.firstName[0]}{student.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{student.firstName} {student.lastName}</div>
                      <div className="text-sm text-gray-500">{student.username}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>Grade {student.grade}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{student.currentEnrollments}/{student.maxEnrollments}</span>
                    <Progress 
                      value={(student.currentEnrollments / student.maxEnrollments) * 100} 
                      className="w-16 h-2" 
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={student.academicStatus === 'active' ? 'default' : 'secondary'}>
                    {student.academicStatus}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function CoursesEnrollmentView({ courses }: { courses: Course[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <Card key={course.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{course.name}</CardTitle>
                <CardDescription>{course.code} • {course.subject}</CardDescription>
              </div>
              <Badge variant={course.status === 'active' ? 'default' : 'secondary'}>
                {course.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span>Teacher:</span>
                <span className="font-medium">{course.teacher}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Enrollment:</span>
                  <span>{course.enrolledStudents}/{course.maxStudents}</span>
                </div>
                <Progress value={(course.enrolledStudents / course.maxStudents) * 100} className="h-2" />
              </div>

              <div className="flex items-center justify-between text-sm">
                <span>Grade Level:</span>
                <span>{course.gradeLevel}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span>Duration:</span>
                <span>
                  {new Date(course.startDate).toLocaleDateString()} - {new Date(course.endDate).toLocaleDateString()}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Users className="h-4 w-4 mr-1" />
                  Manage
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <BookOpen className="h-4 w-4 mr-1" />
                  Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}