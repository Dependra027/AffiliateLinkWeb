# Fix: White Screen on Website

## The white screen is likely because:

The `REACT_APP_API_URL` environment variable is not set in Netlify.

## Quick Fix:

### 1. Go to Netlify Dashboard
1. Visit https://app.netlify.com
2. Select your site (`tracklyt`)
3. Go to **Site settings** → **Environment variables**

### 2. Add the Missing Variable

Click **Add variable** and add:

- **Key:** `REACT_APP_API_URL`
- **Value:** `https://affiliatelinkweb.onrender.com/api`

⚠️ **Important:** The value must include `/api` at the end!

### 3. Redeploy

After adding the variable:
1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**
3. Wait 2-3 minutes for rebuild

---

## Alternative: Check Browser Console

If the white screen persists after setting the variable:

1. Open your website in browser: https://tracklyt.netlify.app
2. Press **F12** to open Developer Console
3. Look at the **Console** tab for red error messages
4. Share those errors here and I can help fix them

---

## Common Errors:

### Error: "Cannot read property of undefined"
**Cause:** Missing environment variable  
**Fix:** Add `REACT_APP_API_URL` as shown above

### Error: "Failed to fetch" or "Network error"
**Cause:** Backend URL is wrong or backend is down  
**Fix:** Verify backend is running at https://affiliatelinkweb.onrender.com

### Error: "Module not found"
**Cause:** Build failed  
**Fix:** Check Netlify build logs

---

## After Fix:

Once you add the environment variable and redeploy:
- Your site will load properly ✅
- Tracking URLs will work correctly ✅
- API calls will work ✅

---

## How to Check if Variable is Set:

After adding the variable in Netlify:
1. Wait for the rebuild to complete
2. Visit your site
3. If still white screen, press F12 and check console
4. The environment variable should be available to the app

