'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { 
  Search,
  Filter,
  Play,
  Users, 
  Clock,
  Star,
  GraduationCap,
  Beaker, 
  FlaskConical,
  Atom,
  Zap,
  Waves,
  Brain,
  BarChart3,
  ArrowRight,
  Sparkles,
  Globe,
  BookOpen,
  ArrowLeft,
  Trophy,
  Target,
  Eye
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
  'Physics': 'blue',
  'Chemistry': 'green', 
  'Biology': 'purple',
  'Mathematics': 'orange'
};

const difficultyColors = {
  "Beginner": "bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300",
  "Intermediate": "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300", 
  "Advanced": "bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300"
};

const difficultyEmojis = {
  "Beginner": "🌱",
  "Intermediate": "🌳",
  "Advanced": "🌲"
};

export default function SimulationsPage() {
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [simulations, setSimulations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<any[]>([]);
  const router = useRouter();

  // Load simulations from API
  useEffect(() => {
    const loadSimulations = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/simulations');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            // Transform API data to match component expectations
            const transformedSims = data.simulations.map((sim: any) => ({
              id: sim.id,
              title: sim.display_name_en,
              titleKm: sim.display_name_km,
              description: sim.description_en,
              descriptionKm: sim.description_km,
              subject: sim.subject_area,
              subjectKm: sim.subject_area === 'Physics' ? 'រូបវិទ្យា' : 
                        sim.subject_area === 'Chemistry' ? 'គីមីវិទ្យា' :
                        sim.subject_area === 'Biology' ? 'ជីវវិទ្យា' :
                        sim.subject_area === 'Mathematics' ? 'គណិតវិទ្យា' : sim.subject_area,
              grade: sim.grade_levels ? `${Math.min(...sim.grade_levels)}-${Math.max(...sim.grade_levels)}` : 'All',
              duration: sim.estimated_duration ? `${sim.estimated_duration} min` : '30 min',
              difficulty: sim.difficulty_level || 'Intermediate',
              rating: 4.5 + Math.random() * 0.5, // Random rating for demo
              users: sim.total_completions || 800 + Math.floor(Math.random() * 2000), // Use real data if available
              icon: iconMap[sim.simulation_name] || iconMap[sim.subject_area] || Waves,
              color: colorMap[sim.subject_area] || 'blue',
              topics: sim.tags || ['Science', 'Interactive'],
              preview: sim.simulation_url || '#',
              featured: sim.is_featured,
              progress: sim.user_average_score || 0,
              attempts: sim.user_attempts || 0,
              userTime: sim.user_total_time || 0,
              simulation_name: sim.simulation_name
            }));

            // Add the pendulum lab simulation as a featured example
            transformedSims.unshift({
              id: 'pendulum-demo',
              title: 'Pendulum Lab',
              titleKm: 'មន្ទីរពិសោធន៍ប៉ោល',
              description: 'Explore the physics of pendulums with this interactive simulation. Adjust length, mass, and gravity to see how they affect the period.',
              descriptionKm: 'ស្វែងយល់ពីរូបវិទ្យានៃប៉ោលជាមួយការធ្វើត្រាប់តាមអន្តរកម្មនេះ។',
              subject: 'Physics',
              subjectKm: 'រូបវិទ្យា',
              grade: '7-12',
              duration: '45 min',
              difficulty: 'Beginner',
              rating: 4.8,
              users: 1250,
              icon: Waves,
              color: 'blue',
              topics: ['Physics', 'Motion', 'Gravity'],
              preview: '/simulation_pendulum_lab_km.html',
              featured: true,
              progress: 0,
              attempts: 0,
              userTime: 0,
              simulation_name: 'pendulum-lab'
            });

            setSimulations(transformedSims);

            // Update subjects with counts
            const subjectCounts = transformedSims.reduce((acc: any, sim: any) => {
              acc[sim.subject] = (acc[sim.subject] || 0) + 1;
              return acc;
            }, {});

            const updatedSubjects = [
              { name: "All", nameKm: "ទាំងអស់", icon: BookOpen, color: "gray", count: transformedSims.length },
              { name: "Physics", nameKm: "រូបវិទ្យា", icon: Waves, color: "blue", count: subjectCounts.Physics || 0 },
              { name: "Chemistry", nameKm: "គីមីវិទ្យា", icon: Beaker, color: "green", count: subjectCounts.Chemistry || 0 },
              { name: "Biology", nameKm: "ជីវវិទ្យា", icon: Brain, color: "purple", count: subjectCounts.Biology || 0 },
              { name: "Mathematics", nameKm: "គណិតវិទ្យា", icon: BarChart3, color: "orange", count: subjectCounts.Mathematics || 0 }
            ];
            setSubjects(updatedSubjects);
          }
        }
      } catch (error) {
        console.error('Error loading simulations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSimulations();
  }, []);

  const filteredSimulations = simulations
    .filter(sim => {
      const matchesSubject = selectedSubject === "All" || sim.subject === selectedSubject;
      const matchesSearch = sim.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           sim.titleKm.includes(searchQuery) ||
                           sim.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSubject && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "rating": return b.rating - a.rating;
        case "popular": return b.users - a.users; 
        case "newest": return b.id === 'pendulum-demo' ? -1 : a.id === 'pendulum-demo' ? 1 : 0;
        default: return b.featured ? 1 : -1;
      }
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100 relative overflow-hidden">
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-purple-300 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 -left-20 w-80 h-80 bg-pink-300 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 right-1/3 w-48 h-48 bg-blue-300 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Navigation */}
      <nav className="border-b bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-lg relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="mr-2 hover:bg-purple-50"
              >
                <ArrowLeft className="h-5 w-5 text-purple-600" />
              </Button>
              <Link href="/" className="flex items-center gap-3">
                <div className="relative group">
                  <FlaskConical className="h-10 w-10 text-purple-600 transform group-hover:rotate-12 transition-transform" />
                  <Sparkles className="h-5 w-5 text-yellow-500 absolute -top-2 -right-2 animate-pulse" />
                  <Star className="h-3 w-3 text-pink-500 absolute -bottom-1 -left-1 animate-ping" />
                </div>
                <div>
                  <h1 className="text-2xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent animate-gradient-x">
                    Virtual Lab
                  </h1>
                  <p className="text-sm text-purple-600 font-bold font-hanuman">🚀វិទ្យាសាស្ត្រ</p>
                </div>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" className="flex items-center gap-2 font-hanuman font-bold">
                <Globe className="h-4 w-4" />
                <span>ភាសាខ្មែរ</span>
              </Button>
              <Button 
                onClick={() => router.push('/auth/login')}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 font-hanuman font-bold"
              >
                <Play className="h-4 w-4" />
                ចាប់ផ្តើមរៀន
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Header Section */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 px-6 py-3 rounded-full text-sm font-bold mb-6 animate-bounce">
            <Sparkles className="h-5 w-5" />
            <span className="font-hanuman">ការពិសោធន៍វិទ្យាសាស្ត្រអន្តរកម្មដោយឥតគិតថ្លៃ</span>
            <Sparkles className="h-5 w-5" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-6">
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent animate-gradient-x">
              ស្វែងរកវិទ្យាសាស្ត្រ
            </span>
            <br />
            <span className="text-purple-800">តាមរយៈការពិសោធន៍ 🧪</span>
          </h1>
          <p className="text-xl text-purple-700 mb-8 max-w-3xl mx-auto leading-relaxed font-hanuman font-semibold">
            រកឃើញរូបវិទ្យា គីមីវិទ្យា ជីវវិទ្យា និងគណិតវិទ្យាតាមរយៈការពិសោធន៍និម្មិតដែលរចនាឡើងសម្រាប់ចិត្តចង់ដឹងចង់ឃើញ។
          </p>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="px-4 mb-8">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-white/95 backdrop-blur border-2 border-purple-200 shadow-xl">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start lg:items-center">
                {/* Search */}
                <div className="relative w-full lg:flex-1">
                  <Search className="h-5 w-5 text-purple-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <Input
                    placeholder="ស្វែងរកការពិសោធន៍..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 font-hanuman text-lg border-2 border-purple-200 focus:border-purple-400"
                  />
                </div>

                {/* Subject Filter */}
                <div className="flex gap-2 flex-wrap w-full lg:w-auto justify-center lg:justify-start">
                  {subjects.map((subject) => (
                    <Button
                      key={subject.name}
                      variant={selectedSubject === subject.name ? "default" : "outline"}
                      onClick={() => setSelectedSubject(subject.name)}
                      className={`flex items-center gap-2 font-hanuman font-bold transform hover:scale-105 transition-all ${
                        selectedSubject === subject.name 
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
                          : 'border-2 border-purple-300 hover:bg-purple-50'
                      }`}
                    >
                      <subject.icon className="h-5 w-5" />
                      <span>{subject.nameKm}</span>
                      <Badge className="bg-white/20 text-xs">{subject.count}</Badge>
                    </Button>
                  ))}
                </div>

                {/* Sort */}
                <div className="flex items-center gap-2 w-full lg:w-auto">
                  <Filter className="h-5 w-5 text-purple-500" />
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border-2 border-purple-200 rounded-lg px-3 py-2 text-sm font-hanuman font-bold w-full lg:w-auto"
                  >
                    <option value="featured">ពិសេស</option>
                    <option value="rating">ពិន្ទុខ្ពស់</option>
                    <option value="popular">ពេញនិយម</option>
                    <option value="newest">ថ្មីបំផុត</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Simulations Grid */}
      <section className="px-4 pb-16">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-16">
              <div className="relative inline-block">
                <FlaskConical className="h-24 w-24 text-purple-400 mx-auto mb-4 animate-bounce" />
                <Sparkles className="h-10 w-10 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold text-purple-800 mb-2 font-hanuman">កំពុងផ្ទុកការពិសោធន៍...</h3>
              <p className="text-purple-600 font-hanuman">សូមរង់ចាំខណៈពេលយើងទាញយកមាតិកាចុងក្រោយបំផុត</p>
              <div className="flex justify-center mt-4 space-x-2">
                <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          ) : filteredSimulations.length === 0 ? (
            <div className="text-center py-16">
              <div className="relative inline-block">
                <FlaskConical className="h-24 w-24 text-purple-300 mx-auto mb-4" />
                <Sparkles className="h-10 w-10 text-yellow-400 absolute -top-2 -right-2 animate-spin" />
              </div>
              <h3 className="text-2xl font-bold text-purple-800 mb-2 font-hanuman">រកមិនឃើញការពិសោធន៍ទេ!</h3>
              <p className="text-purple-600 font-hanuman">សូមសាកល្បងកែសម្រួលការស្វែងរក ឬតម្រងរបស់អ្នក</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredSimulations.map((sim) => {
                const SubjectIcon = sim.icon;
                const subjectColor = sim.color;
                
                return (
                  <Card 
                    key={sim.id} 
                    className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group cursor-pointer border-2 border-transparent hover:border-purple-300 bg-gradient-to-br from-white to-purple-50 relative overflow-hidden"
                  >
                    {sim.featured && (
                      <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-1 rounded-bl-xl text-xs font-bold flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        ពិសេស
                      </div>
                    )}
                    
                    <CardHeader className="pb-4">
                      <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-2 sm:gap-0">
                        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-${subjectColor}-100 to-${subjectColor}-200 flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-all shadow-lg`}>
                          <SubjectIcon className={`h-6 w-6 sm:h-7 sm:w-7 text-${subjectColor}-600 group-hover:animate-pulse`} />
                        </div>
                        <Badge className={`${difficultyColors[sim.difficulty]} font-hanuman font-bold text-xs px-3 py-1 border`}>
                          {sim.difficulty === 'Beginner' ? 'មូលដ្ឋាន' : 
                           sim.difficulty === 'Intermediate' ? 'មធ្យម' : 'ខ្ពស់'} {difficultyEmojis[sim.difficulty]}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg leading-tight">
                        <span className="font-black text-purple-800 font-hanuman">{sim.titleKm}</span>
                        <p className="text-sm font-semibold text-purple-600 mt-1">{sim.title}</p>
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <CardDescription className="text-sm leading-relaxed font-hanuman text-purple-700">
                        {sim.descriptionKm || sim.description}
                      </CardDescription>
                      
                      <div className="flex flex-wrap gap-2">
                        {sim.topics.slice(0, 3).map((topic, index) => (
                          <span key={index} className="text-xs bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-3 py-1 rounded-full font-bold">
                            {topic}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 text-sm text-purple-600">
                        <div className="flex items-center gap-2 sm:gap-4">
                          <div className="flex items-center gap-1">
                            <GraduationCap className="h-4 w-4" />
                            <span className="font-hanuman">ថ្នាក់ {sim.grade}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{sim.duration}</span>
                          </div>
                        </div>
                      </div>

                      {sim.progress > 0 && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-hanuman font-bold text-purple-700">វឌ្ឍនភាព</span>
                            <span className="font-black text-purple-800">{Math.round(sim.progress)}%</span>
                          </div>
                          <Progress value={sim.progress} className="h-3 bg-purple-100" />
                        </div>
                      )}
                      
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                        <div className="flex items-center gap-2 sm:gap-3 text-sm text-purple-500">
                          <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded-full">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-bold text-yellow-700">{sim.rating.toFixed(1)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span className="font-hanuman">{sim.users.toLocaleString()}</span>
                          </div>
                        </div>
                        
                        <Button 
                          size="sm" 
                          className={`bg-gradient-to-r from-${subjectColor}-500 to-${subjectColor}-600 hover:from-${subjectColor}-600 hover:to-${subjectColor}-700 group-hover:scale-110 transition-all shadow-lg font-bold font-hanuman`}
                          onClick={() => {
                            if (sim.id === 'pendulum-demo') {
                              window.open(sim.preview, '_blank');
                            } else {
                              router.push(`/simulation/${sim.id}`);
                            }
                          }}
                        >
                          {sim.attempts > 0 ? (
                            <>
                              <Eye className="h-4 w-4 mr-1" />
                              បន្ត 🎮
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-1" />
                              ចាប់ផ្តើម 🚀
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-white/10 rounded-full"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl font-black mb-6 font-hanuman">
            ត្រៀមខ្លួនចាប់ផ្តើមរៀន? 🎯
            <br />
            <span className="text-purple-200">Ready to Start Learning?</span>
          </h2>
          <p className="text-xl mb-8 opacity-90 font-hanuman">
            បង្កើតគណនីឥតគិតថ្លៃរបស់អ្នក ហើយចាប់ផ្តើមស្វែងរកការពិសោធន៍វិទ្យាសាស្ត្រអន្តរកម្មថ្ងៃនេះ
          </p>
          <Button 
            size="lg" 
            onClick={() => router.push('/auth/register')}
            className="bg-white text-purple-600 hover:bg-purple-50 font-hanuman font-bold text-lg px-8 py-4 transform hover:scale-105 transition-all shadow-lg"
          >
            <Sparkles className="h-6 w-6 mr-2" />
            ចាប់ផ្តើមដោយឥតគិតថ្លៃ
          </Button>
        </div>
      </section>
    </div>
  );
}