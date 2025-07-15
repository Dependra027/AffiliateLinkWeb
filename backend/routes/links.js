const express = require('express');
const { body } = require('express-validator');
const { getLinks, createLink, updateLink, deleteLink, getLink, redirectAndTrack, getLinkAnalytics, generateNewLinkInGroup } = require('../controllers/linkController');
const auth = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const linkValidation = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('url')
    .notEmpty()
    .withMessage('URL is required')
    .isURL()
    .withMessage('Please enter a valid URL'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
];

// All routes require authentication
router.use(auth);

// Routes
router.get('/', getLinks);
router.post('/', linkValidation, createLink);
router.get('/l/:id', redirectAndTrack); // Legacy route
router.get('/t/:trackingId', redirectAndTrack); // New tracking route
router.get('/:id', getLink);
router.put('/:id', linkValidation, updateLink);
router.delete('/:id', deleteLink);
router.get('/:id/analytics', getLinkAnalytics);
router.post('/:id/generate', auth, generateNewLinkInGroup);

module.exports = router; 