'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { 
  Play, 
  Users, 
  GraduationCap, 
  BarChart3, 
  Beaker, 
  FlaskConical,
  Atom,
  Zap,
  Waves,
  Brain,
  Globe,
  School,
  LogIn,
  UserPlus,
  ArrowRight,
  Sparkles,
  Target,
  Heart
} from 'lucide-react';

// Icon mapping for simulations
const iconMap: Record<string, any> = {
  'Physics': Waves,
  'Chemistry': Atom,
  'Biology': Brain,
  'Mathematics': BarChart3,
  'pendulum-lab': Waves,
  'circuit-construction-kit': Zap,
  'build-a-molecule': Atom,
  'gene-expression-essentials': Brain,
  'function-builder': BarChart3,
  'graphing-lines': BarChart3,
  'wave-interference': Waves,
  'natural-selection': Brain,
  'ph-scale': Beaker
};

// Color mapping for subjects
const colorMap: Record<string, string> = {
  'Physics': 'bg-blue-500',
  'Chemistry': 'bg-green-500', 
  'Biology': 'bg-purple-500',
  'Mathematics': 'bg-orange-500'
};

export default function Home() {
  const router = useRouter();
  const [currentSim, setCurrentSim] = useState(0);
  const [featuredSims, setFeaturedSims] = useState<any[]>([]);
  const [simStats, setSimStats] = useState<any>(null);

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

    // Load featured simulations and statistics
    const loadData = async () => {
      try {
        // Fetch featured simulations
        const simsResponse = await fetch('/api/simulations?featured=true');
        if (simsResponse.ok) {
          const simsData = await simsResponse.json();
          if (simsData.success) {
            const formattedSims = simsData.simulations.map((sim: any) => ({
              title: sim.display_name_en,
              titleKm: sim.display_name_km,
              description: sim.description_en,
              descriptionKm: sim.description_km,
              icon: iconMap[sim.simulation_name] || iconMap[sim.subject_area] || Waves,
              color: colorMap[sim.subject_area] || 'bg-blue-500',
              subject: sim.subject_area,
              preview: sim.simulation_url || '#'
            }));
            setFeaturedSims(formattedSims);
          }
        }

        // Fetch simulation statistics
        const statsResponse = await fetch('/api/simulations/stats');
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          if (statsData.success) {
            setSimStats(statsData.stats);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    checkSession();
    loadData();
  }, [router]);

  // Auto-rotate featured simulations
  useEffect(() => {
    if (featuredSims.length > 0) {
      const interval = setInterval(() => {
        setCurrentSim((prev) => (prev + 1) % featuredSims.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [featuredSims]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="border-b bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="relative">
                <FlaskConical className="h-8 w-8 text-blue-600" />
                <Sparkles className="h-4 w-4 text-yellow-500 absolute -top-1 -right-1" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Virtual Lab Cambodia
                </h1>
                <p className="text-xs text-gray-500 font-medium">Interactive STEM Simulations</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" className="flex items-center gap-2 hover:bg-blue-50">
                <Globe className="h-4 w-4" />
                <span>ភាសាខ្មែរ</span>
              </Button>
              <Link href="/auth/login">
                <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <LogIn className="h-4 w-4" />
                  ចូលប្រើ / Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Interactive Preview */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 to-purple-100/20"></div>
        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4" />
                Inspired by PhET Interactive Simulations
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Discover Science
                </span>
                <br />
                <span className="text-gray-800">Through Play</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                <span className="font-medium text-blue-600">ស្វែងរកវិទ្យាសាស្ត្រតាមរយៈការលេង</span>
                <br />
                Interactive simulations that make complex concepts simple, engaging, and accessible to every Cambodian student.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/login">
                  <Button size="lg" className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Play className="h-5 w-5" />
                    Start Exploring / ចាប់ផ្តើមស្វែងរក
                  </Button>
                </Link>
                <Link href="/simulations">
                  <Button size="lg" variant="outline" className="flex items-center gap-2 border-2 hover:bg-blue-50">
                    <Target className="h-5 w-5" />
                    View Simulations
                  </Button>
                </Link>
              </div>
            </div>

            {/* Interactive Simulation Preview */}
            <div className="relative">
              {featuredSims.length > 0 ? (
                <div className="bg-white rounded-2xl shadow-2xl p-6 border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${featuredSims[currentSim]?.color || 'bg-blue-500'} flex items-center justify-center text-white`}>
                        {featuredSims[currentSim]?.icon && 
                          React.createElement(featuredSims[currentSim].icon, { className: "h-5 w-5" })
                        }
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{featuredSims[currentSim]?.title}</h3>
                        <p className="text-sm text-gray-500">{featuredSims[currentSim]?.titleKm}</p>
                      </div>
                    </div>
                    <div className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">
                      {featuredSims[currentSim]?.subject}
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg h-48 flex items-center justify-center mb-4 border-2 border-dashed border-gray-200">
                    <div className="text-center">
                      {featuredSims[currentSim]?.icon && 
                        React.createElement(featuredSims[currentSim].icon, { className: "h-12 w-12 text-gray-400 mx-auto mb-2" })
                      }
                      <p className="text-gray-500 text-sm">Interactive Simulation Preview</p>
                      <p className="text-gray-400 text-xs">{featuredSims[currentSim]?.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {featuredSims.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentSim(index)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentSim ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <Link href="/simulations">
                      <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-700">
                        Try Now <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-2xl p-6 border flex items-center justify-center h-80">
                  <div className="text-center">
                    <FlaskConical className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Loading simulations...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Subject Areas */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Explore STEM Subjects / ស្វែងរកមុខវិជ្ជា STEM
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Interactive simulations across physics, chemistry, biology, and mathematics—all designed for curious minds
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                icon: Waves, 
                title: "Physics", 
                titleKm: "រូបវិទ្យា", 
                count: simStats ? `${simStats.by_subject.Physics} Simulations` : "Loading...", 
                color: "blue" 
              },
              { 
                icon: Beaker, 
                title: "Chemistry", 
                titleKm: "គីមីវិទ្យា", 
                count: simStats ? `${simStats.by_subject.Chemistry} Simulations` : "Loading...", 
                color: "green" 
              },
              { 
                icon: Brain, 
                title: "Biology", 
                titleKm: "ជីវវិទ្យា", 
                count: simStats ? `${simStats.by_subject.Biology} Simulations` : "Loading...", 
                color: "purple" 
              },
              { 
                icon: BarChart3, 
                title: "Mathematics", 
                titleKm: "គណិតវិទ្យា", 
                count: simStats ? `${simStats.by_subject.Mathematics} Simulations` : "Loading...", 
                color: "orange" 
              }
            ].map((subject, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 mx-auto rounded-2xl bg-${subject.color}-100 flex items-center justify-center mb-4 group-hover:bg-${subject.color}-200 transition-colors`}>
                    <subject.icon className={`h-8 w-8 text-${subject.color}-600`} />
                  </div>
                  <CardTitle className="text-xl">{subject.title}</CardTitle>
                  <p className="text-sm text-gray-600 font-medium">{subject.titleKm}</p>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-gray-500">{subject.count}</p>
                  <Button variant="ghost" size="sm" className="mt-2 group-hover:bg-blue-50">
                    Explore <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Philosophy */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Learning Through Discovery / រៀនតាមរយៈការរកឃើញ
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our approach mirrors how real scientists work—by asking questions, forming hypotheses, and testing ideas
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: "Explore",
                titleKm: "ស្វែងរក",
                description: "Free play mode to build intuition and spark curiosity about scientific phenomena"
              },
              {
                icon: Beaker,
                title: "Investigate", 
                titleKm: "ស្រាវជ្រាវ",
                description: "Guided activities with specific learning goals and structured discovery paths"
              },
              {
                icon: Heart,
                title: "Apply",
                titleKm: "អនុវត្ត",
                description: "Real-world problem solving that connects science to everyday Cambodian life"
              }
            ].map((step, index) => (
              <div key={index} className="text-center group">
                <div className="w-20 h-20 mx-auto rounded-full bg-white shadow-lg flex items-center justify-center mb-6 group-hover:shadow-xl transition-shadow">
                  <step.icon className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-blue-600 font-medium mb-3">{step.titleKm}</p>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Educators */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Designed for Cambodian Educators
                <br />
                <span className="text-blue-600">សម្រាប់គ្រូបង្រៀនកម្ពុជា</span>
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Every simulation includes comprehensive teaching materials, assessment tools, and professional development resources—all culturally relevant and aligned with national curriculum standards.
              </p>
              
              <div className="space-y-4">
                {[
                  "Lesson plans with learning objectives",
                  "Real-time student progress tracking", 
                  "Bilingual content and instructions",
                  "Professional development workshops"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-green-600"></div>
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8">
              <div className="text-center">
                <GraduationCap className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Get Started?</h3>
                <p className="text-gray-600 mb-6">
                  Join our community of innovative educators transforming STEM education in Cambodia
                </p>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Teacher Resources
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-4xl mx-auto text-center relative">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform STEM Education?
            <br />
            <span className="text-blue-100">ត្រៀមខ្លួនបំប្លែងការអប់រំ STEM?</span>
          </h2>
          <p className="text-xl mb-8 opacity-90 leading-relaxed">
            Join thousands of students and teachers already discovering science through interactive simulations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/login">
              <Button size="lg" variant="secondary" className="flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50">
                <Play className="h-5 w-5" />
                Start Learning Today
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="flex items-center gap-2 border-white text-white hover:bg-white/10">
              <School className="h-5 w-5" />
              Request School Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <FlaskConical className="h-8 w-8 text-blue-400" />
                <div>
                  <h3 className="text-xl font-bold text-white">Virtual Lab Cambodia</h3>
                  <p className="text-sm text-gray-400">Interactive STEM Simulations</p>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed mb-4">
                Inspiring the next generation of Cambodian scientists, engineers, and innovators through world-class interactive simulations.
              </p>
              <p className="text-sm text-blue-400">🇰🇭 Proudly serving Cambodia's future</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Physics Simulations</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Chemistry Labs</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Biology Experiments</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Math Visualizations</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">For Educators</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Teacher Resources</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Professional Development</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Curriculum Alignment</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Assessment Tools</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 Virtual Lab Cambodia. Empowering STEM education with interactive simulations.
              <br />
              <span className="text-sm">Built with ❤️ for Cambodia's future scientists</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}