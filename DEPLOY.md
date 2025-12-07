# 🚀 Deployment Guide - Himalayas Platform

## Quick Deploy to Vercel (5 minutes)

### Step 1: Push to GitHub

I've initialized Git. Now you need to create a GitHub repo:

1. Go to: https://github.com/new
2. Name: `himalayas-research`
3. Make it **Private** (for now)
4. Click "Create repository"
5. Copy the URL (e.g., `https://github.com/YOUR_USERNAME/himalayas-research.git`)

Then run on your Mac:
```bash
cd /Users/aadarshchaudhary/.gemini/antigravity/scratch/the-himalayas
git remote add origin https://github.com/YOUR_USERNAME/himalayas-research.git
git branch -M main
git push -u origin main
```

---

### Step 2: Deploy to Vercel

1. **Go to:** https://vercel.com/new
2. **Sign in** with GitHub
3. **Import** your `himalayas-research` repository
4. **Add Environment Variable:**
   - Key: `VITE_MAPBOX_TOKEN`
   - Value: `pk.eyJ1Ijoic3ViYW0iLCJhIjoiY21pc3hkempxMDQydDNmcjRqbWxnb2ZpcyJ9.oUeMsJwQ7N9BNa3WnK2csw`
5. **Click Deploy**

**Done!** You'll get a live URL like: `https://himalayas-research.vercel.app`

---

## Working Across Laptops

**IMPORTANT:** Code is NOT automatically synced online. Here's the workflow:

### On Mac (after making changes):
```bash
git add .
git commit -m "Description of changes"
git push
```

### On Windows (to get latest):
```bash
git pull
npm install
npm run dev
```

### Auto-Deploy
Every time you `git push`, Vercel will **automatically rebuild and deploy** your site!

---

## What I've Done

✅ Initialized Git repository
✅ Made initial commit
✅ Created deployment guide

**What YOU need to do:**
1. Create GitHub repo (2 min)
2. Push code (copy commands above)
3. Deploy on Vercel (3 min)

---

## Need Help?

Tell me when you've created the GitHub repo and I'll give you the exact commands to run!
