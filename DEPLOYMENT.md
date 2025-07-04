# Virtual Lab LMS - Deployment Guide

Complete guide for deploying the Virtual Lab LMS to both local and production environments.

## 📋 Prerequisites

### Local Development
- Node.js 18+
- PostgreSQL 12+ running locally
- Git

### Production Server (Digital Ocean)
- **Server IP**: 137.184.109.21
- **Droplet Name**: plp-digital
- **Root Password**: 6UYNIx4uWaVzkBy

## 🗄️ Database Configuration

### Local Database
```
Host: localhost
Database: virtual_lab
Username: postgres
Password: 12345
Port: 5432
```

### Production Database  
```
Host: 137.184.109.21
Database: virtual_lab
Username: postgres
Password: P@ssw0rd
Port: 5432
```

## 🚀 Quick Setup

### 1. Test Database Connections
```bash
# Test both local and production database connectivity
./scripts/test-db-connection.sh
```

### 2. Setup Local Environment
```bash
# Install dependencies
npm install

# Setup local database
npm run db:setup:local

# Start development server
npm run dev
```

### 3. Setup Production Environment
```bash
# Setup production database
npm run db:setup:production

# Build for production
npm run build

# Start production server
npm start
```

## 📂 Environment Files

The project includes pre-configured environment files:

### `.env.local` (Development)
```env
DATABASE_URL="postgresql://postgres:12345@localhost:5432/virtual_lab"
PGUSER=postgres
PGHOST=localhost
PGDATABASE=virtual_lab
PGPASSWORD=12345
PGPORT=5432
SESSION_SECRET="your-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV=development
```

### `.env.production` (Production)
```env
DATABASE_URL="postgresql://postgres:P%40ssw0rd@137.184.109.21:5432/virtual_lab"
PGUSER=postgres
PGHOST=137.184.109.21
PGDATABASE=virtual_lab
PGPASSWORD=P@ssw0rd
PGPORT=5432
SESSION_SECRET="change-this-to-a-strong-random-secret-key-in-production"
NEXTAUTH_URL="https://137.184.109.21"
NODE_ENV=production
```

## 🗄️ Database Migration

### Automated Migration Process

The setup script automatically handles:

1. **Database Creation**: Creates `virtual_lab` database if it doesn't exist
2. **Schema Migrations**: Runs all migration files in order
3. **Migration Tracking**: Tracks applied migrations in `schema_migrations` table
4. **Verification**: Confirms all expected tables are created

### Migration Files Included

1. `001_initial_schema.sql` - Basic user and LMS structure
2. `002_enhanced_lms_schema.sql` - Enhanced LMS features
3. `003_user_management_schema.sql` - User roles and permissions
4. `004_course_management_schema.sql` - Course and enrollment system
5. `005_lab_module_schema.sql` - Lab management system
6. `006_assignment_workflow_schema.sql` - Assignment and submission workflow
7. `007_student_activity_schema.sql` - Student activity tracking
8. `008_multi_portal_dashboard_schema.sql` - Dashboard system
9. `009_communication_schema.sql` - Messaging and announcements
10. `010_file_storage_schema.sql` - File and resource management
11. `011_multilanguage_schema.sql` - Multi-language support
12. `012_lms_integration_schema.sql` - Enhanced LMS integration
13. `013_user_roles_enhancement.sql` - Enhanced role system
14. `014_lab_resource_upload_enhancement.sql` - Lab resource management
15. `015_student_lab_interaction_schema.sql` - Student lab interaction
16. `016_lab_assessment_schema.sql` - Assessment and scoring
17. `017_lab_analytics_schema.sql` - Analytics and reporting
18. `018_curriculum_builder_schema.sql` - Curriculum building and skills framework

## 🖥️ Production Server Deployment

### SSH Access
```bash
ssh root@137.184.109.21
# Password: 6UYNIx4uWaVzkBy
```

