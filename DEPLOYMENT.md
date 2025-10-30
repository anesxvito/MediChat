# 🚀 MediChat Deployment Guide

## 📦 Deployment Architecture

**Frontend:** Vercel  
**Backend:** Railway (supports Socket.IO WebSockets)  
**Database:** Railway PostgreSQL

---

## 🔧 Prerequisites

1. GitHub account
2. Vercel account (free): https://vercel.com
3. Railway account (free): https://railway.app
4. Git installed

---

## Step 1️⃣: Push to GitHub

```bash
# Navigate to project
cd ~/MediChat

# Initialize Git
git init
git add .
git commit -m "Initial commit - MediChat app"

# Create GitHub repo at: https://github.com/new
# Name it: medichat

# Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/medichat.git
git branch -M main
git push -u origin main
```

---

## Step 2️⃣: Deploy Database to Railway

1. Go to https://railway.app
2. Click **"New Project"**
3. Select **"Provision PostgreSQL"**
4. Copy the **DATABASE_URL** (looks like: `postgresql://user:pass@host:port/db`)
5. Save it - you'll need this!

---

## Step 3️⃣: Deploy Backend to Railway

1. In Railway, click **"New"** → **"GitHub Repo"**
2. Select your `medichat` repository
3. Railway will auto-detect Node.js
4. Click **"Add variables"** and add:
   ```
   DATABASE_URL=postgresql://... (from Step 2)
   JWT_SECRET=your-super-secret-jwt-key-change-this
   NODE_ENV=production
   FRONTEND_URL=https://your-app.vercel.app (you'll update this later)
   GEMINI_API_KEY=your-gemini-api-key
   PORT=5000
   ```
5. In **Settings** → **Root Directory**, set to: `backend`
6. Click **"Deploy"**
7. Once deployed, copy the **Railway URL** (e.g., `https://your-app.up.railway.app`)

### Run Database Migration:
1. In Railway, go to your backend service
2. Click **"Connect"** → **"Variables"** → Copy `DATABASE_URL`
3. On your local machine:
   ```bash
   cd ~/MediChat/backend
   DATABASE_URL="paste-railway-url-here" npx prisma migrate deploy
   DATABASE_URL="paste-railway-url-here" npx prisma db seed
   ```

---

## Step 4️⃣: Deploy Frontend to Vercel

1. Go to https://vercel.com
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repo: `medichat`
4. Configure:
   - **Framework Preset:** Create React App
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
5. Add **Environment Variables:**
   ```
   REACT_APP_API_URL=https://your-backend.up.railway.app
   ```
   (Use the Railway URL from Step 3)
6. Click **"Deploy"**
7. Once deployed, copy your Vercel URL (e.g., `https://medichat.vercel.app`)

---

## Step 5️⃣: Update Backend Environment

1. Go back to Railway
2. Update `FRONTEND_URL` environment variable to your Vercel URL
3. Redeploy the backend

---

## ✅ Verification

1. Visit your Vercel URL: `https://medichat.vercel.app`
2. Register a new account
3. Test patient and doctor features
4. Check real-time notifications work!

---

## 🔐 Important Security Notes

1. **Change JWT_SECRET** to a strong random string
2. **Never commit .env files**
3. **Update CORS origins** in production
4. **Enable HTTPS only**

---

## 🐛 Troubleshooting

### Backend not connecting:
- Check Railway logs
- Verify DATABASE_URL is correct
- Ensure Prisma migrations ran

### Frontend not loading:
- Check Vercel deployment logs
- Verify REACT_APP_API_URL is set correctly
- Clear browser cache

### Socket.IO not working:
- Verify backend is on Railway (not Vercel serverless)
- Check CORS configuration
- Ensure frontend points to correct backend URL

---

## 📊 Monitoring

- **Railway:** View logs and metrics in dashboard
- **Vercel:** Check Analytics and deployment logs
- **Database:** Monitor Railway PostgreSQL metrics

---

## 💰 Costs (Free Tier Limits)

- **Vercel:** Unlimited bandwidth, 100GB/month
- **Railway:** $5 credit/month (enough for small apps)
- **Alternative:** Use Render.com (completely free tier available)

---

## 🔄 Updates

To deploy updates:

```bash
git add .
git commit -m "Your update message"
git push

# Vercel and Railway auto-deploy on push!
```

---

## 🎉 Done!

Your MediChat app is now live with:
✅ Real-time notifications (Socket.IO)
✅ Secure PostgreSQL database
✅ Auto-deployment on push
✅ HTTPS enabled
