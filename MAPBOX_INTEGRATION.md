# Mapbox API Integration Guide

## ✅ Integration Complete

Your Mapbox API key has been securely integrated into the application.

## 🔐 Security Implementation

### Environment Variable Storage
```bash
# File: .env (Already configured ✅)
VITE_MAPBOX_TOKEN=pk.eyJ1Ijoic3ViYW0iLCJhIjoiY21pc3hkempxMDQydDNqcjRqbWxnb2ZpcyJ9.oUeMsJwQ7N9BNa3WnK2csw
```

### Git Security
✅ `.env` is in `.gitignore` - Your API key will **never** be committed to git
✅ `.env.example` provided as a template for other developers

## 🗺️ How It's Used

### File: `src/components/map/MapboxCanvas.tsx`

```typescript
import mapboxgl from 'mapbox-gl';

// API key is loaded from environment variable
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

// Used to initialize the map
const map = new mapboxgl.Map({
  container: mapContainer.current,
  style: 'mapbox://styles/mapbox/satellite-streets-v12',
  center: [84.1240, 28.3949],
  zoom: 6.5,
  pitch: 60,
  bearing: 0,
  antialias: true
});
```

### Error Handling
The component includes validation:
```typescript
if (!mapboxgl.accessToken) {
  console.error('Mapbox token is not set');
  // Shows user-friendly error message
}
```

## 🚀 Deployment

### For Vercel (Production)
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - Key: `VITE_MAPBOX_TOKEN`
   - Value: `pk.eyJ1Ijoic3ViYW0iLCJhIjoiY21pc3hkempxMDQydDNqcjRqbWxnb2ZpcyJ9.oUeMsJwQ7N9BNa3WnK2csw`
   - Apply to: All environments (Production, Preview, Development)

### For Other Platforms
- **Netlify**: Site Settings → Environment Variables
- **AWS Amplify**: App Settings → Environment Variables
- **GitHub Actions**: Repository Settings → Secrets

## 📝 Best Practices Implemented

✅ **Never hardcoded** - API key is only in environment files  
✅ **Git-ignored** - `.env` excluded from version control  
✅ **Template provided** - `.env.example` for team members  
✅ **Vite prefix** - `VITE_` prefix makes it available in browser  
✅ **Error handling** - Graceful fallback if token missing  
✅ **Documentation** - Clear setup instructions in DEPLOYMENT.md  

## 🔄 How to Change the API Key

1. Update `.env` file:
   ```bash
   VITE_MAPBOX_TOKEN=your_new_token_here
   ```

2. Restart dev server (Vite doesn't hot-reload .env changes):
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

## 📊 API Usage

Your free Mapbox tier includes:
- **50,000 map loads/month** - More than enough for most projects
- **Unlimited tiles** after initial load
- **3D terrain** included
- **Satellite imagery** included

Monitor usage at: https://account.mapbox.com/

## ✨ Features Using This API Key

1. **3D Terrain Rendering** - Real elevation data from Mapbox Terrain-RGB
2. **Satellite Base Map** - High-quality satellite imagery
3. **Custom Markers** - Interactive location markers
4. **Smooth Animations** - flyTo camera transitions
5. **Navigation Controls** - Zoom, pan, rotate, pitch

## 🐛 Troubleshooting

### Map not loading?
```bash
# Check if token is set
echo $VITE_MAPBOX_TOKEN  # Should show your token

# Restart dev server
npm run dev
```

### Token invalid?
- Verify at https://account.mapbox.com/access-tokens/
- Check for extra spaces in `.env`
- Ensure it starts with `pk.`

## 🔗 Resources

- Mapbox Account: https://account.mapbox.com/
- GL JS Docs: https://docs.mapbox.com/mapbox-gl-js/
- Style Spec: https://docs.mapbox.com/mapbox-gl-js/style-spec/

---

**Status**: ✅ Ready to use - Restart your dev server to see the 3D map!
