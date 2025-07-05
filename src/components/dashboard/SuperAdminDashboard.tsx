'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import {
  Users,
  GraduationCap,
  School,
  BookOpen,
  TrendingUp,
  Award,
  Target,
  BarChart3,
  MapPin,
  Clock,
  User,
  CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

interface DashboardData {
  stats: {
    total_students: string;
    total_teachers: string;
    total_schools: string;
    total_provinces: string;
    total_assessments: string;
    selected_students: string;
  };
  assessmentCycles: Array<{
    assessment_cycle: string;
    count: string;
    unique_students: string;
  }>;
  levelDistribution: Array<{
    subject: string;
    level_achieved: string;
    count: string;
  }>;
  provinces: Array<{
    province_name: string;
    province_name_kh: string;
    schools: string;
    teachers: string;
    students: string;
    assessments: string;
  }>;
  schools: Array<{
    school_name: string;
    school_name_kh: string;
    school_code: string;
    province: string;
    teachers: string;
    students: string;
    assessments: string;
    selected_students: string;
  }>;
  subjectPerformance: Array<{
    subject: string;
    assessment_cycle: string;
    avg_level: string;
    total_assessments: string;
  }>;
  recentActivity: Array<{
    assessment_date: string;
    subject: string;
    assessment_cycle: string;
    level_achieved: string;
    student_name: string;
    school_name: string;
    teacher_name: string;
  }>;
  teacherPerformance: Array<{
    teacher_name: string;
    subject: string;
    school_name: string;
    assessments_conducted: string;
    students_assessed: string;
  }>;
  gradeDistribution: Array<{
    grade: string;
    student_count: string;
    assessments: string;
  }>;
}

