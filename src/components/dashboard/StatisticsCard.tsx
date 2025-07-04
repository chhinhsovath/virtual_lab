'use client';

import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  TrendingUp, 
  TrendingDown,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { motion } from 'framer-motion';

interface StatisticsCardProps {
  stat: {
    title: string;
    titleKH: string;
    value: string;
    subtitle: string;
    subtitleKH: string;
    change: number;
    changeLabel: string;
    trend: 'up' | 'down' | 'neutral';
    icon: React.ComponentType<any>;
    color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
    progress?: number;
    target?: string;
  };
  index: number;
}

const colorConfig = {
  blue: {
    bg: 'bg-blue-50',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    progressColor: 'bg-blue-500'
  },
  green: {
    bg: 'bg-green-50',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    progressColor: 'bg-green-500'
  },
  purple: {
    bg: 'bg-purple-50',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    progressColor: 'bg-purple-500'
  },
  orange: {
    bg: 'bg-orange-50',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    progressColor: 'bg-orange-500'
  },
  red: {
    bg: 'bg-red-50',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    progressColor: 'bg-red-500'
  }
};

const trendConfig = {
  up: {
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    icon: ArrowUp
  },
  down: {
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    icon: ArrowDown
  },
  neutral: {
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    icon: Minus
  }
};

export default function StatisticsCard({ stat, index }: StatisticsCardProps) {
  const config = colorConfig[stat.color];
  const trendStyle = trendConfig[stat.trend];
  const TrendIcon = trendStyle.icon;
  const StatIcon = stat.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group"
    >
      <Card className="h-full hover:shadow-lg transition-all duration-300 border-0 bg-white group-hover:scale-[1.02]">
        <CardContent className="p-6">
          {/* Header with Icon and Trend */}
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-xl ${config.iconBg} group-hover:scale-110 transition-transform duration-300`}>
              <StatIcon className={`h-7 w-7 ${config.iconColor}`} />
            </div>
            
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${trendStyle.bgColor}`}>
              <TrendIcon className={`h-3 w-3 ${trendStyle.color}`} />
              <span className={`text-xs font-semibold ${trendStyle.color} font-hanuman`}>
                {stat.change > 0 ? '+' : ''}{stat.change}%
              </span>
            </div>
          </div>

          {/* Main Value */}
          <div className="mb-2">
            <h3 className="text-3xl font-bold text-gray-900 mb-1 font-hanuman">
              {stat.value}
            </h3>
            <p className="text-sm font-semibold text-gray-700 font-hanuman">
              {stat.title}
            </p>
            <p className="text-sm text-gray-500 font-hanuman">
              {stat.titleKH}
            </p>
          </div>

          {/* Subtitle */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 font-hanuman">
              {stat.subtitle}
            </p>
            <p className="text-xs text-gray-500 font-hanuman">
              {stat.subtitleKH}
            </p>
          </div>

          {/* Progress Bar (if provided) */}
          {stat.progress !== undefined && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-600 font-hanuman">
                  Progress to Target
                </span>
                <span className="text-xs font-semibold text-gray-900 font-hanuman">
                  {stat.progress}%
                </span>
              </div>
              <Progress value={stat.progress} className="h-2" />
              {stat.target && (
                <p className="text-xs text-gray-500 mt-1 font-hanuman">
                  Target: {stat.target}
                </p>
              )}
            </div>
          )}

          {/* Change Information */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge 
                variant="secondary" 
                className="text-xs bg-gray-100 text-gray-600 border-0 font-hanuman"
              >
                {stat.changeLabel}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-1 text-xs text-gray-500 font-hanuman">
              {stat.trend === 'up' ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : stat.trend === 'down' ? (
                <TrendingDown className="h-3 w-3 text-red-500" />
              ) : (
                <Minus className="h-3 w-3 text-gray-400" />
              )}
              <span>vs last month</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}