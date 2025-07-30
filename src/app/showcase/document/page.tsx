'use client';

import { useState, useRef } from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import { LanguageTogglePill } from '@/components/LanguageToggle';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  FileDown, 
  Copy, 
  Check, 
  ArrowLeft,
  Printer,
  FileText,
  FlaskConical
} from 'lucide-react';
import Link from 'next/link';

const DocumentContent = {
  en: {
    nav: {
      backToShowcase: "Back to Showcase",
      features: "Features"
    },
    header: {
      title: "Virtual Lab LMS Platform",
      subtitle: "Comprehensive Documentation",
      description: "Transform Education with Interactive Science Labs"
    },
    actions: {
      download: "Download PDF",
      copyText: "Copy Text",
      print: "Print",
      copied: "Copied!"
    },
    sections: {
      overview: {
        title: "1. System Overview",
        content: `The Virtual Lab LMS is a comprehensive Learning Management System designed specifically for virtual science laboratories. It integrates curriculum planning, assessment tools, analytics, and multilingual support to create an engaging educational experience for students and teachers.

Key Highlights:
• Interactive Labs: Simulated lab experiences with timer and auto-save functionality
• Assessment Engine: Auto-scoring, manual override, and multi-phase tracking (baseline, midline, endline)
• Curriculum Builder: Drag-and-drop planning aligned with learning outcomes
• Analytics Dashboard: Role-based insights for students, teachers, and administrators
• User Roles: Students, Teachers, Mentors, and Admins with tiered permissions
• Localization: Full Khmer and English UI with Hanuman font and responsive layout`
      },
      features: {
        title: "2. Core Features",
        subsections: {
          learning: {
            title: "2.1 Learning Experience",
            content: `Interactive Virtual Labs
- Hands-on science experiments with real-time simulations
- Support for Physics, Chemistry, Biology, and Mathematics
- Auto-save functionality to prevent data loss
- Timer tracking for experiment duration

Multi-Subject Support
- Seamlessly integrated curriculum across STEM subjects
- Subject-specific assessment tools
- Cross-curricular project capabilities

Adaptive Assessments
- AI-powered testing that adapts to student performance
- Immediate feedback and explanations
- Performance analytics and recommendations

Exercise Library
- Comprehensive practice problems with instant feedback
- Difficulty levels aligned with student progress
- Hints and step-by-step solutions available`
          },
          teaching: {
            title: "2.2 Teaching Tools",
            content: `Curriculum Builder
- Drag-and-drop lesson planning interface
- Standards alignment tracking
- Resource attachment capabilities
- Collaborative planning features

Student Analytics
- Real-time insights into student progress and performance
- Individual and class-level analytics
- Customizable reporting dashboards
- Early warning system for struggling students

Assignment Management
- Create, distribute, and grade assignments efficiently
- Rubric-based grading system
- Peer review capabilities
- Automated reminder system

Communication Hub
- Integrated messaging system
- Announcement broadcasting
- Parent communication portal
- Discussion forums for collaborative learning`
          },
          assessment: {
            title: "2.3 Assessment & Tracking",
            content: `Multi-Phase Tracking
- Baseline assessments to establish starting knowledge
- Midline evaluations to track progress
- Endline assessments to measure growth
- Comparative analytics across phases

Auto-Scoring Engine
- Instant grading for objective questions
- Configurable scoring rubrics
- Manual override options for subjective assessments
- Partial credit capabilities

Progress Monitoring
- Visual progress tracking dashboards
- Individual learning paths
- Goal setting and achievement tracking
- Competency-based progression

Export & Reports
- Generate detailed reports in CSV, PDF formats
- Customizable report templates
- Scheduled report generation
- Data visualization tools`
          },
          platform: {
            title: "2.4 Platform Features",
            content: `Multi-Language Support
- Full Khmer and English interface
- Custom Hanuman font for optimal Khmer display
- Language-specific content management
- Translation management system

Role-Based Access Control
- Customized experiences for different user types
- Granular permission settings
- School-based access restrictions
- Subject-specific teacher assignments

Mobile Responsive Design
- Optimized for all devices and screen sizes
- Touch-friendly interfaces for tablets
- Offline capability for limited connectivity
- Progressive Web App features

Security Features
- Enterprise-grade authentication
- Session management with configurable timeouts
- Data encryption at rest and in transit
- Regular security audits and updates`
          }
        }
      },
      technical: {
        title: "3. Technical Architecture",
        content: `Technology Stack:
• Frontend: Next.js 15 (App Router), TypeScript, Tailwind CSS, Shadcn/ui components
• Backend: PostgreSQL database, Node.js API routes
• Authentication: Custom cookie-based session management
• Deployment: Vercel (Frontend), DigitalOcean (Database)
• Additional Libraries: React Hook Form, Zod validation, @hello-pangea/dnd for drag-and-drop

Database Schema:
• Integrated with existing TaRL assessment database
• Custom tables for LMS functionality
• Optimized indexes for performance
• Regular backup procedures

API Design:
• RESTful API endpoints
• Consistent error handling
• Rate limiting for security
• Comprehensive API documentation`
      },
      implementation: {
        title: "4. Implementation Guide",
        content: `System Requirements:
• Node.js 18+ for development
• PostgreSQL 13+ for database
• Modern web browser (Chrome, Firefox, Safari, Edge)
• Minimum 2GB RAM for server
• SSL certificate for production

Installation Steps:
1. Clone the repository
2. Install dependencies: npm install
3. Configure environment variables
4. Run database migrations
5. Start development server: npm run dev

Configuration:
• Database connection settings
• Session management parameters
• Email service configuration
• Storage settings for file uploads

Deployment:
• Production build: npm run build
• Environment-specific configurations
• CDN setup for static assets
• Monitoring and logging setup`
      },
      usage: {
        title: "5. User Guidelines",
        subsections: {
          students: {
            title: "5.1 For Students",
            content: `Getting Started:
- Login with provided credentials
- Complete profile setup
- Take baseline assessment
- Explore available courses

Using Virtual Labs:
- Select experiment from catalog
- Follow safety guidelines
- Record observations
- Submit lab reports

Tracking Progress:
- View dashboard for overview
- Check grades and feedback
- Set learning goals
- Track achievement badges`
          },
          teachers: {
            title: "5.2 For Teachers",
            content: `Classroom Management:
- Create and manage classes
- Enroll students
- Set up course schedules
- Configure grading policies

Creating Assignments:
- Use template library
- Set due dates and reminders
- Attach resources
- Configure auto-grading

Monitoring Students:
- Real-time activity tracking
- Performance analytics
- Intervention alerts
- Parent communication`
          },
          admins: {
            title: "5.3 For Administrators",
            content: `System Administration:
- User account management
- Role and permission setup
- School configuration
- System-wide settings

Data Management:
- Import/export user data
- Backup procedures
- Archive old data
- Generate reports

Monitoring:
- System health checks
- Usage analytics
- Security logs
- Performance metrics`
          }
        }
      },
      support: {
        title: "6. Support & Maintenance",
        content: `Technical Support:
• Email: support@virtuallab.edu
• Documentation: docs.virtuallab.edu
• Video tutorials available
• Community forum for peer support

Maintenance Schedule:
• Weekly security updates
• Monthly feature releases
• Quarterly major updates
• Annual system review

Training Resources:
• Onboarding workshops
• Webinar series
• Self-paced courses
• Certification programs`
      }
    }
  },
  km: {
    nav: {
      backToShowcase: "ត្រឡប់ទៅការបង្ហាញ",
      features: "មុខងារ"
    },
    header: {
      title: "វេទិកា Virtual Lab LMS",
      subtitle: "ឯកសារពេញលេញ",
      description: "ផ្លាស់ប្តូរការអប់រំជាមួយមន្ទីរពិសោធន៍វិទ្យាសាស្ត្រអន្តរកម្ម"
    },
    actions: {
      download: "ទាញយក PDF",
      copyText: "ចម្លងអត្ថបទ",
      print: "បោះពុម្ព",
      copied: "បានចម្លង!"
    },
    sections: {
      overview: {
        title: "១. ទិដ្ឋភាពទូទៅនៃប្រព័ន្ធ",
        content: `Virtual Lab LMS គឺជាប្រព័ន្ធគ្រប់គ្រងការសិក្សាដ៏ទូលំទូលាយដែលបានរចនាជាពិសេសសម្រាប់មន្ទីរពិសោធន៍វិទ្យាសាស្ត្រនិម្មិត។ វារួមបញ្ចូលការរៀបចំកម្មវិធីសិក្សា ឧបករណ៍វាយតម្លៃ ការវិភាគ និងការគាំទ្រពហុភាសា ដើម្បីបង្កើតបទពិសោធន៍អប់រំដែលទាក់ទាញសម្រាប់សិស្ស និងគ្រូ។

ចំណុចសំខាន់ៗ៖
• មន្ទីរពិសោធន៍អន្តរកម្ម៖ បទពិសោធន៍មន្ទីរពិសោធន៍ក្លែងធ្វើជាមួយនឹងកម្មវិធីកំណត់ពេលវេលា និងរក្សាទុកស្វ័យប្រវត្តិ
• ម៉ាស៊ីនវាយតម្លៃ៖ ការដាក់ពិន្ទុស្វ័យប្រវត្តិ ការបដិសេធដោយដៃ និងការតាមដានពហុដំណាក់កាល (មូលដ្ឋាន កណ្តាល ចុងក្រោយ)
• អ្នកបង្កើតកម្មវិធីសិក្សា៖ ការរៀបចំអូស-ទម្លាក់ស្របតាមលទ្ធផលសិក្សា
• ផ្ទាំងគ្រប់គ្រងការវិភាគ៖ ការយល់ដឹងផ្អែកលើតួនាទីសម្រាប់សិស្ស គ្រូ និងអ្នកគ្រប់គ្រង
• តួនាទីអ្នកប្រើ៖ សិស្ស គ្រូ អ្នកណែនាំ និងអ្នកគ្រប់គ្រងជាមួយការអនុញ្ញាតតាមកម្រិត
• ការធ្វើមូលដ្ឋានីយកម្ម៖ ចំណុចប្រទាក់ភាសាខ្មែរ និងអង់គ្លេសពេញលេញជាមួយពុម្ពអក្សរហនុមាន និងប្លង់ឆ្លើយតប`
      },
      features: {
        title: "២. មុខងារស្នូល",
        subsections: {
          learning: {
            title: "២.១ បទពិសោធន៍សិក្សា",
            content: `មន្ទីរពិសោធន៍និម្មិតអន្តរកម្ម
- ការពិសោធន៍វិទ្យាសាស្ត្រដោយផ្ទាល់ជាមួយការក្លែងធ្វើពេលជាក់ស្តែង
- គាំទ្ររូបវិទ្យា គីមីវិទ្យា ជីវវិទ្យា និងគណិតវិទ្យា
- មុខងាររក្សាទុកស្វ័យប្រវត្តិដើម្បីការពារការបាត់បង់ទិន្នន័យ
- ការតាមដានកម្មវិធីកំណត់ពេលវេលាសម្រាប់រយៈពេលពិសោធន៍

ការគាំទ្រមុខវិជ្ជាច្រើន
- កម្មវិធីសិក្សារួមបញ្ចូលគ្នាយ៉ាងរលូននៅទូទាំងមុខវិជ្ជា STEM
- ឧបករណ៍វាយតម្លៃជាក់លាក់តាមមុខវិជ្ជា
- សមត្ថភាពគម្រោងឆ្លងកម្មវិធីសិក្សា

ការវាយតម្លៃប្រែប្រួល
- ការធ្វើតេស្តដែលដំណើរការដោយ AI ដែលសម្របតាមការអនុវត្តរបស់សិស្ស
- មតិកែលម្អ និងការពន្យល់ភ្លាមៗ
- ការវិភាគការអនុវត្ត និងការណែនាំ

បណ្ណាល័យលំហាត់
- បញ្ហាអនុវត្តដ៏ទូលំទូលាយជាមួយមតិកែលម្អភ្លាមៗ
- កម្រិតលំបាកស្របតាមវឌ្ឍនភាពសិស្ស
- ការណែនាំ និងដំណោះស្រាយជាជំហានៗដែលអាចប្រើបាន`
          },
          teaching: {
            title: "២.២ ឧបករណ៍បង្រៀន",
            content: `អ្នកបង្កើតកម្មវិធីសិក្សា
- ចំណុចប្រទាក់រៀបចំមេរៀនអូស-ទម្លាក់
- ការតាមដានការតម្រឹមស្តង់ដារ
- សមត្ថភាពភ្ជាប់ធនធាន
- មុខងារផែនការសហការ

ការវិភាគសិស្ស
- ការយល់ដឹងពេលជាក់ស្តែងអំពីវឌ្ឍនភាព និងការអនុវត្តរបស់សិស្ស
- ការវិភាគកម្រិតបុគ្គល និងថ្នាក់
- ផ្ទាំងគ្រប់គ្រងរបាយការណ៍ដែលអាចប្តូរតាមបំណងបាន
- ប្រព័ន្ធព្រមានដំបូងសម្រាប់សិស្សដែលមានបញ្ហា

ការគ្រប់គ្រងកិច្ចការ
- បង្កើត ចែកចាយ និងដាក់ពិន្ទុកិច្ចការប្រកបដោយប្រសិទ្ធភាព
- ប្រព័ន្ធដាក់ពិន្ទុផ្អែកលើរូប្រ៊ីក
- សមត្ថភាពពិនិត្យមិត្តភ័ក្តិ
- ប្រព័ន្ធរំលឹកស្វ័យប្រវត្តិ

មជ្ឈមណ្ឌលទំនាក់ទំនង
- ប្រព័ន្ធផ្ញើសាររួមបញ្ចូល
- ការផ្សាយប្រកាស
- វិបផតថលទំនាក់ទំនងឪពុកម្តាយ
- វេទិកាពិភាក្សាសម្រាប់ការរៀនសហការ`
          },
          assessment: {
            title: "២.៣ ការវាយតម្លៃ និងការតាមដាន",
            content: `ការតាមដានពហុដំណាក់កាល
- ការវាយតម្លៃមូលដ្ឋានដើម្បីបង្កើតចំណេះដឹងចាប់ផ្តើម
- ការវាយតម្លៃកណ្តាលដើម្បីតាមដានវឌ្ឍនភាព
- ការវាយតម្លៃចុងក្រោយដើម្បីវាស់វែងកំណើន
- ការវិភាគប្រៀបធៀបនៅទូទាំងដំណាក់កាល

ម៉ាស៊ីនដាក់ពិន្ទុស្វ័យប្រវត្តិ
- ការដាក់ពិន្ទុភ្លាមៗសម្រាប់សំណួរគោលដៅ
- រូប្រ៊ីកដាក់ពិន្ទុដែលអាចកំណត់រចនាសម្ព័ន្ធបាន
- ជម្រើសបដិសេធដោយដៃសម្រាប់ការវាយតម្លៃប្រធានបទ
- សមត្ថភាពឥណទានផ្នែក

ការត្រួតពិនិត្យវឌ្ឍនភាព
- ផ្ទាំងគ្រប់គ្រងតាមដានវឌ្ឍនភាពដែលមើលឃើញ
- ផ្លូវសិក្សាបុគ្គល
- ការកំណត់គោលដៅ និងការតាមដានសមិទ្ធផល
- វឌ្ឍនភាពផ្អែកលើសមត្ថភាព

នាំចេញ និងរបាយការណ៍
- បង្កើតរបាយការណ៍លម្អិតក្នុងទម្រង់ CSV, PDF
- ពុម្ពរបាយការណ៍ដែលអាចប្តូរតាមបំណងបាន
- ការបង្កើតរបាយការណ៍ដែលបានកំណត់ពេល
- ឧបករណ៍កំណត់រូបភាពទិន្នន័យ`
          },
          platform: {
            title: "២.៤ មុខងារវេទិកា",
            content: `ការគាំទ្រពហុភាសា
- ចំណុចប្រទាក់ភាសាខ្មែរ និងអង់គ្លេសពេញលេញ
- ពុម្ពអក្សរហនុមានផ្ទាល់ខ្លួនសម្រាប់ការបង្ហាញភាសាខ្មែរល្អបំផុត
- ការគ្រប់គ្រងមាតិកាជាក់លាក់តាមភាសា
- ប្រព័ន្ធគ្រប់គ្រងការបកប្រែ

ការគ្រប់គ្រងការចូលប្រើផ្អែកលើតួនាទី
- បទពិសោធន៍ប្តូរតាមបំណងសម្រាប់ប្រភេទអ្នកប្រើផ្សេងៗ
- ការកំណត់ការអនុញ្ញាតលម្អិត
- ការដាក់កម្រិតការចូលប្រើផ្អែកលើសាលា
- ការចាត់តាំងគ្រូជាក់លាក់តាមមុខវិជ្ជា

ការរចនាឆ្លើយតបទូរស័ព្ទ
- បានបង្កើនប្រសិទ្ធភាពសម្រាប់ឧបករណ៍ និងទំហំអេក្រង់ទាំងអស់
- ចំណុចប្រទាក់មិត្តភាពប៉ះសម្រាប់ថេប្លេត
- សមត្ថភាពក្រៅបណ្តាញសម្រាប់ការតភ្ជាប់មានកម្រិត
- មុខងារកម្មវិធីបណ្តាញវឌ្ឍនភាព

មុខងារសុវត្ថិភាព
- ការផ្ទៀងផ្ទាត់កម្រិតសហគ្រាស
- ការគ្រប់គ្រងសម័យជាមួយការអស់សុពលភាពដែលអាចកំណត់រចនាសម្ព័ន្ធបាន
- ការអ៊ិនគ្រីបទិន្នន័យនៅពេលសម្រាក និងក្នុងការដឹកជញ្ជូន
- ការត្រួតពិនិត្យ និងការធ្វើបច្ចុប្បន្នភាពសុវត្ថិភាពទៀងទាត់`
          }
        }
      },
      technical: {
        title: "៣. ស្ថាបត្យកម្មបច្ចេកទេស",
        content: `ជង់បច្ចេកវិទ្យា៖
• ផ្នែកខាងមុខ៖ Next.js 15 (App Router), TypeScript, Tailwind CSS, សមាសធាតុ Shadcn/ui
• ផ្នែកខាងក្រោយ៖ មូលដ្ឋានទិន្នន័យ PostgreSQL, ផ្លូវ API Node.js
• ការផ្ទៀងផ្ទាត់៖ ការគ្រប់គ្រងសម័យផ្អែកលើខូគីផ្ទាល់ខ្លួន
• ការដាក់ឱ្យប្រើ៖ Vercel (ផ្នែកខាងមុខ), DigitalOcean (មូលដ្ឋានទិន្នន័យ)
• បណ្ណាល័យបន្ថែម៖ React Hook Form, ការផ្ទៀងផ្ទាត់ Zod, @hello-pangea/dnd សម្រាប់អូស-ទម្លាក់

គ្រោងមូលដ្ឋានទិន្នន័យ៖
• រួមបញ្ចូលជាមួយមូលដ្ឋានទិន្នន័យវាយតម្លៃ TaRL ដែលមានស្រាប់
• តារាងផ្ទាល់ខ្លួនសម្រាប់មុខងារ LMS
• លិបិក្រមបានបង្កើនប្រសិទ្ធភាពសម្រាប់ការអនុវត្ត
• នីតិវិធីបម្រុងទុកទៀងទាត់

ការរចនា API៖
• ចំណុចបញ្ចប់ API RESTful
• ការដោះស្រាយកំហុសស្ថិតភាព
• ការដាក់កម្រិតអត្រាសម្រាប់សុវត្ថិភាព
• ឯកសារ API ដ៏ទូលំទូលាយ`
      },
      implementation: {
        title: "៤. មគ្គុទ្ទេសក៍អនុវត្ត",
        content: `តម្រូវការប្រព័ន្ធ៖
• Node.js 18+ សម្រាប់ការអភិវឌ្ឍ
• PostgreSQL 13+ សម្រាប់មូលដ្ឋានទិន្នន័យ
• កម្មវិធីរុករកបណ្តាញទំនើប (Chrome, Firefox, Safari, Edge)
• អប្បបរមា 2GB RAM សម្រាប់ម៉ាស៊ីនមេ
• វិញ្ញាបនបត្រ SSL សម្រាប់ផលិតកម្ម

ជំហានដំឡើង៖
១. ក្លូនឃ្លាំង
២. ដំឡើងភាពអាស្រ័យ៖ npm install
៣. កំណត់រចនាសម្ព័ន្ធអថេរបរិស្ថាន
៤. ដំណើរការការប្តូរមូលដ្ឋានទិន្នន័យ
៥. ចាប់ផ្តើមម៉ាស៊ីនមេអភិវឌ្ឍន៍៖ npm run dev

ការកំណត់រចនាសម្ព័ន្ធ៖
• ការកំណត់ការតភ្ជាប់មូលដ្ឋានទិន្នន័យ
• ប៉ារ៉ាម៉ែត្រការគ្រប់គ្រងសម័យ
• ការកំណត់រចនាសម្ព័ន្ធសេវាអ៊ីមែល
• ការកំណត់ការផ្ទុកសម្រាប់ការផ្ទុកឯកសារឡើង

ការដាក់ឱ្យប្រើ៖
• ការសាងសង់ផលិតកម្ម៖ npm run build
• ការកំណត់រចនាសម្ព័ន្ធជាក់លាក់តាមបរិស្ថាន
• ការរៀបចំ CDN សម្រាប់ទ្រព្យសម្បត្តិឋិតិវន្ត
• ការរៀបចំការត្រួតពិនិត្យ និងកំណត់ហេតុ`
      },
      usage: {
        title: "៥. គោលការណ៍ណែនាំអ្នកប្រើ",
        subsections: {
          students: {
            title: "៥.១ សម្រាប់សិស្ស",
            content: `ការចាប់ផ្តើម៖
- ចូលជាមួយលិខិតសម្គាល់ដែលបានផ្តល់
- បំពេញការរៀបចំប្រវត្តិរូប
- ធ្វើការវាយតម្លៃមូលដ្ឋាន
- រុករកវគ្គសិក្សាដែលមាន

ការប្រើមន្ទីរពិសោធន៍និម្មិត៖
- ជ្រើសរើសការពិសោធន៍ពីកាតាឡុក
- អនុវត្តតាមគោលការណ៍ណែនាំសុវត្ថិភាព
- កត់ត្រាការសង្កេត
- ដាក់ស្នើរបាយការណ៍មន្ទីរពិសោធន៍

ការតាមដានវឌ្ឍនភាព៖
- មើលផ្ទាំងគ្រប់គ្រងសម្រាប់ទិដ្ឋភាពទូទៅ
- ពិនិត្យពិន្ទុ និងមតិកែលម្អ
- កំណត់គោលដៅសិក្សា
- តាមដានផ្លាកសញ្ញាសមិទ្ធផល`
          },
          teachers: {
            title: "៥.២ សម្រាប់គ្រូ",
            content: `ការគ្រប់គ្រងថ្នាក់រៀន៖
- បង្កើត និងគ្រប់គ្រងថ្នាក់
- ចុះឈ្មោះសិស្ស
- រៀបចំកាលវិភាគវគ្គសិក្សា
- កំណត់រចនាសម្ព័ន្ធគោលការណ៍ដាក់ពិន្ទុ

ការបង្កើតកិច្ចការ៖
- ប្រើបណ្ណាល័យគំរូ
- កំណត់កាលបរិច្ឆេទផុតកំណត់ និងការរំលឹក
- ភ្ជាប់ធនធាន
- កំណត់រចនាសម្ព័ន្ធការដាក់ពិន្ទុស្វ័យប្រវត្តិ

ការត្រួតពិនិត្យសិស្ស៖
- ការតាមដានសកម្មភាពពេលជាក់ស្តែង
- ការវិភាគការអនុវត្ត
- ការជូនដំណឹងអន្តរាគមន៍
- ការទំនាក់ទំនងឪពុកម្តាយ`
          },
          admins: {
            title: "៥.៣ សម្រាប់អ្នកគ្រប់គ្រង",
            content: `ការគ្រប់គ្រងប្រព័ន្ធ៖
- ការគ្រប់គ្រងគណនីអ្នកប្រើ
- ការរៀបចំតួនាទី និងការអនុញ្ញាត
- ការកំណត់រចនាសម្ព័ន្ធសាលា
- ការកំណត់ទូទាំងប្រព័ន្ធ

ការគ្រប់គ្រងទិន្នន័យ៖
- នាំចូល/នាំចេញទិន្នន័យអ្នកប្រើ
- នីតិវិធីបម្រុងទុក
- ទិន្នន័យបណ្ណសារចាស់
- បង្កើតរបាយការណ៍

ការត្រួតពិនិត្យ៖
- ការពិនិត្យសុខភាពប្រព័ន្ធ
- ការវិភាគការប្រើប្រាស់
- កំណត់ហេតុសុវត្ថិភាព
- រង្វាស់ការអនុវត្ត`
          }
        }
      },
      support: {
        title: "៦. ការគាំទ្រ និងការថែទាំ",
        content: `ការគាំទ្របច្ចេកទេស៖
• អ៊ីមែល៖ support@virtuallab.edu
• ឯកសារ៖ docs.virtuallab.edu
• មានមេរៀនវីដេអូ
• វេទិកាសហគមន៍សម្រាប់ការគាំទ្រមិត្តភ័ក្តិ

កាលវិភាគថែទាំ៖
• ការធ្វើបច្ចុប្បន្នភាពសុវត្ថិភាពប្រចាំសប្តាហ៍
• ការចេញផ្សាយមុខងារប្រចាំខែ
• ការធ្វើបច្ចុប្បន្នភាពសំខាន់ប្រចាំត្រីមាស
• ការពិនិត្យប្រព័ន្ធប្រចាំឆ្នាំ

ធនធានបណ្តុះបណ្តាល៖
• សិក្ខាសាលាណែនាំ
• ស៊េរីវេប៊ីណា
• វគ្គសិក្សាដោយខ្លួនឯង
• កម្មវិធីវិញ្ញាបនបត្រ`
      }
    }
  }
};

