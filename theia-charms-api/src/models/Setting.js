const mongoose = require('mongoose');
const env = require('../config/env');

const settingSchema = new mongoose.Schema({
  _id: { type: String, default: 'public' },
  whatsappPhone: { type: String, default: env.whatsappPhone },
  brandName: { type: String, default: 'THEIA CHARMS' },
  tagline: { type: String, default: 'Little Charms, Big Smiles' },
  announcement: { type: String, default: '★ New Arrivals Every Week | 📷 Follow Us on Instagram | 💬 Enquire on WhatsApp' },
  instagramUrl: { type: String, default: '' },
  address: { type: String, default: 'Bamda Colony, Subhash Chowk, Bayana' },
  email: { type: String, default: '' },
});

settingSchema.statics.getPublic = async function () {
  let doc = await this.findById('public');
  if (!doc) doc = await this.create({ _id: 'public' });
  return doc;
};
module.exports = mongoose.model('Setting', settingSchema);
