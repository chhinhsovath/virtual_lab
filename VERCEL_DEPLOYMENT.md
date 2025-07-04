# Virtual Lab LMS - Vercel Deployment Guide

## 🚀 Environment Variables for Vercel

### Required Environment Variables

When deploying to Vercel, add these environment variables in your Vercel dashboard:

### 1. Database Configuration
```env
DATABASE_URL=postgresql://postgres:P%40ssw0rd@137.184.109.21:5432/virtual_lab
PGUSER=postgres
PGHOST=137.184.109.21
PGDATABASE=virtual_lab
PGPASSWORD=P@ssw0rd
PGPORT=5432
```

### 2. Application Configuration
```env
NODE_ENV=production
NEXTAUTH_URL=https://your-app-name.vercel.app
SESSION_SECRET=generate-a-strong-64-character-random-string-here
```

### 3. Security & CORS
```env
ALLOWED_ORIGINS=https://your-app-name.vercel.app,https://137.184.109.21
```

### 4. File Storage (Optional)
```env
UPLOAD_DIR=/tmp/virtual_lab_uploads
```

## 🔑 Critical Security Notes

### ⚠️ **IMPORTANT: Update SESSION_SECRET**

**DO NOT use the demo session secret in production!**

Generate a strong session secret:
```bash
# Generate a secure random string
openssl rand -base64 64
```

Example strong session secret:
```
SESSION_SECRET=Kj8mN2pQ4rS6tU8wY1aC3eF5gH7jL9nP0qR2sT4vX6zB8dE0fG2hJ4kM6oP8qS0u
```

### 📋 **Step-by-Step Vercel Deployment**

1. **Prepare Repository**
   ```bash
   # Ensure your code is pushed to GitHub/GitLab
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Select "Next.js" as framework

3. **Configure Environment Variables**
   In Vercel dashboard → Settings → Environment Variables, add:

   | Name | Value |
   |------|-------|
   | `DATABASE_URL` | `postgresql://postgres:P%40ssw0rd@137.184.109.21:5432/virtual_lab` |
   | `PGUSER` | `postgres` |
   | `PGHOST` | `137.184.109.21` |
   | `PGDATABASE` | `virtual_lab` |
   | `PGPASSWORD` | `P@ssw0rd` |
   | `PGPORT` | `5432` |
   | `NODE_ENV` | `production` |
   | `NEXTAUTH_URL` | `https://your-app-name.vercel.app` |
   | `SESSION_SECRET` | `[Your-64-char-secret]` |
   | `ALLOWED_ORIGINS` | `https://your-app-name.vercel.app` |

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy

## 🔧 Vercel Configuration Files

### `vercel.json` (Optional - for advanced configuration)
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "NODE_ENV": "production"
  }
}
```

### `.vercelignore` (Optional)
```
# Ignore files/folders for Vercel deployment
.env.local
.env.development
.env.production
migrations/
scripts/
*.log
```

## 🌐 Post-Deployment Configuration

### 1. Update NEXTAUTH_URL
After deployment, update the `NEXTAUTH_URL` environment variable:
```
NEXTAUTH_URL=https://your-actual-vercel-domain.vercel.app
```

### 2. Update ALLOWED_ORIGINS
```
ALLOWED_ORIGINS=https://your-actual-vercel-domain.vercel.app,https://137.184.109.21
```

### 3. Test Database Connection
After deployment, test that your app can connect to the production database.

## 🚨 Important Security Considerations

### Database Security
- ✅ Your production database is already set up and accessible
- ⚠️ Consider IP whitelisting for database access
- ✅ Use connection pooling (already configured)

### Application Security
- ✅ Change SESSION_SECRET from demo value
- ✅ Use HTTPS only (Vercel provides this automatically)
- ✅ Set proper CORS origins
- ⚠️ Consider rate limiting for API endpoints

## 🔍 Testing Your Deployment

### 1. Basic Functionality Test
- Visit your Vercel URL
- Try logging in with demo accounts:
  - Admin: `admin@virtuallab.com`
  - Teacher: `teacher@virtuallab.com`
  - Student: `student@virtuallab.com`

### 2. Database Connection Test
- Check if the app loads without database errors
- Try creating a new lab or course
- Verify data is being saved to your production database

### 3. Feature Testing
- Test all 5 phases of the Virtual Lab LMS
- Verify file uploads work
- Check analytics and reporting features

## 📊 Environment Variables Summary

Copy these exact values for Vercel:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:P%40ssw0rd@137.184.109.21:5432/virtual_lab
PGUSER=postgres
PGHOST=137.184.109.21
PGDATABASE=virtual_lab
PGPASSWORD=P@ssw0rd
PGPORT=5432

# Application Configuration
NODE_ENV=production
NEXTAUTH_URL=https://your-app-name.vercel.app
SESSION_SECRET=GENERATE_YOUR_OWN_64_CHAR_SECRET

# Security
ALLOWED_ORIGINS=https://your-app-name.vercel.app
```

## 🛠️ Troubleshooting

### Common Issues:

1. **Database Connection Failed**
   - Verify all database environment variables
   - Check if Digital Ocean database allows external connections
   - Test connection with: `npm run db:test`

2. **Session Issues**
   - Ensure SESSION_SECRET is set and strong
   - Check NEXTAUTH_URL matches your Vercel domain

3. **CORS Errors**
   - Update ALLOWED_ORIGINS with your Vercel domain
   - Check API route configurations

4. **Build Failures**
   - Ensure all dependencies are in package.json
   - Check TypeScript errors: `npm run type-check`

## 🎯 Production Checklist

Before going live:

- [ ] Strong SESSION_SECRET generated and set
- [ ] NEXTAUTH_URL updated with actual Vercel domain
- [ ] Database connection tested
- [ ] Demo accounts tested
- [ ] All features verified working
- [ ] Error monitoring set up (optional)
- [ ] Backup strategy for database (recommended)

## 📞 Support

If you encounter deployment issues:

1. Check Vercel deployment logs
2. Verify environment variables are set correctly
3. Test database connectivity
4. Review this deployment guide
5. Check the main README.md for additional troubleshooting

---

**🚀 Your Virtual Lab LMS is ready for Vercel deployment!**