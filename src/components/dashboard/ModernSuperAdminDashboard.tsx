'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import StatisticsCard from './StatisticsCard';
import AssessmentLevelCard from './AssessmentLevelCard';
import SchoolPerformanceCard from './SchoolPerformanceCard';
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
  CheckCircle,
  Sparkles,
  Globe,
  Heart,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../LanguageProvider';

interface DashboardData {
  stats: {
    total_students: string;
    total_teachers: string;
    total_schools: string;
    total_provinces: string;
    total_assessments: string;
    selected_students: string;
  };
  // ... other interfaces remain the same
}

export default function ModernSuperAdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t, getFontClass } = useLanguage();

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
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2 font-hanuman">Loading Cambodia Virtual Lab STEM Dashboard</h3>
          <p className="text-gray-600 font-hanuman">កំពុងផ្ទុកទិន្នន័យ...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <div className="text-red-500 mb-6">
            <BarChart3 className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2 font-hanuman">Unable to Load Dashboard</h3>
          <p className="text-red-600 font-hanuman mb-6">{error}</p>
          <Button onClick={fetchDashboardData} className="font-hanuman">
            <TrendingUp className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Calculate metrics
  const totalStudents = parseInt(data.stats.total_students);
  const selectedStudents = parseInt(data.stats.selected_students);
  const selectionRate = totalStudents > 0 ? (selectedStudents / totalStudents * 100) : 0;

  // Statistics data
  const statistics = [
    {
      title: 'Total Students',
      titleKH: 'សិស្សសរុប',
      value: data.stats.total_students,
      subtitle: 'Enrolled in Cambodia Virtual Lab STEM',
      subtitleKH: 'ចុះឈ្មោះក្នុងកម្មវិធី Cambodia Virtual Lab STEM',
      change: 12.5,
      changeLabel: 'This month',
      trend: 'up' as const,
      icon: Users,
      color: 'blue' as const,
      progress: 85,
      target: '3,000 students'
    },
    {
      title: 'Active Schools',
      titleKH: 'សាលារៀនសកម្ម',
      value: data.stats.total_schools,
      subtitle: 'Participating schools',
      subtitleKH: 'សាលារៀនចូលរួម',
      change: 8.3,
      changeLabel: 'This quarter',
      trend: 'up' as const,
      icon: School,
      color: 'green' as const,
      progress: 67,
      target: '12 schools'
    },
    {
      title: 'Certified Teachers',
      titleKH: 'គ្រូបង្រៀនបានទទួលសញ្ញាបត្រ',
      value: data.stats.total_teachers,
      subtitle: 'STEM methodology trained',
      subtitleKH: 'បានបង្រៀនវិធីសាស្ត្រ STEM',
      change: 15.2,
      changeLabel: 'New certifications',
      trend: 'up' as const,
      icon: BookOpen,
      color: 'purple' as const,
      progress: 92,
      target: '100 teachers'
    },
    {
      title: 'Assessments Completed',
      titleKH: 'ការវាយតម្លៃបានបញ្ចប់',
      value: data.stats.total_assessments,
      subtitle: 'Individual student assessments',
      subtitleKH: 'ការវាយតម្លៃសិស្សបុគ្គល',
      change: 23.7,
      changeLabel: 'This week',
      trend: 'up' as const,
      icon: Target,
      color: 'orange' as const,
      progress: 78,
      target: '1,000 assessments'
    }
  ];

  // Assessment levels data
  const assessmentLevels = [
    {
      name: 'Beginner Level',
      nameKH: 'កម្រិតដំបូង',
      difficulty: 'beginner' as const,
      subject: 'khmer' as const,
      studentCount: 1250,
      totalStudents: parseInt(data.stats.total_students),
      averageScore: 2.1,
      description: 'Basic letter recognition and simple word formation skills.',
      skills: ['Letter Recognition', 'Basic Sounds', 'Simple Words', 'Letter Writing'],
      duration: '4-6 weeks',
      successRate: 87
    },
    {
      name: 'Letter Level',
      nameKH: 'កម្រិតអក្សរ',
      difficulty: 'elementary' as const,
      subject: 'khmer' as const,
      studentCount: 980,
      totalStudents: parseInt(data.stats.total_students),
      averageScore: 3.2,
      description: 'Advanced letter combinations and word building capabilities.',
      skills: ['Letter Combinations', 'Word Building', 'Basic Reading', 'Spelling'],
      duration: '6-8 weeks',
      successRate: 83
    },
    {
      name: 'Number Recognition',
      nameKH: 'កម្រិតស្គាល់លេខ',
      difficulty: 'beginner' as const,
      subject: 'math' as const,
      studentCount: 1180,
      totalStudents: parseInt(data.stats.total_students),
      averageScore: 2.8,
      description: 'Basic number recognition and counting fundamentals.',
      skills: ['Number Recognition', 'Counting', 'Basic Addition', 'Number Writing'],
      duration: '3-5 weeks',
      successRate: 91
    },
    {
      name: 'Basic Operations',
      nameKH: 'ប្រតិបត្តិការមូលដ្ឋាន',
      difficulty: 'intermediate' as const,
      subject: 'math' as const,
      studentCount: 856,
      totalStudents: parseInt(data.stats.total_students),
      averageScore: 3.5,
      description: 'Addition, subtraction and basic problem solving skills.',
      skills: ['Addition', 'Subtraction', 'Problem Solving', 'Mental Math'],
      duration: '8-10 weeks',
      successRate: 79
    }
  ];

  // Mock school data
  const topSchools = [
    {
      id: '1',
      name: 'Battambang Primary School',
      nameKH: 'សាលាបឋមសិក្សាបាត់ដំបង',
      code: 'BB-001',
      province: 'Battambang',
      provinceKH: 'បាត់ដំបង',
      studentCount: 320,
      teacherCount: 12,
      assessmentCount: 640,
      selectedStudents: 64,
      overallPerformance: 87,
      subjects: {
        khmer: { average: 3.8, assessments: 320 },
        math: { average: 3.6, assessments: 320 }
      },
      lastAssessment: '2 days ago',
      status: 'excellent' as const
    },
    {
      id: '2',
      name: 'Kampong Cham Learning Center',
      nameKH: 'មជ្ឈមណ្ឌលសិក្សាកំពង់ចាម',
      code: 'KC-002',
      province: 'Kampong Cham',
      provinceKH: 'កំពង់ចាម',
      studentCount: 285,
      teacherCount: 10,
      assessmentCount: 570,
      selectedStudents: 57,
      overallPerformance: 82,
      subjects: {
        khmer: { average: 3.5, assessments: 285 },
        math: { average: 3.7, assessments: 285 }
      },
      lastAssessment: '1 day ago',
      status: 'good' as const
    },
    {
      id: '3',
      name: 'Rural Education Hub',
      nameKH: 'មជ្ឈមណ្ឌលអប់រំជនបទ',
      code: 'BB-003',
      province: 'Battambang',
      provinceKH: 'បាត់ដំបង',
      studentCount: 198,
      teacherCount: 8,
      assessmentCount: 396,
      selectedStudents: 40,
      overallPerformance: 75,
      subjects: {
        khmer: { average: 3.2, assessments: 198 },
        math: { average: 3.4, assessments: 198 }
      },
      lastAssessment: '3 days ago',
      status: 'good' as const
    }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <div className="flex items-center justify-center mb-4">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-2xl">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className={`text-4xl font-bold text-gray-900 mb-2 ${getFontClass()}`}>
          {t('dashboard.title')}
        </h1>
        <p className={`text-xl text-gray-600 ${getFontClass()} mb-2`}>
          {t('dashboard.subtitle')}
        </p>
      </motion.div>

      {/* Key Statistics */}
      <div>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-2 font-hanuman">Program Overview</h2>
          <p className="text-gray-600 font-hanuman">ទិដ្ឋភាពទូទៅនៃកម្មវិធី</p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statistics.map((stat, index) => (
            <StatisticsCard key={stat.title} stat={stat} index={index} />
          ))}
        </div>
      </div>

      {/* Assessment Levels */}
      <div>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-2 font-hanuman">Assessment Levels</h2>
          <p className="text-gray-600 font-hanuman">កម្រិតការវាយតម្លៃ</p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {assessmentLevels.map((level, index) => (
            <AssessmentLevelCard 
              key={level.name} 
              level={level} 
              index={index}
              onViewDetails={() => console.log('View details for', level.name)}
            />
          ))}
        </div>
      </div>

      {/* Top Performing Schools */}
      <div>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-6"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-2 font-hanuman">Top Performing Schools</h2>
          <p className="text-gray-600 font-hanuman">សាលារៀនដែលមានសមិទ្ធិផលល្អបំផុត</p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topSchools.map((school, index) => (
            <SchoolPerformanceCard 
              key={school.id} 
              school={school} 
              index={index}
              onViewDetails={() => console.log('View details for', school.name)}
            />
          ))}
        </div>
      </div>

      {/* System Features */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="border-0 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-gray-900 font-hanuman">
              System Features
            </CardTitle>
            <CardDescription className="text-gray-600 font-hanuman">
              Built for Cambodia's educational excellence
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-white p-4 rounded-2xl shadow-sm mb-4 inline-block">
                  <Globe className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 font-hanuman">
                  Multi-Province Coverage
                </h3>
                <p className="text-sm text-gray-600 font-hanuman">
                  Comprehensive assessment tracking across Battambang and Kampong Cham provinces.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-white p-4 rounded-2xl shadow-sm mb-4 inline-block">
                  <Heart className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 font-hanuman">
                  Student-Centered Design
                </h3>
                <p className="text-sm text-gray-600 font-hanuman">
                  Personalized learning paths adapted to each student's learning level and pace.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-white p-4 rounded-2xl shadow-sm mb-4 inline-block">
                  <Zap className="h-8 w-8 text-yellow-500" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 font-hanuman">
                  Real-time Analytics
                </h3>
                <p className="text-sm text-gray-600 font-hanuman">
                  Instant insights and progress tracking for teachers and administrators.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}