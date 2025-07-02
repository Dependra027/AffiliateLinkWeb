# 🔧 Troubleshooting Login Server Error

## 🚨 Common Issues and Solutions

### 1. Environment Variables Not Set in Vercel

**Problem**: Your backend can't connect to MongoDB or other services because environment variables are missing.

**Solution**:
1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add these variables:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/link-manager?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_key_here
   EMAIL_USER=your_gmail@gmail.com
   EMAIL_PASS=your_gmail_app_password
   CLIENT_URL=https://your-vercel-domain.vercel.app
   NODE_ENV=production
   ```

### 2. MongoDB Connection Issues

**Problem**: Database connection fails in production.

**Solution**:
1. Check your MongoDB Atlas connection string
2. Ensure your IP whitelist includes `0.0.0.0/0` (all IPs)
3. Verify the database name and credentials

### 3. CORS Issues

**Problem**: Frontend can't communicate with backend due to CORS restrictions.

**Solution**:
- The updated server.js now has more flexible CORS configuration
- Make sure your CLIENT_URL environment variable is set correctly

### 4. API Endpoint Issues

**Problem**: Frontend making requests to wrong endpoints.

**Solution**:
- Frontend should use `/api/auth/login` (axios baseURL handles this)
- Check browser console for actual request URLs

## 🧪 Testing Your Deployment

### Step 1: Test Health Endpoint
Visit: `https://your-domain.vercel.app/api/health`
Should return: `{"message":"Server is running","timestamp":"...","environment":"production"}`

### Step 2: Test API with Script
1. Update the domain in `test-api.js`
2. Run: `node test-api.js`
3. Check the output for any errors

### Step 3: Check Browser Console
1. Open your deployed app
2. Open browser developer tools (F12)
3. Go to Console tab
4. Try to login and check for error messages

## 🔍 Debugging Steps

### 1. Check Vercel Function Logs
1. Go to Vercel dashboard
2. Select your project
3. Go to Functions tab
4. Check for any error logs

### 2. Verify Environment Variables
1. In Vercel dashboard, go to Settings → Environment Variables
2. Ensure all required variables are set
3. Redeploy after adding variables

### 3. Test Database Connection
Add this to your server.js temporarily:
```javascript
app.get('/api/test-db', async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.json({ message: 'Database connected' });
  } catch (error) {
    res.status(500).json({ message: 'Database error', error: error.message });
  }
});
```

### 4. Check Network Tab
1. Open browser developer tools
2. Go to Network tab
3. Try to login
4. Check the actual request/response

## 🚀 Quick Fix Checklist

- [ ] Environment variables set in Vercel
- [ ] MongoDB Atlas connection string correct
- [ ] IP whitelist includes all IPs (0.0.0.0/0)
- [ ] Redeployed after environment variable changes
- [ ] Checked Vercel function logs
- [ ] Tested health endpoint
- [ ] Verified CORS configuration

## 📞 Getting More Help

If the issue persists:
1. Check Vercel function logs for specific error messages
2. Test the API endpoints manually
3. Verify all environment variables are set correctly
4. Check if MongoDB Atlas is accessible from Vercel's servers

## 🔄 Redeploy After Changes

After making any changes:
1. Commit and push to GitHub
2. Vercel will automatically redeploy
3. Wait for deployment to complete
4. Test the endpoints again 