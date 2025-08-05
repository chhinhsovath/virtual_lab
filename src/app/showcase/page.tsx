'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/components/LanguageProvider';
import { LanguageTogglePill } from '@/components/LanguageToggle';
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
  LucideIcon,
  FileDown,
  Copy,
  Waves,
  Heart,
  Activity,
  Lightbulb,
  Rocket,
  Star,
  ChevronLeft,
  ExternalLink,
  BookCheck,
  PenTool,
  ClipboardCheck,
  LineChart,
  PieChart,
  Users2,
  School,
  Headphones,
  Video,
  FileVideo,
  Gamepad2,
  Cpu,
  BrainCircuit,
  Puzzle,
  Trophy,
  Medal,
  Gem,
  Coins
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

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

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Comprehensive translations
const translations = {
  en: {
    nav: {
      features: "Features",
      simulations: "Simulations",
      exercises: "Exercises",
      document: "Document"
    },
    hero: {
      badge: "Cambodia Virtual Lab STEM Platform",
      title: "Transform STEM Education with Interactive Virtual Labs",
      subtitle: "Empowering Cambodian students and teachers with world-class virtual science laboratories. Experience physics, chemistry, biology, and mathematics like never before.",
      watchDemo: "Watch Demo",
      tryFree: "Try Free",
      viewDocument: "View Document",
      startLearning: "Start Learning"
    },
    stats: {
      activeStudents: "Active Students",
      virtualLabs: "Virtual Labs",
      schools: "Partner Schools",
      successRate: "Success Rate",
      exercises: "Interactive Exercises",
      teachers: "Certified Teachers"
    },
    features: {
      title: "Comprehensive Features for 21st Century Education",
      subtitle: "Everything educators and students need for effective STEM learning",
      categories: {
        learning: {
          title: "Interactive Learning",
          items: {
            virtualLabs: {
              title: "Virtual Science Labs",
              description: "Conduct safe, repeatable experiments in physics, chemistry, and biology"
            },
            multiSubject: {
              title: "Multi-Subject Integration",
              description: "Seamlessly connect concepts across STEM disciplines"
            },
            adaptiveAssessments: {
              title: "Smart Assessments",
              description: "AI-powered testing that adapts to individual learning pace"
            },
            exerciseLibrary: {
              title: "Rich Exercise Bank",
              description: "Thousands of practice problems with step-by-step solutions"
            },
            gamification: {
              title: "Gamified Learning",
              description: "Earn badges, points, and rewards for achievements"
            },
            peerLearning: {
              title: "Collaborative Learning",
              description: "Work together on group projects and experiments"
            }
          }
        },
        teaching: {
          title: "Teaching Excellence",
          items: {
            curriculumBuilder: {
              title: "Smart Curriculum Design",
              description: "Create lessons aligned with Cambodian education standards"
            },
            studentAnalytics: {
              title: "Advanced Analytics",
              description: "Deep insights into student performance and learning patterns"
            },
            assignmentManagement: {
              title: "Assignment Automation",
              description: "Create, distribute, and auto-grade assignments efficiently"
            },
            communicationHub: {
              title: "Communication Center",
              description: "Connect with students and parents through integrated messaging"
            },
            resourceLibrary: {
              title: "Teaching Resources",
              description: "Access lesson plans, worksheets, and teaching guides"
            },
            professionalDev: {
              title: "Teacher Training",
              description: "Continuous professional development courses and certifications"
            }
          }
        },
        assessment: {
          title: "Assessment & Progress",
          items: {
            multiPhase: {
              title: "Comprehensive Tracking",
              description: "Monitor progress through baseline, midline, and endline assessments"
            },
            autoScoring: {
              title: "Intelligent Grading",
              description: "Automated scoring with detailed feedback and manual options"
            },
            progressMonitoring: {
              title: "Visual Progress Reports",
              description: "Beautiful charts and graphs showing student growth"
            },
            exportReports: {
              title: "Flexible Reporting",
              description: "Generate reports in PDF, Excel, and CSV formats"
            },
            parentPortal: {
              title: "Parent Engagement",
              description: "Keep parents informed with progress updates"
            },
            certificates: {
              title: "Achievement Certificates",
              description: "Award digital certificates for milestones"
            }
          }
        },
        platform: {
          title: "Platform Excellence",
          items: {
            multiLanguage: {
              title: "Bilingual Support",
              description: "Full Khmer and English interface with seamless switching"
            },
            roleBasedAccess: {
              title: "Smart Access Control",
              description: "Customized experiences for students, teachers, admins, and parents"
            },
            mobileResponsive: {
              title: "Learn Anywhere",
              description: "Optimized for phones, tablets, and computers"
            },
            secureAuth: {
              title: "Bank-Level Security",
              description: "Protect student data with enterprise-grade security"
            },
            offlineMode: {
              title: "Offline Learning",
              description: "Download content for learning without internet"
            },
            cloudSync: {
              title: "Cloud Sync",
              description: "Access your work from any device, anywhere"
            }
          }
        }
      }
    },
    simulations: {
      title: "Interactive STEM Simulations",
      subtitle: "Explore our comprehensive library of virtual experiments",
      viewAll: "View All Simulations",
      categories: {
        physics: {
          title: "Physics",
          icon: Waves,
          color: "blue",
          simulations: [
            {
              title: "Pendulum Lab",
              description: "Explore periodic motion, gravity, and energy conservation",
              duration: "45 min",
              level: "Advanced",
              topics: ["Mechanics", "Energy", "Oscillations"]
            },
            {
              title: "Forces and Motion: Basics",
              description: "Learn fundamental concepts of forces and motion",
              duration: "30 min",
              level: "Beginner",
              topics: ["Forces", "Motion", "Basics"]
            },
            {
              title: "Projectile Motion",
              description: "Launch projectiles and analyze trajectories",
              duration: "40 min",
              level: "Intermediate",
              topics: ["Kinematics", "Vectors", "Motion"]
            },
            {
              title: "Gravity and Orbits",
              description: "Explore gravitational forces and orbital mechanics",
              duration: "50 min",
              level: "Intermediate",
              topics: ["Gravity", "Orbits", "Space"]
            },
            {
              title: "Energy Skate Park: Basics",
              description: "Study energy conservation with skateboard physics",
              duration: "35 min",
              level: "Intermediate",
              topics: ["Energy", "Conservation", "Motion"]
            },
            {
              title: "Plate Tectonics",
              description: "Understand Earth's geological processes",
              duration: "40 min",
              level: "Intermediate",
              topics: ["Geology", "Earth Science", "Tectonics"]
            },
            {
              title: "Greenhouse Effect",
              description: "Learn about climate and atmospheric effects",
              duration: "30 min",
              level: "Intermediate",
              topics: ["Climate", "Atmosphere", "Environment"]
            }
          ]
        },
        chemistry: {
          title: "Chemistry",
          icon: FlaskConical,
          color: "green",
          simulations: [
            {
              title: "pH Scale: Basics",
              description: "Test pH levels of various substances and understand acidity",
              duration: "35 min",
              level: "Beginner",
              topics: ["Acids & Bases", "pH", "Indicators"]
            },
            {
              title: "Build an Atom",
              description: "Construct atoms and learn about atomic structure",
              duration: "40 min",
              level: "Beginner",
              topics: ["Atomic Structure", "Electrons", "Nucleus"]
            },
            {
              title: "States of Matter: Basics",
              description: "Explore solid, liquid, and gas phases of matter",
              duration: "30 min",
              level: "Beginner",
              topics: ["Phase Changes", "Molecular Motion", "States"]
            },
            {
              title: "Concentration",
              description: "Learn about solution concentrations and molarity",
              duration: "45 min",
              level: "Intermediate",
              topics: ["Solutions", "Molarity", "Concentration"]
            },
            {
              title: "Balancing Chemical Equations",
              description: "Master the art of balancing chemical reactions",
              duration: "50 min",
              level: "Intermediate",
              topics: ["Reactions", "Stoichiometry", "Conservation"]
            }
          ]
        },
        biology: {
          title: "Biology",
          icon: Dna,
          color: "purple",
          simulations: [
            {
              title: "Gene Expression Essentials",
              description: "Learn how genes are expressed and regulated",
              duration: "60 min",
              level: "Advanced",
              topics: ["Genetics", "Gene Expression", "Proteins"]
            },
            {
              title: "Neuron",
              description: "Explore neuron structure and signal transmission",
              duration: "50 min",
              level: "Advanced",
              topics: ["Nervous System", "Neurons", "Signals"]
            },
            {
              title: "Natural Selection",
              description: "Understand evolution through natural selection",
              duration: "45 min",
              level: "Intermediate",
              topics: ["Evolution", "Selection", "Adaptation"]
            }
          ]
        },
        mathematics: {
          title: "Mathematics",
          icon: Calculator,
          color: "orange",
          simulations: [
            {
              title: "Area Builder",
              description: "Build shapes and explore area concepts",
              duration: "30 min",
              level: "Beginner",
              topics: ["Geometry", "Area", "Shapes"]
            },
            {
              title: "Arithmetic",
              description: "Practice basic arithmetic operations",
              duration: "25 min",
              level: "Beginner",
              topics: ["Addition", "Subtraction", "Multiplication"]
            },
            {
              title: "Fraction Matcher",
              description: "Match equivalent fractions and decimals",
              duration: "35 min",
              level: "Beginner",
              topics: ["Fractions", "Decimals", "Equivalence"]
            },
            {
              title: "Function Builder",
              description: "Build and explore mathematical functions",
              duration: "40 min",
              level: "Intermediate",
              topics: ["Functions", "Algebra", "Input-Output"]
            },
            {
              title: "Graphing Lines",
              description: "Learn to graph linear equations",
              duration: "45 min",
              level: "Intermediate",
              topics: ["Linear Equations", "Graphing", "Slope"]
            }
          ]
        }
      }
    },
    exercises: {
      title: "Comprehensive Exercise Library",
      subtitle: "Practice makes perfect with our adaptive exercise system",
      features: [
        {
          icon: PenTool,
          title: "Interactive Problems",
          description: "Solve problems with immediate feedback"
        },
        {
          icon: BrainCircuit,
          title: "Adaptive Difficulty",
          description: "Questions adjust to your skill level"
        },
        {
          icon: Trophy,
          title: "Achievement System",
          description: "Earn points and unlock new challenges"
        },
        {
          icon: LineChart,
          title: "Progress Tracking",
          description: "Monitor improvement over time"
        }
      ],
      categories: {
        physics: {
          title: "Physics Exercises",
          topics: [
            "Mechanics Problems",
            "Electricity & Magnetism",
            "Thermodynamics",
            "Optics & Waves",
            "Modern Physics"
          ],
          count: "500+ problems"
        },
        chemistry: {
          title: "Chemistry Exercises",
          topics: [
            "Chemical Equations",
            "Stoichiometry",
            "Organic Chemistry",
            "Thermochemistry",
            "Electrochemistry"
          ],
          count: "450+ problems"
        },
        biology: {
          title: "Biology Exercises",
          topics: [
            "Cell Biology",
            "Genetics Problems",
            "Evolution Questions",
            "Ecology Scenarios",
            "Human Biology"
          ],
          count: "400+ problems"
        },
        mathematics: {
          title: "Mathematics Exercises",
          topics: [
            "Algebra Problems",
            "Geometry Proofs",
            "Trigonometry",
            "Calculus Practice",
            "Statistics & Probability"
          ],
          count: "600+ problems"
        }
      }
    },
    roles: {
      title: "Designed for Every Educational Role",
      subtitle: "Customized experiences that empower all users",
      dashboard: "Dashboard",
      personalized: "Role-specific features and permissions",
      livePreview: "Live Preview",
      interactive: "Interactive",
      viewDemo: "View Demo",
      student: {
        title: "Students",
        subtitle: "Learn, explore, and achieve",
        features: [
          {
            icon: Microscope,
            text: "Access virtual labs 24/7"
          },
          {
            icon: BookCheck,
            text: "Complete assignments online"
          },
          {
            icon: TrendingUp,
            text: "Track learning progress"
          },
          {
            icon: Trophy,
            text: "Earn achievements"
          },
          {
            icon: MessageSquare,
            text: "Get teacher support"
          },
          {
            icon: Users2,
            text: "Collaborate with peers"
          }
        ]
      },
      teacher: {
        title: "Teachers",
        subtitle: "Teach, inspire, and monitor",
        features: [
          {
            icon: BookOpen,
            text: "Create engaging lessons"
          },
          {
            icon: ClipboardCheck,
            text: "Auto-grade assignments"
          },
          {
            icon: BarChart3,
            text: "Monitor class progress"
          },
          {
            icon: Calendar,
            text: "Schedule activities"
          },
          {
            icon: FileText,
            text: "Generate reports"
          },
          {
            icon: Award,
            text: "Award certificates"
          }
        ]
      },
      admin: {
        title: "Administrators",
        subtitle: "Manage, configure, and analyze",
        features: [
          {
            icon: Users,
            text: "Manage all users"
          },
          {
            icon: Settings,
            text: "Configure system"
          },
          {
            icon: PieChart,
            text: "View analytics"
          },
          {
            icon: Download,
            text: "Export all data"
          },
          {
            icon: Shield,
            text: "Control security"
          },
          {
            icon: School,
            text: "Manage schools"
          }
        ]
      },
      parent: {
        title: "Parents",
        subtitle: "Stay connected and informed",
        features: [
          {
            icon: Heart,
            text: "Monitor child progress"
          },
          {
            icon: FileText,
            text: "View grade reports"
          },
          {
            icon: MessageSquare,
            text: "Communicate with teachers"
          },
          {
            icon: Calendar,
            text: "Track attendance"
          },
          {
            icon: Bell,
            text: "Receive notifications"
          },
          {
            icon: Star,
            text: "Celebrate achievements"
          }
        ]
      }
    },
    workflow: {
      title: "The Learning Journey",
      subtitle: "A proven pathway to academic excellence",
      playAnimation: "Play Animation",
      pauseAnimation: "Pause Animation",
      steps: [
        {
          icon: Target,
          title: "Initial Assessment",
          description: "Evaluate current knowledge level",
          details: "Smart diagnostic tests identify strengths and areas for improvement"
        },
        {
          icon: Lightbulb,
          title: "Personalized Path",
          description: "Custom learning journey",
          details: "AI creates individualized lesson plans based on assessment results"
        },
        {
          icon: Rocket,
          title: "Interactive Learning",
          description: "Engage with content",
          details: "Virtual labs, videos, and exercises make learning fun and effective"
        },
        {
          icon: Activity,
          title: "Continuous Practice",
          description: "Reinforce knowledge",
          details: "Adaptive exercises ensure mastery of concepts"
        },
        {
          icon: LineChart,
          title: "Progress Monitoring",
          description: "Track improvement",
          details: "Real-time analytics show growth and achievements"
        },
        {
          icon: Trophy,
          title: "Celebrate Success",
          description: "Achieve excellence",
          details: "Earn certificates and recognition for accomplishments"
        }
      ]
    },
    tech: {
      title: "Built with Cutting-Edge Technology",
      subtitle: "Reliable, scalable, and future-ready infrastructure",
      stack: [
        {
          category: "Frontend",
          items: [
            { name: "Next.js 14", icon: Code2 },
            { name: "React 18", icon: Layers },
            { name: "TypeScript", icon: FileText },
            { name: "Tailwind CSS", icon: Palette }
          ]
        },
        {
          category: "Backend",
          items: [
            { name: "Node.js", icon: Cpu },
            { name: "PostgreSQL", icon: Database },
            { name: "Redis Cache", icon: Zap },
            { name: "RESTful APIs", icon: Globe2 }
          ]
        },
        {
          category: "Infrastructure",
          items: [
            { name: "AWS Cloud", icon: Cloud },
            { name: "Docker", icon: Layers },
            { name: "CI/CD Pipeline", icon: Rocket },
            { name: "CDN Network", icon: Globe2 }
          ]
        },
        {
          category: "Security",
          items: [
            { name: "SSL/TLS", icon: Lock },
            { name: "JWT Auth", icon: Key },
            { name: "Data Encryption", icon: Shield },
            { name: "OWASP Compliance", icon: CheckCircle2 }
          ]
        }
      ]
    },
    testimonials: {
      title: "What Educators Say",
      subtitle: "Real feedback from real users",
      items: [
        {
          name: "Sophea Chen",
          role: "Physics Teacher",
          school: "Phnom Penh High School",
          content: "Virtual Lab has transformed how I teach physics. Students are more engaged and understand concepts better through interactive simulations.",
          rating: 5
        },
        {
          name: "Vicheka Prom",
          role: "School Principal",
          school: "Siem Reap Academy",
          content: "The comprehensive analytics help us track student progress effectively. It's revolutionized our approach to education.",
          rating: 5
        },
        {
          name: "Dara Sok",
          role: "Grade 11 Student",
          school: "Battambang International",
          content: "I love being able to practice experiments safely at home. The instant feedback helps me learn from mistakes quickly.",
          rating: 5
        }
      ]
    },
    cta: {
      title: "Ready to Transform Your STEM Education?",
      subtitle: "Join thousands of Cambodian students and teachers already using Virtual Lab",
      getStarted: "Get Started Free",
      scheduleDemo: "Schedule Live Demo",
      contactSales: "Contact Sales",
      features: [
        "30-day free trial",
        "No credit card required",
        "Full feature access",
        "Free training included"
      ]
    },
    footer: {
      product: "Product",
      resources: "Resources",
      company: "Company",
      support: "Support",
      links: {
        features: "Features",
        pricing: "Pricing",
        tutorials: "Tutorials",
        documentation: "Documentation",
        about: "About Us",
        contact: "Contact",
        help: "Help Center",
        community: "Community"
      }
    }
  },
  km: {
    nav: {
      features: "មុខងារ",
      simulations: "ការពិសោធន៍",
      exercises: "លំហាត់",
      document: "ឯកសារ"
    },
    hero: {
      badge: "វេទិកា STEM Virtual Lab កម្ពុជា",
      title: "ផ្លាស់ប្តូរការអប់រំ STEM ជាមួយមន្ទីរពិសោធន៍និម្មិតអន្តរកម្ម",
      subtitle: "ផ្តល់អំណាចដល់សិស្ស និងគ្រូកម្ពុជាជាមួយមន្ទីរពិសោធន៍វិទ្យាសាស្ត្រនិម្មិតថ្នាក់ពិភពលោក។ បទពិសោធន៍រូបវិទ្យា គីមីវិទ្យា ជីវវិទ្យា និងគណិតវិទ្យាដូចមិនធ្លាប់មាន។",
      watchDemo: "មើលការបង្ហាញ",
      tryFree: "សាកល្បងឥតគិតថ្លៃ",
      viewDocument: "មើលឯកសារ",
      startLearning: "ចាប់ផ្តើមរៀន"
    },
    stats: {
      activeStudents: "សិស្សសកម្ម",
      virtualLabs: "មន្ទីរពិសោធន៍និម្មិត",
      schools: "សាលាដៃគូ",
      successRate: "អត្រាជោគជ័យ",
      exercises: "លំហាត់អន្តរកម្ម",
      teachers: "គ្រូដែលមានវិញ្ញាបនបត្រ"
    },
    features: {
      title: "មុខងារដ៏ទូលំទូលាយសម្រាប់ការអប់រំសតវត្សទី២១",
      subtitle: "អ្វីគ្រប់យ៉ាងដែលអ្នកអប់រំ និងសិស្សត្រូវការសម្រាប់ការរៀន STEM ប្រកបដោយប្រសិទ្ធភាព",
      categories: {
        learning: {
          title: "ការរៀនអន្តរកម្ម",
          items: {
            virtualLabs: {
              title: "មន្ទីរពិសោធន៍វិទ្យាសាស្ត្រនិម្មិត",
              description: "ធ្វើការពិសោធន៍ដែលមានសុវត្ថិភាព អាចធ្វើឡើងវិញបានក្នុងរូបវិទ្យា គីមីវិទ្យា និងជីវវិទ្យា"
            },
            multiSubject: {
              title: "ការរួមបញ្ចូលពហុមុខវិជ្ជា",
              description: "ភ្ជាប់គំនិតឆ្លងកាត់វិញ្ញាសា STEM យ៉ាងរលូន"
            },
            adaptiveAssessments: {
              title: "ការវាយតម្លៃឆ្លាតវៃ",
              description: "ការធ្វើតេស្តដែលដំណើរការដោយ AI ដែលសម្របតាមល្បឿនរៀនបុគ្គល"
            },
            exerciseLibrary: {
              title: "ធនាគារលំហាត់សម្បូរបែប",
              description: "រាប់ពាន់នៃបញ្ហាអនុវត្តជាមួយដំណោះស្រាយជាជំហាន"
            },
            gamification: {
              title: "ការរៀនតាមហ្គេម",
              description: "ទទួលបានស្លាកសញ្ញា ពិន្ទុ និងរង្វាន់សម្រាប់សមិទ្ធផល"
            },
            peerLearning: {
              title: "ការរៀនសហការ",
              description: "ធ្វើការរួមគ្នាលើគម្រោងក្រុម និងការពិសោធន៍"
            }
          }
        },
        teaching: {
          title: "ឧត្តមភាពបង្រៀន",
          items: {
            curriculumBuilder: {
              title: "ការរចនាកម្មវិធីសិក្សាឆ្លាតវៃ",
              description: "បង្កើតមេរៀនស្របតាមស្តង់ដារអប់រំកម្ពុជា"
            },
            studentAnalytics: {
              title: "ការវិភាគកម្រិតខ្ពស់",
              description: "ការយល់ដឹងជ្រៅអំពីការអនុវត្ត និងគំរូរៀនរបស់សិស្ស"
            },
            assignmentManagement: {
              title: "ស្វ័យប្រវត្តិកម្មកិច្ចការ",
              description: "បង្កើត ចែកចាយ និងដាក់ពិន្ទុកិច្ចការដោយស្វ័យប្រវត្តិប្រកបដោយប្រសិទ្ធភាព"
            },
            communicationHub: {
              title: "មជ្ឈមណ្ឌលទំនាក់ទំនង",
              description: "ភ្ជាប់ជាមួយសិស្ស និងឪពុកម្តាយតាមរយៈការផ្ញើសាររួមបញ្ចូលគ្នា"
            },
            resourceLibrary: {
              title: "ធនធានបង្រៀន",
              description: "ចូលប្រើផែនការមេរៀន សន្លឹកការងារ និងការណែនាំបង្រៀន"
            },
            professionalDev: {
              title: "ការបណ្តុះបណ្តាលគ្រូ",
              description: "វគ្គអភិវឌ្ឍន៍វិជ្ជាជីវៈជាបន្តបន្ទាប់ និងវិញ្ញាបនបត្រ"
            }
          }
        },
        assessment: {
          title: "ការវាយតម្លៃ និងវឌ្ឍនភាព",
          items: {
            multiPhase: {
              title: "ការតាមដានដ៏ទូលំទូលាយ",
              description: "តាមដានវឌ្ឍនភាពតាមរយៈការវាយតម្លៃមូលដ្ឋាន កណ្តាល និងចុងក្រោយ"
            },
            autoScoring: {
              title: "ការដាក់ពិន្ទុឆ្លាតវៃ",
              description: "ការដាក់ពិន្ទុស្វ័យប្រវត្តិជាមួយមតិកែលម្អលម្អិត និងជម្រើសដោយដៃ"
            },
            progressMonitoring: {
              title: "របាយការណ៍វឌ្ឍនភាពដែលមើលឃើញ",
              description: "គំនូសតាង និងក្រាហ្វដ៏ស្រស់ស្អាតបង្ហាញពីការលូតលាស់របស់សិស្ស"
            },
            exportReports: {
              title: "របាយការណ៍ដែលអាចបត់បែនបាន",
              description: "បង្កើតរបាយការណ៍ជាទម្រង់ PDF, Excel និង CSV"
            },
            parentPortal: {
              title: "ការចូលរួមរបស់ឪពុកម្តាយ",
              description: "រក្សាឪពុកម្តាយឱ្យទទួលបានព័ត៌មានជាមួយការធ្វើបច្ចុប្បន្នភាពវឌ្ឍនភាព"
            },
            certificates: {
              title: "វិញ្ញាបនបត្រសមិទ្ធិផល",
              description: "ផ្តល់វិញ្ញាបនបត្រឌីជីថលសម្រាប់ចំណុចសំខាន់"
            }
          }
        },
        platform: {
          title: "ឧត្តមភាពវេទិកា",
          items: {
            multiLanguage: {
              title: "ការគាំទ្រពីរភាសា",
              description: "ចំណុចប្រទាក់ភាសាខ្មែរ និងអង់គ្លេសពេញលេញជាមួយការប្តូររលូន"
            },
            roleBasedAccess: {
              title: "ការគ្រប់គ្រងការចូលប្រើឆ្លាតវៃ",
              description: "បទពិសោធន៍ប្តូរតាមបំណងសម្រាប់សិស្ស គ្រូ អ្នកគ្រប់គ្រង និងឪពុកម្តាយ"
            },
            mobileResponsive: {
              title: "រៀនគ្រប់ទីកន្លែង",
              description: "បានបង្កើនប្រសិទ្ធភាពសម្រាប់ទូរស័ព្ទ ថេប្លេត និងកុំព្យូទ័រ"
            },
            secureAuth: {
              title: "សុវត្ថិភាពកម្រិតធនាគារ",
              description: "ការពារទិន្នន័យសិស្សជាមួយសុវត្ថិភាពកម្រិតសហគ្រាស"
            },
            offlineMode: {
              title: "ការរៀនគ្មានអ៊ីនធឺណិត",
              description: "ទាញយកមាតិកាសម្រាប់រៀនដោយគ្មានអ៊ីនធឺណិត"
            },
            cloudSync: {
              title: "ធ្វើសមកាលកម្មពពក",
              description: "ចូលប្រើការងាររបស់អ្នកពីឧបករណ៍ណាមួយ គ្រប់ទីកន្លែង"
            }
          }
        }
      }
    },
    simulations: {
      title: "ការពិសោធន៍ STEM អន្តរកម្ម",
      subtitle: "ស្វែងយល់បណ្ណាល័យដ៏ទូលំទូលាយរបស់យើងនៃការពិសោធន៍និម្មិត",
      viewAll: "មើលការពិសោធន៍ទាំងអស់",
      categories: {
        physics: {
          title: "រូបវិទ្យា",
          icon: Waves,
          color: "blue",
          simulations: [
            {
              title: "មន្ទីរពិសោធន៍ប៉ោលលិង",
              description: "ស្វែងយល់ចលនាតាមចង្វាក់ ទំនាញផែនដី និងការអភិរក្សថាមពល",
              duration: "៤៥ នាទី",
              level: "កម្រិតមធ្យម",
              topics: ["មេកានិច", "ថាមពល", "លំយោល"]
            },
            {
              title: "អ្នកបង្កើតសៀគ្វីអគ្គិសនី",
              description: "បង្កើត និងសាកល្បងសៀគ្វីអគ្គិសនីជាមួយសមាសធាតុនិម្មិត",
              duration: "៦០ នាទី",
              level: "កម្រិតខ្ពស់",
              topics: ["អគ្គិសនី", "សៀគ្វី", "ច្បាប់អូម"]
            },
            {
              title: "ការជ្រៀតជ្រែករលក",
              description: "សិក្សាលក្ខណៈរលក និងគំរូជ្រៀតជ្រែក",
              duration: "៣០ នាទី",
              level: "កម្រិតដំបូង",
              topics: ["រលក", "ប្រេកង់", "អំព្លីទុត"]
            },
            {
              title: "ចលនាគ្រាប់កាំភ្លើង",
              description: "បាញ់គ្រាប់ និងវិភាគគន្លង",
              duration: "៤០ នាទី",
              level: "កម្រិតមធ្យម",
              topics: ["គីនេម៉ាទិក", "វ៉ិចទ័រ", "ចលនា"]
            }
          ]
        },
        chemistry: {
          title: "គីមីវិទ្យា",
          icon: FlaskConical,
          color: "green",
          simulations: [
            {
              title: "អ្នកបង្កើតម៉ូលេគុល",
              description: "សាងសង់រចនាសម្ព័ន្ធម៉ូលេគុល 3D និងសិក្សាការភ្ជាប់",
              duration: "៥០ នាទី",
              level: "កម្រិតមធ្យម",
              topics: ["ការភ្ជាប់", "រចនាសម្ព័ន្ធម៉ូលេគុល", "ការមើលឃើញ 3D"]
            },
            {
              title: "មន្ទីរពិសោធន៍មាត្រដ្ឋាន pH",
              description: "សាកល្បងកម្រិត pH នៃសារធាតុផ្សេងៗ",
              duration: "៣៥ នាទី",
              level: "កម្រិតដំបូង",
              topics: ["អាស៊ីត និងបាស", "pH", "សូចនាករ"]
            },
            {
              title: "ប្រតិកម្មគីមី",
              description: "តុល្យភាពសមីការ និងសង្កេតប្រភេទប្រតិកម្ម",
              duration: "៥៥ នាទី",
              level: "កម្រិតខ្ពស់",
              topics: ["ប្រតិកម្ម", "ស្តូយចីអូម៉ែត្រី", "ការអភិរក្ស"]
            },
            {
              title: "លក្ខណៈឧស្ម័ន",
              description: "ស្វែងយល់ច្បាប់ឧស្ម័នល្អ និងឥរិយាបថម៉ូលេគុល",
              duration: "៤៥ នាទី",
              level: "កម្រិតមធ្យម",
              topics: ["ឧស្ម័ន", "សម្ពាធ", "សីតុណ្ហភាព"]
            }
          ]
        },
        biology: {
          title: "ជីវវិទ្យា",
          icon: Dna,
          color: "purple",
          simulations: [
            {
              title: "អ្នកស្វែងរកកោសិកា",
              description: "ធ្វើដំណើរចូលក្នុងកោសិការុក្ខជាតិ និងសត្វ",
              duration: "៤០ នាទី",
              level: "កម្រិតដំបូង",
              topics: ["រចនាសម្ព័ន្ធកោសិកា", "អង្គធាតុកោសិកា", "មុខងារ"]
            },
            {
              title: "ការចម្លង DNA",
              description: "មើលការចម្លង DNA និងការសំយោគប្រូតេអ៊ីន",
              duration: "៦០ នាទី",
              level: "កម្រិតខ្ពស់",
              topics: ["ពន្ធុវិទ្យា", "DNA", "ប្រូតេអ៊ីន"]
            },
            {
              title: "ឧបករណ៍ក្លែងធ្វើប្រព័ន្ធអេកូឡូស៊ី",
              description: "តុល្យភាពប្រព័ន្ធអេកូឡូស៊ី និងខ្សែចង្វាក់អាហារ",
              duration: "៥០ នាទី",
              level: "កម្រិតមធ្យម",
              topics: ["អេកូឡូស៊ី", "បណ្តាញអាហារ", "តុល្យភាព"]
            },
            {
              title: "ប្រព័ន្ធរាងកាយមនុស្ស",
              description: "ស្វែងយល់ប្រព័ន្ធឈាមរត់ ដង្ហើម និងប្រសាទ",
              duration: "៥៥ នាទី",
              level: "កម្រិតមធ្យម",
              topics: ["កាយវិភាគសាស្ត្រ", "សរីរវិទ្យា", "ប្រព័ន្ធ"]
            }
          ]
        },
        mathematics: {
          title: "គណិតវិទ្យា",
          icon: Calculator,
          color: "orange",
          simulations: [
            {
              title: "អ្នកស្វែងរកធរណីមាត្រ",
              description: "សាងសង់ និងវិភាគរូបរាងធរណីមាត្រ",
              duration: "៤៥ នាទី",
              level: "កម្រិតមធ្យម",
              topics: ["ធរណីមាត្រ", "មុំ", "ភស្តុតាង"]
            },
            {
              title: "អ្នកគូសក្រាហ្វអនុគមន៍",
              description: "មើលឃើញ និងបំលែងអនុគមន៍គណិតវិទ្យា",
              duration: "៤០ នាទី",
              level: "កម្រិតខ្ពស់",
              topics: ["ពិជគណិត", "អនុគមន៍", "ក្រាហ្វ"]
            },
            {
              title: "មន្ទីរពិសោធន៍ប្រូបាប៊ីលីតេ",
              description: "ពិសោធន៍ជាមួយប្រូបាប៊ីលីតេ និងស្ថិតិ",
              duration: "៣៥ នាទី",
              level: "កម្រិតដំបូង",
              topics: ["ប្រូបាប៊ីលីតេ", "ស្ថិតិ", "ទិន្នន័យ"]
            },
            {
              title: "ឧបករណ៍មើលឃើញកាល់គុលុស",
              description: "មើលដេរីវេ និងអាំងតេក្រាល់ក្នុងសកម្មភាព",
              duration: "៦០ នាទី",
              level: "កម្រិតខ្ពស់",
              topics: ["កាល់គុលុស", "ដេរីវេ", "អាំងតេក្រាល់"]
            }
          ]
        }
      }
    },
    exercises: {
      title: "បណ្ណាល័យលំហាត់ដ៏ទូលំទូលាយ",
      subtitle: "ការអនុវត្តធ្វើឱ្យល្អឥតខ្ចោះជាមួយប្រព័ន្ធលំហាត់ប្រែប្រួលរបស់យើង",
      features: [
        {
          icon: PenTool,
          title: "បញ្ហាអន្តរកម្ម",
          description: "ដោះស្រាយបញ្ហាជាមួយមតិកែលម្អភ្លាមៗ"
        },
        {
          icon: BrainCircuit,
          title: "ការលំបាកប្រែប្រួល",
          description: "សំណួរកែតម្រូវទៅតាមកម្រិតជំនាញរបស់អ្នក"
        },
        {
          icon: Trophy,
          title: "ប្រព័ន្ធសមិទ្ធិផល",
          description: "ទទួលបានពិន្ទុ និងដោះសោបញ្ហាប្រឈមថ្មី"
        },
        {
          icon: LineChart,
          title: "ការតាមដានវឌ្ឍនភាព",
          description: "តាមដានការកែលម្អតាមពេលវេលា"
        }
      ],
      categories: {
        physics: {
          title: "លំហាត់រូបវិទ្យា",
          topics: [
            "បញ្ហាមេកានិច",
            "អគ្គិសនី និងម៉ាញេទិក",
            "ទែម៉ូឌីណាមិក",
            "អុបទិក និងរលក",
            "រូបវិទ្យាទំនើប"
          ],
          count: "៥០០+ បញ្ហា"
        },
        chemistry: {
          title: "លំហាត់គីមីវិទ្យា",
          topics: [
            "សមីការគីមី",
            "ស្តូយចីអូម៉ែត្រី",
            "គីមីសរីរាង្គ",
            "ទែម៉ូគីមី",
            "អេឡិចត្រូគីមី"
          ],
          count: "៤៥០+ បញ្ហា"
        },
        biology: {
          title: "លំហាត់ជីវវិទ្យា",
          topics: [
            "ជីវវិទ្យាកោសិកា",
            "បញ្ហាពន្ធុវិទ្យា",
            "សំណួរវិវត្តន៍",
            "ស្ថានភាពអេកូឡូស៊ី",
            "ជីវវិទ្យាមនុស្ស"
          ],
          count: "៤០០+ បញ្ហា"
        },
        mathematics: {
          title: "លំហាត់គណិតវិទ្យា",
          topics: [
            "បញ្ហាពិជគណិត",
            "ភស្តុតាងធរណីមាត្រ",
            "ត្រីកោណមាត្រ",
            "ការអនុវត្តកាល់គុលុស",
            "ស្ថិតិ និងប្រូបាប៊ីលីតេ"
          ],
          count: "៦០០+ បញ្ហា"
        }
      }
    },
    roles: {
      title: "រចនាសម្រាប់គ្រប់តួនាទីអប់រំ",
      subtitle: "បទពិសោធន៍ប្តូរតាមបំណងដែលផ្តល់អំណាចដល់អ្នកប្រើទាំងអស់",
      dashboard: "ផ្ទាំងគ្រប់គ្រង",
      personalized: "មុខងារ និងការអនុញ្ញាតជាក់លាក់តាមតួនាទី",
      livePreview: "ការមើលជាមុនផ្ទាល់",
      interactive: "អន្តរកម្ម",
      viewDemo: "មើលការបង្ហាញ",
      student: {
        title: "សិស្ស",
        subtitle: "រៀន ស្វែងយល់ និងសម្រេច",
        features: [
          {
            icon: Microscope,
            text: "ចូលប្រើមន្ទីរពិសោធន៍និម្មិត ២៤/៧"
          },
          {
            icon: BookCheck,
            text: "បញ្ចប់កិច្ចការតាមអ៊ីនធឺណិត"
          },
          {
            icon: TrendingUp,
            text: "តាមដានវឌ្ឍនភាពរៀន"
          },
          {
            icon: Trophy,
            text: "ទទួលបានសមិទ្ធិផល"
          },
          {
            icon: MessageSquare,
            text: "ទទួលបានការគាំទ្រពីគ្រូ"
          },
          {
            icon: Users2,
            text: "សហការជាមួយមិត្តរួមថ្នាក់"
          }
        ]
      },
      teacher: {
        title: "គ្រូបង្រៀន",
        subtitle: "បង្រៀន បំផុសគំនិត និងតាមដាន",
        features: [
          {
            icon: BookOpen,
            text: "បង្កើតមេរៀនដែលទាក់ទាញ"
          },
          {
            icon: ClipboardCheck,
            text: "ដាក់ពិន្ទុកិច្ចការដោយស្វ័យប្រវត្តិ"
          },
          {
            icon: BarChart3,
            text: "តាមដានវឌ្ឍនភាពថ្នាក់"
          },
          {
            icon: Calendar,
            text: "កំណត់ពេលសកម្មភាព"
          },
          {
            icon: FileText,
            text: "បង្កើតរបាយការណ៍"
          },
          {
            icon: Award,
            text: "ផ្តល់វិញ្ញាបនបត្រ"
          }
        ]
      },
      admin: {
        title: "អ្នកគ្រប់គ្រង",
        subtitle: "គ្រប់គ្រង កំណត់រចនាសម្ព័ន្ធ និងវិភាគ",
        features: [
          {
            icon: Users,
            text: "គ្រប់គ្រងអ្នកប្រើទាំងអស់"
          },
          {
            icon: Settings,
            text: "កំណត់រចនាសម្ព័ន្ធប្រព័ន្ធ"
          },
          {
            icon: PieChart,
            text: "មើលការវិភាគ"
          },
          {
            icon: Download,
            text: "នាំចេញទិន្នន័យទាំងអស់"
          },
          {
            icon: Shield,
            text: "គ្រប់គ្រងសុវត្ថិភាព"
          },
          {
            icon: School,
            text: "គ្រប់គ្រងសាលារៀន"
          }
        ]
      },
      parent: {
        title: "ឪពុកម្តាយ",
        subtitle: "រក្សាទំនាក់ទំនង និងទទួលបានព័ត៌មាន",
        features: [
          {
            icon: Heart,
            text: "តាមដានវឌ្ឍនភាពកូន"
          },
          {
            icon: FileText,
            text: "មើលរបាយការណ៍ពិន្ទុ"
          },
          {
            icon: MessageSquare,
            text: "ទំនាក់ទំនងជាមួយគ្រូ"
          },
          {
            icon: Calendar,
            text: "តាមដានវត្តមាន"
          },
          {
            icon: Bell,
            text: "ទទួលបានការជូនដំណឹង"
          },
          {
            icon: Star,
            text: "អបអរសមិទ្ធិផល"
          }
        ]
      }
    },
    workflow: {
      title: "ដំណើរការរៀនសូត្រ",
      subtitle: "ផ្លូវដែលបានបញ្ជាក់ទៅកាន់ឧត្តមភាពសិក្សា",
      playAnimation: "លេងចលនា",
      pauseAnimation: "ផ្អាកចលនា",
      steps: [
        {
          icon: Target,
          title: "ការវាយតម្លៃដំបូង",
          description: "វាយតម្លៃកម្រិតចំណេះដឹងបច្ចុប្បន្ន",
          details: "ការធ្វើតេស្តវិនិច្ឆ័យឆ្លាតវៃកំណត់ចំណុចខ្លាំង និងតំបន់សម្រាប់ការកែលម្អ"
        },
        {
          icon: Lightbulb,
          title: "ផ្លូវផ្ទាល់ខ្លួន",
          description: "ដំណើរការរៀនផ្ទាល់ខ្លួន",
          details: "AI បង្កើតផែនការមេរៀនបុគ្គលផ្អែកលើលទ្ធផលវាយតម្លៃ"
        },
        {
          icon: Rocket,
          title: "ការរៀនអន្តរកម្ម",
          description: "ចូលរួមជាមួយមាតិកា",
          details: "មន្ទីរពិសោធន៍និម្មិត វីដេអូ និងលំហាត់ធ្វើឱ្យការរៀនមានភាពសប្បាយរីករាយ និងមានប្រសិទ្ធភាព"
        },
        {
          icon: Activity,
          title: "ការអនុវត្តជាបន្តបន្ទាប់",
          description: "ពង្រឹងចំណេះដឹង",
          details: "លំហាត់ប្រែប្រួលធានាការស្ទាត់ជំនាញគំនិត"
        },
        {
          icon: LineChart,
          title: "ការតាមដានវឌ្ឍនភាព",
          description: "តាមដានការកែលម្អ",
          details: "ការវិភាគពេលជាក់ស្តែងបង្ហាញពីការលូតលាស់ និងសមិទ្ធិផល"
        },
        {
          icon: Trophy,
          title: "អបអរជោគជ័យ",
          description: "សម្រេចឧត្តមភាព",
          details: "ទទួលបានវិញ្ញាបនបត្រ និងការទទួលស្គាល់សម្រាប់សមិទ្ធិផល"
        }
      ]
    },
    tech: {
      title: "បង្កើតជាមួយបច្ចេកវិទ្យាទំនើបបំផុត",
      subtitle: "ហេដ្ឋារចនាសម្ព័ន្ធដែលអាចទុកចិត្តបាន អាចពង្រីកបាន និងត្រៀមរួចជាស្រេចសម្រាប់អនាគត",
      stack: [
        {
          category: "Frontend",
          items: [
            { name: "Next.js 14", icon: Code2 },
            { name: "React 18", icon: Layers },
            { name: "TypeScript", icon: FileText },
            { name: "Tailwind CSS", icon: Palette }
          ]
        },
        {
          category: "Backend",
          items: [
            { name: "Node.js", icon: Cpu },
            { name: "PostgreSQL", icon: Database },
            { name: "Redis Cache", icon: Zap },
            { name: "RESTful APIs", icon: Globe2 }
          ]
        },
        {
          category: "ហេដ្ឋារចនាសម្ព័ន្ធ",
          items: [
            { name: "AWS Cloud", icon: Cloud },
            { name: "Docker", icon: Layers },
            { name: "CI/CD Pipeline", icon: Rocket },
            { name: "CDN Network", icon: Globe2 }
          ]
        },
        {
          category: "សុវត្ថិភាព",
          items: [
            { name: "SSL/TLS", icon: Lock },
            { name: "JWT Auth", icon: Key },
            { name: "ការអ៊ិនគ្រីបទិន្នន័យ", icon: Shield },
            { name: "អនុលោមភាព OWASP", icon: CheckCircle2 }
          ]
        }
      ]
    },
    testimonials: {
      title: "អ្វីដែលអ្នកអប់រំនិយាយ",
      subtitle: "មតិកែលម្អពិតពីអ្នកប្រើពិត",
      items: [
        {
          name: "សុភា ចេន",
          role: "គ្រូរូបវិទ្យា",
          school: "វិទ្យាល័យភ្នំពេញ",
          content: "Virtual Lab បានផ្លាស់ប្តូររបៀបដែលខ្ញុំបង្រៀនរូបវិទ្យា។ សិស្សមានការចូលរួមកាន់តែច្រើន និងយល់គំនិតកាន់តែប្រសើរតាមរយៈការក្លែងធ្វើអន្តរកម្ម។",
          rating: 5
        },
        {
          name: "វិជេកា ព្រំ",
          role: "នាយកសាលា",
          school: "បណ្ឌិតសភាសៀមរាប",
          content: "ការវិភាគដ៏ទូលំទូលាយជួយយើងតាមដានវឌ្ឍនភាពសិស្សប្រកបដោយប្រសិទ្ធភាព។ វាបានធ្វើបដិវត្តន៍វិធីសាស្រ្តរបស់យើងចំពោះការអប់រំ។",
          rating: 5
        },
        {
          name: "ដារ៉ា សុខ",
          role: "សិស្សថ្នាក់ទី១១",
          school: "អន្តរជាតិបាត់ដំបង",
          content: "ខ្ញុំចូលចិត្តអាចអនុវត្តការពិសោធន៍ដោយសុវត្ថិភាពនៅផ្ទះ។ មតិកែលម្អភ្លាមៗជួយខ្ញុំរៀនពីកំហុសយ៉ាងឆាប់រហ័ស។",
          rating: 5
        }
      ]
    },
    cta: {
      title: "ត្រៀមខ្លួនផ្លាស់ប្តូរការអប់រំ STEM របស់អ្នក?",
      subtitle: "ចូលរួមជាមួយរាប់ពាន់សិស្ស និងគ្រូកម្ពុជាដែលកំពុងប្រើ Virtual Lab រួចហើយ",
      getStarted: "ចាប់ផ្តើមឥតគិតថ្លៃ",
      scheduleDemo: "កំណត់ពេលបង្ហាញផ្ទាល់",
      contactSales: "ទាក់ទងផ្នែកលក់",
      features: [
        "សាកល្បង ៣០ ថ្ងៃឥតគិតថ្លៃ",
        "មិនត្រូវការកាតឥណទាន",
        "ចូលប្រើមុខងារពេញលេញ",
        "រួមបញ្ចូលការបណ្តុះបណ្តាលឥតគិតថ្លៃ"
      ]
    },
    footer: {
      product: "ផលិតផល",
      resources: "ធនធាន",
      company: "ក្រុមហ៊ុន",
      support: "ជំនួយ",
      links: {
        features: "មុខងារ",
        pricing: "តម្លៃ",
        tutorials: "មេរៀន",
        documentation: "ឯកសារ",
        about: "អំពីយើង",
        contact: "ទំនាក់ទំនង",
        help: "មជ្ឈមណ្ឌលជំនួយ",
        community: "សហគមន៍"
      }
    }
  }
};

