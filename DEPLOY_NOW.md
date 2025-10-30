# 🚀 QUICK DEPLOYMENT GUIDE - MediChat

## ⚡ Deploy in 15 Minutes

---

## 📋 Step 1: Prepare Environment Variables

You'll need these API keys/secrets:

1. **JWT_SECRET**: Generate one here: https://jwtsecret.com/generate (or use command below)
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **GEMINI_API_KEY**: Get from https://makersuite.google.com/app/apikey

---

## 🗄️ Step 2: Deploy Database (Railway)

1. Go to https://railway.app/new
2. Click **"Provision PostgreSQL"**
3. Once created, click your database → **Connect** → Copy the **`DATABASE_URL`**
4. It looks like: `postgresql://postgres:PASSWORD@containers-us-west-XXX.railway.app:5432/railway`
5. Save this URL - you'll need it!

---

## 🔧 Step 3: Deploy Backend (Railway)

1. In Railway, click **"+ New"** → **"GitHub Repo"**
2. Select **`anesxvito/MediChat`**
3. Railway detects Node.js automatically
4. Go to **Settings**:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npx prisma migrate deploy && npm start`

5. Add **Environment Variables** (click Variables tab):
   ```
   DATABASE_URL=postgresql://... (from Step 2)
   JWT_SECRET=your-generated-secret-from-step-1
   NODE_ENV=production
   PORT=5000
   GEMINI_API_KEY=your-gemini-key
   FRONTEND_URL=https://medichat.vercel.app
   ```
   *Note: You'll update FRONTEND_URL after deploying frontend*

6. Click **"Deploy Now"**
7. Wait 2-3 minutes for deployment
8. Copy your backend URL from Railway (e.g., `https://medichat-backend-production.up.railway.app`)

---

## 🎨 Step 4: Deploy Frontend (Vercel)

1. Go to https://vercel.com/new
2. Import `anesxvito/MediChat` from GitHub
3. Configure Project:
   - **Project Name**: `medichat`
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

4. Add **Environment Variable**:
   ```
   REACT_APP_API_URL=https://your-backend-url.up.railway.app
   ```
   (Use the Railway backend URL from Step 3)

5. Click **"Deploy"**
6. Wait 2-3 minutes
7. Copy your Vercel URL (e.g., `https://medichat.vercel.app`)

---

## 🔄 Step 5: Update Backend CORS

1. Go back to Railway → Your backend service
2. Click **"Variables"**
3. Update `FRONTEND_URL` to your actual Vercel URL from Step 4
4. The backend will auto-redeploy

---

## ✅ Step 6: Test Your App!

1. Visit your Vercel URL: `https://medichat.vercel.app`
2. Click **"Register"** and create an account
3. Login and test features
4. Create both patient and admin/doctor accounts to test all features

---

## 🎯 Quick Reference

| Service | Purpose | URL |
|---------|---------|-----|
| Frontend | User Interface | `https://medichat.vercel.app` |
| Backend | API Server | `https://medichat-backend.up.railway.app` |
| Database | PostgreSQL | Railway Internal |

---

## 🐛 Troubleshooting

### Backend won't start:
```bash
# Check Railway logs (click on your backend service → Deployments → View Logs)
# Common issues:
# - DATABASE_URL not set correctly
# - Prisma migrations failed
# - Missing environment variables
```

### Frontend shows connection error:
```bash
# Check if REACT_APP_API_URL is set correctly in Vercel
# Go to Vercel → Your Project → Settings → Environment Variables
# Make sure it points to your Railway backend URL
```

### Database connection error:
```bash
# Verify DATABASE_URL format:
# Should be: postgresql://user:password@host:port/database
# Check Railway database is running (green status)
```

---

## 🔐 Security Checklist

- [ ] Changed JWT_SECRET from default
- [ ] GEMINI_API_KEY is set
- [ ] DATABASE_URL is secure (from Railway)
- [ ] FRONTEND_URL matches your Vercel domain
- [ ] .env files are NOT committed to git

---

## 💰 Cost Estimate

- **Railway**: $5 credit/month (FREE tier includes this)
  - Backend: ~$2-3/month
  - Database: ~$2-3/month
  
- **Vercel**: FREE tier
  - Unlimited deployments
  - 100GB bandwidth/month

**Total: FREE** (within free tier limits for small apps)

---

## 🔄 Future Updates

After initial deployment, any push to GitHub `main` branch auto-deploys:

```bash
# Make changes
git add .
git commit -m "Your update message"
git push origin main

# Both Railway and Vercel auto-deploy! ✨
```

---

## 📊 Monitoring

- **Railway**: https://railway.app → View logs, metrics, database stats
- **Vercel**: https://vercel.com → Analytics, deployment logs
- **Database**: Railway PostgreSQL metrics dashboard

---

## 🎉 Success Criteria

✅ Backend responding at Railway URL  
✅ Frontend loading at Vercel URL  
✅ Can register new users  
✅ Can login successfully  
✅ Socket.IO notifications working  
✅ Database queries executing  
✅ Doctor/Patient features functional  

---

## 🆘 Need Help?

1. Check Railway logs for backend errors
2. Check Vercel deployment logs for frontend errors
3. Verify all environment variables are set correctly
4. Test API endpoint directly: `https://your-backend.railway.app/api/auth/health`

---

## 🚀 Ready to Deploy?

1. Start with Step 1 (get your API keys)
2. Follow each step in order
3. Take your time - each step is important
4. Test thoroughly after deployment

**Estimated time: 15-20 minutes**

Let's go! 🎯
