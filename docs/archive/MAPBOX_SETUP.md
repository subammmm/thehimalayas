# 🗺️ 3D Map Setup Guide - Premium Mapbox GL JS

## Current Status
✅ **Working**: Basic 2D Leaflet map (temporary, loads now)
🎯 **Best Option**: Mapbox GL JS with 3D terrain (needs your token)

---

## Get Your FREE Mapbox Token (5 min)

### Step 1: Create Account
1. Go to: https://account.mapbox.com/auth/signup/
2. Sign up (free tier = 50,000 map loads/month - plenty for research)
3. Verify email

### Step 2: Get Token
1. After login, you'll see your **Default Public Token**
2. Copy it (starts with `pk.eyJ1...`)

### Step 3: Add to Project
```bash
# Edit the .env file:
VITE_MAPBOX_TOKEN=pk.YOUR_TOKEN_HERE
```

### Step 4: Restart Dev Server
```bash
# In terminal: Ctrl+C then:
npm run dev
```

---

## What You'll Get

### With Mapbox GL JS:
- ✅ **Photorealistic 3D terrain** (actual satellite imagery)
- ✅ **Real elevation data** for Himalayas
- ✅ **Smooth camera controls** (pitch, rotate, zoom)
- ✅ **Custom styled markers** by location type
- ✅ **Professional quality** (used by NYTimes, Airbnb, etc.)
- ✅ **Fast performance** even with 100+ locations

### vs Current Leaflet:
- ❌ Flat 2D only
- ❌ Basic OpenStreetMap tiles
- ❌ No terrain visualization
- ✅ Works immediately (no token)

---

## File to Use

Once you add the token, I'll switch from:
- `MapCanvas.tsx` (Leaflet 2D) 
- → `MapboxCanvas.tsx` (Mapbox 3D) ✨

The component is already created and ready!

---

## Questions?

**Q: Is it really free?**  
A: Yes! 50k loads/month free forever. You'll never hit that for research.

**Q: Do I need a credit card?**  
A: No for free tier.

**Q: How long to set up?**  
A: 5 minutes max.

---

Ready when you are! Just drop your token in `.env` and let me know.
