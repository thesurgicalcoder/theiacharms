const { run, all, tx } = require('./index');
const env = require('../config/env');

const defaults = () => ({
  whatsappPhone: env.whatsappPhone, brandName: 'THEIA CHARMS', tagline: 'Little Charms, Big Smiles',
  announcement: '★ New Arrivals Every Week | 📷 Follow Us on Instagram | 💬 Enquire on WhatsApp',
  instagramUrl: '', address: 'Bamda Colony, Subhash Chowk, Bayana', email: '',
});
exports.getPublic = () => { const s = defaults(); for (const r of all('SELECT key, value FROM settings')) if (r.key in s) s[r.key] = r.value; return s; };
exports.update = (patch) => {
  const keys = Object.keys(defaults());
  tx(() => keys.forEach((k) => { if (patch[k] !== undefined) run('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', [k, String(patch[k])]); }));
  return exports.getPublic();
};
