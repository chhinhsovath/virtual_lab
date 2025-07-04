'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { 
  BookOpen, 
  Users, 
  GraduationCap, 
  BarChart3, 
  FileText, 
  FlaskConical,
  Brain,
  Award,
  Globe,
  School,
  LogIn,
  UserPlus
} from 'lucide-react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            // Redirect based on role
            const roleRedirects: Record<string, string> = {
              'super_admin': '/admin',
              'admin': '/admin',
              'teacher': '/dashboard',
              'student': '/student',
              'parent': '/parent',
              'guardian': '/parent'
            };
            const redirectPath = roleRedirects[data.user.role] || '/dashboard';
            router.push(redirectPath);
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
      }
    };

    checkSession();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Virtual Lab LMS
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>ភាសាខ្មែរ</span>
              </Button>
              <Link href="/auth/login">
                <Button variant="outline" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  ចូលប្រើ / Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Virtual Lab Learning Platform
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            ប្រព័ន្ធគ្រប់គ្រងការសិក្សាមន្ទីរពិសោធន៍និម្មិតសម្រាប់សាលារៀននៅកម្ពុជា
            <br />
            Empowering Cambodian schools with interactive virtual laboratories and comprehensive learning management
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/login">
              <Button size="lg" className="flex items-center gap-2">
                <LogIn className="h-5 w-5" />
                ចូលប្រើប្រាស់ / Get Started
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="flex items-center gap-2">
              <School className="h-5 w-5" />
              ស្វែងយល់បន្ថែម / Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            មុខងារសំខាន់ៗ / Key Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FlaskConical className="h-6 w-6 text-blue-600" />
                  Virtual Labs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Interactive virtual laboratory experiences with real-time simulations and experiments for science subjects
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-6 w-6 text-green-600" />
                  Auto-Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Intelligent auto-grading system with manual override options for comprehensive student evaluation
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                  Analytics Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Real-time analytics for teachers and parents to track student progress and performance
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-orange-600" />
                  Multi-Role Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Dedicated portals for students, teachers, parents, and administrators with role-specific features
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-6 w-6 text-red-600" />
                  Resource Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Upload and manage lab resources including HTML, DOCX, and PDF files with version control
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-6 w-6 text-indigo-600" />
                  Curriculum Builder
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Drag-and-drop curriculum planning with skills-based framework and learning objectives
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Platform Benefits */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            អត្ថប្រយោជន៍ / Platform Benefits
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <GraduationCap className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">For Students</h3>
                  <p className="text-gray-600">
                    Access interactive virtual labs, track progress, submit assignments, and receive instant feedback
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">For Teachers</h3>
                  <p className="text-gray-600">
                    Create engaging lab content, monitor student performance, and manage curriculum with ease
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">For Parents</h3>
                  <p className="text-gray-600">
                    Stay connected with your child's education, view progress reports, and communicate with teachers
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <School className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">For Schools</h3>
                  <p className="text-gray-600">
                    Comprehensive administration tools, analytics, and reporting for effective education management
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            ចាប់ផ្តើមធ្វើឱ្យការសិក្សាកាន់តែប្រសើរ / Start Your Learning Journey Today
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of students and teachers already using Virtual Lab LMS
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/login">
              <Button size="lg" variant="secondary" className="flex items-center gap-2">
                <LogIn className="h-5 w-5" />
                Login Now
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="flex items-center gap-2 bg-white/10 border-white text-white hover:bg-white/20">
              <UserPlus className="h-5 w-5" />
              Request Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto text-center text-gray-600">
          <p className="mb-2">© 2024 Virtual Lab LMS. All rights reserved.</p>
          <p className="text-sm">
            Empowering education in Cambodia 🇰🇭 | Built with Next.js and ❤️
          </p>
        </div>
      </footer>
    </div>
  );
}