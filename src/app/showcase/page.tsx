'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Beaker, 
  BookOpen, 
  Users, 
  BarChart3, 
  Globe2, 
  Shield, 
  Zap,
  ArrowRight,
  Check,
  Play,
  Pause,
  ChevronRight,
  GraduationCap,
  Brain,
  Microscope,
  Atom,
  Calculator,
  TestTube,
  Dna,
  FlaskConical,
  Sparkles,
  Clock,
  Languages,
  FileText,
  Download,
  Search,
  Filter,
  UserCheck,
  Settings,
  Bell,
  MessageSquare,
  Calendar,
  TrendingUp,
  Award,
  Target,
  Layers,
  Database,
  Cloud,
  Smartphone,
  Monitor,
  Code2,
  Palette,
  Lock,
  Key,
  CheckCircle2,
  XCircle,
  AlertCircle,
  LucideIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import Image from 'next/image';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.5 }
};

const scaleIn = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { duration: 0.5 }
};

// Feature categories
const features = [
  {
    category: "Learning Experience",
    icon: GraduationCap,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    items: [
      {
        title: "Interactive Virtual Labs",
        description: "Hands-on science experiments with real-time simulations",
        icon: Microscope,
        demo: "lab-simulation"
      },
      {
        title: "Multi-Subject Support",
        description: "Physics, Chemistry, Biology, Mathematics integrated seamlessly",
        icon: Atom,
        demo: "subject-selection"
      },
      {
        title: "Adaptive Assessments",
        description: "AI-powered testing that adapts to student performance",
        icon: Brain,
        demo: "assessment-engine"
      },
      {
        title: "Exercise Library",
        description: "Comprehensive practice problems with instant feedback",
        icon: BookOpen,
        demo: "exercise-system"
      }
    ]
  },
  {
    category: "Teaching Tools",
    icon: Users,
    color: "text-green-600",
    bgColor: "bg-green-50",
    items: [
      {
        title: "Curriculum Builder",
        description: "Drag-and-drop lesson planning aligned with standards",
        icon: Layers,
        demo: "curriculum-builder"
      },
      {
        title: "Student Analytics",
        description: "Real-time insights into student progress and performance",
        icon: BarChart3,
        demo: "analytics-dashboard"
      },
      {
        title: "Assignment Management",
        description: "Create, distribute, and grade assignments efficiently",
        icon: FileText,
        demo: "assignment-system"
      },
      {
        title: "Communication Hub",
        description: "Integrated messaging and announcement system",
        icon: MessageSquare,
        demo: "messaging-system"
      }
    ]
  },
  {
    category: "Assessment & Tracking",
    icon: Target,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    items: [
      {
        title: "Multi-Phase Tracking",
        description: "Baseline, Midline, and Endline assessment cycles",
        icon: TrendingUp,
        demo: "assessment-phases"
      },
      {
        title: "Auto-Scoring Engine",
        description: "Instant grading with manual override options",
        icon: CheckCircle2,
        demo: "scoring-system"
      },
      {
        title: "Progress Monitoring",
        description: "Visual progress tracking for students and teachers",
        icon: Award,
        demo: "progress-tracking"
      },
      {
        title: "Export & Reports",
        description: "Generate detailed reports in multiple formats",
        icon: Download,
        demo: "report-generation"
      }
    ]
  },
  {
    category: "Platform Features",
    icon: Settings,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    items: [
      {
        title: "Multi-Language Support",
        description: "Full Khmer and English interface with custom fonts",
        icon: Languages,
        demo: "language-switcher"
      },
      {
        title: "Role-Based Access",
        description: "Customized experiences for different user types",
        icon: UserCheck,
        demo: "role-management"
      },
      {
        title: "Mobile Responsive",
        description: "Optimized for all devices and screen sizes",
        icon: Smartphone,
        demo: "responsive-design"
      },
      {
        title: "Secure Authentication",
        description: "Enterprise-grade security with session management",
        icon: Shield,
        demo: "security-features"
      }
    ]
  }
];

