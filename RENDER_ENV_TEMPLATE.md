# Render Environment Variables Configuration

Based on your current setup, here's what you should have in your Render backend:

## Required Environment Variables for Render

Add these in your Render Dashboard → Your Service → Environment tab:

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/link-manager?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
CLIENT_URL=https://transcendent-hamster-452c1c.netlify.app
PORT=10000
NODE_ENV=production
```

### Email Configuration
```
EMAIL_SERVICE=gmail
EMAIL_USER=dependrasingh027@gmail.com
EMAIL_PASSWORD=jxow xyou wqap wbfu
```

### Razorpay Configuration
```
RAZORPAY_KEY_ID=rzp_test_V2sX0FwORxS4T3
RAZORPAY_KEY_SECRET=cvSro34bam0vSFOFM67Ak2Df
RAZORPAY_MONTHLY_PLAN_ID=plan_QqR7sa8hqCQsSV
RAZORPAY_YEARLY_PLAN_ID=plan_QqR7D1LHkqeWnW
RAZORPAY_WEBHOOK_SECRET=03cb73d0-68df-4dca-bfb9-c1441197cd0d
```

---

## Important Notes:

1. **MONGO_URI**: 
   - Should be your MongoDB Atlas connection string
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/database`
   - Make sure MongoDB Atlas allows connections from Render's IP (or whitelist all IPs: `0.0.0.0/0`)

2. **JWT_SECRET**: 
   - Use a strong random string (not the same as shown above)
   - Generate one with: `openssl rand -hex 32`
   - Or use a password generator

3. **CLIENT_URL**: 
   - Should be your Netlify frontend URL
   - Currently: `https://transcendent-hamster-452c1c.netlify.app`
   - Make sure to include `https://`

4. **PORT**: 
   - Render automatically assigns a port
   - You can set it to `10000` or let Render handle it

5. **Email Password**: 
   - This is a Gmail App Password
   - If this stops working, you'll need to generate a new one

---

## How to Add in Render:

1. Go to [render.com](https://render.com)
2. Select your backend service
3. Click on "Environment" tab
4. Click "Add Environment Variable"
5. Add each variable one by one
6. Click "Save Changes"
7. Your service will automatically redeploy

---

## Verification Checklist:

- [ ] MONGO_URI is set and points to MongoDB Atlas
- [ ] CLIENT_URL matches your Netlify frontend URL
- [ ] JWT_SECRET is set to a strong random value
- [ ] All Razorpay keys are set
- [ ] Email configuration is correct
- [ ] MongoDB Atlas whitelist includes Render's IPs (or `0.0.0.0/0`)

