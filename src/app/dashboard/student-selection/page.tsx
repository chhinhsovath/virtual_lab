'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Label } from '../../../components/ui/label';
import { toast } from 'sonner';
import ModernSidebar from '../../../components/dashboard/ModernSidebar';
import { LoadingSpinner } from '../../../components/ui/loading-spinner';
import { 
  Users, 
  Save, 
  Target, 
  Filter, 
  Bell, 
  Menu, 
  GraduationCap, 
  Trophy, 
  Sparkles, 
  Star, 
  UserPlus, 
  Zap,
  Heart,
  BookOpen,
  Award,
  Info
} from 'lucide-react';
import { PageHeader, StatCard } from '../../../components/dashboard/ui-components';
import * as design from '../../../components/dashboard/design-system';
import { cn } from '../../../lib/utils';
import { useLanguage } from '../../../components/LanguageProvider';

interface Student {
  chiID: number;
  chiName: string;
  chiGender: string;
  chiClass: number;
  baselineLevel?: string;
  alreadySelected?: boolean;
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
  schoolIds?: number[];
}

export default function StudentSelectionPage() {
  const [user, setUser] = useState<User | null>(null);
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const router = useRouter();
  const { t, getFontClass, language } = useLanguage();

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
      fetchStudentsWithBaseline();
    }
  }, [user]);

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

  const fetchStudentsWithBaseline = async () => {
    if (!user?.schoolAccess?.length && !user?.schoolIds?.length) return;

    setIsLoading(true);
    try {
      const schoolId = user.schoolAccess?.[0]?.schoolId || user.schoolIds?.[0];
      if (!schoolId) {
        toast.error('No school access found');
        return;
      }

      // Get students with their baseline assessments
      const response = await fetch(
        `/api/students/baseline/${schoolId}?subject=${user.subject}`
      );
      
      if (response.ok) {
        const data = await response.json();
        
        // Separate students into available and already selected
        const available = data.students.filter((s: Student) => !s.alreadySelected);
        const selected = data.students.filter((s: Student) => s.alreadySelected);
        
        setAvailableStudents(available);
        setSelectedStudents(selected);
      } else {
        toast.error('Failed to load students');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Error loading students');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const studentId = parseInt(draggableId);
    let student: Student | undefined;

    // Find the student being moved
    if (source.droppableId === 'available') {
      student = availableStudents.find(s => s.chiID === studentId);
    } else {
      student = selectedStudents.find(s => s.chiID === studentId);
    }

    if (!student) return;

    // Remove from source
    if (source.droppableId === 'available') {
      setAvailableStudents(prev => prev.filter(s => s.chiID !== studentId));
    } else {
      setSelectedStudents(prev => prev.filter(s => s.chiID !== studentId));
    }

    // Add to destination
    if (destination.droppableId === 'available') {
      setAvailableStudents(prev => {
        const newList = [...prev];
        newList.splice(destination.index, 0, student!);
        return newList;
      });
    } else {
      setSelectedStudents(prev => {
        const newList = [...prev];
        newList.splice(destination.index, 0, student!);
        return newList;
      });
    }
  };

  const handleSaveSelection = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const selectedIds = selectedStudents.map(s => s.chiID);
      
      const response = await fetch('/api/students/select', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentIds: selectedIds,
          schoolId: user.schoolAccess?.[0]?.schoolId || user.schoolIds?.[0],
          subject: user.subject,
        }),
      });

      if (response.ok) {
        toast.success(t('selection.saved'));
        fetchStudentsWithBaseline(); // Refresh data
      } else {
        const error = await response.json();
        toast.error(error.error || t('selection.error'));
      }
    } catch (error) {
      console.error('Error saving selection:', error);
      toast.error(t('selection.error'));
    } finally {
      setIsSaving(false);
    }
  };

  const filteredAvailableStudents = availableStudents.filter(student => {
    const gradeMatch = filterGrade === 'all' || student.chiClass.toString() === filterGrade;
    const levelMatch = filterLevel === 'all' || student.baselineLevel === filterLevel;
    return gradeMatch && levelMatch;
  });

  const StudentCard = ({ student }: { student: Student }) => {
    const levelColors = {
      'Beginner': 'bg-gray-100 text-gray-700 border-gray-300',
      'Letter': 'bg-blue-100 text-blue-700 border-blue-300',
      'Word': 'bg-purple-100 text-purple-700 border-purple-300',
      'Paragraph': 'bg-green-100 text-green-700 border-green-300',
      'Story': 'bg-orange-100 text-orange-700 border-orange-300',
      '1-Digit': 'bg-teal-100 text-teal-700 border-teal-300',
      '2-Digit': 'bg-indigo-100 text-indigo-700 border-indigo-300',
      'Subtraction': 'bg-pink-100 text-pink-700 border-pink-300',
      'Advanced': 'bg-red-100 text-red-700 border-red-300',
    };

    const genderColors = {
      'M': 'bg-blue-500',
      'F': 'bg-pink-500'
    };

    return (
      <div className={cn(
        "p-4 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300",
        "border-2 border-transparent hover:border-purple-300",
        "transform hover:scale-[1.02]"
      )}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md",
              genderColors[student.chiGender as keyof typeof genderColors] || 'bg-gray-500'
            )}>
              {student.chiName.charAt(0)}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{student.chiName}</h4>
              <p className="text-sm text-gray-600">
                {student.chiGender === 'M' ? `👦 ${t('assessment.male')}` : `👧 ${t('assessment.female')}`}
              </p>
            </div>
          </div>
          <Badge className={cn(
            "px-3 py-1 font-medium",
            design.gradients.primary,
            "text-white border-0"
          )}>
            <GraduationCap className="h-3 w-3 mr-1" />
            Grade {student.chiClass}
          </Badge>
        </div>
        {student.baselineLevel && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">Baseline Level:</span>
            </div>
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs font-medium border",
                levelColors[student.baselineLevel as keyof typeof levelColors] || 'bg-gray-100'
              )}
            >
              {levelLabels[student.baselineLevel]?.en || student.baselineLevel}
            </Badge>
          </div>
        )}
        {student.baselineLevel && (
          <div className="mt-2 text-center">
            <p className="font-khmer text-xs text-gray-600">
              {levelLabels[student.baselineLevel]?.kh}
            </p>
          </div>
        )}
      </div>
    );
  };

  if (sessionLoading || isLoading) {
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
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 px-4 md:px-6 py-4">
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
              <Button variant="outline" size="icon" className={cn("relative", design.cardVariants.glass)}>
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
              title={t('selection.title')}
              titleKm={t('selection.title')}
              description={t('selection.description') + ' 🚀'}
              actions={
                <Badge className={cn(
                  "px-4 py-2 text-sm font-medium",
                  design.animations.pulse,
                  design.gradients.secondary
                )}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  {selectedStudents.length} / 20 {t('selection.selected')}
                </Badge>
              }
            />

            {/* Stats Cards */}
            <div className={design.grids.stats}>
              <StatCard
                title={t('selection.available')}
                value={availableStudents.length}
                description={t('selection.available')}
                icon={Users}
                color="primary"
                gradient={true}
                trend="neutral"
                trendValue={`${filteredAvailableStudents.length} filtered`}
              />
              <StatCard
                title={t('selection.selected')}
                value={selectedStudents.length}
                description={t('selection.selected')}
                icon={Target}
                color="success"
                gradient={true}
              />
              <StatCard
                title={t('selection.max_students')}
                value="20"
                description={t('selection.max_students')}
                icon={Award}
                color="warning"
                gradient={true}
              />
              <StatCard
                title={t('assessment.subject')}
                value={user?.subject || 'N/A'}
                description={t('assessment.subject')}
                icon={BookOpen}
                color="secondary"
                gradient={true}
              />
            </div>

            {/* Filters with colorful design */}
            <Card className={cn(design.cardVariants.colorful, "overflow-hidden")}>
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 pb-6">
                <CardTitle className="flex items-center space-x-3">
                  <div className={cn("p-2 rounded-xl", design.gradients.secondary)}>
                    <Filter className="h-5 w-5 text-white" />
                  </div>
                  <span className={`text-xl ${getFontClass()}`}>{t('ui.filter')}</span>
                  <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
                </CardTitle>
                <CardDescription>
                  {t('selection.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="flex items-center space-x-2 text-sm font-medium">
                      <GraduationCap className="h-4 w-4 text-orange-500" />
                      <span className={getFontClass()}>{t('selection.filter_grade')}</span>
                    </Label>
                    <Select value={filterGrade} onValueChange={setFilterGrade}>
                      <SelectTrigger className="h-12 border-2 hover:border-orange-300 transition-colors">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                            <span className={getFontClass()}>{t('selection.all_grades')}</span>
                          </div>
                        </SelectItem>
                        {[3, 4, 5, 6].map((grade) => (
                          <SelectItem key={grade} value={grade.toString()}>
                            <div className="flex items-center space-x-2">
                              <div className={cn(
                                "w-2 h-2 rounded-full",
                                grade === 3 ? "bg-blue-500" :
                                grade === 4 ? "bg-green-500" :
                                grade === 5 ? "bg-purple-500" :
                                "bg-orange-500"
                              )}></div>
                              <span className={getFontClass()}>{t('assessment.grade')} {grade}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center space-x-2 text-sm font-medium">
                      <Trophy className="h-4 w-4 text-green-500" />
                      <span className={getFontClass()}>{t('selection.filter_level')}</span>
                    </Label>
                    <Select value={filterLevel} onValueChange={setFilterLevel}>
                      <SelectTrigger className="h-12 border-2 hover:border-green-300 transition-colors">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          <div className="flex items-center space-x-2">
                            <Star className="h-4 w-4 text-gray-400" />
                            <span className={getFontClass()}>{t('selection.all_levels')}</span>
                          </div>
                        </SelectItem>
                        {Object.entries(levelLabels).map(([level, labels]) => (
                          <SelectItem key={level} value={level}>
                            <div className="flex items-center justify-between w-full">
                              <span className={getFontClass()}>{language === 'km' ? labels.kh : labels.en}</span>
                              <span className={`text-xs text-gray-500 ml-2 ${getFontClass()}`}>{language === 'km' ? labels.en : labels.kh}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Active Filters Display */}
                {(filterGrade !== 'all' || filterLevel !== 'all') && (
                  <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Zap className="h-4 w-4 text-purple-500" />
                        <span className={`text-sm font-medium text-purple-700 ${getFontClass()}`}>{t('ui.filter')}:</span>
                        <div className="flex flex-wrap gap-2">
                          {filterGrade !== 'all' && (
                            <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                              Grade {filterGrade}
                            </Badge>
                          )}
                          {filterLevel !== 'all' && (
                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                              {levelLabels[filterLevel]?.en}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFilterGrade('all');
                          setFilterLevel('all');
                        }}
                        className="text-purple-600 hover:text-purple-700"
                      >
                        Clear all
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Selection Interface with enhanced visuals */}
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Available Students */}
                <Card className={cn(design.cardVariants.colorful, "overflow-hidden")}>
                  <div className={cn("h-2", design.gradients.primary)} />
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-xl bg-blue-100">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <span className="text-xl">Available Students</span>
                          <p className="text-sm text-gray-600 font-normal mt-1">
                            Drag students to select them 👉
                          </p>
                        </div>
                      </div>
                      <Badge className="px-3 py-1 bg-blue-100 text-blue-700 border-blue-200">
                        {filteredAvailableStudents.length} students
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Droppable droppableId="available">
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={cn(
                            "min-h-[400px] p-4 rounded-xl border-3 border-dashed transition-all duration-300",
                            "space-y-3 overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-purple-50",
                            snapshot.isDraggingOver
                              ? 'border-blue-400 bg-blue-50/50 shadow-inner'
                              : 'border-gray-300 bg-gray-50/50'
                          )}
                        >
                          {filteredAvailableStudents.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16">
                              <div className={cn(
                                "p-4 rounded-full mb-4",
                                design.gradients.secondary
                              )}>
                                <Users className="h-12 w-12 text-white" />
                              </div>
                              <p className="text-gray-600 font-medium">No students available</p>
                              <p className="text-sm text-gray-500 mt-1">Try adjusting your filters</p>
                            </div>
                          ) : (
                            filteredAvailableStudents.map((student, index) => (
                              <Draggable
                                key={student.chiID}
                                draggableId={student.chiID.toString()}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={cn(
                                      "cursor-move transition-all duration-200",
                                      snapshot.isDragging && "rotate-2 scale-105 opacity-90",
                                      design.animations.fadeIn
                                    )}
                                    style={{
                                      ...provided.draggableProps.style,
                                      animationDelay: `${index * 50}ms`
                                    }}
                                  >
                                    <StudentCard student={student} />
                                  </div>
                                )}
                              </Draggable>
                            ))
                          )}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </CardContent>
                </Card>

                {/* Selected Students */}
                <Card className={cn(design.cardVariants.colorful, "overflow-hidden")}>
                  <div className={cn("h-2", design.gradients.success)} />
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-xl bg-green-100">
                          <Target className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <span className="text-xl">Selected for STEM</span>
                          <p className="text-sm text-gray-600 font-normal mt-1">
                            Your chosen champions! 🌟
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={cn(
                          "px-3 py-1",
                          selectedStudents.length >= 20 
                            ? "bg-red-100 text-red-700 border-red-200" 
                            : "bg-green-100 text-green-700 border-green-200"
                        )}>
                          {selectedStudents.length} / 20
                        </Badge>
                        {selectedStudents.length >= 20 && (
                          <span className="text-xs text-red-600 font-medium">Full!</span>
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Droppable droppableId="selected">
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={cn(
                            "min-h-[400px] p-4 rounded-xl border-3 border-dashed transition-all duration-300",
                            "space-y-3 overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-green-300 scrollbar-track-green-50",
                            snapshot.isDraggingOver
                              ? 'border-green-400 bg-green-50/50 shadow-inner'
                              : 'border-green-300 bg-green-50/30',
                            selectedStudents.length >= 20 && "border-red-300 bg-red-50/30"
                          )}
                        >
                          {selectedStudents.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16">
                              <div className={cn(
                                "p-4 rounded-full mb-4 animate-pulse",
                                design.gradients.success
                              )}>
                                <Heart className="h-12 w-12 text-white" />
                              </div>
                              <p className="text-gray-600 font-medium">Drop students here!</p>
                              <p className="font-khmer text-sm text-gray-500 mt-1">
                                អូសសិស្សមកទីនេះដើម្បីជ្រើសរើស
                              </p>
                              <div className="flex space-x-1 mt-3">
                                {[...Array(3)].map((_, i) => (
                                  <Star key={i} className="h-4 w-4 text-yellow-400 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                                ))}
                              </div>
                            </div>
                          ) : (
                            selectedStudents.map((student, index) => (
                              <Draggable
                                key={student.chiID}
                                draggableId={student.chiID.toString()}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={cn(
                                      "cursor-move transition-all duration-200",
                                      snapshot.isDragging && "rotate-2 scale-105 opacity-90",
                                      design.animations.fadeIn
                                    )}
                                    style={{
                                      ...provided.draggableProps.style,
                                      animationDelay: `${index * 50}ms`
                                    }}
                                  >
                                    <StudentCard student={student} />
                                  </div>
                                )}
                              </Draggable>
                            ))
                          )}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </CardContent>
                </Card>
              </div>
            </DragDropContext>

            {/* Save Button Section */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-white rounded-xl shadow-lg">
              <div className="flex items-center space-x-3">
                <div className={cn("p-3 rounded-xl", design.gradients.warning)}>
                  <Info className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Ready to save?</p>
                  <p className="text-sm text-gray-600">
                    You've selected {selectedStudents.length} amazing students for STEM!
                  </p>
                </div>
              </div>
              <Button
                onClick={handleSaveSelection}
                disabled={isSaving || selectedStudents.length === 0}
                className={cn(
                  "min-w-[200px]",
                  design.buttonVariants.success,
                  "flex items-center justify-center space-x-2"
                )}
                size="lg"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving your selection...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    <span>Save Selection</span>
                    <Badge variant="secondary" className="ml-2 bg-white/20 text-white border-0">
                      {selectedStudents.length}
                    </Badge>
                  </>
                )}
              </Button>
            </div>

            {/* Instructions Card with fun design */}
            <Card className={cn(
              design.cardVariants.colorful,
              "overflow-hidden border-2 border-purple-200"
            )}>
              <div className={cn(
                "h-1",
                design.gradients.rainbow
              )} />
              <CardHeader className="bg-gradient-to-br from-purple-50 to-pink-50">
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-purple-100">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                  </div>
                  <span>How to Select Students</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-lg bg-blue-100 mt-1">
                        <span className="block text-lg">1️⃣</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Filter Students</p>
                        <p className="text-sm text-gray-600">
                          Use grade and level filters to find the right students
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-lg bg-green-100 mt-1">
                        <span className="block text-lg">2️⃣</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Drag & Drop</p>
                        <p className="text-sm text-gray-600">
                          Drag students from left to right to select them
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-lg bg-purple-100 mt-1">
                        <span className="block text-lg">3️⃣</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Check Baseline</p>
                        <p className="text-sm text-gray-600">
                          Each student shows their baseline assessment level
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-lg bg-orange-100 mt-1">
                        <span className="block text-lg">4️⃣</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Save Selection</p>
                        <p className="text-sm text-gray-600">
                          Click save when you've selected up to 20 students
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="font-khmer text-sm text-purple-700 text-center">
                    អូសសិស្សពីខាងឆ្វេងទៅខាងស្តាំដើម្បីជ្រើសរើសពួកគេសម្រាប់កម្មវិធី Cambodia Virtual Lab STEM 🚀
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}