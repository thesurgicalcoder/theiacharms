import { SAMPLE_CATEGORIES, SAMPLE_PRODUCTS, SAMPLE_SETTINGS } from '../data/sampleData';

const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
export const DEMO_MODE = !BASE;

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

// Loads everything the storefront needs. If the API is unreachable, falls back to sample data so the site never looks broken.
export async function loadCatalog() {
  if (DEMO_MODE) return { products: SAMPLE_PRODUCTS, categories: SAMPLE_CATEGORIES, settings: SAMPLE_SETTINGS, live: false };
  try {
    const [p, c, s] = await Promise.all([get('/products?limit=100&sort=featured'), get('/categories'), get('/settings/public')]);
    return {
      products: p.data,
      categories: c.data,
      settings: { ...SAMPLE_SETTINGS, ...s.data, whatsappPhone: s.data.whatsappPhone || import.meta.env.VITE_WHATSAPP_PHONE || SAMPLE_SETTINGS.whatsappPhone },
      live: true,
    };
  } catch (e) {
    console.warn('API unreachable, using sample data:', e.message);
    return { products: SAMPLE_PRODUCTS, categories: SAMPLE_CATEGORIES, settings: SAMPLE_SETTINGS, live: false };
  }
}
