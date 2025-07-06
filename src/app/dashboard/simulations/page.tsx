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
  ArrowLeft
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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

const difficultyColors: Record<string, string> = {
  'Beginner': 'bg-green-100 text-green-800',
  'Intermediate': 'bg-yellow-100 text-yellow-800',
  'Advanced': 'bg-red-100 text-red-800'
};

export default function SimulationsManagementPage() {
  const router = useRouter();
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSimulation, setSelectedSimulation] = useState<Simulation | null>(null);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    fetchSimulations();
  }, []);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                STEM Simulations
              </h1>
              <p className="text-gray-600 mt-2">Manage your virtual lab simulations</p>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
              
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard/simulations/import')}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
                <Button
                  onClick={() => router.push('/dashboard/simulations/new')}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Simulation
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Simulations</p>
                  <p className="text-2xl font-bold">{simulations.length}</p>
                </div>
                <FlaskConical className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold">{simulations.filter(s => s.is_active).length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Featured</p>
                  <p className="text-2xl font-bold">{simulations.filter(s => s.is_featured).length}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Attempts</p>
                  <p className="text-2xl font-bold">
                    {simulations.reduce((sum, s) => sum + (s.total_attempts || 0), 0)}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search simulations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                  <SelectTrigger className="w-full sm:w-[150px]">
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
                
                <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="featured">Featured</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Simulations List */}
        <Card className="overflow-visible">
          <CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="active">
                  Active ({simulations.filter(s => s.is_active).length})
                </TabsTrigger>
                <TabsTrigger value="inactive">
                  Inactive ({simulations.filter(s => !s.is_active).length})
                </TabsTrigger>
                <TabsTrigger value="featured">
                  Featured ({simulations.filter(s => s.is_featured).length})
                </TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          
          <CardContent className="overflow-visible">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Simulation</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead className="text-center">Grades</TableHead>
                    <TableHead className="text-center">Duration</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Stats</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSimulations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        No simulations found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSimulations.map((simulation) => (
                      <TableRow key={simulation.id}>
                        <TableCell>
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center`}>
                              {getSubjectIcon(simulation.subject_area)}
                            </div>
                            <div>
                              <p className="font-medium">{simulation.display_name_en}</p>
                              <p className="text-sm text-gray-600 font-hanuman">{simulation.display_name_km}</p>
                              <p className="text-xs text-gray-400">{simulation.simulation_name}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{simulation.subject_area}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={difficultyColors[simulation.difficulty_level]}>
                            {simulation.difficulty_level}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {simulation.grade_levels.length > 0 
                            ? `${Math.min(...simulation.grade_levels)}-${Math.max(...simulation.grade_levels)}`
                            : '-'
                          }
                        </TableCell>
                        <TableCell className="text-center">{simulation.estimated_duration} min</TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-2">
                            {simulation.is_active ? (
                              <Badge className="bg-green-100 text-green-800">Active</Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                            )}
                            {simulation.is_featured && (
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="text-sm">
                            <p>{simulation.active_assignments || 0} assigned</p>
                            <p className="text-gray-500">{simulation.total_attempts || 0} attempts</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent 
                              align="end" 
                              className="w-48 bg-white" 
                              sideOffset={5}
                              style={{ zIndex: 9999 }}
                            >
                              <DropdownMenuItem onClick={() => router.push(`/dashboard/simulations/${simulation.id}`)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => router.push(`/dashboard/simulations/${simulation.id}/edit`)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => window.open(simulation.simulation_url, '_blank')}>
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Launch Simulation
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDuplicate(simulation)}>
                                <Copy className="mr-2 h-4 w-4" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleFeatured(simulation)}>
                                {simulation.is_featured ? (
                                  <>
                                    <StarOff className="mr-2 h-4 w-4" />
                                    Remove Featured
                                  </>
                                ) : (
                                  <>
                                    <Star className="mr-2 h-4 w-4" />
                                    Make Featured
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleActive(simulation)}>
                                {simulation.is_active ? (
                                  <>
                                    <Archive className="mr-2 h-4 w-4" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="mr-2 h-4 w-4" />
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
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Simulation</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{selectedSimulation?.display_name_en}"? 
                {selectedSimulation?.active_assignments && selectedSimulation.active_assignments > 0 && (
                  <span className="block mt-2 font-medium text-red-600">
                    Warning: This simulation has {selectedSimulation.active_assignments} active assignments.
                  </span>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => selectedSimulation && handleDelete(selectedSimulation)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}