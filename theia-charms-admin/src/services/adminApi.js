const BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const KEY = 'tc_admin_token';

export const tokenStore = {
  get: () => localStorage.getItem(KEY) || sessionStorage.getItem(KEY),
  set(token, remember) { this.clear(); (remember ? localStorage : sessionStorage).setItem(KEY, token); },
  clear() { localStorage.removeItem(KEY); sessionStorage.removeItem(KEY); },
};

async function request(path, { method = 'GET', body, form, blob } = {}) {
  const headers = {};
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers['Content-Type'] = 'application/json';
  let res;
  try { res = await fetch(`${BASE}${path}`, { method, headers, body: form || (body ? JSON.stringify(body) : undefined) }); }
  catch { throw new Error('Cannot reach the server. Check your connection or API URL.'); }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    if (res.status === 401 && !path.startsWith('/auth/login')) window.dispatchEvent(new Event('tc:unauthorized'));
    const err = new Error(data.message || `Request failed (${res.status})`); err.status = res.status; throw err;
  }
  return blob ? res : res.json();
}

const qs = (o = {}) => { const p = new URLSearchParams(Object.entries(o).filter(([, v]) => v !== '' && v != null)); return p.toString() ? `?${p}` : ''; };

export const api = {
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
  me: () => request('/auth/me'),
  forgot: (email) => request('/auth/forgot-password', { method: 'POST', body: { email } }),
  reset: (token, password) => request('/auth/reset-password', { method: 'POST', body: { token, password } }),
  dashboard: () => request('/admin/dashboard'),
  products: (params) => request(`/admin/products${qs(params)}`),
  product: (id) => request(`/admin/products/${id}`),
  createProduct: (b) => request('/admin/products', { method: 'POST', body: b }),
  updateProduct: (id, b) => request(`/admin/products/${id}`, { method: 'PUT', body: b }),
  setStatus: (id, b) => request(`/admin/products/${id}/status`, { method: 'PATCH', body: b }),
  deleteProduct: (id) => request(`/admin/products/${id}`, { method: 'DELETE' }),
  duplicateProduct: (id) => request(`/admin/products/${id}/duplicate`, { method: 'POST' }),
  upload: (files) => { const f = new FormData(); files.forEach((x) => f.append('images', x)); return request('/admin/upload', { method: 'POST', form: f }); },
  importStatus: () => request('/admin/import/status'),
  analyzePages: (files) => { const f = new FormData(); files.forEach((x) => f.append('pages', x)); return request('/admin/import/analyze', { method: 'POST', form: f }); },
  confirmImport: (items) => request('/admin/import/confirm', { method: 'POST', body: { items } }),
  categories: () => request('/admin/categories'),
  saveCategory: (b, id) => request(id ? `/admin/categories/${id}` : '/admin/categories', { method: id ? 'PUT' : 'POST', body: b }),
  deleteCategory: (id) => request(`/admin/categories/${id}`, { method: 'DELETE' }),
  banners: () => request('/admin/banners'),
  saveBanner: (b, id) => request(id ? `/admin/banners/${id}` : '/admin/banners', { method: id ? 'PUT' : 'POST', body: b }),
  deleteBanner: (id) => request(`/admin/banners/${id}`, { method: 'DELETE' }),
  users: () => request('/admin/users'),
  createUser: (b) => request('/admin/users', { method: 'POST', body: b }),
  updateUser: (id, b) => request(`/admin/users/${id}`, { method: 'PATCH', body: b }),
  deleteUser: (id) => request(`/admin/users/${id}`, { method: 'DELETE' }),
  logs: (params) => request(`/admin/logs${qs(params)}`),
  settings: () => fetch(`${BASE}/settings/public`).then((r) => r.json()),
  saveSettings: (b) => request('/admin/settings', { method: 'PUT', body: b }),
  async download(params) {
    const res = await request(`/admin/export${qs(params)}`, { blob: true });
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `theia-charms-${new Date().toISOString().slice(0, 10)}.${params.format || 'xlsx'}`;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(a.href);
  },
};
