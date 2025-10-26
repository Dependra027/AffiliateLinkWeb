# Fix: Tracking URLs Not Working

## Problem
Your tracking URLs are pointing to the wrong backend. They should point to Render, not Netlify.

**Current (Wrong):** `https://tracklyt.netlify.app/api/links/t/Luth`  
**Should be:** `https://affiliatelinkweb.onrender.com/api/links/t/Luth`

## Solution: Add BACKEND_URL to Render

You need to add the `BACKEND_URL` environment variable to Render so your backend knows its own URL.

### Steps:

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click on your backend service (`affiliatelinkweb`)
3. Go to **Environment** tab
4. Click **Add Environment Variable**

### Add this variable:

**Variable Name:** `BACKEND_URL`  
**Value:** `https://affiliatelinkweb.onrender.com`

⚠️ **Important:** Make sure the value:
- Uses `https://`
- Does NOT include `/api` at the end
- Matches your actual Render backend URL

5. Click **Save Changes**
6. Wait for Render to redeploy (~2-3 minutes)

---

## Verify the Fix

After adding the variable and redeploying:

1. Go to your site: https://tracklyt.netlify.app
2. Login
3. Create a new link or check an existing one
4. The tracking URL should now be: `https://affiliatelinkweb.onrender.com/api/links/t/YOUR_CODE`
5. When you visit the tracking URL, it should redirect to the original link

---

## Why This Works

Your backend code in `linkController.js` generates tracking URLs like this:

```javascript
const baseUrl = process.env.NODE_ENV === 'production' 
  ? (process.env.BACKEND_URL || 'https://your-backend-url.herokuapp.com')
  : 'http://localhost:5000';
const trackingUrl = `${baseUrl}/api/links/t/${trackingId}`;
```

Without `BACKEND_URL` set, it falls back to a placeholder URL, which causes incorrect tracking links.

After adding `BACKEND_URL`, your backend will generate correct tracking URLs that point to Render.

