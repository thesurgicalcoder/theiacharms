// Photo storage: Cloudinary if configured, otherwise the local ./uploads folder (served by this API at /uploads).
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const env = require('../config/env');
const { cloudinary, cloudinaryEnabled } = require('../config/cloudinary');

const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };

exports.mode = cloudinaryEnabled ? 'cloudinary' : 'local';

exports.save = async (file, req) => {
  if (cloudinaryEnabled) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({ folder: 'theia-charms', resource_type: 'image', transformation: [{ width: 1400, crop: 'limit' }] },
        (err, r) => (err ? reject(err) : resolve({ url: r.secure_url, publicId: r.public_id }))).end(file.buffer);
    });
  }
  const ext = EXT[file.mimetype];
  if (!ext) throw new Error('Unsupported image type');
  await fs.promises.mkdir(env.uploadDir, { recursive: true });
  const name = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`;
  await fs.promises.writeFile(path.join(env.uploadDir, name), file.buffer);
  const base = env.publicApiUrl || `${req.protocol}://${req.get('host')}`;
  return { url: `${base}/uploads/${name}`, publicId: `local:${name}` };
};

exports.remove = async (publicId) => {
  if (!publicId) return;
  if (publicId.startsWith('local:')) { await fs.promises.unlink(path.join(env.uploadDir, path.basename(publicId.slice(6)))).catch(() => null); return; }
  if (cloudinaryEnabled) await cloudinary.uploader.destroy(publicId).catch(() => null);
};
