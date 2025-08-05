'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ModernSidebar from '@/components/dashboard/ModernSidebar';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Download,
  Upload,
  MoreVertical,
  FlaskConical,
  Atom,
  Brain,
  Waves,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Copy,
  ExternalLink,
  Settings,
  Archive,
  Star,
  StarOff,
  ArrowLeft,
  Bell,
  Menu,
  Sparkles,
  Rocket,
  Microscope,
  GraduationCap,
  Activity,
  Zap,
  Heart,
  Play,
  BookOpen,
  Clock,
  Users
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PageHeader, StatCard, EmptyState, TabNav } from '@/components/dashboard/ui-components';
import * as design from '@/components/dashboard/design-system';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/LanguageProvider';

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

interface Simulation {
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
  simulation_url: string;
  preview_image: string;
  tags: string[];
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  total_attempts?: number;
  total_completions?: number;
  active_assignments?: number;
}

const subjectIcons: Record<string, any> = {
  'Physics': Waves,
  'Chemistry': Atom,
  'Biology': Brain,
  'Mathematics': BarChart3
};

const subjectGradients: Record<string, string> = {
  'Physics': design.gradients.primary,
  'Chemistry': design.gradients.secondary,
  'Biology': design.gradients.success,
  'Mathematics': design.gradients.warning
};

const difficultyConfig: Record<string, { color: string; emoji: string; gradient: string }> = {
  'Beginner': { 
    color: 'bg-green-100 text-green-700 border-green-200',
    emoji: '🌱',
    gradient: design.gradients.success
  },
  'Intermediate': { 
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    emoji: '🔥',
    gradient: design.gradients.warning
  },
  'Advanced': { 
    color: 'bg-red-100 text-red-700 border-red-200',
    emoji: '🚀',
    gradient: design.gradients.danger
  }
};

