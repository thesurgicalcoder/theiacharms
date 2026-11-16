const mongoose = require('mongoose');
const logSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: String,
  userRole: String,
  action: { type: String, required: true, index: true },
  targetType: { type: String, enum: ['product', 'category', 'banner', 'user', 'auth', 'export', 'settings'] },
  targetId: String,
  details: mongoose.Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now, index: true },
});
module.exports = mongoose.model('ActivityLog', logSchema);
