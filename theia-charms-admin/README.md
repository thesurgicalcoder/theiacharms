# theia-charms-admin

Admin portal for THEIA CHARMS — React 18 + Vite + Tailwind. Talks to **theia-charms-api**.

## Run locally
```bash
npm install
cp .env.example .env     # VITE_API_BASE_URL=http://localhost:5000/api
npm run dev              # http://localhost:5174
```
Log in with the owner account created by `npm run seed` in the API repo.

## Pages
Login (+ forgot/reset password) · Dashboard (KPIs, recent products, status donut) · Products (search/filter/paginate, one-click Sold Out toggle, edit, duplicate, delete) · Add/Edit product (drag-and-drop photos up to 5 or paste URLs, reorder, collection flags) · Import from PDF (owner/admin/manager) · Categories · Banners · Admin Users (owner) · Activity Logs · Export Centre (.xlsx / .csv) · Settings (WhatsApp number, announcement, address — owner).

Menu items and buttons are hidden by role, but the **API enforces permissions** — hiding is cosmetic only.

## Deploy (Vercel)
Set `VITE_API_BASE_URL=https://<your-api>/api`. `vercel.json` adds SPA routing and security headers (no framing, HSTS). Add this origin to the API's `CORS_ORIGIN`. Image uploads go through the API (Cloudinary credentials live only on the API server).

## Import from PDF
Admin → *Import from PDF*: drop a PDF or photos of purchased items, then choose how products are found:
- **AI (free Gemini key on the API)** — proposes name, category and photo crop for each product.
- **Manual layout (no key needed)** — you say how many products are on a page (1, 2×2, 2×3, 3×3 …); the page is cut into equal parts.

Then fix anything, set the selling price (bulk "Apply to selected" available) and press **Confirm & Add**. Nothing is saved before that. Crops are approximate: switch a card to *Whole page* or *Replace photo* when one is off.
