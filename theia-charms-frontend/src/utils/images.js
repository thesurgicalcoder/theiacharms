/* global __IMAGES__ */
// Pictures found in public/images at start-up (see vite.config.js). Returns null when a picture is not there, so the site shows a neat fallback.
const IMAGES = typeof __IMAGES__ !== 'undefined' ? __IMAGES__ : {};
export const siteImage = (name) => IMAGES[name] || null;
// only allow normal links coming from admin-entered banners
export const safeLink = (u) => (typeof u === 'string' && (u.startsWith('/') && !u.startsWith('//') || /^https?:\/\//i.test(u)) ? u : null);
