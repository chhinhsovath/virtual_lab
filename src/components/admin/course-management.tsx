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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Calendar,
  Clock,
  MapPin,
  GraduationCap,
  Search,
  Filter,
  Download,
  Upload
} from 'lucide-react';

interface CourseManagementProps {
  user: User;
}

interface Course {
  id: string;
  name: string;
  code: string;
  description: string;
  subject: string;
  gradeLevel: string;
  schoolId: number;
  schoolName: string;
  teacher: {
    id: string;
    name: string;
    email: string;
  };
  assistantTeachers: Array<{
    id: string;
    name: string;
  }>;
  maxStudents: number;
  enrolledStudents: number;
  academicYear: string;
  semester: string;
  startDate: Date;
  endDate: Date;
  roomNumber?: string;
  status: 'active' | 'inactive' | 'completed' | 'cancelled';
  schedule: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }>;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
  subjects: string[];
}

interface School {
  id: number;
  name: string;
}

export function CourseManagement({ user }: CourseManagementProps) {
  const permissions = usePermissions(user);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesRes, teachersRes, schoolsRes] = await Promise.all([
        fetch('/api/admin/courses'),
        fetch('/api/admin/teachers'),
        fetch('/api/admin/schools')
      ]);

      if (coursesRes.ok) setCourses(await coursesRes.json());
      if (teachersRes.ok) setTeachers(await teachersRes.json());
      if (schoolsRes.ok) setSchools(await schoolsRes.json());
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (courseData: any) => {
    try {
      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseData)
      });

      if (response.ok) {
        fetchData();
        setIsCreateDialogOpen(false);
      }
    } catch (error) {
      console.error('Failed to create course:', error);
    }
  };

  const handleUpdateCourse = async (courseId: string, courseData: any) => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseData)
      });

      if (response.ok) {
        fetchData();
        setEditingCourse(null);
      }
    } catch (error) {
      console.error('Failed to update course:', error);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Failed to delete course:', error);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.teacher.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
    const matchesSubject = subjectFilter === 'all' || course.subject === subjectFilter;
    
    return matchesSearch && matchesStatus && matchesSubject;
  });

  const subjects = Array.from(new Set(courses.map(c => c.subject)));

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
      permission={PERMISSIONS.PAGES.COURSE_MANAGEMENT}
      fallbackComponent={
        <div className="text-center p-8">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">You don't have permission to manage courses.</p>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Course Management</h2>
            <p className="text-gray-600">Manage courses, schedules, and enrollments</p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <PermissionGuard user={user} permission={PERMISSIONS.COURSES.CREATE} showError={false}>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Course
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Course</DialogTitle>
                    <DialogDescription>
                      Create a new course with schedule and enrollment settings
                    </DialogDescription>
                  </DialogHeader>
                  <CourseForm
                    teachers={teachers}
                    schools={schools}
                    onSubmit={handleCreateCourse}
                    onCancel={() => setIsCreateDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </PermissionGuard>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search courses, codes, or teachers..."
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Courses</p>
                  <p className="text-2xl font-bold">{courses.length}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Courses</p>
                  <p className="text-2xl font-bold">{courses.filter(c => c.status === 'active').length}</p>
                </div>
                <GraduationCap className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Enrollments</p>
                  <p className="text-2xl font-bold">{courses.reduce((sum, c) => sum + c.enrolledStudents, 0)}</p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Class Size</p>
                  <p className="text-2xl font-bold">
                    {courses.length > 0 
                      ? Math.round(courses.reduce((sum, c) => sum + c.enrolledStudents, 0) / courses.length)
                      : 0}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Courses Table */}
        <Card>
          <CardHeader>
            <CardTitle>Courses ({filteredCourses.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead>Enrollment</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{course.name}</div>
                        <div className="text-sm text-gray-500">
                          {course.code} • {course.subject} • Grade {course.gradeLevel}
                        </div>
                        {course.roomNumber && (
                          <div className="text-xs text-gray-400 flex items-center mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            Room {course.roomNumber}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {course.teacher.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">{course.teacher.name}</div>
                          <div className="text-xs text-gray-500">{course.teacher.email}</div>
                        </div>
                      </div>
                      {course.assistantTeachers.length > 0 && (
                        <div className="text-xs text-gray-400 mt-1">
                          +{course.assistantTeachers.length} assistant{course.assistantTeachers.length > 1 ? 's' : ''}
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="text-sm">{course.schoolName}</div>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm">
                        <span className="font-medium">{course.enrolledStudents}</span>
                        <span className="text-gray-500">/{course.maxStudents}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full" 
                          style={{ width: `${(course.enrolledStudents / course.maxStudents) * 100}%` }}
                        />
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm">
                        {course.schedule.map((sched, index) => (
                          <div key={index} className="flex items-center gap-1 text-xs">
                            <Calendar className="h-3 w-3" />
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][sched.dayOfWeek - 1]} {sched.startTime}-{sched.endTime}
                          </div>
                        ))}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant={
                        course.status === 'active' ? 'default' :
                        course.status === 'completed' ? 'secondary' :
                        course.status === 'cancelled' ? 'destructive' : 'outline'
                      }>
                        {course.status}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="flex gap-1">
                        <PermissionGuard user={user} permission={PERMISSIONS.COURSES.UPDATE} showError={false}>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setEditingCourse(course)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>
                        
                        <PermissionGuard user={user} permission={PERMISSIONS.COURSES.MANAGE_ENROLLMENT} showError={false}>
                          <Button variant="outline" size="sm">
                            <Users className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>

                        <PermissionGuard user={user} permission={PERMISSIONS.COURSES.DELETE} showError={false}>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteCourse(course.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit Course Dialog */}
        <Dialog open={!!editingCourse} onOpenChange={(open) => !open && setEditingCourse(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Course</DialogTitle>
              <DialogDescription>
                Update course information and settings
              </DialogDescription>
            </DialogHeader>
            {editingCourse && (
              <CourseForm
                course={editingCourse}
                teachers={teachers}
                schools={schools}
                onSubmit={(data) => handleUpdateCourse(editingCourse.id, data)}
                onCancel={() => setEditingCourse(null)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PermissionGuard>
  );
}

function CourseForm({ 
  course, 
  teachers, 
  schools, 
  onSubmit, 
  onCancel 
}: { 
  course?: Course; 
  teachers: Teacher[]; 
  schools: School[]; 
  onSubmit: (data: any) => void; 
  onCancel: () => void; 
}) {
  const [formData, setFormData] = useState({
    name: course?.name || '',
    code: course?.code || '',
    description: course?.description || '',
    subject: course?.subject || '',
    gradeLevel: course?.gradeLevel || '',
    schoolId: course?.schoolId?.toString() || '',
    teacherId: course?.teacher.id || '',
    maxStudents: course?.maxStudents || 30,
    academicYear: course?.academicYear || new Date().getFullYear().toString(),
    semester: course?.semester || 'full_year',
    startDate: course?.startDate ? new Date(course.startDate).toISOString().split('T')[0] : '',
    endDate: course?.endDate ? new Date(course.endDate).toISOString().split('T')[0] : '',
    roomNumber: course?.roomNumber || '',
    status: course?.status || 'active'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Course Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="code">Course Code</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            value={formData.subject}
            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="gradeLevel">Grade Level</Label>
          <Input
            id="gradeLevel"
            value={formData.gradeLevel}
            onChange={(e) => setFormData(prev => ({ ...prev, gradeLevel: e.target.value }))}
            required
          />
        </div>

        <div>
          <Label htmlFor="maxStudents">Max Students</Label>
          <Input
            id="maxStudents"
            type="number"
            value={formData.maxStudents}
            onChange={(e) => setFormData(prev => ({ ...prev, maxStudents: parseInt(e.target.value) }))}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="schoolId">School</Label>
          <Select value={formData.schoolId} onValueChange={(value) => setFormData(prev => ({ ...prev, schoolId: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select school" />
            </SelectTrigger>
            <SelectContent>
              {schools.map((school) => (
                <SelectItem key={school.id} value={school.id.toString()}>{school.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="teacherId">Teacher</Label>
          <Select value={formData.teacherId} onValueChange={(value) => setFormData(prev => ({ ...prev, teacherId: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select teacher" />
            </SelectTrigger>
            <SelectContent>
              {teachers.map((teacher) => (
                <SelectItem key={teacher.id} value={teacher.id}>{teacher.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
            required
          />
        </div>

        <div>
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" className="flex-1">
          {course ? 'Update Course' : 'Create Course'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
}