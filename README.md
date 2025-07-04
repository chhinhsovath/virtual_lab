# TaRL Assessment System

A comprehensive full-stack application for Teaching at the Right Level (TaRL) assessment data management, built with Next.js 15, App Router, and PostgreSQL.

## 🎯 Overview

This system is designed for managing TaRL assessments across schools in Battambang and Kampong Cham provinces, supporting 60-65 teachers across 30-32 schools.

### Key Features

- **Multi-language Support**: English and Khmer with Hanuman font
- **Assessment Management**: Baseline, Midline, and Endline assessments
- **Student Selection**: Drag-and-drop interface for TaRL program selection
- **Results & Reports**: Filtering and CSV export functionality
- **Role-based Access**: Teacher, Cluster Mentor, and Admin roles
- **Mobile Responsive**: Works on all device sizes

## 🛠 Technology Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **UI Components**: Shadcn/ui + Tailwind CSS
- **Forms**: React Hook Form with Zod validation
- **Drag & Drop**: @hello-pangea/dnd
- **Notifications**: Sonner

### Backend
- **Database**: PostgreSQL with raw SQL queries
- **Connection**: pg library with connection pooling
- **Authentication**: Cookie-based sessions
- **API**: Next.js API routes

### Deployment
- **Platform**: Vercel
- **Database**: PostgreSQL on Digital Ocean

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tarl_indir
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your database credentials:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/tarl_db
   SESSION_SECRET=your-super-secret-session-key
   NEXTAUTH_URL=http://localhost:3000
   NODE_ENV=development
   ```

4. **Set up the database**
   
   Run the migration script to create the required tables:
   ```bash
   psql -d your_database_name -f migrations/001_create_tables.sql
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📊 Database Schema

The system extends existing tables and adds new ones:

### Existing Tables (Required)
- `tbl_child` - Student information
- `tbl_school_list` - School details
- `tbl_teacher_information` - Teacher profiles
- `tbl_province` - Province data
- `tbl_child_information` - Student details

### New Tables (Created by Migration)
- `districts` - Administrative districts
- `clusters` - School clusters for mentorship
- `tarl_assessments` - Assessment records
- `tarl_student_selection` - Students selected for TaRL program
- `user_sessions` - Session management
- `user_permissions` - Role-based permissions

## 👥 User Roles & Permissions

### Teacher
- Access to own school only
- Create, read, update assessments
- Select students for TaRL program
- Single subject assignment

### Cluster Mentor
- Read access to cluster schools
- View dashboard for assigned schools
- Export reports for cluster

### Admin
- Full system access
- Manage all users and permissions
- System-wide reporting

## 🎨 Key Features

### Assessment Entry
- Form validation with Zod schemas
- Support for Khmer and Math subjects
- Baseline, Midline, Endline cycles
- Notes and additional information

### Student Selection
- Drag-and-drop interface
- Filter by grade and baseline level
- Visual feedback during selection
- Bulk selection save

### Results & Reports
- Advanced filtering options
- Search functionality
- CSV export with customizable columns
- Real-time statistics

### Authentication
- Cookie-based sessions
- Route protection middleware
- Role-based access control
- Secure session management

## 🌍 Internationalization

The application supports both English and Khmer:

- **Fonts**: Hanuman font for Khmer text
- **Labels**: Dual language labels throughout
- **UI**: Responsive design for both languages

## 📱 Mobile Responsiveness

- Responsive navigation with mobile menu
- Touch-friendly drag-and-drop
- Optimized forms for mobile input
- Adaptive table layouts

## 🔧 Development

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Protected dashboard
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   └── ui/               # Shadcn/ui components
├── lib/                   # Utilities
│   ├── auth.ts           # Authentication logic
│   └── db.ts             # Database connection
└── middleware.ts          # Route protection
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🚀 Deployment

### Vercel Deployment

1. **Connect to Vercel**
   - Connect your GitHub repository to Vercel
   - Import the project

2. **Configure Environment Variables**
   ```
   DATABASE_URL=your_production_database_url
   SESSION_SECRET=your_production_session_secret
   NEXTAUTH_URL=https://your-app.vercel.app
   NODE_ENV=production
   ```

3. **Deploy**
   - Vercel will automatically deploy on every push to main branch

### Database Setup (Production)

1. Set up PostgreSQL on Digital Ocean or preferred provider
2. Run the migration script on production database
3. Ensure connection pooling is configured
4. Update DATABASE_URL environment variable

## 📋 Usage

### Demo User Accounts

#### Administrator
- **Username**: `admin` / **Password**: `admin`
- **Access**: Full system access across all provinces and schools

#### Cluster Mentors
- **Username**: `mentor1` / **Password**: `mentor1`
  - **Province**: Battambang
  - **Schools**: Wat Kandal, Phum Thmey, Boeng Pring, Kampong Svay

- **Username**: `mentor2` / **Password**: `mentor2`
  - **Province**: Kampong Cham
  - **Schools**: Prey Veng, Chrey Thom, Toul Preah, Samrong

#### Teachers (8 total)
**Battambang Province:**
- `1001` / `1001` - Sok Pisey (Khmer) - Wat Kandal Primary School
- `1002` / `1002` - Chan Dara (Math) - Phum Thmey Primary School
- `1003` / `1003` - Meas Sophea (Khmer) - Boeng Pring Primary School
- `1004` / `1004` - Ly Chanthy (Math) - Kampong Svay Primary School

**Kampong Cham Province:**
- `2001` / `2001` - Pich Srey Leak (Khmer) - Prey Veng Primary School
- `2002` / `2002` - Kem Pisach (Math) - Chrey Thom Primary School
- `2003` / `2003` - Nov Sreypov (Khmer) - Toul Preah Primary School
- `2004` / `2004` - Heng Vibol (Math) - Samrong Primary School

### Assessment Workflow
1. **Baseline Assessment**: All 256 students assessed in both subjects
2. **Student Selection**: 160 students selected (20 per school) based on baseline results
3. **Midline Assessment**: Selected students showing progress through intervention
4. **Endline Assessment**: Final assessment demonstrating learning outcomes

### Generated Data
- **2 Provinces**: Battambang, Kampong Cham with authentic Khmer names
- **8 Schools**: Realistic Cambodian primary schools
- **256 Students**: 32 per school across grades 3-6 with Cambodian names
- **512+ Assessments**: Comprehensive baseline, midline, and endline data
- **160 TaRL Selections**: Students chosen for intervention program

### Data Export
- Filter assessments by cycle, level, grade, student name
- Export to CSV with customizable columns
- Support for both Khmer and English data
- Real-time statistics and progress tracking

## 🔒 Security

- Cookie-based session management
- Route protection middleware
- Role-based access control
- SQL injection prevention
- Secure environment variable handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is developed for the TaRL program implementation in Cambodia.

## 🆘 Support

For technical support or questions:
- Review this README
- Check the migration scripts in `migrations/`
- Verify environment variable configuration
- Ensure database connectivity

---

**Note**: This is a demonstration system. In production, implement proper password hashing, enhanced security measures, and comprehensive testing.
