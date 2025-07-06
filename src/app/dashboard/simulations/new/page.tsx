'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, Plus, X, Loader2, Menu, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import ModernSidebar from '@/components/dashboard/ModernSidebar';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

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
});

type FormData = z.infer<typeof formSchema>;

export default function NewSimulationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [newObjectiveEn, setNewObjectiveEn] = useState('');
  const [newObjectiveKm, setNewObjectiveKm] = useState('');
  const [newTag, setNewTag] = useState('');

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
          // Ensure user has the expected structure
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
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const response = await fetch('/api/simulations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Simulation created successfully!');
        router.push('/dashboard/simulations');
      } else {
        toast.error(result.error || 'Failed to create simulation');
      }
    } catch (error) {
      console.error('Error creating simulation:', error);
      toast.error('Failed to create simulation');
    } finally {
      setLoading(false);
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

  if (userLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <ModernSidebar 
        user={user} 
        onLogout={handleLogout}
        mobileOpen={mobileMenuOpen}
        onMobileToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        onCollapsedChange={setSidebarCollapsed}
      />
      
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-80'}`}>
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm shadow-sm px-4 sm:px-6 lg:px-8 py-4 sticky top-0 z-40">
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

        <div className="p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <div className="mb-6">
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard/simulations')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Simulations
              </Button>
            </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic" className="text-xs sm:text-sm">Basic Info</TabsTrigger>
                <TabsTrigger value="content" className="text-xs sm:text-sm">Content</TabsTrigger>
                <TabsTrigger value="settings" className="text-xs sm:text-sm">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>Enter the basic details of your simulation</CardDescription>
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
              </TabsContent>

              <TabsContent value="content" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
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

                <Card>
                  <CardHeader>
                    <CardTitle>Learning Objectives</CardTitle>
                    <CardDescription>What will students learn from this simulation?</CardDescription>
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

              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>URLs & Media</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                            URL to the simulation
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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

                <Card>
                  <CardHeader>
                    <CardTitle>Tags & Settings</CardTitle>
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

            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/simulations')}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 w-full sm:w-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Simulation
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
          </div>
        </div>
      </div>
    </div>
  );
}