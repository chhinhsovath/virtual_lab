# Database Configuration & Migration Guide

## Environment Credentials

### Production Environment (Digital Ocean)
**Server Details:**
- SSH Access: `ssh root@137.184.109.21`
- Server IP: https://137.184.109.21
- Droplet Name: plp-digital
- Root Password: `6UYNIx4uWaVzkBy`

**Database Details:**
- Host: 137.184.109.21
- Database: virtual_lab
- Username: postgres
- Password: P@ssw0rd
- Port: 5432 (default)

### Local Development Environment
**System Details:**
- MacBook Password: 12345

**Database Details:**
- PGUSER: postgres
- PGHOST: localhost
- PGDATABASE: virtual_lab
- PGPASSWORD: 12345
- PGPORT: 5432

## Environment Files

### Production (.env.production)
```
DATABASE_URL=postgresql://postgres:P%40ssw0rd@137.184.109.21:5432/virtual_lab
PGUSER=postgres
PGHOST=137.184.109.21
PGDATABASE=virtual_lab
PGPASSWORD=P@ssw0rd
PGPORT=5432
NODE_ENV=production
SESSION_SECRET=your-production-session-secret
NEXTAUTH_URL=https://137.184.109.21
```

### Local Development (.env.local)
```
DATABASE_URL=postgresql://postgres:12345@localhost:5432/virtual_lab
PGUSER=postgres
PGHOST=localhost
PGDATABASE=virtual_lab
PGPASSWORD=12345
PGPORT=5432
NODE_ENV=development
SESSION_SECRET=your-local-session-secret
NEXTAUTH_URL=http://localhost:3000
```

## Migration Commands

### Local to Production
```bash
# Dump local database
pg_dump -h localhost -U postgres -d virtual_lab > virtual_lab_backup.sql

# Upload to server
scp virtual_lab_backup.sql root@137.184.109.21:/tmp/

# Connect to server and restore
ssh root@137.184.109.21
psql -h localhost -U postgres -d virtual_lab < /tmp/virtual_lab_backup.sql
```

### Production to Local
```bash
# Dump production database
ssh root@137.184.109.21 "pg_dump -h localhost -U postgres -d virtual_lab" > production_backup.sql

# Restore to local
psql -h localhost -U postgres -d virtual_lab < production_backup.sql
```

## Quick Migration Scripts

### Backup Production
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
ssh root@137.184.109.21 "pg_dump -h localhost -U postgres -d virtual_lab" > "backups/production_${DATE}.sql"
echo "Production backup saved as: backups/production_${DATE}.sql"
```

### Sync Local to Production
```bash
#!/bin/bash
echo "Creating local backup..."
pg_dump -h localhost -U postgres -d virtual_lab > /tmp/local_backup.sql

echo "Uploading to production server..."
scp /tmp/local_backup.sql root@137.184.109.21:/tmp/

echo "Restoring to production database..."
ssh root@137.184.109.21 "psql -h localhost -U postgres -d virtual_lab < /tmp/local_backup.sql"

echo "Migration completed!"
```

## Security Notes
- Keep this file private and add to .gitignore
- Use environment variables for sensitive data
- Consider using connection pooling for production
- Regular backups are essential before migrations
- Test migrations on staging environment first

## Connection Test Commands

### Test Local Connection
```bash
psql -h localhost -U postgres -d virtual_lab -c "SELECT version();"
```

### Test Production Connection
```bash
ssh root@137.184.109.21 "psql -h localhost -U postgres -d virtual_lab -c 'SELECT version();'"
```