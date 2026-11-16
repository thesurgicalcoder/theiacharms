const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['owner', 'admin', 'manager', 'viewer'], default: 'viewer' },
    isActive: { type: Boolean, default: true },
    lastLogin: Date,
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = function (plain) { return bcrypt.compare(plain, this.passwordHash); };
userSchema.statics.hashPassword = (plain) => bcrypt.hash(plain, 12);
userSchema.set('toJSON', {
  transform: (_d, r) => { delete r.passwordHash; delete r.resetPasswordToken; delete r.resetPasswordExpires; delete r.__v; return r; },
});
module.exports = mongoose.model('User', userSchema);
