# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start development server on port 3000
- `npm run build` - Build for production 
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality checks

### Database
- `psql -d database_name -f migrations/001_create_tables.sql` - Run initial database schema
- `chmod +x scripts/run-migrations.sh && ./scripts/run-migrations.sh` - Run all migrations

### Testing
- No test framework currently configured - check README or ask user for preferred testing approach

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **UI**: Tailwind CSS + Shadcn/ui components
- **Database**: PostgreSQL with raw SQL queries using `pg` library
- **Authentication**: Custom cookie-based session management
- **Forms**: React Hook Form with Zod validation
- **Drag & Drop**: @hello-pangea/dnd library

### Database Architecture
This system integrates with existing TaRL assessment database tables:

**Existing Tables (DO NOT MODIFY)**:
- `tbl_child` - Student records
- `tbl_school_list` - School information
- `tbl_teacher_information` - Teacher profiles
- `tbl_province` - Province data

**New Tables (Created by migrations)**:
- `tarl_assessments` - Assessment records with cycles (Baseline/Midline/Endline)
- `tarl_student_selection` - Students selected for TaRL program
- `users` - User authentication and roles
- `user_sessions` - Session management
- `user_school_access` - School-based access control

### Authentication & Authorization
- **Session Management**: Cookie-based sessions with 24-hour expiry
- **Role System**: Teacher, Cluster Mentor, Admin roles with permission-based access
- **School Access**: Users have specific school access with read/write/admin levels
- **Middleware**: Route protection in `/src/middleware.ts`

### Key Architecture Patterns
1. **Database Connection**: Global connection pool in `/src/lib/db.ts`
2. **Auth Layer**: Comprehensive auth system in `/src/lib/auth.ts`
3. **API Routes**: RESTful endpoints in `/src/app/api/`
4. **UI Components**: Reusable Shadcn/ui components in `/src/components/ui/`
5. **Raw SQL**: Direct PostgreSQL queries (no ORM) for performance

### Project Structure
```
src/
├── app/
│   ├── api/           # API routes (auth, assessments, students)
│   ├── auth/          # Authentication pages
│   ├── dashboard/     # Protected dashboard pages
│   └── layout.tsx     # Root layout with Hanuman font
├── components/
│   ├── dashboard/     # Dashboard-specific components
│   └── ui/           # Shadcn/ui components
├── lib/
│   ├── auth.ts       # Authentication functions
│   ├── db.ts         # Database connection
│   └── utils.ts      # Utility functions
└── middleware.ts     # Route protection
```

## Development Guidelines

### Database Operations
- Always use connection pooling via `pool.connect()` and `client.release()`
- Use parameterized queries to prevent SQL injection
- Wrap transactions in try/catch with proper rollback
- Example pattern:
```typescript
const client = await pool.connect();
try {
  // database operations
} finally {
  client.release();
}
```

### Authentication
- Check user permissions with `hasPermission()` and `hasRole()` functions
- Validate school access with `canAccessSchool()` before operations
- Always verify session in API routes using `getSession()`

### UI Components
- Use existing Shadcn/ui components from `/src/components/ui/`
- Follow Tailwind CSS classes for styling
- Hanuman font is configured for Khmer language support
- Components use `cn()` utility for conditional classes

### Environment Variables
Required variables in `.env.local`:
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption key
- `NEXTAUTH_URL` - Application URL
- `NODE_ENV` - Environment (development/production)

## Key Features

### Assessment System
- Multi-cycle assessments (Baseline/Midline/Endline)
- Subject-specific (Khmer/Math) with level tracking
- School-based access control for teachers

### Student Selection
- Drag-and-drop interface for TaRL program selection
- Baseline level filtering and grade-based selection
- 20 students per school selection limit

### User Management
- Role-based access (Teacher/Cluster Mentor/Admin)
- School-specific permissions with subject assignment
- Session-based authentication with activity logging

### Data Export
- CSV export functionality with customizable columns
- Advanced filtering by cycle, level, grade, student name
- Real-time statistics and progress tracking

### Multi-language Support
- English and Khmer language support
- Hanuman font configured in Tailwind for Khmer text
- Dual language labels throughout the application

## Important Notes

- This system integrates with existing TaRL database - never modify existing tables
- All new functionality uses UUID primary keys and proper foreign key relationships
- Raw SQL queries are used throughout for performance and direct database control
- Session management is custom-built using cookies (not NextAuth)
- The system supports 60-65 teachers across 30-32 schools in Cambodia