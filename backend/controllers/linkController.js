const { validationResult } = require('express-validator');
const Link = require('../models/Link');

// Get all links for authenticated user
const getLinks = async (req, res) => {
  try {
    const { search, tag } = req.query;
    let query = { userId: req.user._id };

    // Add search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { url: { $regex: search, $options: 'i' } }
      ];
    }

    // Add tag filter
    if (tag) {
      query.tags = { $in: [tag] };
    }

    const links = await Link.find(query).sort({ createdAt: -1 });
    res.json(links);
  } catch (error) {
    console.error('Get links error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new link
const createLink = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, url, description, tags } = req.body;

    // Process tags (convert to array if string, remove duplicates)
    let processedTags = [];
    if (tags) {
      if (typeof tags === 'string') {
        processedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      } else if (Array.isArray(tags)) {
        processedTags = tags.map(tag => tag.trim()).filter(tag => tag);
      }
      // Remove duplicates
      processedTags = [...new Set(processedTags)];
    }

    const link = new Link({
      title,
      url,
      description,
      tags: processedTags,
      userId: req.user._id
    });

    await link.save();
    res.status(201).json(link);
  } catch (error) {
    console.error('Create link error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update link
const updateLink = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { title, url, description, tags } = req.body;

    // Find link and ensure it belongs to the user
    const link = await Link.findOne({ _id: id, userId: req.user._id });
    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }

    // Process tags
    let processedTags = [];
    if (tags) {
      if (typeof tags === 'string') {
        processedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      } else if (Array.isArray(tags)) {
        processedTags = tags.map(tag => tag.trim()).filter(tag => tag);
      }
      processedTags = [...new Set(processedTags)];
    }

    // Update link
    link.title = title || link.title;
    link.url = url || link.url;
    link.description = description !== undefined ? description : link.description;
    link.tags = processedTags.length > 0 ? processedTags : link.tags;

    await link.save();
    res.json(link);
  } catch (error) {
    console.error('Update link error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete link
const deleteLink = async (req, res) => {
  try {
    const { id } = req.params;

    const link = await Link.findOneAndDelete({ _id: id, userId: req.user._id });
    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }

    res.json({ message: 'Link deleted successfully' });
  } catch (error) {
    console.error('Delete link error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single link
const getLink = async (req, res) => {
  try {
    const { id } = req.params;

    const link = await Link.findOne({ _id: id, userId: req.user._id });
    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }

    res.json(link);
  } catch (error) {
    console.error('Get link error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getLinks,
  createLink,
  updateLink,
  deleteLink,
  getLink
}; 