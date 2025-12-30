# Render Deployment Guide

This guide will help you deploy your Career Profiling Platform to Render.

## Prerequisites

1. A Render account (sign up at https://render.com)
2. Your Gemini API key
3. Git repository (GitHub/GitLab/Bitbucket)

## Step 1: Prepare Your Repository

Make sure your code is pushed to a Git repository (GitHub, GitLab, or Bitbucket).

## Step 2: Deploy MySQL Database

1. Go to Render Dashboard → New → PostgreSQL (or MySQL if available)
2. Create a new database:
   - **Name**: `career-profiling-db`
   - **Database**: `career_profiling_db`
   - **User**: `career_profiling_user`
   - **Plan**: Starter (Free tier available)
3. **Save the connection details** - you'll need:
   - Internal Database URL
   - Host
   - Port
   - Database Name
   - Username
   - Password

## Step 3: Deploy Backend Service

1. Go to Render Dashboard → New → Web Service
2. Connect your repository
3. Configure the service:
   - **Name**: `career-profiling-backend`
   - **Environment**: Node
   - **Build Command**: `cd backend-node && npm install`
   - **Start Command**: `cd backend-node && node server.js`
   - **Plan**: Starter (Free tier available)

4. **Add Environment Variables**:
   ```
   NODE_ENV=production
   PORT=10000
   DB_HOST=<from database connection>
   DB_PORT=<from database connection>
   DB_USER=<from database connection>
   DB_PASSWORD=<from database connection>
   DB_NAME=career_profiling_db
   DATABASE_URL=<full database URL from Render>
   JWT_SECRET_KEY=<generate a strong random string>
   GEMINI_API_KEY=<your Gemini API key>
   FRONTEND_URL=https://your-frontend-url.onrender.com
   DEBUG=false
   ```

5. Click "Create Web Service"
6. **Wait for deployment** and note the backend URL (e.g., `https://career-profiling-backend.onrender.com`)

## Step 4: Deploy Frontend Service

1. Go to Render Dashboard → New → Static Site
2. Connect your repository
3. Configure the service:
   - **Name**: `career-profiling-frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Plan**: Starter (Free tier available)

4. **Add Environment Variable**:
   ```
   VITE_API_URL=https://career-profiling-backend.onrender.com
   ```

5. Click "Create Static Site"
6. **Wait for deployment** and note the frontend URL

## Step 5: Update Backend CORS

After getting your frontend URL, update the backend environment variable:
- Go to Backend Service → Environment
- Update `FRONTEND_URL` to your actual frontend URL
- Redeploy the backend

## Step 6: Initialize Database

The backend will automatically create tables and seed initial data on first start.

## Step 7: Test Your Deployment

1. Visit your frontend URL
2. Try logging in with default admin credentials (if seeded)
3. Test the full flow

## Troubleshooting

### Backend Issues
- Check logs in Render Dashboard
- Verify all environment variables are set
- Ensure database is accessible
- Check CORS settings match frontend URL

### Frontend Issues
- Verify `VITE_API_URL` is set correctly
- Check build logs for errors
- Ensure API calls use the correct backend URL

### Database Issues
- Verify connection string format
- Check database is running
- Ensure credentials are correct

## Default Admin Credentials (After Seeding)

- Email: `admin@careerprofiling.com`
- Password: `admin123` (change immediately in production!)

## Important Notes

1. **Free Tier Limitations**: 
   - Services spin down after 15 minutes of inactivity
   - First request after spin-down may take 30-60 seconds

2. **Database Backups**: 
   - Enable automatic backups in database settings

3. **Environment Variables**: 
   - Never commit `.env` files
   - Use Render's environment variable management

4. **Custom Domain**: 
   - You can add a custom domain in service settings

## Support

If you encounter issues:
1. Check Render logs
2. Verify environment variables
3. Test database connectivity
4. Review application logs

