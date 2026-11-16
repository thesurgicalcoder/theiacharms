const rateLimit = require('express-rate-limit');
const mk = (windowMs, limit, message) =>
  rateLimit({ windowMs, limit, standardHeaders: 'draft-7', legacyHeaders: false,
    message: { success: false, code: 'RATE_LIMITED', message } });

exports.publicLimiter = mk(15 * 60 * 1000, 300, 'Too many requests, please try again later.');
exports.loginLimiter = mk(15 * 60 * 1000, 5, 'Too many login attempts. Try again in 15 minutes.');
exports.adminLimiter = mk(15 * 60 * 1000, 1000, 'Too many requests, please try again later.');
exports.importLimiter = mk(15 * 60 * 1000, 40, 'Too many import requests. Please wait a few minutes.');
