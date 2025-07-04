# 💰 Credit System with Razorpay Integration

> **Last Updated:** June 2024 — See README.md for a summary of credit/payment features.

## 🎯 Overview

This project now includes a complete credit system that allows users to purchase credits using Razorpay. Users can buy credits in packages of 10, 20, 50, or 100 credits for ₹10, ₹20, ₹50, and ₹100 respectively.

## 🚀 Features

### ✅ Credit Management
- **Credit Balance**: Users can see their current credit balance in the dashboard
- **Credit Purchase**: Multiple package options (10, 20, 50, 100 credits)
- **Payment History**: Complete transaction history with status tracking
- **Persistent Credits**: Credits persist across sessions and page refreshes

### ✅ Razorpay Integration
- **Secure Payments**: Test mode with Razorpay test keys
- **Payment Verification**: Server-side signature verification
- **Order Management**: Complete order creation and tracking
- **Error Handling**: Comprehensive error handling for failed payments

### ✅ User Experience
- **Real-time Updates**: Credit balance updates immediately after purchase
- **Beautiful UI**: Modern, responsive design with smooth animations
- **Mobile Friendly**: Works perfectly on all device sizes
- **Easy Navigation**: Quick access to payment management

## 📦 Credit Packages

| Credits | Price (₹) | Amount (Paise) |
|---------|-----------|----------------|
| 10      | 10        | 1000           |
| 20      | 20        | 2000           |
| 50      | 50        | 5000           |
| 100     | 100       | 10000          |

## 🔧 Technical Implementation

### Backend Changes

#### 1. User Model Updates (`backend/models/User.js`)
```javascript
// Added credit system fields
credits: {
  type: Number,
  default: 0,
  min: 0
},
payments: [{
  razorpayOrderId: String,
  razorpayPaymentId: String,
  amount: Number,
  credits: Number,
  status: String,
  paymentDate: Date
}]

// Added credit management methods
userSchema.methods.addCredits = function(amount) { ... }
userSchema.methods.deductCredits = function(amount) { ... }
userSchema.methods.hasEnoughCredits = function(amount) { ... }
```

#### 2. Payment Controller (`backend/controllers/paymentController.js`)
- `createOrder()` - Creates Razorpay order
- `verifyPayment()` - Verifies payment and adds credits
- `getUserCredits()` - Gets user's credit balance and history
- `getCreditPackages()` - Returns available credit packages
- `deductCredits()` - Deducts credits (for admin/system use)

#### 3. Payment Routes (`backend/routes/payments.js`)
- `GET /api/payments/packages` - Get available packages
- `GET /api/payments/credits` - Get user credits and history
- `POST /api/payments/create-order` - Create payment order
- `POST /api/payments/verify-payment` - Verify payment
- `POST /api/payments/deduct-credits` - Deduct credits

### Frontend Changes

#### 1. PaymentManager Component (`frontend/src/components/PaymentManager.js`)
- Credit package display
- Payment processing with Razorpay
- Payment history display
- Real-time credit updates

#### 2. Dashboard Updates (`frontend/src/components/Dashboard.js`)
- Credit balance display in header
- Navigation to payment management
- Credit persistence across sessions

#### 3. App.js Updates
- Added PaymentManager route
- Updated user state management

## 🛠️ Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install razorpay
```

### 2. Environment Variables
Add these to your Vercel environment variables:
```
RAZORPAY_KEY_ID=rzp_test_V2sX0FwORxS4T3
RAZORPAY_KEY_SECRET=cvSro34bam0vSFOFM67Ak2Df
```

### 3. Database Migration
The User model will automatically add the new fields when users are created. Existing users will start with 0 credits.

### 4. Deploy Changes
```bash
git add .
git commit -m "Add credit system with Razorpay integration"
git push origin main
```

## 🧪 Testing

### Test Credit Purchase
1. Login to your account
2. Click the 💰 button in the dashboard header
3. Select a credit package
4. Complete the Razorpay test payment
5. Verify credits are added to your account

### Test Credit Persistence
1. Purchase credits
2. Refresh the page
3. Verify credits are still there
4. Logout and login again
5. Verify credits persist

## 🔒 Security Features

### Payment Security
- **Signature Verification**: All payments are verified server-side
- **Order Validation**: Orders are validated before processing
- **Duplicate Prevention**: Prevents duplicate payment processing
- **Error Handling**: Comprehensive error handling for failed payments

### Data Security
- **Credit Validation**: Credits cannot go negative
- **User Authentication**: All payment operations require authentication
- **Input Validation**: All inputs are validated and sanitized

## 📱 User Interface

### Dashboard Header
- Displays current credit balance
- Quick access to payment management
- Responsive design for all devices

### Payment Manager
- **Credit Packages**: Beautiful cards showing available packages
- **Payment History**: Complete transaction history with status
- **Real-time Updates**: Instant credit balance updates
- **Error Handling**: Clear error messages and recovery options

## 🔄 Credit Usage

### Adding Credits
Credits are automatically added when:
1. User completes a payment
2. Payment is verified server-side
3. User account is updated

### Deducting Credits
Credits can be deducted by:
1. Admin actions (if implemented)
2. System operations (if implemented)
3. API calls to `/api/payments/deduct-credits`

### Credit Validation
- Users cannot spend more credits than they have
- Credits cannot go below 0
- All credit operations are logged

## 🚨 Troubleshooting

### Common Issues

#### 1. Payment Not Processing
- Check Razorpay keys are correct
- Verify environment variables are set
- Check browser console for errors
- Ensure Razorpay script is loaded

#### 2. Credits Not Updating
- Check payment verification endpoint
- Verify database connection
- Check user authentication
- Review server logs

#### 3. CORS Issues
- Verify CLIENT_URL environment variable
- Check CORS configuration in server.js
- Ensure proper domain setup

### Debug Steps
1. Check browser console for errors
2. Review Vercel function logs
3. Test API endpoints manually
4. Verify environment variables
5. Check database connection

## 🎉 Success!

Your credit system is now fully integrated with Razorpay! Users can:
- ✅ Purchase credits securely
- ✅ View their credit balance
- ✅ Track payment history
- ✅ Use credits across sessions
- ✅ Enjoy a seamless payment experience

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section
2. Review Vercel function logs
3. Test API endpoints manually
4. Verify all environment variables are set correctly

---

> **Note:** A summary of the credit/payment system is now also available in the main [README.md](./README.md) for quick reference. 