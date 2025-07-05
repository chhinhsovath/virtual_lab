'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
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
  BookOpen
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
  {
    id: 1,
    title: "Pendulum Lab",
    titleKm: "ភេនឌុលម៉ាម",
    description: "Explore the physics of pendular motion, investigating how length, mass, and gravity affect the period of a pendulum.",
    descriptionKm: "ស្វែងយល់រូបវិទ្យាចលនាភេនឌុលម៉ាម ស្រាវជ្រាវពីរបៀបដែលប្រវែង បរិមាណ និងទំនាញផែនដីប៉ះពាល់ដល់រយៈពេលភេនឌុលម៉ាម។",
    subject: "Physics",
    subjectKm: "រូបវិទ្យា",
    grade: "9-12",
    duration: "45 min",
    difficulty: "Intermediate",
    rating: 4.8,
    users: 1250,
    icon: Waves,
    color: "blue",
    topics: ["Motion", "Energy", "Gravity", "Mathematical Relationships"],
    preview: "/simulation_pendulum_lab_km.html",
    featured: true
  },
  {
    id: 2,
    title: "Circuit Construction Kit",
    titleKm: "បង្កើតសៀគ្វីអគ្គិសនី",
    description: "Build circuits with resistors, light bulbs, batteries, and switches. Take measurements with realistic ammeter and voltmeter.",
    descriptionKm: "បង្កើតសៀគ្វីជាមួយទប់ធ្វើ ក្រុមភ្លើង ថ្ម និងកុងតាក់។ វាស់ស្ទង់ដោយប្រើឧបករណ៍វាស់អំពេរ និងវ៉ុលមេទ័រ។",
    subject: "Physics", 
    subjectKm: "រូបវិទ្យា",
    grade: "6-12",
    duration: "60 min",
    difficulty: "Beginner",
    rating: 4.9,
    users: 2100,
    icon: Zap,
    color: "yellow",
    topics: ["Electricity", "Current", "Voltage", "Resistance"],
    preview: "#",
    featured: true
  },
  {
    id: 3,
    title: "Build a Molecule",
    titleKm: "បង្កើតម៉ូលេគុល",
    description: "Build molecules using atoms and see how they connect to form compounds. Explore 3D molecular structures.",
    descriptionKm: "បង្កើតម៉ូលេគុលដោយប្រើអាតូម និងមើលពីរបៀបដែលពួកវាភ្ជាប់គ្នាបង្កើតជាសមាសធាតុ។ ស្វែងយល់រចនាសម្ព័ន្ធម៉ូលេគុល 3D។",
    subject: "Chemistry",
    subjectKm: "គីមីវិទ្យា", 
    grade: "6-12",
    duration: "30 min",
    difficulty: "Beginner",
    rating: 4.7,
    users: 1800,
    icon: Atom,
    color: "green",
    topics: ["Molecular Structure", "Chemical Bonds", "Atoms", "Compounds"],
    preview: "#",
    featured: false
  },
  {
    id: 4,
    title: "Gene Expression Essentials",
    titleKm: "ការបញ្ចេញហ្សែនសំខាន់ៗ",
    description: "Explore how genes are turned on and off, and how this affects the traits of living organisms.",
    descriptionKm: "ស្វែងយល់ពីរបៀបដែលហ្សែនត្រូវបានបើក និងបិទ និងវាប៉ះពាល់យ៉ាងណាដល់លក្ខណៈរបស់សារពាង្គកម្ម។",
    subject: "Biology",
    subjectKm: "ជីវវិទ្យា",
    grade: "9-12", 
    duration: "40 min",
    difficulty: "Advanced",
    rating: 4.6,
    users: 950,
    icon: Brain,
    color: "purple",
    topics: ["DNA", "RNA", "Protein Synthesis", "Genetics"],
    preview: "#",
    featured: false
  },
  {
    id: 5,
    title: "Function Builder",
    titleKm: "កម្មវិធីបង្កើតអនុគមន៍",
    description: "Build functions using mathematical operations and see their graphical representations.",
    descriptionKm: "បង្កើតអនុគមន៍ដោយប្រើប្រតិបត្តិការគណិតវិទ្យា និងមើលការបង្ហាញក្រាហ្វិករបស់ពួកវា។",
    subject: "Mathematics",
    subjectKm: "គណិតវិទ្យា",
    grade: "8-12",
    duration: "35 min", 
    difficulty: "Intermediate",
    rating: 4.5,
    users: 1600,
    icon: BarChart3,
    color: "orange",
    topics: ["Functions", "Graphs", "Algebra", "Mathematical Modeling"],
    preview: "#",
    featured: false
  },
  {
    id: 6,
    title: "Wave Interference",
    titleKm: "ការជ្រៀតជ្រែករលក",
    description: "Watch waves spread out and interfere as they pass through a double slit, then take measurements.",
    descriptionKm: "សង្កេតរលករាលដាល និងជ្រៀតជ្រែកនៅពេលដែលវាឆ្លងកាត់រន្ធពីរ បន្ទាប់មកធ្វើការវាស់ស្ទង់។",
    subject: "Physics",
    subjectKm: "រូបវិទ្យា",
    grade: "10-12",
    duration: "50 min",
    difficulty: "Advanced", 
    rating: 4.4,
    users: 1100,
    icon: Waves,
    color: "blue",
    topics: ["Waves", "Interference", "Double Slit", "Quantum Physics"],
    preview: "#",
    featured: false
  }
];

