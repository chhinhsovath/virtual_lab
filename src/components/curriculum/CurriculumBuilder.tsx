'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  Calendar,
  Clock,
  BookOpen,
  GripVertical,
  Plus,
  Edit,
  Trash2,
  Save,
  Settings,
  Users,
  Target,
  Award,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Copy,
  Share2,
  Eye,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

interface Lab {
  id: string;
  title: string;
  subject: string;
  grade: string;
  estimated_duration_minutes: number;
  description: string;
  skills: Skill[];
  simulation_url?: string;
  worksheet_url?: string;
  rubric_url?: string;
}

interface Skill {
  skill_id: string;
  skill_name: string;
  skill_category: string;
  skill_level: string;
}

interface CurriculumLab {
  lab_id: string;
  lab_title: string;
  lab_subject: string;
  week_number: number;
  order_in_week: number;
  estimated_duration_minutes: number;
  curriculum_duration_override?: number;
  is_required: boolean;
  due_date_offset: number;
  teacher_notes: string;
  learning_objectives: string;
  prerequisites: string;
  lab_status_in_curriculum: string;
  skills_covered: Skill[];
}

interface WeekStructure {
  week_number: number;
  labs: CurriculumLab[];
  total_duration: number;
  required_labs: number;
  optional_labs: number;
}

interface Curriculum {
  curriculum_id: string;
  curriculum_name: string;
  description: string;
  academic_year: string;
  subject: string;
  grade: string;
  total_weeks: number;
  start_date?: string;
  end_date?: string;
  status: string;
  total_labs: number;
  created_by_name: string;
}

interface CurriculumBuilderProps {
  curriculumId?: string;
  onSave?: (curriculum: Curriculum) => void;
  userRole: string;
  userId: string;
}

