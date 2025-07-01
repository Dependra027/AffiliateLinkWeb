const User = require('../models/User');
const Link = require('../models/Link');
const { validationResult } = require('express-validator');

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password -emailVerificationToken -emailVerificationExpires -passwordResetToken -passwordResetExpires');
    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user by ID (admin only)
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -emailVerificationToken -emailVerificationExpires -passwordResetToken -passwordResetExpires');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new user (admin only)
const createUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, role = 'user' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.email === email ? 'Email already registered' : 'Username already taken' 
      });
    }

    // Create new user
    const user = new User({ 
      username, 
      email, 
      password, 
      role,
      isEmailVerified: true // Admin created users are automatically verified
    });
    
    await user.save();

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: 'User created successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user (admin only)
const updateUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, role, isEmailVerified } = req.body;
    const userId = req.params.id;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email/username is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
      }
    }

    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }
    }

    // Update user fields
    if (username) user.username = username;
    if (email) user.email = email;
    if (role) user.role = role;
    if (typeof isEmailVerified === 'boolean') user.isEmailVerified = isEmailVerified;

    await user.save();

    // Return updated user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      message: 'User updated successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete user (admin only)
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    // Delete user's links
    await Link.deleteMany({ user: userId });

    // Delete user
    await User.findByIdAndDelete(userId);

    res.json({ message: 'User and associated links deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all links (admin only)
const getAllLinks = async (req, res) => {
  try {
    const links = await Link.find({}).populate('userId', 'username email');
    res.json(links);
  } catch (error) {
    console.error('Get all links error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get link by ID (admin only)
const getLinkById = async (req, res) => {
  try {
    const link = await Link.findById(req.params.id).populate('userId', 'username email');
    
    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }
    
    res.json(link);
  } catch (error) {
    console.error('Get link by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new link (admin only)
const createLink = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, url, description, tags, userId } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create new link
    const link = new Link({
      title,
      url,
      description,
      tags: tags || [],
      user: userId
    });

    await link.save();

    // Populate user info
    await link.populate('userId', 'username email');

    res.status(201).json({
      message: 'Link created successfully',
      link
    });
  } catch (error) {
    console.error('Create link error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update link (admin only)
const updateLink = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, url, description, tags } = req.body;
    const linkId = req.params.id;

    // Check if link exists
    const link = await Link.findById(linkId);
    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }

    // Update link fields
    if (title) link.title = title;
    if (url) link.url = url;
    if (description !== undefined) link.description = description;
    if (tags) link.tags = tags;

    await link.save();

    // Populate user info
    await link.populate('userId', 'username email');

    res.json({
      message: 'Link updated successfully',
      link
    });
  } catch (error) {
    console.error('Update link error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete link (admin only)
const deleteLink = async (req, res) => {
  try {
    const linkId = req.params.id;

    // Check if link exists
    const link = await Link.findById(linkId);
    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }

    // Delete link
    await Link.findByIdAndDelete(linkId);

    res.json({ message: 'Link deleted successfully' });
  } catch (error) {
    console.error('Delete link error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get admin dashboard stats
const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalLinks = await Link.countDocuments();
    const verifiedUsers = await User.countDocuments({ isEmailVerified: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });

    // Get recent users
    const recentUsers = await User.find({})
      .select('username email role isEmailVerified createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get recent links
    const recentLinks = await Link.find({})
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      stats: {
        totalUsers,
        totalLinks,
        verifiedUsers,
        adminUsers
      },
      recentUsers,
      recentLinks
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
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
}; 