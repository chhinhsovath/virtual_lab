'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinnerCompact } from '@/components/ui/loading-spinner';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Users, 
  BookOpen, 
  FlaskConical,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  MessageSquare,
  Sparkles,
  Play,
  Eye,
  UserPlus,
  FileText,
  TrendingUp,
  Activity
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Module {
  id: string;
  title: string;
  titleKm: string;
  subject: string;
  type: 'simulation' | 'exercise' | 'lesson';
  status: 'active' | 'draft' | 'archived';
  studentsAssigned: number;
  completionRate: number;
  lastModified: string;
}

interface StudentEngagement {
  id: string;
  name: string;
  avatar?: string;
  lastActive: string;
  modulesCompleted: number;
  totalModules: number;
  averageScore: number;
  status: 'active' | 'inactive' | 'struggling';
  recentActivity?: string;
}

interface Activity {
  id: string;
  studentName: string;
  action: string;
  module: string;
  timestamp: string;
  type: 'completed' | 'started' | 'submitted' | 'message';
}

interface TeacherEngagementDashboardProps {
  user: any;
}

export function TeacherEngagementDashboard({ user }: TeacherEngagementDashboardProps) {
  const [modules, setModules] = useState<Module[]>([]);
  const [students, setStudents] = useState<StudentEngagement[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('modules');
  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchDashboardData();
    }
  }, [filterSubject, filterStatus]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch simulations from the API
      const params = new URLSearchParams();
      if (filterSubject !== 'all') params.append('subject', filterSubject);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/simulations?${params.toString()}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.modules) {
          setModules(data.modules);
        }
      } else {
        console.error('Failed to fetch simulations');
      }

      setStudents([
        {
          id: '1',
          name: 'Sokha Lim',
          lastActive: '10 minutes ago',
          modulesCompleted: 12,
          totalModules: 15,
          averageScore: 85,
          status: 'active',
          recentActivity: 'Completed Pendulum Lab'
        },
        {
          id: '2',
          name: 'Dara Chan',
          lastActive: '2 hours ago',
          modulesCompleted: 8,
          totalModules: 15,
          averageScore: 72,
          status: 'active',
          recentActivity: 'Started Chemical Reactions'
        },
        {
          id: '3',
          name: 'Sophea Kim',
          lastActive: '1 day ago',
          modulesCompleted: 5,
          totalModules: 15,
          averageScore: 65,
          status: 'struggling',
          recentActivity: 'Viewed Cell Structure'
        },
        {
          id: '4',
          name: 'Vichea Sok',
          lastActive: '3 days ago',
          modulesCompleted: 10,
          totalModules: 15,
          averageScore: 78,
          status: 'inactive'
        }
      ]);

      setActivities([
        {
          id: '1',
          studentName: 'Sokha Lim',
          action: 'completed',
          module: 'Pendulum Lab',
          timestamp: '10 minutes ago',
          type: 'completed'
        },
        {
          id: '2',
          studentName: 'Dara Chan',
          action: 'started',
          module: 'Chemical Reactions',
          timestamp: '2 hours ago',
          type: 'started'
        },
        {
          id: '3',
          studentName: 'Sophea Kim',
          action: 'sent a message',
          module: 'Cell Structure',
          timestamp: '1 day ago',
          type: 'message'
        }
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateModule = () => {
    router.push('/dashboard/simulations/new');
  };

  const handleEditModule = (moduleId: string) => {
    router.push(`/dashboard/simulations/${moduleId}/edit`);
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (confirm('Are you sure you want to delete this module?')) {
      try {
        const response = await fetch(`/api/simulations/${moduleId}`, {
          method: 'DELETE',
          credentials: 'include'
        });

        if (response.ok) {
          // Refresh the modules list
          fetchDashboardData();
        } else {
          const error = await response.json();
          alert(error.error || 'Failed to delete module');
        }
      } catch (error) {
        console.error('Error deleting module:', error);
        alert('Failed to delete module');
      }
    }
  };

  const handleViewStudent = (studentId: string) => {
    router.push(`/dashboard/students/${studentId}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>;
      case 'archived':
        return <Badge className="bg-gray-100 text-gray-800">Archived</Badge>;
      case 'struggling':
        return <Badge className="bg-red-100 text-red-800">Needs Help</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
      default:
        return null;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'started':
        return <Play className="h-4 w-4 text-blue-600" />;
      case 'submitted':
        return <FileText className="h-4 w-4 text-purple-600" />;
      case 'message':
        return <MessageSquare className="h-4 w-4 text-orange-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredModules = modules.filter(module => {
    const matchesSearch = module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         module.titleKm.includes(searchQuery);
    const matchesSubject = filterSubject === 'all' || module.subject === filterSubject;
    const matchesStatus = filterStatus === 'all' || module.status === filterStatus;
    return matchesSearch && matchesSubject && matchesStatus;
  });

  const filteredStudents = students.filter(student => {
    return student.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return <LoadingSpinnerCompact />;
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold font-hanuman">
              ផ្ទាំងគ្រប់គ្រងគ្រូបង្រៀន
            </h2>
            <p className="text-blue-100 mt-1">Teacher Engagement Dashboard</p>
          </div>
          <div className="hidden sm:flex gap-2">
            <Badge className="bg-white/20 text-white border-white/50 px-3 py-1.5">
              <FlaskConical className="h-4 w-4 mr-1" />
              STEM Lab Teacher
            </Badge>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Students</p>
                <p className="text-2xl font-bold">32</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Modules</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <BookOpen className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold">73%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Needs Help</p>
                <p className="text-2xl font-bold">5</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="modules" className="font-hanuman">
            <BookOpen className="h-4 w-4 mr-2" />
            Modules
          </TabsTrigger>
          <TabsTrigger value="students" className="font-hanuman">
            <Users className="h-4 w-4 mr-2" />
            Students
          </TabsTrigger>
          <TabsTrigger value="activity" className="font-hanuman">
            <Sparkles className="h-4 w-4 mr-2" />
            Activity
          </TabsTrigger>
        </TabsList>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {activeTab === 'modules' && (
            <>
              <Select value={filterSubject} onValueChange={setFilterSubject}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  <SelectItem value="Physics">Physics</SelectItem>
                  <SelectItem value="Chemistry">Chemistry</SelectItem>
                  <SelectItem value="Biology">Biology</SelectItem>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </>
          )}
        </div>

        {/* Modules Tab */}
        <TabsContent value="modules" className="space-y-4">
          <div className="grid gap-4">
            {filteredModules.map((module) => (
              <Card key={module.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{module.title}</h3>
                          <p className="text-sm text-gray-600 font-hanuman">{module.titleKm}</p>
                        </div>
                        <div className="sm:hidden">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => router.push(`/dashboard/simulations/${module.id}`)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditModule(module.id)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteModule(module.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 mt-3">
                        <Badge variant="secondary">{module.subject}</Badge>
                        <Badge variant="outline" className="capitalize">{module.type}</Badge>
                        {getStatusBadge(module.status)}
                        <span className="text-sm text-gray-500">
                          <Users className="inline h-3 w-3 mr-1" />
                          {module.studentsAssigned} students
                        </span>
                        <span className="text-sm text-gray-500">
                          <Clock className="inline h-3 w-3 mr-1" />
                          {module.lastModified}
                        </span>
                      </div>
                      
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Completion Rate</span>
                          <span className="font-medium">{module.completionRate}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${module.completionRate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="hidden sm:flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push(`/dashboard/simulations/${module.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditModule(module.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteModule(module.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-4">
          <div className="grid gap-4">
            {filteredStudents.map((student) => (
              <Card key={student.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h3 className="font-semibold">{student.name}</h3>
                          <p className="text-sm text-gray-600">Last active: {student.lastActive}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 mt-3">
                        {getStatusBadge(student.status)}
                        <span className="text-sm text-gray-600">
                          <BookOpen className="inline h-3 w-3 mr-1" />
                          {student.modulesCompleted}/{student.totalModules} modules
                        </span>
                        <span className="text-sm text-gray-600">
                          <TrendingUp className="inline h-3 w-3 mr-1" />
                          {student.averageScore}% avg score
                        </span>
                      </div>
                      
                      {student.recentActivity && (
                        <p className="text-sm text-gray-500 mt-2">
                          <Sparkles className="inline h-3 w-3 mr-1" />
                          {student.recentActivity}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewStudent(student.id)}
                      >
                        View Profile
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates from your students</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0">
                    <div className="mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.studentName}</span>
                        {' '}{activity.action}{' '}
                        <span className="font-medium">{activity.module}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        <Clock className="inline h-3 w-3 mr-1" />
                        {activity.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}