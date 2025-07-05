'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, User, Phone, MapPin, Calendar, Users, 
  Camera, Save, AlertCircle, FlaskConical, Sparkles,
  Globe, Bell, Shield, Lock, Mail, School, CheckCircle
} from 'lucide-react';

interface StudentProfile {
  id: number;
  child_name: string;
  date_of_birth?: string;
  sex?: string;
  phone_number?: string;
  father_name?: string;
  father_phone?: string;
  mother_name?: string;
  mother_phone?: string;
  current_address?: string;
  photo_url?: string;
  email?: string;
  school_name?: string;
  grade?: string;
  bio?: string;
  preferred_language?: string;
  notification_preferences?: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

export default function StudentProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [activeTab, setActiveTab] = useState('personal');
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    sms: false,
    push: true
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await fetch('/api/student/profile', { credentials: 'include' });
      const data = await res.json();
      
      if (data.success) {
        setProfile(data.profile);
        if (data.profile.photo_url) {
          setPhotoPreview(data.profile.photo_url);
        }
        if (data.profile.notification_preferences) {
          setNotificationSettings(data.profile.notification_preferences);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setMessage({ type: 'error', text: 'មានបញ្ហាក្នុងការផ្ទុកទិន្នន័យ' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'រូបភាពត្រូវតែតូចជាង 5MB' });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const formData = new FormData();
      
      // Add all profile fields
      Object.entries(profile || {}).forEach(([key, value]) => {
        if (value !== null && value !== undefined && key !== 'photo_url' && key !== 'notification_preferences') {
          formData.append(key, value.toString());
        }
      });

      // Add notification preferences
      formData.append('notification_preferences', JSON.stringify(notificationSettings));

      // Add photo if changed
      const fileInput = fileInputRef.current;
      if (fileInput?.files?.[0]) {
        formData.append('photo', fileInput.files[0]);
      }

      const res = await fetch('/api/student/profile', {
        method: 'PUT',
        body: formData,
        credentials: 'include'
      });

      const data = await res.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: 'ទិន្នន័យត្រូវបានរក្សាទុកដោយជោគជ័យ!' });
        setProfile(data.profile);
      } else {
        setMessage({ type: 'error', text: data.error || 'មានបញ្ហាក្នុងការរក្សាទុក' });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage({ type: 'error', text: 'មានបញ្ហាក្នុងការរក្សាទុក' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      setMessage({ type: 'error', text: 'ពាក្យសម្ងាត់ថ្មីមិនដូចគ្នា' });
      return;
    }

    setIsSaving(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: passwordData.current,
          newPassword: passwordData.new
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'ពាក្យសម្ងាត់បានផ្លាស់ប្តូរដោយជោគជ័យ!' });
        setPasswordData({ current: '', new: '', confirm: '' });
      } else {
        setMessage({ type: 'error', text: data.error || 'បរាជ័យក្នុងការផ្លាស់ប្តូរពាក្យសម្ងាត់' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'មានបញ្ហាក្នុងការផ្លាស់ប្តូរពាក្យសម្ងាត់' });
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'S';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <FlaskConical className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="mt-4 text-blue-700 font-medium font-hanuman">កំពុងផ្ទុកប្រវត្តិរូបរបស់អ្នក...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="border-b bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/student')}
                className="hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="h-8 w-px bg-gray-300" />
              <div className="flex items-center gap-3">
                <div className="relative">
                  <FlaskConical className="h-8 w-8 text-blue-600" />
                  <Sparkles className="h-4 w-4 text-yellow-500 absolute -top-1 -right-1" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Student Profile
                  </h1>
                  <p className="text-xs text-gray-500 font-medium">Manage your account</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={photoPreview} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-2xl">
                    {getInitials(profile?.child_name || '')}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="outline"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-white"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-900 font-hanuman">{profile?.child_name || 'Student'}</h2>
                <p className="text-gray-600 mt-1">Student ID: {profile?.id?.toString().padStart(6, '0') || '000000'}</p>
                <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                  {profile?.school_name && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <School className="h-3 w-3" />
                      {profile.school_name}
                    </Badge>
                  )}
                  {profile?.grade && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Grade {profile.grade}
                    </Badge>
                  )}
                  {profile?.date_of_birth && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(profile.date_of_birth).toLocaleDateString()}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alert Messages */}
        {message && (
          <Alert className={`mb-6 ${message.type === 'success' ? 'border-green-200' : 'border-red-200'}`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={`font-hanuman ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Profile Tabs */}
        <Card>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full justify-start rounded-none border-b">
                <TabsTrigger value="personal" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
                  <User className="h-4 w-4 mr-2" />
                  <span className="font-hanuman">ព័ត៌មានផ្ទាល់ខ្លួន</span>
                </TabsTrigger>
                <TabsTrigger value="preferences" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
                  <Bell className="h-4 w-4 mr-2" />
                  <span className="font-hanuman">ការកំណត់</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
                  <Shield className="h-4 w-4 mr-2" />
                  <span className="font-hanuman">សុវត្ថិភាព</span>
                </TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit}>
                <div className="p-6">
                  <TabsContent value="personal" className="space-y-6 mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="child_name" className="font-hanuman">ឈ្មោះពេញ *</Label>
                        <Input
                          id="child_name"
                          value={profile?.child_name || ''}
                          onChange={(e) => setProfile({ ...profile!, child_name: e.target.value })}
                          className="font-hanuman"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="font-hanuman">អ៊ីមែល</Label>
                        <div className="relative">
                          <Mail className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
                          <Input
                            id="email"
                            type="email"
                            value={profile?.email || ''}
                            onChange={(e) => setProfile({ ...profile!, email: e.target.value })}
                            className="pl-10"
                            placeholder="student@example.com"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone_number" className="font-hanuman">លេខទូរស័ព្ទ</Label>
                        <div className="relative">
                          <Phone className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
                          <Input
                            id="phone_number"
                            type="tel"
                            value={profile?.phone_number || ''}
                            onChange={(e) => setProfile({ ...profile!, phone_number: e.target.value })}
                            className="pl-10 font-hanuman"
                            placeholder="+855 12 345 678"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="date_of_birth" className="font-hanuman">ថ្ងៃខែឆ្នាំកំណើត</Label>
                        <Input
                          id="date_of_birth"
                          type="date"
                          value={profile?.date_of_birth || ''}
                          onChange={(e) => setProfile({ ...profile!, date_of_birth: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="sex" className="font-hanuman">ភេទ</Label>
                        <Select
                          value={profile?.sex || ''}
                          onValueChange={(value) => setProfile({ ...profile!, sex: value })}
                        >
                          <SelectTrigger className="font-hanuman">
                            <SelectValue placeholder="ជ្រើសរើសភេទ" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="M">ប្រុស</SelectItem>
                            <SelectItem value="F">ស្រី</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="current_address" className="font-hanuman">អាសយដ្ឋានបច្ចុប្បន្ន</Label>
                      <div className="relative">
                        <MapPin className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
                        <Textarea
                          id="current_address"
                          value={profile?.current_address || ''}
                          onChange={(e) => setProfile({ ...profile!, current_address: e.target.value })}
                          className="pl-10 font-hanuman"
                          placeholder="ផ្ទះលេខ... ផ្លូវ... សង្កាត់/ភូមិ..."
                          rows={3}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio" className="font-hanuman">អំពីខ្ញុំ</Label>
                      <Textarea
                        id="bio"
                        value={profile?.bio || ''}
                        onChange={(e) => setProfile({ ...profile!, bio: e.target.value })}
                        placeholder="Tell us about yourself, your interests, and goals..."
                        rows={4}
                        className="resize-none"
                      />
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="font-medium text-gray-900 mb-4 font-hanuman">ព័ត៌មានឪពុកម្តាយ</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="father_name" className="font-hanuman">ឈ្មោះឪពុក</Label>
                          <Input
                            id="father_name"
                            value={profile?.father_name || ''}
                            onChange={(e) => setProfile({ ...profile!, father_name: e.target.value })}
                            className="font-hanuman"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="father_phone" className="font-hanuman">លេខទូរស័ព្ទឪពុក</Label>
                          <Input
                            id="father_phone"
                            type="tel"
                            value={profile?.father_phone || ''}
                            onChange={(e) => setProfile({ ...profile!, father_phone: e.target.value })}
                            className="font-hanuman"
                            placeholder="+855 12 345 678"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="mother_name" className="font-hanuman">ឈ្មោះម្តាយ</Label>
                          <Input
                            id="mother_name"
                            value={profile?.mother_name || ''}
                            onChange={(e) => setProfile({ ...profile!, mother_name: e.target.value })}
                            className="font-hanuman"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="mother_phone" className="font-hanuman">លេខទូរស័ព្ទម្តាយ</Label>
                          <Input
                            id="mother_phone"
                            type="tel"
                            value={profile?.mother_phone || ''}
                            onChange={(e) => setProfile({ ...profile!, mother_phone: e.target.value })}
                            className="font-hanuman"
                            placeholder="+855 12 345 678"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={isSaving}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        <span className="font-hanuman">{isSaving ? 'កំពុងរក្សាទុក...' : 'រក្សាទុក'}</span>
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="preferences" className="space-y-6 mt-0">
                    <div className="space-y-2">
                      <Label htmlFor="language" className="font-hanuman">ភាសា</Label>
                      <div className="relative">
                        <Globe className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
                        <select
                          id="language"
                          value={profile?.preferred_language || 'km'}
                          onChange={(e) => setProfile({ ...profile!, preferred_language: e.target.value })}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="km">ភាសាខ្មែរ (Khmer)</option>
                          <option value="en">English</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium text-gray-900 font-hanuman">ការជូនដំណឹង</h3>
                      
                      <div className="space-y-3">
                        <label className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                          <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium font-hanuman">ការជូនដំណឹងតាមអ៊ីមែល</p>
                              <p className="text-sm text-gray-500">ទទួលបានការអាប់ដេតអំពីវឌ្ឍនភាពរបស់អ្នកតាមអ៊ីមែល</p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={notificationSettings.email}
                            onChange={(e) => setNotificationSettings({ ...notificationSettings, email: e.target.checked })}
                            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                        </label>

                        <label className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                          <div className="flex items-center gap-3">
                            <Phone className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium font-hanuman">ការជូនដំណឹងតាមសារ</p>
                              <p className="text-sm text-gray-500">ទទួលការដាស់តឿនសំខាន់ៗតាមសារ</p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={notificationSettings.sms}
                            onChange={(e) => setNotificationSettings({ ...notificationSettings, sms: e.target.checked })}
                            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                        </label>

                        <label className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                          <div className="flex items-center gap-3">
                            <Bell className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium font-hanuman">ការជូនដំណឹងក្នុងកម្មវិធី</p>
                              <p className="text-sm text-gray-500">ទទួលការជូនដំណឹងក្នុងកម្មវិធី</p>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={notificationSettings.push}
                            onChange={(e) => setNotificationSettings({ ...notificationSettings, push: e.target.checked })}
                            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={isSaving}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        <span className="font-hanuman">{isSaving ? 'កំពុងរក្សាទុក...' : 'រក្សាទុក'}</span>
                      </Button>
                    </div>
                  </TabsContent>
                </div>
              </form>

              <div className="p-6">
                <TabsContent value="security" className="space-y-6 mt-0">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-4 font-hanuman">ផ្លាស់ប្តូរពាក្យសម្ងាត់</h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="current_password" className="font-hanuman">ពាក្យសម្ងាត់បច្ចុប្បន្ន</Label>
                        <div className="relative">
                          <Lock className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
                          <Input
                            id="current_password"
                            type="password"
                            value={passwordData.current}
                            onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                            className="pl-10"
                            placeholder="បញ្ចូលពាក្យសម្ងាត់បច្ចុប្បន្ន"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="new_password" className="font-hanuman">ពាក្យសម្ងាត់ថ្មី</Label>
                        <div className="relative">
                          <Lock className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
                          <Input
                            id="new_password"
                            type="password"
                            value={passwordData.new}
                            onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                            className="pl-10"
                            placeholder="បញ្ចូលពាក្យសម្ងាត់ថ្មី"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirm_password" className="font-hanuman">បញ្ជាក់ពាក្យសម្ងាត់ថ្មី</Label>
                        <div className="relative">
                          <Lock className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
                          <Input
                            id="confirm_password"
                            type="password"
                            value={passwordData.confirm}
                            onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                            className="pl-10"
                            placeholder="បញ្ជាក់ពាក្យសម្ងាត់ថ្មី"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2 font-hanuman">លក្ខខណ្ឌពាក្យសម្ងាត់</h4>
                    <ul className="text-sm text-gray-600 space-y-1 font-hanuman">
                      <li>• យ៉ាងហោចណាស់ ៨ តួអក្សរ</li>
                      <li>• មានអក្សរធំយ៉ាងហោចណាស់មួយ</li>
                      <li>• មានអក្សរតូចយ៉ាងហោចណាស់មួយ</li>
                      <li>• មានលេខយ៉ាងហោចណាស់មួយ</li>
                    </ul>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleChangePassword}
                      disabled={isSaving || !passwordData.current || !passwordData.new || !passwordData.confirm}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      <span className="font-hanuman">{isSaving ? 'កំពុងផ្លាស់ប្តូរ...' : 'ផ្លាស់ប្តូរពាក្យសម្ងាត់'}</span>
                    </Button>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}