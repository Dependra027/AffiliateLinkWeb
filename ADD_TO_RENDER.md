# Missing Environment Variables in Render

Add these **Razorpay** variables to your Render dashboard:

## Go to Render Dashboard → Your Backend Service → Environment tab

### Add these variables:

1. **RAZORPAY_KEY_SECRET**
   - Value: `cvSro34bam0vSFOFM67Ak2Df`

2. **RAZORPAY_MONTHLY_PLAN_ID**
   - Value: `plan_QqR7sa8hqCQsSV`

3. **RAZORPAY_YEARLY_PLAN_ID**
   - Value: `plan_QqR7D1LHkqeWnW`

4. **RAZORPAY_WEBHOOK_SECRET**
   - Value: `03cb73d0-68df-4dca-bfb9-c1441197cd0d`

5. **Fix RAZORPAY_KEY_ID**
   - Your current value shows "B" which is wrong
   - Update it to: `rzp_test_V2sX0FwORxS4T3`

## Steps to Add:

1. Click on your backend service in Render
2. Go to "Environment" tab  
3. Click "Add Environment Variable"
4. Add each variable with the key and value above
5. Click "Save Changes"
6. Render will automatically redeploy

---

## To verify your backend has everything:

Run this in your terminal to test your backend:

```bash
curl https://affiliatelinkweb.onrender.com/api/health
```

You should get: `{"message":"Server is running","timestamp":"...","environment":"production"}`

