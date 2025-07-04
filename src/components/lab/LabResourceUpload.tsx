'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  File, 
  FileText, 
  Video, 
  Globe, 
  BookOpen,
  X,
  Eye,
  Download,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface LabResource {
  id: string;
  resource_type: string;
  title: string;
  file_url: string;
  version: string;
  uploaded_by_name: string;
  uploaded_at: string;
  file_size: number;
  mime_type: string;
}

interface LabResourceUploadProps {
  labId?: string;
  courseId: string;
  onResourceUploaded?: (resource: LabResource) => void;
  existingResources?: LabResource[];
  mode?: 'create' | 'upload'; // create for new lab, upload for existing lab
}

interface UploadFormData {
  title: string;
  grade: string;
  subject: string;
  duration_minutes: number;
  version_note: string;
  resource_type: string;
  resource_title: string;
  version: string;
}

const resourceTypeOptions = [
  { value: 'simulation_html', label: 'HTML Simulation', icon: Globe, accept: '.html,.zip', description: 'Interactive HTML simulation files' },
  { value: 'worksheet', label: 'Worksheet', icon: FileText, accept: '.pdf,.docx,.doc', description: 'Student worksheet documents' },
  { value: 'rubric', label: 'Assessment Rubric', icon: FileText, accept: '.pdf,.docx,.doc', description: 'Grading rubric documents' },
  { value: 'manual', label: 'Lab Manual', icon: BookOpen, accept: '.pdf,.docx,.doc', description: 'Lab instruction manual' },
  { value: 'video', label: 'Video', icon: Video, accept: '.mp4,.webm,.ogg', description: 'Instructional videos' },
  { value: 'document', label: 'Document', icon: File, accept: '.pdf,.docx,.doc,.txt', description: 'General documents' }
];

const gradeOptions = [
  'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'
];

const subjectOptions = [
  'Physics', 'Chemistry', 'Biology', 'Mathematics', 'Computer Science', 'Engineering'
];

