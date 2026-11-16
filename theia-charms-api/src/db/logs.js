const { run, get, all, now } = require('./index');
const esc = (s) => String(s).replace(/[\\%_]/g, '\\$&');
const parse = (s) => { try { return s ? JSON.parse(s) : undefined; } catch { return undefined; } };
const map = (r) => ({ _id: String(r.id), userId: r.user_id, userName: r.user_name, userRole: r.user_role, action: r.action, targetType: r.target_type, targetId: r.target_id, details: parse(r.details), timestamp: r.timestamp });

exports.add = (e) => run('INSERT INTO activity_logs (user_id, user_name, user_role, action, target_type, target_id, details, timestamp) VALUES (?,?,?,?,?,?,?,?)',
  [e.userId == null ? null : Number(e.userId), e.userName, e.userRole, e.action, e.targetType, e.targetId, e.details ? JSON.stringify(e.details) : null, now()]);

const GROUPS = { product: ["action LIKE 'PRODUCT\\_%' ESCAPE '\\'", "action LIKE 'PRICE\\_%' ESCAPE '\\'"], stock: ["action LIKE 'STOCK\\_%' ESCAPE '\\'"], team: ["action LIKE 'USER\\_%' ESCAPE '\\'", "action LIKE 'LOGIN%'"] };
exports.list = ({ type, q }, page, limit) => {
  const w = []; const p = [];
  if (GROUPS[type]) w.push(`(${GROUPS[type].join(' OR ')})`);
  if (q && String(q).trim()) { const l = `%${esc(String(q).trim())}%`; w.push("(user_name LIKE ? ESCAPE '\\' OR target_id LIKE ? ESCAPE '\\' OR action LIKE ? ESCAPE '\\')"); p.push(l, l, l); }
  const sql = w.length ? `WHERE ${w.join(' AND ')}` : '';
  const total = get(`SELECT COUNT(*) n FROM activity_logs ${sql}`, p).n;
  const rows = all(`SELECT * FROM activity_logs ${sql} ORDER BY timestamp DESC, id DESC LIMIT ? OFFSET ?`, [...p, limit, (page - 1) * limit]);
  return { items: rows.map(map), total };
};
