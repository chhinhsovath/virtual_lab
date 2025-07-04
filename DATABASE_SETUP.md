# TaRL Assessment Database Setup Guide

## 🗄️ Database Configuration

### Local Development (macOS)
```bash
# Database credentials
PGUSER=postgres
PGHOST=localhost  
PGDATABASE=tarl5k
PGPASSWORD=12345
PGPORT=5432
```

### Production (Digital Ocean)
```bash
# Server details
Host: 137.184.109.21
Database: tarl5k
Username: postgres
Password: P@ssw0rd\
Root Password: 6UYNIx4uWaVzkBy
```

## 🚀 Setup Instructions

### 1. Local Development Setup

**Step 1: Create Database**
```bash
# Connect to PostgreSQL
psql -h localhost -U postgres

# Create database
CREATE DATABASE tarl5k;

# Exit psql
\q
```

**Step 2: Run Migrations**
```bash
# Navigate to project directory
cd /Users/user/Desktop/apps/tarl_indir

# Run initial schema migration
psql -h localhost -U postgres -d tarl5k -f migrations/001_create_tables.sql

# Run seed data migration  
psql -h localhost -U postgres -d tarl5k -f migrations/002_seed_data.sql

# Run demo users migration (for DATABASE_SETUP.md credentials)
psql -h localhost -U postgres -d tarl5k -f migrations/009_seed_demo_users.sql
```

**Step 3: Start Application**
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### 2. Production Setup

**Step 1: Connect to Production Database**
```bash
# Connect to Digital Ocean database
psql -h 137.184.109.21 -U postgres -d tarl5k

# Or using connection string
psql "postgresql://postgres:P%40ssw0rd%5C@137.184.109.21:5432/tarl5k"
```

**Step 2: Run Migrations on Production**
```bash
# Run schema migration
psql -h 137.184.109.21 -U postgres -d tarl5k -f migrations/001_create_tables.sql

# Run seed data migration
psql -h 137.184.109.21 -U postgres -d tarl5k -f migrations/002_seed_data.sql

# Run demo users migration
psql -h 137.184.109.21 -U postgres -d tarl5k -f migrations/009_seed_demo_users.sql
```

## 👥 Demo User Accounts

**Note**: The login page shows two sets of credentials:
1. **Current Database Users** - Use existing database (admin123, mentor123, teacher123)
2. **DATABASE_SETUP.md Users** - Use after running migration 009 (simple passwords)

### Current Database Credentials
- **admin** / **admin123** - Administrator (Full system access)
- **mentor_battambang** / **mentor123** - Cluster Mentor (Battambang)
- **mentor_kampongcham** / **mentor123** - Cluster Mentor (Kampong Cham)
- **teacher_1** / **teacher123** - Sample Teacher

### DATABASE_SETUP.md Credentials (After Migration 009)

#### Administrator
- **Username**: `admin`
- **Password**: `admin`
- **Access**: Full system access
- **Login URL**: Use admin credentials in login form

### Cluster Mentors
- **mentor1** / **mentor1**
  - Province: Battambang 
  - Schools: Wat Kandal, Phum Thmey, Boeng Pring, Kampong Svay
  
- **mentor2** / **mentor2**  
  - Province: Kampong Cham
  - Schools: Prey Veng, Chrey Thom, Toul Preah, Samrong

### Teachers (8 total)

**Battambang Province:**
- **1001** / **1001** - Sok Pisey (Khmer) - Wat Kandal Primary School
- **1002** / **1002** - Chan Dara (Math) - Phum Thmey Primary School  
- **1003** / **1003** - Meas Sophea (Khmer) - Boeng Pring Primary School
- **1004** / **1004** - Ly Chanthy (Math) - Kampong Svay Primary School

