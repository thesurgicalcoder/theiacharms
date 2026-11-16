const mongoose = require('mongoose');
const Counter = require('./Counter');
const slugify = require('../utils/slugify');

const imageSchema = new mongoose.Schema(
  { url: { type: String, required: true }, publicId: String, isPrimary: { type: Boolean, default: false }, order: { type: Number, default: 0 } },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    productId: { type: String, unique: true, index: true }, // TC-001
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, unique: true, lowercase: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    categoryName: { type: String, default: '' },
    description: { type: String, default: '', maxlength: 2000 },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, default: null, min: 0 },
    stock: { type: Number, default: 1, min: 0 },
    isSoldOut: { type: Boolean, default: false, index: true },
    images: { type: [imageSchema], default: [], validate: [(a) => a.length <= 5, 'Maximum 5 images per product'] },
    isFeatured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: true },
    isFestive: { type: Boolean, default: false },
    isBudget: { type: Boolean, default: false },
    isMinimal: { type: Boolean, default: false },
    isGift: { type: Boolean, default: false },
    isDailyWear: { type: Boolean, default: false },
    emoji: { type: String, default: '✨' }, // placeholder when no photo
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', productId: 'text', description: 'text' });

productSchema.pre('validate', async function (next) {
  try {
    if (!this.productId) {
      const n = await Counter.next('product');
      this.productId = `TC-${String(n).padStart(3, '0')}`;
    }
    if (!this.slug || this.isModified('name')) this.slug = `${slugify(this.name)}-${this.productId.toLowerCase()}`;
    next();
  } catch (e) { next(e); }
});

// stock <= 0 forces sold out
productSchema.pre('save', function (next) {
  if (this.stock <= 0) this.isSoldOut = true;
  if (this.images.length && !this.images.some((i) => i.isPrimary)) this.images[0].isPrimary = true;
  next();
});

module.exports = mongoose.model('Product', productSchema);
