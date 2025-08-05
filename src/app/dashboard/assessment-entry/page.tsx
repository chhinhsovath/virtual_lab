'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Badge } from '../../../components/ui/badge';
import { toast } from 'sonner';
import ModernSidebar from '../../../components/dashboard/ModernSidebar';
import { LoadingSpinner } from '../../../components/ui/loading-spinner';
import { FileText, Save, Users, Bell, Menu, Calendar, Award, BookOpen, UserCheck, PenTool, ClipboardList, Sparkles, Trophy, Star } from 'lucide-react';
import { PageHeader } from '../../../components/dashboard/ui-components';
import * as design from '../../../components/dashboard/design-system';
import { cn } from '../../../lib/utils';
import { useLanguage } from '../../../components/LanguageProvider';

const assessmentSchema = z.object({
  studentId: z.string().min(1, 'Student required'),
  cycle: z.string().min(1, 'Cycle required'),
  levelAchieved: z.string().min(1, 'Level required'),
  assessmentDate: z.string().min(1, 'Date required'),
  notes: z.string().optional(),
});

type AssessmentFormData = z.infer<typeof assessmentSchema>;

interface Student {
  chiID: number;
  chiName: string;
  chiGender: string;
  chiClass: number;
}

interface User {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  roles: string[];
  permissions: string[];
  schoolAccess: Array<{
    schoolId: number;
    accessType: string;
    subject: string;
  }>;
  teacherId?: number;
  userId?: number;
  subject?: string;
}