const subjects = [
  { name: "All", nameKm: "ទាំងអស់", icon: BookOpen, color: "gray", count: simulations.length },
  { name: "Physics", nameKm: "រូបវិទ្យា", icon: Waves, color: "blue", count: simulations.filter(s => s.subject === "Physics").length },
  { name: "Chemistry", nameKm: "គីមីវិទ្យា", icon: Beaker, color: "green", count: simulations.filter(s => s.subject === "Chemistry").length },
  { name: "Biology", nameKm: "ជីវវិទ្យា", icon: Brain, color: "purple", count: simulations.filter(s => s.subject === "Biology").length },
  { name: "Mathematics", nameKm: "គណិតវិទ្យា", icon: BarChart3, color: "orange", count: simulations.filter(s => s.subject === "Mathematics").length }
];

const difficultyColors = {
  "Beginner": "bg-green-100 text-green-800",
  "Intermediate": "bg-yellow-100 text-yellow-800", 
  "Advanced": "bg-red-100 text-red-800"
};

export default function SimulationsPage() {
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [simulations, setSimulations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<any[]>([]);

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
              subjectKm: sim.subject_area, // You might want to add Khmer subject names to DB
              grade: sim.grade_levels ? `${Math.min(...sim.grade_levels)}-${Math.max(...sim.grade_levels)}` : 'All',
              duration: sim.estimated_duration ? `${sim.estimated_duration} min` : '30 min',
              difficulty: sim.difficulty_level || 'Intermediate',
              rating: 4.5 + Math.random() * 0.5, // Random rating for demo
              users: 800 + Math.floor(Math.random() * 2000), // Random user count for demo
              icon: iconMap[sim.simulation_name] || iconMap[sim.subject_area] || Waves,
              color: colorMap[sim.subject_area] || 'blue',
              topics: sim.tags || ['Science', 'Interactive'],
              preview: sim.simulation_url || '#',
              featured: sim.is_featured
            }));
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
        case "newest": return b.id - a.id;
        default: return b.featured ? 1 : -1;
      }
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="border-b bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative">
                <FlaskConical className="h-8 w-8 text-blue-600" />
                <Sparkles className="h-4 w-4 text-yellow-500 absolute -top-1 -right-1" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Virtual Lab Cambodia
                </h1>
                <p className="text-xs text-gray-500 font-medium">Interactive STEM Simulations</p>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <Button variant="ghost" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>ភាសាខ្មែរ</span>
              </Button>
              <Link href="/auth/login">
                <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600">
                  <Play className="h-4 w-4" />
                  Start Learning
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Free Interactive STEM Simulations
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Explore Science
            </span>
            <br />
            <span className="text-gray-800">Through Simulations</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            <span className="font-medium text-blue-600">ស្វែងរកវិទ្យាសាស្ត្រតាមរយៈការធ្វើត្រាប់តាម</span>
            <br />
            Discover physics, chemistry, biology, and mathematics through hands-on virtual experiments designed for curious minds.
          </p>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="px-4 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <div className="flex flex-col lg:flex-row gap-6 items-center">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <Input
                  placeholder="Search simulations... / ស្វែងរកការធ្វើត្រាប់តាម..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>

              {/* Subject Filter */}
              <div className="flex gap-2 flex-wrap">
                {subjects.map((subject) => (
                  <Button
                    key={subject.name}
                    variant={selectedSubject === subject.name ? "default" : "outline"}
                    onClick={() => setSelectedSubject(subject.name)}
                    className={`flex items-center gap-2 ${
                      selectedSubject === subject.name 
                        ? `bg-${subject.color}-600 hover:bg-${subject.color}-700` 
                        : `hover:bg-${subject.color}-50`
                    }`}
                  >
                    <subject.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{subject.name}</span>
                    <span className="sm:hidden">{subject.nameKm}</span>
                    <span className="text-xs bg-white/20 px-1 rounded">{subject.count}</span>
                  </Button>
                ))}
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="featured">Featured</option>
                  <option value="rating">Highest Rated</option>
                  <option value="popular">Most Popular</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simulations Grid */}
      <section className="px-4 pb-16">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-16">
              <FlaskConical className="h-16 w-16 text-gray-300 mx-auto mb-4 animate-pulse" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Loading simulations...</h3>
              <p className="text-gray-500">Please wait while we fetch the latest content</p>
            </div>
          ) : filteredSimulations.length === 0 ? (
            <div className="text-center py-16">
              <FlaskConical className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No simulations found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSimulations.map((sim) => (
                <Card key={sim.id} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group cursor-pointer">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className={`w-12 h-12 rounded-xl bg-${sim.color}-100 flex items-center justify-center mb-3 group-hover:bg-${sim.color}-200 transition-colors`}>
                        <sim.icon className={`h-6 w-6 text-${sim.color}-600`} />
                      </div>
                      {sim.featured && (
                        <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                          <Star className="h-3 w-3" />
                          Featured
                        </div>
                      )}
                    </div>
                    <CardTitle className="text-lg leading-tight">
                      {sim.title}
                      <p className="text-sm font-normal text-gray-600 mt-1">{sim.titleKm}</p>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <CardDescription className="text-sm leading-relaxed">
                      {sim.description}
                    </CardDescription>
                    
                    <div className="flex flex-wrap gap-2">
                      {sim.topics.slice(0, 3).map((topic, index) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {topic}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <GraduationCap className="h-4 w-4" />
                          <span>Grade {sim.grade}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{sim.duration}</span>
                        </div>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full ${difficultyColors[sim.difficulty]}`}>
                        {sim.difficulty}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{sim.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{sim.users.toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <Button 
                        size="sm" 
                        className={`bg-${sim.color}-600 hover:bg-${sim.color}-700 group-hover:scale-105 transition-all`}
                        onClick={() => window.open(sim.preview, '_blank')}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Try Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Start Learning?
            <br />
            <span className="text-blue-100">ត្រៀមខ្លួនចាប់ផ្តើមសិក្សា?</span>
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Create your free account and begin exploring interactive science simulations today
          </p>
          <Link href="/auth/login">
            <Button size="lg" variant="secondary" className="flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50">
              <Play className="h-5 w-5" />
              Get Started for Free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}