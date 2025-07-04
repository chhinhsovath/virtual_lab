'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { toast } from 'sonner';
import { Eye, EyeOff, BookOpen, Users, BarChart3, Shield, GraduationCap, MapPin, FlaskConical } from 'lucide-react';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Login successful!');
        
        // Get user data to determine redirect route
        const sessionResponse = await fetch('/api/auth/session');
        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          const user = sessionData.user;
          
          // Role-based routing
          let redirectPath = '/dashboard';
          
          if (user.roles.includes('student')) {
            redirectPath = '/student';
          } else if (user.roles.includes('parent') || user.roles.includes('guardian')) {
            redirectPath = '/parent';
          } else if (user.roles.includes('super_admin') || user.roles.includes('admin') || 
                     user.roles.includes('principal') || user.roles.includes('teacher') || 
                     user.roles.includes('cluster_mentor') || user.roles.includes('assistant_teacher') ||
                     user.roles.includes('librarian') || user.roles.includes('counselor') || 
                     user.roles.includes('viewer')) {
            redirectPath = '/dashboard';
          }
          
          console.log('Redirecting to:', redirectPath);
          window.location.href = redirectPath;
        } else {
          // Fallback to dashboard if can't get user data
          window.location.href = '/dashboard';
        }
      } else {
        toast.error(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (username: string, password: string, role: string) => {
    // Set form values
    setValue('username', username);
    setValue('password', password);
    
    // Show loading state
    setIsLoading(true);
    toast.info(`Logging in as ${role}...`);
    
    try {
      // Submit login request directly
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(`Successfully logged in as ${role}!`);
        
        // Get user data to determine redirect route
        const sessionResponse = await fetch('/api/auth/session');
        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          const user = sessionData.user;
          
          // Role-based routing
          let redirectPath = '/dashboard';
          
          if (user.roles.includes('student')) {
            redirectPath = '/student';
          } else if (user.roles.includes('parent') || user.roles.includes('guardian')) {
            redirectPath = '/parent';
          } else if (user.roles.includes('super_admin') || user.roles.includes('admin') || 
                     user.roles.includes('principal') || user.roles.includes('teacher') || 
                     user.roles.includes('cluster_mentor') || user.roles.includes('assistant_teacher') ||
                     user.roles.includes('librarian') || user.roles.includes('counselor') || 
                     user.roles.includes('viewer')) {
            redirectPath = '/dashboard';
          }
          
          console.log('Redirecting to:', redirectPath);
          window.location.href = redirectPath;
        } else {
          // Fallback to dashboard if can't get user data
          window.location.href = '/dashboard';
        }
      } else {
        toast.error(result.error || `Login failed for ${role}`);
      }
    } catch (error) {
      console.error('Demo login error:', error);
      toast.error(`An error occurred during ${role} login`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding & Stats */}
      <div className="hidden lg:flex lg:w-1/2 education-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-40 right-32 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-12 py-16 text-white">
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <GraduationCap className="h-12 w-12 mr-4" />
              <div>
                <h1 className="text-3xl font-bold font-hanuman">TaRL Assessment</h1>
                <p className="font-hanuman text-xl">ការវាយតម្លៃ TaRL</p>
              </div>
            </div>
            
            <p className="text-lg text-blue-100 leading-relaxed mb-8">
              Teaching at the Right Level - Empowering educators with data-driven assessment tools for effective learning outcomes.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 p-3 rounded-full">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Multi-Province Coverage</h3>
                  <p className="text-blue-100">Battambang & Kampong Cham</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 p-3 rounded-full">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">60+ Teachers</h3>
                  <p className="text-blue-100">Across 30+ schools</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 p-3 rounded-full">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Real-time Analytics</h3>
                  <p className="text-blue-100">Comprehensive assessment tracking</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gradient-to-br from-slate-50 to-white p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <GraduationCap className="h-10 w-10 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-slate-800 font-hanuman">TaRL Assessment</h1>
                <p className="font-hanuman text-lg text-slate-600">ការវាយតម្លៃ TaRL</p>
              </div>
            </div>
          </div>

          {/* Login Card */}
          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-slate-800">Welcome Back</CardTitle>
              <CardDescription className="text-slate-600">
                Sign in to access your assessment dashboard
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-slate-700 font-medium">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    className="h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                    {...register('username')}
                  />
                  {errors.username && (
                    <p className="text-sm text-red-600 flex items-center">
                      <Shield className="h-4 w-4 mr-1" />
                      {errors.username.message}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500 pr-12"
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600 flex items-center">
                      <Shield className="h-4 w-4 mr-1" />
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>

              {/* Demo Accounts */}
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-4 text-slate-500">Quick Demo Access</span>
                  </div>
                </div>
                
                {/* Virtual Lab Demo Accounts - Simplified */}
                <div className="mb-4">
                  <p className="text-sm text-center text-slate-600 font-medium mb-2">🧪 Virtual Lab Demo Accounts</p>
                  <p className="text-xs text-center text-slate-500 mb-3">All passwords: demo123</p>
                </div>
                
                {/* Administrator */}
                <div className="mb-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleDemoLogin('admin@vlab.edu.kh', 'demo123', 'Administrator')}
                    className="w-full h-12 border-purple-200 text-purple-700 hover:bg-purple-50"
                    disabled={isLoading}
                    title="Platform administrator - Full access to all modules"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Administrator
                    <span className="ml-auto text-xs opacity-70">Full Platform Access</span>
                  </Button>
                </div>
                
                {/* Teacher & Student */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleDemoLogin('teacher@vlab.edu.kh', 'demo123', 'Teacher')}
                    className="h-12 border-green-200 text-green-700 hover:bg-green-50"
                    disabled={isLoading}
                    title="Lab creator and assessor"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Teacher
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleDemoLogin('student@vlab.edu.kh', 'demo123', 'Student')}
                    className="h-12 border-blue-200 text-blue-700 hover:bg-blue-50"
                    disabled={isLoading}
                    title="Lab participant"
                  >
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Student
                  </Button>
                </div>
                
                {/* Parent */}
                <div className="mb-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleDemoLogin('parent@vlab.edu.kh', 'demo123', 'Parent')}
                    className="w-full h-12 border-orange-200 text-orange-700 hover:bg-orange-50"
                    disabled={isLoading}
                    title="Child progress monitor"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Parent
                    <span className="ml-auto text-xs opacity-70">Child Monitoring</span>
                  </Button>
                </div>

                {/* Role Information */}
                <div className="text-center space-y-2 mt-4">
                  <p className="text-sm text-slate-600 font-medium">Virtual Lab LMS Roles</p>
                  <div className="text-xs text-slate-500 space-y-1">
                    <p><strong>Administrator:</strong> Full platform access, user management</p>
                    <p><strong>Teacher:</strong> Create labs, assess students, manage curriculum</p>
                    <p><strong>Student:</strong> Complete lab simulations and worksheets</p>
                    <p><strong>Parent:</strong> Monitor child's lab activity and progress</p>
                  </div>
                  <p className="font-hanuman text-sm text-slate-500 mt-3">
                    ប្រព័ន្ធគ្រប់គ្រងការសិក្សាមន្ទីរពិសោធន៍និម្មិត
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}