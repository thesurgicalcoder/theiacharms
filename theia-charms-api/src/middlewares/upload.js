const multer = require('multer');
module.exports = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
  fileFilter: (_req, file, cb) =>
    /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype) ? cb(null, true) : cb(Object.assign(new Error('Only JPG, PNG, WEBP or GIF images are allowed'), { status: 400, code: 'BAD_FILE' })),
});
