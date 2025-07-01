# 🚀 Vercel Deployment Guide

This guide will help you deploy your Link Manager project to Vercel with automatic updates.

## 📋 Prerequisites

1. **GitHub Account** - Your code should be in a GitHub repository
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **MongoDB Atlas** - For production database (free tier available)

## 🔧 Step 1: Prepare Your Database

### Set up MongoDB Atlas (Production Database)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Add your IP address to the whitelist (or use 0.0.0.0/0 for all IPs)

## 🚀 Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account
   - Click "New Project"
   - Import your GitHub repository

3. **Configure the project**
   - **Framework Preset**: Other
   - **Root Directory**: `./` (root of your project)
   - **Build Command**: Leave empty (Vercel will auto-detect)
   - **Output Directory**: Leave empty

4. **Set Environment Variables**
   Click "Environment Variables" and add:
   ```
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_jwt_secret_key
   EMAIL_USER=your_gmail_address
   EMAIL_PASS=your_gmail_app_password
   CLIENT_URL=https://your-vercel-domain.vercel.app
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Follow the prompts**
   - Link to existing project or create new
   - Set environment variables when prompted

## ⚙️ Step 3: Configure Environment Variables

In your Vercel dashboard, go to your project settings and add these environment variables:

### Required Variables:
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/link-manager?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
CLIENT_URL=https://your-vercel-domain.vercel.app
```

### Optional Variables:
```
NODE_ENV=production
```

## 🔄 Step 4: Automatic Deployment Setup

Once deployed, Vercel will automatically:
- ✅ Deploy new versions when you push to GitHub
- ✅ Create preview deployments for pull requests
- ✅ Rollback to previous versions if needed

## 🧪 Step 5: Test Your Deployment

1. **Test the API**
   - Visit: `https://your-domain.vercel.app/api/health`
   - Should return: `{"message":"Server is running","timestamp":"..."}`

2. **Test the Frontend**
   - Visit: `https://your-domain.vercel.app`
   - Should show your Link Manager homepage

3. **Test User Registration**
   - Try registering a new user
   - Check if emails are sent

## 🔧 Troubleshooting

### Common Issues:

1. **Build Fails**
   - Check the build logs in Vercel dashboard
   - Ensure all dependencies are in package.json

2. **Database Connection Issues**
   - Verify MONGO_URI is correct
   - Check MongoDB Atlas IP whitelist

3. **Email Not Working**
   - Verify EMAIL_USER and EMAIL_PASS
   - Check Gmail app password setup

4. **CORS Issues**
   - Verify CLIENT_URL matches your Vercel domain

### Getting Help:
- Check Vercel build logs
- Check browser console for errors
- Verify environment variables are set correctly

## 📈 Step 6: Monitor Your App

- **Vercel Analytics**: Built-in performance monitoring
- **Function Logs**: Check serverless function logs
- **Real-time Deployments**: Watch deployments in real-time

## 🎉 You're Done!

Your Link Manager is now live with automatic deployments! Every time you push code to GitHub, your site will automatically update.

### Next Steps:
1. Set up a custom domain (optional)
2. Configure monitoring and alerts
3. Set up staging environment
4. Add CI/CD tests

---

**Need help?** Check the Vercel documentation or reach out for support! 