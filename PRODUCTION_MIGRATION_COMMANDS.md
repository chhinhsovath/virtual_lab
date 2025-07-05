# Production Migration Commands

## Option 1: One-Line Command (Easiest)

SSH into your server and run this single command:

```bash
curl -s https://raw.githubusercontent.com/chhinhsovath/virtual_lab/main/migrate_production_all.sh | bash
```

## Option 2: Step by Step

If you prefer to run each step manually:

```bash
# 1. SSH into server
ssh root@137.184.109.21

# 2. Set database URL
export PRODUCTION_DATABASE_URL="postgresql://postgres:P@ssw0rd@localhost:5432/virtual_lab"

# 3. Run all migrations
cd /tmp && \
curl -s -O https://raw.githubusercontent.com/chhinhsovath/virtual_lab/main/setup_production_users.sql && \
curl -s -O https://raw.githubusercontent.com/chhinhsovath/virtual_lab/main/setup_virtual_lab_minimal.sql && \
curl -s -O https://raw.githubusercontent.com/chhinhsovath/virtual_lab/main/fix_production_auth.sql && \
psql $PRODUCTION_DATABASE_URL -f fix_production_auth.sql && \
psql $PRODUCTION_DATABASE_URL -f setup_production_users.sql && \
psql $PRODUCTION_DATABASE_URL -f setup_virtual_lab_minimal.sql && \
echo "Migration complete!"
```

## Option 3: Full Application Update

If you also need to update the application code:

```bash
# 1. SSH into server
ssh root@137.184.109.21

# 2. Update application
cd /var/www/virtual_lab
git pull origin main
npm install
npm run build

# 3. Run migrations
export PRODUCTION_DATABASE_URL="postgresql://postgres:P@ssw0rd@localhost:5432/virtual_lab"
psql $PRODUCTION_DATABASE_URL < setup_production_users.sql
psql $PRODUCTION_DATABASE_URL < setup_virtual_lab_minimal.sql

# 4. Restart application
pm2 restart all
# or if using systemd:
# systemctl restart virtual-lab

# 5. Check status
pm2 status
```

## After Migration

Test login at: https://vlab.openplp.com/auth/login

Credentials:
- Username: `student@vlab.edu.kh`
- Password: `demo123`

## Verify Success

Check if users were created:
```bash
psql $PRODUCTION_DATABASE_URL -c "SELECT email, role FROM users WHERE email LIKE '%vlab.edu.kh';"
```

Check application logs:
```bash
pm2 logs --lines 50
```