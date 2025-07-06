'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { LoadingSpinnerCompact } from '@/components/ui/loading-spinner';
import { ArrowLeft, Play, Search, Filter, FlaskConical, Zap, BookOpen, Calculator } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Simulation {
  id: string;
  display_name_en: string;
  display_name_km: string;
  description_en: string;
  subject_area: string;
  difficulty_level: string;
  grade_levels: number[];
  simulation_url: string;
  preview_image?: string;
  is_featured: boolean;
  estimated_duration: number;
}

export default function LaunchSimulationsPage() {
  const router = useRouter();
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');

  useEffect(() => {
    fetchSimulations();
  }, [filterSubject, filterDifficulty]);

  const fetchSimulations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('status', 'active');
      if (filterSubject !== 'all') params.append('subject', filterSubject);
      if (filterDifficulty !== 'all') params.append('difficulty', filterDifficulty);

      const response = await fetch(`/api/simulations?${params.toString()}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.modules) {
          setSimulations(data.modules);
        }
      }
    } catch (error) {
      console.error('Error fetching simulations:', error);
    } finally {
      setLoading(false);
    }
  };

  const launchSimulation = (simulationUrl: string) => {
    if (simulationUrl) {
      window.open(simulationUrl, '_blank');
    }
  };

  const getSubjectIcon = (subject: string) => {
    switch (subject) {
      case 'Physics':
        return <Zap className="h-4 w-4" />;
      case 'Chemistry':
        return <FlaskConical className="h-4 w-4" />;
      case 'Biology':
        return <BookOpen className="h-4 w-4" />;
      case 'Mathematics':
        return <Calculator className="h-4 w-4" />;
      default:
        return <FlaskConical className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'bg-green-100 text-green-800';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'Advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredSimulations = simulations.filter(sim => {
    const matchesSearch = sim.display_name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         sim.display_name_km.includes(searchQuery);
    return matchesSearch;
  });

  if (loading) {
    return <LoadingSpinnerCompact />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Launch STEM Simulations
              </h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">Quick access to launch simulations for your students</p>
            </div>
            
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search simulations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
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
              
              <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Featured Simulations */}
        {filteredSimulations.some(sim => sim.is_featured) && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Zap className="h-5 w-5 mr-2 text-yellow-500" />
              Featured Simulations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSimulations
                .filter(sim => sim.is_featured)
                .map((simulation) => (
                  <Card key={simulation.id} className="hover:shadow-lg transition-shadow border-yellow-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{simulation.display_name_en}</CardTitle>
                          {simulation.display_name_km && (
                            <p className="text-sm text-gray-600 font-hanuman mt-1">{simulation.display_name_km}</p>
                          )}
                        </div>
                        {getSubjectIcon(simulation.subject_area)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{simulation.description_en}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="secondary">{simulation.subject_area}</Badge>
                        <Badge className={getDifficultyColor(simulation.difficulty_level)}>
                          {simulation.difficulty_level}
                        </Badge>
                        <Badge variant="outline">
                          {simulation.estimated_duration} min
                        </Badge>
                      </div>
                      
                      <Button 
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        onClick={() => launchSimulation(simulation.simulation_url)}
                        disabled={!simulation.simulation_url}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Launch Simulation
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}

        {/* All Simulations */}
        <div>
          <h2 className="text-xl font-semibold mb-4">All Simulations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredSimulations
              .filter(sim => !sim.is_featured)
              .map((simulation) => (
                <Card key={simulation.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base">{simulation.display_name_en}</CardTitle>
                        {simulation.display_name_km && (
                          <p className="text-xs text-gray-600 font-hanuman mt-1">{simulation.display_name_km}</p>
                        )}
                      </div>
                      {getSubjectIcon(simulation.subject_area)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">{simulation.description_en}</p>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      <Badge variant="secondary" className="text-xs">{simulation.subject_area}</Badge>
                      <Badge className={`text-xs ${getDifficultyColor(simulation.difficulty_level)}`}>
                        {simulation.difficulty_level}
                      </Badge>
                    </div>
                    
                    <Button 
                      className="w-full"
                      size="sm"
                      onClick={() => launchSimulation(simulation.simulation_url)}
                      disabled={!simulation.simulation_url}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Launch
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>

        {filteredSimulations.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <FlaskConical className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No simulations found matching your criteria.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}