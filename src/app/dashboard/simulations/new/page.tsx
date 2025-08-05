'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, Save, Plus, X, Loader2, Menu, LogOut, Upload, 
  FileText, BookOpen, Send, Eye, Edit3, AlertCircle, CheckCircle,
  FileCode, Clock, ChevronDown, Download, FileSpreadsheet
} from 'lucide-react';
import { toast } from 'sonner';
import ModernSidebar from '@/components/dashboard/ModernSidebar';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  role?: string;
  roles?: string[];
  permissions?: string[];
  schoolAccess?: Array<{
    schoolId: number;
    accessType: string;
    subject: string;
  }>;
  teacherId?: number;
}

const formSchema = z.object({
  simulation_name: z.string().min(1, 'Simulation name is required').regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers, and hyphens only'),
  display_name_en: z.string().min(1, 'English display name is required'),
  display_name_km: z.string().optional(),
  description_en: z.string().min(10, 'English description must be at least 10 characters'),
  description_km: z.string().optional(),
  subject_area: z.enum(['Physics', 'Chemistry', 'Biology', 'Mathematics']),
  difficulty_level: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  grade_levels: z.array(z.number()).min(1, 'Select at least one grade level'),
  estimated_duration: z.number().min(5).max(120),
  learning_objectives_en: z.array(z.string()).min(1, 'Add at least one learning objective'),
  learning_objectives_km: z.array(z.string()).optional(),
  simulation_url: z.string().optional(),
  preview_image: z.string().optional(),
  tags: z.array(z.string()).optional(),
  is_featured: z.boolean().default(false),
  is_active: z.boolean().default(true),
  // New fields
  status: z.enum(['draft', 'review', 'published']).default('draft'),
  exercise_content_en: z.string().optional(),
  exercise_content_km: z.string().optional(),
  instruction_content_en: z.string().optional(),
  instruction_content_km: z.string().optional(),
  simulation_file: z.any().optional(),
});

type FormData = z.infer<typeof formSchema>;

const statusConfig = {
  draft: {
    label: 'Draft',
    icon: Edit3,
    color: 'bg-gray-100 text-gray-800',
    borderColor: 'border-gray-300',
    description: 'Work in progress, not visible to students'
  },
  review: {
    label: 'Under Review',
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-800',
    borderColor: 'border-yellow-300',
    description: 'Submitted for review by administrators'
  },
  published: {
    label: 'Published',
    icon: CheckCircle,
    color: 'bg-green-100 text-green-800',
    borderColor: 'border-green-300',
    description: 'Live and available to students'
  }
};

