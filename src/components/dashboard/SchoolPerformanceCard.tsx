'use client';

import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { 
  School, 
  Users, 
  BookOpen, 
  TrendingUp, 
  MapPin,
  Target,
  Award,
  Eye,
  BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SchoolPerformanceCardProps {
  school: {
    id: string;
    name: string;
    nameKH: string;
    code: string;
    province: string;
    provinceKH: string;
    studentCount: number;
    teacherCount: number;
    assessmentCount: number;
    selectedStudents: number;
    overallPerformance: number;
    subjects: {
      khmer: { average: number; assessments: number };
      math: { average: number; assessments: number };
    };
    lastAssessment: string;
    status: 'excellent' | 'good' | 'average' | 'needs-improvement';
  };
  index: number;
  onViewDetails: () => void;
}

const statusConfig = {
  excellent: {
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    label: 'Excellent'
  },
  good: {
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    label: 'Good'
  },
  average: {
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    label: 'Average'
  },
  'needs-improvement': {
    color: 'bg-red-500',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    label: 'Needs Improvement'
  }
};

export default function SchoolPerformanceCard({ school, index, onViewDetails }: SchoolPerformanceCardProps) {
  const config = statusConfig[school.status];
  const selectionRate = school.studentCount > 0 ? (school.selectedStudents / school.studentCount * 100) : 0;
  const assessmentRate = school.studentCount > 0 ? (school.assessmentCount / (school.studentCount * 2) * 100) : 0; // Assuming 2 subjects

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group"
    >
      <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 bg-white group-hover:scale-[1.02]">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Badge 
                className={`${config.color} text-white font-medium px-3 py-1 text-xs uppercase tracking-wide`}
              >
                {config.label}
              </Badge>
              <div className={`p-2 rounded-lg ${config.bgColor}`}>
                <School className={`h-5 w-5 ${config.textColor}`} />
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center text-xs text-gray-500 font-hanuman">
                <MapPin className="h-3 w-3 mr-1" />
                {school.province}
              </div>
              <p className="text-xs text-gray-400 font-hanuman">{school.provinceKH}</p>
            </div>
          </div>

          {/* School Info */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 mb-1 font-hanuman">
              {school.name}
            </h3>
            <p className="text-lg text-gray-600 font-hanuman mb-2">
              {school.nameKH}
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="font-hanuman">Code: {school.code}</span>
              <span className="font-hanuman">Last Assessment: {school.lastAssessment}</span>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-lg font-bold text-gray-900 font-hanuman">
                  {school.studentCount}
                </span>
              </div>
              <p className="text-xs text-gray-600 font-hanuman">Total Students</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <BookOpen className="h-4 w-4 text-green-600" />
                <span className="text-lg font-bold text-gray-900 font-hanuman">
                  {school.teacherCount}
                </span>
              </div>
              <p className="text-xs text-gray-600 font-hanuman">Teachers</p>
            </div>
          </div>

          {/* Subject Performance */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 font-hanuman">
              Subject Performance
            </p>
            <div className="space-y-3">
              {/* Khmer */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700 font-hanuman">Khmer</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900 font-hanuman">
                    {school.subjects.khmer.average.toFixed(1)}
                  </span>
                </div>
                <Progress value={school.subjects.khmer.average * 20} className="h-2" />
                <p className="text-xs text-gray-500 mt-1 font-hanuman">
                  {school.subjects.khmer.assessments} assessments
                </p>
              </div>

              {/* Math */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-700 font-hanuman">Math</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900 font-hanuman">
                    {school.subjects.math.average.toFixed(1)}
                  </span>
                </div>
                <Progress value={school.subjects.math.average * 20} className="h-2" />
                <p className="text-xs text-gray-500 mt-1 font-hanuman">
                  {school.subjects.math.assessments} assessments
                </p>
              </div>
            </div>
          </div>

          {/* Performance Indicators */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <TrendingUp className="h-4 w-4 text-gray-400 mr-1" />
                <span className="text-sm font-semibold text-gray-900 font-hanuman">
                  {school.overallPerformance}%
                </span>
              </div>
              <p className="text-xs text-gray-500 font-hanuman">Overall</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Award className="h-4 w-4 text-gray-400 mr-1" />
                <span className="text-sm font-semibold text-gray-900 font-hanuman">
                  {selectionRate.toFixed(0)}%
                </span>
              </div>
              <p className="text-xs text-gray-500 font-hanuman">Selected</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <BarChart3 className="h-4 w-4 text-gray-400 mr-1" />
                <span className="text-sm font-semibold text-gray-900 font-hanuman">
                  {assessmentRate.toFixed(0)}%
                </span>
              </div>
              <p className="text-xs text-gray-500 font-hanuman">Assessed</p>
            </div>
          </div>

          {/* Action Button */}
          <Button 
            onClick={onViewDetails}
            variant="outline" 
            className="w-full h-12 font-medium hover:bg-gray-50 border border-gray-200 font-hanuman"
          >
            <Eye className="h-4 w-4 mr-2" />
            View School Details
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}