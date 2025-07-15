const { validationResult } = require('express-validator');
const Link = require('../models/Link');
const geoip = require('geoip-lite');
const UAParser = require('ua-parser-js');
const Notification = require('../models/Notification');
const emailService = require('../utils/emailService');

// Platform detection function
const detectPlatform = (referrer, userAgent) => {
  if (!referrer) return 'direct';
  
  const referrerLower = referrer.toLowerCase();
  const userAgentLower = userAgent.toLowerCase();
  
  if (referrerLower.includes('facebook.com') || referrerLower.includes('fb.com')) return 'facebook';
  if (referrerLower.includes('twitter.com') || referrerLower.includes('x.com')) return 'twitter';
  if (referrerLower.includes('instagram.com')) return 'instagram';
  if (referrerLower.includes('whatsapp.com') || userAgentLower.includes('whatsapp')) return 'whatsapp';
  if (referrerLower.includes('linkedin.com')) return 'linkedin';
  if (referrerLower.includes('tiktok.com')) return 'tiktok';
  if (referrerLower.includes('youtube.com') || referrerLower.includes('youtu.be')) return 'youtube';
  if (referrerLower.includes('t.me') || userAgentLower.includes('telegram')) return 'telegram';
  if (referrerLower.includes('mail.google.com') || referrerLower.includes('outlook.com') || referrerLower.includes('yahoo.com')) return 'email';
  
  return 'other';
};

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

    // Check if user has at least 1 credit
    const user = await require('../models/User').findById(req.user._id);
    if (!user || !user.hasEnoughCredits(1)) {
      return res.status(403).json({ message: 'Insufficient credits. Please purchase credits to add a new link.' });
    }

    // Deduct 1 credit
    await user.deductCredits(1);

    const { title, url, description, tags, customAlias } = req.body;

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

    // Check for custom alias uniqueness
    let trackingIdToUse;
    if (customAlias) {
      const existing = await Link.findOne({ customAlias });
      if (existing) {
        return res.status(409).json({ message: 'Custom alias is already in use. Please choose another.' });
      }
      trackingIdToUse = customAlias;
    } else {
      trackingIdToUse = Math.random().toString(36).substring(2, 8) + Date.now().toString(36);
    }

    const link = new Link({
      title,
      url,
      description,
      tags: processedTags,
      userId: req.user._id,
      trackingId: trackingIdToUse,
      customAlias: customAlias || undefined
    });

    await link.save();
    
    // Return link with tracking URL
    const trackingUrl = `http://localhost:5000/api/links/t/${trackingIdToUse}`;
    res.status(201).json({
      ...link.toObject(),
      trackingUrl
    });
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

// Update redirectAndTrack to use only url field
const redirectAndTrack = async (req, res) => {
  try {
    const { trackingId } = req.params;
    // Try to find by trackingId or customAlias
    const link = await Link.findOne({ $or: [ { trackingId }, { customAlias: trackingId } ] });
    if (!link) {
      return res.status(404).send('Link not found');
    }
    
    // Collect analytics
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress;
    const referrer = req.get('Referrer') || '';
    const userAgent = req.get('User-Agent') || '';
    
    // Geo info
    const geo = geoip.lookup(ip) || {};
    
    // Device info
    const parser = new UAParser(userAgent);
    const deviceType = parser.getDevice().type || 'desktop';
    const browser = parser.getBrowser().name || '';
    
    // Detect platform
    const platform = detectPlatform(referrer, userAgent);
    
    const analytics = {
      timestamp: new Date(),
      ip,
      referrer,
      userAgent,
      country: geo.country || '',
      city: geo.city || '',
      region: geo.region || '',
      latitude: geo.ll ? geo.ll[0] : null,
      longitude: geo.ll ? geo.ll[1] : null,
      isp: geo.org || '',
      deviceType,
      browser
    };
    
    // Add to platform-specific analytics
    if (link.platformAnalytics && link.platformAnalytics[platform]) {
      link.platformAnalytics[platform].push(analytics);
    }
    
    // Also add to legacy analytics for backward compatibility
    link.analytics.push(analytics);
    
    await link.save();

    // Milestone notification logic
    const MILESTONES = [5, 100, 500, 1000, 5000, 10000];
    // Calculate total clicks (legacy + all platforms)
    let totalClicks = 0;
    if (link.platformAnalytics) {
      Object.keys(link.platformAnalytics).forEach(platform => {
        totalClicks += link.platformAnalytics[platform].length;
      });
    }
    // Find the highest milestone just reached
    const justReached = MILESTONES.find(m => totalClicks === m);
    if (justReached) {
      // Check if notification already exists for this milestone
      const existing = await Notification.findOne({
        user: link.userId,
        linkId: link._id,
        milestone: justReached,
        type: 'milestone'
      });
      if (!existing) {
        await Notification.create({
          user: link.userId,
          type: 'milestone',
          message: `Congratulations! Your link has reached ${justReached} clicks!`,
          linkId: link._id,
          groupId: link.groupId,
          milestone: justReached
        });
        // Send milestone email
        const User = require('../models/User');
        const milestoneUser = await User.findById(link.userId);
        if (milestoneUser && milestoneUser.email) {
          const nodemailer = require('nodemailer');
          const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASSWORD
            }
          });
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: milestoneUser.email,
            subject: `Milestone reached: ${justReached} clicks!`,
            html: `<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
              <h2 style='color: #3498db;'>Milestone Achieved!</h2>
              <p>Hi ${milestoneUser.username},</p>
              <p>Your link <b>${link.title}</b> has just reached <b>${justReached} clicks</b>!</p>
              <p>Keep sharing and tracking your links for more milestones.</p>
              <p>Best regards,<br>The Link Manager Team</p>
            </div>`
          };
          try {
            await transporter.sendMail(mailOptions);
          } catch (err) {
            console.error('Error sending milestone email:', err);
          }
        }
      }
    }
    
    // Redirect to the original URL
    res.redirect(link.url);
  } catch (error) {
    console.error('Redirect and track error:', error);
    res.status(500).send('Server error');
  }
};

