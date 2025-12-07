# The Himalayas - Deployment Guide

## Prerequisites

1. **Mapbox Account** (Required)
   - Sign up at [https://account.mapbox.com/](https://account.mapbox.com/)
   - Get your access token from the dashboard
   - Free tier includes 50,000 map loads/month

2. **Vercel Account**
   - Sign up at [https://vercel.com](https://vercel.com)
   - Connect your GitHub/GitLab account (recommended)

## Local Development Setup

1. **Clone and Install**
   ```bash
   cd the-himalayas
   npm install
   ```

2. **Configure Environment**
   - Copy `.env.example` to `.env`
   - Add your Mapbox token:
   ```
   VITE_MAPBOX_TOKEN=your_actual_mapbox_token_here
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173)

## Deploy to Vercel

### Method 1: GitHub Integration (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-repo-url
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Vercel will auto-detect Vite configuration

3. **Add Environment Variable**
   - In Vercel dashboard → Settings → Environment Variables
   - Add: `VITE_MAPBOX_TOKEN` = your token
   - Apply to: Production, Preview, Development

4. **Deploy**
   - Click "Deploy"
   - Future git pushes auto-deploy!

### Method 2: Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login and Deploy**
   ```bash
   vercel login
   vercel
   ```

3. **Set Environment Variable**
   ```bash
   vercel env add VITE_MAPBOX_TOKEN
   ```
   Enter your token when prompted

4. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Build Verification

Before deploying, verify your build locally:

```bash
npm run build
npm run preview
```

Expected output:
- No TypeScript errors
- Bundle size ~500-700KB (gzipped ~180KB)
- All routes working
- 3D map renders correctly

## Post-Deployment Checklist

- [ ] Home page loads with parallax
- [ ] Search functionality works
- [ ] Map page shows 3D terrain
- [ ] Clicking markers opens location details
- [ ] All routes navigate correctly
- [ ] Mobile responsive design works
- [ ] Error boundaries catch errors gracefully

## Performance Optimization

The app is configured with:
- ✅ Lazy loading for all pages
- ✅ Code splitting (separate chunks for Mapbox, React, animations)
- ✅ Minification and tree-shaking
- ✅ Console logs removed in production
- ✅ Optimized dependencies

## Troubleshooting

### Map not loading
- Check if `VITE_MAPBOX_TOKEN` environment variable is set
- Verify token is valid at mapbox.com
- Check browser console for errors

### Build fails
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Routes not working on Vercel
- Ensure `vercel.json` exists (already configured)
- Check rewrite rules in Vercel dashboard

## Monitoring

- Vercel Analytics: Enable in dashboard for traffic insights
- Error tracking: Integrated ErrorBoundary logs to console
- Consider adding Sentry for production error monitoring

## Cost Estimates

- **Vercel**: Free tier (Hobby plan)
- **Mapbox**: Free up to 50k loads/month
- **Total**: $0/month for hobby projects

## Need Help?

- Vercel Docs: [https://vercel.com/docs](https://vercel.com/docs)
- Mapbox GL JS: [https://docs.mapbox.com/mapbox-gl-js](https://docs.mapbox.com/mapbox-gl-js)