export default function ShowcasePage() {
  const { language } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeCategory, setActiveCategory] = useState('learning');
  const [activeRole, setActiveRole] = useState('student');
  const [showDemo, setShowDemo] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [activeSimCategory, setActiveSimCategory] = useState('physics');
  const [activeExerciseCategory, setActiveExerciseCategory] = useState('physics');

  const t = translations[language];

  // Animate workflow steps
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % t.workflow.steps.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, t.workflow.steps.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-b border-gray-200 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-2">
                <FlaskConical className="h-8 w-8 text-purple-600" />
                <span className="text-xl font-bold text-gray-900">Virtual Lab</span>
              </Link>
              <div className="hidden md:flex items-center space-x-6">
                <a href="#features" className="text-gray-600 hover:text-purple-600 transition-colors">
                  {t.nav.features}
                </a>
                <a href="#simulations" className="text-gray-600 hover:text-purple-600 transition-colors">
                  {t.nav.simulations}
                </a>
                <a href="#exercises" className="text-gray-600 hover:text-purple-600 transition-colors">
                  {t.nav.exercises}
                </a>
                <a href="/docs/project-process-breakdown.html" className="text-gray-600 hover:text-purple-600 transition-colors">
                  {t.nav.document}
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageTogglePill />
              <Link href="/auth/login">
                <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white">
                  {t.hero.startLearning}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="container mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-5xl mx-auto"
          >
            <Badge className="mb-4 bg-purple-100 text-purple-700 border-purple-300">
              <Sparkles className="h-3 w-3 mr-1" />
              {t.hero.badge}
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              {t.hero.title}
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {t.hero.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                onClick={() => setShowDemo(true)}
              >
                <Play className="h-5 w-5 mr-2" />
                {t.hero.watchDemo}
              </Button>
              <Link href="/auth/login">
                <Button size="lg" variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50">
                  {t.hero.tryFree}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Link href="/docs/project-process-breakdown.html">
                <Button size="lg" variant="outline" className="border-gray-600 text-gray-600 hover:bg-gray-50">
                  <FileText className="h-5 w-5 mr-2" />
                  {t.hero.viewDocument}
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Hero Image/Animation */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-16 relative"
          >
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-1">
              <div className="bg-white rounded-3xl p-8 md:p-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    { icon: Microscope, label: t.stats.virtualLabs, value: "121+" },
                    { icon: Users, label: t.stats.activeStudents, value: "5,000+" },
                    { icon: School, label: t.stats.schools, value: "32" }
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="text-center"
                    >
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 mb-4">
                        <stat.icon className="h-8 w-8 text-purple-600" />
                      </div>
                      <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                      <p className="text-gray-600">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {[
              { icon: Users, label: t.stats.activeStudents, value: "5,000+", color: "blue" },
              { icon: FlaskConical, label: t.stats.virtualLabs, value: "121+", color: "purple" },
              { icon: School, label: t.stats.schools, value: "32", color: "green" },
              { icon: Trophy, label: t.stats.successRate, value: "95%", color: "yellow" },
              { icon: PenTool, label: t.stats.exercises, value: "2,000+", color: "pink" },
              { icon: GraduationCap, label: t.stats.teachers, value: "65+", color: "indigo" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className={cn(
                  "inline-flex items-center justify-center w-14 h-14 rounded-full mb-3",
                  stat.color === "blue" && "bg-blue-100",
                  stat.color === "purple" && "bg-purple-100",
                  stat.color === "green" && "bg-green-100",
                  stat.color === "yellow" && "bg-yellow-100",
                  stat.color === "pink" && "bg-pink-100",
                  stat.color === "indigo" && "bg-indigo-100"
                )}>
                  <stat.icon className={cn(
                    "h-7 w-7",
                    stat.color === "blue" && "text-blue-600",
                    stat.color === "purple" && "text-purple-600",
                    stat.color === "green" && "text-green-600",
                    stat.color === "yellow" && "text-yellow-600",
                    stat.color === "pink" && "text-pink-600",
                    stat.color === "indigo" && "text-indigo-600"
                  )} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t.features.title}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">{t.features.subtitle}</p>
          </motion.div>

          {/* Feature Categories */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {Object.entries(t.features.categories).map(([key, category]) => (
              <Button
                key={key}
                variant={activeCategory === key ? "default" : "outline"}
                onClick={() => setActiveCategory(key)}
                className={cn(
                  "transition-all",
                  activeCategory === key && "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                )}
              >
                {category.title}
              </Button>
            ))}
          </div>

          {/* Feature Items */}
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {Object.entries(t.features.categories[activeCategory].items).map(([key, item], index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="flex items-start space-x-4">
                      <div className="p-3 rounded-lg bg-gradient-to-r from-purple-100 to-indigo-100">
                        {activeCategory === 'learning' && key === 'virtualLabs' && <FlaskConical className="h-6 w-6 text-purple-600" />}
                        {activeCategory === 'learning' && key === 'multiSubject' && <Layers className="h-6 w-6 text-purple-600" />}
                        {activeCategory === 'learning' && key === 'adaptiveAssessments' && <BrainCircuit className="h-6 w-6 text-purple-600" />}
                        {activeCategory === 'learning' && key === 'exerciseLibrary' && <BookOpen className="h-6 w-6 text-purple-600" />}
                        {activeCategory === 'learning' && key === 'gamification' && <Trophy className="h-6 w-6 text-purple-600" />}
                        {activeCategory === 'learning' && key === 'peerLearning' && <Users2 className="h-6 w-6 text-purple-600" />}
                        {activeCategory === 'teaching' && key === 'curriculumBuilder' && <Puzzle className="h-6 w-6 text-purple-600" />}
                        {activeCategory === 'teaching' && key === 'studentAnalytics' && <BarChart3 className="h-6 w-6 text-purple-600" />}
                        {activeCategory === 'teaching' && key === 'assignmentManagement' && <ClipboardCheck className="h-6 w-6 text-purple-600" />}
                        {activeCategory === 'teaching' && key === 'communicationHub' && <MessageSquare className="h-6 w-6 text-purple-600" />}
                        {activeCategory === 'teaching' && key === 'resourceLibrary' && <BookOpen className="h-6 w-6 text-purple-600" />}
                        {activeCategory === 'teaching' && key === 'professionalDev' && <Award className="h-6 w-6 text-purple-600" />}
                        {activeCategory === 'assessment' && key === 'multiPhase' && <Activity className="h-6 w-6 text-purple-600" />}
                        {activeCategory === 'assessment' && key === 'autoScoring' && <Zap className="h-6 w-6 text-purple-600" />}
                        {activeCategory === 'assessment' && key === 'progressMonitoring' && <TrendingUp className="h-6 w-6 text-purple-600" />}
                        {activeCategory === 'assessment' && key === 'exportReports' && <FileDown className="h-6 w-6 text-purple-600" />}
                        {activeCategory === 'assessment' && key === 'parentPortal' && <Heart className="h-6 w-6 text-purple-600" />}
                        {activeCategory === 'assessment' && key === 'certificates' && <Medal className="h-6 w-6 text-purple-600" />}
                        {activeCategory === 'platform' && key === 'multiLanguage' && <Languages className="h-6 w-6 text-purple-600" />}
                        {activeCategory === 'platform' && key === 'roleBasedAccess' && <UserCheck className="h-6 w-6 text-purple-600" />}
                        {activeCategory === 'platform' && key === 'mobileResponsive' && <Smartphone className="h-6 w-6 text-purple-600" />}
                        {activeCategory === 'platform' && key === 'secureAuth' && <Lock className="h-6 w-6 text-purple-600" />}
                        {activeCategory === 'platform' && key === 'offlineMode' && <Cloud className="h-6 w-6 text-purple-600" />}
                        {activeCategory === 'platform' && key === 'cloudSync' && <Database className="h-6 w-6 text-purple-600" />}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        <CardDescription className="mt-2">{item.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Simulations Section */}
      <section id="simulations" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t.simulations.title}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">{t.simulations.subtitle}</p>
          </motion.div>

          {/* Simulation Categories */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {Object.entries(t.simulations.categories).map(([key, category]) => (
              <Button
                key={key}
                variant={activeSimCategory === key ? "default" : "outline"}
                onClick={() => setActiveSimCategory(key)}
                className={cn(
                  "transition-all",
                  activeSimCategory === key && "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                )}
              >
                <category.icon className="h-4 w-4 mr-2" />
                {category.title}
              </Button>
            ))}
          </div>

          {/* Simulation Cards */}
          <motion.div
            key={activeSimCategory}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {t.simulations.categories[activeSimCategory].simulations.map((sim, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl transition-all hover:-translate-y-1">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl mb-2">{sim.title}</CardTitle>
                        <CardDescription className="mb-4">{sim.description}</CardDescription>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "ml-4",
                          sim.level === "Beginner" && "border-green-500 text-green-700",
                          sim.level === "Intermediate" && "border-yellow-500 text-yellow-700",
                          sim.level === "Advanced" && "border-red-500 text-red-700",
                          sim.level === "កម្រិតដំបូង" && "border-green-500 text-green-700",
                          sim.level === "កម្រិតមធ្យម" && "border-yellow-500 text-yellow-700",
                          sim.level === "កម្រិតខ្ពស់" && "border-red-500 text-red-700"
                        )}
                      >
                        {sim.level}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-1" />
                        {sim.duration}
                      </div>
                      <Button size="sm" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white">
                        <Play className="h-4 w-4 mr-1" />
                        {language === 'km' ? 'ចាប់ផ្តើម' : 'Start'}
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {sim.topics.map((topic, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-12 text-center">
            <Link href="/dashboard/simulations">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white">
                {t.simulations.viewAll}
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Exercises Section */}
      <section id="exercises" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t.exercises.title}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">{t.exercises.subtitle}</p>
          </motion.div>

          {/* Exercise Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {t.exercises.features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 mb-4">
                  <feature.icon className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Exercise Categories */}
          <Tabs value={activeExerciseCategory} onValueChange={setActiveExerciseCategory}>
            <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto mb-8">
              {Object.keys(t.exercises.categories).map((key) => (
                <TabsTrigger key={key} value={key} className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
                  {t.exercises.categories[key].title}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(t.exercises.categories).map(([key, category]) => (
              <TabsContent key={key} value={key}>
                <Card className="max-w-4xl mx-auto">
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl mb-2">{category.title}</CardTitle>
                    <Badge className="bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 border-purple-300">
                      {category.count}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {category.topics.map((topic, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700">{topic}</span>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t.roles.title}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">{t.roles.subtitle}</p>
          </motion.div>

          {/* Role Tabs */}
          <Tabs value={activeRole} onValueChange={setActiveRole} className="max-w-6xl mx-auto">
            <TabsList className="grid grid-cols-4 w-full mb-12">
              {Object.keys(t.roles).filter(key => !['title', 'subtitle', 'dashboard', 'personalized', 'livePreview', 'interactive', 'viewDemo'].includes(key)).map((key) => (
                <TabsTrigger key={key} value={key} className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
                  {t.roles[key].title}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(t.roles).filter(([key]) => !['title', 'subtitle', 'dashboard', 'personalized', 'livePreview', 'interactive', 'viewDemo'].includes(key)).map(([key, role]) => (
              <TabsContent key={key} value={key}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
                >
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">{role.title}</h3>
                    <p className="text-xl text-gray-600 mb-8">{role.subtitle}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {role.features.map((feature, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start space-x-3"
                        >
                          <div className="p-2 rounded-lg bg-gradient-to-r from-purple-100 to-indigo-100 flex-shrink-0">
                            <feature.icon className="h-5 w-5 text-purple-600" />
                          </div>
                          <span className="text-gray-700">{feature.text}</span>
                        </motion.div>
                      ))}
                    </div>
                    <Button className="mt-8 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white">
                      {t.roles.viewDemo}
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl transform rotate-3"></div>
                    <Card className="relative z-10 overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
                        <CardTitle className="text-center">{t.roles.dashboard}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-8 bg-white">
                        <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <Monitor className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">{t.roles.livePreview}</p>
                            <Badge className="mt-2">{t.roles.interactive}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t.workflow.title}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">{t.workflow.subtitle}</p>
            <Button
              variant="outline"
              onClick={() => setIsPlaying(!isPlaying)}
              className="border-purple-600 text-purple-600 hover:bg-purple-50"
            >
              {isPlaying ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  {t.workflow.pauseAnimation}
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  {t.workflow.playAnimation}
                </>
              )}
            </Button>
          </motion.div>

          {/* Workflow Steps */}
          <div className="max-w-5xl mx-auto">
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-16 left-8 right-8 h-1 bg-gray-200 rounded-full hidden md:block">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${((currentStep + 1) / t.workflow.steps.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              {/* Steps */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-8 relative z-10">
                {t.workflow.steps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center"
                  >
                    <motion.div
                      className={cn(
                        "w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center transition-all",
                        index <= currentStep
                          ? "bg-gradient-to-r from-purple-600 to-indigo-600"
                          : "bg-gray-200"
                      )}
                      animate={{
                        scale: index === currentStep ? 1.2 : 1,
                      }}
                    >
                      <step.icon className={cn(
                        "h-8 w-8",
                        index <= currentStep ? "text-white" : "text-gray-400"
                      )} />
                    </motion.div>
                    <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                    {index === currentStep && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="text-xs text-purple-600"
                      >
                        {step.details}
                      </motion.p>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">{t.tech.title}</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">{t.tech.subtitle}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {t.tech.stack.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <h3 className="text-xl font-semibold mb-4 text-purple-400">{category.category}</h3>
                <div className="space-y-3">
                  {category.items.map((item, i) => (
                    <div key={i} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors">
                      <item.icon className="h-5 w-5 text-purple-500" />
                      <span className="text-gray-300">{item.name}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t.testimonials.title}</h2>
            <p className="text-xl text-gray-600">{t.testimonials.subtitle}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {t.testimonials.items.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-600 mb-6 italic">"{testimonial.content}"</p>
                    <div className="border-t pt-4">
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                      <p className="text-sm text-purple-600">{testimonial.school}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto"
          >
            <h2 className="text-4xl font-bold mb-4">{t.cta.title}</h2>
            <p className="text-xl mb-8 text-purple-100">{t.cta.subtitle}</p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link href="/auth/login">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                  {t.cta.getStarted}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Calendar className="h-5 w-5 mr-2" />
                {t.cta.scheduleDemo}
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <MessageSquare className="h-5 w-5 mr-2" />
                {t.cta.contactSales}
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {t.cta.features.map((feature, index) => (
                <div key={index} className="flex items-center justify-center space-x-2 text-purple-100">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <FlaskConical className="h-8 w-8 text-purple-500" />
                <span className="text-xl font-bold text-white">Virtual Lab</span>
              </div>
              <p className="text-sm">
                {language === 'km' 
                  ? 'ផ្លាស់ប្តូរការអប់រំ STEM នៅកម្ពុជា'
                  : 'Transforming STEM education in Cambodia'}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">{t.footer.product}</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-purple-400 transition-colors">{t.footer.links.features}</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">{t.footer.links.pricing}</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">{t.footer.resources}</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-purple-400 transition-colors">{t.footer.links.tutorials}</a></li>
                <li><a href="/docs/project-process-breakdown.html" className="hover:text-purple-400 transition-colors">{t.footer.links.documentation}</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">{t.footer.support}</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-purple-400 transition-colors">{t.footer.links.help}</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">{t.footer.links.contact}</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>© 2024 Cambodia Virtual Lab. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Demo Modal */}
      <AnimatePresence>
        {showDemo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDemo(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-900">{t.demo.featureDemo}</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowDemo(false)}
                  >
                    <XCircle className="h-6 w-6" />
                  </Button>
                </div>
              </div>
              <div className="p-6">
                <div className="aspect-video bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Play className="h-16 w-16 text-purple-600 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">{t.demo.interactiveDemoText}</p>
                    <div className="flex flex-wrap justify-center gap-4">
                      <Badge>{t.demo.realTimeInteraction}</Badge>
                      <Badge>{t.demo.instantFeedback}</Badge>
                      <Badge>{t.demo.progressTracking}</Badge>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-center">
                  <Link href="/auth/login">
                    <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white">
                      {t.demo.tryItNow}
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}