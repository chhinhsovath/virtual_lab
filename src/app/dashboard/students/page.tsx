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
import ModernSidebar from '@/components/dashboard/ModernSidebar';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
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
  Phone,
  Bell,
  Menu,
  Star,
  Sparkles,
  Heart,
  GraduationCap,
  Activity,
  Zap,
  Award,
  UserCheck,
  Calendar
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PageHeader, StatCard, EmptyState } from '@/components/dashboard/ui-components';
import * as design from '@/components/dashboard/design-system';
import { cn } from '@/lib/utils';

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

interface User {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  roles: string[];
  permissions: string[];
  schoolAccess: Array<{
    schoolId: number;
    accessType: string;
    subject: string;
  }>;
  teacherId?: number;
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
  const [user, setUser] = useState<User | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [classStats, setClassStats] = useState<ClassStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const data = await response.json();
          const userData = data.user;
          
          // Check if user is a student and redirect to student portal
          if (userData.roles?.includes('student') || userData.role === 'student') {
            router.push('/student');
            return;
          }
          
          setUser(userData);
        } else {
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Session fetch error:', error);
        router.push('/auth/login');
      } finally {
        setSessionLoading(false);
      }
    };

    fetchSession();
  }, [router]);

  useEffect(() => {
    if (!user) return;

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
  }, [user]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      // Use window.location.href instead of router.push for complete session cleanup
      // This ensures we bypass Next.js client-side routing and force a full page reload
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect to home even if logout API fails to ensure user is logged out client-side
      window.location.href = '/';
    }
  };

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
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200 flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Active</span>
          </Badge>
        );
      case 'inactive':
        return (
          <Badge className="bg-gray-100 text-gray-700 border-gray-200 flex items-center space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <span>Inactive</span>
          </Badge>
        );
      case 'struggling':
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200 flex items-center space-x-1">
            <AlertCircle className="h-3 w-3" />
            <span>Needs Help</span>
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return (
          <div className="flex items-center space-x-1 text-green-600">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium">+</span>
          </div>
        );
      case 'declining':
        return (
          <div className="flex items-center space-x-1 text-red-600">
            <TrendingDown className="h-4 w-4" />
            <span className="text-xs font-medium">-</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center space-x-1 text-gray-500">
            <Activity className="h-4 w-4" />
            <span className="text-xs font-medium">=</span>
          </div>
        );
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

  if (sessionLoading || loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className={cn("flex min-h-screen", design.gradients.sky)}>
      {/* Sidebar - handles both desktop and mobile */}
      <ModernSidebar 
        user={user} 
        onLogout={handleLogout} 
        mobileOpen={mobileMenuOpen}
        onMobileToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        onCollapsedChange={setSidebarCollapsed}
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-80'}`}>
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={exportStudentData} className={design.buttonVariants.primary}>
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button variant="outline" size="icon" className={cn("relative", design.cardVariants.glass)}>
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className={cn("flex-1 overflow-y-auto", design.spacing.page)}>
          <div className={design.spacing.section}>
            {/* Page Header */}
            <PageHeader
              title="Student Management"
              titleKm="ការគ្រប់គ្រងសិស្ស"
              description="Monitor and support your amazing students' learning journey! 🌟"
              actions={
                <Badge className={cn(
                  "px-4 py-2 text-sm font-medium",
                  design.animations.pulse,
                  design.gradients.secondary
                )}>
                  <Users className="h-4 w-4 mr-2" />
                  {classStats?.total_students || 0} Students
                </Badge>
              }
            />

            {/* Class Statistics with colorful cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <StatCard
                title="Total Students"
                value={classStats?.total_students || 0}
                icon={Users}
                color="primary"
                gradient={true}
              />

              <StatCard
                title="Active Today"
                value={classStats?.active_students || 0}
                icon={UserCheck}
                color="success"
                gradient={true}
                trend="up"
                trendValue="12%"
              />

              <StatCard
                title="Class Average"
                value={`${classStats?.average_score || 0}%`}
                icon={Trophy}
                color="warning"
                gradient={true}
              />

              <StatCard
                title="Completion"
                value={`${classStats?.completion_rate || 0}%`}
                icon={Target}
                color="secondary"
                gradient={true}
              />

              <StatCard
                title="Need Support"
                value={classStats?.struggling_students || 0}
                icon={Heart}
                color="danger"
                gradient={true}
              />

              <StatCard
                title="Star Students"
                value={classStats?.excelling_students || 0}
                icon={Star}
                color="success"
                gradient={true}
                trend="up"
                trendValue="5"
              />
            </div>

            {/* Filters and Search with enhanced design */}
            <Card className={cn(design.cardVariants.colorful, "overflow-hidden")}>
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 pb-6">
                <CardTitle className="flex items-center space-x-3">
                  <div className={cn("p-2 rounded-xl", design.gradients.secondary)}>
                    <Filter className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl">Smart Filters</span>
                  <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
                </CardTitle>
                <CardDescription>
                  Find and sort your students quickly
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium">
                      <Search className="h-4 w-4 text-purple-500" />
                      <span>Search</span>
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Find a student..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-12 border-2 hover:border-purple-300 focus:border-purple-400 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium">
                      <GraduationCap className="h-4 w-4 text-blue-500" />
                      <span>Class</span>
                    </label>
                    <Select value={classFilter} onValueChange={setClassFilter}>
                      <SelectTrigger className="h-12 border-2 hover:border-blue-300 transition-colors">
                        <SelectValue placeholder="All classes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                            <span>All Classes</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Class 10A">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <span>Class 10A</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Class 10B">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span>Class 10B</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium">
                      <Activity className="h-4 w-4 text-green-500" />
                      <span>Status</span>
                    </label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="h-12 border-2 hover:border-green-300 transition-colors">
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="active">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span>Active</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="inactive">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            <span>Inactive</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="struggling">
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="h-3 w-3 text-red-500" />
                            <span>Needs Help</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium">
                      <Award className="h-4 w-4 text-orange-500" />
                      <span>Sort By</span>
                    </label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="h-12 border-2 hover:border-orange-300 transition-colors">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">AZ</span>
                            <span>Name</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="score">
                          <div className="flex items-center space-x-2">
                            <Trophy className="h-4 w-4 text-yellow-500" />
                            <span>Average Score</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="progress">
                          <div className="flex items-center space-x-2">
                            <Target className="h-4 w-4 text-blue-500" />
                            <span>Progress</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="activity">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-purple-500" />
                            <span>Last Active</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Active Filters Display */}
                {(searchTerm || classFilter !== 'all' || statusFilter !== 'all') && (
                  <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Zap className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium text-purple-700">Active Filters:</span>
                        <div className="flex flex-wrap gap-2">
                          {searchTerm && (
                            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                              Search: {searchTerm}
                            </Badge>
                          )}
                          {classFilter !== 'all' && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                              {classFilter}
                            </Badge>
                          )}
                          {statusFilter !== 'all' && (
                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                              {statusFilter}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSearchTerm('');
                          setClassFilter('all');
                          setStatusFilter('all');
                        }}
                        className="text-purple-600 hover:text-purple-700"
                      >
                        Clear all
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Students List with enhanced cards */}
            <div className="space-y-4">
              {filteredStudents.map((student, index) => {
                const progressPercentage = (student.simulations_completed / student.total_simulations) * 100;
                const scoreColor = student.average_score >= 80 ? 'text-green-600' : 
                                  student.average_score >= 60 ? 'text-yellow-600' : 'text-red-600';
                
                return (
                  <Card 
                    key={student.id} 
                    className={cn(
                      design.cardVariants.colorful,
                      "transform hover:scale-[1.01] transition-all duration-300",
                      design.animations.fadeIn
                    )}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-1">
                          {/* Student Header */}
                          <div className="flex items-start space-x-4 mb-4">
                            <Avatar className={cn(
                              "h-14 w-14 ring-4 ring-white shadow-lg",
                              student.status === 'active' ? 'ring-green-200' : 
                              student.status === 'struggling' ? 'ring-red-200' : 'ring-gray-200'
                            )}>
                              <AvatarImage src={student.avatar} />
                              <AvatarFallback className={cn(
                                "font-bold text-lg",
                                design.gradients.primary
                              )}>
                                {student.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <h3 className="text-xl font-bold text-gray-900">{student.name}</h3>
                                {getStatusBadge(student.status)}
                                <Badge className={cn(
                                  "px-3 py-1",
                                  design.gradients.secondary,
                                  "text-white border-0"
                                )}>
                                  <GraduationCap className="h-3 w-3 mr-1" />
                                  {student.class}
                                </Badge>
                                {getTrendIcon(student.performance_trend)}
                              </div>
                              
                              {/* Contact Info */}
                              {student.email && (
                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                  <div className="flex items-center space-x-1">
                                    <Mail className="h-3 w-3 text-gray-400" />
                                    <span className="truncate max-w-[200px]">{student.email}</span>
                                  </div>
                                  {student.phone && (
                                    <div className="flex items-center space-x-1">
                                      <Phone className="h-3 w-3 text-gray-400" />
                                      <span>{student.phone}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="h-3 w-3 text-gray-400" />
                                    <span>Joined {new Date(student.enrollment_date).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Stats Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                            {/* Score Card */}
                            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 text-center">
                              <div className="flex items-center justify-center mb-2">
                                <Trophy className="h-5 w-5 text-yellow-500" />
                              </div>
                              <p className="text-xs text-gray-600 mb-1">Average Score</p>
                              <p className={cn("text-2xl font-bold", scoreColor)}>
                                {student.average_score}%
                              </p>
                              <div className="flex justify-center mt-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={cn(
                                      "h-3 w-3",
                                      i < Math.floor(student.average_score / 20) 
                                        ? "fill-yellow-400 text-yellow-400" 
                                        : "text-gray-300"
                                    )} 
                                  />
                                ))}
                              </div>
                            </div>
                            
                            {/* Progress Card */}
                            <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-4">
                              <div className="flex items-center justify-center mb-2">
                                <Target className="h-5 w-5 text-green-600" />
                              </div>
                              <p className="text-xs text-gray-600 mb-2">Completion</p>
                              <div className="relative">
                                <Progress 
                                  value={progressPercentage} 
                                  className="h-3 mb-1"
                                />
                                <p className="text-center font-semibold text-sm">
                                  {student.simulations_completed}/{student.total_simulations}
                                </p>
                              </div>
                            </div>
                            
                            {/* Activity Card */}
                            <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-xl p-4 text-center">
                              <div className="flex items-center justify-center mb-2">
                                <Clock className="h-5 w-5 text-orange-500" />
                              </div>
                              <p className="text-xs text-gray-600 mb-1">Last Active</p>
                              <p className="font-semibold text-sm">
                                {new Date(student.last_active).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(student.last_active).toLocaleTimeString()}
                              </p>
                            </div>
                            
                            {/* Trend Chart */}
                            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4">
                              <div className="flex items-center justify-center mb-2">
                                <Activity className="h-5 w-5 text-purple-600" />
                              </div>
                              <p className="text-xs text-gray-600 mb-2">Score Trend</p>
                              <div className="flex items-end justify-center space-x-1 h-8">
                                {student.recent_scores.map((score, idx) => (
                                  <div
                                    key={idx}
                                    className={cn(
                                      "w-2 rounded-t transition-all duration-300",
                                      score >= 80 ? "bg-green-400" :
                                      score >= 60 ? "bg-yellow-400" : "bg-red-400"
                                    )}
                                    style={{ 
                                      height: `${(score / 100) * 32}px`,
                                      opacity: 0.6 + (idx * 0.1)
                                    }}
                                    title={`Score: ${score}%`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex flex-row lg:flex-col gap-2 mt-4 lg:mt-0">
                          <Button
                            onClick={() => router.push(`/dashboard/students/${student.id}`)}
                            className={cn(
                              "flex-1 lg:flex-initial",
                              design.buttonVariants.primary
                            )}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel className="flex items-center space-x-2">
                                <Sparkles className="h-4 w-4 text-yellow-500" />
                                <span>Quick Actions</span>
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => router.push(`/dashboard/students/${student.id}/progress`)}>
                                <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                                Progress Report
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => router.push(`/dashboard/messages/new?student=${student.id}`)}>
                                <MessageSquare className="h-4 w-4 mr-2 text-blue-600" />
                                Send Message
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => router.push(`/dashboard/students/${student.id}/assignments`)}>
                                <BookOpen className="h-4 w-4 mr-2 text-purple-600" />
                                Assignments
                              </DropdownMenuItem>
                              {student.status === 'struggling' && (
                                <DropdownMenuItem className="text-red-600">
                                  <Heart className="h-4 w-4 mr-2" />
                                  Schedule Support
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              
              {filteredStudents.length === 0 && (
                <EmptyState
                  icon={Users}
                  title="No students found"
                  description="Try adjusting your filters or search terms to find students"
                  action={{
                    label: "Clear Filters",
                    onClick: () => {
                      setSearchTerm('');
                      setClassFilter('all');
                      setStatusFilter('all');
                    }
                  }}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}