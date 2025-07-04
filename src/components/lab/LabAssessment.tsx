'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  GraduationCap,
  Users,
  Calculator,
  Edit3,
  Save,
  MessageSquare,
  TrendingUp,
  Award,
  CheckCircle,
  AlertCircle,
  BarChart3,
  FileText,
  Clock
} from 'lucide-react';

interface Student {
  id: string;
  name: string;
  email: string;
}

interface RubricCriterion {
  id: string;
  criterion_name: string;
  criterion_description: string;
  max_points: number;
  order_index: number;
  auto_gradable: boolean;
}

interface ScoreAnnotation {
  id: string;
  criterion_id: string;
  points_awarded: number;
  teacher_comment: string;
  annotation_type: string;
  criterion_name: string;
  criterion_max_points: number;
}

interface LabScore {
  id: string;
  student_id: string;
  auto_score: number;
  manual_score: number;
  final_score: number;
  teacher_comments: string;
  rubric_breakdown: any;
  graded_at: string;
  graded_by_name: string;
  student_name: string;
  percentage_score: number;
  letter_grade: string;
}

interface LabAssessmentProps {
  labId: string;
  userRole: string;
  userId: string;
  students?: Student[];
  onScoreUpdated?: (score: LabScore) => void;
}

export function LabAssessment({
  labId,
  userRole,
  userId,
  students = [],
  onScoreUpdated
}: LabAssessmentProps) {
  const [scores, setScores] = useState<LabScore[]>([]);
  const [criteria, setCriteria] = useState<RubricCriterion[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [currentScore, setCurrentScore] = useState<LabScore | null>(null);
  const [annotations, setAnnotations] = useState<ScoreAnnotation[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Form state
  const [manualScore, setManualScore] = useState<number>(0);
  const [teacherComments, setTeacherComments] = useState<string>('');
  const [criterionScores, setCriterionScores] = useState<Record<string, { points: number; comment: string }>>({});

  const isTeacher = ['teacher', 'admin', 'super_admin'].includes(userRole);

  useEffect(() => {
    loadScores();
  }, [labId]);

  useEffect(() => {
    if (selectedStudent) {
      loadStudentScore(selectedStudent);
    }
  }, [selectedStudent]);

  const loadScores = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/labs/${labId}/score`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to load scores');
      }

      const data = await response.json();
      setScores(data.scores || []);
      setCriteria(data.criteria || []);
      setStatistics(data.statistics || null);

      // Auto-select first student if teacher and students available
      if (isTeacher && data.scores?.length > 0 && !selectedStudent) {
        setSelectedStudent(data.scores[0].student_id);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load scores');
    } finally {
      setLoading(false);
    }
  };

  const loadStudentScore = async (studentId: string) => {
    try {
      const response = await fetch(`/api/labs/${labId}/score/${studentId}`);
      
      if (!response.ok) {
        const error = await response.json();
        if (response.status === 404) {
          // No score yet
          setCurrentScore(null);
          setAnnotations([]);
          return;
        }
        throw new Error(error.error || 'Failed to load student score');
      }

      const data = await response.json();
      setCurrentScore(data.score);
      setAnnotations(data.annotations || []);
      
      if (data.score) {
        setManualScore(data.score.manual_score || data.score.auto_score || 0);
        setTeacherComments(data.score.teacher_comments || '');
        
        // Initialize criterion scores from annotations
        const criterionScoreMap: Record<string, { points: number; comment: string }> = {};
        data.annotations.forEach((annotation: ScoreAnnotation) => {
          criterionScoreMap[annotation.criterion_id] = {
            points: annotation.points_awarded || 0,
            comment: annotation.teacher_comment || ''
          };
        });
        setCriterionScores(criterionScoreMap);
      }

    } catch (err) {
      console.error('Error loading student score:', err);
    }
  };

  const calculateAutoScore = async (studentId: string) => {
    try {
      setSaving(true);
      const response = await fetch(`/api/labs/${labId}/score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId,
          triggerAutoScore: true
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to calculate auto-score');
      }

      const data = await response.json();
      await loadStudentScore(studentId);
      await loadScores(); // Refresh overview

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate auto-score');
    } finally {
      setSaving(false);
    }
  };

  const saveManualScore = async () => {
    if (!selectedStudent) return;

    try {
      setSaving(true);
      
      // Prepare criterion scores array
      const criterionScoresArray = Object.entries(criterionScores).map(([criterionId, data]) => ({
        criterion_id: criterionId,
        points_awarded: data.points,
        comment: data.comment
      }));

      const response = await fetch(`/api/labs/${labId}/score/${selectedStudent}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          manual_score: manualScore,
          teacher_comments: teacherComments,
          criterion_scores: criterionScoresArray
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save score');
      }

      const data = await response.json();
      await loadStudentScore(selectedStudent);
      await loadScores(); // Refresh overview
      
      if (onScoreUpdated) {
        onScoreUpdated(data.score);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save score');
    } finally {
      setSaving(false);
    }
  };

  const addAnnotation = async (criterionId: string, points: number, comment: string) => {
    if (!selectedStudent) return;

    try {
      const response = await fetch(`/api/labs/${labId}/annotate/${selectedStudent}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          criterion_id: criterionId,
          points_awarded: points,
          teacher_comment: comment,
          annotation_type: 'feedback'
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add annotation');
      }

      await loadStudentScore(selectedStudent);
      await loadScores();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add annotation');
    }
  };

  const updateCriterionScore = (criterionId: string, field: 'points' | 'comment', value: number | string) => {
    setCriterionScores(prev => ({
      ...prev,
      [criterionId]: {
        ...prev[criterionId],
        [field]: value
      }
    }));

    // Auto-calculate total manual score
    if (field === 'points') {
      const newTotal = Object.values({
        ...criterionScores,
        [criterionId]: { ...criterionScores[criterionId], points: value as number }
      }).reduce((sum, item) => sum + (item?.points || 0), 0);
      setManualScore(newTotal);
    }
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getLetterGradeBadge = (grade: string): "default" | "secondary" | "destructive" | "outline" => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'A': 'default',
      'B': 'secondary',
      'C': 'outline',
      'D': 'destructive',
      'F': 'destructive'
    };
    return variants[grade] || 'outline';
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Submissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.total_submissions}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Graded
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.graded_count}</div>
              <div className="text-xs text-gray-500">
                {statistics.total_submissions > 0 
                  ? Math.round((statistics.graded_count / statistics.total_submissions) * 100) 
                  : 0}% complete
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Average Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statistics.average_score ? Math.round(statistics.average_score * 10) / 10 : 'N/A'}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Score Range
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <div>Min: {statistics.min_score || 'N/A'}</div>
                <div>Max: {statistics.max_score || 'N/A'}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Scores Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Scores</CardTitle>
          <CardDescription>Overview of all student scores and grades</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scores.map((score) => (
              <div 
                key={score.student_id}
                className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                  selectedStudent === score.student_id ? 'border-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => setSelectedStudent(score.student_id)}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium">{score.student_name}</p>
                    <p className="text-sm text-gray-500">
                      {score.graded_at ? `Graded ${new Date(score.graded_at).toLocaleDateString()}` : 'Not graded'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {score.auto_score !== null && (
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Auto</div>
                      <div className="font-medium">{Math.round(score.auto_score * 10) / 10}</div>
                    </div>
                  )}
                  
                  {score.manual_score !== null && (
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Manual</div>
                      <div className="font-medium">{Math.round(score.manual_score * 10) / 10}</div>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Final</div>
                    <div className={`font-bold text-lg ${getScoreColor(score.percentage_score || 0)}`}>
                      {score.final_score ? Math.round(score.final_score * 10) / 10 : 'N/A'}
                    </div>
                  </div>
                  
                  {score.letter_grade && (
                    <Badge variant={getLetterGradeBadge(score.letter_grade)}>
                      {score.letter_grade}
                    </Badge>
                  )}
                  
                  {score.percentage_score !== null && (
                    <div className="w-24">
                      <Progress value={score.percentage_score} className="h-2" />
                      <div className="text-xs text-center mt-1">
                        {Math.round(score.percentage_score)}%
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderScoring = () => (
    <div className="space-y-6">
      {/* Student Selector */}
      {isTeacher && (
        <Card>
          <CardHeader>
            <CardTitle>Select Student</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {scores.map((score) => (
                <Button
                  key={score.student_id}
                  variant={selectedStudent === score.student_id ? 'default' : 'outline'}
                  className="justify-start"
                  onClick={() => setSelectedStudent(score.student_id)}
                >
                  {score.student_name}
                  {score.final_score && (
                    <Badge variant="secondary" className="ml-2">
                      {Math.round(score.final_score * 10) / 10}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedStudent && (
        <>
          {/* Auto-Score Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Auto-Score
              </CardTitle>
              <CardDescription>
                Automatically calculated score based on submission responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold">
                  {currentScore?.auto_score ? Math.round(currentScore.auto_score * 10) / 10 : 'N/A'}
                </div>
                {isTeacher && (
                  <Button 
                    onClick={() => calculateAutoScore(selectedStudent)}
                    disabled={saving}
                    variant="outline"
                  >
                    <Calculator className="h-4 w-4 mr-2" />
                    {saving ? 'Calculating...' : 'Calculate Auto-Score'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Manual Scoring Section */}
          {isTeacher && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit3 className="h-5 w-5" />
                  Manual Scoring & Comments
                </CardTitle>
                <CardDescription>
                  Override auto-score and provide detailed feedback
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Overall Score */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="manual_score">Manual Score Override</Label>
                    <Input
                      id="manual_score"
                      type="number"
                      step="0.1"
                      value={manualScore}
                      onChange={(e) => setManualScore(parseFloat(e.target.value) || 0)}
                      placeholder="Enter manual score"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button 
                      onClick={saveManualScore}
                      disabled={saving}
                      className="w-full"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Saving...' : 'Save Score'}
                    </Button>
                  </div>
                </div>

                {/* Overall Comments */}
                <div>
                  <Label htmlFor="teacher_comments">Overall Comments</Label>
                  <Textarea
                    id="teacher_comments"
                    value={teacherComments}
                    onChange={(e) => setTeacherComments(e.target.value)}
                    placeholder="Provide overall feedback for the student..."
                    rows={4}
                  />
                </div>

                <Separator />

                {/* Criterion-by-Criterion Scoring */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Rubric Breakdown</h3>
                  {criteria.map((criterion) => (
                    <Card key={criterion.id} className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{criterion.criterion_name}</CardTitle>
                        {criterion.criterion_description && (
                          <CardDescription>{criterion.criterion_description}</CardDescription>
                        )}
                        <div className="text-sm text-gray-500">
                          Max Points: {criterion.max_points}
                          {criterion.auto_gradable && (
                            <Badge variant="secondary" className="ml-2">Auto-gradable</Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Points Awarded</Label>
                            <Input
                              type="number"
                              step="0.1"
                              max={criterion.max_points}
                              min="0"
                              value={criterionScores[criterion.id]?.points || 0}
                              onChange={(e) => updateCriterionScore(
                                criterion.id, 
                                'points', 
                                parseFloat(e.target.value) || 0
                              )}
                            />
                          </div>
                          <div className="flex items-end">
                            <div className="text-sm text-gray-500">
                              {criterionScores[criterion.id]?.points ? 
                                Math.round((criterionScores[criterion.id].points / criterion.max_points) * 100) : 0}%
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <Label>Feedback Comments</Label>
                          <Textarea
                            value={criterionScores[criterion.id]?.comment || ''}
                            onChange={(e) => updateCriterionScore(
                              criterion.id, 
                              'comment', 
                              e.target.value
                            )}
                            placeholder="Provide specific feedback for this criterion..."
                            rows={2}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading assessment data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={loadScores} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Lab Assessment
          </CardTitle>
          <CardDescription>
            {isTeacher ? 'Manage student scores and provide feedback' : 'View your lab score and feedback'}
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="scoring">
            {isTeacher ? 'Score & Grade' : 'My Score'}
          </TabsTrigger>
          {isTeacher && <TabsTrigger value="analytics">Analytics</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="scoring" className="space-y-6">
          {renderScoring()}
        </TabsContent>

        {isTeacher && (
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Score Analytics</CardTitle>
                <CardDescription>
                  Detailed analytics and insights into student performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                  <p>Analytics dashboard coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}