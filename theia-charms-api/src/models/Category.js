const mongoose = require('mongoose');
const slugify = require('../utils/slugify');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    imageUrl: { type: String, default: '' },
    icon: { type: String, default: '✨' },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

categorySchema.pre('validate', function (next) {
  if (this.isModified('name') || !this.slug) this.slug = slugify(this.name);
  next();
});
module.exports = mongoose.model('Category', categorySchema);
