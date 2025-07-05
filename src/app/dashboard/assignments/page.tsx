'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus,
  BookOpen,
  Calendar as CalendarIcon,
  Clock,
  Users,
  FileText,
  Eye,
  Edit,
  Trash,
  Copy,
  MoreVertical,
  AlertCircle,
  CheckCircle,
  Send,
  ArrowLeft,
  Target,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Assignment {
  id: string;
  title: string;
  description: string;
  simulation_id: string;
  simulation_name: string;
  class_ids: string[];
  class_names: string[];
  due_date: string;
  created_at: string;
  status: 'active' | 'draft' | 'completed';
  total_students: number;
  submitted_count: number;
  graded_count: number;
  average_score: number;
  instructions?: string;
  resources?: string[];
}

interface Simulation {
  id: string;
  name: string;
  display_name_en: string;
  display_name_km: string;
  subject_area: string;
  difficulty_level: string;
  estimated_duration: number;
}

interface Class {
  id: string;
  name: string;
  student_count: number;
}

export default function AssignmentManagementPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedTab, setSelectedTab] = useState('active');
  const [filterClass, setFilterClass] = useState('all');
  const router = useRouter();

  // Form state for new assignment
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    simulation_id: '',
    class_ids: [] as string[],
    due_date: new Date(),
    instructions: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Mock data - replace with actual API calls
        const mockAssignments: Assignment[] = [
          {
            id: '1',
            title: 'Physics Pendulum Lab Assignment',
            description: 'Complete the pendulum simulation and answer all exercises',
            simulation_id: 'sim1',
            simulation_name: 'Physics Pendulum Lab',
            class_ids: ['class1', 'class2'],
            class_names: ['Class 10A', 'Class 10B'],
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'active',
            total_students: 64,
            submitted_count: 45,
            graded_count: 38,
            average_score: 78.5,
            instructions: 'Please complete all exercises and submit by the due date.'
          },
          {
            id: '2',
            title: 'Chemical Reactions Practice',
            description: 'Explore chemical reactions through interactive simulations',
            simulation_id: 'sim2',
            simulation_name: 'Chemical Reactions',
            class_ids: ['class1'],
            class_names: ['Class 10A'],
            due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'active',
            total_students: 32,
            submitted_count: 28,
            graded_count: 28,
            average_score: 82.3
          }
        ];

        const mockSimulations: Simulation[] = [
          {
            id: 'sim1',
            name: 'pendulum_lab',
            display_name_en: 'Physics Pendulum Lab',
            display_name_km: 'មន្ទីរពិសោធន៍ប៉ង់ឌុលរូបវិទ្យា',
            subject_area: 'Physics',
            difficulty_level: 'Intermediate',
            estimated_duration: 30
          },
          {
            id: 'sim2',
            name: 'chemical_reactions',
            display_name_en: 'Chemical Reactions',
            display_name_km: 'ប្រតិកម្មគីមី',
            subject_area: 'Chemistry',
            difficulty_level: 'Beginner',
            estimated_duration: 25
          }
        ];

        const mockClasses: Class[] = [
          { id: 'class1', name: 'Class 10A', student_count: 32 },
          { id: 'class2', name: 'Class 10B', student_count: 30 },
          { id: 'class3', name: 'Class 10C', student_count: 28 }
        ];

        setAssignments(mockAssignments);
        setSimulations(mockSimulations);
        setClasses(mockClasses);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredAssignments = assignments.filter(assignment => {
    if (selectedTab === 'active' && assignment.status !== 'active') return false;
    if (selectedTab === 'draft' && assignment.status !== 'draft') return false;
    if (selectedTab === 'completed' && assignment.status !== 'completed') return false;
    
    if (filterClass !== 'all' && !assignment.class_ids.includes(filterClass)) return false;
    
    return true;
  });

  const createAssignment = async () => {
    try {
      // API call would go here
      toast.success('Assignment created successfully!');
      setShowCreateDialog(false);
      // Reset form
      setNewAssignment({
        title: '',
        description: '',
        simulation_id: '',
        class_ids: [],
        due_date: new Date(),
        instructions: ''
      });
    } catch (error) {
      toast.error('Failed to create assignment');
    }
  };

  const deleteAssignment = async (id: string) => {
    if (confirm('Are you sure you want to delete this assignment?')) {
      try {
        // API call would go here
        setAssignments(assignments.filter(a => a.id !== id));
        toast.success('Assignment deleted successfully');
      } catch (error) {
        toast.error('Failed to delete assignment');
      }
    }
  };

  const duplicateAssignment = (assignment: Assignment) => {
    setNewAssignment({
      title: `${assignment.title} (Copy)`,
      description: assignment.description,
      simulation_id: assignment.simulation_id,
      class_ids: [],
      due_date: new Date(),
      instructions: assignment.instructions || ''
    });
    setShowCreateDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCompletionRate = (submitted: number, total: number) => {
    return total > 0 ? Math.round((submitted / total) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-blue-700 font-medium">Loading assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/dashboard')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Assignment Management</h1>
                <p className="text-gray-600 mt-1">
                  Create and manage assignments for your classes
                </p>
              </div>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Assignment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Assignment</DialogTitle>
                  <DialogDescription>
                    Create a new simulation assignment for your students
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      placeholder="Assignment title"
                      value={newAssignment.title}
                      onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      placeholder="Brief description of the assignment"
                      value={newAssignment.description}
                      onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Simulation</label>
                    <Select
                      value={newAssignment.simulation_id}
                      onValueChange={(value) => setNewAssignment({ ...newAssignment, simulation_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a simulation" />
                      </SelectTrigger>
                      <SelectContent>
                        {simulations.map(sim => (
                          <SelectItem key={sim.id} value={sim.id}>
                            {sim.display_name_en} ({sim.subject_area})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Assign to Classes</label>
                    <div className="space-y-2">
                      {classes.map(cls => (
                        <div key={cls.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={cls.id}
                            checked={newAssignment.class_ids.includes(cls.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setNewAssignment({
                                  ...newAssignment,
                                  class_ids: [...newAssignment.class_ids, cls.id]
                                });
                              } else {
                                setNewAssignment({
                                  ...newAssignment,
                                  class_ids: newAssignment.class_ids.filter(id => id !== cls.id)
                                });
                              }
                            }}
                          />
                          <label htmlFor={cls.id} className="text-sm">
                            {cls.name} ({cls.student_count} students)
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Due Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          {format(newAssignment.due_date, 'PPP')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newAssignment.due_date}
                          onSelect={(date) => date && setNewAssignment({ ...newAssignment, due_date: date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Instructions (Optional)</label>
                    <Textarea
                      placeholder="Additional instructions for students..."
                      value={newAssignment.instructions}
                      onChange={(e) => setNewAssignment({ ...newAssignment, instructions: e.target.value })}
                      rows={4}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createAssignment}>
                    Create Assignment
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters and Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assignments.length}</div>
              <p className="text-xs text-muted-foreground">
                {assignments.filter(a => a.status === 'active').length} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {assignments.reduce((sum, a) => sum + a.total_students, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                across all assignments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Submissions</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {assignments.reduce((sum, a) => sum + a.submitted_count, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                {assignments.reduce((sum, a) => sum + a.graded_count, 0)} graded
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {assignments.length > 0 
                  ? Math.round(assignments.reduce((sum, a) => sum + a.average_score, 0) / assignments.length)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                class average
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Assignment Tabs and List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Assignments</CardTitle>
              <Select value={filterClass} onValueChange={setFilterClass}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map(cls => (
                    <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="draft">Drafts</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>

              <TabsContent value={selectedTab} className="space-y-4 mt-6">
                {filteredAssignments.map((assignment) => (
                  <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold">{assignment.title}</h3>
                            <Badge className={getStatusColor(assignment.status)}>
                              {assignment.status}
                            </Badge>
                            <Badge variant="outline">{assignment.simulation_name}</Badge>
                          </div>
                          
                          <p className="text-gray-600 mb-4">{assignment.description}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Classes</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {assignment.class_names.map((className, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {className}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-500">Due Date</p>
                              <div className="flex items-center space-x-1 mt-1">
                                <CalendarIcon className="h-4 w-4 text-gray-400" />
                                <span className="text-sm font-medium">
                                  {format(new Date(assignment.due_date), 'MMM d, yyyy')}
                                </span>
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-500">Progress</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-500 h-2 rounded-full"
                                    style={{ 
                                      width: `${getCompletionRate(assignment.submitted_count, assignment.total_students)}%` 
                                    }}
                                  />
                                </div>
                                <span className="text-sm font-medium">
                                  {assignment.submitted_count}/{assignment.total_students}
                                </span>
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-500">Graded</p>
                              <div className="flex items-center space-x-1 mt-1">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-sm font-medium">
                                  {assignment.graded_count}/{assignment.submitted_count}
                                </span>
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-500">Average</p>
                              <p className="text-sm font-medium mt-1">{assignment.average_score}%</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/dashboard/assignments/${assignment.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => router.push(`/dashboard/assignments/${assignment.id}/edit`)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Assignment
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => duplicateAssignment(assignment)}>
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => router.push(`/dashboard/assignments/${assignment.id}/submissions`)}
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                View Submissions
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => deleteAssignment(assignment.id)}
                                className="text-red-600"
                              >
                                <Trash className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {filteredAssignments.length === 0 && (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
                    <p className="text-gray-500 mb-4">
                      {selectedTab === 'draft' 
                        ? 'You have no draft assignments'
                        : selectedTab === 'completed'
                        ? 'No completed assignments yet'
                        : 'Create your first assignment to get started'
                      }
                    </p>
                    {selectedTab === 'active' && (
                      <Button onClick={() => setShowCreateDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Assignment
                      </Button>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}