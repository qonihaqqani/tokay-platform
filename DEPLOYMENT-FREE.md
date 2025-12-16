# 🚀 FREE & INSTANT Deployment Guide - Tokay Platform

Get your Tokay Resilience Platform live **in 15 minutes** with $0 cost using free tiers of popular services!

## 🎯 Recommended Free Stack

- **Frontend**: Vercel (Free hosting)
- **Backend**: Railway (Free hosting)
- **Database**: Supabase (Free PostgreSQL)
- **Redis**: Upstash (Free Redis)
- **Domain**: Free subdomain (.vercel.app)
- **SSL**: Automatic (Free)

## ⚡ Option 1: Quickest Deployment (10 minutes)

### Step 1: Deploy Frontend to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select `client` folder as root directory
   - Click "Deploy"

   **🎉 Your frontend is live at: `https://your-app.vercel.app`**

### Step 2: Deploy Backend to Railway

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Deploy Backend**
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Set root directory to `server`
   - Click "Deploy"

3. **Configure Environment Variables**
   - In Railway dashboard, go to your project → Settings → Variables
   - Add these variables:
   ```env
   NODE_ENV=production
   PORT=5000
   DATABASE_URL=your_supabase_url
   REDIS_URL=your_upstash_url
   JWT_SECRET=your_secret_key_here
   ```

   **🎉 Your backend is live at: `https://your-app.railway.app`**

### Step 3: Setup Free Database (Supabase)

1. **Create Supabase Account**
   - Go to [supabase.com](https://supabase.com)
   - Sign up and create new project

2. **Get Database URL**
   - In Supabase dashboard → Settings → Database
   - Copy the "Connection string"
   - Add to Railway environment variables as `DATABASE_URL`

3. **Run Migrations**
   - In Supabase dashboard → SQL Editor
   - Copy and run the SQL from `server/migrations/` files

### Step 4: Setup Free Redis (Upstash)

1. **Create Upstash Account**
   - Go to [upstash.com](https://upstash.com)
   - Sign up and create new Redis database

2. **Get Redis URL**
   - In Upstash dashboard → Details → REST URL
   - Add to Railway environment variables as `REDIS_URL`

### Step 5: Connect Frontend to Backend

1. **Update Frontend Environment**
   - In Vercel dashboard → Settings → Environment Variables
   - Add: `REACT_APP_API_URL=https://your-backend.railway.app`

2. **Redeploy Frontend**
   - Push a small change to GitHub or trigger redeploy in Vercel

## 🔧 Alternative Free Options

### Option 2: Netlify + Heroku (Free)

**Frontend**: Netlify (netlify.com)
**Backend**: Heroku (heroku.com)
**Database**: ElephantSQL (elephantsql.com - free PostgreSQL)

### Option 3: Firebase (All-in-One)

Use Firebase Hosting for frontend and Firebase Functions for backend.
**Database**: Firebase Firestore (free tier)

## 📱 Free Services & Their Limits

| Service | Free Tier | Good For |
|---------|-----------|----------|
| **Vercel** | 100GB bandwidth/month | Frontend hosting |
| **Railway** | $5 credit/month | Backend hosting |
| **Supabase** | 500MB database, 2GB bandwidth | PostgreSQL database |
| **Upstash** | 10,000 commands/day | Redis caching |
| **Netlify** | 100GB bandwidth/month | Alternative frontend |
| **Heroku** | 550 hours/month | Alternative backend |

## 🛠️ Configuration for Free Services

### Update Backend for Free Services

Create `server/config/free-services.js`:
```javascript
// Free service configurations
module.exports = {
  // Use in-memory storage for development if needed
  useInMemoryCache: process.env.REDIS_URL ? false : true,
  
  // Optimize for free tiers
  database: {
    connectionLimit: 5, // Lower for free tiers
    acquireTimeout: 60000,
    timeout: 60000,
  },
  
  // Free email service (Gmail)
  email: {
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  },
  
  // Free SMS (use email fallback for prototype)
  sms: {
    useEmailFallback: true,
  }
};
```

### Update Frontend for Free Domain

In `client/src/services/api.js`:
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://your-backend.railway.app';
```

## 🎨 Prototype-Only Modifications

### Simplify Features for Free Tier

1. **Remove expensive APIs** (use mock data for weather)
2. **Use email instead of SMS** for notifications
3. **Limit file uploads** (use free image hosting like imgur)
4. **Simplify real-time features** (polling instead of WebSockets)

### Mock Weather Data

Create `server/utils/mockWeather.js`:
```javascript
exports.getMockWeather = (location) => {
  return {
    location: location,
    temperature: 28 + Math.random() * 5,
    humidity: 70 + Math.random() * 20,
    condition: ['Partly Cloudy', 'Sunny', 'Rainy'][Math.floor(Math.random() * 3)],
    floodRisk: Math.random() > 0.7 ? 'high' : 'low'
  };
};
```

## 🚀 Instant Deploy Script

Create `deploy-free.sh`:
```bash
#!/bin/bash

echo "🚀 Deploying Tokay Platform to FREE services..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    git init
    git add .
    git commit -m "Initial commit"
fi

# Instructions for user
echo "✅ Step 1: Push to GitHub"
echo "   git remote add origin <your-github-repo>"
echo "   git push -u origin main"
echo ""
echo "✅ Step 2: Deploy Frontend"
echo "   1. Go to vercel.com"
echo "   2. Import your GitHub repo"
echo "   3. Select 'client' folder"
echo "   4. Click Deploy"
echo ""
echo "✅ Step 3: Deploy Backend"
echo "   1. Go to railway.app"
echo "   2. Import your GitHub repo"
echo "   3. Select 'server' folder"
echo "   4. Add environment variables"
echo "   5. Click Deploy"
echo ""
echo "✅ Step 4: Setup Database"
echo "   1. Go to supabase.com"
echo "   2. Create new project"
echo "   3. Copy database URL to Railway"
echo "   4. Run migrations in Supabase SQL editor"
echo ""
echo "🎉 Your Tokay Platform will be live in minutes!"
```

## 📊 What Works on Free Tier

### ✅ Fully Functional:
- User registration & login
- Business profile creation
- Risk assessment (basic)
- Emergency fund tracking
- Dashboard & analytics
- Multi-language support
- Email notifications

### ⚠️ Limited:
- SMS notifications (use email instead)
- Real-time alerts (use polling)
- File uploads (limit size)
- Advanced analytics (simplified)
- High traffic (rate limited)

## 🔄 From Prototype to Production

When you're ready to scale:
1. **Upgrade to paid plans** on the same services
2. **Migrate database** to larger instance
3. **Add real SMS** service (Twilio)
4. **Implement real-time** features with WebSocket
5. **Add custom domain** and SSL

## 🎯 You're Ready!

**Your Tokay Resilience Platform can be live in 15 minutes with $0 cost!**

The free tier is perfect for:
- ✅ Demonstrating the platform
- ✅ Getting user feedback
- ✅ Pitching to investors
- ✅ Testing with real users
- ✅ Building MVP

**Start building resilience for Malaysian MSMEs today - for free!** 🇲🇾

---

## 🆘 Need Help?

- **Vercel Docs**: vercel.com/docs
- **Railway Docs**: docs.railway.app
- **Supabase Docs**: supabase.com/docs
- **Community**: Join our Discord for help

**Remember**: The goal is to get the platform working and gathering feedback. You can always upgrade to paid plans later!