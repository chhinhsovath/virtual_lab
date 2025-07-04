'use client';

import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { 
  Users, 
  Clock, 
  Star, 
  BookOpen, 
  Target,
  TrendingUp,
  Eye
} from 'lucide-react';
import { motion } from 'framer-motion';

interface AssessmentLevelCardProps {
  level: {
    name: string;
    nameKH: string;
    difficulty: 'beginner' | 'elementary' | 'intermediate' | 'advanced' | 'mastery';
    subject: 'khmer' | 'math';
    studentCount: number;
    totalStudents: number;
    averageScore: number;
    description: string;
    skills: string[];
    duration: string;
    successRate: number;
  };
  index: number;
  onViewDetails: () => void;
}

const difficultyConfig = {
  beginner: {
    color: 'bg-red-500',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  elementary: {
    color: 'bg-orange-500',
    textColor: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  },
  intermediate: {
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200'
  },
  advanced: {
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  mastery: {
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  }
};

const subjectConfig = {
  khmer: {
    icon: BookOpen,
    category: 'Language Arts',
    categoryKH: 'វិន្នាសារភាសា'
  },
  math: {
    icon: Target,
    category: 'Mathematics',
    categoryKH: 'គណិតវិទ្យា'
  }
};

export default function AssessmentLevelCard({ level, index, onViewDetails }: AssessmentLevelCardProps) {
  const config = difficultyConfig[level.difficulty];
  const subjectInfo = subjectConfig[level.subject];
  const SubjectIcon = subjectInfo.icon;
  
  const percentage = level.totalStudents > 0 ? (level.studentCount / level.totalStudents * 100) : 0;

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
                {level.difficulty}
              </Badge>
              <div className={`p-2 rounded-lg ${config.bgColor}`}>
                <SubjectIcon className={`h-5 w-5 ${config.textColor}`} />
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 font-hanuman">{subjectInfo.category}</p>
              <p className="text-xs text-gray-400 font-hanuman">{subjectInfo.categoryKH}</p>
            </div>
          </div>

          {/* Title */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 mb-1 font-hanuman">
              {level.name}
            </h3>
            <p className="text-lg text-gray-600 font-hanuman mb-2">
              {level.nameKH}
            </p>
            <p className="text-sm text-gray-600 leading-relaxed font-hanuman">
              {level.description}
            </p>
          </div>

          {/* Skills */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 font-hanuman">
              Key Skills
            </p>
            <div className="flex flex-wrap gap-1">
              {level.skills.slice(0, 3).map((skill, idx) => (
                <Badge 
                  key={idx} 
                  variant="secondary" 
                  className="text-xs bg-gray-100 text-gray-700 border-0 font-hanuman"
                >
                  {skill}
                </Badge>
              ))}
              {level.skills.length > 3 && (
                <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700 border-0 font-hanuman">
                  +{level.skills.length - 3} more
                </Badge>
              )}
            </div>
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 font-hanuman">Student Progress</span>
              <span className="text-sm font-bold text-gray-900 font-hanuman">{percentage.toFixed(1)}%</span>
            </div>
            <Progress value={percentage} className="h-2" />
            <p className="text-xs text-gray-500 mt-1 font-hanuman">
              {level.studentCount.toLocaleString()} of {level.totalStudents.toLocaleString()} students
            </p>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Clock className="h-4 w-4 text-gray-400 mr-1" />
                <span className="text-sm font-semibold text-gray-900 font-hanuman">{level.duration}</span>
              </div>
              <p className="text-xs text-gray-500 font-hanuman">Duration</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Users className="h-4 w-4 text-gray-400 mr-1" />
                <span className="text-sm font-semibold text-gray-900 font-hanuman">
                  {level.studentCount.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-gray-500 font-hanuman">Students</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="text-sm font-semibold text-gray-900 font-hanuman">{level.successRate}%</span>
              </div>
              <p className="text-xs text-gray-500 font-hanuman">Success Rate</p>
            </div>
          </div>

          {/* Action Button */}
          <Button 
            onClick={onViewDetails}
            variant="outline" 
            className="w-full h-12 font-medium hover:bg-gray-50 border border-gray-200 font-hanuman"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}