export default function NewSimulationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkPreview, setBulkPreview] = useState<any[]>([]);
  const [bulkUploading, setBulkUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bulkFileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [newObjectiveEn, setNewObjectiveEn] = useState('');
  const [newObjectiveKm, setNewObjectiveKm] = useState('');
  const [newTag, setNewTag] = useState('');
  const [exercises, setExercises] = useState<Array<{
    id: string;
    question_number: number;
    question_type: 'multiple_choice' | 'short_answer' | 'calculation' | 'true_false';
    question_en: string;
    question_km: string;
    instructions_en?: string;
    instructions_km?: string;
    options?: {
      options_en: string[];
      options_km: string[];
    };
    correct_answer?: string;
    points: number;
    difficulty_level?: 'easy' | 'medium' | 'hard';
    hints_en?: string;
    hints_km?: string;
    explanation_en?: string;
    explanation_km?: string;
  }>>([]);
  const [currentExercise, setCurrentExercise] = useState({
    question_type: 'multiple_choice' as const,
    question_en: '',
    question_km: '',
    instructions_en: '',
    instructions_km: '',
    options_en: ['', '', '', ''],
    options_km: ['', '', '', ''],
    correct_answer: '',
    points: 10,
    difficulty_level: 'medium' as const,
    hints_en: '',
    hints_km: '',
    explanation_en: '',
    explanation_km: ''
  });
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileUploading, setFileUploading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      simulation_name: '',
      display_name_en: '',
      display_name_km: '',
      description_en: '',
      description_km: '',
      subject_area: 'Physics',
      difficulty_level: 'Beginner',
      grade_levels: [],
      estimated_duration: 30,
      learning_objectives_en: [],
      learning_objectives_km: [],
      simulation_url: '',
      preview_image: '',
      tags: [],
      is_featured: false,
      is_active: true,
      status: 'draft',
      exercise_content_en: '',
      exercise_content_km: '',
      instruction_content_en: '',
      instruction_content_km: '',
    },
  });

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session', {
          credentials: 'include',
        });
        const data = await response.json();
        
        if (data.user) {
          const userData = {
            ...data.user,
            roles: data.user.roles || (data.user.role ? [data.user.role] : []),
            permissions: data.user.permissions || []
          };
          setUser(userData);
        } else {
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Session check error:', error);
        router.push('/auth/login');
      } finally {
        setUserLoading(false);
      }
    };

    checkSession();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      // Use window.location.href instead of router.push for complete session cleanup
      // This ensures we bypass Next.js client-side routing and force a full page reload
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect to home even if logout API fails to ensure user is logged out client-side
      window.location.href = '/';
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'text/html' && !file.name.endsWith('.html')) {
        toast.error('Please select an HTML file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      form.setValue('simulation_file', file);
    }
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      // If there's a file to upload, handle it first
      let simulationFilePath = '';
      if (selectedFile) {
        setFileUploading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('type', 'simulation');
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload file');
        }

        const uploadResult = await uploadResponse.json();
        simulationFilePath = uploadResult.filePath;
        setFileUploading(false);
      }

      // Create the simulation with all data
      const simulationData = {
        ...data,
        simulation_file_path: simulationFilePath || data.simulation_url,
      };

      const response = await fetch('/api/simulations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(simulationData),
      });

      const result = await response.json();
      if (result.success) {
        // If we have exercises, create them
        if (exercises.length > 0) {
          await createExercises(result.simulation.id);
        }
        
        toast.success(`Simulation ${data.status === 'published' ? 'published' : 'saved'} successfully!`);
        router.push('/dashboard/simulations');
      } else {
        toast.error(result.error || 'Failed to create simulation');
      }
    } catch (error) {
      console.error('Error creating simulation:', error);
      toast.error('Failed to create simulation');
    } finally {
      setLoading(false);
      setFileUploading(false);
    }
  };

  const addObjective = () => {
    if (newObjectiveEn.trim()) {
      const currentObjectivesEn = form.getValues('learning_objectives_en');
      const currentObjectivesKm = form.getValues('learning_objectives_km') || [];
      
      form.setValue('learning_objectives_en', [...currentObjectivesEn, newObjectiveEn.trim()]);
      if (newObjectiveKm.trim()) {
        form.setValue('learning_objectives_km', [...currentObjectivesKm, newObjectiveKm.trim()]);
      }
      
      setNewObjectiveEn('');
      setNewObjectiveKm('');
    }
  };

  const removeObjective = (index: number) => {
    const currentObjectivesEn = form.getValues('learning_objectives_en');
    const currentObjectivesKm = form.getValues('learning_objectives_km') || [];
    
    form.setValue('learning_objectives_en', currentObjectivesEn.filter((_, i) => i !== index));
    form.setValue('learning_objectives_km', currentObjectivesKm.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (newTag.trim()) {
      const currentTags = form.getValues('tags') || [];
      form.setValue('tags', [...currentTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    const currentTags = form.getValues('tags') || [];
    form.setValue('tags', currentTags.filter((_, i) => i !== index));
  };

  const toggleGrade = (grade: number) => {
    const currentGrades = form.getValues('grade_levels');
    if (currentGrades.includes(grade)) {
      form.setValue('grade_levels', currentGrades.filter(g => g !== grade));
    } else {
      form.setValue('grade_levels', [...currentGrades, grade].sort((a, b) => a - b));
    }
  };

  const handleStatusChange = (newStatus: 'draft' | 'review' | 'published') => {
    form.setValue('status', newStatus);
    
    if (newStatus === 'published') {
      toast.info('Publishing will make this simulation immediately available to students');
    } else if (newStatus === 'review') {
      toast.info('Submitting for review will notify administrators');
    }
  };

  const addExercise = () => {
    if (!currentExercise.question_en.trim()) {
      toast.error('Please enter a question in English');
      return;
    }

    const newExercise = {
      id: `exercise_${Date.now()}`,
      question_number: exercises.length + 1,
      question_type: currentExercise.question_type,
      question_en: currentExercise.question_en,
      question_km: currentExercise.question_km,
      instructions_en: currentExercise.instructions_en,
      instructions_km: currentExercise.instructions_km,
      options: currentExercise.question_type === 'multiple_choice' ? {
        options_en: currentExercise.options_en.filter(opt => opt.trim()),
        options_km: currentExercise.options_km.filter(opt => opt.trim())
      } : undefined,
      correct_answer: currentExercise.correct_answer,
      points: currentExercise.points,
      difficulty_level: currentExercise.difficulty_level,
      hints_en: currentExercise.hints_en,
      hints_km: currentExercise.hints_km,
      explanation_en: currentExercise.explanation_en,
      explanation_km: currentExercise.explanation_km
    };

    setExercises([...exercises, newExercise]);
    
    // Reset form
    setCurrentExercise({
      question_type: 'multiple_choice',
      question_en: '',
      question_km: '',
      instructions_en: '',
      instructions_km: '',
      options_en: ['', '', '', ''],
      options_km: ['', '', '', ''],
      correct_answer: '',
      points: 10,
      difficulty_level: 'medium',
      hints_en: '',
      hints_km: '',
      explanation_en: '',
      explanation_km: ''
    });
    
    setShowExerciseForm(false);
    toast.success('Exercise added successfully!');
  };

  const removeExercise = (id: string) => {
    setExercises(exercises.filter(ex => ex.id !== id));
    // Renumber exercises
    const updatedExercises = exercises
      .filter(ex => ex.id !== id)
      .map((ex, index) => ({ ...ex, question_number: index + 1 }));
    setExercises(updatedExercises);
  };

  const updateCurrentExerciseOption = (index: number, value: string, language: 'en' | 'km') => {
    const key = language === 'en' ? 'options_en' : 'options_km';
    const newOptions = [...currentExercise[key]];
    newOptions[index] = value;
    setCurrentExercise({
      ...currentExercise,
      [key]: newOptions
    });
  };

  const createExercises = async (simulationId: string) => {
    try {
      for (const exercise of exercises) {
        const exerciseData = {
          simulation_id: simulationId,
          question_number: exercise.question_number,
          question_type: exercise.question_type,
          question_en: exercise.question_en,
          question_km: exercise.question_km,
          instructions_en: exercise.instructions_en,
          instructions_km: exercise.instructions_km,
          options: exercise.options,
          correct_answer: exercise.correct_answer,
          points: exercise.points,
          difficulty_level: exercise.difficulty_level,
          hints_en: exercise.hints_en,
          hints_km: exercise.hints_km,
          explanation_en: exercise.explanation_en,
          explanation_km: exercise.explanation_km,
          is_required: true
        };

        const response = await fetch('/api/exercises', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(exerciseData),
        });

        if (!response.ok) {
          console.error('Failed to create exercise:', exercise.question_number);
        }
      }
    } catch (error) {
      console.error('Error creating exercises:', error);
      toast.error('Some exercises failed to save');
    }
  };

  // Bulk upload functions
  const downloadTemplate = (format: 'json' | 'csv') => {
    const sampleExercise = {
      question_number: 1,
      question_type: "multiple_choice",
      question_en: "What is the capital of France?",
      question_km: "តើរដ្ឋធានីនៃប្រទេសបារាំងគឺជាអ្វី?",
      instructions_en: "Select the correct answer",
      instructions_km: "ជ្រើសរើសចម្លើយត្រឹមត្រូវ",
      options_en: ["Paris", "London", "Berlin", "Madrid"],
      options_km: ["ប៉ារីស", "ឡុងដ៍", "បែរលីន", "ម៉ាឌ្រីដ"],
      correct_answer: "Paris",
      points: 10,
      difficulty_level: "easy",
      hints_en: "It's known as the City of Light",
      hints_km: "វាត្រូវបានគេស្គាល់ថាជាទីក្រុងនៃពន្លឺ",
      explanation_en: "Paris is the capital and largest city of France",
      explanation_km: "ប៉ារីសគឺជារដ្ឋធានី និងជាទីក្រុងធំបំផុតនៃប្រទេសបារាំង",
      is_required: true
    };

    if (format === 'json') {
      const template = { exercises: [sampleExercise] };
      const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'exercise-template.json';
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const headers = [
        'question_number', 'question_type', 'question_en', 'question_km',
        'instructions_en', 'instructions_km', 'options_en', 'options_km',
        'correct_answer', 'points', 'difficulty_level', 'hints_en', 'hints_km',
        'explanation_en', 'explanation_km', 'is_required'
      ];
      const row = [
        sampleExercise.question_number,
        sampleExercise.question_type,
        `"${sampleExercise.question_en}"`,
        `"${sampleExercise.question_km}"`,
        `"${sampleExercise.instructions_en}"`,
        `"${sampleExercise.instructions_km}"`,
        `"${sampleExercise.options_en.join('|')}"`,
        `"${sampleExercise.options_km.join('|')}"`,
        sampleExercise.correct_answer,
        sampleExercise.points,
        sampleExercise.difficulty_level,
        `"${sampleExercise.hints_en}"`,
        `"${sampleExercise.hints_km}"`,
        `"${sampleExercise.explanation_en}"`,
        `"${sampleExercise.explanation_km}"`,
        sampleExercise.is_required
      ];
      const csv = [headers.join(','), row.join(',')].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'exercise-template.csv';
      a.click();
      URL.revokeObjectURL(url);
    }
    toast.success(`${format.toUpperCase()} template downloaded`);
  };

  const handleBulkFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setBulkFile(file);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        let parsedData: any[] = [];

        if (file.name.endsWith('.json')) {
          const jsonData = JSON.parse(content);
          parsedData = jsonData.exercises || [];
        } else if (file.name.endsWith('.csv')) {
          const lines = content.split('\n').filter(line => line.trim());
          const headers = lines[0].split(',').map(h => h.trim());
          
          parsedData = lines.slice(1).map((line, index) => {
            const values = [];
            let current = '';
            let inQuotes = false;
            
            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              if (char === '"') {
                inQuotes = !inQuotes;
              } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
              } else {
                current += char;
              }
            }
            values.push(current.trim());

            const exercise: any = {};
            headers.forEach((header, i) => {
              const value = values[i]?.replace(/^"(.*)"$/, '$1');
              if (header === 'question_number' || header === 'points') {
                exercise[header] = parseInt(value) || (index + 1);
              } else if (header === 'options_en' || header === 'options_km') {
                exercise[header] = value?.split('|') || [];
              } else if (header === 'is_required') {
                exercise[header] = value === 'true';
              } else {
                exercise[header] = value || '';
              }
            });
            return exercise;
          });
        }

        setBulkPreview(parsedData);
        setShowBulkUpload(true);
      } catch (error) {
        toast.error('Failed to parse file. Please check the format.');
        console.error('Parse error:', error);
      }
    };

    reader.readAsText(file);
  };

  const processBulkUpload = () => {
    setBulkUploading(true);
    
    try {
      const processedExercises = bulkPreview.map((exercise, index) => ({
        id: Math.random().toString(36).substr(2, 9),
        question_number: exercise.question_number || (exercises.length + index + 1),
        question_type: exercise.question_type || 'multiple_choice',
        question_en: exercise.question_en || '',
        question_km: exercise.question_km || '',
        instructions_en: exercise.instructions_en || '',
        instructions_km: exercise.instructions_km || '',
        options_en: exercise.options_en || [],
        options_km: exercise.options_km || [],
        correct_answer: exercise.correct_answer || '',
        points: exercise.points || 10,
        difficulty_level: exercise.difficulty_level || 'medium',
        hints_en: exercise.hints_en || '',
        hints_km: exercise.hints_km || '',
        explanation_en: exercise.explanation_en || '',
        explanation_km: exercise.explanation_km || '',
        is_required: exercise.is_required !== false
      }));

      setExercises(prev => [...prev, ...processedExercises]);
      setShowBulkUpload(false);
      setBulkFile(null);
      setBulkPreview([]);
      
      toast.success(`Successfully imported ${processedExercises.length} exercises`);
    } catch (error) {
      toast.error('Failed to import exercises');
      console.error('Import error:', error);
    } finally {
      setBulkUploading(false);
    }
  };

  if (userLoading) {
    return <LoadingSpinner />;
  }

  const currentStatus = form.watch('status');
  const StatusIcon = statusConfig[currentStatus].icon;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ModernSidebar 
        user={user} 
        onLogout={handleLogout}
        mobileOpen={mobileMenuOpen}
        onMobileToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        onCollapsedChange={setSidebarCollapsed}
      />
      
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-80'}`}>
        {/* Header */}
        <header className="bg-white shadow-sm px-4 sm:px-6 lg:px-8 py-4 sticky top-0 z-40 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden"
              >
                <Menu className="h-6 w-6" />
              </Button>
              <h1 className="text-2xl font-bold text-gray-900 ml-2 lg:ml-0">Create New Simulation</h1>
            </div>
            <div className="flex items-center gap-4">
              {/* Status Badge */}
              <div className={cn(
                "flex items-center gap-2 px-3 py-1 rounded-full border",
                statusConfig[currentStatus].color,
                statusConfig[currentStatus].borderColor
              )}>
                <StatusIcon className="h-4 w-4" />
                <span className="text-sm font-medium">{statusConfig[currentStatus].label}</span>
              </div>
              
              <span className="text-sm text-gray-600 hidden sm:inline">
                {user?.name || user?.email}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 bg-white min-h-full">
          <div className="max-w-6xl mx-auto">
            {/* Actions */}
            <div className="mb-6 flex justify-end items-center">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPreviewMode(!previewMode)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  {previewMode ? 'Edit' : 'Preview'}
                </Button>
              </div>
            </div>

            {/* Status Alert */}
            <Alert className="mb-6 bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                {statusConfig[currentStatus].description}
              </AlertDescription>
            </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-5 bg-gray-100 p-1.5 rounded-lg">
                <TabsTrigger value="basic" className="text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-200 text-gray-600 font-medium transition-all">Basic Info</TabsTrigger>
                <TabsTrigger value="content" className="text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-200 text-gray-600 font-medium transition-all">Content</TabsTrigger>
                <TabsTrigger value="exercises" className="text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-200 text-gray-600 font-medium transition-all">Exercises</TabsTrigger>
                <TabsTrigger value="instructions" className="text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-200 text-gray-600 font-medium transition-all">Instructions</TabsTrigger>
                <TabsTrigger value="settings" className="text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-200 text-gray-600 font-medium transition-all">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6">
                <Card className="bg-white border border-gray-200 shadow-sm">
                  <CardHeader className="bg-gray-50 border-b border-gray-200">
                    <CardTitle className="text-gray-900">Basic Information</CardTitle>
                    <CardDescription className="text-gray-600">Enter the basic details of your simulation</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="simulation_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Simulation ID</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="pendulum-lab" />
                          </FormControl>
                          <FormDescription>
                            Unique identifier (lowercase, hyphens only)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="display_name_en"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Display Name (English)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Pendulum Lab" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="display_name_km"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Display Name (Khmer)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="ភេនឌុលម៉ាម" className="font-hanuman" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="dropdown-container">
                        <FormField
                          control={form.control}
                          name="subject_area"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subject Area</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select subject" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Physics">Physics</SelectItem>
                                <SelectItem value="Chemistry">Chemistry</SelectItem>
                                <SelectItem value="Biology">Biology</SelectItem>
                                <SelectItem value="Mathematics">Mathematics</SelectItem>
                              </SelectContent>
                            </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="dropdown-container">
                        <FormField
                          control={form.control}
                          name="difficulty_level"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Difficulty Level</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select difficulty" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Beginner">Beginner</SelectItem>
                                <SelectItem value="Intermediate">Intermediate</SelectItem>
                                <SelectItem value="Advanced">Advanced</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                        />
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="grade_levels"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Grade Levels</FormLabel>
                          <FormControl>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((grade) => (
                                <Badge
                                  key={grade}
                                  variant={field.value.includes(grade) ? "default" : "outline"}
                                  className="cursor-pointer"
                                  onClick={() => toggleGrade(grade)}
                                >
                                  Grade {grade}
                                </Badge>
                              ))}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="estimated_duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estimated Duration (minutes)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Simulation Upload Card */}
                <Card className="bg-white border border-gray-200 shadow-sm">
                  <CardHeader className="bg-gray-50 border-b border-gray-200">
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                      <FileCode className="h-5 w-5 text-blue-600" />
                      Simulation File
                    </CardTitle>
                    <CardDescription className="text-gray-600">Upload your HTML simulation file or provide a URL</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <FormLabel>Upload HTML File</FormLabel>
                      <div className="mt-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".html,text/html"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <div className="flex items-center gap-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={fileUploading}
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            Choose File
                          </Button>
                          {selectedFile && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <FileText className="h-4 w-4" />
                              <span>{selectedFile.name}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedFile(null)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Accepts HTML files up to 10MB
                        </p>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-500">Or</span>
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="simulation_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Simulation URL</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://..." />
                          </FormControl>
                          <FormDescription>
                            External URL to the simulation
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="content" className="space-y-6">
                <Card className="bg-white border border-gray-200 shadow-sm">
                  <CardHeader className="bg-gray-50 border-b border-gray-200">
                    <CardTitle className="text-gray-900">Description</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="description_en"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (English)</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              rows={4}
                              placeholder="Describe what students will learn..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description_km"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Khmer)</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              rows={4}
                              placeholder="ពិពណ៌នាអ្វីដែលសិស្សនឹងរៀន..."
                              className="font-hanuman"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card className="bg-white border border-gray-200 shadow-sm">
                  <CardHeader className="bg-gray-50 border-b border-gray-200">
                    <CardTitle className="text-gray-900">Learning Objectives</CardTitle>
                    <CardDescription className="text-gray-600">What will students learn from this simulation?</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                          placeholder="Learning objective (English)"
                          value={newObjectiveEn}
                          onChange={(e) => setNewObjectiveEn(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addObjective())}
                        />
                        <Input
                          placeholder="Learning objective (Khmer)"
                          value={newObjectiveKm}
                          onChange={(e) => setNewObjectiveKm(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addObjective())}
                          className="font-hanuman"
                        />
                        <Button type="button" onClick={addObjective}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {form.watch('learning_objectives_en').map((objective, index) => (
                        <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                          <div className="flex-1">
                            <p className="text-sm">{objective}</p>
                            {form.watch('learning_objectives_km')?.[index] && (
                              <p className="text-sm text-gray-600 font-hanuman">{form.watch('learning_objectives_km')[index]}</p>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeObjective(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="exercises" className="space-y-6">
                <Card className="bg-white border border-gray-200 shadow-sm">
                  <CardHeader className="bg-gray-50 border-b border-gray-200">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-900">
                        <FileText className="h-5 w-5 text-green-600" />
                        Exercise Builder ({exercises.length} exercises)
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          onClick={() => setShowExerciseForm(true)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Exercise
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              className="px-3 border-green-200 hover:bg-green-50"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuItem onClick={() => downloadTemplate('json')}>
                              <FileCode className="h-4 w-4 mr-2" />
                              Download JSON Template
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => downloadTemplate('csv')}>
                              <FileSpreadsheet className="h-4 w-4 mr-2" />
                              Download CSV Template
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => bulkFileInputRef.current?.click()}>
                              <Upload className="h-4 w-4 mr-2" />
                              Bulk Upload Exercises
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Create individual exercises that students will complete after interacting with the simulation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Exercise List */}
                    {exercises.length > 0 && (
                      <div className="space-y-3">
                        {exercises.map((exercise, index) => (
                          <div key={exercise.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge className="bg-blue-100 text-blue-800">
                                    Question {exercise.question_number}
                                  </Badge>
                                  <Badge variant="outline">
                                    {exercise.question_type.replace('_', ' ')}
                                  </Badge>
                                  <Badge className="bg-yellow-100 text-yellow-800">
                                    {exercise.points} pts
                                  </Badge>
                                  {exercise.difficulty_level && (
                                    <Badge variant="secondary">
                                      {exercise.difficulty_level}
                                    </Badge>
                                  )}
                                </div>
                                <p className="font-medium text-gray-900 mb-1">
                                  {exercise.question_en}
                                </p>
                                {exercise.question_km && (
                                  <p className="text-gray-600 font-hanuman mb-2">
                                    {exercise.question_km}
                                  </p>
                                )}
                                {exercise.options && (
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {exercise.options.options_en.map((option, idx) => (
                                      <span
                                        key={idx}
                                        className={`text-xs px-2 py-1 rounded ${
                                          option === exercise.correct_answer
                                            ? 'bg-green-100 text-green-800 font-semibold'
                                            : 'bg-gray-100 text-gray-600'
                                        }`}
                                      >
                                        {String.fromCharCode(65 + idx)}. {option}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                {exercise.correct_answer && exercise.question_type !== 'multiple_choice' && (
                                  <p className="text-sm text-green-700 mt-2">
                                    <strong>Answer:</strong> {exercise.correct_answer}
                                  </p>
                                )}
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeExercise(exercise.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {exercises.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>No exercises added yet</p>
                        <p className="text-sm">Click "Add Exercise" to create your first question</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Exercise Form Modal */}
                <Dialog open={showExerciseForm} onOpenChange={setShowExerciseForm}>
                  <DialogContent className="w-[95vw] max-w-none p-0 bg-white animate-in fade-in-0 zoom-in-95 duration-300 rounded-xl sm:w-[50vw] sm:max-w-[50vw] max-h-[90vh] flex flex-col">
                    <DialogHeader className="px-6 py-3 border-b bg-white flex-shrink-0">
                      <DialogTitle className="text-blue-900 text-lg font-bold">Create New Exercise</DialogTitle>
                      <DialogDescription className="text-gray-600 text-sm">
                        Fill in the details below to create a new exercise for your simulation.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto px-6 py-4">
                      <div className="space-y-4">
                        {/* Question Type */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200">
                        <h3 className="text-sm font-semibold mb-2 text-blue-900">Question Type</h3>
                        <div className="dropdown-container">
                          <label className="block text-xs font-medium mb-1 text-gray-700">Select Question Type</label>
                          <Select
                            value={currentExercise.question_type}
                            onValueChange={(value: any) => setCurrentExercise({
                              ...currentExercise,
                              question_type: value
                            })}
                          >
                            <SelectTrigger className="w-full h-8 border-2 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-2 border-gray-200 shadow-xl">
                              <SelectItem value="multiple_choice" className="hover:bg-blue-50 focus:bg-blue-50 text-gray-900 text-xs py-1">Multiple Choice</SelectItem>
                              <SelectItem value="true_false" className="hover:bg-blue-50 focus:bg-blue-50 text-gray-900 text-xs py-1">True/False</SelectItem>
                              <SelectItem value="calculation" className="hover:bg-blue-50 focus:bg-blue-50 text-gray-900 text-xs py-1">Calculation</SelectItem>
                              <SelectItem value="short_answer" className="hover:bg-blue-50 focus:bg-blue-50 text-gray-900 text-xs py-1">Short Answer</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        </div>

                        {/* Questions */}
                        <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-3 rounded-lg border border-gray-200">
                          <h3 className="text-sm font-semibold mb-2 text-gray-900">Question Details</h3>
                          <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium mb-1 text-gray-700">Question (English) *</label>
                              <Textarea
                                value={currentExercise.question_en}
                                onChange={(e) => setCurrentExercise({
                                  ...currentExercise,
                                  question_en: e.target.value
                                })}
                                placeholder="Enter your question..."
                                rows={2}
                                className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-xs p-2 resize-none"
                              />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1 text-gray-700">Question (Khmer)</label>
                              <Textarea
                                value={currentExercise.question_km}
                                onChange={(e) => setCurrentExercise({
                                  ...currentExercise,
                                  question_km: e.target.value
                                })}
                                placeholder="បញ្ចូលសំណួររបស់អ្នក..."
                                className="font-hanuman border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-xs p-2 resize-none"
                                rows={2}
                              />
                          </div>
                          </div>
                        </div>

                        {/* Multiple Choice Options */}
                        {currentExercise.question_type === 'multiple_choice' && (
                          <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-3 rounded-lg border border-emerald-200">
                            <h3 className="text-sm font-semibold mb-2 text-emerald-900">Answer Options</h3>
                            <div className="space-y-2">
                              {currentExercise.options_en.map((option, index) => (
                                <div key={index} className="space-y-1">
                                <div className="flex gap-2">
                                  <span className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center text-xs font-bold border border-emerald-300">
                                    {String.fromCharCode(65 + index)}
                                  </span>
                                  <Input
                                    value={option}
                                    onChange={(e) => updateCurrentExerciseOption(index, e.target.value, 'en')}
                                    placeholder={`Option ${String.fromCharCode(65 + index)} (English)`}
                                    className="border-2 border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs h-7"
                                  />
                                  </div>
                                  <Input
                                    value={currentExercise.options_km[index]}
                                    onChange={(e) => updateCurrentExerciseOption(index, e.target.value, 'km')}
                                    placeholder={`Option ${String.fromCharCode(65 + index)} (Khmer)`}
                                    className="font-hanuman border-2 border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs h-7 ml-8"
                                  />
                                </div>
                              ))}
                            </div>
                            <div className="mt-3 dropdown-container">
                            <label className="block text-xs font-medium mb-1 text-emerald-900">Correct Answer</label>
                            <Select
                              value={currentExercise.correct_answer}
                              onValueChange={(value) => setCurrentExercise({
                                ...currentExercise,
                                correct_answer: value
                              })}
                            >
                              <SelectTrigger className="w-full h-8 border-2 border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white text-xs">
                                <SelectValue placeholder="Choose the correct answer option" className="text-gray-700" />
                              </SelectTrigger>
                              <SelectContent className="bg-white border-2 border-gray-200 shadow-xl">
                                {currentExercise.options_en.map((option, index) => (
                                  option.trim() && (
                                    <SelectItem key={index} value={option} className="hover:bg-emerald-50 focus:bg-emerald-50 text-gray-900 text-xs py-1">
                                      {String.fromCharCode(65 + index)}. {option}
                                    </SelectItem>
                                  )
                                ))}
                              </SelectContent>
                            </Select>
                            </div>
                          </div>
                        )}

                        {/* True/False Answer */}
                        {currentExercise.question_type === 'true_false' && (
                          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-3 rounded-lg border border-amber-200">
                          <h3 className="text-sm font-semibold mb-2 text-amber-900">True/False Answer</h3>
                          <div className="dropdown-container">
                            <label className="block text-xs font-medium mb-1 text-amber-900">Correct Answer</label>
                            <Select
                              value={currentExercise.correct_answer}
                              onValueChange={(value) => setCurrentExercise({
                                ...currentExercise,
                                correct_answer: value
                              })}
                            >
                              <SelectTrigger className="w-full h-8 border-2 border-amber-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 bg-white text-xs">
                                <SelectValue placeholder="Select correct answer" />
                              </SelectTrigger>
                              <SelectContent className="bg-white border-2 border-gray-200 shadow-xl">
                                <SelectItem value="true" className="hover:bg-amber-50 focus:bg-amber-50 text-gray-900 text-xs py-1">True</SelectItem>
                                <SelectItem value="false" className="hover:bg-amber-50 focus:bg-amber-50 text-gray-900 text-xs py-1">False</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          </div>
                        )}

                        {/* Short Answer/Calculation Answer */}
                        {(currentExercise.question_type === 'short_answer' || currentExercise.question_type === 'calculation') && (
                          <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-3 rounded-lg border border-purple-200">
                          <h3 className="text-sm font-semibold mb-2 text-purple-900">Answer</h3>
                          <div>
                            <label className="block text-xs font-medium mb-1 text-purple-900">Correct Answer</label>
                            <Input
                              value={currentExercise.correct_answer}
                              onChange={(e) => setCurrentExercise({
                                ...currentExercise,
                                correct_answer: e.target.value
                              })}
                              placeholder="Enter the correct answer..."
                              className="border-2 border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-xs h-8"
                            />
                          </div>
                          </div>
                        )}

                        {/* Points and Difficulty */}
                        <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-3 rounded-lg border border-rose-200">
                          <h3 className="text-sm font-semibold mb-2 text-rose-900">Exercise Settings</h3>
                          <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium mb-1 text-rose-800">Points</label>
                            <Input
                              type="number"
                              value={currentExercise.points}
                              onChange={(e) => setCurrentExercise({
                                ...currentExercise,
                                points: parseInt(e.target.value) || 10
                              })}
                              min={1}
                              max={100}
                              className="border-2 border-gray-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 text-xs h-8"
                            />
                          </div>
                          <div className="dropdown-container">
                            <label className="block text-xs font-medium mb-1 text-rose-800">Difficulty</label>
                            <Select
                              value={currentExercise.difficulty_level}
                              onValueChange={(value: any) => setCurrentExercise({
                                ...currentExercise,
                                difficulty_level: value
                              })}
                            >
                              <SelectTrigger className="w-full h-8 border-2 border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 bg-white text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-white border-2 border-gray-200 shadow-xl">
                                <SelectItem value="easy" className="hover:bg-rose-50 focus:bg-rose-50 text-gray-900 text-xs py-1">Easy</SelectItem>
                                <SelectItem value="medium" className="hover:bg-rose-50 focus:bg-rose-50 text-gray-900 text-xs py-1">Medium</SelectItem>
                                <SelectItem value="hard" className="hover:bg-rose-50 focus:bg-rose-50 text-gray-900 text-xs py-1">Hard</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                        {/* Hints */}
                        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-3 rounded-lg border border-cyan-200">
                          <h3 className="text-sm font-semibold mb-2 text-cyan-900">Hints (Optional)</h3>
                          <div className="space-y-2">
                          <div>
                            <label className="block text-xs font-medium mb-1 text-cyan-800">Hint (English)</label>
                            <Textarea
                              value={currentExercise.hints_en}
                              onChange={(e) => setCurrentExercise({
                                ...currentExercise,
                                hints_en: e.target.value
                              })}
                              placeholder="Helpful hint for students..."
                              rows={2}
                              className="border-2 border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-xs p-2 resize-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1 text-cyan-800">Hint (Khmer)</label>
                            <Textarea
                              value={currentExercise.hints_km}
                              onChange={(e) => setCurrentExercise({
                                ...currentExercise,
                                hints_km: e.target.value
                              })}
                              placeholder="ជំនួយសម្រាប់សិស្ស..."
                              className="font-hanuman border-2 border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-xs p-2 resize-none"
                              rows={2}
                            />
                          </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Action Buttons */}
                    <div className="flex justify-center gap-2 px-6 py-4 border-t bg-gray-50 flex-shrink-0">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowExerciseForm(false)}
                          className="px-4 py-1 text-xs border-2 hover:bg-gray-50"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          onClick={addExercise}
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-4 py-1 text-xs font-semibold"
                        >
                          Add Exercise
                        </Button>
                    </div>
                    </DialogContent>
                </Dialog>
              </TabsContent>

              <TabsContent value="instructions" className="space-y-6">
                <Card className="bg-white border border-gray-200 shadow-sm">
                  <CardHeader className="bg-gray-50 border-b border-gray-200">
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                      <BookOpen className="h-5 w-5 text-purple-600" />
                      Student Instructions
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Provide clear instructions for students on how to use the simulation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="instruction_content_en"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instructions (English)</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              rows={8}
                              placeholder="Step-by-step instructions for students..."
                              className="min-h-[200px]"
                            />
                          </FormControl>
                          <FormDescription>
                            Include step-by-step guidance and tips
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="instruction_content_km"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instructions (Khmer)</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              rows={8}
                              placeholder="ការណែនាំជាជំហាន់សម្រាប់សិស្ស..."
                              className="font-hanuman min-h-[200px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <Card className="bg-white border border-gray-200 shadow-sm">
                  <CardHeader className="bg-gray-50 border-b border-gray-200">
                    <CardTitle className="text-gray-900">URLs & Media</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="preview_image"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preview Image URL</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="/images/preview.png" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card className="bg-white border border-gray-200 shadow-sm">
                  <CardHeader className="bg-gray-50 border-b border-gray-200">
                    <CardTitle className="text-gray-900">Tags & Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <FormLabel>Tags</FormLabel>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                          placeholder="Add tag..."
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        />
                        <Button type="button" onClick={addTag}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {form.watch('tags')?.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            {tag}
                            <X
                              className="ml-1 h-3 w-3 cursor-pointer"
                              onClick={() => removeTag(index)}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="is_featured"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Featured Simulation</FormLabel>
                            <FormDescription>
                              Show this simulation prominently on the homepage
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="is_active"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Active</FormLabel>
                            <FormDescription>
                              Make this simulation available to students
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  {/* Status Selection */}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={currentStatus === 'draft' ? 'default' : 'outline'}
                      onClick={() => handleStatusChange('draft')}
                      className="flex-1 sm:flex-initial"
                    >
                      <Edit3 className="mr-2 h-4 w-4" />
                      Save as Draft
                    </Button>
                    <Button
                      type="button"
                      variant={currentStatus === 'review' ? 'default' : 'outline'}
                      onClick={() => handleStatusChange('review')}
                      className="flex-1 sm:flex-initial"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Submit for Review
                    </Button>
                    {user?.roles?.includes('admin') && (
                      <Button
                        type="button"
                        variant={currentStatus === 'published' ? 'default' : 'outline'}
                        onClick={() => handleStatusChange('published')}
                        className="flex-1 sm:flex-initial"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Publish
                      </Button>
                    )}
                  </div>

                  {/* Submit/Cancel */}
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/dashboard/simulations')}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={loading || fileUploading}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      {loading || fileUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {fileUploading ? 'Uploading...' : 'Creating...'}
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Create Simulation
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </Form>
          </div>
        </div>
      </div>

      {/* Hidden file input for bulk upload */}
      <input
        ref={bulkFileInputRef}
        type="file"
        accept=".json,.csv"
        onChange={handleBulkFileSelect}
        className="hidden"
      />

      {/* Bulk Upload Preview Modal */}
      {showBulkUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <CardHeader className="bg-blue-50 border-b border-blue-200">
              <CardTitle className="flex items-center justify-between">
                <span className="text-blue-900">Bulk Upload Preview</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBulkUpload(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
              <CardDescription>
                Review the exercises before importing. Found {bulkPreview.length} exercises.
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-y-auto max-h-[60vh] p-6">
              <div className="space-y-4">
                {bulkPreview.map((exercise, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">
                        Question {exercise.question_number || index + 1} - {exercise.question_type || 'multiple_choice'}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {exercise.points || 10} points
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="font-medium text-gray-700">English:</p>
                        <p className="text-gray-600">{exercise.question_en || 'No question provided'}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Khmer:</p>
                        <p className="text-gray-600">{exercise.question_km || 'No question provided'}</p>
                      </div>
                      {exercise.options_en && exercise.options_en.length > 0 && (
                        <div className="md:col-span-2">
                          <p className="font-medium text-gray-700 mb-1">Options:</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div>
                              {exercise.options_en.map((option: string, i: number) => (
                                <p key={i} className={`text-sm px-2 py-1 rounded ${
                                  option === exercise.correct_answer ? 'bg-green-100 text-green-800' : 'bg-white text-gray-600'
                                }`}>
                                  {String.fromCharCode(65 + i)}. {option}
                                </p>
                              ))}
                            </div>
                            <div>
                              {exercise.options_km && exercise.options_km.map((option: string, i: number) => (
                                <p key={i} className={`text-sm px-2 py-1 rounded ${
                                  exercise.options_en[i] === exercise.correct_answer ? 'bg-green-100 text-green-800' : 'bg-white text-gray-600'
                                }`}>
                                  {String.fromCharCode(65 + i)}. {option}
                                </p>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      {exercise.correct_answer && (
                        <div className="md:col-span-2">
                          <p className="font-medium text-gray-700">Correct Answer: 
                            <span className="font-normal text-green-600 ml-1">{exercise.correct_answer}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <div className="border-t border-gray-200 p-4 bg-gray-50 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {bulkPreview.length} exercises ready to import
              </div>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowBulkUpload(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={processBulkUpload}
                  disabled={bulkUploading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {bulkUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Import {bulkPreview.length} Exercises
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}