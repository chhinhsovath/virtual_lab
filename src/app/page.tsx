'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useLanguage } from '../components/LanguageProvider';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
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
  const { t, getFontClass, language } = useLanguage();

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
                <h1 className={`text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ${getFontClass()}`}>
                  {t('home.title')}
                </h1>
                <p className={`text-xs text-gray-500 font-medium ${getFontClass()}`}>{t('home.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <Link href="/auth/login">
                <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
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
                <div className="bg-white rounded-2xl shadow-2xl p-6 border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${featuredSims[currentSim]?.color || 'bg-blue-500'} flex items-center justify-center text-white`}>
                        {featuredSims[currentSim]?.icon && 
                          React.createElement(featuredSims[currentSim].icon, { className: "h-5 w-5" })
                        }
                      </div>
                      <div>
                        <h3 className={`font-semibold text-gray-900 ${getFontClass()}`}>
                          {language === 'km' ? featuredSims[currentSim]?.titleKm : featuredSims[currentSim]?.title}
                        </h3>
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
                      <p className={`text-gray-500 text-sm ${getFontClass()}`}>{t('home.simulation_preview')}</p>
                      <p className={`text-gray-400 text-xs ${getFontClass()}`}>
                        {language === 'km' ? featuredSims[currentSim]?.descriptionKm : featuredSims[currentSim]?.description}
                      </p>
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
                      <Button size="sm" variant="ghost" className={`text-blue-600 hover:text-blue-700 ${getFontClass()}`}>
                        {t('home.try_now')} <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-2xl p-6 border flex items-center justify-center h-80">
                  <div className="text-center">
                    <FlaskConical className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className={`text-gray-500 ${getFontClass()}`}>{t('ui.loading')}</p>
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
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white relative overflow-hidden">
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
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
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
          </div>
          
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