export function LabResourceUpload({
  labId,
  courseId,
  onResourceUploaded,
  existingResources = [],
  mode = 'create'
}: LabResourceUploadProps) {
  const [formData, setFormData] = useState<UploadFormData>({
    title: '',
    grade: '',
    subject: '',
    duration_minutes: 60,
    version_note: '',
    resource_type: 'simulation_html',
    resource_title: '',
    version: '1.0'
  });

  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');
  const [uploadSuccess, setUploadSuccess] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedResourceType = resourceTypeOptions.find(opt => opt.value === formData.resource_type);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
    setUploadError('');
    
    // If it's an HTML file, create preview URL
    if (acceptedFiles[0] && acceptedFiles[0].type === 'text/html') {
      const url = URL.createObjectURL(acceptedFiles[0]);
      setPreviewUrl(url);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: selectedResourceType ? { [selectedResourceType.accept]: [] } : undefined,
    multiple: false,
    maxSize: formData.resource_type === 'simulation_html' ? 100 * 1024 * 1024 : 
             formData.resource_type === 'video' ? 200 * 1024 * 1024 : 
             50 * 1024 * 1024
  });

  const handleInputChange = (field: keyof UploadFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setUploadError('');
  };

  const handleResourceTypeChange = (resourceType: string) => {
    setFormData(prev => ({ ...prev, resource_type: resourceType }));
    setFiles([]);
    setPreviewUrl('');
    setUploadError('');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const removeFile = () => {
    setFiles([]);
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError('');
    setUploadSuccess('');

    if (mode === 'create') {
      // For creating new lab
      if (!formData.title || !formData.grade || !formData.subject) {
        setUploadError('Title, grade, and subject are required');
        return;
      }
    } else {
      // For uploading to existing lab
      if (!formData.resource_title || files.length === 0) {
        setUploadError('Resource title and file are required');
        return;
      }
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formDataToSend = new FormData();
      
      if (mode === 'create') {
        // Create new lab
        const labData = {
          course_id: courseId,
          title: formData.title,
          grade: formData.grade,
          subject: formData.subject,
          duration_minutes: formData.duration_minutes,
          version_note: formData.version_note,
          resources: files.length > 0 ? [{
            resource_type: formData.resource_type,
            title: formData.resource_title || formData.title,
            version: formData.version
          }] : []
        };

        const response = await fetch('/api/labs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(labData),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create lab');
        }

        const result = await response.json();
        setUploadSuccess('Lab created successfully!');
        
        // Upload file if provided
        if (files.length > 0) {
          await uploadFile(result.lab.id);
        }
        
      } else {
        // Upload to existing lab
        await uploadFile(labId!);
      }

    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const uploadFile = async (targetLabId: string) => {
    if (files.length === 0) return;

    const formDataToSend = new FormData();
    formDataToSend.append('file', files[0]);
    formDataToSend.append('resource_type', formData.resource_type);
    formDataToSend.append('title', formData.resource_title || formData.title);
    formDataToSend.append('version', formData.version);
    if (formData.version_note) {
      formDataToSend.append('version_note', formData.version_note);
    }

    const response = await fetch(`/api/labs/${targetLabId}/upload`, {
      method: 'POST',
      body: formDataToSend,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload file');
    }

    const result = await response.json();
    setUploadSuccess('File uploaded successfully!');
    
    if (onResourceUploaded) {
      onResourceUploaded(result.resource);
    }

    // Reset form
    setFiles([]);
    setPreviewUrl('');
    if (mode === 'upload') {
      setFormData(prev => ({
        ...prev,
        resource_title: '',
        version_note: '',
        version: '1.0'
      }));
    } else {
      setFormData({
        title: '',
        grade: '',
        subject: '',
        duration_minutes: 60,
        version_note: '',
        resource_type: 'simulation_html',
        resource_title: '',
        version: '1.0'
      });
    }
  };

  const openPreview = () => {
    if (previewUrl) {
      setShowPreview(true);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            {mode === 'create' ? 'Create New Lab' : 'Upload Lab Resource'}
          </CardTitle>
          <CardDescription>
            {mode === 'create' 
              ? 'Create a new lab with resources for your course'
              : 'Upload additional resources to this lab'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'create' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Lab Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter lab title"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="grade">Grade *</Label>
                  <Select value={formData.grade} onValueChange={(value) => handleInputChange('grade', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {gradeOptions.map(grade => (
                        <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Select value={formData.subject} onValueChange={(value) => handleInputChange('subject', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjectOptions.map(subject => (
                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => handleInputChange('duration_minutes', parseInt(e.target.value) || 60)}
                    min={1}
                    max={480}
                  />
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor="resource_type">Resource Type</Label>
                <Select value={formData.resource_type} onValueChange={handleResourceTypeChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {resourceTypeOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <option.icon className="h-4 w-4" />
                          <div>
                            <div>{option.label}</div>
                            <div className="text-xs text-gray-500">{option.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="resource_title">Resource Title</Label>
                <Input
                  id="resource_title"
                  value={formData.resource_title}
                  onChange={(e) => handleInputChange('resource_title', e.target.value)}
                  placeholder="Enter resource title"
                />
              </div>

              <div>
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  value={formData.version}
                  onChange={(e) => handleInputChange('version', e.target.value)}
                  placeholder="e.g., 1.0, 2.1"
                />
              </div>

              <div>
                <Label htmlFor="version_note">Version Notes</Label>
                <Textarea
                  id="version_note"
                  value={formData.version_note}
                  onChange={(e) => handleInputChange('version_note', e.target.value)}
                  placeholder="Describe changes in this version"
                  rows={3}
                />
              </div>
            </div>

            {/* File Upload Area */}
            <div className="space-y-4">
              <Label>File Upload</Label>
              
              {files.length === 0 ? (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input {...getInputProps()} ref={fileInputRef} />
                  <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  {isDragActive ? (
                    <p className="text-blue-600">Drop the file here...</p>
                  ) : (
                    <div>
                      <p className="text-gray-600 mb-2">
                        Drag and drop a file here, or click to select
                      </p>
                      <p className="text-sm text-gray-500">
                        Accepted: {selectedResourceType?.accept}
                      </p>
                      <p className="text-sm text-gray-500">
                        Max size: {formData.resource_type === 'simulation_html' ? '100MB' : 
                                 formData.resource_type === 'video' ? '200MB' : '50MB'}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="border rounded-lg p-4">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {selectedResourceType && <selectedResourceType.icon className="h-5 w-5 text-gray-500" />}
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {previewUrl && formData.resource_type === 'simulation_html' && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={openPreview}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={removeFile}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Uploading...</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            {/* Error/Success Messages */}
            {uploadError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-red-700">{uploadError}</span>
              </div>
            )}

            {uploadSuccess && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-green-700">{uploadSuccess}</span>
              </div>
            )}

            {/* Submit Button */}
            <Button type="submit" disabled={isUploading} className="w-full">
              {isUploading ? 'Uploading...' : mode === 'create' ? 'Create Lab' : 'Upload Resource'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Existing Resources List */}
      {existingResources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Existing Resources</CardTitle>
            <CardDescription>Previously uploaded resources for this lab</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {existingResources.map((resource) => {
                const resourceType = resourceTypeOptions.find(opt => opt.value === resource.resource_type);
                return (
                  <div key={resource.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {resourceType && <resourceType.icon className="h-5 w-5 text-gray-500" />}
                      <div>
                        <p className="font-medium">{resource.title}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Badge variant="outline">v{resource.version}</Badge>
                          <span>{formatFileSize(resource.file_size)}</span>
                          <span>•</span>
                          <span>by {resource.uploaded_by_name}</span>
                          <span>•</span>
                          <span>{new Date(resource.uploaded_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {resource.resource_type === 'simulation_html' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(resource.file_url, '_blank')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(resource.file_url, '_blank')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* HTML Preview Modal */}
      {showPreview && previewUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-4/5 h-4/5 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">HTML Preview</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 p-4">
              <iframe
                src={previewUrl}
                className="w-full h-full border rounded"
                sandbox="allow-scripts allow-same-origin"
                title="HTML Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}