export default function DocumentPage() {
  const [copied, setCopied] = useState(false);
  const { language, getFontClass } = useLanguage();
  const contentRef = useRef<HTMLDivElement>(null);
  const content = DocumentContent[language as keyof typeof DocumentContent];

  const handleCopyText = async () => {
    if (contentRef.current) {
      const text = contentRef.current.innerText;
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy text:', err);
      }
    }
  };

  const handleDownloadPDF = () => {
    // In a real implementation, this would generate a PDF
    // For now, we'll create a text file
    if (contentRef.current) {
      const text = contentRef.current.innerText;
      const blob = new Blob([text], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `virtual-lab-documentation-${language}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b print:hidden">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2">
                <FlaskConical className="h-8 w-8 text-blue-600" />
                <span className={`text-xl font-bold ${getFontClass()}`}>Virtual Lab</span>
              </Link>
              <Link href="/showcase">
                <Button variant="ghost" className={`flex items-center gap-2 ${getFontClass()}`}>
                  <ArrowLeft className="w-4 h-4" />
                  {content.nav.backToShowcase}
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <LanguageTogglePill />
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyText}
                  title={content.actions.copyText}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrint}
                  title={content.actions.print}
                >
                  <Printer className="w-4 h-4" />
                </Button>
                <Button
                  onClick={handleDownloadPDF}
                  className={`flex items-center gap-2 ${getFontClass()}`}
                >
                  <FileDown className="w-4 h-4" />
                  {content.actions.download}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Document Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div ref={contentRef} className="prose prose-lg max-w-none print:prose-sm">
          {/* Header */}
          <div className="text-center mb-12 print:mb-6">
            <h1 className={`text-4xl font-bold mb-2 print:text-2xl ${getFontClass()}`}>
              {content.header.title}
            </h1>
            <p className={`text-xl text-gray-600 print:text-base ${getFontClass()}`}>
              {content.header.subtitle}
            </p>
            <p className={`text-lg text-gray-500 print:text-sm ${getFontClass()}`}>
              {content.header.description}
            </p>
          </div>

          {/* Table of Contents */}
          <Card className="mb-8 p-6 print:border print:shadow-none">
            <h2 className={`text-2xl font-bold mb-4 ${getFontClass()}`}>
              {language === 'en' ? 'Table of Contents' : 'មាតិកា'}
            </h2>
            <ul className={`space-y-2 ${getFontClass()}`}>
              <li>
                <a href="#overview" className="text-blue-600 hover:underline">
                  {content.sections.overview.title}
                </a>
              </li>
              <li>
                <a href="#features" className="text-blue-600 hover:underline">
                  {content.sections.features.title}
                </a>
                <ul className="ml-6 mt-2 space-y-1">
                  <li>
                    <a href="#learning" className="text-blue-600 hover:underline text-sm">
                      {content.sections.features.subsections.learning.title}
                    </a>
                  </li>
                  <li>
                    <a href="#teaching" className="text-blue-600 hover:underline text-sm">
                      {content.sections.features.subsections.teaching.title}
                    </a>
                  </li>
                  <li>
                    <a href="#assessment" className="text-blue-600 hover:underline text-sm">
                      {content.sections.features.subsections.assessment.title}
                    </a>
                  </li>
                  <li>
                    <a href="#platform" className="text-blue-600 hover:underline text-sm">
                      {content.sections.features.subsections.platform.title}
                    </a>
                  </li>
                </ul>
              </li>
              <li>
                <a href="#technical" className="text-blue-600 hover:underline">
                  {content.sections.technical.title}
                </a>
              </li>
              <li>
                <a href="#implementation" className="text-blue-600 hover:underline">
                  {content.sections.implementation.title}
                </a>
              </li>
              <li>
                <a href="#usage" className="text-blue-600 hover:underline">
                  {content.sections.usage.title}
                </a>
              </li>
              <li>
                <a href="#support" className="text-blue-600 hover:underline">
                  {content.sections.support.title}
                </a>
              </li>
            </ul>
          </Card>

          {/* Sections */}
          <div className="space-y-12 print:space-y-6">
            {/* Overview */}
            <section id="overview">
              <h2 className={`text-3xl font-bold mb-4 print:text-xl ${getFontClass()}`}>
                {content.sections.overview.title}
              </h2>
              <div className={`whitespace-pre-line text-gray-700 ${getFontClass()}`}>
                {content.sections.overview.content}
              </div>
            </section>

            {/* Features */}
            <section id="features">
              <h2 className={`text-3xl font-bold mb-4 print:text-xl ${getFontClass()}`}>
                {content.sections.features.title}
              </h2>
              
              <div className="space-y-8 print:space-y-4">
                <div id="learning">
                  <h3 className={`text-2xl font-semibold mb-3 print:text-lg ${getFontClass()}`}>
                    {content.sections.features.subsections.learning.title}
                  </h3>
                  <div className={`whitespace-pre-line text-gray-700 ${getFontClass()}`}>
                    {content.sections.features.subsections.learning.content}
                  </div>
                </div>

                <div id="teaching">
                  <h3 className={`text-2xl font-semibold mb-3 print:text-lg ${getFontClass()}`}>
                    {content.sections.features.subsections.teaching.title}
                  </h3>
                  <div className={`whitespace-pre-line text-gray-700 ${getFontClass()}`}>
                    {content.sections.features.subsections.teaching.content}
                  </div>
                </div>

                <div id="assessment">
                  <h3 className={`text-2xl font-semibold mb-3 print:text-lg ${getFontClass()}`}>
                    {content.sections.features.subsections.assessment.title}
                  </h3>
                  <div className={`whitespace-pre-line text-gray-700 ${getFontClass()}`}>
                    {content.sections.features.subsections.assessment.content}
                  </div>
                </div>

                <div id="platform">
                  <h3 className={`text-2xl font-semibold mb-3 print:text-lg ${getFontClass()}`}>
                    {content.sections.features.subsections.platform.title}
                  </h3>
                  <div className={`whitespace-pre-line text-gray-700 ${getFontClass()}`}>
                    {content.sections.features.subsections.platform.content}
                  </div>
                </div>
              </div>
            </section>

            {/* Technical Architecture */}
            <section id="technical">
              <h2 className={`text-3xl font-bold mb-4 print:text-xl ${getFontClass()}`}>
                {content.sections.technical.title}
              </h2>
              <div className={`whitespace-pre-line text-gray-700 ${getFontClass()}`}>
                {content.sections.technical.content}
              </div>
            </section>

            {/* Implementation Guide */}
            <section id="implementation">
              <h2 className={`text-3xl font-bold mb-4 print:text-xl ${getFontClass()}`}>
                {content.sections.implementation.title}
              </h2>
              <div className={`whitespace-pre-line text-gray-700 ${getFontClass()}`}>
                {content.sections.implementation.content}
              </div>
            </section>

            {/* User Guidelines */}
            <section id="usage">
              <h2 className={`text-3xl font-bold mb-4 print:text-xl ${getFontClass()}`}>
                {content.sections.usage.title}
              </h2>
              
              <div className="space-y-6 print:space-y-3">
                <div>
                  <h3 className={`text-2xl font-semibold mb-3 print:text-lg ${getFontClass()}`}>
                    {content.sections.usage.subsections.students.title}
                  </h3>
                  <div className={`whitespace-pre-line text-gray-700 ${getFontClass()}`}>
                    {content.sections.usage.subsections.students.content}
                  </div>
                </div>

                <div>
                  <h3 className={`text-2xl font-semibold mb-3 print:text-lg ${getFontClass()}`}>
                    {content.sections.usage.subsections.teachers.title}
                  </h3>
                  <div className={`whitespace-pre-line text-gray-700 ${getFontClass()}`}>
                    {content.sections.usage.subsections.teachers.content}
                  </div>
                </div>

                <div>
                  <h3 className={`text-2xl font-semibold mb-3 print:text-lg ${getFontClass()}`}>
                    {content.sections.usage.subsections.admins.title}
                  </h3>
                  <div className={`whitespace-pre-line text-gray-700 ${getFontClass()}`}>
                    {content.sections.usage.subsections.admins.content}
                  </div>
                </div>
              </div>
            </section>

            {/* Support & Maintenance */}
            <section id="support">
              <h2 className={`text-3xl font-bold mb-4 print:text-xl ${getFontClass()}`}>
                {content.sections.support.title}
              </h2>
              <div className={`whitespace-pre-line text-gray-700 ${getFontClass()}`}>
                {content.sections.support.content}
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t text-center text-gray-500 print:hidden">
            <p className={getFontClass()}>
              © 2024 Virtual Lab LMS. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Floating Actions (visible on scroll) */}
      {copied && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg print:hidden">
          <span className={`flex items-center gap-2 ${getFontClass()}`}>
            <Check className="w-4 h-4" />
            {content.actions.copied}
          </span>
        </div>
      )}

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            font-size: 12pt;
          }
          .prose {
            max-width: 100%;
          }
          .print\\:hidden {
            display: none !important;
          }
          a {
            color: black !important;
            text-decoration: none !important;
          }
          .page-break {
            page-break-after: always;
          }
        }
      `}</style>
    </div>
  );
}