export default function SimulationsManagementPage() {
  const router = useRouter();
  const { t, getFontClass, language } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSimulation, setSelectedSimulation] = useState<Simulation | null>(null);
  const [activeTab, setActiveTab] = useState('active');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
    if (user) {
      fetchSimulations();
    }
  }, [user]);

  const fetchSimulations = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/simulations?includeInactive=true', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        // Map the API response to match our interface
        const mappedSimulations = data.modules.map((sim: any) => ({
          id: sim.id,
          simulation_name: sim.simulationName || sim.simulation_name || '',
          display_name_en: sim.title,
          display_name_km: sim.titleKm,
          description_en: sim.description,
          description_km: sim.descriptionKm,
          subject_area: sim.subject,
          difficulty_level: sim.difficulty,
          grade_levels: sim.gradeLevels || [],
          estimated_duration: sim.estimatedDuration || 30,
          simulation_url: sim.simulationUrl,
          preview_image: sim.previewImage,
          tags: sim.tags || [],
          is_featured: sim.isFeatured || false,
          is_active: sim.status === 'active',
          created_at: sim.created_at,
          updated_at: sim.lastModified,
          total_attempts: sim.totalAttempts || 0,
          total_completions: sim.totalCompletions || 0,
          active_assignments: sim.studentsAssigned || 0
        }));
        setSimulations(mappedSimulations);
      }
    } catch (error) {
      console.error('Error fetching simulations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (simulation: Simulation) => {
    try {
      const response = await fetch(`/api/simulations/${simulation.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        fetchSimulations();
        setDeleteDialogOpen(false);
        setSelectedSimulation(null);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete simulation');
      }
    } catch (error) {
      console.error('Error deleting simulation:', error);
      alert('Failed to delete simulation');
    }
  };

  const handleDuplicate = async (simulation: Simulation) => {
    try {
      const response = await fetch('/api/simulations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          simulation_name: `${simulation.simulation_name}-copy`,
          display_name_en: `${simulation.display_name_en} (Copy)`,
          display_name_km: simulation.display_name_km ? `${simulation.display_name_km} (Copy)` : '',
          description_en: simulation.description_en,
          description_km: simulation.description_km,
          subject_area: simulation.subject_area,
          difficulty_level: simulation.difficulty_level,
          grade_levels: simulation.grade_levels,
          estimated_duration: simulation.estimated_duration,
          simulation_url: simulation.simulation_url,
          tags: simulation.tags
        })
      });

      if (response.ok) {
        fetchSimulations();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to duplicate simulation');
      }
    } catch (error) {
      console.error('Error duplicating simulation:', error);
      alert('Failed to duplicate simulation');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleToggleFeatured = async (simulation: Simulation) => {
    try {
      const response = await fetch(`/api/simulations/${simulation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...simulation,
          is_featured: !simulation.is_featured
        })
      });

      if (response.ok) {
        fetchSimulations();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update simulation');
      }
    } catch (error) {
      console.error('Error updating simulation:', error);
      alert('Failed to update simulation');
    }
  };

  const handleToggleActive = async (simulation: Simulation) => {
    try {
      const response = await fetch(`/api/simulations/${simulation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...simulation,
          is_active: !simulation.is_active
        })
      });

      if (response.ok) {
        fetchSimulations();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update simulation');
      }
    } catch (error) {
      console.error('Error updating simulation:', error);
      alert('Failed to update simulation');
    }
  };

  const filteredSimulations = simulations.filter(sim => {
    const matchesSearch = searchQuery === '' || 
      sim.display_name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sim.display_name_km.includes(searchQuery) ||
      sim.simulation_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSubject = subjectFilter === 'all' || sim.subject_area === subjectFilter;
    const matchesDifficulty = difficultyFilter === 'all' || sim.difficulty_level === difficultyFilter;
    
    let matchesStatus = true;
    if (statusFilter === 'active') matchesStatus = sim.is_active;
    if (statusFilter === 'inactive') matchesStatus = !sim.is_active;
    if (statusFilter === 'featured') matchesStatus = sim.is_featured;

    let matchesTab = true;
    if (activeTab === 'active') matchesTab = sim.is_active;
    if (activeTab === 'inactive') matchesTab = !sim.is_active;
    if (activeTab === 'featured') matchesTab = sim.is_featured;

    return matchesSearch && matchesSubject && matchesDifficulty && matchesStatus && matchesTab;
  });

  const getSubjectIcon = (subject: string) => {
    const Icon = subjectIcons[subject] || FlaskConical;
    return <Icon className="h-4 w-4" />;
  };

  if (sessionLoading || loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className={cn("flex min-h-screen", design.gradients.ocean)}>
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
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard/simulations/import')}
                  className="hover:bg-purple-50 hover:border-purple-300 transition-colors"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
                <Button
                  onClick={() => router.push('/dashboard/simulations/new')}
                  className={cn(design.buttonVariants.primary, "shadow-lg")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Simulation
                  <Sparkles className="h-4 w-4 ml-1" />
                </Button>
              </div>
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
              title="STEM Simulations Lab"
              titleKm="មន្ទីរពិសោធន៍វិទ្យាសាស្ត្រ STEM"
              description="Create amazing virtual experiments for your students! 🔬✨"
              actions={
                <Badge className={cn(
                  "px-4 py-2 text-sm font-medium",
                  design.animations.pulse,
                  design.gradients.secondary
                )}>
                  <Microscope className="h-4 w-4 mr-2" />
                  {simulations.length} Experiments
                </Badge>
              }
            />

            {/* Stats Cards with colorful design */}
            <div className={design.grids.stats}>
              <StatCard
                title="Total Simulations"
                value={simulations.length}
                description="Virtual experiments"
                icon={FlaskConical}
                color="primary"
                gradient={true}
                trend="up"
                trendValue="New!"
              />
              
              <StatCard
                title="Active Labs"
                value={simulations.filter(s => s.is_active).length}
                description="Ready to launch"
                icon={Rocket}
                color="success"
                gradient={true}
              />
              
              <StatCard
                title="Featured"
                value={simulations.filter(s => s.is_featured).length}
                description="Star experiments"
                icon={Star}
                color="warning"
                gradient={true}
              />
              
              <StatCard
                title="Total Attempts"
                value={simulations.reduce((sum, s) => sum + (s.total_attempts || 0), 0)}
                description="Student engagements"
                icon={Activity}
                color="secondary"
                gradient={true}
                trend="up"
                trendValue="15%"
              />
            </div>

            {/* Filters with colorful design */}
            <Card className={cn(design.cardVariants.colorful, "overflow-hidden")}>
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 pb-6">
                <CardTitle className="flex items-center space-x-3">
                  <div className={cn("p-2 rounded-xl", design.gradients.primary)}>
                    <Filter className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl">Smart Filters</span>
                  <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
                </CardTitle>
                <CardDescription>
                  Find the perfect simulation for your lesson
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <label className="flex items-center space-x-2 text-sm font-medium mb-2">
                      <Search className="h-4 w-4 text-purple-500" />
                      <span>Search</span>
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Find simulations by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-12 border-2 hover:border-purple-300 focus:border-purple-400 transition-colors"
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-medium">
                        <BookOpen className="h-4 w-4 text-blue-500" />
                        <span>Subject</span>
                      </label>
                      <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                        <SelectTrigger className="w-full sm:w-[150px] h-12 border-2 hover:border-blue-300 transition-colors">
                          <SelectValue placeholder="All Subjects" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                              <span>All Subjects</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="Physics">
                            <div className="flex items-center space-x-2">
                              <Waves className="h-4 w-4 text-blue-500" />
                              <span>Physics</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="Chemistry">
                            <div className="flex items-center space-x-2">
                              <Atom className="h-4 w-4 text-purple-500" />
                              <span>Chemistry</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="Biology">
                            <div className="flex items-center space-x-2">
                              <Brain className="h-4 w-4 text-green-500" />
                              <span>Biology</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="Mathematics">
                            <div className="flex items-center space-x-2">
                              <BarChart3 className="h-4 w-4 text-orange-500" />
                              <span>Mathematics</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-medium">
                        <GraduationCap className="h-4 w-4 text-green-500" />
                        <span>Difficulty</span>
                      </label>
                      <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                        <SelectTrigger className="w-full sm:w-[150px] h-12 border-2 hover:border-green-300 transition-colors">
                          <SelectValue placeholder="All Levels" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Levels</SelectItem>
                          {Object.entries(difficultyConfig).map(([level, config]) => (
                            <SelectItem key={level} value={level}>
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">{config.emoji}</span>
                                <span>{level}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm font-medium">
                        <Activity className="h-4 w-4 text-orange-500" />
                        <span>Status</span>
                      </label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[150px] h-12 border-2 hover:border-orange-300 transition-colors">
                          <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
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
                          <SelectItem value="featured">
                            <div className="flex items-center space-x-2">
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                              <span>Featured</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Active Filters Display */}
                {(searchQuery || subjectFilter !== 'all' || difficultyFilter !== 'all' || statusFilter !== 'all') && (
                  <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Zap className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium text-purple-700">Active Filters:</span>
                        <div className="flex flex-wrap gap-2">
                          {searchQuery && (
                            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                              Search: {searchQuery}
                            </Badge>
                          )}
                          {subjectFilter !== 'all' && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                              {subjectFilter}
                            </Badge>
                          )}
                          {difficultyFilter !== 'all' && (
                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                              {difficultyFilter}
                            </Badge>
                          )}
                          {statusFilter !== 'all' && (
                            <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                              {statusFilter}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSearchQuery('');
                          setSubjectFilter('all');
                          setDifficultyFilter('all');
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

            {/* Simulations List with enhanced tabs */}
            <Card className={cn(design.cardVariants.colorful, "overflow-hidden")}>
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <div className={cn("p-2 rounded-xl", design.gradients.secondary)}>
                      <Microscope className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Simulation Library</h2>
                      <p className="text-sm text-gray-600">Your collection of virtual experiments</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <TabNav
                    tabs={[
                      {
                        id: 'active',
                        label: 'Active',
                        icon: Rocket,
                        badge: simulations.filter(s => s.is_active).length
                      },
                      {
                        id: 'inactive',
                        label: 'Inactive',
                        icon: Archive,
                        badge: simulations.filter(s => !s.is_active).length
                      },
                      {
                        id: 'featured',
                        label: 'Featured',
                        icon: Star,
                        badge: simulations.filter(s => s.is_featured).length
                      },
                      {
                        id: 'all',
                        label: 'All',
                        icon: FlaskConical,
                        badge: simulations.length
                      }
                    ]}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                  />
                </div>
              </CardHeader>
          
              <CardContent className="p-0">
                {filteredSimulations.length === 0 ? (
                  <div className="p-8">
                    <EmptyState
                      icon={FlaskConical}
                      title="No simulations found"
                      description="Try adjusting your filters or create a new simulation"
                      action={{
                        label: "Create Simulation",
                        onClick: () => router.push('/dashboard/simulations/new')
                      }}
                    />
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredSimulations.map((simulation, index) => (
                      <div 
                        key={simulation.id} 
                        className={cn(
                          "p-6 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 transition-all duration-300",
                          design.animations.fadeIn
                        )}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="flex-1">
                            {/* Simulation Header */}
                            <div className="flex items-start space-x-4">
                              <div className={cn(
                                "w-14 h-14 rounded-xl flex items-center justify-center shadow-lg text-white",
                                subjectGradients[simulation.subject_area] || design.gradients.primary
                              )}>
                                {getSubjectIcon(simulation.subject_area)}
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-3 mb-2">
                                  <h3 className="text-xl font-bold text-gray-900">
                                    {simulation.display_name_en}
                                  </h3>
                                  {simulation.is_featured && (
                                    <div className="flex items-center space-x-1 text-yellow-500">
                                      <Star className="h-5 w-5 fill-current" />
                                      <span className="text-sm font-medium">Featured</span>
                                    </div>
                                  )}
                                </div>
                                
                                <p className="text-gray-600 font-hanuman mb-1">
                                  {simulation.display_name_km}
                                </p>
                                
                                <div className="flex flex-wrap items-center gap-3 text-sm">
                                  <Badge className={cn(
                                    "px-3 py-1",
                                    design.gradients.secondary,
                                    "text-white border-0"
                                  )}>
                                    <BookOpen className="h-3 w-3 mr-1" />
                                    {simulation.subject_area}
                                  </Badge>
                                  
                                  <Badge className={cn(
                                    "px-3 py-1 border font-medium",
                                    difficultyConfig[simulation.difficulty_level]?.color
                                  )}>
                                    <span className="mr-1">
                                      {difficultyConfig[simulation.difficulty_level]?.emoji}
                                    </span>
                                    {simulation.difficulty_level}
                                  </Badge>
                                  
                                  {simulation.grade_levels.length > 0 && (
                                    <div className="flex items-center space-x-1 text-gray-600">
                                      <GraduationCap className="h-4 w-4" />
                                      <span>
                                        Grades {Math.min(...simulation.grade_levels)}-{Math.max(...simulation.grade_levels)}
                                      </span>
                                    </div>
                                  )}
                                  
                                  <div className="flex items-center space-x-1 text-gray-600">
                                    <Clock className="h-4 w-4" />
                                    <span>{simulation.estimated_duration} min</span>
                                  </div>
                                  
                                  {simulation.is_active ? (
                                    <Badge className="bg-green-100 text-green-700 border-green-200">
                                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
                                      Active
                                    </Badge>
                                  ) : (
                                    <Badge className="bg-gray-100 text-gray-700 border-gray-200">
                                      <div className="w-2 h-2 bg-gray-400 rounded-full mr-1"></div>
                                      Inactive
                                    </Badge>
                                  )}
                                </div>
                                
                                {/* Stats */}
                                <div className="flex flex-wrap gap-4 mt-3">
                                  <div className="flex items-center space-x-2 text-sm">
                                    <div className="p-1.5 rounded-lg bg-blue-100">
                                      <Users className="h-3 w-3 text-blue-600" />
                                    </div>
                                    <span className="text-gray-600">
                                      <span className="font-semibold text-gray-900">{simulation.active_assignments || 0}</span> students assigned
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center space-x-2 text-sm">
                                    <div className="p-1.5 rounded-lg bg-purple-100">
                                      <Activity className="h-3 w-3 text-purple-600" />
                                    </div>
                                    <span className="text-gray-600">
                                      <span className="font-semibold text-gray-900">{simulation.total_attempts || 0}</span> attempts
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center space-x-2 text-sm">
                                    <div className="p-1.5 rounded-lg bg-green-100">
                                      <CheckCircle className="h-3 w-3 text-green-600" />
                                    </div>
                                    <span className="text-gray-600">
                                      <span className="font-semibold text-gray-900">{simulation.total_completions || 0}</span> completed
                                    </span>
                                  </div>
                                </div>
                                
                                {/* Tags */}
                                {simulation.tags && simulation.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mt-3">
                                    {simulation.tags.map((tag, i) => (
                                      <span key={i} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                        #{tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex flex-row lg:flex-col gap-2">
                            <Button
                              onClick={() => window.open(simulation.simulation_url, '_blank')}
                              className={cn(
                                "flex-1 lg:flex-initial",
                                design.buttonVariants.success
                              )}
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Launch
                            </Button>
                            
                            <Button
                              variant="outline"
                              onClick={() => router.push(`/dashboard/simulations/${simulation.id}`)}
                              className="flex-1 lg:flex-initial hover:bg-purple-50 hover:border-purple-300"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Details
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
                                <DropdownMenuItem onClick={() => router.push(`/dashboard/simulations/${simulation.id}/edit`)}>
                                  <Edit className="mr-2 h-4 w-4 text-blue-600" />
                                  Edit Simulation
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDuplicate(simulation)}>
                                  <Copy className="mr-2 h-4 w-4 text-purple-600" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleFeatured(simulation)}>
                                  {simulation.is_featured ? (
                                    <>
                                      <StarOff className="mr-2 h-4 w-4 text-yellow-600" />
                                      Remove Featured
                                    </>
                                  ) : (
                                    <>
                                      <Star className="mr-2 h-4 w-4 text-yellow-600" />
                                      Make Featured
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleActive(simulation)}>
                                  {simulation.is_active ? (
                                    <>
                                      <Archive className="mr-2 h-4 w-4 text-gray-600" />
                                      Deactivate
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                      Activate
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => {
                                    setSelectedSimulation(simulation);
                                    setDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Simulation
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Delete Confirmation Dialog with enhanced design */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-3 rounded-xl bg-red-100">
                      <AlertCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <AlertDialogTitle className="text-xl">Delete Simulation</AlertDialogTitle>
                  </div>
                  <AlertDialogDescription className="space-y-3">
                    <p>
                      Are you sure you want to delete <span className="font-semibold">"{selectedSimulation?.display_name_en}"</span>?
                    </p>
                    {selectedSimulation?.active_assignments && selectedSimulation.active_assignments > 0 && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="font-medium text-red-800 flex items-center space-x-2">
                          <AlertCircle className="h-4 w-4" />
                          <span>Warning: Active Assignments</span>
                        </p>
                        <p className="text-sm text-red-700 mt-1">
                          This simulation has {selectedSimulation.active_assignments} students currently assigned.
                          Deleting it will remove their access.
                        </p>
                      </div>
                    )}
                    <p className="text-sm text-gray-600">
                      This action cannot be undone.
                    </p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="hover:bg-gray-100">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => selectedSimulation && handleDelete(selectedSimulation)}
                    className={cn(design.buttonVariants.primary, "bg-red-600 hover:bg-red-700")}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Simulation
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </main>
      </div>
    </div>
  );
}