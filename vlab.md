Virtual Lab LMS – Core Summary
A Learning Management System designed for virtual science labs with integrated curriculum planning, assessment tools, analytics, and multilingual support.

🎯 System Highlights
Interactive Labs: Simulated lab experiences with timer and auto-save.

Assessment Engine: Auto-scoring, manual override, and multi-phase tracking (baseline, midline, endline).

Curriculum Builder: Drag-and-drop planning aligned with learning outcomes.

Analytics Dashboard: Role-based insights for students, teachers, and administrators.

User Roles: Students, Teachers, Mentors, and Admins with tiered permissions.

Localization: Khmer + English UI with Hanuman font and responsive layout.

🛠 Tech Stack
Frontend:

Next.js 15 (App Router)

Shadcn/ui + Tailwind CSS

React Hook Form + Zod

Drag & Drop via @hello-pangea/dnd

Backend:

PostgreSQL (via pg)

Cookie-based authentication

API routes via Next.js

Deployment:

Vercel (Frontend)

DigitalOcean (Database)

🧪 Key Functionalities
Assessment Forms: Khmer/Math subjects, with structured validation and teacher notes.

Student Selection: Drag-and-drop interface by level and grade.

Reports & Exports: CSV export, filters, search, and visual statistics.

🔒 Security Features
Secure sessions with cookies

Middleware route protection

Role-based access control

SQL injection prevention

👥 Role Capabilities
Teachers: Input data, manage their school only

Mentors: View assigned clusters, monitor schools, export reports

Admins: Full access and user management

📱 UX & Mobile Support
Mobile-optimized forms and drag interfaces

Responsive layout and adaptive tables

🌍 Language Support
Fully bilingual (Khmer + English)

Font and layout adapted for Khmer

🗂 Project Structure Highlights
css
Copy
Edit
src/
├── app/ (routes, dashboard, auth)
├── components/
├── lib/ (auth, db)
└── middleware.ts
⚙️ Development & Deployment
Local Setup:

Node.js 18+, PostgreSQL, Git

npm install, npm run dev

Production:

PostgreSQL on cloud (e.g., DigitalOcean)

Vercel deployment with .env configuration

📊 Database Overview
Includes standard student/teacher/school tables, with additions:

districts, clusters, tarl_assessments, tarl_student_selection

Session and permission tables for secure access

🧪 Evaluation Flow (Abstract)
Baseline → All students assessed

Selection → Subset chosen for intervention

Midline/Endline → Progress tracking

Export → CSV + real-time analytics

🚀 Usage Notes
Realistic data includes Cambodian schools, provinces, and names (fictionalized for demo).

Assessment data and selections generated for testing purposes only.

📄 License & Contributions
Intended for educational use under Cambodia’s TaRL initiative.

Open to contributions via pull requests.

⚠️ Disclaimer
This is a demo system. Do not use in production without implementing:

Secure password hashing

Hardened authentication

Full testing coverage

