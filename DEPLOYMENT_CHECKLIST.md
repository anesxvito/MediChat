# 🎯 DEPLOYMENT CHECKLIST - MediChat

## ✅ Pre-Deployment Checklist

- [x] Code pushed to GitHub: `https://github.com/anesxvito/MediChat`
- [x] Railway configuration added (`backend/railway.json`)
- [x] Vercel configuration added (`vercel.json`)
- [x] Environment variable examples created
- [x] Deployment documentation ready
- [ ] API keys obtained (complete steps below)
- [ ] Railway account created
- [ ] Vercel account created

---

## 🚀 DEPLOYMENT STEPS

### 📝 Step 0: Get Your API Keys (5 minutes)

#### 1. JWT Secret (Generate Now)
```bash
# Run this command in your terminal:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Copy the output - this is your JWT_SECRET
```

#### 2. Google Gemini API Key
1. Go to: https://makersuite.google.com/app/apikey
2. Click **"Create API Key"**
3. Copy the key (starts with `AIzaSy...`)

---

### 🗄️ Step 1: Deploy Database (3 minutes)

1. **Go to Railway**: https://railway.app/new
2. Click **"Provision PostgreSQL"**
3. Wait 30 seconds for provisioning
4. Click on your database → **"Connect"** tab
5. Copy the **`DATABASE_URL`** (the entire postgres:// string)
6. **Save it** - you'll need this in Step 2

Example format:
```
postgresql://postgres:RANDOM_PASSWORD@containers-us-west-XX.railway.app:5432/railway
```

---

### 🔧 Step 2: Deploy Backend (5 minutes)

1. **In Railway**, click **"+ New"** → **"GitHub Repo"**

2. **Authorize GitHub** if needed

3. **Select Repository**: `anesxvito/MediChat`

4. **Railway auto-detects Node.js** ✅

5. **Configure Settings**:
   - Click **Settings** (left sidebar)
   - **Root Directory**: Enter `backend`
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npx prisma migrate deploy && npm start`

6. **Add Environment Variables**:
   Click **"Variables"** tab and add these **ONE BY ONE**:

   | Variable Name | Value | Where to Get It |
   |--------------|-------|-----------------|
   | `DATABASE_URL` | `postgresql://...` | From Step 1 |
   | `JWT_SECRET` | `your-generated-secret` | From Step 0 |
   | `GEMINI_API_KEY` | `AIzaSy...` | From Step 0 |
   | `NODE_ENV` | `production` | Just type it |
   | `PORT` | `5000` | Just type it |
   | `FRONTEND_URL` | `https://medichat.vercel.app` | Temporary (update after Step 3) |

7. **Deploy**:
   - Click **"Deploy"** (top right)
   - Wait 2-3 minutes for build
   - Check **"Deployments"** tab for progress

8. **Get Your Backend URL**:
   - Once deployed, click **"Settings"**
   - Find **"Domains"** section
   - Copy the URL (e.g., `medichat-backend-production.up.railway.app`)
   - **Add `https://`** in front
   - **Save this URL** - you need it for Step 3!

---

### 🎨 Step 3: Deploy Frontend (4 minutes)

1. **Go to Vercel**: https://vercel.com/new

2. **Import from GitHub**:
   - Click **"Import Git Repository"**
   - Select `anesxvito/MediChat`
   - Authorize if needed

3. **Configure Project**:
   - **Project Name**: `medichat` (or anything you want)
   - **Framework Preset**: Select **"Create React App"**
   - **Root Directory**: Click **"Edit"** → Enter `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

4. **Add Environment Variable**:
   - Click **"Environment Variables"**
   - Add ONE variable:
     - **Name**: `REACT_APP_API_URL`
     - **Value**: Your Railway backend URL from Step 2 (e.g., `https://medichat-backend-production.up.railway.app`)

5. **Deploy**:
   - Click **"Deploy"**
   - Wait 2-3 minutes
   - Vercel will show you progress

6. **Get Your Frontend URL**:
   - Once deployed, you'll see: "Your project is ready!"
   - Copy the Vercel URL (e.g., `https://medichat.vercel.app` or `https://medichat-xxx.vercel.app`)
   - **This is your live app URL! 🎉**

---

### 🔄 Step 4: Update Backend CORS (2 minutes)

1. **Go back to Railway**

2. **Click on your backend service**

3. **Go to "Variables" tab**

4. **Find `FRONTEND_URL`**

5. **Click "Edit"**

6. **Update with your actual Vercel URL** from Step 3
   - Example: `https://medichat-xxx.vercel.app`

7. **Save**

8. **Railway will auto-redeploy** (wait 1-2 minutes)

---

## ✅ Step 5: TEST YOUR APP! (3 minutes)

1. **Open your Vercel URL** in browser
   - Example: `https://medichat-xxx.vercel.app`

2. **Test Registration**:
   - Click **"Register"**
   - Create a **patient account**
   - Fill in all fields
   - Click **"Register"**

3. **Test Login**:
   - Login with your credentials

4. **Test Chatbot**:
   - Click **"Start Conversation"**
   - Send a message: "I have a headache"
   - Wait for AI response (should take 2-5 seconds)

5. **Test Doctor Features**:
   - Logout
   - Register a **doctor account**
   - Login as doctor
   - You should see dashboard

---

## 🎯 SUCCESS CRITERIA

✅ **Backend Working**:
- Railway deployment shows "Active" status
- Can access: `https://your-backend.railway.app/api/health` (might not exist, that's ok)

✅ **Frontend Working**:
- Vercel deployment shows "Ready"
- Website loads at your Vercel URL
- No console errors (press F12 → Console tab)

✅ **Database Working**:
- Can register new users
- Data persists after refresh

✅ **AI Working**:
- Chatbot responds to messages
- Responses are relevant and intelligent

✅ **Real-time Working**:
- Notifications appear (test with 2 browser windows)
- Doctor responses update patient dashboard

---

## 🐛 TROUBLESHOOTING

### ❌ Backend won't deploy
**Solution**:
1. Check Railway logs: Click service → "Deployments" → Latest deployment → "View logs"
2. Common fixes:
   - Verify `DATABASE_URL` is correct (should start with `postgresql://`)
   - Check all environment variables are set
   - Ensure `Root Directory` is `backend`

### ❌ Frontend shows "Cannot connect to server"
**Solution**:
1. Check Vercel logs: Project → Settings → "View Function Logs"
2. Verify `REACT_APP_API_URL` points to Railway backend
3. Make sure Railway backend URL has `https://` prefix
4. Redeploy frontend: Vercel → Deployments → "Redeploy"

### ❌ Login fails / 401 Unauthorized
**Solution**:
1. Clear browser cookies/cache
2. Check `JWT_SECRET` is set in Railway variables
3. Verify `FRONTEND_URL` matches your Vercel URL exactly

### ❌ Chatbot not responding
**Solution**:
1. Verify `GEMINI_API_KEY` is set correctly
2. Check Railway logs for API errors
3. Test API key at: https://makersuite.google.com/app/apikey

### ❌ Database errors
**Solution**:
1. Check Railway PostgreSQL is "Active"
2. Verify `DATABASE_URL` format is correct
3. Run migrations manually (see Advanced section below)

---

## 🔍 ADVANCED: Manual Database Migration

If database isn't working:

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**:
   ```bash
   railway login
   ```

3. **Link to your project**:
   ```bash
   cd ~/MediChat/backend
   railway link
   ```

4. **Run migrations**:
   ```bash
   railway run npx prisma migrate deploy
   railway run npx prisma db seed
   ```

---

## 📊 MONITORING YOUR APP

### Railway Backend
- **Logs**: Railway → Service → Deployments → View Logs
- **Metrics**: Service → Metrics tab
- **Database**: PostgreSQL service → Metrics

### Vercel Frontend
- **Deployments**: Project → Deployments
- **Logs**: Deployments → Click deployment → "View Function Logs"
- **Analytics**: Project → Analytics

### Database
- **Railway Dashboard**: PostgreSQL → Metrics
- **Prisma Studio** (local):
  ```bash
  cd backend
  railway run npx prisma studio
  ```

---

## 💰 COST ESTIMATE

| Service | Free Tier | Paid (if needed) |
|---------|-----------|------------------|
| **Railway** | $5 credit/month | $0.000463/GB-hour |
| **Vercel** | Unlimited deployments | Free for hobby projects |
| **PostgreSQL** | Included in Railway | ~$2-5/month |
| **Total** | **FREE** (within limits) | ~$5-10/month if scaling |

**Your app will run FREE for at least 1 month on Railway's $5 credit!**

---

## 🎉 DEPLOYMENT COMPLETE!

Your MediChat app is now LIVE at:
- 🌐 **Frontend**: `https://your-app.vercel.app`
- 🔧 **Backend**: `https://your-backend.railway.app`
- 🗄️ **Database**: Railway PostgreSQL

### Share Your App:
- ✅ Share Vercel URL with users
- ✅ Show to your professor
- ✅ Add to your portfolio
- ✅ Put on resume!

---

## 📱 NEXT STEPS

1. **Custom Domain** (Optional):
   - Vercel: Settings → Domains → Add your domain
   - Railway: Settings → Networking → Add custom domain

2. **Environment Secrets**:
   - Rotate `JWT_SECRET` periodically
   - Don't share API keys publicly

3. **Monitoring**:
   - Check Railway logs daily
   - Monitor Vercel analytics

4. **Updates**:
   - Push to GitHub → Auto-deploys! 🚀
   - `git push origin main` → Both services update automatically

---

## 🆘 NEED HELP?

1. **Check logs first**:
   - Railway: Service → Deployments → View Logs
   - Vercel: Deployments → Function Logs

2. **Common issues**: See Troubleshooting section above

3. **Still stuck?**:
   - Check Railway status: https://status.railway.app
   - Check Vercel status: https://vercel-status.com

---

## ⏱️ TOTAL TIME: ~15-20 MINUTES

- Step 0 (API Keys): 5 min
- Step 1 (Database): 3 min
- Step 2 (Backend): 5 min
- Step 3 (Frontend): 4 min
- Step 4 (Update CORS): 2 min
- Step 5 (Testing): 3 min

**Let's deploy! 🚀**
