# Complete List: Environment Variables for Render

Go to your Render backend and make sure you have **ALL** these variables:

## Backend URL (CRITICAL - fixes tracking links)
```
BACKEND_URL=https://affiliatelinkweb.onrender.com
```

## Database
```
MONGO_URI=your_mongodb_atlas_connection_string
```

## Security
```
JWT_SECRET=your_secret_jwt_key_here
```

## Frontend URL
```
CLIENT_URL=https://tracklyt.netlify.app
```

## Environment
```
NODE_ENV=production
PORT=10000
```

## Email Configuration
```
EMAIL_SERVICE=gmail
EMAIL_USER=dependrasingh027@gmail.com
EMAIL_PASSWORD=jxow xyou wqap wbfu
```

## Razorpay Configuration
```
RAZORPAY_KEY_ID=rzp_test_V2sX0FwORxS4T3
RAZORPAY_KEY_SECRET=cvSro34bam0vSFOFM67Ak2Df
RAZORPAY_MONTHLY_PLAN_ID=plan_QqR7sa8hqCQsSV
RAZORPAY_YEARLY_PLAN_ID=plan_QqR7D1LHkqeWnW
RAZORPAY_WEBHOOK_SECRET=03cb73d0-68df-4dca-bfb9-c1441197cd0d
```

---

## Quick Check

To verify your backend is using the correct URL, check your Render logs:

1. Go to Render Dashboard → Your backend service
2. Click **Events** tab
3. Look for logs that show your backend URL
4. If you see errors about tracking URLs, the `BACKEND_URL` variable is missing or incorrect

---

## After Adding BACKEND_URL

1. Your tracking links will work correctly
2. They'll point to: `https://affiliatelinkweb.onrender.com/api/links/t/XXX`
3. Clicking them will redirect to the original website
4. Analytics will be tracked properly

---

## For Netlify Frontend

You also need this in Netlify:

**Variable:** `REACT_APP_API_URL`  
**Value:** `https://affiliatelinkweb.onrender.com/api`

⚠️ Note: Frontend uses `/api` at the end, but backend's `BACKEND_URL` should NOT have `/api`.

