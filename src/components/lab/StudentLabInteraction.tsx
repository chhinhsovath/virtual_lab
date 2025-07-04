'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Pause, 
  Square, 
  Save, 
  Send, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  Timer,
  BookOpen,
  FileText,
  Globe
} from 'lucide-react';

interface WorksheetField {
  id: string;
  type: 'text' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

interface WorksheetSection {
  title: string;
  fields: WorksheetField[];
}

interface WorksheetSchema {
  title: string;
  description: string;
  sections: WorksheetSection[];
}

interface Lab {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade: string;
  duration_minutes: number;
}

interface LabSession {
  id: string;
  start_time: string;
  status: 'in_progress' | 'submitted';
}

interface StudentLabInteractionProps {
  labId: string;
  onSessionEnd?: (session: any) => void;
  onSubmit?: (submission: any) => void;
}

export function StudentLabInteraction({
  labId,
  onSessionEnd,
  onSubmit
}: StudentLabInteractionProps) {
  const [lab, setLab] = useState<Lab | null>(null);
  const [worksheetSchema, setWorksheetSchema] = useState<WorksheetSchema | null>(null);
  const [currentSession, setCurrentSession] = useState<LabSession | null>(null);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [simulationUrl, setSimulationUrl] = useState<string>('');
  
  // Timer state
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();
  const autosaveRef = useRef<NodeJS.Timeout>();
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [simulationLaunched, setSimulationLaunched] = useState(false);
  const [showSimulationModal, setShowSimulationModal] = useState(false);

  // Load lab data and form schema
  useEffect(() => {
    loadLabData();
  }, [labId]);

  // Timer effect
  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timerActive]);

  // Auto-save effect
  useEffect(() => {
    if (currentSession && Object.keys(responses).length > 0) {
      // Clear existing timeout
      if (autosaveRef.current) {
        clearTimeout(autosaveRef.current);
      }

      // Set new timeout for 60 seconds
      autosaveRef.current = setTimeout(() => {
        autoSave();
      }, 60000); // 60 seconds
    }

    return () => {
      if (autosaveRef.current) {
        clearTimeout(autosaveRef.current);
      }
    };
  }, [responses, currentSession]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (autosaveRef.current) clearTimeout(autosaveRef.current);
    };
  }, []);

  const loadLabData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/labs/${labId}/form`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to load lab');
      }

      const data = await response.json();
      setLab(data.lab);
      setWorksheetSchema(data.worksheetSchema);
      setCurrentSession(data.currentSession);
      
      if (data.existingData) {
        setResponses(data.existingData);
      }

      // Get simulation URL (would come from lab resources)
      // For now, using a placeholder
      setSimulationUrl('/simulations/pendulum.html'); // This would be dynamic based on lab resources

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load lab');
    } finally {
      setLoading(false);
    }
  };

  const startSession = async () => {
    try {
      const response = await fetch(`/api/labs/${labId}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAgent: navigator.userAgent,
          ipAddress: 'client-ip' // Would be captured server-side
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to start session');
      }

      const data = await response.json();
      setCurrentSession(data.session);
      setTimerActive(true);
      
      if (data.resources?.simulation_html?.url) {
        setSimulationUrl(data.resources.simulation_html.url);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start session');
    }
  };

  const stopSession = async (reason = 'manual') => {
    try {
      const response = await fetch(`/api/labs/${labId}/stop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: currentSession?.id,
          reason
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to stop session');
      }

      const data = await response.json();
      setTimerActive(false);
      
      if (onSessionEnd) {
        onSessionEnd(data.session);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop session');
    }
  };

  const autoSave = async () => {
    if (!currentSession || saving) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/labs/${labId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          responses,
          isAutosave: true,
          sessionId: currentSession.id
        }),
      });

      if (response.ok) {
        setLastSaved(new Date());
      }
    } catch (err) {
      console.error('Auto-save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const submitResponses = async () => {
    if (!currentSession) return;

    try {
      setSubmitting(true);
      const response = await fetch(`/api/labs/${labId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          responses,
          isAutosave: false,
          sessionId: currentSession.id
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit');
      }

      const data = await response.json();
      setTimerActive(false);
      
      if (onSubmit) {
        onSubmit(data.submission);
      }

      // Auto-stop session after submission
      await stopSession('submission');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit responses');
    } finally {
      setSubmitting(false);
    }
  };

  const launchSimulation = () => {
    if (simulationUrl) {
      if (!simulationLaunched && currentSession?.status === 'in_progress') {
        // Start timer when simulation loads for the first time
        setTimerActive(true);
        setSimulationLaunched(true);
      }
      setShowSimulationModal(true);
    }
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderField = (field: WorksheetField) => {
    const value = responses[field.id] || '';

    switch (field.type) {
      case 'text':
        return (
          <Input
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(field.id, parseFloat(e.target.value) || '')}
            placeholder={field.placeholder}
            min={field.validation?.min}
            max={field.validation?.max}
            step="0.01"
            required={field.required}
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            rows={4}
            required={field.required}
          />
        );

      case 'select':
        return (
          <Select value={value} onValueChange={(val) => handleFieldChange(field.id, val)}>
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`${field.id}-${option}`}
                  name={field.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  className="h-4 w-4"
                />
                <Label htmlFor={`${field.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={value === true}
              onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
            />
            <Label>{field.label}</Label>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading lab...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={loadLabData} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Lab Header */}
      {lab && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  {lab.title}
                </CardTitle>
                <CardDescription>
                  {lab.grade} • {lab.subject} • Duration: {lab.duration_minutes} minutes
                </CardDescription>
              </div>
              <div className="flex items-center gap-4">
                {/* Timer */}
                <div className="flex items-center gap-2 text-lg font-mono">
                  <Timer className="h-5 w-5" />
                  {formatTime(elapsedTime)}
                  {timerActive && <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>}
                </div>
                
                {/* Auto-save status */}
                {saving && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Save className="h-4 w-4 animate-spin" />
                    Saving...
                  </div>
                )}
                
                {lastSaved && !saving && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    Saved {lastSaved.toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">{lab.description}</p>
            
            {/* Session Controls */}
            <div className="flex items-center gap-4">
              {!currentSession ? (
                <Button onClick={startSession} className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Start Lab Session
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Badge variant={currentSession.status === 'in_progress' ? 'default' : 'secondary'}>
                    {currentSession.status === 'in_progress' ? 'Active' : 'Completed'}
                  </Badge>
                  {currentSession.status === 'in_progress' && (
                    <Button onClick={() => stopSession()} variant="outline" size="sm">
                      <Square className="h-4 w-4 mr-2" />
                      End Session
                    </Button>
                  )}
                </div>
              )}
              
              {simulationUrl && (
                <Button onClick={launchSimulation} variant="outline" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Launch Simulation
                  <ExternalLink className="h-3 w-3" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lab Content Grid */}
      {currentSession && worksheetSchema && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Worksheet Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {worksheetSchema.title}
                </CardTitle>
                <CardDescription>{worksheetSchema.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {worksheetSchema.sections.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="space-y-4">
                    <h3 className="text-lg font-semibold">{section.title}</h3>
                    
                    {section.fields.map((field) => (
                      <div key={field.id} className="space-y-2">
                        <Label htmlFor={field.id} className="flex items-center gap-1">
                          {field.label}
                          {field.required && <span className="text-red-500">*</span>}
                        </Label>
                        {renderField(field)}
                      </div>
                    ))}
                    
                    {sectionIndex < worksheetSchema.sections.length - 1 && (
                      <Separator className="my-6" />
                    )}
                  </div>
                ))}
                
                {/* Submit Button */}
                <div className="pt-6 border-t">
                  <Button 
                    onClick={submitResponses} 
                    disabled={submitting || currentSession.status !== 'in_progress'}
                    className="w-full"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {submitting ? 'Submitting...' : 'Submit Lab Worksheet'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Simulation Area */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lab Simulation</CardTitle>
                <CardDescription>
                  Interact with the simulation and record your observations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {simulationUrl ? (
                  <div className="space-y-4">
                    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                      {simulationLaunched ? (
                        <iframe
                          src={simulationUrl}
                          className="w-full h-full rounded-lg border"
                          sandbox="allow-scripts allow-same-origin allow-forms"
                          title="Lab Simulation"
                        />
                      ) : (
                        <div className="text-center">
                          <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 mb-4">Click to launch simulation</p>
                          <Button onClick={launchSimulation}>
                            Launch Simulation
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {!simulationLaunched && (
                      <p className="text-sm text-gray-600">
                        The timer will start automatically when you launch the simulation.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No simulation available for this lab</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Simulation Modal */}
      {showSimulationModal && simulationUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-5/6 h-5/6 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Lab Simulation</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSimulationModal(false)}
              >
                Close
              </Button>
            </div>
            <div className="flex-1 p-4">
              <iframe
                src={simulationUrl}
                className="w-full h-full border rounded"
                sandbox="allow-scripts allow-same-origin allow-forms"
                title="Lab Simulation"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}