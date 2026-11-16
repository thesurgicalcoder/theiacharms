const { run, get, all, now } = require('./index');
const id = (v) => { const n = Number(v); return Number.isInteger(n) ? n : -1; };
const map = (r) => r && ({ _id: String(r.id), name: r.name, email: r.email, role: r.role, isActive: !!r.is_active, lastLogin: r.last_login, createdAt: r.created_at, updatedAt: r.updated_at });

exports.list = () => all('SELECT * FROM users ORDER BY id').map(map);
exports.count = () => get('SELECT COUNT(*) n FROM users').n;
exports.byId = (v) => map(get('SELECT * FROM users WHERE id = ?', [id(v)]));
exports.byEmail = (e) => map(get('SELECT * FROM users WHERE email = ?', [String(e).toLowerCase().trim()]));
exports.credentials = (e) => { const r = get('SELECT * FROM users WHERE email = ?', [String(e).toLowerCase().trim()]); return r ? { user: map(r), hash: r.password_hash } : null; };
exports.create = ({ name, email, role, passwordHash }) => {
  const t = now();
  run('INSERT INTO users (name, email, password_hash, role, is_active, created_at, updated_at) VALUES (?,?,?,?,1,?,?)', [name, String(email).toLowerCase().trim(), passwordHash, role, t, t]);
  return exports.byEmail(email);
};
exports.update = (v, patch) => {
  const map2 = { name: 'name', role: 'role', isActive: 'is_active', passwordHash: 'password_hash' };
  const sets = Object.keys(patch).filter((k) => map2[k] && patch[k] !== undefined);
  if (sets.length) run(`UPDATE users SET ${sets.map((k) => `${map2[k]} = ?`).join(', ')}, updated_at = ? WHERE id = ?`, [...sets.map((k) => patch[k]), now(), id(v)]);
  return exports.byId(v);
};
exports.touchLogin = (v) => run('UPDATE users SET last_login = ? WHERE id = ?', [now(), id(v)]);
exports.remove = (v) => { run('DELETE FROM users WHERE id = ?', [id(v)]); };
exports.setResetToken = (v, hash, expiresIso) => run('UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?', [hash, expiresIso, id(v)]);
exports.byResetToken = (hash) => map(get('SELECT * FROM users WHERE reset_token = ? AND reset_expires > ?', [hash, now()]));
exports.setPassword = (v, hash) => run('UPDATE users SET password_hash = ?, reset_token = NULL, reset_expires = NULL, updated_at = ? WHERE id = ?', [hash, now(), id(v)]);