export default function SuperAdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Fetching dashboard data...');
      
      const response = await fetch('/api/admin/dashboard');
      const result = await response.json();
      
      console.log('Dashboard API response:', response.status, result);
      
      if (!response.ok) {
        throw new Error(result.error || `API Error: ${response.status}`);
      }
      
      if (!result.success) {
        throw new Error(result.error || 'API returned unsuccessful response');
      }
      
      setData(result.data);
      console.log('Dashboard data loaded successfully');
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-hanuman">Loading comprehensive dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <BarChart3 className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-red-600 font-hanuman mb-4">{error}</p>
          <Button onClick={fetchDashboardData} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Calculate percentages and derived metrics
  const totalStudents = parseInt(data.stats.total_students);
  const totalAssessments = parseInt(data.stats.total_assessments);
  const selectedStudents = parseInt(data.stats.selected_students);
  const selectionRate = totalStudents > 0 ? (selectedStudents / totalStudents * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-hanuman">
            Super Admin Dashboard
          </h1>
          <p className="text-gray-600 font-hanuman">
            Comprehensive overview of Cambodia Virtual Lab STEM program
          </p>
          <p className="text-sm text-gray-500 font-hanuman">
            បង្ហាញទិន្នន័យសម្រាប់ Cambodia Virtual Lab STEM
          </p>
        </div>
        <Button onClick={fetchDashboardData} variant="outline">
          <TrendingUp className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Total Students',
            value: data.stats.total_students,
            subtitle: 'Enrolled in program',
            icon: Users,
            color: 'blue'
          },
          {
            title: 'Schools',
            value: data.stats.total_schools,
            subtitle: `Across ${data.stats.total_provinces} provinces`,
            icon: School,
            color: 'green'
          },
          {
            title: 'Teachers',
            value: data.stats.total_teachers,
            subtitle: 'Conducting assessments',
            icon: BookOpen,
            color: 'purple'
          },
          {
            title: 'Assessments',
            value: data.stats.total_assessments,
            subtitle: 'Total completed',
            icon: Target,
            color: 'orange'
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${
                    stat.color === 'blue' ? 'bg-blue-50' :
                    stat.color === 'green' ? 'bg-green-50' :
                    stat.color === 'purple' ? 'bg-purple-50' :
                    'bg-orange-50'
                  }`}>
                    <stat.icon className={`h-6 w-6 ${
                      stat.color === 'blue' ? 'text-blue-600' :
                      stat.color === 'green' ? 'text-green-600' :
                      stat.color === 'purple' ? 'text-purple-600' :
                      'text-orange-600'
                    }`} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 font-hanuman">{stat.value}</h3>
                <p className="text-sm text-gray-600 mt-1 font-hanuman">{stat.title}</p>
                <p className="text-xs text-gray-500 mt-1 font-hanuman">{stat.subtitle}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Assessment Progress & Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assessment Cycles */}
        <Card>
          <CardHeader>
            <CardTitle className="font-hanuman">Assessment Cycles Progress</CardTitle>
            <CardDescription className="font-hanuman">
              Completion status across baseline, midline, and endline assessments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.assessmentCycles.map((cycle) => {
                const percentage = totalStudents > 0 
                  ? (parseInt(cycle.unique_students) / totalStudents * 100).toFixed(1)
                  : '0';
                
                return (
                  <div key={cycle.assessment_cycle}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="capitalize font-hanuman">
                          {cycle.assessment_cycle}
                        </Badge>
                        <span className="text-sm text-gray-600 font-hanuman">
                          {cycle.unique_students} students
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 font-hanuman">
                        {percentage}%
                      </span>
                    </div>
                    <Progress value={parseFloat(percentage)} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1 font-hanuman">
                      {cycle.count} total assessments completed
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Student Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="font-hanuman">Student Selection Overview</CardTitle>
            <CardDescription className="font-hanuman">
              Students selected for Cambodia Virtual Lab STEM program
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-blue-600 font-hanuman">
                {selectedStudents}
              </div>
              <p className="text-gray-600 font-hanuman">Selected for Program</p>
              <p className="text-sm text-gray-500 font-hanuman">
                {selectionRate}% of total students
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 font-hanuman">Selection Rate</span>
                <span className="font-medium font-hanuman">{selectionRate}%</span>
              </div>
              <Progress value={parseFloat(selectionRate)} className="h-2" />
              <div className="flex justify-between text-xs text-gray-500 font-hanuman">
                <span>0 students</span>
                <span>{totalStudents} students</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Province Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center font-hanuman">
            <MapPin className="h-5 w-5 mr-2" />
            Province Performance Overview
          </CardTitle>
          <CardDescription className="font-hanuman">
            Comprehensive statistics by province
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.provinces.map((province) => (
              <div key={province.province_name} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 font-hanuman">
                      {province.province_name}
                    </h3>
                    <p className="text-sm text-gray-600 font-hanuman">
                      {province.province_name_kh}
                    </p>
                  </div>
                  <Badge variant="secondary" className="font-hanuman">
                    {province.assessments} assessments
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-blue-600 font-hanuman">
                      {province.schools}
                    </div>
                    <p className="text-xs text-gray-600 font-hanuman">Schools</p>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600 font-hanuman">
                      {province.teachers}
                    </div>
                    <p className="text-xs text-gray-600 font-hanuman">Teachers</p>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-purple-600 font-hanuman">
                      {province.students}
                    </div>
                    <p className="text-xs text-gray-600 font-hanuman">Students</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Learning Level Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="font-hanuman">Student Learning Level Distribution</CardTitle>
          <CardDescription className="font-hanuman">
            Baseline assessment results showing initial learning levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {['khmer', 'math'].map((subject) => {
              const subjectData = data.levelDistribution.filter(item => item.subject === subject);
              const totalSubject = subjectData.reduce((sum, item) => sum + parseInt(item.count), 0);
              
              return (
                <div key={subject}>
                  <h4 className="font-semibold mb-4 capitalize font-hanuman">
                    {subject === 'khmer' ? 'Khmer Reading' : 'Mathematics'}
                  </h4>
                  <div className="space-y-3">
                    {subjectData.map((level) => {
                      const percentage = totalSubject > 0 
                        ? (parseInt(level.count) / totalSubject * 100).toFixed(1)
                        : '0';
                      
                      return (
                        <div key={level.level_achieved}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm capitalize font-hanuman">
                              {level.level_achieved}
                            </span>
                            <span className="text-sm font-medium font-hanuman">
                              {level.count} ({percentage}%)
                            </span>
                          </div>
                          <Progress value={parseFloat(percentage)} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center font-hanuman">
            <Clock className="h-5 w-5 mr-2" />
            Recent Assessment Activity
          </CardTitle>
          <CardDescription className="font-hanuman">
            Latest assessment submissions across all schools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.recentActivity.slice(0, 10).map((activity, index) => (
              <div key={index} className="flex items-start space-x-4 p-3 rounded-lg bg-gray-50">
                <div className={`p-2 rounded-full ${
                  activity.subject === 'khmer' ? 'bg-blue-100' : 'bg-green-100'
                }`}>
                  {activity.subject === 'khmer' ? 
                    <BookOpen className="h-4 w-4 text-blue-600" /> : 
                    <Target className="h-4 w-4 text-green-600" />
                  }
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge variant="outline" className="text-xs font-hanuman">
                      {activity.assessment_cycle}
                    </Badge>
                    <Badge variant="secondary" className="text-xs capitalize font-hanuman">
                      {activity.level_achieved}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-gray-900 font-hanuman">
                    {activity.student_name}
                  </p>
                  <p className="text-xs text-gray-600 font-hanuman">
                    {activity.school_name} • {activity.teacher_name}
                  </p>
                  <p className="text-xs text-gray-500 font-hanuman">
                    {new Date(activity.assessment_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}