export default function AssessmentEntryPage() {
  const [user, setUser] = useState<User | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const router = useRouter();
  const { t, getFontClass } = useLanguage();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<AssessmentFormData>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
      assessmentDate: new Date().toISOString().split('T')[0],
    },
  });

  const selectedStudentId = watch('studentId');
  const selectedCycle = watch('cycle');
  const selectedSubject = user?.subject;

  // Assessment levels based on subject
  const assessmentLevels = {
    Khmer: ['Beginner', 'Letter', 'Word', 'Paragraph', 'Story'],
    Math: ['Beginner', '1-Digit', '2-Digit', 'Subtraction', 'Advanced'],
  };

  const levelLabels: Record<string, { en: string; kh: string }> = {
    'Beginner': { en: 'Beginner', kh: 'ចាប់ផ្តើម' },
    'Letter': { en: 'Letter', kh: 'អក្សរ' },
    'Word': { en: 'Word', kh: 'ពាក្យ' },
    'Paragraph': { en: 'Paragraph', kh: 'កថាខណ្ឌ' },
    'Story': { en: 'Story', kh: 'រឿង' },
    '1-Digit': { en: '1-Digit', kh: 'ខ្ទង់តួ ១' },
    '2-Digit': { en: '2-Digit', kh: 'ខ្ទង់តួ ២' },
    'Subtraction': { en: 'Subtraction', kh: 'ការដក' },
    'Advanced': { en: 'Advanced', kh: 'កម្រិតខ្ពស់' },
  };

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const data = await response.json();
          const userData = data.user;
          
          // Check if user is a student and redirect to student portal
          if (userData.roles?.includes('student') || userData.role === 'student') {
            router.push('/student');
            return;
          }
          
          setUser(userData);
        } else {
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Session fetch error:', error);
        router.push('/auth/login');
      } finally {
        setSessionLoading(false);
      }
    };

    fetchSession();
  }, [router]);

  useEffect(() => {
    if (user) {
      fetchStudents();
    }
  }, [user]);

  const fetchStudents = async () => {
    if (!user?.schoolAccess?.length) return;

    setIsLoading(true);
    try {
      const firstSchoolId = user.schoolAccess[0]?.schoolId;
      if (!firstSchoolId) {
        toast.error(t('message.error'));
        return;
      }

      const response = await fetch(`/api/students/${firstSchoolId}`);
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students);
      } else {
        toast.error(t('message.error'));
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error(t('message.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      // Use window.location.href instead of router.push for complete session cleanup
      // This ensures we bypass Next.js client-side routing and force a full page reload
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect to home even if logout API fails to ensure user is logged out client-side
      window.location.href = '/';
    }
  };

  const onSubmit = async (data: AssessmentFormData) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: parseInt(data.studentId),
          teacherId: user.teacherId,
          schoolId: user.schoolAccess[0]?.schoolId,
          subject: user.subject,
          cycle: data.cycle,
          levelAchieved: data.levelAchieved,
          assessmentDate: data.assessmentDate,
          notes: data.notes,
        }),
      });

      if (response.ok) {
        toast.success(t('assessment.success'));
        reset({
          assessmentDate: new Date().toISOString().split('T')[0],
        });
      } else {
        const error = await response.json();
        toast.error(error.error || t('assessment.error'));
      }
    } catch (error) {
      console.error('Error saving assessment:', error);
      toast.error(t('assessment.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedStudent = students.find(s => s.chiID.toString() === selectedStudentId);
  const currentLevels = selectedSubject ? assessmentLevels[selectedSubject as keyof typeof assessmentLevels] : [];

  if (sessionLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className={cn("flex min-h-screen", design.gradients.sky)}>
      {/* Sidebar - handles both desktop and mobile */}
      <ModernSidebar 
        user={user} 
        onLogout={handleLogout} 
        mobileOpen={mobileMenuOpen}
        onMobileToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        onCollapsedChange={setSidebarCollapsed}
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-80'}`}>
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="icon" className="relative group hover:scale-105 transition-transform">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className={cn("flex-1 overflow-y-auto", design.spacing.page)}>
          <div className={design.spacing.section}>
            {/* Page Header with animations */}
            <PageHeader
              title={t('assessment.entry')}
              titleKm={t('assessment.entry')}
              description={`${t('assessment.entry')} ${user?.subject}`}
              actions={
                <div className="flex items-center gap-2">
                  <Badge className={cn(
                    "px-4 py-2 text-sm font-medium",
                    design.animations.fadeIn,
                    user?.subject === 'Khmer' ? design.gradients.primary : design.gradients.success
                  )}>
                    <BookOpen className="h-4 w-4 mr-2" />
                    {user?.subject}
                  </Badge>
                </div>
              }
            />

            {/* Assessment Form with animations */}
            <Card className={cn(
              design.cardVariants.colorful,
              design.animations.slideIn,
              "overflow-hidden"
            )}>
              <div className={cn(
                "h-2",
                design.gradients.rainbow
              )} />
              <CardHeader>
                <CardTitle className="flex items-center space-x-3 text-2xl">
                  <div className={cn(
                    "p-3 rounded-xl shadow-lg",
                    design.gradients.primary
                  )}>
                    <ClipboardList className="h-6 w-6 text-white" />
                  </div>
                  <span className={getFontClass()}>{t('assessment.new')}</span>
                  <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
                </CardTitle>
                <CardDescription className={`text-base mt-2 ${getFontClass()}`}>
                  {t('assessment.entry')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                  {/* Student and Cycle Selection Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Student Selection Card */}
                    <Card className={cn(
                      "border-2 border-blue-100 hover:border-blue-300 transition-all duration-300",
                      "hover:shadow-lg hover:scale-[1.02]",
                      design.animations.fadeIn
                    )}>
                      <CardContent className="pt-6">
                        <div className="flex items-center space-x-2 mb-4">
                          <div className="p-2 rounded-lg bg-blue-100">
                            <UserCheck className="h-5 w-5 text-blue-600" />
                          </div>
                          <Label htmlFor="studentId" className="text-lg font-semibold">
                            Select Student
                          </Label>
                          <Badge variant="destructive" className={`ml-auto ${getFontClass()}`}>{t('assessment.required')}</Badge>
                        </div>
                        <Select
                          value={selectedStudentId}
                          onValueChange={(value) => setValue('studentId', value)}
                        >
                          <SelectTrigger className="h-12 text-base hover:border-blue-400 transition-colors">
                            <SelectValue placeholder={t('assessment.choose_student')} />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                            {isLoading ? (
                              <div className="flex items-center justify-center p-4">
                                <LoadingSpinner />
                              </div>
                            ) : students.length === 0 ? (
                              <div className="p-4 text-center text-gray-500">
                                <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                <p className={getFontClass()}>{t('assessment.no_students')}</p>
                              </div>
                            ) : (
                              students.map((student) => (
                                <SelectItem 
                                  key={student.chiID} 
                                  value={student.chiID.toString()}
                                  className="py-3 hover:bg-blue-50"
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className={cn(
                                      "w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold",
                                      student.chiGender === 'M' ? 'bg-blue-500' : 'bg-pink-500'
                                    )}>
                                      {student.chiName.charAt(0)}
                                    </div>
                                    <div>
                                      <p className="font-medium">{student.chiName}</p>
                                      <p className={`text-sm text-gray-500 ${getFontClass()}`}>
                                        {t('assessment.grade')} {student.chiClass} • {student.chiGender === 'M' ? t('assessment.male') : t('assessment.female')}
                                      </p>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        {errors.studentId && (
                          <p className="text-sm text-red-600 mt-2 flex items-center">
                            <span className="inline-block w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                            {errors.studentId.message}
                          </p>
                        )}
                      </CardContent>
                    </Card>

                    {/* Cycle Selection Card */}
                    <Card className={cn(
                      "border-2 border-purple-100 hover:border-purple-300 transition-all duration-300",
                      "hover:shadow-lg hover:scale-[1.02]",
                      design.animations.fadeIn
                    )}>
                      <CardContent className="pt-6">
                        <div className="flex items-center space-x-2 mb-4">
                          <div className="p-2 rounded-lg bg-purple-100">
                            <Calendar className="h-5 w-5 text-purple-600" />
                          </div>
                          <Label htmlFor="cycle" className={`text-lg font-semibold ${getFontClass()}`}>
                            {t('assessment.cycle')}
                          </Label>
                          <Badge variant="destructive" className={`ml-auto ${getFontClass()}`}>{t('assessment.required')}</Badge>
                        </div>
                        <Select
                          value={selectedCycle}
                          onValueChange={(value) => setValue('cycle', value)}
                        >
                          <SelectTrigger className="h-12 text-base hover:border-purple-400 transition-colors">
                            <SelectValue placeholder={t('assessment.choose_cycle')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Baseline" className="py-3 hover:bg-purple-50">
                              <div className="flex items-center space-x-3">
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                <div>
                                  <p className={`font-medium ${getFontClass()}`}>{t('assessment.baseline')}</p>
                                  <p className={`text-sm text-gray-500 ${getFontClass()}`}>{t('assessment.baseline_desc')}</p>
                                </div>
                              </div>
                            </SelectItem>
                            <SelectItem value="Midline" className="py-3 hover:bg-purple-50">
                              <div className="flex items-center space-x-3">
                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                <div>
                                  <p className={`font-medium ${getFontClass()}`}>{t('assessment.midline')}</p>
                                  <p className={`text-sm text-gray-500 ${getFontClass()}`}>{t('assessment.midline_desc')}</p>
                                </div>
                              </div>
                            </SelectItem>
                            <SelectItem value="Endline" className="py-3 hover:bg-purple-50">
                              <div className="flex items-center space-x-3">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <div>
                                  <p className={`font-medium ${getFontClass()}`}>{t('assessment.endline')}</p>
                                  <p className={`text-sm text-gray-500 ${getFontClass()}`}>{t('assessment.endline_desc')}</p>
                                </div>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.cycle && (
                          <p className="text-sm text-red-600 mt-2 flex items-center">
                            <span className="inline-block w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                            {errors.cycle.message}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Subject and Level Selection */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Subject Display Card */}
                    <Card className={cn(
                      "border-2 border-green-100",
                      design.animations.fadeIn
                    )}>
                      <CardContent className="pt-6">
                        <div className="flex items-center space-x-2 mb-4">
                          <div className="p-2 rounded-lg bg-green-100">
                            <BookOpen className="h-5 w-5 text-green-600" />
                          </div>
                          <Label className={`text-lg font-semibold ${getFontClass()}`}>{t('assessment.subject')}</Label>
                        </div>
                        <div className={cn(
                          "p-4 rounded-xl text-center",
                          user?.subject === 'Khmer' ? design.gradients.primary : design.gradients.success,
                          "text-white"
                        )}>
                          <p className="text-2xl font-bold mb-1">{user?.subject}</p>
                          <p className="font-khmer text-lg opacity-90">
                            {user?.subject === 'Khmer' ? 'ភាសាខ្មែរ' : 'គណិតវិទ្យា'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Level Achievement Card */}
                    <Card className={cn(
                      "border-2 border-orange-100 hover:border-orange-300 transition-all duration-300",
                      "hover:shadow-lg hover:scale-[1.02]",
                      design.animations.fadeIn
                    )}>
                      <CardContent className="pt-6">
                        <div className="flex items-center space-x-2 mb-4">
                          <div className="p-2 rounded-lg bg-orange-100">
                            <Trophy className="h-5 w-5 text-orange-600" />
                          </div>
                          <Label htmlFor="levelAchieved" className={`text-lg font-semibold ${getFontClass()}`}>
                            {t('assessment.level_achieved')}
                          </Label>
                          <Badge variant="destructive" className={`ml-auto ${getFontClass()}`}>{t('assessment.required')}</Badge>
                        </div>
                        <Select
                          value={watch('levelAchieved')}
                          onValueChange={(value) => setValue('levelAchieved', value)}
                        >
                          <SelectTrigger className="h-12 text-base hover:border-orange-400 transition-colors">
                            <SelectValue placeholder={t('assessment.select_level')} />
                          </SelectTrigger>
                          <SelectContent>
                            {currentLevels.map((level, index) => {
                              const levelLabel = levelLabels[level] || { en: level, kh: level };
                              const levelColors = [
                                'bg-gray-100 text-gray-700',
                                'bg-blue-100 text-blue-700',
                                'bg-purple-100 text-purple-700',
                                'bg-green-100 text-green-700',
                                'bg-orange-100 text-orange-700'
                              ];
                              const levelIcons = [
                                '🌱', '📝', '📖', '📚', '🏆'
                              ];
                              
                              return (
                                <SelectItem key={level} value={level} className="py-3 hover:bg-orange-50">
                                  <div className="flex items-center space-x-3">
                                    <div className={cn(
                                      "w-10 h-10 rounded-lg flex items-center justify-center text-lg",
                                      levelColors[index]
                                    )}>
                                      {levelIcons[index]}
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-medium">{levelLabel.en}</p>
                                      <p className="font-khmer text-sm text-gray-500">
                                        {levelLabel.kh}
                                      </p>
                                    </div>
                                    <div className="flex space-x-1">
                                      {[...Array(index + 1)].map((_, i) => (
                                        <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                      ))}
                                    </div>
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        {errors.levelAchieved && (
                          <p className="text-sm text-red-600 mt-2 flex items-center">
                            <span className="inline-block w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                            {errors.levelAchieved.message}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Assessment Date and Notes Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Assessment Date Card */}
                    <Card className={cn(
                      "border-2 border-teal-100 hover:border-teal-300 transition-all duration-300",
                      "hover:shadow-lg hover:scale-[1.02]",
                      design.animations.fadeIn
                    )}>
                      <CardContent className="pt-6">
                        <div className="flex items-center space-x-2 mb-4">
                          <div className="p-2 rounded-lg bg-teal-100">
                            <Calendar className="h-5 w-5 text-teal-600" />
                          </div>
                          <Label htmlFor="assessmentDate" className={`text-lg font-semibold ${getFontClass()}`}>
                            {t('assessment.date')}
                          </Label>
                          <Badge variant="destructive" className={`ml-auto ${getFontClass()}`}>{t('assessment.required')}</Badge>
                        </div>
                        <Input
                          id="assessmentDate"
                          type="date"
                          className="h-12 text-base hover:border-teal-400 transition-colors"
                          {...register('assessmentDate')}
                        />
                        {errors.assessmentDate && (
                          <p className="text-sm text-red-600 mt-2 flex items-center">
                            <span className="inline-block w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                            {errors.assessmentDate.message}
                          </p>
                        )}
                      </CardContent>
                    </Card>

                    {/* Notes Card */}
                    <Card className={cn(
                      "border-2 border-pink-100 hover:border-pink-300 transition-all duration-300",
                      "hover:shadow-lg",
                      design.animations.fadeIn
                    )}>
                      <CardContent className="pt-6">
                        <div className="flex items-center space-x-2 mb-4">
                          <div className="p-2 rounded-lg bg-pink-100">
                            <PenTool className="h-5 w-5 text-pink-600" />
                          </div>
                          <Label htmlFor="notes" className={`text-lg font-semibold ${getFontClass()}`}>
                            {t('assessment.notes')}
                          </Label>
                          <Badge variant="secondary" className="ml-auto">Optional</Badge>
                        </div>
                        <Textarea
                          id="notes"
                          placeholder={t('assessment.notes_placeholder')}
                          className="min-h-[100px] text-base hover:border-pink-400 transition-colors resize-none"
                          {...register('notes')}
                        />
                      </CardContent>
                    </Card>
                  </div>

                  {/* Selected Student Info - Enhanced */}
                  {selectedStudent && (
                    <Card className={cn(
                      "border-2 border-transparent",
                      design.gradients.primary,
                      design.animations.slideInRight,
                      "transform hover:scale-[1.01] transition-all duration-300"
                    )}>
                      <CardContent className="pt-6">
                        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className={cn(
                                "p-3 rounded-full shadow-lg",
                                selectedStudent.chiGender === 'M' ? 'bg-blue-500' : 'bg-pink-500'
                              )}>
                                <UserCheck className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-gray-900">Selected Student</h3>
                                <p className="text-sm text-gray-600">Ready for assessment</p>
                              </div>
                            </div>
                            <div className="flex space-x-1">
                              {[...Array(3)].map((_, i) => (
                                <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                              ))}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-gray-50 rounded-lg p-3 text-center">
                              <p className="text-sm text-gray-600 mb-1">Name</p>
                              <p className="font-semibold text-gray-900">{selectedStudent.chiName}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3 text-center">
                              <p className="text-sm text-gray-600 mb-1">Grade</p>
                              <p className="font-semibold text-gray-900">Grade {selectedStudent.chiClass}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3 text-center">
                              <p className="text-sm text-gray-600 mb-1">Gender</p>
                              <p className="font-semibold text-gray-900">
                                {selectedStudent.chiGender === 'M' ? 'Male' : 'Female'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Submit Button - Enhanced */}
                  <div className="flex flex-col sm:flex-row justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => reset({
                        assessmentDate: new Date().toISOString().split('T')[0],
                      })}
                      className="hover:bg-gray-100 transition-colors"
                    >
                      Clear Form
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className={cn(
                        "min-w-[200px]",
                        design.buttonVariants.success,
                        "flex items-center justify-center space-x-2"
                      )}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Saving Assessment...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5" />
                          <span>Save Assessment</span>
                          <Sparkles className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}