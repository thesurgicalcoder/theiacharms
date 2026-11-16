const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const users = require('../db/users');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { sign } = require('../utils/jwt');
const { logActivity } = require('../utils/activity');
const env = require('../config/env');

const strongEnough = (p) => typeof p === 'string' && p.length >= 8;
const hash = (p) => bcrypt.hash(p, 12);

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new AppError('Email and password are required');
  const found = users.credentials(email);
  // same message for unknown user / wrong password (no user enumeration)
  if (!found || !(await bcrypt.compare(String(password), found.hash))) throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  if (!found.user.isActive) throw new AppError('This account has been deactivated', 403, 'DEACTIVATED');
  users.touchLogin(found.user._id);
  req.user = users.byId(found.user._id);
  await logActivity(req, 'LOGIN', 'auth', req.user.email);
  res.json({ success: true, token: sign(req.user), user: req.user });
});

exports.me = (req, res) => res.json({ success: true, user: req.user });

exports.forgotPassword = asyncHandler(async (req, res) => {
  const user = users.byEmail(req.body.email || '');
  if (user && user.isActive) {
    const token = crypto.randomBytes(32).toString('hex');
    users.setResetToken(user._id, crypto.createHash('sha256').update(token).digest('hex'), new Date(Date.now() + 30 * 60 * 1000).toISOString());
    // No mail provider is wired in. The link is printed to the server log; the owner can also reset any password from Admin Users.
    console.log(`[auth] Password reset link for ${user.email}: ${env.adminUrl}/reset-password?token=${token}`);
  }
  res.json({ success: true, message: 'If that account exists, a reset link has been generated.' });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  if (!strongEnough(password)) throw new AppError('Password must be at least 8 characters');
  const user = users.byResetToken(crypto.createHash('sha256').update(String(token || '')).digest('hex'));
  if (!user) throw new AppError('Reset link is invalid or has expired', 400, 'INVALID_TOKEN');
  users.setPassword(user._id, await hash(password));
  res.json({ success: true, message: 'Password updated. You can log in now.' });
});

// ---- owner-only user management ----
exports.listUsers = asyncHandler(async (_req, res) => res.json({ success: true, data: users.list() }));

exports.createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name?.trim() || !email?.trim()) throw new AppError('Name and email are required');
  if (!strongEnough(password)) throw new AppError('Temporary password must be at least 8 characters');
  if (!['admin', 'manager', 'viewer'].includes(role)) throw new AppError('Role must be admin, manager or viewer (there is only one owner)');
  const user = users.create({ name: name.trim(), email, role, passwordHash: await hash(password) });
  await logActivity(req, 'USER_INVITE', 'user', user.email, { role });
  res.status(201).json({ success: true, data: user });
});

exports.updateUser = asyncHandler(async (req, res) => {
  const user = users.byId(req.params.id);
  if (!user) throw new AppError('User not found', 404);
  const isSelf = user._id === req.user._id;
  if (user.role === 'owner' && !isSelf) throw new AppError('The owner account cannot be modified by others', 403);
  if (isSelf && (req.body.isActive === false || (req.body.role && req.body.role !== 'owner'))) throw new AppError('You cannot deactivate or demote yourself', 400);
  const patch = {};
  if (req.body.role !== undefined && !isSelf) { if (!['admin', 'manager', 'viewer'].includes(req.body.role)) throw new AppError('Invalid role'); patch.role = req.body.role; }
  if (req.body.isActive !== undefined) patch.isActive = Boolean(req.body.isActive);
  if (req.body.name) patch.name = String(req.body.name).trim();
  if (req.body.password) { if (!strongEnough(req.body.password)) throw new AppError('Password must be at least 8 characters'); patch.passwordHash = await hash(req.body.password); }
  const saved = users.update(user._id, patch);
  await logActivity(req, 'USER_UPDATE', 'user', saved.email, { role: saved.role, isActive: saved.isActive });
  res.json({ success: true, data: saved });
});

exports.deleteUser = asyncHandler(async (req, res) => {
  const user = users.byId(req.params.id);
  if (!user) throw new AppError('User not found', 404);
  if (user.role === 'owner') throw new AppError('The owner account cannot be deleted', 403);
  users.remove(user._id);
  await logActivity(req, 'USER_REVOKE', 'user', user.email);
  res.json({ success: true, message: 'Access revoked' });
});