// User roles with permissions
const userRoles = [
  {
    role: "Student",
    icon: GraduationCap,
    color: "text-blue-600",
    permissions: [
      "Access virtual labs",
      "Submit assignments",
      "Track progress",
      "View grades",
      "Message teachers"
    ]
  },
  {
    role: "Teacher",
    icon: Users,
    color: "text-green-600",
    permissions: [
      "Create assignments",
      "Grade submissions",
      "Monitor students",
      "Build curriculum",
      "Generate reports"
    ]
  },
  {
    role: "Admin",
    icon: Settings,
    color: "text-purple-600",
    permissions: [
      "Manage users",
      "System configuration",
      "View all analytics",
      "Export data",
      "Full access control"
    ]
  },
  {
    role: "Parent",
    icon: Users,
    color: "text-orange-600",
    permissions: [
      "View child progress",
      "Access grades",
      "Message teachers",
      "Track attendance",
      "View assignments"
    ]
  }
];

// Tech stack
const techStack = [
  { name: "Next.js 15", icon: Code2, category: "Frontend" },
  { name: "TypeScript", icon: Code2, category: "Frontend" },
  { name: "Tailwind CSS", icon: Palette, category: "Frontend" },
  { name: "PostgreSQL", icon: Database, category: "Backend" },
  { name: "Vercel", icon: Cloud, category: "Deployment" },
  { name: "Shadcn/ui", icon: Layers, category: "UI Library" }
];

// Statistics
const stats = [
  { label: "Active Students", value: "2,500+", icon: GraduationCap },
  { label: "Virtual Labs", value: "150+", icon: Microscope },
  { label: "Schools", value: "32", icon: BookOpen },
  { label: "Success Rate", value: "94%", icon: TrendingUp }
];

