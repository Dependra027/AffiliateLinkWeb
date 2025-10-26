# 🚀 Quick Start: Deploy via GitHub

Follow these steps to deploy your TrackLytics app to production.

## 📝 Step 1: Commit Your Changes

```bash
# Add all changes
git add .

# Commit with a message
git commit -m "Prepare for production deployment"

# Push to GitHub
git push origin main
```

## 🎯 Step 2: Deploy Backend (Render)

### 2.1 Go to Render
1. Visit https://render.com
2. Sign up/Login with GitHub
3. Click "New +" → "Web Service"

### 2.2 Connect Repository
- Select your GitHub repository
- Choose "Connect"

### 2.3 Configure Backend Service
- **Name**: `tracklytics-backend` (or your choice)
- **Region**: Choose closest to you
- **Branch**: `main`
- **Root Directory**: Leave empty
- **Environment**: `Node`
- **Build Command**: `cd backend && npm install`
- **Start Command**: `cd backend && npm start`

### 2.4 Add Environment Variables
Click "Environment" tab and add these:

```
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_key_here_use_random_string
CLIENT_URL=http://localhost:3000
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
PORT=10000
NODE_ENV=production
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### 2.5 Deploy
Click "Create Web Service" and wait for deployment (~5-10 minutes)

### 2.6 Note Your Backend URL
After deployment, copy your backend URL (e.g., `https://tracklytics-backend.onrender.com`)

---

## 🎨 Step 3: Deploy Frontend (Netlify)

### 3.1 Go to Netlify
1. Visit https://netlify.com
2. Sign up/Login with GitHub
3. Click "Add new site" → "Import an existing project"

### 3.2 Connect Repository
- Select your GitHub repository
- Click "Connect"

### 3.3 Configure Build Settings

**Build settings:**
- **Base directory**: Leave empty
- **Build command**: `cd frontend && npm install && npm run build`
- **Publish directory**: `frontend/build`

### 3.4 Add Environment Variable

Click "Show advanced" → "New variable":

```
Name: REACT_APP_API_URL
Value: https://your-backend-url.onrender.com/api
```

Replace `your-backend-url` with your actual Render backend URL from Step 2.6!

### 3.5 Deploy
Click "Deploy site" and wait for deployment (~3-5 minutes)

### 3.6 Get Your Frontend URL
After deployment, your site will be live at something like `https://random-name-123.netlify.app`

---

## 🔗 Step 4: Connect Frontend to Backend

### 4.1 Update Backend CORS
1. Go back to Render → Your backend service
2. Click "Environment" tab
3. Update `CLIENT_URL` to your Netlify frontend URL:
   ```
   CLIENT_URL=https://your-frontend-url.netlify.app
   ```
4. Save and wait for redeployment (~2 minutes)

### 4.2 Update MongoDB Atlas Whitelist (if needed)
1. Go to MongoDB Atlas → Network Access
2. Make sure `0.0.0.0/0` is whitelisted (allows all IPs)
3. This is required for Render to connect to your database

---

## ✅ Step 5: Test Your Deployment

Visit your Netlify URL and test:
- [ ] Can visit the homepage
- [ ] Can register a new account
- [ ] Can login
- [ ] Can create links
- [ ] Links are saved to database

---

## 🎉 You're Done!

Your app is now live and will automatically redeploy whenever you push to GitHub!

### URLs You'll Need:
- **Frontend**: Your Netlify URL
- **Backend API**: Your Render URL + `/api` (e.g., `https://tracklytics-backend.onrender.com/api`)

---

## 🔄 Making Updates

When you want to update your app:
```bash
# Make your changes
# Then commit and push
git add .
git commit -m "Describe your changes"
git push origin main
```

Both Netlify and Render will automatically redeploy! ✨

---

## 🆘 Troubleshooting

### Frontend shows "Cannot connect to API"
- Check that `REACT_APP_API_URL` is set correctly in Netlify
- Make sure the value includes `/api` at the end
- Redeploy the frontend after changing environment variables

### Backend returns 500 errors
- Check Render logs for errors
- Verify all environment variables are set
- Make sure MongoDB Atlas whitelist includes Render's IPs

### Login/Registration not working
- Check Render logs for errors
- Verify JWT_SECRET is set
- Check CORS settings

---

## 💡 Pro Tips

1. **Monitor Logs**: Always check logs in Render/Netlify dashboards when debugging
2. **Use Custom Domains**: Configure your own domain in Netlify/Render settings
3. **Enable 2FA**: Secure your GitHub account
4. **Database**: Keep your MongoDB Atlas database secure
5. **Environment Variables**: Never commit secrets to GitHub

---

**Need help?** Check the full deployment guide in `GITHUB_DEPLOYMENT.md`

