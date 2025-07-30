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
  Copy
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

// Translations
const translations = {
  en: {
    nav: {
      features: "Features",
      document: "Document"
    },
    hero: {
      badge: "Virtual Lab LMS Platform",
      title: "Transform Education with Interactive Science Labs",
      subtitle: "Experience the future of STEM education with our comprehensive virtual laboratory platform. Engage students, empower teachers, and elevate learning outcomes.",
      watchDemo: "Watch Demo",
      tryFree: "Try Free",
      viewDocument: "View Document"
    },
    stats: {
      activeStudents: "Active Students",
      virtualLabs: "Virtual Labs",
      schools: "Schools",
      successRate: "Success Rate"
    },
    features: {
      title: "Powerful Features for Modern Education",
      subtitle: "Everything you need to create engaging and effective learning experiences",
      categories: {
        learning: {
          title: "Learning Experience",
          items: {
            virtualLabs: {
              title: "Interactive Virtual Labs",
              description: "Hands-on science experiments with real-time simulations"
            },
            multiSubject: {
              title: "Multi-Subject Support",
              description: "Physics, Chemistry, Biology, Mathematics integrated seamlessly"
            },
            adaptiveAssessments: {
              title: "Adaptive Assessments",
              description: "AI-powered testing that adapts to student performance"
            },
            exerciseLibrary: {
              title: "Exercise Library",
              description: "Comprehensive practice problems with instant feedback"
            }
          }
        },
        teaching: {
          title: "Teaching Tools",
          items: {
            curriculumBuilder: {
              title: "Curriculum Builder",
              description: "Drag-and-drop lesson planning aligned with standards"
            },
            studentAnalytics: {
              title: "Student Analytics",
              description: "Real-time insights into student progress and performance"
            },
            assignmentManagement: {
              title: "Assignment Management",
              description: "Create, distribute, and grade assignments efficiently"
            },
            communicationHub: {
              title: "Communication Hub",
              description: "Integrated messaging and announcement system"
            }
          }
        },
        assessment: {
          title: "Assessment & Tracking",
          items: {
            multiPhase: {
              title: "Multi-Phase Tracking",
              description: "Baseline, Midline, and Endline assessment cycles"
            },
            autoScoring: {
              title: "Auto-Scoring Engine",
              description: "Instant grading with manual override options"
            },
            progressMonitoring: {
              title: "Progress Monitoring",
              description: "Visual progress tracking for students and teachers"
            },
            exportReports: {
              title: "Export & Reports",
              description: "Generate detailed reports in multiple formats"
            }
          }
        },
        platform: {
          title: "Platform Features",
          items: {
            multiLanguage: {
              title: "Multi-Language Support",
              description: "Full Khmer and English interface with custom fonts"
            },
            roleBasedAccess: {
              title: "Role-Based Access",
              description: "Customized experiences for different user types"
            },
            mobileResponsive: {
              title: "Mobile Responsive",
              description: "Optimized for all devices and screen sizes"
            },
            secureAuth: {
              title: "Secure Authentication",
              description: "Enterprise-grade security with session management"
            }
          }
        }
      }
    },
    roles: {
      title: "Tailored Experiences for Every User",
      subtitle: "Role-based access control ensures the right tools for the right people",
      dashboard: "Dashboard",
      personalized: "Personalized tools and features",
      livePreview: "Live Preview",
      interactive: "Interactive",
      viewDemo: "View Demo",
      student: {
        title: "Student",
        permissions: [
          "Access virtual labs",
          "Submit assignments",
          "Track progress",
          "View grades",
          "Message teachers"
        ]
      },
      teacher: {
        title: "Teacher",
        permissions: [
          "Create assignments",
          "Grade submissions",
          "Monitor students",
          "Build curriculum",
          "Generate reports"
        ]
      },
      admin: {
        title: "Admin",
        permissions: [
          "Manage users",
          "System configuration",
          "View all analytics",
          "Export data",
          "Full access control"
        ]
      },
      parent: {
        title: "Parent",
        permissions: [
          "View child progress",
          "Access grades",
          "Message teachers",
          "Track attendance",
          "View assignments"
        ]
      }
    },
    workflow: {
      title: "Seamless Learning Workflow",
      subtitle: "From assessment to achievement in a few simple steps",
      playAnimation: "Play Animation",
      pauseAnimation: "Pause Animation",
      steps: [
        {
          title: "Baseline Assessment",
          description: "Evaluate initial knowledge"
        },
        {
          title: "Personalized Learning",
          description: "Adaptive content delivery"
        },
        {
          title: "Progress Tracking",
          description: "Real-time monitoring"
        },
        {
          title: "Achievement & Reports",
          description: "Celebrate success"
        }
      ]
    },
    tech: {
      title: "Built with Modern Technology",
      subtitle: "Reliable, scalable, and secure infrastructure"
    },
    cta: {
      title: "Ready to Transform Your Education?",
      subtitle: "Join thousands of students and teachers already using Virtual Lab",
      getStarted: "Get Started Free",
      scheduleDemo: "Schedule Demo"
    },
    demo: {
      featureDemo: "Feature Demo",
      interactiveDemoText: "Interactive demo would be displayed here",
      realTimeInteraction: "Real-time interaction",
      instantFeedback: "Instant feedback",
      progressTracking: "Progress tracking",
      tryItNow: "Try It Now",
      closeDemo: "Close Demo"
    }
  },
  km: {
    nav: {
      features: "មុខងារ",
      document: "ឯកសារ"
    },
    hero: {
      badge: "វេទិកា Virtual Lab LMS",
      title: "ផ្លាស់ប្តូរការអប់រំជាមួយមន្ទីរពិសោធន៍វិទ្យាសាស្ត្រអន្តរកម្ម",
      subtitle: "បទពិសោធន៍អនាគតនៃការអប់រំ STEM ជាមួយវេទិកាមន្ទីរពិសោធន៍និម្មិតដ៏ទូលំទូលាយរបស់យើង។ ទាក់ទាញសិស្ស ផ្តល់អំណាចដល់គ្រូ និងលើកកម្ពស់លទ្ធផលសិក្សា។",
      watchDemo: "មើលការបង្ហាញ",
      tryFree: "សាកល្បងឥតគិតថ្លៃ",
      viewDocument: "មើលឯកសារ"
    },
    stats: {
      activeStudents: "សិស្សសកម្ម",
      virtualLabs: "មន្ទីរពិសោធន៍និម្មិត",
      schools: "សាលារៀន",
      successRate: "អត្រាជោគជ័យ"
    },
    features: {
      title: "មុខងារដ៏មានអានុភាពសម្រាប់ការអប់រំទំនើប",
      subtitle: "អ្វីគ្រប់យ៉ាងដែលអ្នកត្រូវការដើម្បីបង្កើតបទពិសោធន៍សិក្សាដែលទាក់ទាញ និងមានប្រសិទ្ធភាព",
      categories: {
        learning: {
          title: "បទពិសោធន៍សិក្សា",
          items: {
            virtualLabs: {
              title: "មន្ទីរពិសោធន៍និម្មិតអន្តរកម្ម",
              description: "ការពិសោធន៍វិទ្យាសាស្ត្រដោយផ្ទាល់ជាមួយការក្លែងធ្វើពេលជាក់ស្តែង"
            },
            multiSubject: {
              title: "ការគាំទ្រមុខវិជ្ជាច្រើន",
              description: "រូបវិទ្យា គីមីវិទ្យា ជីវវិទ្យា គណិតវិទ្យា រួមបញ្ចូលគ្នាយ៉ាងរលូន"
            },
            adaptiveAssessments: {
              title: "ការវាយតម្លៃប្រែប្រួល",
              description: "ការធ្វើតេស្តដែលដំណើរការដោយ AI ដែលសម្របតាមការអនុវត្តរបស់សិស្ស"
            },
            exerciseLibrary: {
              title: "បណ្ណាល័យលំហាត់",
              description: "បញ្ហាអនុវត្តដ៏ទូលំទូលាយជាមួយមតិកែលម្អភ្លាមៗ"
            }
          }
        },
        teaching: {
          title: "ឧបករណ៍បង្រៀន",
          items: {
            curriculumBuilder: {
              title: "អ្នកបង្កើតកម្មវិធីសិក្សា",
              description: "ការរៀបចំមេរៀនអូស-ទម្លាក់ស្របតាមស្តង់ដារ"
            },
            studentAnalytics: {
              title: "ការវិភាគសិស្ស",
              description: "ការយល់ដឹងពេលជាក់ស្តែងអំពីវឌ្ឍនភាព និងការអនុវត្តរបស់សិស្ស"
            },
            assignmentManagement: {
              title: "ការគ្រប់គ្រងកិច្ចការ",
              description: "បង្កើត ចែកចាយ និងដាក់ពិន្ទុកិច្ចការប្រកបដោយប្រសិទ្ធភាព"
            },
            communicationHub: {
              title: "មជ្ឈមណ្ឌលទំនាក់ទំនង",
              description: "ប្រព័ន្ធផ្ញើសារ និងប្រកាសរួមបញ្ចូលគ្នា"
            }
          }
        },
        assessment: {
          title: "ការវាយតម្លៃ និងការតាមដាន",
          items: {
            multiPhase: {
              title: "ការតាមដានពហុដំណាក់កាល",
              description: "វដ្តវាយតម្លៃមូលដ្ឋាន កណ្តាល និងចុងក្រោយ"
            },
            autoScoring: {
              title: "ម៉ាស៊ីនដាក់ពិន្ទុស្វ័យប្រវត្តិ",
              description: "ការដាក់ពិន្ទុភ្លាមៗជាមួយជម្រើសបដិសេធដោយដៃ"
            },
            progressMonitoring: {
              title: "ការត្រួតពិនិត្យវឌ្ឍនភាព",
              description: "ការតាមដានវឌ្ឍនភាពដែលមើលឃើញសម្រាប់សិស្ស និងគ្រូ"
            },
            exportReports: {
              title: "នាំចេញ និងរបាយការណ៍",
              description: "បង្កើតរបាយការណ៍លម្អិតក្នុងទម្រង់ច្រើន"
            }
          }
        },
        platform: {
          title: "មុខងារវេទិកា",
          items: {
            multiLanguage: {
              title: "ការគាំទ្រពហុភាសា",
              description: "ចំណុចប្រទាក់ភាសាខ្មែរ និងអង់គ្លេសពេញលេញជាមួយពុម្ពអក្សរផ្ទាល់ខ្លួន"
            },
            roleBasedAccess: {
              title: "ការចូលប្រើផ្អែកលើតួនាទី",
              description: "បទពិសោធន៍ប្តូរតាមបំណងសម្រាប់ប្រភេទអ្នកប្រើផ្សេងៗ"
            },
            mobileResponsive: {
              title: "ឆ្លើយតបទូរស័ព្ទ",
              description: "បានបង្កើនប្រសិទ្ធភាពសម្រាប់ឧបករណ៍ និងទំហំអេក្រង់ទាំងអស់"
            },
            secureAuth: {
              title: "ការផ្ទៀងផ្ទាត់សុវត្ថិភាព",
              description: "សុវត្ថិភាពកម្រិតសហគ្រាសជាមួយការគ្រប់គ្រងសម័យ"
            }
          }
        }
      }
    },
    roles: {
      title: "បទពិសោធន៍ប្តូរតាមបំណងសម្រាប់អ្នកប្រើគ្រប់រូប",
      subtitle: "ការគ្រប់គ្រងការចូលប្រើផ្អែកលើតួនាទីធានាឧបករណ៍ត្រឹមត្រូវសម្រាប់មនុស្សត្រឹមត្រូវ",
      dashboard: "ផ្ទាំងគ្រប់គ្រង",
      personalized: "ឧបករណ៍ និងមុខងារផ្ទាល់ខ្លួន",
      livePreview: "ការមើលជាមុនផ្ទាល់",
      interactive: "អន្តរកម្ម",
      viewDemo: "មើលការបង្ហាញ",
      student: {
        title: "សិស្ស",
        permissions: [
          "ចូលប្រើមន្ទីរពិសោធន៍និម្មិត",
          "ដាក់ស្នើកិច្ចការ",
          "តាមដានវឌ្ឍនភាព",
          "មើលពិន្ទុ",
          "ផ្ញើសារទៅគ្រូ"
        ]
      },
      teacher: {
        title: "គ្រូ",
        permissions: [
          "បង្កើតកិច្ចការ",
          "ដាក់ពិន្ទុការដាក់ស្នើ",
          "ត្រួតពិនិត្យសិស្ស",
          "បង្កើតកម្មវិធីសិក្សា",
          "បង្កើតរបាយការណ៍"
        ]
      },
      admin: {
        title: "អ្នកគ្រប់គ្រង",
        permissions: [
          "គ្រប់គ្រងអ្នកប្រើ",
          "កំណត់រចនាសម្ព័ន្ធប្រព័ន្ធ",
          "មើលការវិភាគទាំងអស់",
          "នាំចេញទិន្នន័យ",
          "ការគ្រប់គ្រងការចូលប្រើពេញលេញ"
        ]
      },
      parent: {
        title: "ឪពុកម្តាយ",
        permissions: [
          "មើលវឌ្ឍនភាពកូន",
          "ចូលមើលពិន្ទុ",
          "ផ្ញើសារទៅគ្រូ",
          "តាមដានវត្តមាន",
          "មើលកិច្ចការ"
        ]
      }
    },
    workflow: {
      title: "លំហូរការងារសិក្សារលូន",
      subtitle: "ពីការវាយតម្លៃទៅសម្រេចបានក្នុងជំហានសាមញ្ញពីរបី",
      playAnimation: "លេងចលនា",
      pauseAnimation: "ផ្អាកចលនា",
      steps: [
        {
          title: "ការវាយតម្លៃមូលដ្ឋាន",
          description: "វាយតម្លៃចំណេះដឹងដំបូង"
        },
        {
          title: "ការរៀនផ្ទាល់ខ្លួន",
          description: "ការផ្តល់មាតិកាប្រែប្រួល"
        },
        {
          title: "ការតាមដានវឌ្ឍនភាព",
          description: "ការត្រួតពិនិត្យពេលជាក់ស្តែង"
        },
        {
          title: "សមិទ្ធផល និងរបាយការណ៍",
          description: "អបអរជោគជ័យ"
        }
      ]
    },
    tech: {
      title: "បង្កើតជាមួយបច្ចេកវិទ្យាទំនើប",
      subtitle: "ហេដ្ឋារចនាសម្ព័ន្ធដែលអាចទុកចិត្តបាន អាចពង្រីកបាន និងមានសុវត្ថិភាព"
    },
    cta: {
      title: "ត្រៀមខ្លួនដើម្បីផ្លាស់ប្តូរការអប់រំរបស់អ្នក?",
      subtitle: "ចូលរួមជាមួយសិស្ស និងគ្រូរាប់ពាន់នាក់ដែលកំពុងប្រើ Virtual Lab រួចហើយ",
      getStarted: "ចាប់ផ្តើមឥតគិតថ្លៃ",
      scheduleDemo: "កំណត់ពេលបង្ហាញ"
    },
    demo: {
      featureDemo: "ការបង្ហាញមុខងារ",
      interactiveDemoText: "ការបង្ហាញអន្តរកម្មនឹងត្រូវបានបង្ហាញនៅទីនេះ",
      realTimeInteraction: "អន្តរកម្មពេលជាក់ស្តែង",
      instantFeedback: "មតិកែលម្អភ្លាមៗ",
      progressTracking: "ការតាមដានវឌ្ឍនភាព",
      tryItNow: "សាកល្បងឥឡូវនេះ",
      closeDemo: "បិទការបង្ហាញ"
    }
  }
};

