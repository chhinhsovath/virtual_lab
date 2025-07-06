'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Search, 
  School, 
  Users, 
  GraduationCap,
  MapPin,
  Phone,
  Mail,
  Edit,
  Trash2,
  ArrowLeft,
  RefreshCw,
  Plus,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';

interface School {
  school_id: string;
  school_code: string;
  school_name: string;
  school_name_en?: string;
  province_id: string;
  province_name?: string;
  district?: string;
  commune?: string;
  village?: string;
  phone?: string;
  email?: string;
  teacher_count?: number;
  student_count?: number;
  active_simulations?: number;
  created_at?: string;
}

export default function SchoolsManagementPage() {
  const router = useRouter();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('all');
  const [provinces, setProvinces] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total_schools: 0,
    total_teachers: 0,
    total_students: 0,
    active_simulations: 0
  });

  useEffect(() => {
    loadSchools();
    loadProvinces();
  }, [searchQuery, selectedProvince]);

  const loadSchools = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/schools');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login');
          return;
        }
        throw new Error('Failed to load schools');
      }

      const data = await response.json();
      
      // Filter schools based on search and province
      let filteredSchools = data.schools || [];
      if (searchQuery) {
        filteredSchools = filteredSchools.filter((school: School) => 
          school.school_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          school.school_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (school.school_name_en && school.school_name_en.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }
      if (selectedProvince !== 'all') {
        filteredSchools = filteredSchools.filter((school: School) => 
          school.province_id === selectedProvince
        );
      }

      setSchools(filteredSchools);
      
      // Calculate stats
      const totalTeachers = filteredSchools.reduce((sum: number, school: School) => 
        sum + (school.teacher_count || 0), 0
      );
      const totalStudents = filteredSchools.reduce((sum: number, school: School) => 
        sum + (school.student_count || 0), 0
      );
      const activeSimulations = filteredSchools.reduce((sum: number, school: School) => 
        sum + (school.active_simulations || 0), 0
      );

      setStats({
        total_schools: filteredSchools.length,
        total_teachers: totalTeachers,
        total_students: totalStudents,
        active_simulations: activeSimulations
      });
    } catch (error) {
      console.error('Error loading schools:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProvinces = async () => {
    try {
      const response = await fetch('/api/provinces');
      if (response.ok) {
        const data = await response.json();
        setProvinces(data.provinces || []);
      }
    } catch (error) {
      console.error('Error loading provinces:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Admin
                </Button>
              </Link>
              <h1 className="text-xl font-semibold">School Management</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={loadSchools}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add School
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Schools</p>
                  <p className="text-2xl font-semibold">{stats.total_schools}</p>
                </div>
                <School className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Teachers</p>
                  <p className="text-2xl font-semibold">{stats.total_teachers}</p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="text-2xl font-semibold">{stats.total_students}</p>
                </div>
                <GraduationCap className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Simulations</p>
                  <p className="text-2xl font-semibold">{stats.active_simulations}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search schools by name or code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="all">All Provinces</option>
                {provinces.map((province) => (
                  <option key={province.id} value={province.id}>
                    {province.name_en} / {province.name_km}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Schools Table */}
        <Card>
          <CardHeader>
            <CardTitle>Schools</CardTitle>
            <CardDescription>
              Manage schools and view statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Loading schools...</p>
              </div>
            ) : schools.length === 0 ? (
              <div className="text-center py-8">
                <School className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No schools found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>School</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Statistics</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schools.map((school) => (
                      <TableRow key={school.school_id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{school.school_name}</p>
                            {school.school_name_en && (
                              <p className="text-sm text-gray-500">{school.school_name_en}</p>
                            )}
                            <p className="text-xs text-gray-400">Code: {school.school_code}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center gap-1 text-gray-600">
                              <MapPin className="h-3 w-3" />
                              {school.province_name || 'Province ' + school.province_id}
                            </div>
                            {school.district && (
                              <p className="text-xs text-gray-500 ml-4">{school.district}</p>
                            )}
                            {school.commune && (
                              <p className="text-xs text-gray-500 ml-4">{school.commune}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm space-y-1">
                            {school.phone && (
                              <div className="flex items-center gap-1 text-gray-600">
                                <Phone className="h-3 w-3" />
                                {school.phone}
                              </div>
                            )}
                            {school.email && (
                              <div className="flex items-center gap-1 text-gray-600">
                                <Mail className="h-3 w-3" />
                                {school.email}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant="outline" className="text-xs">
                              <Users className="h-3 w-3 mr-1" />
                              {school.teacher_count || 0} Teachers
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              <GraduationCap className="h-3 w-3 mr-1" />
                              {school.student_count || 0} Students
                            </Badge>
                            {school.active_simulations && school.active_simulations > 0 && (
                              <Badge variant="outline" className="text-xs text-green-600">
                                <BarChart3 className="h-3 w-3 mr-1" />
                                {school.active_simulations} Active
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/admin/schools/${school.school_id}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}