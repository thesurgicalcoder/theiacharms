const cloudinary = require('cloudinary').v2;
const env = require('./env');

const { cloudName, apiKey, apiSecret } = env.cloudinary;
const enabled = Boolean(cloudName && apiKey && apiSecret);
if (enabled) cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });

module.exports = { cloudinary, cloudinaryEnabled: enabled };