### Server Setup Commands
```bash
# 1. Update system
apt update && apt upgrade -y

# 2. Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# 3. Install PostgreSQL client (if not already installed)
apt-get install -y postgresql-client

# 4. Install PM2 for process management
npm install -g pm2

# 5. Clone and setup application
git clone <repository-url> /var/www/virtual_lab
cd /var/www/virtual_lab

# 6. Install dependencies
npm install

# 7. Setup production database
npm run db:setup:production

# 8. Build application
npm run build

# 9. Start with PM2
pm2 start npm --name "virtual-lab" -- start
pm2 save
pm2 startup
```

## 🔧 Available Scripts

### Database Management
- `npm run db:setup:local` - Setup local database with all migrations
- `npm run db:setup:production` - Setup production database with all migrations
- `npm run db:reset:local` - Reset local database (drops and recreates)

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript type checking

### Testing
- `./scripts/test-db-connection.sh` - Test database connections

## 🔍 Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test connection manually
psql -h 137.184.109.21 -U postgres -d virtual_lab
```

#### 2. Permission Denied on Scripts
```bash
# Make scripts executable
chmod +x scripts/*.sh
```

#### 3. Migration Errors
```bash
# Check migration logs
./scripts/setup-database.sh local 2>&1 | tee migration.log

# Manually check database
psql -h localhost -U postgres -d virtual_lab -c "\dt"
```

#### 4. Environment Variables Not Loading
```bash
# Verify .env files exist
ls -la .env*

# Check database URL format
echo $DATABASE_URL
```

### Database Verification

After setup, verify the database contains these key tables:

```sql
-- Connect to database
psql -h 137.184.109.21 -U postgres -d virtual_lab

-- Check tables
\dt

-- Verify migration tracking
SELECT * FROM schema_migrations ORDER BY applied_at;

-- Check key tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'lms_labs', 'curriculums', 'lab_scores');
```

## 🔐 Security Considerations

### Production Security Checklist

1. **Change Default Passwords**
   - Update SESSION_SECRET in production
   - Use strong database passwords
   - Change default admin credentials

2. **Firewall Configuration**
   ```bash
   # Allow only necessary ports
   ufw allow 22    # SSH
   ufw allow 80    # HTTP
   ufw allow 443   # HTTPS
   ufw allow 5432  # PostgreSQL (restrict to app server)
   ufw enable
   ```

3. **SSL Certificate**
   ```bash
   # Install certbot for Let's Encrypt
   apt install certbot
   certbot --nginx -d yourdomain.com
   ```

4. **Database Security**
   - Restrict PostgreSQL access to application IP only
   - Use connection pooling limits
   - Regular database backups

## 📊 Monitoring

### Application Monitoring
```bash
# PM2 status
pm2 status
pm2 logs virtual-lab

# System resources
htop
df -h
```

### Database Monitoring
```bash
# Connection count
psql -h 137.184.109.21 -U postgres -d virtual_lab -c "
SELECT count(*) as connections 
FROM pg_stat_activity 
WHERE datname = 'virtual_lab';"

# Database size
psql -h 137.184.109.21 -U postgres -d virtual_lab -c "
SELECT pg_size_pretty(pg_database_size('virtual_lab'));"
```

## 🔄 Backup Strategy

### Database Backup
```bash
# Create backup
pg_dump -h 137.184.109.21 -U postgres virtual_lab > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
psql -h 137.184.109.21 -U postgres virtual_lab < backup_file.sql
```

### Application Backup
```bash
# Backup uploads and data
tar -czf virtual_lab_backup_$(date +%Y%m%d).tar.gz /var/www/virtual_lab
```

## 📞 Support

For deployment issues:

1. Check this deployment guide
2. Review database logs: `tail -f /var/log/postgresql/postgresql-*.log`
3. Check application logs: `pm2 logs virtual-lab`
4. Verify environment variables are loaded correctly
5. Test database connectivity with provided scripts

---

**Note**: This deployment guide assumes the provided server credentials are correct and the server has necessary permissions configured.