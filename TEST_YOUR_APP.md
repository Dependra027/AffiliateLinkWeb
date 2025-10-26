# Test Your Deployment

After adding the environment variables to Render, here's what to do:

## Step 1: Wait for Render to Redeploy

Your Render backend will automatically redeploy after you added the variables. Check:
- Go to Render dashboard
- Look at the "Events" tab
- Wait until you see "Your service is live"

**Time:** ~2-3 minutes

---

## Step 2: Check Netlify Environment Variable

Make sure your Netlify frontend has this variable:

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click on your site
3. Go to **Site settings** → **Environment variables**
4. Check if `REACT_APP_API_URL` exists
5. If it's there, verify the value is: `https://affiliatelinkweb.onrender.com/api`
6. If it's missing or wrong, update it

---

## Step 3: Test Your App

### Test 1: Basic Access
1. Visit: https://tracklyt.netlify.app
2. Try to login or register
3. If it works, the frontend is connected to the backend ✅

### Test 2: Create a Link
1. Create a new link with a URL
2. Check the generated tracking URL
3. **It should now be:** `https://affiliatelinkweb.onrender.com/api/links/t/XXXXX`
4. If it still shows `tracklyt.netlify.app`, wait a bit longer for Render to redeploy

### Test 3: Test the Tracking URL
1. Copy your tracking URL
2. Open it in an incognito/private window
3. It should **redirect to your original URL**
4. The Power BI dashboard should open (not your Netlify site)

---

## Step 4: Check Render Logs

If tracking URLs still don't work:

1. Go to Render dashboard
2. Click on your backend service
3. Click **Events** or **Logs** tab
4. Look for any errors
5. Check if it shows: `Backend URL: https://affiliatelinkweb.onrender.com`

---

## Expected Behavior

### ✅ Working Correctly:
- Tracking URL: `https://affiliatelinkweb.onrender.com/api/links/t/ABC123`
- Clicking it redirects to your original URL
- Analytics are tracked

### ❌ Still Broken:
- Tracking URL: `https://tracklyt.netlify.app/api/links/t/ABC123`
- Clicking it shows your Netlify site again
- This means the variable wasn't set or Render hasn't redeployed yet

---

## If Still Not Working

1. Double-check the `BACKEND_URL` value in Render
2. Make sure it's exactly: `https://affiliatelinkweb.onrender.com`
3. No trailing slashes
4. No `/api` at the end
5. Wait 5 minutes for full redeploy
6. Try creating a NEW link (old links might have wrong URLs cached)

---

## Common Issues

### Issue: Frontend can't connect to backend
**Solution:** Check Netlify environment variable `REACT_APP_API_URL`

### Issue: Tracking URLs still point to Netlify
**Solution:** Wait for Render to finish redeploying (check Events tab)

### Issue: Links not redirecting
**Solution:** Check Render logs for backend errors

---

## Success Checklist

- [ ] Frontend loads on tracklyt.netlify.app
- [ ] Can login/register
- [ ] Can create new links
- [ ] Tracking URLs start with `affiliatelinkweb.onrender.com`
- [ ] Clicking tracking URL redirects correctly
- [ ] Analytics are working

