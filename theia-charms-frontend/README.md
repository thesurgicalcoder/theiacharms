# theia-charms-frontend

Customer website for THEIA CHARMS — React 18 + Vite + Tailwind. **No cart, no checkout**: every enquiry goes to WhatsApp.

## Run locally
```bash
npm install
cp .env.example .env
npm run dev          # http://localhost:5173
```
If `VITE_API_URL` is empty (or the API is down) the site shows built-in sample products, so you can preview the design without a backend.

## Features
Homepage (hero carousel, trust strip, categories, festive banner, new arrivals, collections, story) · filterable catalogue page (search by name/`TC-001`, category, availability, sort; URL-shareable) · product quick-view modal with photo gallery · localStorage wishlist drawer · WhatsApp enquiry per product (sold-out items switch to a "notify me" message) · floating WhatsApp button · toasts.

The WhatsApp number is read from the API (editable in Admin → Settings); `VITE_WHATSAPP_PHONE` is only a fallback.

## Deploy (Vercel)
Import the repo → Framework: Vite → set `VITE_API_URL=https://<your-api>/api`. `vercel.json` already handles SPA routing. Remember to add this site's origin to the API's `CORS_ORIGIN`.

The catalogue loads up to 100 products in one request (the API's page limit) and filters in the browser. For a much larger catalogue, switch `CataloguePage` to server-side filtering via `GET /products`.

## Pictures (public/images)
The site picks pictures up by name, with any extension (.png, .jpg, .webp): `logo`, `favicon` (emblem only, transparent), `hero-desktop`, `hero-mobile`, `cat-<category-slug>` (e.g. `cat-earrings`), `festive-banner`, `col-minimal|festive|gift|daily`, `our-story`, `floral-left`, `floral-right`, `og-share`.
- `npm run check-images` lists what is found / missing / too heavy (aim for under 300 KB each).
- **Restart `npm run dev` after adding or renaming pictures.** A missing picture just falls back to a plain gradient/emoji.
- Extra hero slides come from Admin → Banners (they need an image URL).
- Set `VITE_SITE_URL` so WhatsApp/Instagram link previews can show `og-share`.
