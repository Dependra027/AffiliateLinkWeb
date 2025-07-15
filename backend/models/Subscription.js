const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  plan: {
    type: String,
    enum: ['monthly', 'yearly'],
    required: true,
  },
  razorpay_subscription_id: {
    type: String,
    required: true,
  },
  razorpay_payment_id: {
    type: String,
  },
  status: {
    type: String,
    enum: ['created', 'active', 'cancelled', 'expired', 'pending'],
    default: 'created',
  },
  start_date: {
    type: Date,
  },
  end_date: {
    type: Date,
  },
  planDetails: {
    name: String,
    amount: Number,
    interval: String
  },
  raw_webhook: {
    type: Object,
  },
}, { timestamps: true });

module.exports = mongoose.model('Subscription', SubscriptionSchema); 