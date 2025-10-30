# 🎯 FREE DEPLOYMENT - MediChat
## Railway ($5 credit/month = FREE) + Vercel (Always FREE)

---

## ⚡ FASTEST WAY (5 Minutes Total)

### Step 1: Railway - Backend + Database (3 min)

1. **Go to**: https://railway.app/new
2. Click **"Provision PostgreSQL"** → Copy the `DATABASE_URL`
3. Click **"+ New"** → **"GitHub Repo"** → Select `anesxvito/MediChat`
4. **Settings**:
   - Root Directory: `backend`
   - Build: `npm install && npx prisma generate`
   - Start: `npx prisma migrate deploy && npm start`
5. **Variables** (click "Variables" tab):
   ```
   DATABASE_URL = (paste from step 2)
   JWT_SECRET = (run: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
   GEMINI_API_KEY = (get from: https://makersuite.google.com/app/apikey)
   NODE_ENV = production
   PORT = 5000
   FRONTEND_URL = https://medichat.vercel.app
   ```
6. Click **"Deploy"** → Copy your Railway URL (e.g., `https://xxx.up.railway.app`)

---

### Step 2: Vercel - Frontend (2 min)

1. **Go to**: https://vercel.com/new
2. Import **`anesxvito/MediChat`**
3. **Settings**:
   - Framework: Create React App
   - Root Directory: `frontend`
4. **Environment Variable**:
   ```
   REACT_APP_API_URL = (your Railway URL from Step 1)
   ```
5. Click **"Deploy"** → Copy your Vercel URL

---

### Step 3: Update CORS (30 sec)

1. Go back to Railway → Variables
2. Update `FRONTEND_URL` to your Vercel URL
3. Done! ✅

---

## 💰 COST

- **Railway**: $5 credit/month (FREE - covers backend + database)
- **Vercel**: Always FREE
- **Total**: **$0/month** 🎉

---

## 🎯 Your Live URLs

- Frontend: `https://medichat.vercel.app`
- Backend: `https://your-backend.up.railway.app`

**That's it! No credit card needed for the first month.**

---

## 🆘 Alternative: 100% Free Forever

If you want NO costs ever, use **Render's free tier** (but slower):

1. Create PostgreSQL on Render (free tier)
2. Create 2 Web Services:
   - Backend: Root=`backend`, connects to DB
   - Frontend: Static Site, Root=`frontend/build`

**Note**: Render free tier spins down after 15min inactivity (slower first load).

**Railway is MUCH faster and gives you $5/month free credit.**