export default function ShowcasePage() {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("Student");
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  // Auto-scroll progress
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setProgress(prev => (prev >= 100 ? 0 : prev + 1));
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-orange-600 opacity-10" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl opacity-20 animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-20 animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-orange-500 rounded-full filter blur-3xl opacity-20 animate-pulse delay-2000" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge className="mb-4 px-4 py-2 text-sm font-semibold">
              <Sparkles className="w-4 h-4 mr-2" />
              Virtual Lab LMS Platform
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600 bg-clip-text text-transparent">
              Transform Education with Interactive Science Labs
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
              Experience the future of STEM education with our comprehensive virtual laboratory platform. 
              Engage students, empower teachers, and elevate learning outcomes.
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center mb-12">
              <Button size="lg" className="group">
                <Play className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                Watch Demo
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/auth/login">
                  Try Free
                  <Zap className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-lg"
                >
                  <stat.icon className="w-8 h-8 text-blue-600 mb-2 mx-auto" />
                  <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Interactive Features Demo */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Powerful Features for Modern Education
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to create engaging and effective learning experiences
            </p>
          </motion.div>

          {features.map((category, categoryIndex) => (
            <motion.div
              key={category.category}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
              className="mb-16"
            >
              <div className="flex items-center mb-8">
                <div className={`p-3 rounded-xl ${category.bgColor} mr-4`}>
                  <category.icon className={`w-8 h-8 ${category.color}`} />
                </div>
                <h3 className="text-2xl font-bold">{category.category}</h3>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {category.items.map((item, itemIndex) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: itemIndex * 0.05 }}
                    whileHover={{ y: -5 }}
                    className="group"
                  >
                    <Card 
                      className="h-full p-6 cursor-pointer transition-all duration-300 hover:shadow-xl border-2 hover:border-blue-200"
                      onClick={() => setActiveDemo(item.demo)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-lg ${category.bgColor}`}>
                          <item.icon className={`w-6 h-6 ${category.color}`} />
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                      <h4 className="text-lg font-semibold mb-2">{item.title}</h4>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Role-Based Access Demo */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Tailored Experiences for Every User
            </h2>
            <p className="text-xl text-gray-600">
              Role-based access control ensures the right tools for the right people
            </p>
          </motion.div>

          <Tabs defaultValue="Student" className="w-full">
            <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto mb-8">
              {userRoles.map((role) => (
                <TabsTrigger key={role.role} value={role.role} className="flex items-center gap-2">
                  <role.icon className="w-4 h-4" />
                  {role.role}
                </TabsTrigger>
              ))}
            </TabsList>

            {userRoles.map((role) => (
              <TabsContent key={role.role} value={role.role}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white rounded-2xl p-8 shadow-lg"
                >
                  <div className="flex items-center mb-6">
                    <div className={`p-4 rounded-xl bg-gray-50 mr-4`}>
                      <role.icon className={`w-10 h-10 ${role.color}`} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{role.role} Dashboard</h3>
                      <p className="text-gray-600">Personalized tools and features</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {role.permissions.map((permission, index) => (
                      <motion.div
                        key={permission}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="flex items-center p-4 bg-gray-50 rounded-lg"
                      >
                        <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{permission}</span>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                    <h4 className="font-semibold mb-2">Live Preview</h4>
                    <div className="aspect-video bg-white rounded-lg shadow-inner flex items-center justify-center">
                      <div className="text-center">
                        <role.icon className={`w-16 h-16 ${role.color} mb-4 mx-auto`} />
                        <p className="text-gray-600">Interactive {role.role} Dashboard Preview</p>
                        <Button variant="outline" size="sm" className="mt-4">
                          <Play className="w-4 h-4 mr-2" />
                          View Demo
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Workflow Visualization */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Seamless Learning Workflow
            </h2>
            <p className="text-xl text-gray-600">
              From assessment to achievement in a few simple steps
            </p>
          </motion.div>

          <div className="relative">
            {/* Progress bar */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 transform -translate-y-1/2 hidden md:block">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>

            <div className="grid md:grid-cols-4 gap-8 relative z-10">
              {[
                { title: "Baseline Assessment", icon: FileText, description: "Evaluate initial knowledge" },
                { title: "Personalized Learning", icon: Brain, description: "Adaptive content delivery" },
                { title: "Progress Tracking", icon: TrendingUp, description: "Real-time monitoring" },
                { title: "Achievement & Reports", icon: Award, description: "Celebrate success" }
              ].map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="relative inline-block mb-4">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                      progress >= (index + 1) * 25 
                        ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white' 
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      <step.icon className="w-10 h-10" />
                    </div>
                    <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      progress >= (index + 1) * 25 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </motion.div>
              ))}
            </div>

            <div className="flex justify-center mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isPlaying ? 'Pause' : 'Play'} Animation
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Built with Modern Technology
            </h2>
            <p className="text-xl text-gray-600">
              Reliable, scalable, and secure infrastructure
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
            {techStack.map((tech, index) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <tech.icon className="w-12 h-12 text-blue-600 mb-3 mx-auto" />
                <h3 className="font-semibold text-sm">{tech.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{tech.category}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-blue-600 via-purple-600 to-orange-600 rounded-3xl p-12 text-center text-white relative overflow-hidden"
          >
            <div className="absolute inset-0">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full filter blur-3xl" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-10 rounded-full filter blur-3xl" />
            </div>
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to Transform Your Education?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Join thousands of students and teachers already using Virtual Lab
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/auth/login">
                    Get Started Free
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20">
                  Schedule Demo
                  <Calendar className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Demo Modal */}
      <AnimatePresence>
        {activeDemo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setActiveDemo(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">Feature Demo: {activeDemo}</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setActiveDemo(null)}
                >
                  <XCircle className="w-6 h-6" />
                </Button>
              </div>
              
              <div className="aspect-video bg-gray-100 rounded-lg mb-6 flex items-center justify-center">
                <div className="text-center">
                  <Microscope className="w-24 h-24 text-gray-400 mb-4 mx-auto" />
                  <p className="text-gray-600">Interactive demo would be displayed here</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span>Real-time interaction</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span>Instant feedback</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span>Progress tracking</span>
                </div>
              </div>
              
              <div className="mt-6 flex gap-4">
                <Button className="flex-1">
                  Try It Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setActiveDemo(null)}>
                  Close Demo
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}