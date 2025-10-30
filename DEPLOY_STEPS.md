# 🚀 Deploy MediChat for FREE - Step by Step

Follow these exact steps. Takes ~5 minutes. **Cost: $0/month**

---

## 📋 What You Need Before Starting

1. **Your GitHub**: Already done ✅ (https://github.com/anesxvito/MediChat)
2. **Google Gemini API Key**: Get from https://aistudio.google.com/app/apikey
   - Click "Create API Key"
   - Copy the key (starts with `AIza...`)

---

## 🎯 STEP 1: Deploy Backend on Railway (2 minutes)

### 1.1 Create Railway Account
1. Go to https://railway.app
2. Click **"Login"** → Sign in with GitHub
3. Authorize Railway to access your GitHub

### 1.2 Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose **`anesxvito/MediChat`**
4. Railway will start deploying automatically

### 1.3 Add PostgreSQL Database
1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway automatically connects it to your backend ✅

### 1.4 Add Environment Variables
1. Click on your **`MediChat`** service (the backend)
2. Go to **"Variables"** tab
3. Click **"+ New Variable"** and add these:

   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   JWT_SECRET=your-super-secret-key-change-this-in-production
   NODE_ENV=production
   ```

4. Click **"Deploy"** (Railway will redeploy with new variables)

### 1.5 Get Your Backend URL
1. Go to **"Settings"** tab
2. Scroll to **"Networking"**
3. Click **"Generate Domain"**
4. Copy the URL (looks like: `https://medichat-production-xxxx.up.railway.app`)
5. **SAVE THIS URL** - you need it for Step 2!

---

## 🎨 STEP 2: Deploy Frontend on Vercel (2 minutes)

### 2.1 Create Vercel Account
1. Go to https://vercel.com
2. Click **"Sign Up"** → Continue with GitHub
3. Authorize Vercel to access your GitHub

### 2.2 Import Project
1. Click **"Add New..."** → **"Project"**
2. Find **`anesxvito/MediChat`** in the list
3. Click **"Import"**

### 2.3 Configure Project
1. **Framework Preset**: Auto-detected as "Create React App" ✅
2. **Root Directory**: Click "Edit" → Type `frontend` → Save
3. **Build Command**: Leave as default (`npm run build`)
4. **Output Directory**: Leave as default (`build`)

### 2.4 Add Environment Variable
1. Expand **"Environment Variables"** section
2. Add this variable:
   ```
   Name: REACT_APP_API_URL
   Value: https://your-railway-url-from-step-1.up.railway.app
   ```
   ⚠️ **IMPORTANT**: Replace with YOUR Railway URL from Step 1.5!

3. Click **"Deploy"**

### 2.5 Get Your Frontend URL
1. Wait ~2 minutes for build to complete
2. Vercel shows your live URL (looks like: `https://medi-chat-xxxx.vercel.app`)
3. Click the URL to open your app! 🎉

---

## ✅ STEP 3: Test Your Deployment (1 minute)

1. Open your Vercel URL in a browser
2. Click **"Register"** → Create an account
3. Login with your new account
4. Try sending a message in the chatbot
5. Check if admin dashboard works

### If something doesn't work:
- **Backend logs**: Go to Railway → Your project → "Deployments" → Click latest → See logs
- **Frontend logs**: Go to Vercel → Your project → "Deployments" → Click latest → See logs

---

## 💰 Cost Breakdown

| Service | What It Does | Cost |
|---------|--------------|------|
| **Railway** | Backend + PostgreSQL | $5 free credit/month ✅ |
| **Vercel** | Frontend hosting | Always FREE ✅ |
| **Total** | Everything | **$0/month** ✅ |

Railway's $5 credit covers your entire backend usage. Small apps like MediChat use ~$2-3/month, so you're covered!

---

## 🔧 Post-Deployment Updates

When you push new code to GitHub:
- **Railway**: Auto-deploys backend (within 2 minutes)
- **Vercel**: Auto-deploys frontend (within 2 minutes)

No manual work needed! 🚀

---

## 📝 Your URLs (Fill These In)

After deployment, write your URLs here:

```
Backend (Railway):  https://_____________________________.up.railway.app
Frontend (Vercel):  https://_____________________________.vercel.app
Database:           Managed by Railway (auto-connected)
```

---

## ❓ Troubleshooting

### "Cannot connect to backend"
- Check if Railway service is running (should show green "Active")
- Verify `REACT_APP_API_URL` in Vercel matches your Railway URL
- Make sure Railway URL doesn't have trailing slash

### "Database connection error"
- Railway should auto-connect PostgreSQL
- Check Railway logs: Does it say "Connected to database"?
- If not, in Railway: Click PostgreSQL → "Variables" → Copy `DATABASE_URL` → Add to backend variables

### "Gemini API not working"
- Check your API key is correct in Railway variables
- Visit https://aistudio.google.com/app/apikey - Is the key still active?

---

## 🎉 Done!

Your MediChat is now live at **$0/month**. Share your Vercel URL with users!

Questions? Check the logs on Railway/Vercel or reply here.
