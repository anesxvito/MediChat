# ⚡ MEDICHAT - QUICK START DEPLOYMENT

## 🎯 YOUR MISSION: Deploy in 15 Minutes

Your repository is ready at: **https://github.com/anesxvito/MediChat**

---

## 🚀 3-STEP DEPLOYMENT

### STEP 1: Railway (Backend + Database) - 8 min
1. Go to **https://railway.app/new**
2. Click **"Provision PostgreSQL"** → Copy `DATABASE_URL`
3. Click **"+ New"** → **"GitHub Repo"** → Select `anesxvito/MediChat`
4. Set **Root Directory** to `backend`
5. Add environment variables:
   - `DATABASE_URL` = (from step 2)
   - `JWT_SECRET` = Generate: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
   - `GEMINI_API_KEY` = Get from https://makersuite.google.com/app/apikey
   - `NODE_ENV` = `production`
   - `PORT` = `5000`
   - `FRONTEND_URL` = `https://medichat.vercel.app` (update later)
6. Click **"Deploy"** → Wait 2 min → Copy Railway URL

### STEP 2: Vercel (Frontend) - 5 min
1. Go to **https://vercel.com/new**
2. Import **`anesxvito/MediChat`**
3. Framework: **Create React App**
4. Root Directory: **`frontend`**
5. Add environment variable:
   - `REACT_APP_API_URL` = Your Railway URL from Step 1
6. Click **"Deploy"** → Wait 2 min → Copy Vercel URL

### STEP 3: Update CORS - 2 min
1. Go back to Railway → Your backend
2. Update `FRONTEND_URL` variable to your Vercel URL from Step 2
3. Save → Auto-redeploys

---

## ✅ DONE!

Visit your Vercel URL → Your app is LIVE! 🎉

**Full Guide**: Read `DEPLOYMENT_CHECKLIST.md` for detailed steps and troubleshooting.

---

## 📚 DOCUMENTATION FILES

| File | Purpose |
|------|---------|
| `DEPLOYMENT_CHECKLIST.md` | Complete step-by-step guide |
| `DEPLOY_NOW.md` | Quick deployment reference |
| `README.md` | Project overview & local setup |
| `backend/railway.json` | Railway configuration |
| `vercel.json` | Vercel configuration |

---

## 🎓 FOR YOUR PROFESSOR

**GitHub**: https://github.com/anesxvito/MediChat  
**Live Demo**: (Your Vercel URL after deployment)  
**Tech Stack**: React + Node.js + PostgreSQL + Socket.IO + Google Gemini AI  
**Deployment**: Railway (Backend) + Vercel (Frontend)  

---

## 💡 TIPS

✅ Keep Railway and Vercel dashboards open during deployment  
✅ Copy all URLs and API keys to a notepad  
✅ Test each step before moving to next  
✅ Check logs if something fails  
✅ The whole process takes 15-20 minutes  

---

**Ready? Let's deploy! 🚀**