export default function ShowcasePage() {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("Student");
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const { language, getFontClass } = useLanguage();
  const t = translations[language as keyof typeof translations];

  // Feature categories with translations
  const features = [
    {
      category: t.features.categories.learning.title,
      icon: GraduationCap,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      items: [
        {
          title: t.features.categories.learning.items.virtualLabs.title,
          description: t.features.categories.learning.items.virtualLabs.description,
          icon: Microscope,
          demo: "lab-simulation"
        },
        {
          title: t.features.categories.learning.items.multiSubject.title,
          description: t.features.categories.learning.items.multiSubject.description,
          icon: Atom,
          demo: "subject-selection"
        },
        {
          title: t.features.categories.learning.items.adaptiveAssessments.title,
          description: t.features.categories.learning.items.adaptiveAssessments.description,
          icon: Brain,
          demo: "assessment-engine"
        },
        {
          title: t.features.categories.learning.items.exerciseLibrary.title,
          description: t.features.categories.learning.items.exerciseLibrary.description,
          icon: BookOpen,
          demo: "exercise-system"
        }
      ]
    },
    {
      category: t.features.categories.teaching.title,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
      items: [
        {
          title: t.features.categories.teaching.items.curriculumBuilder.title,
          description: t.features.categories.teaching.items.curriculumBuilder.description,
          icon: Layers,
          demo: "curriculum-builder"
        },
        {
          title: t.features.categories.teaching.items.studentAnalytics.title,
          description: t.features.categories.teaching.items.studentAnalytics.description,
          icon: BarChart3,
          demo: "analytics-dashboard"
        },
        {
          title: t.features.categories.teaching.items.assignmentManagement.title,
          description: t.features.categories.teaching.items.assignmentManagement.description,
          icon: FileText,
          demo: "assignment-system"
        },
        {
          title: t.features.categories.teaching.items.communicationHub.title,
          description: t.features.categories.teaching.items.communicationHub.description,
          icon: MessageSquare,
          demo: "messaging-system"
        }
      ]
    },
    {
      category: t.features.categories.assessment.title,
      icon: Target,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      items: [
        {
          title: t.features.categories.assessment.items.multiPhase.title,
          description: t.features.categories.assessment.items.multiPhase.description,
          icon: TrendingUp,
          demo: "assessment-phases"
        },
        {
          title: t.features.categories.assessment.items.autoScoring.title,
          description: t.features.categories.assessment.items.autoScoring.description,
          icon: CheckCircle2,
          demo: "scoring-system"
        },
        {
          title: t.features.categories.assessment.items.progressMonitoring.title,
          description: t.features.categories.assessment.items.progressMonitoring.description,
          icon: Award,
          demo: "progress-tracking"
        },
        {
          title: t.features.categories.assessment.items.exportReports.title,
          description: t.features.categories.assessment.items.exportReports.description,
          icon: Download,
          demo: "report-generation"
        }
      ]
    },
    {
      category: t.features.categories.platform.title,
      icon: Settings,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      items: [
        {
          title: t.features.categories.platform.items.multiLanguage.title,
          description: t.features.categories.platform.items.multiLanguage.description,
          icon: Languages,
          demo: "language-switcher"
        },
        {
          title: t.features.categories.platform.items.roleBasedAccess.title,
          description: t.features.categories.platform.items.roleBasedAccess.description,
          icon: UserCheck,
          demo: "role-management"
        },
        {
          title: t.features.categories.platform.items.mobileResponsive.title,
          description: t.features.categories.platform.items.mobileResponsive.description,
          icon: Smartphone,
          demo: "responsive-design"
        },
        {
          title: t.features.categories.platform.items.secureAuth.title,
          description: t.features.categories.platform.items.secureAuth.description,
          icon: Shield,
          demo: "security-features"
        }
      ]
    }
  ];

  // User roles with permissions
  const userRoles = [
    {
      role: t.roles.student.title,
      icon: GraduationCap,
      color: "text-blue-600",
      permissions: t.roles.student.permissions
    },
    {
      role: t.roles.teacher.title,
      icon: Users,
      color: "text-green-600",
      permissions: t.roles.teacher.permissions
    },
    {
      role: t.roles.admin.title,
      icon: Settings,
      color: "text-purple-600",
      permissions: t.roles.admin.permissions
    },
    {
      role: t.roles.parent.title,
      icon: Users,
      color: "text-orange-600",
      permissions: t.roles.parent.permissions
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
    { label: t.stats.activeStudents, value: "2,500+", icon: GraduationCap },
    { label: t.stats.virtualLabs, value: "150+", icon: Microscope },
    { label: t.stats.schools, value: "32", icon: BookOpen },
    { label: t.stats.successRate, value: "94%", icon: TrendingUp }
  ];

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
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2">
                <FlaskConical className="h-8 w-8 text-blue-600" />
                <span className={`text-xl font-bold ${getFontClass()}`}>Virtual Lab</span>
              </Link>
              <div className="hidden md:flex items-center gap-4">
                <Button variant="ghost" className={getFontClass()}>
                  {t.nav.features}
                </Button>
                <Link href="/showcase/document">
                  <Button variant="ghost" className={`flex items-center gap-2 ${getFontClass()}`}>
                    <FileText className="w-4 h-4" />
                    {t.nav.document}
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <LanguageTogglePill />
              <Link href="/auth/login">
                <Button className="flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  {t.hero.tryFree}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

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
            <Badge className={`mb-4 px-4 py-2 text-sm font-semibold ${getFontClass()}`}>
              <Sparkles className="w-4 h-4 mr-2" />
              {t.hero.badge}
            </Badge>
            
            <h1 className={`text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600 bg-clip-text text-transparent ${getFontClass()}`}>
              {t.hero.title}
            </h1>
            
            <p className={`text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed ${getFontClass()}`}>
              {t.hero.subtitle}
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center mb-12">
              <Button size="lg" className={`group ${getFontClass()}`}>
                <Play className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                {t.hero.watchDemo}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" asChild className={getFontClass()}>
                <Link href="/auth/login">
                  {t.hero.tryFree}
                  <Zap className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Link href="/showcase/document">
                <Button size="lg" variant="secondary" className={`flex items-center gap-2 ${getFontClass()}`}>
                  <FileDown className="w-5 h-5" />
                  {t.hero.viewDocument}
                </Button>
              </Link>
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
                  <div className={`text-3xl font-bold text-gray-900 ${getFontClass()}`}>{stat.value}</div>
                  <div className={`text-sm text-gray-600 ${getFontClass()}`}>{stat.label}</div>
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
            <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${getFontClass()}`}>
              {t.features.title}
            </h2>
            <p className={`text-xl text-gray-600 ${getFontClass()}`}>
              {t.features.subtitle}
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
                <h3 className={`text-2xl font-bold ${getFontClass()}`}>{category.category}</h3>
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
                      <h4 className={`text-lg font-semibold mb-2 ${getFontClass()}`}>{item.title}</h4>
                      <p className={`text-sm text-gray-600 ${getFontClass()}`}>{item.description}</p>
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
            <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${getFontClass()}`}>
              {t.roles.title}
            </h2>
            <p className={`text-xl text-gray-600 ${getFontClass()}`}>
              {t.roles.subtitle}
            </p>
          </motion.div>

          <Tabs defaultValue={t.roles.student.title} className="w-full">
            <TabsList className={`grid grid-cols-4 w-full max-w-2xl mx-auto mb-8 ${getFontClass()}`}>
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
                      <h3 className={`text-2xl font-bold ${getFontClass()}`}>{role.role} {t.roles.dashboard}</h3>
                      <p className={`text-gray-600 ${getFontClass()}`}>{t.roles.personalized}</p>
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
                        <span className={`text-gray-700 ${getFontClass()}`}>{permission}</span>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                    <h4 className={`font-semibold mb-2 ${getFontClass()}`}>{t.roles.livePreview}</h4>
                    <div className="aspect-video bg-white rounded-lg shadow-inner flex items-center justify-center">
                      <div className="text-center">
                        <role.icon className={`w-16 h-16 ${role.color} mb-4 mx-auto`} />
                        <p className={`text-gray-600 ${getFontClass()}`}>{t.roles.interactive} {role.role} {t.roles.dashboard} Preview</p>
                        <Button variant="outline" size="sm" className={`mt-4 ${getFontClass()}`}>
                          <Play className="w-4 h-4 mr-2" />
                          {t.roles.viewDemo}
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
            <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${getFontClass()}`}>
              {t.workflow.title}
            </h2>
            <p className={`text-xl text-gray-600 ${getFontClass()}`}>
              {t.workflow.subtitle}
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
              {t.workflow.steps.map((step, index) => (
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
                      {index === 0 && <FileText className="w-10 h-10" />}
                      {index === 1 && <Brain className="w-10 h-10" />}
                      {index === 2 && <TrendingUp className="w-10 h-10" />}
                      {index === 3 && <Award className="w-10 h-10" />}
                    </div>
                    <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      progress >= (index + 1) * 25 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                  </div>
                  <h3 className={`text-lg font-semibold mb-2 ${getFontClass()}`}>{step.title}</h3>
                  <p className={`text-sm text-gray-600 ${getFontClass()}`}>{step.description}</p>
                </motion.div>
              ))}
            </div>

            <div className="flex justify-center mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
                className={getFontClass()}
              >
                {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isPlaying ? t.workflow.pauseAnimation : t.workflow.playAnimation}
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
            <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${getFontClass()}`}>
              {t.tech.title}
            </h2>
            <p className={`text-xl text-gray-600 ${getFontClass()}`}>
              {t.tech.subtitle}
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
              <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${getFontClass()}`}>
                {t.cta.title}
              </h2>
              <p className={`text-xl mb-8 opacity-90 ${getFontClass()}`}>
                {t.cta.subtitle}
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild className={getFontClass()}>
                  <Link href="/auth/login">
                    {t.cta.getStarted}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className={`bg-white/10 text-white border-white/30 hover:bg-white/20 ${getFontClass()}`}>
                  {t.cta.scheduleDemo}
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
                <h3 className={`text-2xl font-bold ${getFontClass()}`}>{t.demo.featureDemo}: {activeDemo}</h3>
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
                  <p className={`text-gray-600 ${getFontClass()}`}>{t.demo.interactiveDemoText}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className={getFontClass()}>{t.demo.realTimeInteraction}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className={getFontClass()}>{t.demo.instantFeedback}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className={getFontClass()}>{t.demo.progressTracking}</span>
                </div>
              </div>
              
              <div className="mt-6 flex gap-4">
                <Button className={`flex-1 ${getFontClass()}`}>
                  {t.demo.tryItNow}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button variant="outline" className={`flex-1 ${getFontClass()}`} onClick={() => setActiveDemo(null)}>
                  {t.demo.closeDemo}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}