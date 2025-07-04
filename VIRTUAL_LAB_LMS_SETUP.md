# VirtualLab LMS - Complete Setup Guide

## Overview

VirtualLab LMS is a comprehensive Learning Management System designed for virtual laboratory experiences with multi-role support, extensive permissions, and bilingual capabilities (English/Khmer).

### Key Features Implemented

✅ **Core System**
- Multi-role authentication system (12 roles)
- Comprehensive permission management
- Course management with enrollment
- Lab modules with HTML simulation support
- Assignment and assessment workflow
- Student activity tracking with detailed analytics
- File storage system (local/S3-compatible)
- Multi-portal dashboards for different user types
- Messaging and announcement system
- Multi-language support (EN/KM)

✅ **Database Architecture**
- PostgreSQL with comprehensive schema
- Role-based access control
- Activity logging and analytics
- Student progress tracking
- File management integration

✅ **User Roles & Permissions**
- Super Admin, Admin, Teacher, Student, Parent, Guardian
- Director, Partner, Mentor, Collector, Observer, QA
- Granular CRUD permissions per resource
- Context-aware access control

## Installation & Setup

### 1. Prerequisites

```bash
# Required software
- Node.js 18+ 
- PostgreSQL 13+
- Git
```

### 2. Database Setup

#### Option A: Local PostgreSQL
```bash
# Install PostgreSQL (macOS)
brew install postgresql
brew services start postgresql

# Create database
createdb virtual_lab

# Set environment variables
export PGUSER=postgres
export PGHOST=localhost
export PGDATABASE=virtual_lab
export PGPASSWORD=12345
export PGPORT=5432
```

#### Option B: DigitalOcean Production Database
```bash
# Use provided credentials:
Host: 137.184.109.21
Database: virtual_lab
Username: postgres
Password: P@ssw0rd
```

### 3. Environment Configuration

```bash
# Copy environment template
cp .env.example .env.local

# Configure .env.local
DATABASE_URL=postgresql://postgres:12345@localhost:5432/virtual_lab
# OR for production:
# DATABASE_URL=postgresql://postgres:P@ssw0rd@137.184.109.21:5432/virtual_lab

NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
SESSION_SECRET=your-strong-session-secret-here
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Database Migrations

```bash
# Make migration script executable
chmod +x scripts/run-migrations.sh

# Run all migrations
./scripts/run-migrations.sh

# Or run individual migrations:
psql -d virtual_lab -f migrations/012_virtual_lab_lms_schema.sql
psql -d virtual_lab -f migrations/013_lms_permissions_seed.sql
```

### 6. Start Development Server

```bash
npm run dev
```

Access the application at `http://localhost:3000`

## Database Schema Overview

### Core Tables
- `lms_roles` - User roles (12 types)
- `lms_resources` - System resources
- `lms_permissions` - CRUD permissions
- `lms_role_permissions` - Role-permission mapping
- `users` - Enhanced user profiles
- `lms_courses` - Course management
- `lms_labs` - Lab modules with simulations
- `lms_assignments` - Assignment system
- `lms_submissions` - Student submissions
- `lms_student_lab_activities` - Detailed activity tracking
- `lms_messages` - Internal messaging
- `lms_announcements` - System announcements

### Key Features
- UUID primary keys
- Audit trails with created/updated timestamps
- Soft deletes where appropriate
- JSON fields for flexible data storage
- Comprehensive indexing for performance

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/session` - Get current session
- `POST /api/auth/logout` - User logout

### Course Management
- `GET /api/courses` - List courses (with filters)
- `POST /api/courses` - Create course
- `GET /api/courses/[id]` - Get course details
- `PUT /api/courses/[id]` - Update course
- `DELETE /api/courses/[id]` - Delete course
- `GET /api/courses/[id]/enrollments` - Course enrollments
- `POST /api/courses/[id]/enrollments` - Enroll students

### Lab Management
- `GET /api/labs` - List labs
- `POST /api/labs` - Create lab
- `GET /api/labs/[id]` - Get lab details
- `PUT /api/labs/[id]` - Update lab
- `DELETE /api/labs/[id]` - Delete lab
- `POST /api/labs/[id]/activity` - Track student activity

### Assignment System
- `GET /api/assignments` - List assignments
- `POST /api/assignments` - Create assignment
- `GET /api/assignments/[id]` - Get assignment details
- `PUT /api/assignments/[id]` - Update assignment

### File Management
- `POST /api/upload` - Upload files
- `GET /api/upload` - Get upload configuration

### Communication
- `GET /api/messages` - List messages
- `POST /api/messages` - Send message
- `GET /api/announcements` - List announcements
- `POST /api/announcements` - Create announcement

## User Roles & Capabilities

### Super Admin
- Full system access
- User management
- System configuration
- All permissions

### Admin
- Course management
- User management (limited)
- Reports and analytics
- Resource management

### Teacher
- Create/manage courses
- Create assignments and labs
- Grade submissions
- View student progress

### Student
- Access enrolled courses
- Submit assignments
- Complete lab activities
- View progress

### Parent/Guardian
- View child's progress
- Receive communications
- Access reports

### Director
- Program oversight
- Performance reports
- Strategic planning
- Resource allocation

### Specialized Roles
- **Partner**: Collaboration access
- **Mentor**: Student guidance
- **Collector**: Data management
- **Observer**: Read-only monitoring
- **QA**: Quality assurance

## File Storage Configuration

### Local Storage (Default)
```javascript
// Files stored in ./uploads directory
// Organized by type: images/, documents/, videos/, etc.
// Automatic directory creation
```

### S3-Compatible Storage (Optional)
```bash
# Configure in .env.local
STORAGE_TYPE=s3
STORAGE_ENDPOINT=your-s3-endpoint
STORAGE_ACCESS_KEY=your-access-key
STORAGE_SECRET_KEY=your-secret-key
STORAGE_BUCKET=virtual-lab-files
```

## Multi-Language Support

### Supported Languages
- English (en) - Default
- Khmer (km) - Cambodian

### Implementation
```javascript
import { t, getLocalizedContent } from '@/lib/i18n';