**Kampong Cham Province:**
- **2001** / **2001** - Pich Srey Leak (Khmer) - Prey Veng Primary School
- **2002** / **2002** - Kem Pisach (Math) - Chrey Thom Primary School
- **2003** / **2003** - Nov Sreypov (Khmer) - Toul Preah Primary School  
- **2004** / **2004** - Heng Vibol (Math) - Samrong Primary School

## 📊 Generated Data Summary

### Geographic Structure
- **2 Provinces**: Battambang, Kampong Cham
- **4 Districts**: 2 per province with Khmer names
- **4 Clusters**: Regional groupings for mentorship
- **8 Schools**: Authentic Cambodian school names

### Educational Data
- **8 Teachers**: Subject-specific assignments (4 Khmer, 4 Math)
- **256 Students**: 32 per school across grades 3-6
- **Realistic Names**: Authentic Cambodian student and teacher names

### Assessment Data
- **512 Baseline Assessments**: All students assessed in both subjects
- **~200 Midline Assessments**: Selected students showing progress
- **~120 Endline Assessments**: Subset with completed intervention

### TaRL Program Selection
- **160 Students Selected**: 20 per school based on baseline results
- **Lower Level Focus**: Priority given to students needing support
- **Progress Tracking**: Improvement shown through assessment cycles

## 🔍 Verification Queries

After running the seed script, verify your data:

```sql
-- Check data counts
SELECT 'Provinces' as table_name, COUNT(*) as count FROM tbl_province
UNION ALL
SELECT 'Schools', COUNT(*) FROM tbl_school_list
UNION ALL  
SELECT 'Teachers', COUNT(*) FROM tbl_teacher_information
UNION ALL
SELECT 'Students', COUNT(*) FROM tbl_child
UNION ALL
SELECT 'Assessments', COUNT(*) FROM tarl_assessments;

-- Check assessment distribution
SELECT cycle, COUNT(*) as count 
FROM tarl_assessments 
GROUP BY cycle 
ORDER BY cycle;

-- Check selected students
SELECT COUNT(*) as selected_students 
FROM tarl_student_selection 
WHERE selected_for_program = true;
```

## 🔧 Troubleshooting

### Connection Issues
```bash
# Test local connection
psql -h localhost -U postgres -d tarl5k -c "SELECT version();"

# Test production connection  
psql -h 137.184.109.21 -U postgres -d tarl5k -c "SELECT version();"
```

### Reset Database
```sql
-- Drop and recreate database (LOCAL ONLY)
DROP DATABASE IF EXISTS tarl5k;
CREATE DATABASE tarl5k;
```

### Check Application Connection
```bash
# Start application and check logs
npm run dev

# Check database connection in browser console
# Login with any teacher ID (e.g., 1001/1001)
```

## 📝 Environment Variables

Ensure your `.env.local` file contains:
```env
DATABASE_URL=postgresql://postgres:12345@localhost:5432/tarl5k
SESSION_SECRET=development-session-secret-key-please-change-in-production
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development
```

For production deployment, use:
```env
DATABASE_URL=postgresql://postgres:P%40ssw0rd%5C@137.184.109.21:5432/tarl5k
SESSION_SECRET=your-production-secret-key
NEXTAUTH_URL=https://your-app.vercel.app
NODE_ENV=production
```

## ✅ Success Indicators

You'll know the setup is successful when:
- ✅ Login page loads with demo account buttons
- ✅ Teacher login (e.g., 1001/1001) works successfully  
- ✅ Dashboard shows assessment statistics
- ✅ Student selection page displays students with baseline data
- ✅ Results page shows filterable assessment data
- ✅ All Khmer text displays properly with Hanuman font

## 🎯 Next Steps

1. **Test All User Roles**: Login as teacher, mentor, and admin
2. **Verify Assessment Flow**: Check baseline → selection → midline → endline
3. **Test Export Features**: Ensure CSV export works with filtered data
4. **Mobile Testing**: Verify responsive design on mobile devices
5. **Production Deploy**: Deploy to Vercel with production database