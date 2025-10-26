# Netlify Environment Variable Setup

## During Netlify Setup:

When Netlify asks for "Environment variables", add this:

### Variable 1:
- **Variable name:** `REACT_APP_API_URL`
- **Value:** `https://affiliatelinkweb.onrender.com/api`

### How to Add:
1. In the "Environment variables" section during deployment setup
2. Click "Add environment variables" 
3. Click "+ Add a variable"
4. Enter the variable name: `REACT_APP_API_URL`
5. Enter the value: `https://affiliatelinkweb.onrender.com/api`
6. Click "Add variable"
7. Continue with deployment

---

## Or Add Later (After Deployment):

If you forgot to add it during setup, you can add it later:

1. Go to your Netlify site dashboard
2. Go to **Site settings** → **Environment variables**
3. Click **Add a variable**
4. Add:
   - Variable name: `REACT_APP_API_URL`
   - Value: `https://affiliatelinkweb.onrender.com/api`
5. Click **Save**
6. Go to **Deploys** tab
7. Click **Trigger deploy** → **Deploy site** to rebuild with the new variable

---

## Why This Variable is Needed:

Your React app needs to know where the backend API is located. This environment variable will be used by your frontend code in `App.js`:

```javascript
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

This allows your frontend to connect to your Render backend.