// Basic translation
const text = t('nav.dashboard'); // "Dashboard" or "ទំព័រដើម"

// Localized content from database
const title = getLocalizedContent(course, 'title'); // course.title or course.title_km
```

### Font Configuration
- English: Default sans-serif
- Khmer: Hanuman font (configured in Tailwind)

## Dashboard Configuration

### Multi-Portal System
Each role gets a customized dashboard with:
- Role-specific statistics
- Relevant quick actions
- Appropriate navigation
- Contextual announcements

### Components
- `MultiPortalDashboard` - Main dashboard component
- Role-based stat cards
- Activity feeds
- Quick action buttons
- Progress tracking

## Development Guidelines

### Code Organization
```
src/
├── app/api/          # API routes
├── components/       # React components
│   ├── ui/          # Shadcn/ui components
│   └── dashboard/   # Dashboard components
├── lib/             # Utilities and configurations
│   ├── auth.ts      # Original auth (TaRL integration)
│   ├── lms-auth.ts  # Enhanced LMS auth
│   ├── db.ts        # Database connection
│   ├── storage.ts   # File storage
│   └── i18n.ts      # Internationalization
└── middleware.ts    # Route protection
```

### Database Best Practices
- Use parameterized queries
- Implement connection pooling
- Handle transactions properly
- Log activities for audit trails

### Security Considerations
- Session-based authentication
- Role-based access control
- SQL injection prevention
- File upload validation
- CORS configuration

## Production Deployment

### Database Migration
```bash
# Run on production database
psql -h 137.184.109.21 -U postgres -d virtual_lab -f migrations/012_virtual_lab_lms_schema.sql
psql -h 137.184.109.21 -U postgres -d virtual_lab -f migrations/013_lms_permissions_seed.sql
```

### Environment Variables (Production)
```bash
DATABASE_URL=postgresql://postgres:P@ssw0rd@137.184.109.21:5432/virtual_lab
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production
SESSION_SECRET=strong-production-secret
```

### Build and Deploy
```bash
npm run build
npm run start
```

## Testing

### Manual Testing Checklist
- [ ] User authentication (all roles)
- [ ] Course creation and enrollment
- [ ] Lab creation and student activities
- [ ] Assignment submission workflow
- [ ] File upload functionality
- [ ] Messaging system
- [ ] Multi-language switching
- [ ] Permission enforcement
- [ ] Dashboard customization per role

### Database Testing
```sql
-- Verify roles and permissions
SELECT r.name, COUNT(rp.permission_id) as permission_count
FROM lms_roles r
LEFT JOIN lms_role_permissions rp ON r.id = rp.role_id
GROUP BY r.name;

-- Check user assignments
SELECT u.name, r.name as role, u.preferred_language
FROM users u
LEFT JOIN lms_roles r ON u.lms_role_id = r.id
LIMIT 10;
```

## Integration with Existing TaRL System

The LMS extends the existing TaRL assessment system:

### Existing Tables (Preserved)
- `tbl_child` - Student records
- `tbl_school_list` - School information  
- `tbl_teacher_information` - Teacher profiles
- `users` - Enhanced with LMS fields
- `user_sessions` - Session management

### Integration Points
- User authentication flows through existing system
- School-based access control maintained
- Student records linked to existing data
- Assessment data can be correlated

## Support and Maintenance

### Monitoring
- Activity logs in `lms_activity_logs`
- User session tracking
- Performance metrics
- Error logging

### Backup Strategy
- Daily database backups
- File storage backups
- Configuration backups

### Updates and Maintenance
- Database migration system
- Feature flag support
- Rolling deployments
- Health check endpoints

## Next Steps

1. **Testing**: Comprehensive testing with real data
2. **Performance**: Optimize queries and add caching
3. **Mobile**: Responsive design improvements
4. **Analytics**: Advanced reporting dashboard
5. **Integration**: External LMS/SIMS integration
6. **Scale**: Load balancing and clustering

This VirtualLab LMS provides a solid foundation for educational technology with room for future enhancements and customizations.