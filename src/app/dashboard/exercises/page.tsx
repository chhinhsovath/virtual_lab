'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, Edit, Trash, Save, X, BookOpen, HelpCircle,
  CheckCircle, AlertCircle, Lightbulb
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Simulation {
  id: string;
  display_name_km: string;
  display_name_en: string;
  subject_area: string;
}

interface Exercise {
  id: string;
  simulation_id: string;
  question_number: number;
  question_type: string;
  question_en: string;
  question_km: string;
  instructions_en?: string;
  instructions_km?: string;
  options?: any;
  correct_answer?: string;
  acceptable_answers?: string[];
  points: number;
  difficulty_level?: string;
  hints_en?: string;
  hints_km?: string;
  explanation_en?: string;
  explanation_km?: string;
  is_required: boolean;
  is_active: boolean;
}

export default function ExercisesPage() {
  const router = useRouter();
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedSimulation, setSelectedSimulation] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    question_number: 1,
    question_type: 'multiple_choice',
    question_km: '',
    question_en: '',
    instructions_km: '',
    instructions_en: '',
    options_km: ['', '', '', ''],
    options_en: ['', '', '', ''],
    correct_answer: '',
    acceptable_answers: [],
    points: 10,
    difficulty_level: 'medium',
    hints_km: '',
    hints_en: '',
    explanation_km: '',
    explanation_en: '',
    is_required: true
  });

  useEffect(() => {
    loadSimulations();
  }, []);

  useEffect(() => {
    if (selectedSimulation) {
      loadExercises(selectedSimulation);
    }
  }, [selectedSimulation]);

  const loadSimulations = async () => {
    try {
      const res = await fetch('/api/simulations');
      const data = await res.json();
      if (data.success) {
        setSimulations(data.simulations);
        if (data.simulations.length > 0) {
          setSelectedSimulation(data.simulations[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading simulations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadExercises = async (simulationId: string) => {
    try {
      const res = await fetch(`/api/exercises?simulation_id=${simulationId}&all=true`);
      const data = await res.json();
      if (data.success) {
        setExercises(data.exercises);
      }
    } catch (error) {
      console.error('Error loading exercises:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      simulation_id: selectedSimulation,
      ...formData,
      options: {
        options_km: formData.options_km.filter(opt => opt.trim()),
        options_en: formData.options_en.filter(opt => opt.trim())
      },
      acceptable_answers: formData.acceptable_answers.filter(ans => ans.trim())
    };

    try {
      const res = await fetch('/api/exercises', {
        method: editingExercise ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingExercise ? { ...payload, id: editingExercise.id } : payload)
      });

      const data = await res.json();
      if (data.success) {
        loadExercises(selectedSimulation);
        resetForm();
        alert('លំហាត់ត្រូវបានរក្សាទុក!');
      }
    } catch (error) {
      console.error('Error saving exercise:', error);
      alert('មានបញ្ហាក្នុងការរក្សាទុក');
    }
  };

  const resetForm = () => {
    setFormData({
      question_number: exercises.length + 1,
      question_type: 'multiple_choice',
      question_km: '',
      question_en: '',
      instructions_km: '',
      instructions_en: '',
      options_km: ['', '', '', ''],
      options_en: ['', '', '', ''],
      correct_answer: '',
      acceptable_answers: [],
      points: 10,
      difficulty_level: 'medium',
      hints_km: '',
      hints_en: '',
      explanation_km: '',
      explanation_en: '',
      is_required: true
    });
    setEditingExercise(null);
    setShowForm(false);
  };

  const handleEdit = (exercise: Exercise) => {
    setFormData({
      question_number: exercise.question_number,
      question_type: exercise.question_type,
      question_km: exercise.question_km,
      question_en: exercise.question_en,
      instructions_km: exercise.instructions_km || '',
      instructions_en: exercise.instructions_en || '',
      options_km: exercise.options?.options_km || ['', '', '', ''],
      options_en: exercise.options?.options_en || ['', '', '', ''],
      correct_answer: exercise.correct_answer || '',
      acceptable_answers: exercise.acceptable_answers || [],
      points: exercise.points,
      difficulty_level: exercise.difficulty_level || 'medium',
      hints_km: exercise.hints_km || '',
      hints_en: exercise.hints_en || '',
      explanation_km: exercise.explanation_km || '',
      explanation_en: exercise.explanation_en || '',
      is_required: exercise.is_required
    });
    setEditingExercise(exercise);
    setShowForm(true);
  };

  const getDifficultyBadge = (level: string) => {
    const colors = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-red-100 text-red-800'
    };
    const texts = {
      easy: 'ងាយ',
      medium: 'មធ្យម',
      hard: 'ពិបាក'
    };
    return <Badge className={colors[level as keyof typeof colors] || colors.medium}>{texts[level as keyof typeof texts] || level}</Badge>;
  };

  const getQuestionTypeText = (type: string) => {
    const types: Record<string, string> = {
      multiple_choice: 'ពហុជម្រើស',
      true_false: 'ពិត/មិនពិត',
      calculation: 'គណនា',
      short_answer: 'ចម្លើយខ្លី',
      fill_blank: 'បំពេញចន្លោះ'
    };
    return types[type] || type;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 font-hanuman">កំពុងផ្ទុក...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-hanuman">គ្រប់គ្រងលំហាត់សម្រាប់ការសាកល្បង</h1>
        <p className="text-gray-600 mt-2 font-hanuman">បង្កើត និងកែប្រែសំណួរលំហាត់សម្រាប់សិស្សធ្វើ</p>
      </div>

      {/* Simulation Selector */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="font-hanuman">ជ្រើសរើសការសាកល្បង</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedSimulation} onValueChange={setSelectedSimulation}>
            <SelectTrigger className="w-full font-hanuman">
              <SelectValue placeholder="ជ្រើសរើសការសាកល្បង" />
            </SelectTrigger>
            <SelectContent>
              {simulations.map(sim => (
                <SelectItem key={sim.id} value={sim.id}>
                  <span className="font-hanuman">{sim.display_name_km}</span>
                  <span className="text-gray-500 ml-2">({sim.subject_area})</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Exercise List */}
      {!showForm && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-hanuman">សំណួរលំហាត់</CardTitle>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => router.push('/dashboard/exercises/submissions')} 
                className="font-hanuman"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                មើលចម្លើយសិស្ស
              </Button>
              <Button onClick={() => setShowForm(true)} className="font-hanuman">
                <Plus className="h-4 w-4 mr-2" />
                បន្ថែមសំណួរថ្មី
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {exercises.length === 0 ? (
                <p className="text-center text-gray-500 py-8 font-hanuman">
                  មិនមានសំណួរលំហាត់នៅឡើយទេ
                </p>
              ) : (
                exercises.map((exercise, index) => (
                  <div key={exercise.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium font-hanuman">សំណួរទី {exercise.question_number}</span>
                          <Badge variant="outline">{getQuestionTypeText(exercise.question_type)}</Badge>
                          <Badge variant="outline">{exercise.points} ពិន្ទុ</Badge>
                          {exercise.difficulty_level && getDifficultyBadge(exercise.difficulty_level)}
                        </div>
                        <p className="font-hanuman text-lg mb-1">{exercise.question_km}</p>
                        <p className="text-gray-600 text-sm">{exercise.question_en}</p>
                        {exercise.instructions_km && (
                          <p className="text-sm text-gray-500 mt-2 italic font-hanuman">
                            {exercise.instructions_km}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(exercise)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exercise Form */}
      {showForm && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-hanuman">
              {editingExercise ? 'កែប្រែសំណួរ' : 'បន្ថែមសំណួរថ្មី'}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={resetForm}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="font-hanuman">លេខសំណួរ</Label>
                  <Input
                    type="number"
                    value={formData.question_number}
                    onChange={e => setFormData({...formData, question_number: parseInt(e.target.value)})}
                    min="1"
                    required
                  />
                </div>
                <div>
                  <Label className="font-hanuman">ប្រភេទសំណួរ</Label>
                  <Select
                    value={formData.question_type}
                    onValueChange={val => setFormData({...formData, question_type: val})}
                  >
                    <SelectTrigger className="font-hanuman">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multiple_choice">ពហុជម្រើស</SelectItem>
                      <SelectItem value="true_false">ពិត/មិនពិត</SelectItem>
                      <SelectItem value="calculation">គណនា</SelectItem>
                      <SelectItem value="short_answer">ចម្លើយខ្លី</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Tabs defaultValue="khmer" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="khmer" className="font-hanuman">ភាសាខ្មែរ</TabsTrigger>
                  <TabsTrigger value="english">English</TabsTrigger>
                </TabsList>
                
                <TabsContent value="khmer" className="space-y-4">
                  <div>
                    <Label className="font-hanuman">សំណួរ (ខ្មែរ) *</Label>
                    <Textarea
                      value={formData.question_km}
                      onChange={e => setFormData({...formData, question_km: e.target.value})}
                      className="font-hanuman"
                      rows={3}
                      required
                    />
                  </div>
                  <div>
                    <Label className="font-hanuman">ការណែនាំ (ខ្មែរ)</Label>
                    <Input
                      value={formData.instructions_km}
                      onChange={e => setFormData({...formData, instructions_km: e.target.value})}
                      className="font-hanuman"
                      placeholder="ការណែនាំបន្ថែម..."
                    />
                  </div>
                  {formData.question_type === 'multiple_choice' && (
                    <div>
                      <Label className="font-hanuman">ជម្រើស (ខ្មែរ)</Label>
                      {formData.options_km.map((opt, idx) => (
                        <Input
                          key={idx}
                          value={opt}
                          onChange={e => {
                            const newOptions = [...formData.options_km];
                            newOptions[idx] = e.target.value;
                            setFormData({...formData, options_km: newOptions});
                          }}
                          className="font-hanuman mt-2"
                          placeholder={`ជម្រើសទី ${idx + 1}`}
                        />
                      ))}
                    </div>
                  )}
                  <div>
                    <Label className="font-hanuman">ជំនួយ (ខ្មែរ)</Label>
                    <Textarea
                      value={formData.hints_km}
                      onChange={e => setFormData({...formData, hints_km: e.target.value})}
                      className="font-hanuman"
                      rows={2}
                      placeholder="ជំនួយសម្រាប់សិស្ស..."
                    />
                  </div>
                  <div>
                    <Label className="font-hanuman">ការពន្យល់ (ខ្មែរ)</Label>
                    <Textarea
                      value={formData.explanation_km}
                      onChange={e => setFormData({...formData, explanation_km: e.target.value})}
                      className="font-hanuman"
                      rows={3}
                      placeholder="ពន្យល់ចម្លើយត្រឹមត្រូវ..."
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="english" className="space-y-4">
                  <div>
                    <Label>Question (English) *</Label>
                    <Textarea
                      value={formData.question_en}
                      onChange={e => setFormData({...formData, question_en: e.target.value})}
                      rows={3}
                      required
                    />
                  </div>
                  <div>
                    <Label>Instructions (English)</Label>
                    <Input
                      value={formData.instructions_en}
                      onChange={e => setFormData({...formData, instructions_en: e.target.value})}
                      placeholder="Additional instructions..."
                    />
                  </div>
                  {formData.question_type === 'multiple_choice' && (
                    <div>
                      <Label>Options (English)</Label>
                      {formData.options_en.map((opt, idx) => (
                        <Input
                          key={idx}
                          value={opt}
                          onChange={e => {
                            const newOptions = [...formData.options_en];
                            newOptions[idx] = e.target.value;
                            setFormData({...formData, options_en: newOptions});
                          }}
                          className="mt-2"
                          placeholder={`Option ${idx + 1}`}
                        />
                      ))}
                    </div>
                  )}
                  <div>
                    <Label>Hint (English)</Label>
                    <Textarea
                      value={formData.hints_en}
                      onChange={e => setFormData({...formData, hints_en: e.target.value})}
                      rows={2}
                      placeholder="Hint for students..."
                    />
                  </div>
                  <div>
                    <Label>Explanation (English)</Label>
                    <Textarea
                      value={formData.explanation_en}
                      onChange={e => setFormData({...formData, explanation_en: e.target.value})}
                      rows={3}
                      placeholder="Explain the correct answer..."
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {formData.question_type !== 'short_answer' && (
                  <div>
                    <Label className="font-hanuman">ចម្លើយត្រឹមត្រូវ *</Label>
                    <Input
                      value={formData.correct_answer}
                      onChange={e => setFormData({...formData, correct_answer: e.target.value})}
                      placeholder={formData.question_type === 'true_false' ? 'true/false' : 'ចម្លើយ'}
                      required
                    />
                  </div>
                )}
                <div>
                  <Label className="font-hanuman">ពិន្ទុ</Label>
                  <Input
                    type="number"
                    value={formData.points}
                    onChange={e => setFormData({...formData, points: parseInt(e.target.value)})}
                    min="1"
                    required
                  />
                </div>
                <div>
                  <Label className="font-hanuman">កម្រិតលំបាក</Label>
                  <Select
                    value={formData.difficulty_level}
                    onValueChange={val => setFormData({...formData, difficulty_level: val})}
                  >
                    <SelectTrigger className="font-hanuman">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">ងាយ</SelectItem>
                      <SelectItem value="medium">មធ្យម</SelectItem>
                      <SelectItem value="hard">ពិបាក</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={resetForm} className="font-hanuman">
                  បោះបង់
                </Button>
                <Button type="submit" className="font-hanuman">
                  <Save className="h-4 w-4 mr-2" />
                  រក្សាទុក
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}