# Netlify Environment Variable Setup

Your frontend needs to know where your backend API is located.

## Add to Netlify

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Select your site (`transcendent-hamster-452c1c` or whatever your site name is)
3. Go to **Site settings** → **Environment variables**
4. Click **Add a variable**

### Add this variable:

**Key:** `REACT_APP_API_URL`  
**Value:** `https://affiliatelinkweb.onrender.com/api`

⚠️ **Important:** Make sure the value includes `/api` at the end!

5. Click **Save**
6. Go to **Deploys** tab
7. Click **Trigger deploy** → **Deploy site** (or wait for next automatic deploy)

---

## After adding this variable, test your app:

1. Visit your Netlify URL: `https://transcendent-hamster-452c1c.netlify.app`
2. Try to register/login
3. Check browser console (F12) for any API errors

If you see errors like "Network Error" or "CORS error", the frontend can't connect to the backend.

