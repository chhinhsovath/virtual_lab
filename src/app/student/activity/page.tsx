'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft,
  Clock, 
  LogIn,
  LogOut,
  Play,
  Pause,
  CheckCircle,
  FileText,
  Calendar,
  Filter,
  Search,
  Download,
  Activity,
  Eye,
  MousePointer,
  Monitor
} from 'lucide-react';

interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  resource_name?: string;
  details?: any;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  timestamp: string;
  duration?: number;
}

interface SessionSummary {
  session_id: string;
  login_time: string;
  logout_time?: string;
  duration_minutes: number;
  activities_count: number;
  simulations_accessed: string[];
  exercises_submitted: number;
}

export default function StudentActivityPage() {
  const [user, setUser] = useState<User | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityLog[]>([]);
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('7');
  const [currentView, setCurrentView] = useState<'activities' | 'sessions'>('activities');
  const router = useRouter();

  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        // Fetch user session
        const sessionRes = await fetch('/api/auth/session', { credentials: 'include' });
        if (!sessionRes.ok) {
          router.push('/auth/login');
          return;
        }

        const sessionData = await sessionRes.json();
        setUser(sessionData.user);

        // Fetch activity logs
        const activityRes = await fetch(
          `/api/activity-logs?days=${dateFilter}&limit=100`,
          { credentials: 'include' }
        );
        
        if (activityRes.ok) {
          const activityData = await activityRes.json();
          setActivities(activityData.activities || []);
          setFilteredActivities(activityData.activities || []);
          setSessions(activityData.sessions || []);
        }
      } catch (error) {
        console.error('Error fetching activity data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivityData();
  }, [dateFilter, router]);

  useEffect(() => {
    let filtered = activities;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(activity => 
        activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.resource_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.resource_type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply action filter
    if (actionFilter !== 'all') {
      filtered = filtered.filter(activity => activity.action === actionFilter);
    }

    setFilteredActivities(filtered);
  }, [activities, searchTerm, actionFilter]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'login':
        return <LogIn className="h-4 w-4 text-green-600" />;
      case 'logout':
        return <LogOut className="h-4 w-4 text-red-600" />;
      case 'simulation_start':
        return <Play className="h-4 w-4 text-blue-600" />;
      case 'simulation_pause':
        return <Pause className="h-4 w-4 text-yellow-600" />;
      case 'simulation_complete':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'exercise_submit':
        return <FileText className="h-4 w-4 text-purple-600" />;
      case 'page_view':
        return <Eye className="h-4 w-4 text-gray-600" />;
      case 'click':
        return <MousePointer className="h-4 w-4 text-gray-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionBadge = (action: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'login': 'default',
      'logout': 'destructive',
      'simulation_start': 'default',
      'simulation_complete': 'default',
      'exercise_submit': 'secondary',
      'page_view': 'outline'
    };
    
    return (
      <Badge variant={variants[action] || 'outline'}>
        {action.replace('_', ' ')}
      </Badge>
    );
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${Math.round(minutes)} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return `${hours}h ${remainingMinutes}m`;
  };

  const exportActivityData = () => {
    const csvContent = [
      ['Timestamp', 'Action', 'Resource Type', 'Resource Name', 'Duration', 'Session ID'].join(','),
      ...filteredActivities.map(activity => [
        new Date(activity.timestamp).toISOString(),
        activity.action,
        activity.resource_type,
        activity.resource_name || '',
        activity.duration || '',
        activity.session_id || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity_log_${dateFilter}days.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-blue-700 font-medium">Loading activity logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/student')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Activity Log</h1>
                <p className="text-gray-600 mt-1">
                  Track your learning sessions and activities
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={currentView} onValueChange={(value: 'activities' | 'sessions') => setCurrentView(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activities">Activities</SelectItem>
                  <SelectItem value="sessions">Sessions</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={exportActivityData} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Activity Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activities.length}</div>
              <p className="text-xs text-muted-foreground">
                in last {dateFilter} days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Learning Sessions</CardTitle>
              <Monitor className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sessions.length}</div>
              <p className="text-xs text-muted-foreground">
                unique sessions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatDuration(sessions.reduce((sum, session) => sum + session.duration_minutes, 0))}
              </div>
              <p className="text-xs text-muted-foreground">
                active learning time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Exercises Submitted</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {activities.filter(a => a.action === 'exercise_submit').length}
              </div>
              <p className="text-xs text-muted-foreground">
                total submissions
              </p>
            </CardContent>
          </Card>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search activities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Action Type</label>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="login">Login</SelectItem>
                    <SelectItem value="logout">Logout</SelectItem>
                    <SelectItem value="simulation_start">Simulation Start</SelectItem>
                    <SelectItem value="simulation_complete">Simulation Complete</SelectItem>
                    <SelectItem value="exercise_submit">Exercise Submit</SelectItem>
                    <SelectItem value="page_view">Page View</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Time Range</label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Last 24 hours</SelectItem>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 3 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content based on current view */}
        {currentView === 'activities' ? (
          /* Activity List */
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Activity Timeline</h2>
            
            {filteredActivities.length > 0 ? (
              filteredActivities.map((activity, index) => (
                <Card key={activity.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {getActionIcon(activity.action)}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            {getActionBadge(activity.action)}
                            <span className="text-sm text-gray-500">
                              {activity.resource_type}
                            </span>
                          </div>
                          
                          {activity.resource_name && (
                            <h4 className="font-medium text-sm mb-1">
                              {activity.resource_name}
                            </h4>
                          )}
                          
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(activity.timestamp).toLocaleString()}</span>
                            </div>
                            {activity.duration && (
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{activity.duration}s</span>
                              </div>
                            )}
                            {activity.session_id && (
                              <div className="flex items-center space-x-1">
                                <Monitor className="h-3 w-3" />
                                <span>Session: {activity.session_id.slice(-8)}</span>
                              </div>
                            )}
                          </div>
                          
                          {activity.details && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                              <pre className="whitespace-pre-wrap text-gray-600">
                                {JSON.stringify(activity.details, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
                  <p className="text-gray-500">
                    {searchTerm || actionFilter !== 'all' 
                      ? 'Try adjusting your filters to see more results.'
                      : 'Start learning to see your activity here!'
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          /* Session List */
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Learning Sessions</h2>
            
            {sessions.length > 0 ? (
              sessions.map((session, index) => (
                <Card key={session.session_id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <Monitor className="h-5 w-5 text-blue-600" />
                          <h4 className="font-medium">
                            Session {session.session_id.slice(-8)}
                          </h4>
                          <Badge variant="outline">
                            {formatDuration(session.duration_minutes)}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-500">Login Time</p>
                            <p className="text-sm font-medium">
                              {new Date(session.login_time).toLocaleString()}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-500">Duration</p>
                            <p className="text-sm font-medium">
                              {formatDuration(session.duration_minutes)}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-500">Activities</p>
                            <p className="text-sm font-medium">
                              {session.activities_count} actions
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-500">Exercises</p>
                            <p className="text-sm font-medium">
                              {session.exercises_submitted} submitted
                            </p>
                          </div>
                        </div>
                        
                        {session.simulations_accessed.length > 0 && (
                          <div>
                            <p className="text-sm text-gray-500 mb-2">Simulations Accessed</p>
                            <div className="flex flex-wrap gap-2">
                              {session.simulations_accessed.map((simName, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {simName}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Monitor className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions found</h3>
                  <p className="text-gray-500">
                    Start a learning session to see your activity sessions here!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}