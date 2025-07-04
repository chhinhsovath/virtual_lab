# Vercel Environment Variables

## Complete Environment Variables for Vercel Deployment

Copy and paste these variables into your Vercel project settings:

### Database Configuration
```
DATABASE_URL=postgresql://postgres:P%40ssw0rd@137.184.109.21:5432/virtual_lab
PGUSER=postgres
PGHOST=137.184.109.21
PGDATABASE=virtual_lab
PGPASSWORD=P@ssw0rd
PGPORT=5432
```

### Application Configuration
```
NODE_ENV=production
NEXTAUTH_URL=https://vlab.openplp.com
SESSION_SECRET=XK9mP3qR7sT2vW5yZ8bE1nF4gH6jL0oN3pS6uX9zA2cF5hJ8kM1nQ4rT7vY0zC3e
ALLOWED_ORIGINS=https://vlab.openplp.com
```

### Khmer Language Configuration
```
DEFAULT_LANGUAGE=km
SUPPORTED_LANGUAGES=km,en
```

## How to Add in Vercel:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable individually:
   - **Name**: Variable name (e.g., `DATABASE_URL`)
   - **Value**: Variable value
   - **Environment**: Select "Production" (and optionally "Preview")
4. Click "Save" for each variable

## Deployment Notes:

✅ **Ready for Deployment**: All environment variables are configured
✅ **Database Connected**: Production PostgreSQL database on 137.184.109.21
✅ **Domain Configured**: https://vlab.openplp.com
✅ **Security**: Strong session secret generated
✅ **Khmer Language**: Configured as primary language
✅ **CORS**: Allowed origins set for security

## Post-Deployment Verification:

After deployment, verify:
1. Database connection works
2. Authentication functions properly
3. Khmer language displays correctly
4. All environment variables are loaded

## Important Security Notes:

- **SESSION_SECRET**: Keep this secret secure and never commit to repository
- **Database Password**: Ensure database access is properly secured
- **CORS**: Only allowed origins can access the API
- **HTTPS**: All connections should use HTTPS in production

## Domain Configuration:

Your Virtual Lab LMS will be available at:
- **Production URL**: https://vlab.openplp.com
- **Primary Language**: Khmer (ខ្មែរ)
- **Font**: Hanuman for proper Khmer rendering