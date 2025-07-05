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
import { 
  ArrowLeft, User, Phone, MapPin, Calendar, Users, 
  Camera, Save, AlertCircle
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
}

export default function StudentProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [photoPreview, setPhotoPreview] = useState<string>('');

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
    setMessage({ type: '', text: '' });

    try {
      const formData = new FormData();
      
      // Add all profile fields
      Object.entries(profile || {}).forEach(([key, value]) => {
        if (value !== null && value !== undefined && key !== 'photo_url') {
          formData.append(key, value.toString());
        }
      });

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 font-hanuman">កំពុងផ្ទុក...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/student')}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold font-hanuman">
                ព័ត៌មានផ្ទាល់ខ្លួន
              </h1>
              <p className="text-blue-100">
                កែប្រែព័ត៌មានរបស់អ្នក
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message.text && (
          <Alert className={`mb-6 ${message.type === 'error' ? 'border-red-500' : 'border-green-500'}`}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="font-hanuman">
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Photo Section */}
          <Card className="border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
              <CardTitle className="font-hanuman flex items-center gap-2">
                <Camera className="h-5 w-5 text-blue-600" />
                រូបថត
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24 border-2 border-blue-200">
                  <AvatarImage src={photoPreview} alt={profile?.child_name} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100 text-blue-600 text-2xl font-bold">
                    {profile?.child_name?.charAt(0) || 'S'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="font-hanuman border-blue-300 hover:bg-blue-50 hover:border-blue-400"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    ជ្រើសរើសរូបថតថ្មី
                  </Button>
                  <p className="text-xs text-gray-500 mt-2 font-hanuman">
                    JPG, PNG ឬ GIF (អតិបរមា 5MB)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card className="border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
              <CardTitle className="font-hanuman flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                ព័ត៌មានផ្ទាល់ខ្លួន
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="child_name" className="font-hanuman">ឈ្មោះពេញ *</Label>
                  <Input
                    id="child_name"
                    value={profile?.child_name || ''}
                    onChange={(e) => setProfile({ ...profile!, child_name: e.target.value })}
                    className="font-hanuman border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="date_of_birth" className="font-hanuman">ថ្ងៃខែឆ្នាំកំណើត</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={profile?.date_of_birth || ''}
                    onChange={(e) => setProfile({ ...profile!, date_of_birth: e.target.value })}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <Label htmlFor="sex" className="font-hanuman">ភេទ</Label>
                  <Select
                    value={profile?.sex || ''}
                    onValueChange={(value) => setProfile({ ...profile!, sex: value })}
                  >
                    <SelectTrigger className="font-hanuman border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="ជ្រើសរើសភេទ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">ប្រុស</SelectItem>
                      <SelectItem value="F">ស្រី</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="phone_number" className="font-hanuman">លេខទូរស័ព្ទ</Label>
                  <Input
                    id="phone_number"
                    type="tel"
                    value={profile?.phone_number || ''}
                    onChange={(e) => setProfile({ ...profile!, phone_number: e.target.value })}
                    placeholder="012 345 678"
                    className="font-hanuman border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Parents Information */}
          <Card className="border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
              <CardTitle className="font-hanuman flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                ព័ត៌មានឪពុកម្តាយ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="father_name" className="font-hanuman">ឈ្មោះឪពុក</Label>
                  <Input
                    id="father_name"
                    value={profile?.father_name || ''}
                    onChange={(e) => setProfile({ ...profile!, father_name: e.target.value })}
                    className="font-hanuman border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <Label htmlFor="father_phone" className="font-hanuman">លេខទូរស័ព្ទឪពុក</Label>
                  <Input
                    id="father_phone"
                    type="tel"
                    value={profile?.father_phone || ''}
                    onChange={(e) => setProfile({ ...profile!, father_phone: e.target.value })}
                    placeholder="012 345 678"
                    className="font-hanuman border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <Label htmlFor="mother_name" className="font-hanuman">ឈ្មោះម្តាយ</Label>
                  <Input
                    id="mother_name"
                    value={profile?.mother_name || ''}
                    onChange={(e) => setProfile({ ...profile!, mother_name: e.target.value })}
                    className="font-hanuman border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <Label htmlFor="mother_phone" className="font-hanuman">លេខទូរស័ព្ទម្តាយ</Label>
                  <Input
                    id="mother_phone"
                    type="tel"
                    value={profile?.mother_phone || ''}
                    onChange={(e) => setProfile({ ...profile!, mother_phone: e.target.value })}
                    placeholder="012 345 678"
                    className="font-hanuman border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card className="border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
              <CardTitle className="font-hanuman flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                អាសយដ្ឋានបច្ចុប្បន្ន
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Textarea
                value={profile?.current_address || ''}
                onChange={(e) => setProfile({ ...profile!, current_address: e.target.value })}
                placeholder="ផ្ទះលេខ... ផ្លូវ... សង្កាត់/ភូមិ... ខណ្ឌ/ស្រុក... រាជធានី/ខេត្ត..."
                className="font-hanuman border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/student')}
              className="font-hanuman border-gray-300 hover:bg-gray-50"
            >
              បោះបង់
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="font-hanuman bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'កំពុងរក្សាទុក...' : 'រក្សាទុក'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}