// Get link analytics with platform breakdown
const getLinkAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const link = await Link.findOne({ _id: id, userId: req.user._id });
    
    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }

    // Calculate platform statistics
    const platformStats = {};
    let totalClicks = 0;
    
    if (link.platformAnalytics) {
      Object.keys(link.platformAnalytics).forEach(platform => {
        const clicks = link.platformAnalytics[platform].length;
        platformStats[platform] = {
          clicks,
          percentage: 0 // Will be calculated after total
        };
        totalClicks += clicks;
      });
      
      // Calculate percentages
      Object.keys(platformStats).forEach(platform => {
        platformStats[platform].percentage = totalClicks > 0 ? 
          Math.round((platformStats[platform].clicks / totalClicks) * 100) : 0;
      });
    }

    // Get recent analytics (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentAnalytics = link.analytics.filter(analytic => 
      new Date(analytic.timestamp) > thirtyDaysAgo
    );

    // Advanced breakdowns
    const deviceCounts = {};
    const browserCounts = {};
    const countryCounts = {};
    const referrerCounts = {};
    const clicksOverTime = {};
    const clicksByHour = Array(24).fill(0);
    recentAnalytics.forEach(a => {
      // Device
      const device = a.deviceType || 'Unknown';
      deviceCounts[device] = (deviceCounts[device] || 0) + 1;
      // Browser
      const browser = a.browser || 'Unknown';
      browserCounts[browser] = (browserCounts[browser] || 0) + 1;
      // Country
      const country = a.country || 'Unknown';
      countryCounts[country] = (countryCounts[country] || 0) + 1;
      // Referrer
      let ref = a.referrer || 'Direct';
      if (ref === '') ref = 'Direct';
      referrerCounts[ref] = (referrerCounts[ref] || 0) + 1;
      // Clicks over time (by day)
      const day = new Date(a.timestamp).toISOString().slice(0, 10); // YYYY-MM-DD
      clicksOverTime[day] = (clicksOverTime[day] || 0) + 1;
      // Clicks by hour
      const hour = new Date(a.timestamp).getHours();
      clicksByHour[hour]++;
    });

    res.json({
      link,
      platformStats,
      totalClicks,
      recentAnalytics,
      trackingUrl: `http://localhost:5000/api/links/t/${link.customAlias || link.trackingId}`,
      deviceCounts,
      browserCounts,
      countryCounts,
      referrerCounts,
      clicksOverTime,
      clicksByHour
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Generate a new link in the same group (for 'Generate New Link' feature)
const generateNewLinkInGroup = async (req, res) => {
  try {
    const { id } = req.params; // id of the original link
    const { customAlias } = req.body;
    const user = await require('../models/User').findById(req.user._id);
    if (!user || !user.hasEnoughCredits(1)) {
      return res.status(403).json({ message: 'Insufficient credits. Please purchase credits to add a new link.' });
    }
    // Find the original link
    const originalLink = await Link.findOne({ _id: id, userId: req.user._id });
    if (!originalLink) {
      return res.status(404).json({ message: 'Original link not found' });
    }
    // Deduct 1 credit
    await user.deductCredits(1);
    // Check for custom alias uniqueness
    let trackingIdToUse;
    if (customAlias) {
      const existing = await Link.findOne({ customAlias });
      if (existing) {
        return res.status(409).json({ message: 'Custom alias is already in use. Please choose another.' });
      }
      trackingIdToUse = customAlias;
    } else {
      trackingIdToUse = Math.random().toString(36).substring(2, 8) + Date.now().toString(36);
    }
    // Use the same groupId as the original, or generate if missing
    const groupId = originalLink.groupId || (originalLink._id.toString());
    // If the original didn't have a groupId, update it
    if (!originalLink.groupId) {
      originalLink.groupId = groupId;
      await originalLink.save();
    }
    // Create the new link
    const newLink = new Link({
      title: originalLink.title,
      url: originalLink.url,
      description: originalLink.description,
      tags: originalLink.tags,
      userId: req.user._id,
      trackingId: trackingIdToUse,
      customAlias: customAlias || undefined,
      groupId
    });
    await newLink.save();
    const trackingUrl = `http://localhost:5000/api/links/t/${trackingIdToUse}`;
    res.status(201).json({
      ...newLink.toObject(),
      trackingUrl
    });
  } catch (error) {
    console.error('Generate new link in group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getLinks,
  createLink,
  updateLink,
  deleteLink,
  getLink,
  redirectAndTrack,
  getLinkAnalytics,
  generateNewLinkInGroup
}; 