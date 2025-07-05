'use client';

import { useState, useEffect } from 'react';
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
import { BarChart3, Download, FileText, Filter, Search } from 'lucide-react';

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

interface Session {
  userId: number;
  teacherId: number;
  schoolIds: number[];
  subject: string;
}

export default function ResultsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [filteredAssessments, setFilteredAssessments] = useState<Assessment[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  
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
    fetchSession();
  }, []);

  useEffect(() => {
    if (session) {
      fetchAssessments();
    }
  }, [session]);

  useEffect(() => {
    applyFilters();
  }, [assessments, filterCycle, filterLevel, filterGrade, searchTerm]);

  const fetchSession = async () => {
    try {
      const response = await fetch('/api/auth/session');
      if (response.ok) {
        const data = await response.json();
        setSession(data.user);
      }
    } catch (error) {
      console.error('Error fetching session:', error);
    }
  };

  const fetchAssessments = async () => {
    if (!session?.schoolIds.length) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        schoolId: session.schoolIds[0].toString(),
        subject: session.subject,
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
      link.setAttribute('download', `cambodia_vlab_stem_assessments_${session?.subject}_${new Date().toISOString().split('T')[0]}.csv`);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading assessment results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Assessment Results</h1>
        <p className="font-khmer text-xl text-gray-600">លទ្ធផលការវាយតម្លៃ</p>
        <p className="text-gray-600">
          View and export assessment results for {session?.subject} subject
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Assessments</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.cycles}</p>
                <p className="text-xs text-muted-foreground">Assessment Cycles</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Badge className="text-orange-600" variant="outline">
                {stats.levels}
              </Badge>
              <div>
                <p className="text-2xl font-bold">{stats.levels}</p>
                <p className="text-xs text-muted-foreground">Different Levels</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filters & Export</span>
            </div>
            <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Export Data</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Export Assessment Data</DialogTitle>
                  <DialogDescription>
                    Choose which columns to include in your export
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(exportColumns).map(([key, checked]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={key}
                          checked={checked}
                          onCheckedChange={(value) =>
                            setExportColumns(prev => ({ ...prev, [key]: value as boolean }))
                          }
                        />
                        <Label htmlFor={key} className="text-sm capitalize">
                          {key.replace('_', ' ')}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsExportDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleExport}
                      disabled={isExporting}
                    >
                      {isExporting ? 'Exporting...' : `Export ${filteredAssessments.length} Records`}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Search Student</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Filter by Cycle</Label>
              <Select value={filterCycle} onValueChange={setFilterCycle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cycles</SelectItem>
                  <SelectItem value="Baseline">Baseline</SelectItem>
                  <SelectItem value="Midline">Midline</SelectItem>
                  <SelectItem value="Endline">Endline</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Filter by Level</Label>
              <Select value={filterLevel} onValueChange={setFilterLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {Object.entries(levelLabels).map(([level, labels]) => (
                    <SelectItem key={level} value={level}>
                      {labels.en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Filter by Grade</Label>
              <Select value={filterGrade} onValueChange={setFilterGrade}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  <SelectItem value="3">Grade 3</SelectItem>
                  <SelectItem value="4">Grade 4</SelectItem>
                  <SelectItem value="5">Grade 5</SelectItem>
                  <SelectItem value="6">Grade 6</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment Results</CardTitle>
          <CardDescription>
            Showing {filteredAssessments.length} of {assessments.length} assessments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAssessments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No assessments found with current filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Cycle</TableHead>
                    <TableHead>Level Achieved</TableHead>
                    <TableHead>Assessment Date</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssessments.map((assessment) => (
                    <TableRow key={assessment.id}>
                      <TableCell className="font-medium">
                        {assessment.student_name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          Grade {assessment.student_class}
                        </Badge>
                      </TableCell>
                      <TableCell>{assessment.student_gender}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            assessment.cycle === 'Baseline' ? 'secondary' :
                            assessment.cycle === 'Midline' ? 'default' : 'outline'
                          }
                        >
                          {assessment.cycle}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {assessment.level_achieved}
                          </div>
                          <div className="font-khmer text-xs text-gray-500">
                            {levelLabels[assessment.level_achieved]?.kh}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(assessment.assessment_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {assessment.notes ? (
                          <div className="max-w-32 truncate" title={assessment.notes}>
                            {assessment.notes}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}