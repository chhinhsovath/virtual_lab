'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog';
import { Checkbox } from '../../../components/ui/checkbox';
import { toast } from 'sonner';
import ModernSidebar from '../../../components/dashboard/ModernSidebar';
import { LoadingSpinner } from '../../../components/ui/loading-spinner';
import { 
  BarChart3, 
  Download, 
  FileText, 
  Filter, 
  Search, 
  Bell, 
  Menu,
  TrendingUp,
  Award,
  Calendar,
  Users,
  BookOpen,
  Target,
  Sparkles,
  GraduationCap,
  ChevronRight
} from 'lucide-react';
import { StatCard, PageHeader, EmptyState, FeatureCard } from '../../../components/dashboard/ui-components';
import * as design from '../../../components/dashboard/design-system';
import { cn } from '../../../lib/utils';

interface Assessment {
  id: string;
  student_name: string;
  student_gender: string;
  student_class: number;
  subject: string;
  cycle: string;
  level_achieved: string;
  assessment_date: string;
  notes?: string;
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
  userId?: number;
  subject?: string;
  schoolIds?: number[];
}

export default function ResultsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [filteredAssessments, setFilteredAssessments] = useState<Assessment[]>([]);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const router = useRouter();
  
  // Filters
  const [filterCycle, setFilterCycle] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Export options
  const [exportColumns, setExportColumns] = useState({
    student_name: true,
    student_gender: true,
    student_class: true,
    cycle: true,
    level_achieved: true,
    assessment_date: true,
    notes: false,
  });

  const levelLabels: Record<string, { en: string; kh: string }> = {
    'Beginner': { en: 'Beginner', kh: 'ចាប់ផ្តើម' },
    'Letter': { en: 'Letter', kh: 'អក្សរ' },
    'Word': { en: 'Word', kh: 'ពាក្យ' },
    'Paragraph': { en: 'Paragraph', kh: 'កថាខណ្ឌ' },
    'Story': { en: 'Story', kh: 'រឿង' },
    '1-Digit': { en: '1-Digit', kh: 'ខ្ទង់តួ ១' },
    '2-Digit': { en: '2-Digit', kh: 'ខ្ទង់តួ ២' },
    'Subtraction': { en: 'Subtraction', kh: 'ការដក' },
    'Advanced': { en: 'Advanced', kh: 'កម្រិតខ្ពស់' },
  };

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
      fetchAssessments();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [assessments, filterCycle, filterLevel, filterGrade, searchTerm]);

  const fetchAssessments = async () => {
    if (!user?.schoolAccess?.length && !user?.schoolIds?.length) return;

    setIsLoading(true);
    try {
      const schoolId = user.schoolAccess?.[0]?.schoolId || user.schoolIds?.[0];
      if (!schoolId) {
        toast.error('No school access found');
        return;
      }

      const params = new URLSearchParams({
        schoolId: schoolId.toString(),
        subject: user.subject || '',
      });

      const response = await fetch(`/api/assessments?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        setAssessments(data.assessments);
      } else {
        toast.error('Failed to load assessments');
      }
    } catch (error) {
      console.error('Error fetching assessments:', error);
      toast.error('Error loading assessments');
    } finally {
      setIsLoading(false);
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

  const applyFilters = () => {
    let filtered = assessments;

    // Filter by cycle
    if (filterCycle !== 'all') {
      filtered = filtered.filter(a => a.cycle === filterCycle);
    }

    // Filter by level
    if (filterLevel !== 'all') {
      filtered = filtered.filter(a => a.level_achieved === filterLevel);
    }

    // Filter by grade
    if (filterGrade !== 'all') {
      filtered = filtered.filter(a => a.student_class.toString() === filterGrade);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(a => 
        a.student_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAssessments(filtered);
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const dataToExport = filteredAssessments.map(assessment => {
        const row: Record<string, string | number> = {};
        
        if (exportColumns.student_name) row['Student Name'] = assessment.student_name;
        if (exportColumns.student_gender) row['Gender'] = assessment.student_gender;
        if (exportColumns.student_class) row['Grade'] = assessment.student_class;
        if (exportColumns.cycle) row['Cycle'] = assessment.cycle;
        if (exportColumns.level_achieved) row['Level Achieved'] = assessment.level_achieved;
        if (exportColumns.assessment_date) row['Assessment Date'] = assessment.assessment_date;
        if (exportColumns.notes) row['Notes'] = assessment.notes || '';
        
        return row;
      });

      // Convert to CSV
      const headers = Object.keys(dataToExport[0] || {});
      const csv = [
        headers.join(','),
        ...dataToExport.map(row => 
          headers.map(header => `"${(row[header] || '').toString().replace(/"/g, '""')}"`).join(',')
        )
      ].join('\n');

      // Download file
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `cambodia_vlab_stem_assessments_${user?.subject}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Assessment data exported successfully!');
      setIsExportDialogOpen(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const getStats = () => {
    const total = filteredAssessments.length;
    const cycles = [...new Set(filteredAssessments.map(a => a.cycle))];
    const levels = [...new Set(filteredAssessments.map(a => a.level_achieved))];
    
    return { total, cycles: cycles.length, levels: levels.length };
  };

  const stats = getStats();

  if (sessionLoading || isLoading) {
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
              title="Assessment Results"
              titleKm="លទ្ធផលការវាយតម្លៃ"
              description={`Track and analyze student progress in ${user?.subject} subject`}
              actions={
                <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className={cn(design.buttonVariants.primary, "shadow-lg")}>
                      <Download className="h-4 w-4 mr-2" />
                      Export Data
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <div className="flex items-center space-x-3 mb-4">
                        <div className={cn("p-3 rounded-xl", design.gradients.primary)}>
                          <Download className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <DialogTitle>Export Assessment Data</DialogTitle>
                          <DialogDescription>
                            Choose which columns to include in your export
                          </DialogDescription>
                        </div>
                      </div>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-700 font-medium">
                          You're about to export {filteredAssessments.length} assessment records
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(exportColumns).map(([key, checked]) => (
                          <div key={key} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                            <Checkbox
                              id={key}
                              checked={checked}
                              onCheckedChange={(value) =>
                                setExportColumns(prev => ({ ...prev, [key]: value as boolean }))
                              }
                              className="data-[state=checked]:bg-blue-500"
                            />
                            <Label htmlFor={key} className="text-sm capitalize cursor-pointer flex-1">
                              {key.replace('_', ' ')}
                            </Label>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-end space-x-3 pt-4 border-t">
                        <Button
                          variant="outline"
                          onClick={() => setIsExportDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleExport}
                          disabled={isExporting}
                          className={design.buttonVariants.success}
                        >
                          {isExporting ? (
                            <>
                              <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                              Exporting...
                            </>
                          ) : (
                            <>
                              <Download className="mr-2 h-4 w-4" />
                              Export {filteredAssessments.length} Records
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              }
            />

            {/* Stats Cards */}
            <div className={design.grids.stats}>
              <StatCard
                title="Total Assessments"
                value={stats.total}
                description="Complete records"
                icon={FileText}
                color="primary"
                gradient={true}
                trend="up"
                trendValue="12%"
              />
              <StatCard
                title="Assessment Cycles"
                value={stats.cycles}
                description="Active cycles"
                icon={BarChart3}
                color="success"
                gradient={true}
              />
              <StatCard
                title="Achievement Levels"
                value={stats.levels}
                description="Different levels tracked"
                icon={Award}
                color="warning"
                gradient={true}
              />
              <StatCard
                title="Students Assessed"
                value={[...new Set(filteredAssessments.map(a => a.student_name))].length}
                description="Unique students"
                icon={Users}
                color="secondary"
                gradient={true}
              />
            </div>

            {/* Filters Section */}
            <Card className={cn(design.cardVariants.colorful, "overflow-hidden")}>
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 pb-6">
                <CardTitle className="flex items-center space-x-3">
                  <div className={cn("p-2 rounded-xl", design.gradients.secondary)}>
                    <Filter className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl">Smart Filters</span>
                </CardTitle>
                <CardDescription>
                  Refine your results to find exactly what you need
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Search Input */}
                  <div className="space-y-2">
                    <Label className="flex items-center space-x-2 text-sm font-medium">
                      <Search className="h-4 w-4 text-purple-500" />
                      <span>Search Student</span>
                    </Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Type student name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-2 focus:border-purple-300 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Cycle Filter */}
                  <div className="space-y-2">
                    <Label className="flex items-center space-x-2 text-sm font-medium">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <span>Assessment Cycle</span>
                    </Label>
                    <Select value={filterCycle} onValueChange={setFilterCycle}>
                      <SelectTrigger className="border-2 focus:border-blue-300 transition-colors">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                            <span>All Cycles</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Baseline">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <span>Baseline</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Midline">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                            <span>Midline</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Endline">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span>Endline</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Level Filter */}
                  <div className="space-y-2">
                    <Label className="flex items-center space-x-2 text-sm font-medium">
                      <Target className="h-4 w-4 text-green-500" />
                      <span>Achievement Level</span>
                    </Label>
                    <Select value={filterLevel} onValueChange={setFilterLevel}>
                      <SelectTrigger className="border-2 focus:border-green-300 transition-colors">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        {Object.entries(levelLabels).map(([level, labels]) => (
                          <SelectItem key={level} value={level}>
                            <div className="flex items-center justify-between w-full">
                              <span>{labels.en}</span>
                              <span className="text-xs text-gray-500 font-khmer ml-2">{labels.kh}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Grade Filter */}
                  <div className="space-y-2">
                    <Label className="flex items-center space-x-2 text-sm font-medium">
                      <GraduationCap className="h-4 w-4 text-orange-500" />
                      <span>Grade Level</span>
                    </Label>
                    <Select value={filterGrade} onValueChange={setFilterGrade}>
                      <SelectTrigger className="border-2 focus:border-orange-300 transition-colors">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Grades</SelectItem>
                        {[3, 4, 5, 6].map((grade) => (
                          <SelectItem key={grade} value={grade.toString()}>
                            <div className="flex items-center space-x-2">
                              <BookOpen className="h-4 w-4 text-orange-400" />
                              <span>Grade {grade}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Active Filters Display */}
                {(filterCycle !== 'all' || filterLevel !== 'all' || filterGrade !== 'all' || searchTerm) && (
                  <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium text-purple-700">Active Filters:</span>
                        <div className="flex flex-wrap gap-2">
                          {filterCycle !== 'all' && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                              Cycle: {filterCycle}
                            </Badge>
                          )}
                          {filterLevel !== 'all' && (
                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                              Level: {filterLevel}
                            </Badge>
                          )}
                          {filterGrade !== 'all' && (
                            <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                              Grade: {filterGrade}
                            </Badge>
                          )}
                          {searchTerm && (
                            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                              Search: {searchTerm}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFilterCycle('all');
                          setFilterLevel('all');
                          setFilterGrade('all');
                          setSearchTerm('');
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

            {/* Results Table */}
            <Card className={design.cardVariants.colorful}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl flex items-center space-x-2">
                      <Award className="h-5 w-5 text-yellow-500" />
                      <span>Assessment Results</span>
                    </CardTitle>
                    <CardDescription>
                      Showing {filteredAssessments.length} of {assessments.length} assessments
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="hidden sm:flex">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {filteredAssessments.length} Records
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {filteredAssessments.length === 0 ? (
                  <EmptyState
                    icon={FileText}
                    title="No assessments found"
                    description="Try adjusting your filters or search criteria to find assessment records"
                    action={{
                      label: "Clear Filters",
                      onClick: () => {
                        setFilterCycle('all');
                        setFilterLevel('all');
                        setFilterGrade('all');
                        setSearchTerm('');
                      }
                    }}
                  />
                ) : (
                  <>
                    {/* Mobile Card View */}
                    <div className="block lg:hidden space-y-4">
                      {filteredAssessments.map((assessment) => (
                        <Card key={assessment.id} className={cn(design.cardVariants.gradient, "p-4")}>
                          <div className="space-y-3">
                            {/* Student Name and Grade */}
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold text-gray-900">{assessment.student_name}</h4>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    <GraduationCap className="h-3 w-3 mr-1" />
                                    Grade {assessment.student_class}
                                  </Badge>
                                  <span className="text-xs text-gray-500">{assessment.student_gender}</span>
                                </div>
                              </div>
                              <Badge
                                className={cn(
                                  "text-xs",
                                  assessment.cycle === 'Baseline' ? 'bg-blue-100 text-blue-700' :
                                  assessment.cycle === 'Midline' ? 'bg-yellow-100 text-yellow-700' : 
                                  'bg-green-100 text-green-700'
                                )}
                              >
                                {assessment.cycle}
                              </Badge>
                            </div>

                            {/* Level Achievement */}
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="text-xs text-gray-500">Achievement Level</p>
                                <p className="font-medium text-gray-900">{assessment.level_achieved}</p>
                                <p className="font-khmer text-xs text-gray-600">
                                  {levelLabels[assessment.level_achieved]?.kh}
                                </p>
                              </div>
                              <Target className="h-5 w-5 text-green-500" />
                            </div>

                            {/* Date and Notes */}
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center space-x-1 text-gray-500">
                                <Calendar className="h-3 w-3" />
                                <span>{new Date(assessment.assessment_date).toLocaleDateString()}</span>
                              </div>
                              {assessment.notes && (
                                <div className="flex items-center space-x-1 text-gray-500">
                                  <FileText className="h-3 w-3" />
                                  <span className="truncate max-w-[100px]" title={assessment.notes}>
                                    {assessment.notes}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden lg:block overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead className="font-semibold">Student Name</TableHead>
                            <TableHead className="font-semibold">Grade</TableHead>
                            <TableHead className="font-semibold">Gender</TableHead>
                            <TableHead className="font-semibold">Cycle</TableHead>
                            <TableHead className="font-semibold">Level Achieved</TableHead>
                            <TableHead className="font-semibold">Assessment Date</TableHead>
                            <TableHead className="font-semibold">Notes</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredAssessments.map((assessment) => (
                            <TableRow key={assessment.id} className="hover:bg-purple-50 transition-colors">
                              <TableCell className="font-medium">
                                <div className="flex items-center space-x-2">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                                    {assessment.student_name.charAt(0)}
                                  </div>
                                  <span>{assessment.student_name}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-orange-50 border-orange-200 text-orange-700">
                                  <GraduationCap className="h-3 w-3 mr-1" />
                                  Grade {assessment.student_class}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-1">
                                  <Users className="h-3 w-3 text-gray-400" />
                                  <span>{assessment.student_gender}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={cn(
                                    "font-medium",
                                    assessment.cycle === 'Baseline' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                    assessment.cycle === 'Midline' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 
                                    'bg-green-100 text-green-700 border-green-200'
                                  )}
                                >
                                  <div className={cn(
                                    "w-2 h-2 rounded-full mr-1",
                                    assessment.cycle === 'Baseline' ? 'bg-blue-500' :
                                    assessment.cycle === 'Midline' ? 'bg-yellow-500' : 
                                    'bg-green-500'
                                  )}></div>
                                  {assessment.cycle}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-2">
                                    <Target className="h-4 w-4 text-green-500" />
                                    <span className="font-medium">{assessment.level_achieved}</span>
                                  </div>
                                  <div className="font-khmer text-xs text-gray-500">
                                    {levelLabels[assessment.level_achieved]?.kh}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-1 text-gray-600">
                                  <Calendar className="h-3 w-3" />
                                  <span>{new Date(assessment.assessment_date).toLocaleDateString()}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {assessment.notes ? (
                                  <div className="flex items-center space-x-1">
                                    <FileText className="h-3 w-3 text-gray-400" />
                                    <span className="max-w-32 truncate text-gray-600" title={assessment.notes}>
                                      {assessment.notes}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}