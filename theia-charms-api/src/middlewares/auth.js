const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { verify } = require('../utils/jwt');
const users = require('../db/users');

exports.authenticate = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new AppError('Bearer token missing or invalid', 401, 'UNAUTHORIZED');
  let payload;
  try { payload = verify(token); } catch { throw new AppError('Bearer token missing or invalid', 401, 'UNAUTHORIZED'); }
  const user = users.byId(payload.userId);
  if (!user || !user.isActive) throw new AppError('Account not found or deactivated', 401, 'UNAUTHORIZED');
  req.user = user;
  next();
});

// RBAC: viewer = read-only | manager = + stock/status + PDF import | admin = + product CRUD, categories, banners, export, logs | owner = + users, settings
exports.authorizeRoles = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) return next(new AppError('Insufficient role privileges', 403, 'FORBIDDEN'));
  next();
};
exports.requireOwner = exports.authorizeRoles('owner');
exports.requireAdminOrAbove = exports.authorizeRoles('owner', 'admin');
exports.requireManagerOrAbove = exports.authorizeRoles('owner', 'admin', 'manager');
