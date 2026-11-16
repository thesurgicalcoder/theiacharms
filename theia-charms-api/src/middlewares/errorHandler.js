const env = require('../config/env');

exports.notFound = (req, res) =>
  res.status(404).json({ success: false, code: 'NOT_FOUND', message: `Route not found: ${req.method} ${req.originalUrl}` });

// eslint-disable-next-line no-unused-vars
exports.errorHandler = (err, _req, res, _next) => {
  let status = err.status || 500;
  let code = err.code || 'SERVER_ERROR';
  let message = err.message || 'Something went wrong';

  if (/UNIQUE constraint failed/i.test(err.message || '')) {
    status = 409; code = 'DUPLICATE';
    message = `That ${(/\.(\w+)$/.exec(err.message) || [])[1] || 'value'} is already in use`.replace('_', ' ');
  } else if (/FOREIGN KEY constraint failed/i.test(err.message || '')) { status = 409; code = 'IN_USE'; message = 'This item is still referenced by other records'; }
  else if (err.name === 'MulterError') { status = 400; code = 'UPLOAD_ERROR'; message = err.message; }

  if (status >= 500) console.error('[error]', err);
  res.status(status).json({ success: false, code, message: status >= 500 && env.isProd ? 'Internal server error' : message });
};
