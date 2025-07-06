'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, MessageSquare, FileText, TrendingUp, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface PageProps {
  params: {
    studentId: string;
  };
}

export default function StudentDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { studentId } = params;

  // Mock data - replace with actual API call
  const student = {
    id: studentId,
    name: 'Sokha Lim',
    grade: '10',
    email: 'sokha.lim@example.com',
    lastActive: '10 minutes ago',
    joinedDate: 'September 2024',
    overallProgress: 75,
    averageScore: 85,
    totalModules: 15,
    completedModules: 12,
    totalTimeSpent: 1845, // minutes
    status: 'active' as const,
    subjects: {
      Physics: { progress: 80, score: 88 },
      Chemistry: { progress: 70, score: 82 },
      Biology: { progress: 85, score: 90 },
      Mathematics: { progress: 65, score: 79 }
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{student.name}</h1>
              <p className="text-gray-600 mt-1">Grade {student.grade} • Last active {student.lastActive}</p>
            </div>
            <Button>
              <MessageSquare className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Overall Progress</p>
                  <p className="text-2xl font-bold">{student.overallProgress}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Average Score</p>
                  <p className="text-2xl font-bold">{student.averageScore}%</p>
                </div>
                <FileText className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Modules</p>
                  <p className="text-2xl font-bold">{student.completedModules}/{student.totalModules}</p>
                </div>
                <Badge className="bg-purple-100 text-purple-800">
                  {Math.round((student.completedModules / student.totalModules) * 100)}%
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Time Spent</p>
                  <p className="text-2xl font-bold">{formatTime(student.totalTimeSpent)}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subject Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Subject Progress</CardTitle>
            <CardDescription>Performance breakdown by subject</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(student.subjects).map(([subject, data]) => (
                <div key={subject}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{subject}</span>
                      <Badge variant="outline">{data.score}% avg</Badge>
                    </div>
                    <span className="text-sm text-gray-600">{data.progress}% complete</span>
                  </div>
                  <Progress value={data.progress} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}