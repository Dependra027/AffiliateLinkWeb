const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const auth = require('../middleware/auth');
const adminAuth = require('../middleware/admin');
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getAllLinks,
  getLinkById,
  createLink,
  updateLink,
  deleteLink,
  getAdminStats
} = require('../controllers/adminController');

// Apply auth middleware to all routes
router.use(auth);
router.use(adminAuth);

// Admin dashboard stats
router.get('/stats', getAdminStats);

// User management routes
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);

router.post('/users', [
  body('username')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long')
    .trim(),
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Role must be either user or admin')
], createUser);

router.put('/users/:id', [
  body('username')
    .optional()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long')
    .trim(),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Role must be either user or admin'),
  body('isEmailVerified')
    .optional()
    .isBoolean()
    .withMessage('isEmailVerified must be a boolean')
], updateUser);

router.delete('/users/:id', deleteUser);

// Link management routes
router.get('/links', getAllLinks);
router.get('/links/:id', getLinkById);

router.post('/links', [
  body('title')
    .isLength({ min: 1 })
    .withMessage('Title is required')
    .trim(),
  body('url')
    .isURL()
    .withMessage('Please enter a valid URL'),
  body('description')
    .optional()
    .trim(),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('userId')
    .isMongoId()
    .withMessage('Valid user ID is required')
], createLink);

router.put('/links/:id', [
  body('title')
    .optional()
    .isLength({ min: 1 })
    .withMessage('Title cannot be empty')
    .trim(),
  body('url')
    .optional()
    .isURL()
    .withMessage('Please enter a valid URL'),
  body('description')
    .optional()
    .trim(),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
], updateLink);

router.delete('/links/:id', deleteLink);

module.exports = router; 