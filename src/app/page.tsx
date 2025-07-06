'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useLanguage } from '../components/LanguageProvider';
import { LanguageTogglePill } from '../components/LanguageToggle';
import { useGuestSession } from '../hooks/useGuestSession';
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
  Heart,
  Clock,
  CheckCircle
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
  const { t, getFontClass, language } = useLanguage();
  const { createGuestSession, isLoading: guestLoading } = useGuestSession();

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
        // Use hardcoded demo data for now
        const demoSimulations = [
          {
            id: 'pendulum-lab',
            title: 'Pendulum Lab',
            titleKm: 'មន្ទីរពិសោធន៍ប៉ោល',
            description: 'Explore the motion of pendulums and discover how length, mass, and angle affect the period.',
            descriptionKm: 'ស្វែងយល់ពីចលនាប៉ោល និងរកឃើញពីរបៀបដែលប្រវែង ម៉ាស់ និងមុំប៉ះពាល់លើរយៈពេល។',
            icon: iconMap['pendulum-lab'] || Waves,
            color: colorMap['Physics'],
            subject: 'Physics',
            preview: 'https://phet.colorado.edu/sims/html/pendulum-lab/latest/pendulum-lab_en.html',
            previewImage: '/images/simulations/pendulum-lab.png',
            difficulty: 'Intermediate',
            duration: 45,
            objectives: ['Understand pendulum motion', 'Investigate factors affecting period', 'Apply to real-world situations']
          },
          {
            id: 'circuit-kit',
            title: 'Circuit Construction Kit',
            titleKm: 'ឧបករណ៍សាងសង់សៀគ្វីអគ្គិសនី',
            description: 'Build circuits with resistors, light bulbs, batteries, and switches.',
            descriptionKm: 'សាងសង់សៀគ្វីអគ្គិសនីជាមួយរេស៊ីស្ទ័រ អំពូលភ្លើង ថ្ម និងកុងតាក់។',
            icon: iconMap['circuit-construction-kit'] || Zap,
            color: colorMap['Physics'],
            subject: 'Physics',
            preview: 'https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_en.html',
            difficulty: 'Beginner',
            duration: 30,
            objectives: ['Build simple circuits', 'Understand current and voltage', 'Identify conductors']
          },
          {
            id: 'build-molecule',
            title: 'Build a Molecule',
            titleKm: 'សាងសង់ម៉ូលេគុល',
            description: 'Construct simple molecules from atoms. Learn about molecular structure.',
            descriptionKm: 'សាងសង់ម៉ូលេគុលសាមញ្ញពីអាតូម។ រៀនអំពីរចនាសម្ព័ន្ធម៉ូលេគុល។',
            icon: iconMap['build-a-molecule'] || Atom,
            color: colorMap['Chemistry'],
            subject: 'Chemistry',
            preview: 'https://phet.colorado.edu/sims/html/build-a-molecule/latest/build-a-molecule_en.html',
            difficulty: 'Beginner',
            duration: 30,
            objectives: ['Build molecules from atoms', 'Understand molecular formulas', 'Recognize structures']
          },
          {
            id: 'ph-scale',
            title: 'pH Scale',
            titleKm: 'មាត្រដ្ឋាន pH',
            description: 'Test the pH of everyday liquids. Explore acids and bases.',
            descriptionKm: 'សាកល្បង pH នៃសារធាតុរាវប្រចាំថ្ងៃ។ ស្វែងយល់ពីអាស៊ីត និងបាស។',
            icon: iconMap['ph-scale'] || Beaker,
            color: colorMap['Chemistry'],
            subject: 'Chemistry',
            preview: 'https://phet.colorado.edu/sims/html/ph-scale/latest/ph-scale_en.html',
            difficulty: 'Intermediate',
            duration: 40,
            objectives: ['Measure pH of substances', 'Understand acids and bases', 'Relate pH to ion concentration']
          },
          {
            id: 'natural-selection',
            title: 'Natural Selection',
            titleKm: 'ការជ្រើសរើសធម្មជាតិ',
            description: 'Explore how environmental pressures affect trait distribution.',
            descriptionKm: 'ស្វែងយល់ពីរបៀបដែលសម្ពាធបរិស្ថានប៉ះពាល់លើការចែកចាយលក្ខណៈ។',
            icon: iconMap['natural-selection'] || Brain,
            color: colorMap['Biology'],
            subject: 'Biology',
            preview: 'https://phet.colorado.edu/sims/html/natural-selection/latest/natural-selection_en.html',
            difficulty: 'Intermediate',
            duration: 45,
            objectives: ['Understand natural selection', 'Observe trait changes', 'Explore evolution factors']
          },
          {
            id: 'graphing-lines',
            title: 'Graphing Lines',
            titleKm: 'គូសក្រាហ្វបន្ទាត់',
            description: 'Graph linear equations and explore slope-intercept form.',
            descriptionKm: 'គូសក្រាហ្វសមីការលីនេអ៊ែរ និងស្វែងយល់ទម្រង់ជម្រាល។',
            icon: iconMap['graphing-lines'] || BarChart3,
            color: colorMap['Mathematics'],
            subject: 'Mathematics',
            preview: 'https://phet.colorado.edu/sims/html/graphing-lines/latest/graphing-lines_en.html',
            difficulty: 'Beginner',
            duration: 30,
            objectives: ['Graph linear equations', 'Understand slope', 'Connect equations to graphs']
          }
        ];

        setFeaturedSims(demoSimulations);
        setSimStats({
          total: 10,
          featured: 6,
          by_subject: {
            Physics: 3,
            Chemistry: 3,
            Biology: 2,
            Mathematics: 2
          }
        });
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    checkSession();
    loadData();
  }, [router, language]);

  const handleGuestSimulationAccess = async (simId: string) => {
    try {
      // Create guest session
      await createGuestSession();
      
      // Navigate to simulation
      router.push(`/simulation/${simId}`);
    } catch (error) {
      console.error('Failed to start guest simulation:', error);
      // Fallback to login
      router.push('/auth/login');
    }
  };

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
                <h1 className={`text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ${getFontClass()}`}>
                  {t('home.title')}
                </h1>
                <p className={`text-xs text-gray-500 font-medium ${getFontClass()}`}>{t('home.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <LanguageTogglePill />
              <Link href="/auth/login">
                <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-xl transition-all duration-300">
                  <LogIn className="h-4 w-4" />
                  {t('ui.login')}
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
              <div className={`inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6 ${getFontClass()}`}>
                <Sparkles className="h-4 w-4" />
                {t('home.inspired_by')}
              </div>
              <h1 className={`text-5xl md:text-6xl font-bold mb-6 leading-tight ${getFontClass()}`}>
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {t('home.hero_title')}
                </span>
                <br />
                <span className="text-gray-800">{t('home.hero_subtitle')}</span>
              </h1>
              <p className={`text-xl text-gray-600 mb-8 leading-relaxed ${getFontClass()}`}>
                {t('home.hero_description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/login">
                  <Button size="lg" className={`flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 ${getFontClass()}`}>
                    <Play className="h-5 w-5" />
                    {t('home.start_exploring')}
                  </Button>
                </Link>
                <Link href="/simulations">
                  <Button size="lg" variant="outline" className={`flex items-center gap-2 border-2 hover:bg-blue-50 ${getFontClass()}`}>
                    <Target className="h-5 w-5" />
                    {t('home.view_simulations')}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Interactive Simulation Preview */}
            <div className="relative">
              {featuredSims.length > 0 ? (
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl ${featuredSims[currentSim]?.color || 'bg-blue-500'} flex items-center justify-center text-white shadow-lg`}>
                          {featuredSims[currentSim]?.icon && 
                            React.createElement(featuredSims[currentSim].icon, { className: "h-6 w-6" })
                          }
                        </div>
                        <div>
                          <h3 className={`text-lg font-semibold text-gray-900 ${getFontClass()}`}>
                            {language === 'km' ? featuredSims[currentSim]?.titleKm : featuredSims[currentSim]?.title}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                            <span className="bg-gray-100 px-2 py-1 rounded-full">
                              {featuredSims[currentSim]?.subject}
                            </span>
                            <span className="flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              {featuredSims[currentSim]?.difficulty}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {featuredSims[currentSim]?.duration} min
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl h-64 flex items-center justify-center mb-4 relative overflow-hidden group cursor-pointer">
                      {featuredSims[currentSim]?.previewImage ? (
                        <img 
                          src={featuredSims[currentSim].previewImage} 
                          alt={featuredSims[currentSim].title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-6">
                          {featuredSims[currentSim]?.icon && 
                            React.createElement(featuredSims[currentSim].icon, { 
                              className: "h-16 w-16 text-gray-300 mx-auto mb-3 group-hover:scale-110 transition-transform" 
                            })
                          }
                          <p className={`text-gray-600 text-sm font-medium mb-2 ${getFontClass()}`}>
                            {t('home.simulation_preview')}
                          </p>
                          <p className={`text-gray-500 text-xs leading-relaxed max-w-sm mx-auto ${getFontClass()}`}>
                            {language === 'km' ? featuredSims[currentSim]?.descriptionKm : featuredSims[currentSim]?.description}
                          </p>
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-lg">
                            <Play className="h-8 w-8 text-blue-600" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Learning Objectives */}
                    {featuredSims[currentSim]?.objectives && featuredSims[currentSim].objectives.length > 0 && (
                      <div className="mb-4">
                        <h4 className={`text-sm font-semibold text-gray-700 mb-2 ${getFontClass()}`}>
                          {t('home.learning_objectives')}:
                        </h4>
                        <ul className="space-y-1">
                          {featuredSims[currentSim].objectives.slice(0, 3).map((objective: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                              <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className={getFontClass()}>{objective}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
                    <div className="flex gap-1">
                      {featuredSims.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentSim(index)}
                          className={`w-8 h-1.5 rounded-full transition-all ${
                            index === currentSim ? 'bg-blue-600 w-12' : 'bg-gray-300 hover:bg-gray-400'
                          }`}
                        />
                      ))}
                    </div>
                    <Link href={`/simulations?preview=${featuredSims[currentSim]?.id}`}>
                      <Button size="sm" className={`bg-blue-600 hover:bg-blue-700 text-white ${getFontClass()}`}>
                        {t('home.try_now')} <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-2xl p-6 border flex items-center justify-center h-80">
                  <div className="text-center">
                    <FlaskConical className="h-16 w-16 text-gray-300 mx-auto mb-4 animate-pulse" />
                    <p className={`text-gray-500 ${getFontClass()}`}>{t('ui.loading')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Simulations Showcase */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-10 w-64 h-64 bg-blue-100 rounded-full opacity-30 blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-100 rounded-full opacity-20 blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            {/* Enhanced badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full text-sm font-bold mb-6 shadow-lg backdrop-blur-sm">
              <Sparkles className="h-5 w-5 animate-pulse" />
              {t('home.featured_simulations')}
              <div className="absolute inset-0 rounded-full bg-white opacity-20 animate-ping"></div>
            </div>
            
            {/* Enhanced title */}
            <h2 className={`text-4xl md:text-5xl font-bold text-gray-900 mb-6 ${getFontClass()}`}>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t('home.popular_simulations')}
              </span>
            </h2>
            
            {/* Enhanced description */}
            <p className={`text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed ${getFontClass()}`}>
              {t('home.popular_simulations_description')}
            </p>
            
            {/* Decorative line */}
            <div className="flex items-center justify-center mt-8 mb-4">
              <div className="h-1 w-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
              <Sparkles className="h-6 w-6 text-blue-600 mx-4" />
              <div className="h-1 w-24 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"></div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredSims.slice(0, 6).map((sim, index) => (
              <div key={index} className="group relative">
                {/* IXL-inspired card with floating effect */}
                <div className="relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-gray-200 hover:-translate-y-2 transform">
                  
                  {/* Animated gradient border */}
                  <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className={`absolute inset-[1px] rounded-3xl bg-gradient-to-r ${sim.color.includes('blue') ? 'from-blue-400 to-cyan-400' : sim.color.includes('green') ? 'from-green-400 to-emerald-400' : sim.color.includes('purple') ? 'from-purple-400 to-pink-400' : 'from-orange-400 to-yellow-400'} opacity-20`}></div>
                  </div>

                  {/* Header with animated background */}
                  <div className={`relative h-48 overflow-hidden bg-gradient-to-br ${sim.color.includes('blue') ? 'from-blue-50 to-cyan-50' : sim.color.includes('green') ? 'from-green-50 to-emerald-50' : sim.color.includes('purple') ? 'from-purple-50 to-pink-50' : 'from-orange-50 to-yellow-50'}`}>
                    
                    {/* Floating geometric shapes */}
                    <div className="absolute inset-0 overflow-hidden">
                      <div className={`absolute -top-4 -right-4 w-24 h-24 rounded-full ${sim.color.includes('blue') ? 'bg-blue-200' : sim.color.includes('green') ? 'bg-green-200' : sim.color.includes('purple') ? 'bg-purple-200' : 'bg-orange-200'} opacity-20 group-hover:scale-110 transition-transform duration-700`}></div>
                      <div className={`absolute -bottom-6 -left-6 w-32 h-32 rounded-full ${sim.color.includes('blue') ? 'bg-cyan-200' : sim.color.includes('green') ? 'bg-emerald-200' : sim.color.includes('purple') ? 'bg-pink-200' : 'bg-yellow-200'} opacity-15 group-hover:scale-110 transition-transform duration-700 delay-100`}></div>
                    </div>

                    {/* Subject badge with glass effect */}
                    <div className="absolute top-4 right-4 z-20">
                      <div className={`${sim.color} text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg backdrop-blur-sm bg-opacity-90 border border-white/20`}>
                        {sim.subject}
                      </div>
                    </div>

                    {/* Main content area */}
                    <div className="relative z-10 h-full flex items-center justify-center p-6">
                      {sim.previewImage ? (
                        <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-xl">
                          <img 
                            src={sim.previewImage} 
                            alt={sim.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className={`w-20 h-20 mx-auto rounded-2xl ${sim.color.replace('bg-', 'bg-')} bg-opacity-20 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg`}>
                            {sim.icon && React.createElement(sim.icon, { 
                              className: `h-10 w-10 ${sim.color.replace('bg-', 'text-')} opacity-80 group-hover:opacity-100 transition-opacity` 
                            })}
                          </div>
                          <div className="space-y-2">
                            <div className={`h-3 w-24 mx-auto rounded-full ${sim.color.replace('bg-', 'bg-')} opacity-20`}></div>
                            <div className={`h-2 w-16 mx-auto rounded-full ${sim.color.replace('bg-', 'bg-')} opacity-15`}></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Floating play button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-30">
                      <div className="bg-white/95 backdrop-blur-sm rounded-full p-4 shadow-2xl transform scale-75 group-hover:scale-100 transition-transform duration-300">
                        <Play className={`h-8 w-8 ${sim.color.replace('bg-', 'text-')} ml-1`} />
                      </div>
                    </div>
                  </div>
                  
                  {/* Card content with enhanced styling */}
                  <div className="p-6 relative">
                    {/* Title section */}
                    <div className="mb-4">
                      <h3 className={`font-bold text-xl text-gray-900 mb-2 group-hover:text-gray-800 transition-colors ${getFontClass()}`}>
                        {language === 'km' ? sim.titleKm : sim.title}
                      </h3>
                      <p className={`text-sm text-gray-600 leading-relaxed ${getFontClass()}`}>
                        {language === 'km' ? sim.descriptionKm : sim.description}
                      </p>
                    </div>

                    {/* Stats with enhanced icons */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <div className={`p-1.5 rounded-lg ${sim.color.replace('bg-', 'bg-')} bg-opacity-10`}>
                            <Target className={`h-3.5 w-3.5 ${sim.color.replace('bg-', 'text-')}`} />
                          </div>
                          <span className="font-medium">{sim.difficulty}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <div className={`p-1.5 rounded-lg ${sim.color.replace('bg-', 'bg-')} bg-opacity-10`}>
                            <Clock className={`h-3.5 w-3.5 ${sim.color.replace('bg-', 'text-')}`} />
                          </div>
                          <span className="font-medium">{sim.duration} min</span>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced CTA button */}
                    <Button 
                      onClick={() => handleGuestSimulationAccess(sim.id)}
                      disabled={guestLoading}
                      className={`w-full h-12 rounded-xl font-semibold text-base ${sim.color} hover:opacity-90 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl ${getFontClass()} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {guestLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          {t('home.loading')}
                        </>
                      ) : (
                        <>
                          <Play className="h-5 w-5 mr-2" />
                          {t('home.start_simulation')}
                          <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Bottom accent border */}
                  <div className={`h-1 w-full ${sim.color} opacity-60 group-hover:opacity-100 transition-opacity duration-300`}></div>
                </div>

                {/* Floating elements for extra visual appeal */}
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200"></div>
                <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-500 delay-300"></div>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Link href="/simulations">
              <Button size="lg" className={`px-8 py-4 text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 border-0 ${getFontClass()}`}>
                <FlaskConical className="h-6 w-6 mr-3" />
                {t('home.view_all_simulations')} 
                <ArrowRight className="h-6 w-6 ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Subject Areas */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold text-gray-900 mb-4 ${getFontClass()}`}>
              {t('home.explore_subjects')}
            </h2>
            <p className={`text-gray-600 max-w-2xl mx-auto ${getFontClass()}`}>
              {t('home.subjects_description')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                icon: Waves, 
                titleKey: "subjects.physics", 
                count: simStats ? `${simStats.by_subject.Physics} ${t('ui.simulations')}` : t('ui.loading'), 
                color: "blue" 
              },
              { 
                icon: Beaker, 
                titleKey: "subjects.chemistry", 
                count: simStats ? `${simStats.by_subject.Chemistry} ${t('ui.simulations')}` : t('ui.loading'), 
                color: "green" 
              },
              { 
                icon: Brain, 
                titleKey: "subjects.biology", 
                count: simStats ? `${simStats.by_subject.Biology} ${t('ui.simulations')}` : t('ui.loading'), 
                color: "purple" 
              },
              { 
                icon: BarChart3, 
                titleKey: "subjects.mathematics", 
                count: simStats ? `${simStats.by_subject.Mathematics} ${t('ui.simulations')}` : t('ui.loading'), 
                color: "orange" 
              }
            ].map((subject, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 mx-auto rounded-2xl bg-${subject.color}-100 flex items-center justify-center mb-4 group-hover:bg-${subject.color}-200 transition-colors`}>
                    <subject.icon className={`h-8 w-8 text-${subject.color}-600`} />
                  </div>
                  <CardTitle className={`text-xl ${getFontClass()}`}>{t(subject.titleKey)}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className={`text-sm text-gray-500 ${getFontClass()}`}>{subject.count}</p>
                  <Button variant="ghost" size="sm" className={`mt-2 group-hover:bg-blue-50 ${getFontClass()}`}>
                    {t('ui.explore')} <ArrowRight className="h-4 w-4 ml-1" />
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
            <h2 className={`text-3xl font-bold text-gray-900 mb-4 ${getFontClass()}`}>
              {t('home.learning_philosophy')}
            </h2>
            <p className={`text-gray-600 max-w-2xl mx-auto ${getFontClass()}`}>
              {t('home.philosophy_description')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                titleKey: "home.explore",
                descriptionKey: "home.explore_description"
              },
              {
                icon: Beaker,
                titleKey: "home.investigate",
                descriptionKey: "home.investigate_description"
              },
              {
                icon: Heart,
                titleKey: "home.apply",
                descriptionKey: "home.apply_description"
              }
            ].map((step, index) => (
              <div key={index} className="text-center group">
                <div className="w-20 h-20 mx-auto rounded-full bg-white shadow-lg flex items-center justify-center mb-6 group-hover:shadow-xl transition-shadow">
                  <step.icon className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className={`text-xl font-semibold text-gray-900 mb-2 ${getFontClass()}`}>{t(step.titleKey)}</h3>
                <p className={`text-gray-600 leading-relaxed ${getFontClass()}`}>{t(step.descriptionKey)}</p>
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
              <h2 className={`text-3xl font-bold text-gray-900 mb-6 ${getFontClass()}`}>
                {t('home.for_educators')}
              </h2>
              <p className={`text-gray-600 mb-8 leading-relaxed ${getFontClass()}`}>
                {t('home.educators_description')}
              </p>
              
              <div className="space-y-4">
                {[
                  t('home.feature_lesson_plans'),
                  t('home.feature_progress_tracking'), 
                  t('home.feature_bilingual'),
                  t('home.feature_development')
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-green-600"></div>
                    </div>
                    <span className={`text-gray-700 ${getFontClass()}`}>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8">
              <div className="text-center">
                <GraduationCap className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h3 className={`text-xl font-semibold text-gray-900 mb-2 ${getFontClass()}`}>{t('home.ready_to_start')}</h3>
                <p className={`text-gray-600 mb-6 ${getFontClass()}`}>
                  {t('home.join_community')}
                </p>
                <Button className={`bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 ${getFontClass()}`}>
                  {t('home.teacher_resources')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {/* <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-4xl mx-auto text-center relative">
          <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${getFontClass()}`}>
            {t('home.cta_title')}
          </h2>
          <p className={`text-xl mb-8 opacity-90 leading-relaxed ${getFontClass()}`}>
            {t('home.cta_description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/login">
              <Button size="lg" variant="secondary" className={`flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 ${getFontClass()}`}>
                <Play className="h-5 w-5" />
                {t('home.start_learning')}
              </Button>
            </Link>
            <Button size="lg" variant="outline" className={`flex items-center gap-2 border-white text-white hover:bg-white/10 ${getFontClass()}`}>
              <School className="h-5 w-5" />
              {t('home.request_demo')}
            </Button>
          </div>
        </div>
      </section> */}

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto">
          {/* <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <FlaskConical className="h-8 w-8 text-blue-400" />
                <div>
                  <h3 className={`text-xl font-bold text-white ${getFontClass()}`}>{t('home.title')}</h3>
                  <p className={`text-sm text-gray-400 ${getFontClass()}`}>{t('home.subtitle')}</p>
                </div>
              </div>
              <p className={`text-gray-400 leading-relaxed mb-4 ${getFontClass()}`}>
                {t('home.footer_description')}
              </p>
              <p className={`text-sm text-blue-400 ${getFontClass()}`}>{t('home.proudly_serving')}</p>
            </div>
            
            <div>
              <h4 className={`font-semibold text-white mb-4 ${getFontClass()}`}>{t('footer.quick_links')}</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className={`hover:text-blue-400 transition-colors ${getFontClass()}`}>{t('footer.physics_sims')}</a></li>
                <li><a href="#" className={`hover:text-blue-400 transition-colors ${getFontClass()}`}>{t('footer.chemistry_labs')}</a></li>
                <li><a href="#" className={`hover:text-blue-400 transition-colors ${getFontClass()}`}>{t('footer.biology_experiments')}</a></li>
                <li><a href="#" className={`hover:text-blue-400 transition-colors ${getFontClass()}`}>{t('footer.math_visualizations')}</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className={`font-semibold text-white mb-4 ${getFontClass()}`}>{t('footer.for_educators')}</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className={`hover:text-blue-400 transition-colors ${getFontClass()}`}>{t('footer.teacher_resources')}</a></li>
                <li><a href="#" className={`hover:text-blue-400 transition-colors ${getFontClass()}`}>{t('footer.professional_development')}</a></li>
                <li><a href="#" className={`hover:text-blue-400 transition-colors ${getFontClass()}`}>{t('footer.curriculum_alignment')}</a></li>
                <li><a href="#" className={`hover:text-blue-400 transition-colors ${getFontClass()}`}>{t('footer.assessment_tools')}</a></li>
              </ul>
            </div>
          </div> */}
          
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className={`text-gray-400 ${getFontClass()}`}>
              {t('footer.copyright')}
              <br />
              <span className="text-sm">{t('footer.built_with_love')}</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}