# TaRL System Database Migration Guide

This guide explains the database refactoring from hardcoded authentication to a flexible user and role management system.

## Overview

The migration replaces the old `tarl5k` data structure with a modern, flexible authentication and authorization system that includes:

- **User Management**: Proper user accounts with secure password hashing
- **Role-Based Access Control**: Flexible roles and permissions system
- **School-Level Permissions**: Granular access control per school
- **Audit Trails**: Complete logging of user activities
- **Session Management**: Secure session handling with expiration

## What Changed

### Before (Old System)
- Hardcoded credentials (admin/admin, mentor1/mentor1, etc.)
- Simple role-based access in code
- Basic session management
- Limited audit capabilities

### After (New System)
- Database-driven user management
- Flexible role and permission system
- School-level access control
- Enhanced security with bcrypt password hashing
- Comprehensive audit trails
- Advanced session management with refresh tokens

## Database Schema Changes

### New Tables Created

1. **`users`** - User accounts with authentication info
2. **`roles`** - System roles (admin, teacher, mentor, etc.)
3. **`permissions`** - Individual permissions (read, write, delete, etc.)
4. **`role_permissions`** - Links roles to permissions
5. **`user_roles`** - Links users to roles
6. **`user_school_access`** - School-level access control
7. **`user_sessions`** - Enhanced session management
8. **`user_activity_log`** - Audit trail of user actions
9. **`password_reset_tokens`** - Password reset functionality

### Updated Tables
- **`user_sessions`** - Replaced with enhanced version
- **`user_permissions`** - Removed (replaced with new system)

## Migration Files

1. **`005_users_roles_refactor.sql`** - Creates new user and role tables
2. **`006_seed_users_data.sql`** - Populates initial user data

## Running the Migration

### Prerequisites
- PostgreSQL client (`psql`) installed
- Database connection configured in `.env.local`
- Backup of existing database (recommended)

### Steps

1. **Backup your database** (recommended):
   ```bash
   pg_dump $DATABASE_URL > backup_before_migration.sql
   ```

2. **Run the migration script**:
   ```bash
   ./scripts/run-migrations.sh
   ```

3. **Test the new system**:
   - Visit `/auth/login`
   - Try logging in with new credentials
   - Verify permissions work correctly

## Default User Accounts

After migration, these accounts will be available:

### Super Administrator
- **Username**: `superadmin`
- **Password**: `admin123`
- **Access**: Full system access including user management

### Administrator
- **Username**: `admin`
- **Password**: `admin123`
- **Access**: Full access to assessment data and schools

### Cluster Mentors
- **Username**: `mentor1` / `mentor2`
- **Password**: `mentor123`
- **Access**: Read-only access to assigned school clusters

### Teachers
- **Username**: `teacher_[TeacherID]` (e.g., `teacher_1001`)
- **Password**: `teacher123`
- **Access**: Write access to their own school and subject

### Viewers
- **Username**: `viewer1` / `viewer2`
- **Password**: `viewer123`
- **Access**: Read-only access to assigned schools

## Code Changes Required

### Frontend Changes
- Login form now uses `username` instead of `teacherId`
- Session management updated to use new user structure
- Permission checks updated for new system

### API Changes
- Authentication middleware updated
- User session structure changed
- Permission checking logic updated

## Security Improvements

1. **Password Hashing**: All passwords now use bcrypt with salt
2. **Session Security**: Enhanced session management with proper expiration
3. **Audit Trails**: All user actions are logged
4. **Permission Granularity**: Fine-grained control over user access
5. **School Isolation**: Users can only access authorized schools

## Testing Checklist

After migration, verify:

- [ ] Login works with new credentials
- [ ] Users can only access authorized schools
- [ ] Permission system works correctly
- [ ] Audit logs are created for actions
- [ ] Session expiration works properly
- [ ] Password reset functionality (if implemented)

## Rollback Plan

If issues occur, you can rollback using the backup:

```bash
# Drop the database and recreate from backup
psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
psql $DATABASE_URL < backup_before_migration.sql
```

## Production Deployment

For production deployment:

1. **Change default passwords** immediately
2. **Review user permissions** and school access
3. **Enable SSL** for database connections
4. **Configure session timeouts** appropriately
5. **Set up monitoring** for failed login attempts
6. **Enable audit log retention** policies

## Troubleshooting

### Common Issues

1. **Migration fails**: Check database permissions and connection
2. **Login doesn't work**: Verify new username format and passwords
3. **Permission denied**: Check user roles and school access assignments
4. **Session issues**: Clear browser cookies and try again

### Support

If you encounter issues:
1. Check the migration logs for specific error messages
2. Verify database connection and permissions
3. Review the user and role assignments in the database
4. Check the application logs for authentication errors

## Future Enhancements

This migration provides a foundation for:
- Multi-factor authentication
- Advanced permission workflows
- Integration with external authentication systems
- Enhanced security policies
- Automated user provisioning