// Runs on every start: makes sure default categories and the first owner exist.
const bcrypt = require('bcryptjs');
const categories = require('./categories');
const users = require('./users');

const DEFAULT_CATEGORIES = [['Earrings', '💎'], ['Pendants', '💛'], ['Bracelets', '🌿'], ['Rings', '💍'], ['Hair Accessories', '🎀'], ['Hair Clips', '📎'], ['Keychains', '🔑'], ['More', '✨']];

async function ensureOwner() {
  if (users.count() > 0) return;
  const email = (process.env.INITIAL_OWNER_EMAIL || '').trim();
  const password = process.env.INITIAL_OWNER_PASSWORD || '';
  if (!email || password.length < 10) {
    console.warn('[setup] No users yet. Set INITIAL_OWNER_EMAIL and INITIAL_OWNER_PASSWORD (10+ chars) in .env and restart to create the owner login.');
    return;
  }
  users.create({ name: process.env.INITIAL_OWNER_NAME || 'Owner', email, role: 'owner', passwordHash: await bcrypt.hash(password, 12) });
  console.log(`[setup] Owner account created: ${email}`);
}
function ensureCategories() {
  if (categories.count() > 0) return;
  DEFAULT_CATEGORIES.forEach(([name, icon], i) => categories.create({ name, icon, displayOrder: i }));
  console.log('[setup] Default categories created');
}
module.exports = async function bootstrap() { ensureCategories(); await ensureOwner(); };
module.exports.DEFAULT_CATEGORIES = DEFAULT_CATEGORIES;