export function CurriculumBuilder({
  curriculumId,
  onSave,
  userRole,
  userId
}: CurriculumBuilderProps) {
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [weeklyStructure, setWeeklyStructure] = useState<Record<number, WeekStructure>>({});
  const [availableLabs, setAvailableLabs] = useState<Lab[]>([]);
  const [filteredLabs, setFilteredLabs] = useState<Lab[]>([]);
  const [skillsCoverage, setSkillsCoverage] = useState<any[]>([]);
  
  // UI state
  const [loading, setLoading] = useState(!!curriculumId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState('timeline');
  const [currentWeek, setCurrentWeek] = useState(1);
  const [weeksPerView, setWeeksPerView] = useState(4);
  
  // Editing state
  const [isEditingInfo, setIsEditingInfo] = useState(!curriculumId);
  const [editingLab, setEditingLab] = useState<string | null>(null);
  const [selectedLabForAdd, setSelectedLabForAdd] = useState<Lab | null>(null);
  const [targetWeek, setTargetWeek] = useState(1);
  
  // Filters
  const [labSearchQuery, setLabSearchQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState('all');
  const [durationFilter, setDurationFilter] = useState('all');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    academic_year: '',
    subject: '',
    grade: '',
    total_weeks: 36,
    start_date: '',
    end_date: ''
  });

  const isTeacher = ['teacher', 'admin', 'super_admin'].includes(userRole);

  useEffect(() => {
    if (curriculumId) {
      loadCurriculum();
    } else {
      generateEmptyWeeks();
    }
  }, [curriculumId]);

  useEffect(() => {
    filterAvailableLabs();
  }, [availableLabs, labSearchQuery, skillFilter, durationFilter]);

  const loadCurriculum = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/curriculum/${curriculumId}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to load curriculum');
      }

      const data = await response.json();
      setCurriculum(data.curriculum);
      setWeeklyStructure(data.weeklyStructure || {});
      setAvailableLabs(data.availableLabs || []);
      setSkillsCoverage(data.skillsCoverage || []);
      
      setFormData({
        name: data.curriculum.curriculum_name || '',
        description: data.curriculum.description || '',
        academic_year: data.curriculum.academic_year || '',
        subject: data.curriculum.subject || '',
        grade: data.curriculum.grade || '',
        total_weeks: data.curriculum.total_weeks || 36,
        start_date: data.curriculum.start_date || '',
        end_date: data.curriculum.end_date || ''
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load curriculum');
    } finally {
      setLoading(false);
    }
  };

  const generateEmptyWeeks = () => {
    const weeks: Record<number, WeekStructure> = {};
    for (let i = 1; i <= 36; i++) {
      weeks[i] = {
        week_number: i,
        labs: [],
        total_duration: 0,
        required_labs: 0,
        optional_labs: 0
      };
    }
    setWeeklyStructure(weeks);
  };

  const filterAvailableLabs = () => {
    let filtered = availableLabs;

    if (labSearchQuery) {
      filtered = filtered.filter(lab => 
        lab.title.toLowerCase().includes(labSearchQuery.toLowerCase()) ||
        lab.description.toLowerCase().includes(labSearchQuery.toLowerCase())
      );
    }

    if (skillFilter !== 'all') {
      filtered = filtered.filter(lab => 
        lab.skills.some(skill => skill.skill_category === skillFilter)
      );
    }

    if (durationFilter !== 'all') {
      const [min, max] = durationFilter.split('-').map(Number);
      filtered = filtered.filter(lab => {
        const duration = lab.estimated_duration_minutes;
        if (max) {
          return duration >= min && duration <= max;
        } else {
          return duration >= min;
        }
      });
    }

    setFilteredLabs(filtered);
  };

  const saveCurriculumInfo = async () => {
    try {
      setSaving(true);
      
      if (curriculumId) {
        // Update existing curriculum
        const response = await fetch(`/api/curriculum/${curriculumId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update_info',
            ...formData
          })
        });

        if (!response.ok) {
          throw new Error('Failed to update curriculum');
        }
      } else {
        // Create new curriculum
        const response = await fetch('/api/curriculum', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (!response.ok) {
          throw new Error('Failed to create curriculum');
        }

        const data = await response.json();
        if (onSave) {
          onSave(data.curriculum);
        }
      }

      setIsEditingInfo(false);
      if (curriculumId) {
        await loadCurriculum();
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save curriculum');
    } finally {
      setSaving(false);
    }
  };

  const addLabToWeek = async (lab: Lab, weekNumber: number) => {
    try {
      setSaving(true);
      
      const response = await fetch(`/api/curriculum/${curriculumId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'assign_labs',
          lab_assignments: [{
            lab_id: lab.id,
            week_number: weekNumber,
            order_in_week: weeklyStructure[weekNumber]?.labs.length + 1 || 1,
            estimated_duration_minutes: lab.estimated_duration_minutes,
            is_required: true,
            due_date_offset: 7,
            teacher_notes: '',
            learning_objectives: '',
            prerequisites: ''
          }]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add lab to timeline');
      }

      await loadCurriculum();
      setSelectedLabForAdd(null);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add lab');
    } finally {
      setSaving(false);
    }
  };

  const removeLabFromWeek = async (labId: string) => {
    try {
      setSaving(true);
      
      const response = await fetch(`/api/curriculum/${curriculumId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'remove_lab',
          lab_id: labId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to remove lab');
      }

      await loadCurriculum();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove lab');
    } finally {
      setSaving(false);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    // Parse the drop zone IDs
    const sourceWeek = parseInt(source.droppableId.replace('week-', ''));
    const destWeek = parseInt(destination.droppableId.replace('week-', ''));
    const labId = draggableId.replace('lab-', '');

    try {
      setSaving(true);

      if (sourceWeek === destWeek) {
        // Reordering within same week
        const weekLabs = [...weeklyStructure[sourceWeek].labs];
        const [moved] = weekLabs.splice(source.index, 1);
        weekLabs.splice(destination.index, 0, moved);

        const reorderData = weekLabs.map((lab, index) => ({
          lab_id: lab.lab_id,
          week_number: sourceWeek,
          order_in_week: index + 1
        }));

        const response = await fetch(`/api/curriculum/${curriculumId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'reorder_labs',
            reorder_data: reorderData
          })
        });

        if (!response.ok) {
          throw new Error('Failed to reorder labs');
        }
      } else {
        // Moving between weeks
        const response = await fetch(`/api/curriculum/${curriculumId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'reorder_labs',
            reorder_data: [{
              lab_id: labId,
              week_number: destWeek,
              order_in_week: destination.index + 1
            }]
          })
        });

        if (!response.ok) {
          throw new Error('Failed to move lab');
        }
      }

      await loadCurriculum();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update timeline');
    } finally {
      setSaving(false);
    }
  };

  const getSkillBadgeColor = (category: string) => {
    const colors = {
      'measurement': 'bg-blue-100 text-blue-800',
      'graphing': 'bg-green-100 text-green-800',
      'calculation': 'bg-purple-100 text-purple-800',
      'analysis': 'bg-orange-100 text-orange-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const renderCurriculumInfo = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Curriculum Information</CardTitle>
            <CardDescription>
              Basic details and configuration for your curriculum
            </CardDescription>
          </div>
          {!isEditingInfo && curriculum && (
            <Button
              variant="outline"
              onClick={() => setIsEditingInfo(true)}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditingInfo ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Curriculum Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter curriculum name"
                />
              </div>
              <div>
                <Label htmlFor="academic_year">Academic Year</Label>
                <Input
                  id="academic_year"
                  value={formData.academic_year}
                  onChange={(e) => setFormData(prev => ({ ...prev, academic_year: e.target.value }))}
                  placeholder="e.g., 2024-2025"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Physics, Chemistry, etc."
                />
              </div>
              <div>
                <Label htmlFor="grade">Grade Level</Label>
                <Input
                  id="grade"
                  value={formData.grade}
                  onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value }))}
                  placeholder="Grade 9, 10, etc."
                />
              </div>
              <div>
                <Label htmlFor="total_weeks">Total Weeks</Label>
                <Input
                  id="total_weeks"
                  type="number"
                  value={formData.total_weeks}
                  onChange={(e) => setFormData(prev => ({ ...prev, total_weeks: parseInt(e.target.value) }))}
                  min="1"
                  max="52"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the curriculum goals and overview"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Start Date (Optional)</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="end_date">End Date (Optional)</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={saveCurriculumInfo} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsEditingInfo(false)}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : curriculum ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Name</div>
                <div className="font-medium">{curriculum.curriculum_name}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Academic Year</div>
                <div className="font-medium">{curriculum.academic_year}</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-500">Subject</div>
                <div className="font-medium">{curriculum.subject || 'Not specified'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Grade</div>
                <div className="font-medium">{curriculum.grade || 'Not specified'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Total Weeks</div>
                <div className="font-medium">{curriculum.total_weeks}</div>
              </div>
            </div>
            {curriculum.description && (
              <div>
                <div className="text-sm text-gray-500">Description</div>
                <div className="text-sm">{curriculum.description}</div>
              </div>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );

  const renderTimeline = () => (
    <div className="space-y-6">
      {/* Timeline Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setCurrentWeek(Math.max(1, currentWeek - weeksPerView))}
                disabled={currentWeek <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-medium">
                Weeks {currentWeek} - {Math.min(currentWeek + weeksPerView - 1, formData.total_weeks)}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentWeek(Math.min(formData.total_weeks - weeksPerView + 1, currentWeek + weeksPerView))}
                disabled={currentWeek + weeksPerView > formData.total_weeks}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="weeks_per_view">Weeks per view:</Label>
              <Select value={weeksPerView.toString()} onValueChange={(value) => setWeeksPerView(parseInt(value))}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="6">6</SelectItem>
                  <SelectItem value="8">8</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Grid */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${weeksPerView}, 1fr)` }}>
          {Array.from({ length: weeksPerView }, (_, i) => {
            const weekNumber = currentWeek + i;
            if (weekNumber > formData.total_weeks) return null;
            
            const week = weeklyStructure[weekNumber] || {
              week_number: weekNumber,
              labs: [],
              total_duration: 0,
              required_labs: 0,
              optional_labs: 0
            };

            return (
              <Card key={weekNumber} className="min-h-[400px]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Week {weekNumber}</CardTitle>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    {week.total_duration}min
                    <Users className="h-3 w-3" />
                    {week.required_labs}req + {week.optional_labs}opt
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Droppable droppableId={`week-${weekNumber}`}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-h-[200px] p-2 rounded-lg border-2 border-dashed transition-colors ${
                          snapshot.isDraggingOver 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        {week.labs.map((lab, index) => (
                          <Draggable
                            key={lab.lab_id}
                            draggableId={`lab-${lab.lab_id}`}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`mb-2 p-3 bg-white rounded-lg border shadow-sm transition-shadow ${
                                  snapshot.isDragging ? 'shadow-lg' : 'hover:shadow-md'
                                }`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <div {...provided.dragHandleProps}>
                                        <GripVertical className="h-4 w-4 text-gray-400" />
                                      </div>
                                      <h4 className="font-medium text-sm">{lab.lab_title}</h4>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                      <Clock className="h-3 w-3" />
                                      {lab.curriculum_duration_override || lab.estimated_duration_minutes}min
                                      {lab.is_required ? (
                                        <Badge variant="default" className="text-xs py-0">Required</Badge>
                                      ) : (
                                        <Badge variant="secondary" className="text-xs py-0">Optional</Badge>
                                      )}
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                      {lab.skills_covered.slice(0, 2).map((skill) => (
                                        <Badge 
                                          key={skill.skill_id} 
                                          variant="outline" 
                                          className={`text-xs py-0 ${getSkillBadgeColor(skill.skill_category)}`}
                                        >
                                          {skill.skill_name}
                                        </Badge>
                                      ))}
                                      {lab.skills_covered.length > 2 && (
                                        <Badge variant="outline" className="text-xs py-0">
                                          +{lab.skills_covered.length - 2}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setEditingLab(lab.lab_id)}
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeLabFromWeek(lab.lab_id)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        
                        {/* Add Lab Button */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full mt-2 border-dashed"
                              onClick={() => setTargetWeek(weekNumber)}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Lab
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Add Lab to Week {weekNumber}</DialogTitle>
                              <DialogDescription>
                                Choose a lab to add to your curriculum timeline
                              </DialogDescription>
                            </DialogHeader>
                            {renderLabSelection()}
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                  </Droppable>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );

  const renderLabSelection = () => (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search labs..."
            value={labSearchQuery}
            onChange={(e) => setLabSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={skillFilter} onValueChange={setSkillFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by skill" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Skills</SelectItem>
            <SelectItem value="measurement">Measurement</SelectItem>
            <SelectItem value="graphing">Graphing</SelectItem>
            <SelectItem value="calculation">Calculation</SelectItem>
            <SelectItem value="analysis">Analysis</SelectItem>
          </SelectContent>
        </Select>
        <Select value={durationFilter} onValueChange={setDurationFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Durations</SelectItem>
            <SelectItem value="0-30">0-30 minutes</SelectItem>
            <SelectItem value="30-60">30-60 minutes</SelectItem>
            <SelectItem value="60-120">60-120 minutes</SelectItem>
            <SelectItem value="120">120+ minutes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lab List */}
      <div className="grid gap-4 max-h-96 overflow-y-auto">
        {filteredLabs.map((lab) => (
          <Card key={lab.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium">{lab.title}</h4>
                  <p className="text-sm text-gray-500 mb-2">{lab.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                    <span>{lab.subject}</span>
                    <span>{lab.grade}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {lab.estimated_duration_minutes}min
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {lab.skills.map((skill) => (
                      <Badge 
                        key={skill.skill_id} 
                        variant="outline" 
                        className={`text-xs ${getSkillBadgeColor(skill.skill_category)}`}
                      >
                        {skill.skill_name}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button
                  onClick={() => addLabToWeek(lab, targetWeek)}
                  disabled={saving}
                >
                  Add to Week {targetWeek}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderSkillsOverview = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Skills Coverage Overview
          </CardTitle>
          <CardDescription>
            Track which skills are being developed throughout your curriculum
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {skillsCoverage.map((category) => (
              <div key={category.skill_category} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold capitalize">{category.skill_category}</h3>
                  <Badge variant="secondary">
                    {category.labs_using_category} labs
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {category.skills_details?.map((skill: any) => (
                    <div key={skill.skill_name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{skill.skill_name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {skill.skill_level}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {skill.labs_count || 0} labs
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading curriculum...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => curriculumId ? loadCurriculum() : setError('')} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {curriculum ? 'Edit Curriculum' : 'Create New Curriculum'}
          </h1>
          <p className="text-gray-600">
            {curriculum ? curriculum.curriculum_name : 'Build your custom lab curriculum timeline'}
          </p>
        </div>
        {curriculum && (
          <div className="flex gap-2">
            <Badge variant={curriculum.status === 'active' ? 'default' : 'secondary'}>
              {curriculum.status}
            </Badge>
            <Badge variant="outline">
              {curriculum.total_labs} labs
            </Badge>
          </div>
        )}
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="info">Information</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="skills">Skills Coverage</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-6">
          {renderCurriculumInfo()}
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          {curriculum && renderTimeline()}
        </TabsContent>

        <TabsContent value="skills" className="space-y-6">
          {curriculum && renderSkillsOverview()}
        </TabsContent>
      </Tabs>
    </div>
  );
}