'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings,
  Globe,
  Shield,
  Bell,
  Database,
  Mail,
  Zap,
  Save,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';

interface SystemSettings {
  general: {
    site_name: string;
    site_description: string;
    admin_email: string;
    support_email: string;
    default_language: string;
    timezone: string;
  };
  security: {
    session_timeout: number;
    max_login_attempts: number;
    password_min_length: number;
    require_2fa: boolean;
    allowed_domains: string[];
  };
  features: {
    enable_registration: boolean;
    enable_messaging: boolean;
    enable_simulations: boolean;
    enable_announcements: boolean;
    enable_file_upload: boolean;
    max_file_size: number;
  };
  email: {
    smtp_host: string;
    smtp_port: number;
    smtp_user: string;
    smtp_from_name: string;
    smtp_from_email: string;
  };
  integrations: {
    phet_enabled: boolean;
    tarl_api_url: string;
    analytics_enabled: boolean;
    analytics_id: string;
  };
}

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/settings');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login');
          return;
        }
        throw new Error('Failed to load settings');
      }

      const data = await response.json();
      setSettings(data.settings || getDefaultSettings());
    } catch (error) {
      console.error('Error loading settings:', error);
      setSettings(getDefaultSettings());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultSettings = (): SystemSettings => ({
    general: {
      site_name: 'Virtual Lab',
      site_description: 'Interactive STEM Learning Platform',
      admin_email: 'admin@virtuallab.edu',
      support_email: 'support@virtuallab.edu',
      default_language: 'en',
      timezone: 'Asia/Phnom_Penh'
    },
    security: {
      session_timeout: 24,
      max_login_attempts: 5,
      password_min_length: 8,
      require_2fa: false,
      allowed_domains: []
    },
    features: {
      enable_registration: true,
      enable_messaging: true,
      enable_simulations: true,
      enable_announcements: true,
      enable_file_upload: true,
      max_file_size: 10
    },
    email: {
      smtp_host: 'smtp.gmail.com',
      smtp_port: 587,
      smtp_user: '',
      smtp_from_name: 'Virtual Lab',
      smtp_from_email: 'noreply@virtuallab.edu'
    },
    integrations: {
      phet_enabled: true,
      tarl_api_url: '',
      analytics_enabled: false,
      analytics_id: ''
    }
  });

  const saveSettings = async () => {
    try {
      setSaving(true);
      setMessage(null);

      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (!response.ok) throw new Error('Failed to save settings');

      setMessage({ type: 'success', text: 'Settings saved successfully' });
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Settings className="h-12 w-12 text-gray-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Admin
                </Button>
              </Link>
              <h1 className="text-xl font-semibold">System Settings</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={loadSettings}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button size="sm" onClick={saveSettings} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800' 
              : 'bg-red-50 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            {message.text}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  General Settings
                </CardTitle>
                <CardDescription>
                  Configure basic system information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Site Name</Label>
                    <Input
                      value={settings.general.site_name}
                      onChange={(e) => setSettings({
                        ...settings,
                        general: { ...settings.general, site_name: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Default Language</Label>
                    <select
                      value={settings.general.default_language}
                      onChange={(e) => setSettings({
                        ...settings,
                        general: { ...settings.general, default_language: e.target.value }
                      })}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="en">English</option>
                      <option value="km">Khmer</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <Label>Site Description</Label>
                  <Textarea
                    value={settings.general.site_description}
                    onChange={(e) => setSettings({
                      ...settings,
                      general: { ...settings.general, site_description: e.target.value }
                    })}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Admin Email</Label>
                    <Input
                      type="email"
                      value={settings.general.admin_email}
                      onChange={(e) => setSettings({
                        ...settings,
                        general: { ...settings.general, admin_email: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Support Email</Label>
                    <Input
                      type="email"
                      value={settings.general.support_email}
                      onChange={(e) => setSettings({
                        ...settings,
                        general: { ...settings.general, support_email: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Configure authentication and security policies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Session Timeout (hours)</Label>
                    <Input
                      type="number"
                      value={settings.security.session_timeout}
                      onChange={(e) => setSettings({
                        ...settings,
                        security: { ...settings.security, session_timeout: parseInt(e.target.value) }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Max Login Attempts</Label>
                    <Input
                      type="number"
                      value={settings.security.max_login_attempts}
                      onChange={(e) => setSettings({
                        ...settings,
                        security: { ...settings.security, max_login_attempts: parseInt(e.target.value) }
                      })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Minimum Password Length</Label>
                  <Input
                    type="number"
                    value={settings.security.password_min_length}
                    onChange={(e) => setSettings({
                      ...settings,
                      security: { ...settings.security, password_min_length: parseInt(e.target.value) }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-500">Enable 2FA for all users</p>
                  </div>
                  <Switch
                    checked={settings.security.require_2fa}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      security: { ...settings.security, require_2fa: checked }
                    })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Settings */}
          <TabsContent value="features">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Feature Settings
                </CardTitle>
                <CardDescription>
                  Enable or disable system features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Registration</Label>
                      <p className="text-sm text-gray-500">Allow new users to register</p>
                    </div>
                    <Switch
                      checked={settings.features.enable_registration}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        features: { ...settings.features, enable_registration: checked }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Messaging</Label>
                      <p className="text-sm text-gray-500">Allow users to send messages</p>
                    </div>
                    <Switch
                      checked={settings.features.enable_messaging}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        features: { ...settings.features, enable_messaging: checked }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Simulations</Label>
                      <p className="text-sm text-gray-500">Allow access to STEM simulations</p>
                    </div>
                    <Switch
                      checked={settings.features.enable_simulations}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        features: { ...settings.features, enable_simulations: checked }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Announcements</Label>
                      <p className="text-sm text-gray-500">Allow system announcements</p>
                    </div>
                    <Switch
                      checked={settings.features.enable_announcements}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        features: { ...settings.features, enable_announcements: checked }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable File Upload</Label>
                      <p className="text-sm text-gray-500">Allow users to upload files</p>
                    </div>
                    <Switch
                      checked={settings.features.enable_file_upload}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        features: { ...settings.features, enable_file_upload: checked }
                      })}
                    />
                  </div>
                </div>

                {settings.features.enable_file_upload && (
                  <div>
                    <Label>Max File Size (MB)</Label>
                    <Input
                      type="number"
                      value={settings.features.max_file_size}
                      onChange={(e) => setSettings({
                        ...settings,
                        features: { ...settings.features, max_file_size: parseInt(e.target.value) }
                      })}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Settings */}
          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Settings
                </CardTitle>
                <CardDescription>
                  Configure email delivery settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>SMTP Host</Label>
                    <Input
                      value={settings.email.smtp_host}
                      onChange={(e) => setSettings({
                        ...settings,
                        email: { ...settings.email, smtp_host: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label>SMTP Port</Label>
                    <Input
                      type="number"
                      value={settings.email.smtp_port}
                      onChange={(e) => setSettings({
                        ...settings,
                        email: { ...settings.email, smtp_port: parseInt(e.target.value) }
                      })}
                    />
                  </div>
                </div>

                <div>
                  <Label>SMTP Username</Label>
                  <Input
                    value={settings.email.smtp_user}
                    onChange={(e) => setSettings({
                      ...settings,
                      email: { ...settings.email, smtp_user: e.target.value }
                    })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>From Name</Label>
                    <Input
                      value={settings.email.smtp_from_name}
                      onChange={(e) => setSettings({
                        ...settings,
                        email: { ...settings.email, smtp_from_name: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label>From Email</Label>
                    <Input
                      type="email"
                      value={settings.email.smtp_from_email}
                      onChange={(e) => setSettings({
                        ...settings,
                        email: { ...settings.email, smtp_from_email: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations Settings */}
          <TabsContent value="integrations">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Integration Settings
                </CardTitle>
                <CardDescription>
                  Configure third-party integrations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable PhET Simulations</Label>
                    <p className="text-sm text-gray-500">Use PhET Interactive Simulations</p>
                  </div>
                  <Switch
                    checked={settings.integrations.phet_enabled}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      integrations: { ...settings.integrations, phet_enabled: checked }
                    })}
                  />
                </div>

                <div>
                  <Label>TaRL API URL</Label>
                  <Input
                    value={settings.integrations.tarl_api_url}
                    onChange={(e) => setSettings({
                      ...settings,
                      integrations: { ...settings.integrations, tarl_api_url: e.target.value }
                    })}
                    placeholder="https://api.tarl.org"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Analytics</Label>
                    <p className="text-sm text-gray-500">Track user behavior and usage</p>
                  </div>
                  <Switch
                    checked={settings.integrations.analytics_enabled}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      integrations: { ...settings.integrations, analytics_enabled: checked }
                    })}
                  />
                </div>

                {settings.integrations.analytics_enabled && (
                  <div>
                    <Label>Analytics ID</Label>
                    <Input
                      value={settings.integrations.analytics_id}
                      onChange={(e) => setSettings({
                        ...settings,
                        integrations: { ...settings.integrations, analytics_id: e.target.value }
                      })}
                      placeholder="G-XXXXXXXXXX"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}