const express = require('express');
const { body } = require('express-validator');
const { 
  register, 
  login, 
  logout, 
  checkAuth, 
  forgotPassword, 
  resetPassword, 
  verifyEmail, 
  resendEmailVerification 
} = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const registerValidation = [
  body('username')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long')
    .isAlphanumeric()
    .withMessage('Username must contain only letters and numbers'),
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
];

const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Token is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

const resendVerificationValidation = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/logout', logout);
router.get('/check', auth, checkAuth);

// Email verification routes
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerificationValidation, resendEmailVerification);

// Password reset routes
router.post('/forgot-password', forgotPasswordValidation, forgotPassword);
router.post('/reset-password', resetPasswordValidation, resetPassword);

module.exports = router; 