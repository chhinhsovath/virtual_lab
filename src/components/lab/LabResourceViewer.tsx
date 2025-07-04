'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  File, 
  FileText, 
  Video, 
  Globe, 
  BookOpen,
  Eye,
  Download,
  Upload,
  Filter,
  Search,
  Clock,
  User
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LabResource {
  id: string;
  lab_id: string;
  resource_type: string;
  title: string;
  file_url: string;
  version: string;
  uploaded_by_name: string;
  uploaded_by_email: string;
  uploaded_at: string;
  file_size: number;
  mime_type: string;
}

interface Lab {
  id: string;
  title: string;
  grade: string;
  subject: string;
  duration_minutes: number;
  version_note: string;
  created_by_name: string;
  created_at: string;
  updated_at: string;
}

interface LabResourceViewerProps {
  labId?: string;
  courseId?: string;
  showUploadButton?: boolean;
  onUploadClick?: () => void;
  canUpload?: boolean;
}

const resourceTypeConfig = {
  simulation_html: { icon: Globe, label: 'HTML Simulation', color: 'bg-blue-100 text-blue-800' },
  worksheet: { icon: FileText, label: 'Worksheet', color: 'bg-green-100 text-green-800' },
  rubric: { icon: FileText, label: 'Assessment Rubric', color: 'bg-purple-100 text-purple-800' },
  manual: { icon: BookOpen, label: 'Lab Manual', color: 'bg-orange-100 text-orange-800' },
  video: { icon: Video, label: 'Video', color: 'bg-red-100 text-red-800' },
  document: { icon: File, label: 'Document', color: 'bg-gray-100 text-gray-800' }
};

export function LabResourceViewer({
  labId,
  courseId,
  showUploadButton = false,
  onUploadClick,
  canUpload = false
}: LabResourceViewerProps) {
  const [lab, setLab] = useState<Lab | null>(null);
  const [resources, setResources] = useState<LabResource[]>([]);
  const [resourcesByType, setResourcesByType] = useState<Record<string, LabResource[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewTitle, setPreviewTitle] = useState('');

  useEffect(() => {
    if (labId) {
      fetchLabResources();
    }
  }, [labId]);

  const fetchLabResources = async () => {
    if (!labId) return;

    try {
      setLoading(true);
      
      // Fetch lab details
      const labResponse = await fetch(`/api/labs/${labId}`);
      if (!labResponse.ok) throw new Error('Failed to fetch lab details');
      const labData = await labResponse.json();
      setLab(labData.lab);

      // Fetch lab resources
      const resourcesResponse = await fetch(`/api/labs/${labId}/upload`);
      if (!resourcesResponse.ok) throw new Error('Failed to fetch lab resources');
      const resourcesData = await resourcesResponse.json();
      
      setResources(resourcesData.resources);
      setResourcesByType(resourcesData.resourcesByType);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load lab resources');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openPreview = (resource: LabResource) => {
    if (resource.resource_type === 'simulation_html') {
      setPreviewUrl(resource.file_url);
      setPreviewTitle(resource.title);
      setShowPreview(true);
    } else {
      // For other file types, open in new tab
      window.open(resource.file_url, '_blank');
    }
  };

  const downloadResource = (resource: LabResource) => {
    const link = document.createElement('a');
    link.href = resource.file_url;
    link.download = resource.title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.uploaded_by_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || resource.resource_type === filterType;
    return matchesSearch && matchesType;
  });

  const groupedResources = filteredResources.reduce((acc, resource) => {
    if (!acc[resource.resource_type]) {
      acc[resource.resource_type] = [];
    }
    acc[resource.resource_type].push(resource);
    return acc;
  }, {} as Record<string, LabResource[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading lab resources...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchLabResources} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Lab Info Header */}
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
                  {lab.grade} • {lab.subject} • {lab.duration_minutes} minutes
                </CardDescription>
              </div>
              {showUploadButton && canUpload && (
                <Button onClick={onUploadClick}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Resource
                </Button>
              )}
            </div>
          </CardHeader>
          {lab.version_note && (
            <CardContent>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">{lab.version_note}</p>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Lab Resources</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-auto">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.entries(resourceTypeConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <config.icon className="h-4 w-4" />
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredResources.length === 0 ? (
            <div className="text-center py-8">
              <File className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No resources found</p>
              {searchTerm || filterType !== 'all' ? (
                <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
              ) : (
                <p className="text-sm text-gray-500">Upload resources to get started</p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedResources).map(([type, typeResources]) => {
                const config = resourceTypeConfig[type as keyof typeof resourceTypeConfig];
                if (!config) return null;

                return (
                  <div key={type}>
                    <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
                      <config.icon className="h-5 w-5" />
                      {config.label}
                      <Badge variant="secondary">{typeResources.length}</Badge>
                    </h3>
                    <div className="grid gap-4">
                      {typeResources.map((resource) => (
                        <div
                          key={resource.id}
                          className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <config.icon className="h-5 w-5 text-gray-500 flex-shrink-0" />
                                <h4 className="font-medium truncate">{resource.title}</h4>
                                <Badge 
                                  variant="outline" 
                                  className={config.color}
                                >
                                  v{resource.version}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {resource.uploaded_by_name}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatDate(resource.uploaded_at)}
                                </div>
                                <div>{formatFileSize(resource.file_size)}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openPreview(resource)}
                              >
                                <Eye className="h-4 w-4" />
                                {resource.resource_type === 'simulation_html' ? 'Preview' : 'View'}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => downloadResource(resource)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* HTML Preview Modal */}
      {showPreview && previewUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-5/6 h-5/6 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold truncate mr-4">{previewTitle}</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(false)}
              >
                Close
              </Button>
            </div>
            <div className="flex-1 p-4">
              <iframe
                src={previewUrl}
                className="w-full h-full border rounded"
                sandbox="allow-scripts allow-same-origin allow-forms"
                title="Lab Simulation Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}