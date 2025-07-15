const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  url: {
    type: String,
    required: [true, 'URL is required'],
    trim: true,
    match: [/^https?:\/\/.+/, 'Please enter a valid URL starting with http:// or https://']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, 'Tag cannot exceed 20 characters']
  }],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Unique tracking ID for this link
  trackingId: {
    type: String,
    unique: true,
    required: true
  },
  customAlias: {
    type: String,
    unique: true,
    sparse: true, // allow multiple docs with null/undefined
    trim: true,
    minlength: 3,
    maxlength: 64,
    match: [/^[a-zA-Z0-9-_]+$/, 'Custom alias can only contain letters, numbers, hyphens, and underscores.']
  },
  groupId: {
    type: String,
    index: true
  },
  // Remove destinations and destinationAnalytics fields
  // Analytics grouped by platform
  platformAnalytics: {
    facebook: [{
      timestamp: { type: Date, default: Date.now },
      ip: String,
      country: String,
      city: String,
      region: String,
      latitude: Number,
      longitude: Number,
      isp: String,
      referrer: String,
      userAgent: String,
      deviceType: String,
      browser: String
    }],
    twitter: [{
      timestamp: { type: Date, default: Date.now },
      ip: String,
      country: String,
      city: String,
      region: String,
      latitude: Number,
      longitude: Number,
      isp: String,
      referrer: String,
      userAgent: String,
      deviceType: String,
      browser: String
    }],
    instagram: [{
      timestamp: { type: Date, default: Date.now },
      ip: String,
      country: String,
      city: String,
      region: String,
      latitude: Number,
      longitude: Number,
      isp: String,
      referrer: String,
      userAgent: String,
      deviceType: String,
      browser: String
    }],
    whatsapp: [{
      timestamp: { type: Date, default: Date.now },
      ip: String,
      country: String,
      city: String,
      region: String,
      latitude: Number,
      longitude: Number,
      isp: String,
      referrer: String,
      userAgent: String,
      deviceType: String,
      browser: String
    }],
    linkedin: [{
      timestamp: { type: Date, default: Date.now },
      ip: String,
      country: String,
      city: String,
      region: String,
      latitude: Number,
      longitude: Number,
      isp: String,
      referrer: String,
      userAgent: String,
      deviceType: String,
      browser: String
    }],
    tiktok: [{
      timestamp: { type: Date, default: Date.now },
      ip: String,
      country: String,
      city: String,
      region: String,
      latitude: Number,
      longitude: Number,
      isp: String,
      referrer: String,
      userAgent: String,
      deviceType: String,
      browser: String
    }],
    youtube: [{
      timestamp: { type: Date, default: Date.now },
      ip: String,
      country: String,
      city: String,
      region: String,
      latitude: Number,
      longitude: Number,
      isp: String,
      referrer: String,
      userAgent: String,
      deviceType: String,
      browser: String
    }],
    telegram: [{
      timestamp: { type: Date, default: Date.now },
      ip: String,
      country: String,
      city: String,
      region: String,
      latitude: Number,
      longitude: Number,
      isp: String,
      referrer: String,
      userAgent: String,
      deviceType: String,
      browser: String
    }],
    email: [{
      timestamp: { type: Date, default: Date.now },
      ip: String,
      country: String,
      city: String,
      region: String,
      latitude: Number,
      longitude: Number,
      isp: String,
      referrer: String,
      userAgent: String,
      deviceType: String,
      browser: String
    }],
    direct: [{
      timestamp: { type: Date, default: Date.now },
      ip: String,
      country: String,
      city: String,
      region: String,
      latitude: Number,
      longitude: Number,
      isp: String,
      referrer: String,
      userAgent: String,
      deviceType: String,
      browser: String
    }],
    other: [{
      timestamp: { type: Date, default: Date.now },
      ip: String,
      country: String,
      city: String,
      region: String,
      latitude: Number,
      longitude: Number,
      isp: String,
      referrer: String,
      userAgent: String,
      deviceType: String,
      browser: String
    }]
  },
  // Legacy analytics field for backward compatibility
  analytics: [
    {
      timestamp: { type: Date, default: Date.now },
      ip: String,
      country: String,
      city: String,
      region: String,
      latitude: Number,
      longitude: Number,
      isp: String,
      referrer: String,
      userAgent: String,
      deviceType: String,
      browser: String
    }
  ]
}, {
  timestamps: true
});

// Generate unique tracking ID
linkSchema.pre('save', function(next) {
  if (!this.trackingId) {
    this.trackingId = generateTrackingId();
  }
  next();
});

function generateTrackingId() {
  return Math.random().toString(36).substring(2, 8) + Date.now().toString(36);
}

// Index for better query performance
linkSchema.index({ userId: 1, createdAt: -1 });
linkSchema.index({ userId: 1, tags: 1 });
linkSchema.index({ trackingId: 1 });

module.exports = mongoose.model('Link', linkSchema); 