const express = require('express');
const { body } = require('express-validator');
const { 
  createOrder, 
  verifyPayment, 
  getUserCredits, 
  getCreditPackages, 
  deductCredits 
} = require('../controllers/paymentController');
const auth = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const createOrderValidation = [
  body('packageId')
    .isInt({ min: 10, max: 100 })
    .withMessage('Invalid package selected')
];

const verifyPaymentValidation = [
  body('razorpay_order_id')
    .notEmpty()
    .withMessage('Order ID is required'),
  body('razorpay_payment_id')
    .notEmpty()
    .withMessage('Payment ID is required'),
  body('razorpay_signature')
    .notEmpty()
    .withMessage('Payment signature is required')
];

const deductCreditsValidation = [
  body('amount')
    .isInt({ min: 1 })
    .withMessage('Amount must be a positive integer')
];

// Routes
router.get('/packages', getCreditPackages); // Public route to get available packages
router.get('/credits', auth, getUserCredits); // Get user's credits and payment history
router.post('/create-order', auth, createOrderValidation, createOrder); // Create payment order
router.post('/verify-payment', auth, verifyPaymentValidation, verifyPayment); // Verify payment
router.post('/deduct-credits', auth, deductCreditsValidation, deductCredits); // Deduct credits

module.exports = router; 