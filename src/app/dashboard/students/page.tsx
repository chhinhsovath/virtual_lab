'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  MessageSquare,
  Trophy,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  BookOpen,
  Target,
  Users,
  ArrowLeft,
  MoreVertical,
  Mail,
  Phone
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Student {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  class: string;
  enrollment_date: string;
  simulations_completed: number;
  total_simulations: number;
  average_score: number;
  last_active: string;
  status: 'active' | 'inactive' | 'struggling';
  performance_trend: 'improving' | 'stable' | 'declining';
  recent_scores: number[];
}

interface ClassStats {
  total_students: number;
  active_students: number;
  average_score: number;
  completion_rate: number;
  struggling_students: number;
  excelling_students: number;
}

export default function StudentManagementPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [classStats, setClassStats] = useState<ClassStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const router = useRouter();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // Mock data - replace with actual API call
        const mockStudents: Student[] = [
          {
            id: '1',
            name: 'Sokha Chan',
            email: 'sokha.chan@school.edu',
            phone: '+855 12 345 678',
            class: 'Class 10A',
            enrollment_date: '2024-01-15',
            simulations_completed: 15,
            total_simulations: 20,
            average_score: 85,
            last_active: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            status: 'active',
            performance_trend: 'improving',
            recent_scores: [78, 82, 85, 88, 90]
          },
          {
            id: '2',
            name: 'Dara Kim',
            email: 'dara.kim@school.edu',
            class: 'Class 10B',
            enrollment_date: '2024-01-20',
            simulations_completed: 12,
            total_simulations: 20,
            average_score: 72,
            last_active: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
            status: 'active',
            performance_trend: 'stable',
            recent_scores: [70, 72, 71, 73, 72]
          },
          {
            id: '3',
            name: 'Srey Mom',
            email: 'srey.mom@school.edu',
            class: 'Class 10A',
            enrollment_date: '2024-02-01',
            simulations_completed: 8,
            total_simulations: 20,
            average_score: 58,
            last_active: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
            status: 'struggling',
            performance_trend: 'declining',
            recent_scores: [65, 62, 60, 58, 55]
          }
        ];

        setStudents(mockStudents);
        setFilteredStudents(mockStudents);

        // Calculate class stats
        const stats: ClassStats = {
          total_students: mockStudents.length,
          active_students: mockStudents.filter(s => s.status === 'active').length,
          average_score: Math.round(mockStudents.reduce((sum, s) => sum + s.average_score, 0) / mockStudents.length),
          completion_rate: Math.round(mockStudents.reduce((sum, s) => sum + (s.simulations_completed / s.total_simulations), 0) / mockStudents.length * 100),
          struggling_students: mockStudents.filter(s => s.status === 'struggling').length,
          excelling_students: mockStudents.filter(s => s.average_score >= 80).length
        };
        setClassStats(stats);

      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  useEffect(() => {
    let filtered = students;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(student => 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply class filter
    if (classFilter !== 'all') {
      filtered = filtered.filter(student => student.class === classFilter);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(student => student.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'score':
          return b.average_score - a.average_score;
        case 'progress':
          return b.simulations_completed - a.simulations_completed;
        case 'activity':
          return new Date(b.last_active).getTime() - new Date(a.last_active).getTime();
        default:
          return 0;
      }
    });

    setFilteredStudents(filtered);
  }, [students, searchTerm, classFilter, statusFilter, sortBy]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
      case 'struggling':
        return <Badge className="bg-red-100 text-red-800">Needs Help</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
    }
  };

  const exportStudentData = () => {
    const csvContent = [
      ['Name', 'Email', 'Class', 'Average Score', 'Simulations Completed', 'Status', 'Last Active'].join(','),
      ...filteredStudents.map(student => [
        student.name,
        student.email || '',
        student.class,
        student.average_score,
        `${student.simulations_completed}/${student.total_simulations}`,
        student.status,
        new Date(student.last_active).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-blue-700 font-medium">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/dashboard')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
                <p className="text-gray-600 mt-1">
                  Monitor and support your students' learning progress
                </p>
              </div>
            </div>
            <Button onClick={exportStudentData}>
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>

        {/* Class Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{classStats?.total_students || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Students</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{classStats?.active_students || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Class Average</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{classStats?.average_score || 0}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{classStats?.completion_rate || 0}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Struggling</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{classStats?.struggling_students || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Excelling</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{classStats?.excelling_students || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filters & Search</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  <SelectItem value="Class 10A">Class 10A</SelectItem>
                  <SelectItem value="Class 10B">Class 10B</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="struggling">Struggling</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="score">Average Score</SelectItem>
                  <SelectItem value="progress">Progress</SelectItem>
                  <SelectItem value="activity">Last Active</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Students List */}
        <div className="space-y-4">
          {filteredStudents.map((student) => (
            <Card key={student.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={student.avatar} />
                      <AvatarFallback>
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="text-lg font-semibold">{student.name}</h3>
                        {getStatusBadge(student.status)}
                        <Badge variant="outline">{student.class}</Badge>
                        {getTrendIcon(student.performance_trend)}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                        <div>
                          <p className="text-sm text-gray-500">Average Score</p>
                          <p className="text-lg font-semibold">{student.average_score}%</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">Progress</p>
                          <div className="flex items-center space-x-2">
                            <Progress 
                              value={(student.simulations_completed / student.total_simulations) * 100} 
                              className="flex-1 h-2"
                            />
                            <span className="text-sm">
                              {student.simulations_completed}/{student.total_simulations}
                            </span>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">Last Active</p>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">
                              {new Date(student.last_active).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">Recent Trend</p>
                          <div className="flex items-center space-x-1">
                            {student.recent_scores.map((score, idx) => (
                              <div
                                key={idx}
                                className="w-1 bg-blue-400 rounded"
                                style={{ 
                                  height: `${score / 2}px`,
                                  opacity: 0.6 + (idx * 0.1)
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {student.email && (
                        <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Mail className="h-3 w-3" />
                            <span>{student.email}</span>
                          </div>
                          {student.phone && (
                            <div className="flex items-center space-x-1">
                              <Phone className="h-3 w-3" />
                              <span>{student.phone}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/dashboard/students/${student.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/students/${student.id}/progress`)}>
                          <TrendingUp className="h-4 w-4 mr-2" />
                          View Progress Report
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/messages/new?student=${student.id}`)}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Send Message
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/students/${student.id}/assignments`)}>
                          <BookOpen className="h-4 w-4 mr-2" />
                          View Assignments
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {filteredStudents.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
                <p className="text-gray-500">
                  Try adjusting your filters to see more results.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}