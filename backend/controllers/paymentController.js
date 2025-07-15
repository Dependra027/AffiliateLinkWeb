const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');
const Subscription = require('../models/Subscription');

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

// Get user's subscriptions
const getUserSubscriptions = async (req, res) => {
  try {
    console.log('Get user subscriptions request for user:', req.user._id);
    
    const userId = req.user._id;
    const subscriptions = await Subscription.find({ user: userId })
      .sort({ createdAt: -1 })
      .select('-raw_webhook');

    console.log('User subscriptions data:', {
      userId: userId,
      subscriptionsCount: subscriptions.length
    });

    res.json({
      subscriptions: subscriptions
    });
  } catch (error) {
    console.error('Get user subscriptions error:', error);
    res.status(500).json({ message: 'Failed to get user subscriptions: ' + error.message });
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

// Create Razorpay subscription for a user
const createSubscription = async (req, res) => {
  try {
    const { plan } = req.body; // 'monthly' or 'yearly'
    const userId = req.user._id;

    // Define plan details (amount in paise, interval, etc.)
    const plans = {
      monthly: {
        plan_id: process.env.RAZORPAY_MONTHLY_PLAN_ID,
        plan_name: 'Monthly Plan',
        amount: 5000, // ₹50 in paise
        interval: 'monthly',
        interval_count: 1
      },
      yearly: {
        plan_id: process.env.RAZORPAY_YEARLY_PLAN_ID,
        plan_name: 'Yearly Plan',
        amount: 49900, // ₹499 in paise
        interval: 'yearly',
        interval_count: 1
      },
    };

    if (!plans[plan]) {
      return res.status(400).json({ message: 'Invalid plan selected' });
    }

    const selectedPlan = plans[plan];

    // Check if plan ID is configured
    if (!selectedPlan.plan_id) {
      console.log(`Plan ID not configured for ${plan} plan`);
      return res.status(500).json({ 
        message: `${selectedPlan.plan_name} is not configured. Please contact support.` 
      });
    }

    // Create subscription on Razorpay
    const subscription = await razorpay.subscriptions.create({
      plan_id: selectedPlan.plan_id,
      customer_notify: 1,
      total_count: plan === 'monthly' ? 12 : 1, // 12 months for monthly, 1 year for yearly
      notes: {
        userId: userId.toString(),
        plan: plan,
        planName: selectedPlan.plan_name
      }
    });

    // Store subscription in DB
    const dbSub = await Subscription.create({
      user: userId,
      plan: plan,
      razorpay_subscription_id: subscription.id,
      status: 'created',
      planDetails: {
        name: selectedPlan.plan_name,
        amount: selectedPlan.amount,
        interval: selectedPlan.interval
      }
    });

    console.log(`Subscription created for user ${userId}:`, {
      plan: plan,
      subscriptionId: subscription.id,
      amount: selectedPlan.amount
    });

    res.json({
      subscriptionId: subscription.id,
      short_url: subscription.short_url,
      plan: plan,
      planName: selectedPlan.plan_name,
      amount: selectedPlan.amount,
      dbSubId: dbSub._id,
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    
    // Check if it's a Razorpay error
    if (error.error) {
      console.error('Razorpay error details:', error.error);
      return res.status(500).json({ 
        message: 'Payment gateway error: ' + (error.error.description || error.error.reason || 'Unknown error')
      });
    }
    
    res.status(500).json({ message: 'Failed to create subscription: ' + error.message });
  }
};

// Razorpay webhook handler
const handleRazorpayWebhook = async (req, res) => {
  try {
    // Razorpay webhook signature validation
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');
    if (signature !== expectedSignature) {
      console.error('Invalid Razorpay webhook signature');
      return res.status(400).json({ message: 'Invalid signature' });
    }

    const event = req.body;
    console.log('Webhook received:', JSON.stringify(event, null, 2));

    // Helper to add credits only if not already added
    async function addCreditsIfNotAlready(subscription, user, creditsToAdd, eventType) {
      if (!user) {
        console.error(`[${eventType}] User not found for subscription:`, subscription.user);
        return;
      }
      // Prevent double crediting: check if already credited for this event
      if (subscription.credited) {
        console.log(`[${eventType}] Credits already added for subscription:`, subscription.razorpay_subscription_id);
        return;
      }
      user.credits += creditsToAdd;
      await user.save();
      await Subscription.findOneAndUpdate(
        { razorpay_subscription_id: subscription.razorpay_subscription_id },
        { credited: true, raw_webhook: event }
      );
      console.log(`[${eventType}] Credits added:`, {
        userId: user._id,
        plan: subscription.plan,
        creditsAdded: creditsToAdd,
        totalCredits: user.credits
      });
    }

    // Handle subscription activation
    if (event.event === 'subscription.activated') {
      const subId = event.payload.subscription.entity.id;
      const subscription = await Subscription.findOne({ razorpay_subscription_id: subId });
      if (!subscription) {
        console.error('Subscription not found for subId:', subId);
        return res.status(404).json({ message: 'Subscription not found' });
      }
      await Subscription.findOneAndUpdate(
        { razorpay_subscription_id: subId },
        {
          status: 'active',
          start_date: event.payload.subscription.entity.start_at
            ? new Date(event.payload.subscription.entity.start_at * 1000)
            : undefined,
          end_date: event.payload.subscription.entity.end_at
            ? new Date(event.payload.subscription.entity.end_at * 1000)
            : undefined,
          raw_webhook: event,
        }
      );
      const user = await User.findById(subscription.user);
      let creditsToAdd = 0;
      if (subscription.plan === 'monthly') creditsToAdd = 50;
      if (subscription.plan === 'yearly') creditsToAdd = 600;
      if (creditsToAdd > 0) {
        await addCreditsIfNotAlready(subscription, user, creditsToAdd, 'subscription.activated');
      } else {
        console.error('No credits to add for plan:', subscription.plan);
      }
    }
    // Handle payment capture for subscriptions
    else if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity;
      if (payment.subscription_id) {
        const subscription = await Subscription.findOne({ razorpay_subscription_id: payment.subscription_id });
        if (!subscription) {
          console.error('Subscription not found for payment.subscription_id:', payment.subscription_id);
          return res.status(404).json({ message: 'Subscription not found' });
        }
        await Subscription.findOneAndUpdate(
          { razorpay_subscription_id: payment.subscription_id },
          {
            razorpay_payment_id: payment.id,
            status: 'active',
            raw_webhook: event,
          }
        );
        const user = await User.findById(subscription.user);
        let creditsToAdd = 0;
        if (subscription.plan === 'monthly') creditsToAdd = 50;
        if (subscription.plan === 'yearly') creditsToAdd = 600;
        if (creditsToAdd > 0) {
          await addCreditsIfNotAlready(subscription, user, creditsToAdd, 'payment.captured');
        } else {
          console.error('No credits to add for plan:', subscription.plan);
        }
      }
    }
    // Handle subscription payment events
    else if (event.event === 'subscription.charged') {
      const subscriptionEvent = event.payload.subscription.entity;
      const subscriptionDoc = await Subscription.findOne({ razorpay_subscription_id: subscriptionEvent.id });
      if (!subscriptionDoc) {
        console.error('Subscription not found for subscriptionEvent.id:', subscriptionEvent.id);
        return res.status(404).json({ message: 'Subscription not found' });
      }
      const user = await User.findById(subscriptionDoc.user);
      let creditsToAdd = 0;
      if (subscriptionDoc.plan === 'monthly') creditsToAdd = 50;
      if (subscriptionDoc.plan === 'yearly') creditsToAdd = 600;
      if (creditsToAdd > 0) {
        await addCreditsIfNotAlready(subscriptionDoc, user, creditsToAdd, 'subscription.charged');
      } else {
        console.error('No credits to add for plan:', subscriptionDoc.plan);
      }
    }
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ message: 'Webhook handler error: ' + error.message });
  }
};

// Manual credit addition for subscriptions (for admin use)
const addSubscriptionCredits = async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    const userId = req.user._id;

    // Find the subscription
    const subscription = await Subscription.findOne({ 
      razorpay_subscription_id: subscriptionId,
      user: userId 
    });

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate credits to add based on plan
    let creditsToAdd = 0;
    if (subscription.plan === 'monthly') {
      creditsToAdd = 50;
    } else if (subscription.plan === 'yearly') {
      creditsToAdd = 600;
    }

    if (creditsToAdd > 0) {
      user.credits += creditsToAdd;
      await user.save();

      console.log(`Manual credits added for subscription ${subscriptionId}:`, {
        userId: user._id,
        plan: subscription.plan,
        creditsAdded: creditsToAdd,
        totalCredits: user.credits
      });

      res.json({
        message: 'Credits added successfully',
        creditsAdded: creditsToAdd,
        totalCredits: user.credits,
        subscription: subscription
      });
    } else {
      res.status(400).json({ message: 'Invalid subscription plan' });
    }
  } catch (error) {
    console.error('Add subscription credits error:', error);
    res.status(500).json({ message: 'Failed to add credits: ' + error.message });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getUserCredits,
  getUserSubscriptions,
  getCreditPackages,
  deductCredits,
  createSubscription,
  handleRazorpayWebhook,
  addSubscriptionCredits
}; 