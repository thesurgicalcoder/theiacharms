const logs = require('../db/logs');

// Never let logging break the main request.
async function logActivity(req, action, targetType, targetId, details = {}) {
  try {
    logs.add({ userId: req.user?._id, userName: req.user?.name, userRole: req.user?.role, action, targetType, targetId: targetId == null ? undefined : String(targetId), details });
  } catch (e) { console.error('[activity] failed to log:', e.message); }
}
module.exports = { logActivity };
