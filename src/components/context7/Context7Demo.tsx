'use client';

import React, { useState } from 'react';
import { useContext7 } from '@/hooks/useContext7';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Search, Upload, Users, BookOpen, FlaskConical } from 'lucide-react';

export function Context7Demo() {
  const {
    loading,
    error,
    search,
    indexStudent,
    indexAssessment,
    indexSimulation,
    getStudentRecommendations,
    findSimilarStudents,
  } = useContext7();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
  // Student form
  const [studentForm, setStudentForm] = useState({
    id: '',
    name: '',
    grade: '',
    schoolId: '',
  });
  
  // Assessment form
  const [assessmentForm, setAssessmentForm] = useState({
    id: '',
    studentId: '',
    subject: 'math',
    cycle: 'baseline',
    level: '',
    score: '',
    date: new Date().toISOString().split('T')[0],
  });
  
  // Simulation form
  const [simulationForm, setSimulationForm] = useState({
    id: '',
    title: '',
    subject: 'physics',
    topic: '',
    description: '',
    grade: '',
    difficulty: 'medium',
  });

  const [recommendationStudentId, setRecommendationStudentId] = useState('');
  const [similarStudentId, setSimilarStudentId] = useState('');

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const results = await search(searchQuery, { topK: 10 });
      setSearchResults(results);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  const handleIndexStudent = async () => {
    try {
      await indexStudent({
        ...studentForm,
        assessments: [], // Would be populated from actual data
      });
      alert('Student indexed successfully!');
      setStudentForm({ id: '', name: '', grade: '', schoolId: '' });
    } catch (err) {
      console.error('Failed to index student:', err);
    }
  };

  const handleIndexAssessment = async () => {
    try {
      await indexAssessment({
        ...assessmentForm,
        score: assessmentForm.score ? parseInt(assessmentForm.score) : undefined,
      });
      alert('Assessment indexed successfully!');
      setAssessmentForm({
        id: '',
        studentId: '',
        subject: 'math',
        cycle: 'baseline',
        level: '',
        score: '',
        date: new Date().toISOString().split('T')[0],
      });
    } catch (err) {
      console.error('Failed to index assessment:', err);
    }
  };

  const handleIndexSimulation = async () => {
    try {
      await indexSimulation(simulationForm);
      alert('Simulation indexed successfully!');
      setSimulationForm({
        id: '',
        title: '',
        subject: 'physics',
        topic: '',
        description: '',
        grade: '',
        difficulty: 'medium',
      });
    } catch (err) {
      console.error('Failed to index simulation:', err);
    }
  };

  const handleGetRecommendations = async () => {
    if (!recommendationStudentId) return;
    
    try {
      const recommendations = await getStudentRecommendations(recommendationStudentId);
      setSearchResults(recommendations);
    } catch (err) {
      console.error('Failed to get recommendations:', err);
    }
  };

  const handleFindSimilarStudents = async () => {
    if (!similarStudentId) return;
    
    try {
      const similar = await findSimilarStudents(similarStudentId, 5);
      setSearchResults(similar);
    } catch (err) {
      console.error('Failed to find similar students:', err);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Context7 Vector Database Demo</CardTitle>
          <CardDescription>
            Semantic search and context management for Virtual Lab
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="search" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="search">Search</TabsTrigger>
              <TabsTrigger value="student">Index Student</TabsTrigger>
              <TabsTrigger value="assessment">Index Assessment</TabsTrigger>
              <TabsTrigger value="simulation">Index Simulation</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>

            <TabsContent value="search" className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search for students, assessments, or simulations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  Search
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="student" className="space-y-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="student-id">Student ID</Label>
                    <Input
                      id="student-id"
                      value={studentForm.id}
                      onChange={(e) => setStudentForm({ ...studentForm, id: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="student-name">Name</Label>
                    <Input
                      id="student-name"
                      value={studentForm.name}
                      onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="student-grade">Grade</Label>
                    <Input
                      id="student-grade"
                      value={studentForm.grade}
                      onChange={(e) => setStudentForm({ ...studentForm, grade: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="student-school">School ID</Label>
                    <Input
                      id="student-school"
                      value={studentForm.schoolId}
                      onChange={(e) => setStudentForm({ ...studentForm, schoolId: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={handleIndexStudent} disabled={loading}>
                  <Upload className="mr-2 h-4 w-4" />
                  Index Student
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="assessment" className="space-y-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="assessment-id">Assessment ID</Label>
                    <Input
                      id="assessment-id"
                      value={assessmentForm.id}
                      onChange={(e) => setAssessmentForm({ ...assessmentForm, id: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="assessment-student">Student ID</Label>
                    <Input
                      id="assessment-student"
                      value={assessmentForm.studentId}
                      onChange={(e) => setAssessmentForm({ ...assessmentForm, studentId: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="assessment-subject">Subject</Label>
                    <Select
                      value={assessmentForm.subject}
                      onValueChange={(value) => setAssessmentForm({ ...assessmentForm, subject: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="math">Math</SelectItem>
                        <SelectItem value="khmer">Khmer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="assessment-cycle">Cycle</Label>
                    <Select
                      value={assessmentForm.cycle}
                      onValueChange={(value) => setAssessmentForm({ ...assessmentForm, cycle: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baseline">Baseline</SelectItem>
                        <SelectItem value="midline">Midline</SelectItem>
                        <SelectItem value="endline">Endline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="assessment-level">Level</Label>
                    <Input
                      id="assessment-level"
                      value={assessmentForm.level}
                      onChange={(e) => setAssessmentForm({ ...assessmentForm, level: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="assessment-score">Score</Label>
                    <Input
                      id="assessment-score"
                      type="number"
                      value={assessmentForm.score}
                      onChange={(e) => setAssessmentForm({ ...assessmentForm, score: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="assessment-date">Date</Label>
                    <Input
                      id="assessment-date"
                      type="date"
                      value={assessmentForm.date}
                      onChange={(e) => setAssessmentForm({ ...assessmentForm, date: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={handleIndexAssessment} disabled={loading}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Index Assessment
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="simulation" className="space-y-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="simulation-id">Simulation ID</Label>
                    <Input
                      id="simulation-id"
                      value={simulationForm.id}
                      onChange={(e) => setSimulationForm({ ...simulationForm, id: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="simulation-title">Title</Label>
                    <Input
                      id="simulation-title"
                      value={simulationForm.title}
                      onChange={(e) => setSimulationForm({ ...simulationForm, title: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="simulation-subject">Subject</Label>
                    <Select
                      value={simulationForm.subject}
                      onValueChange={(value) => setSimulationForm({ ...simulationForm, subject: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="physics">Physics</SelectItem>
                        <SelectItem value="chemistry">Chemistry</SelectItem>
                        <SelectItem value="biology">Biology</SelectItem>
                        <SelectItem value="stem">STEM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="simulation-topic">Topic</Label>
                    <Input
                      id="simulation-topic"
                      value={simulationForm.topic}
                      onChange={(e) => setSimulationForm({ ...simulationForm, topic: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="simulation-grade">Grade</Label>
                    <Input
                      id="simulation-grade"
                      value={simulationForm.grade}
                      onChange={(e) => setSimulationForm({ ...simulationForm, grade: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="simulation-description">Description</Label>
                  <Textarea
                    id="simulation-description"
                    value={simulationForm.description}
                    onChange={(e) => setSimulationForm({ ...simulationForm, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <Button onClick={handleIndexSimulation} disabled={loading}>
                  <FlaskConical className="mr-2 h-4 w-4" />
                  Index Simulation
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Get Student Recommendations</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Student ID"
                      value={recommendationStudentId}
                      onChange={(e) => setRecommendationStudentId(e.target.value)}
                    />
                    <Button onClick={handleGetRecommendations} disabled={loading}>
                      Get Recommendations
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>Find Similar Students</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Student ID"
                      value={similarStudentId}
                      onChange={(e) => setSimilarStudentId(e.target.value)}
                    />
                    <Button onClick={handleFindSimilarStudents} disabled={loading}>
                      <Users className="mr-2 h-4 w-4" />
                      Find Similar
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {searchResults.length > 0 && (
            <div className="mt-6 space-y-2">
              <Label>Results ({searchResults.length}):</Label>
              <div className="max-h-96 overflow-auto space-y-2">
                {searchResults.map((result, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="font-medium">{result.metadata?.title || result.id}</span>
                        <span className="text-sm text-muted-foreground">
                          Score: {result.score?.toFixed(3)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Type: {result.metadata?.type}
                      </p>
                      {result.metadata?.content && (
                        <p className="text-sm mt-2">{result.metadata.content}</p>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}