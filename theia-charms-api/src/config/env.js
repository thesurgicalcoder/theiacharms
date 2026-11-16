require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Fix for networks with DNS problems (not needed for SQLite itself, kept for Gemini/Cloudinary calls)
if (process.env.DNS_SERVERS) require('dns').setServers(process.env.DNS_SERVERS.split(',').map((x) => x.trim()).filter(Boolean));

const isProd = (process.env.NODE_ENV || 'development') === 'production';
const sqlitePath = process.env.SQLITE_PATH || './data/theia.db';

// JWT secret: required in production; in development one is generated once and kept in ./data/jwt.secret
function jwtSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (isProd) { console.error('[env] JWT_SECRET is required in production.'); process.exit(1); }
  const file = path.resolve(path.dirname(sqlitePath === ':memory:' ? './data/x' : sqlitePath), 'jwt.secret');
  try { return fs.readFileSync(file, 'utf8').trim(); } catch { /* first run */ }
  const s = require('crypto').randomBytes(48).toString('hex');
  try { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, s, { mode: 0o600 }); } catch { /* read-only fs: session-only secret */ }
  return s;
}

const env = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd,
  sqlitePath,
  uploadDir: path.resolve(process.env.UPLOAD_DIR || './uploads'),
  publicApiUrl: (process.env.PUBLIC_API_URL || '').replace(/\/$/, ''),
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:5174').split(',').map((s) => s.trim()).filter(Boolean),
  jwtSecret: jwtSecret(),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  whatsappPhone: process.env.WHATSAPP_PHONE || '919876543210',
  adminUrl: process.env.ADMIN_URL || 'http://localhost:5174',
  cloudinary: { cloudName: process.env.CLOUDINARY_CLOUD_NAME, apiKey: process.env.CLOUDINARY_API_KEY, apiSecret: process.env.CLOUDINARY_API_SECRET },
  gemini: { key: process.env.GEMINI_API_KEY, model: process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite' },
};
env.aiProvider = env.gemini.key ? 'gemini' : 'none';
if (env.isProd && env.jwtSecret.length < 32) { console.error('[env] JWT_SECRET must be at least 32 characters in production.'); process.exit(1); }
module.exports = env;
