const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['milestone', 'system', 'other'],
    default: 'milestone'
  },
  message: {
    type: String,
    required: true
  },
  linkId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Link',
    required: false
  },
  groupId: {
    type: String,
    required: false
  },
  milestone: {
    type: Number,
    required: false
  },
  read: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema); 