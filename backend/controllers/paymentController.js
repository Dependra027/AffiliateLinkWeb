const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

console.log('Razorpay initialized with key_id:', process.env.RAZORPAY_KEY_ID);

// Credit packages configuration
const CREDIT_PACKAGES = {
  10: { credits: 10, amount: 1000 }, // ₹10 = 10 credits
  20: { credits: 20, amount: 2000 }, // ₹20 = 20 credits
  50: { credits: 50, amount: 5000 }, // ₹50 = 50 credits
  100: { credits: 100, amount: 10000 } // ₹100 = 100 credits
};

// Create order for credit purchase
const createOrder = async (req, res) => {
  try {
    console.log('Create order request:', req.body);
    console.log('User ID:', req.user._id);
    
    const { packageId } = req.body;
    const userId = req.user._id;

    // Validate package
    if (!CREDIT_PACKAGES[packageId]) {
      console.log('Invalid package ID:', packageId);
      return res.status(400).json({ message: 'Invalid package selected' });
    }

    const package = CREDIT_PACKAGES[packageId];
    const amount = package.amount; // Amount in paise
    const credits = package.credits;

    // Create a shorter receipt ID (max 40 characters)
    const receiptId = `credits_${packageId}_${Date.now().toString().slice(-8)}`;

    console.log('Creating Razorpay order with:', {
      amount,
      currency: 'INR',
      receipt: receiptId,
      credits,
      packageId
    });

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amount,
      currency: 'INR',
      receipt: receiptId,
      notes: {
        userId: userId.toString(),
        credits: credits.toString(),
        packageId: packageId.toString()
      }
    });

    console.log('Razorpay order created:', order);

    // Add payment record to user
    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    user.payments.push({
      razorpayOrderId: order.id,
      amount: amount,
      credits: credits,
      status: 'pending'
    });
    await user.save();

    console.log('Payment record added to user');

    const response = {
      orderId: order.id,
      amount: amount,
      currency: 'INR',
      key: process.env.RAZORPAY_KEY_ID,
      credits: credits
    };

    console.log('Sending response:', response);
    res.json(response);
  } catch (error) {
    console.error('Create order error:', error);
    
    // Check if it's a Razorpay error
    if (error.error) {
      console.error('Razorpay error details:', error.error);
      return res.status(500).json({ 
        message: 'Payment gateway error: ' + (error.error.description || error.error.reason || 'Unknown error')
      });
    }
    
    res.status(500).json({ message: 'Failed to create order: ' + error.message });
  }
};

// Verify payment and add credits
const verifyPayment = async (req, res) => {
  try {
    console.log('Verify payment request:', req.body);
    
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const userId = req.user._id;

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    console.log('Signature verification:', {
      received: razorpay_signature,
      expected: expectedSignature,
      match: expectedSignature === razorpay_signature
    });

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Find user and payment record
    const user = await User.findById(userId);
    const payment = user.payments.find(p => p.razorpayOrderId === razorpay_order_id);

    if (!payment) {
      console.log('Payment record not found for order:', razorpay_order_id);
      return res.status(404).json({ message: 'Payment record not found' });
    }

    if (payment.status === 'completed') {
      console.log('Payment already completed for order:', razorpay_order_id);
      return res.status(400).json({ message: 'Payment already processed' });
    }

    // Update payment status and add credits
    payment.status = 'completed';
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.paymentDate = new Date();

    // Add credits to user
    user.credits += payment.credits;

    await user.save();

    console.log('Payment verified and credits added:', {
      userId: user._id,
      addedCredits: payment.credits,
      totalCredits: user.credits
    });

    res.json({
      message: 'Payment verified successfully',
      credits: user.credits,
      addedCredits: payment.credits
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Failed to verify payment: ' + error.message });
  }
};

// Get user's credit balance and payment history
const getUserCredits = async (req, res) => {
  try {
    console.log('Get user credits request for user:', req.user._id);
    
    const userId = req.user._id;
    const user = await User.findById(userId).select('credits payments');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User credits data:', {
      credits: user.credits,
      paymentsCount: user.payments.length
    });

    res.json({
      credits: user.credits,
      payments: user.payments
    });
  } catch (error) {
    console.error('Get user credits error:', error);
    res.status(500).json({ message: 'Failed to get user credits: ' + error.message });
  }
};

// Get available credit packages
const getCreditPackages = async (req, res) => {
  try {
    console.log('Get credit packages request');
    
    const packages = Object.entries(CREDIT_PACKAGES).map(([id, pkg]) => ({
      id: parseInt(id),
      credits: pkg.credits,
      amount: pkg.amount,
      price: pkg.amount / 100 // Convert paise to rupees
    }));

    console.log('Available packages:', packages);

    res.json({ packages });
  } catch (error) {
    console.error('Get packages error:', error);
    res.status(500).json({ message: 'Failed to get packages: ' + error.message });
  }
};

// Deduct credits (for admin or system use)
const deductCredits = async (req, res) => {
  try {
    console.log('Deduct credits request:', req.body);
    
    const { amount } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    
    if (!user.hasEnoughCredits(amount)) {
      return res.status(400).json({ message: 'Insufficient credits' });
    }

    await user.deductCredits(amount);

    console.log('Credits deducted:', {
      userId: user._id,
      deductedAmount: amount,
      remainingCredits: user.credits
    });

    res.json({
      message: 'Credits deducted successfully',
      remainingCredits: user.credits
    });
  } catch (error) {
    console.error('Deduct credits error:', error);
    res.status(500).json({ message: 'Failed to deduct credits: ' + error.message });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getUserCredits,
  getCreditPackages,
  deductCredits
}; 