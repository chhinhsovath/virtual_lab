'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, Search, Edit, Trash2, Eye, FlaskConical, 
  Atom, Calculator, Dna, BookOpen, GraduationCap,
  Clock, Users, ExternalLink, Settings
} from 'lucide-react';
import { toast } from 'sonner';

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
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

const subjectIcons: Record<string, any> = {
  Physics: Atom,
  Chemistry: FlaskConical,
  Biology: Dna,
  Mathematics: Calculator,
};

const difficultyColors: Record<string, string> = {
  Beginner: 'bg-green-100 text-green-800',
  Intermediate: 'bg-yellow-100 text-yellow-800',
  Advanced: 'bg-red-100 text-red-800',
};

export default function TeacherSimulationsPage() {
  const router = useRouter();
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchSimulations();
  }, [selectedSubject, searchTerm]);

  const fetchSimulations = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedSubject !== 'all') params.append('subject', selectedSubject);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/teacher/simulations?${params}`);
      const data = await response.json();

      if (data.success) {
        setSimulations(data.simulations);
      }
    } catch (error) {
      console.error('Error fetching simulations:', error);
      toast.error('Failed to load simulations');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const response = await fetch(`/api/teacher/simulations/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        fetchSimulations();
      } else {
        toast.error('Failed to delete simulation');
      }
    } catch (error) {
      console.error('Error deleting simulation:', error);
      toast.error('Failed to delete simulation');
    }
  };

  const filteredSimulations = simulations.filter(sim => {
    if (activeTab === 'active') return sim.is_active;
    if (activeTab === 'inactive') return !sim.is_active;
    if (activeTab === 'featured') return sim.is_featured;
    return true;
  });

  const getSubjectStats = () => {
    const stats: Record<string, number> = {};
    simulations.forEach(sim => {
      stats[sim.subject_area] = (stats[sim.subject_area] || 0) + 1;
    });
    return stats;
  };

  const subjectStats = getSubjectStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                STEM Simulations Management
              </h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">Manage your virtual lab simulations</p>
            </div>
            <Button
              onClick={() => router.push('/dashboard/simulations/new')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 w-full sm:w-auto"
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Create New Simulation</span>
              <span className="sm:hidden">Create New</span>
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
            <Card className="bg-white/90 backdrop-blur">
              <CardHeader className="pb-2 md:pb-3">
                <CardTitle className="text-xs md:text-sm font-medium text-gray-600">Total Simulations</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-lg md:text-2xl font-bold text-purple-600">{simulations.length}</div>
              </CardContent>
            </Card>
            {Object.entries(subjectStats).map(([subject, count]) => {
              const Icon = subjectIcons[subject] || BookOpen;
              return (
                <Card key={subject} className="bg-white/90 backdrop-blur">
                  <CardHeader className="pb-2 md:pb-3">
                    <CardTitle className="text-xs md:text-sm font-medium text-gray-600 flex items-center gap-1 md:gap-2">
                      <Icon className="h-3 w-3 md:h-4 md:w-4" />
                      <span className="hidden sm:inline">{subject}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-lg md:text-2xl font-bold text-purple-600">{count}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search simulations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-sm"
                />
              </div>
            </div>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                <SelectItem value="Physics">Physics</SelectItem>
                <SelectItem value="Chemistry">Chemistry</SelectItem>
                <SelectItem value="Biology">Biology</SelectItem>
                <SelectItem value="Mathematics">Mathematics</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 md:mb-6 grid grid-cols-2 md:grid-cols-4 w-full">
            <TabsTrigger value="all" className="text-xs sm:text-sm">All ({simulations.length})</TabsTrigger>
            <TabsTrigger value="active" className="text-xs sm:text-sm">Active ({simulations.filter(s => s.is_active).length})</TabsTrigger>
            <TabsTrigger value="inactive" className="text-xs sm:text-sm">Inactive ({simulations.filter(s => !s.is_active).length})</TabsTrigger>
            <TabsTrigger value="featured" className="text-xs sm:text-sm">Featured ({simulations.filter(s => s.is_featured).length})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {/* Simulations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredSimulations.map((simulation) => {
                const Icon = subjectIcons[simulation.subject_area] || BookOpen;
                
                return (
                  <Card key={simulation.id} className="bg-white/90 backdrop-blur hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-2">
                        <div className="flex items-center gap-2 flex-1">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Icon className="h-5 w-5 text-purple-600" />
                          </div>
                          <Badge variant="outline">{simulation.subject_area}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {simulation.is_featured && (
                            <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
                          )}
                          <Badge className={simulation.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {simulation.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                      <CardTitle className="text-base md:text-lg line-clamp-1">{simulation.display_name_en}</CardTitle>
                      <CardDescription className="text-xs md:text-sm text-gray-600 line-clamp-1">
                        {simulation.display_name_km}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                        {simulation.description_en}
                      </p>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <GraduationCap className="h-4 w-4 text-gray-400" />
                          <span>Grades: {simulation.grade_levels.join(', ')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>{simulation.estimated_duration} minutes</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={difficultyColors[simulation.difficulty_level]}>
                            {simulation.difficulty_level}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(simulation.simulation_url, '_blank')}
                          className="flex-1 text-xs sm:text-sm"
                          disabled={!simulation.simulation_url || simulation.simulation_url === '#'}
                        >
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Preview
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/dashboard/simulations/${simulation.id}/edit`)}
                          className="flex-1 text-xs sm:text-sm"
                        >
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(simulation.id, simulation.display_name_en)}
                          className="text-red-600 hover:bg-red-50 px-2 sm:px-3"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredSimulations.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No simulations found</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}