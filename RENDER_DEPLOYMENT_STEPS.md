# 🚀 Render Deployment Steps

Follow these steps to deploy your Career Profiling Platform to Render.

## 📋 Prerequisites

- ✅ Render account (sign up at https://render.com - free tier available)
- ✅ Your code pushed to GitHub/GitLab/Bitbucket
- ✅ Gemini API key ready

---

## Step 1: Create MySQL Database on Render

1. Go to **Render Dashboard** → Click **"New +"** → Select **"PostgreSQL"** (or MySQL if available)
   - **Note**: Render offers PostgreSQL by default. If you need MySQL, you may need to use an external service like PlanetScale or Railway.

2. Configure Database:
   - **Name**: `career-profiling-db`
   - **Database**: `career_profiling_db`
   - **User**: `career_profiling_user`
   - **Plan**: Starter (Free tier)

3. **IMPORTANT**: Save these connection details:
   - Internal Database URL (will be shown after creation)
   - Host
   - Port
   - Database Name
   - Username
   - Password

---

## Step 2: Deploy Backend Service

1. Go to **Render Dashboard** → **"New +"** → **"Web Service"**

2. Connect your Git repository

3. Configure the service:
   ```
   Name: career-profiling-backend
   Environment: Node
   Region: Choose closest to you
   Branch: main (or your default branch)
   Root Directory: (leave empty)
   Build Command: cd backend-node && npm install
   Start Command: cd backend-node && node server.js
   Plan: Starter (Free tier)
   ```

4. **Add Environment Variables** (click "Advanced" → "Add Environment Variable"):

   ```bash
   NODE_ENV=production
   PORT=10000
   
   # Database Configuration (use values from Step 1)
   DB_HOST=<your-db-host>
   DB_PORT=<your-db-port>
   DB_USER=<your-db-user>
   DB_PASSWORD=<your-db-password>
   DB_NAME=career_profiling_db
   DATABASE_URL=<full-database-url-from-render>
   
   # JWT Secret (generate a strong random string)
   JWT_SECRET_KEY=<generate-random-string-here>
   
   # Gemini API Key
   GEMINI_API_KEY=<your-gemini-api-key>
   
   # Frontend URL (update after deploying frontend)
   FRONTEND_URL=https://career-profiling-frontend.onrender.com
   
   DEBUG=false
   ```

5. Click **"Create Web Service"**

6. Wait for deployment (5-10 minutes)

7. **Note your backend URL**: `https://career-profiling-backend.onrender.com`

---

## Step 3: Deploy Frontend Service

1. Go to **Render Dashboard** → **"New +"** → **"Static Site"**

2. Connect your Git repository

3. Configure the service:
   ```
   Name: career-profiling-frontend
   Branch: main (or your default branch)
   Root Directory: (leave empty)
   Build Command: npm install && npm run build
   Publish Directory: dist
   Plan: Starter (Free tier)
   ```

4. **Add Environment Variable**:
   ```bash
   VITE_API_URL=https://career-profiling-backend.onrender.com
   ```
   (Replace with your actual backend URL from Step 2)

5. Click **"Create Static Site"**

6. Wait for deployment (3-5 minutes)

7. **Note your frontend URL**: `https://career-profiling-frontend.onrender.com`

---

## Step 4: Update Backend CORS

1. Go back to your **Backend Service** → **Environment**

2. Update `FRONTEND_URL` to your actual frontend URL:
   ```
   FRONTEND_URL=https://career-profiling-frontend.onrender.com
   ```

3. Click **"Save Changes"** (this will trigger a redeploy)

---

## Step 5: Verify Deployment

1. Visit your frontend URL
2. Try logging in (default admin credentials if database was seeded):
   - Email: `admin@careerprofiling.com`
   - Password: `admin123`
3. Test the full application flow

---

## 🔧 Troubleshooting

### Backend Won't Start
- ✅ Check logs in Render Dashboard
- ✅ Verify all environment variables are set
- ✅ Ensure database connection string is correct
- ✅ Check that `PORT` is set to `10000`

### Frontend Can't Connect to Backend
- ✅ Verify `VITE_API_URL` is set correctly
- ✅ Check backend CORS settings
- ✅ Ensure backend is running (check health endpoint: `https://your-backend.onrender.com/health`)

### Database Connection Issues
- ✅ Verify `DATABASE_URL` format is correct
- ✅ Check database is running in Render
- ✅ Ensure credentials match

### Services Spinning Down
- ✅ Free tier services spin down after 15 minutes of inactivity
- ✅ First request after spin-down takes 30-60 seconds
- ✅ Consider upgrading to paid plan for always-on service

---

## 📝 Important Notes

1. **Free Tier Limitations**:
   - Services spin down after inactivity
   - First request after spin-down is slow
   - Limited resources

2. **Database**:
   - Render offers PostgreSQL by default
   - If you need MySQL, consider:
     - Using PostgreSQL (update your code)
     - External MySQL service (PlanetScale, Railway)
     - Render's MySQL addon (if available)

3. **Environment Variables**:
   - Never commit `.env` files
   - Use Render's environment variable management
   - Keep secrets secure

4. **Custom Domain**:
   - You can add custom domains in service settings
   - Update `FRONTEND_URL` accordingly

---

## 🎯 Quick Checklist

- [ ] Database created and connection details saved
- [ ] Backend service deployed with all environment variables
- [ ] Frontend service deployed with `VITE_API_URL` set
- [ ] Backend `FRONTEND_URL` updated to frontend URL
- [ ] Application tested and working
- [ ] Default admin password changed (if applicable)

---

## 🆘 Need Help?

1. Check Render logs: Dashboard → Your Service → Logs
2. Verify environment variables are correct
3. Test database connectivity
4. Review application error logs

---

**Congratulations! Your Career Profiling Platform is now live on Render! 🎉**

