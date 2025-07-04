'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Label } from '../../../components/ui/label';
import { toast } from 'sonner';
import { Users, Save, Target, Filter } from 'lucide-react';

interface Student {
  chiID: number;
  chiName: string;
  chiGender: string;
  chiClass: number;
  baselineLevel?: string;
  alreadySelected?: boolean;
}

interface Session {
  userId: number;
  teacherId: number;
  schoolIds: number[];
  subject: string;
}

export default function StudentSelectionPage() {
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');

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
    fetchSession();
  }, []);

  useEffect(() => {
    if (session) {
      fetchStudentsWithBaseline();
    }
  }, [session]);

  const fetchSession = async () => {
    try {
      const response = await fetch('/api/auth/session');
      if (response.ok) {
        const data = await response.json();
        setSession(data.user);
      }
    } catch (error) {
      console.error('Error fetching session:', error);
    }
  };

  const fetchStudentsWithBaseline = async () => {
    if (!session?.schoolIds.length) return;

    setIsLoading(true);
    try {
      // Get students with their baseline assessments
      const response = await fetch(
        `/api/students/baseline/${session.schoolIds[0]}?subject=${session.subject}`
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
    if (!session) return;

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
          schoolId: session.schoolIds[0],
          subject: session.subject,
        }),
      });

      if (response.ok) {
        toast.success('Student selection saved successfully!');
        fetchStudentsWithBaseline(); // Refresh data
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save selection');
      }
    } catch (error) {
      console.error('Error saving selection:', error);
      toast.error('Error saving selection');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredAvailableStudents = availableStudents.filter(student => {
    const gradeMatch = filterGrade === 'all' || student.chiClass.toString() === filterGrade;
    const levelMatch = filterLevel === 'all' || student.baselineLevel === filterLevel;
    return gradeMatch && levelMatch;
  });

  const StudentCard = ({ student }: { student: Student }) => (
    <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-gray-900">{student.chiName}</h4>
        <Badge variant="outline" className="text-xs">
          Grade {student.chiClass}
        </Badge>
      </div>
      <div className="space-y-1 text-sm text-gray-600">
        <p>Gender: {student.chiGender}</p>
        {student.baselineLevel && (
          <div className="flex items-center space-x-2">
            <span>Baseline:</span>
            <Badge variant="secondary" className="text-xs">
              {levelLabels[student.baselineLevel]?.en || student.baselineLevel}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Student Selection</h1>
        <p className="font-khmer text-xl text-gray-600">ជ្រើសរើសសិស្ស</p>
        <p className="text-gray-600">
          Select students for the TaRL intervention program based on their baseline assessment results
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Filter by Grade</Label>
              <Select value={filterGrade} onValueChange={setFilterGrade}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  <SelectItem value="3">Grade 3</SelectItem>
                  <SelectItem value="4">Grade 4</SelectItem>
                  <SelectItem value="5">Grade 5</SelectItem>
                  <SelectItem value="6">Grade 6</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Filter by Baseline Level</Label>
              <Select value={filterLevel} onValueChange={setFilterLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {Object.entries(levelLabels).map(([level, labels]) => (
                    <SelectItem key={level} value={level}>
                      {labels.en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selection Interface */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Students */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Available Students</span>
                </div>
                <Badge variant="outline">
                  {filteredAvailableStudents.length} students
                </Badge>
              </CardTitle>
              <CardDescription>
                Drag students to the right to select them for the TaRL program
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Droppable droppableId="available">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-96 space-y-3 p-4 rounded-lg border-2 border-dashed transition-colors ${
                      snapshot.isDraggingOver
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    {filteredAvailableStudents.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No students available with current filters</p>
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
                              className={`cursor-move transition-transform ${
                                snapshot.isDragging ? 'rotate-2 scale-105' : ''
                              }`}
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-green-600" />
                  <span>Selected for TaRL Program</span>
                </div>
                <Badge variant="default" className="bg-green-600">
                  {selectedStudents.length} selected
                </Badge>
              </CardTitle>
              <CardDescription>
                Students selected for the TaRL intervention program
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Droppable droppableId="selected">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-96 space-y-3 p-4 rounded-lg border-2 border-dashed transition-colors ${
                      snapshot.isDraggingOver
                        ? 'border-green-300 bg-green-50'
                        : 'border-green-200 bg-green-50'
                    }`}
                  >
                    {selectedStudents.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Drag students here to select them</p>
                        <p className="font-khmer text-sm">អូសសិស្សមកទីនេះដើម្បីជ្រើសរើស</p>
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
                              className={`cursor-move transition-transform ${
                                snapshot.isDragging ? 'rotate-2 scale-105' : ''
                              }`}
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

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSaveSelection}
          disabled={isSaving}
          className="flex items-center space-x-2"
          size="lg"
        >
          <Save className="h-4 w-4" />
          <span>{isSaving ? 'Saving...' : `Save Selection (${selectedStudents.length} students)`}</span>
        </Button>
      </div>

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <h4 className="font-medium text-blue-900">How to use:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Students are shown with their baseline assessment levels</li>
              <li>• Drag students from left to right to select them for the TaRL program</li>
              <li>• Use filters to find students by grade or baseline level</li>
              <li>• Click &quot;Save Selection&quot; to confirm your choices</li>
            </ul>
            <div className="font-khmer text-sm text-blue-700 mt-3">
              <p>អូសសិស្សពីខាងឆ្វេងទៅខាងស្តាំដើម្បីជ្រើសរើសពួកគេសម្រាប់កម្មវិធី TaRL</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}