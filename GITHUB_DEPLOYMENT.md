# 🚀 GitHub Deployment Guide

This guide will help you deploy your full-stack TrackLytics application through GitHub to production platforms.

## 📋 Overview

Your application consists of:
- **Frontend**: React app in `frontend/` directory
- **Backend**: Node.js/Express API in `backend/` directory
- **Database**: MongoDB (use MongoDB Atlas for production)

## 🎯 Recommended Deployment Architecture

```
GitHub Repository
    ├── Frontend → Netlify/Vercel
    └── Backend → Render/Railway
```

## 🔧 Step 1: Prepare Your Repository

### 1.1 Commit Your Changes

```bash
git add .
git commit -m "Add cross-env for Windows compatibility"
git push origin main
```

### 1.2 Ensure `.gitignore` is Proper

Make sure sensitive files are not committed:

```
node_modules/
frontend/node_modules/
backend/node_modules/
backend/config.env
.env
*.log
.DS_Store
```

**IMPORTANT**: Never commit `backend/config.env` with real credentials! Use environment variables on your hosting platform instead.

## 🌐 Step 2: Deploy Backend (Render/Railway)

### Option A: Render (Recommended for Free Tier)

1. **Create Account**: Go to [render.com](https://render.com) and sign up with GitHub

2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure settings:
     - **Name**: `tracklytics-backend` (or your choice)
     - **Environment**: `Node`
     - **Build Command**: `cd backend && npm install`
     - **Start Command**: `cd backend && npm start`
     - **Root Directory**: Leave empty (or set to `backend`)

3. **Environment Variables**:
   Add these in Render dashboard → Environment tab:
   ```
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   CLIENT_URL=https://your-frontend-url.netlify.app
   EMAIL_USER=your_gmail@gmail.com
   EMAIL_PASS=your_gmail_app_password
   PORT=10000
   NODE_ENV=production
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   ```

4. **Deploy**: Click "Create Web Service"

5. **Copy Backend URL**: Once deployed, copy your backend URL (e.g., `https://tracklytics-backend.onrender.com`)

### Option B: Railway

1. **Create Account**: Go to [railway.app](https://railway.app)

2. **New Project**: Click "New Project" → "Deploy from GitHub repo"

3. **Select Repository**: Choose your repository

4. **Configure**:
   - Add `MONGO_URI` for MongoDB database
   - Set all environment variables (same as above)

5. **Deploy**: Railway will auto-detect Node.js and deploy

## 🎨 Step 3: Deploy Frontend

### Option A: Netlify (Recommended)

1. **Create Account**: Go to [netlify.com](https://netlify.com) and sign up with GitHub

2. **Deploy Site**:
   - Click "Add new site" → "Import an existing project"
   - Select your GitHub repository

3. **Build Settings**:
   - **Base directory**: Leave empty or `./`
   - **Build command**: `cd frontend && npm install && npm run build`
   - **Publish directory**: `frontend/build`

4. **Environment Variables** (Netlify Dashboard → Site settings → Environment variables):
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com
   ```

5. **Redirects** (already configured in `netlify.toml`):
   The file `netlify.toml` is already set up in your repo.

6. **Deploy**: Click "Deploy site"

### Option B: Vercel

1. **Create Account**: Go to [vercel.com](https://vercel.com) and sign up with GitHub

2. **New Project**:
   - Click "Add New Project"
   - Import your GitHub repository

3. **Framework Preset**: Other

4. **Build Settings**:
   - **Root Directory**: `./frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

5. **Environment Variables**:
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com
   ```

6. **Deploy**: Click "Deploy"

## 🔗 Step 4: Connect Frontend to Backend

After deploying both:

1. **Update Frontend API URL**:
   
   Option 1 - Environment Variable (Best):
   - In your Netlify/Vercel dashboard, add:
     ```
     REACT_APP_API_URL=https://your-backend-url.onrender.com
     ```
   - Redeploy the frontend

   Option 2 - Update Code:
   - Edit `frontend/src/hooks/useApi.js` (or wherever you set the base URL)
   - Change the API URL to your backend URL

2. **Update Backend CORS**:
   - Make sure your backend allows requests from your frontend domain
   - The CORS settings in `backend/server.js` should include your frontend URL

## 🧪 Step 5: Test Your Deployment

### Test Checklist:

- [ ] Frontend loads at your domain
- [ ] Can register new users
- [ ] Can login
- [ ] Email verification works
- [ ] Can create links
- [ ] Can edit/delete links
- [ ] Payment system works (if configured)
- [ ] Admin dashboard works (if applicable)

### Common Issues:

1. **CORS Errors**: 
   - Update backend `CLIENT_URL` environment variable
   - Make sure backend CORS middleware allows your frontend domain

2. **API Not Found**:
   - Check if frontend has correct `REACT_APP_API_URL`
   - Verify backend is deployed and running
   - Check browser console for errors

3. **Database Connection Issues**:
   - Verify `MONGO_URI` is correct in backend environment
   - Check MongoDB Atlas IP whitelist (should allow all IPs: `0.0.0.0/0`)

## 🔄 Step 6: Automatic Deployments

Once set up, your deployments will be automatic:

- **Frontend**: Every push to `main` branch triggers a rebuild
- **Backend**: Every push to `main` branch triggers a rebuild

### Preview Deployments:

- Netlify: Creates preview deployments for pull requests
- Vercel: Creates preview deployments for pull requests
- Render: Can be configured for staging environments

## 📝 Step 7: Custom Domain (Optional)

### Netlify:
1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Follow the DNS configuration instructions

### Vercel:
1. Go to Project settings → Domains
2. Add your domain
3. Configure DNS as instructed

### Render:
1. Go to your service → Settings
2. Click "Custom Domain"
3. Add your domain and configure DNS

## 🎯 Quick Summary

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Deploy Backend** on Render/Railway
   - Set environment variables
   - Note your backend URL

3. **Deploy Frontend** on Netlify/Vercel
   - Add `REACT_APP_API_URL` environment variable
   - Note your frontend URL

4. **Update Backend CORS** to allow your frontend domain

5. **Test everything** end-to-end

## 🚨 Important Notes

- Never commit `.env` or `config.env` files with real credentials
- Use environment variables on hosting platforms
- Keep your MongoDB Atlas database secure
- Monitor your application logs for errors
- Set up error tracking (e.g., Sentry)
- Enable 2FA on your GitHub account

## 🆘 Troubleshooting

### Backend won't start:
- Check Render/Railway logs
- Verify all environment variables are set
- Ensure MongoDB Atlas allows connections from Render's IP

### Frontend shows blank page:
- Check browser console for errors
- Verify `REACT_APP_API_URL` is set correctly
- Check Netlify/Vercel build logs

### Authentication not working:
- Verify JWT_SECRET is set in backend
- Check CORS settings
- Ensure cookies are being set properly

## 📞 Getting Help

- Check hosting platform documentation
- Review your server logs
- Test API endpoints with Postman/Thunder Client
- Check browser console for frontend errors

---

**Your app is now live! 🎉** Every time you push to GitHub, it will automatically redeploy.

