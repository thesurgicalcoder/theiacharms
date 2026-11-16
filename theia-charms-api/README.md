# theia-charms-api

Shared REST API for THEIA CHARMS — used by **theia-charms-frontend** (public catalogue) and **theia-charms-admin** (management portal).
Node 20+ · Express · **SQLite** (no database server to install) · JWT + bcrypt · ExcelJS · optional Cloudinary / Gemini.

## Run locally
```bash
npm install
cp .env.example .env        # set INITIAL_OWNER_EMAIL / INITIAL_OWNER_PASSWORD / WHATSAPP_PHONE
npm run dev                 # http://localhost:5000/api/health
npm run seed                # optional: 8 sample products
```
On first start the API creates `./data/theia.db`, the 8 default categories and the owner login from `.env`. Nothing else to install.

**SQLite driver:** uses Node's built-in `node:sqlite` (Node 22.13+ / 24 LTS — recommended). On older Node it falls back to `better-sqlite3` (installed by `npm install`). Node prints an "ExperimentalWarning" for the built-in driver; it is harmless.

## Data & photos
- Database: one file, `./data/theia.db` (`SQLITE_PATH` to move it). **Back it up** by copying `data/` and `uploads/`.
- Photos: saved in `./uploads` and served at `/uploads/...` — no account needed. Set the three `CLOUDINARY_*` variables to use Cloudinary instead (recommended when live).
- `JWT_SECRET` may be empty in development (generated into `data/jwt.secret`); it is **required in production**.

## Roles (RBAC)
| Action | owner | admin | manager | viewer |
|---|:-:|:-:|:-:|:-:|
| View dashboard / products / categories / banners | ✅ | ✅ | ✅ | ✅ |
| Change stock & Sold-Out status | ✅ | ✅ | ✅ | ❌ |
| **Import products from PDF/photos** and upload images | ✅ | ✅ | ✅ | ❌ |
| Create / edit / duplicate / delete products | ✅ | ✅ | ❌ | ❌ |
| Manage categories & banners | ✅ | ✅ | ❌ | ❌ |
| Activity logs, Excel/CSV export | ✅ | ✅ | ❌ | ❌ |
| Manage admin users, public settings | ✅ | ❌ | ❌ | ❌ |

No public registration: only the owner creates accounts.

## Endpoints
**Public** — `GET /api/products` (`q, category, collection, availability, minPrice, maxPrice, sort, page, limit`), `/products/highlights`, `/products/:TC-001|slug`, `/categories`, `/banners`, `/settings/public`, `/health`

**Auth** — `POST /api/auth/login` (5 tries / 15 min), `GET /me`, `POST /forgot-password`, `POST /reset-password`

**Admin** (Bearer token) — `GET /api/admin/dashboard`, `/products` (GET/POST/PUT/DELETE, `PATCH /:id/status`, `POST /:id/duplicate`), `POST /upload`, `GET /import/status`, `POST /import/analyze`, `POST /import/confirm`, `/categories`, `/banners`, `/users` (owner), `GET /logs`, `GET /export?format=xlsx|csv&filter=all|in_stock|sold_out`, `PUT /settings` (owner)

## AI import (PDF -> products) — free
Set `GEMINI_API_KEY` (free key from https://aistudio.google.com, no card) and optionally `GEMINI_MODEL`. The admin portal renders PDF pages in the browser and sends page images to `/import/analyze`; Gemini returns name, description, category (only from your existing categories), any printed price and a photo box. **Nothing is saved until the user reviews and presses Confirm & Add.**
- Without a key the admin Import page still works in *manual layout* mode (page cut into a grid; you choose name/category/price).
- Selling price is never guessed — blank until typed. Duplicate names are flagged.
- The free tier has rate limits and Google may use free-tier requests to improve its products; do not upload private documents.

## Notes
- **Forgot password:** no email service is wired in; the reset link is printed in the server log. The owner can also reset any password in Admin Users.
- `stock <= 0` automatically marks a product Sold Out.

## Deploy
SQLite lives in a file, so the host needs a **persistent disk** (or use a VPS). On hosts with a temporary filesystem (e.g. free Render) the database and `uploads/` are wiped on every redeploy. Set `NODE_ENV=production`, a 32+ char `JWT_SECRET`, `CORS_ORIGIN=https://site,https://admin`, and point `SQLITE_PATH` / `UPLOAD_DIR` at the mounted disk (e.g. `/var/data/theia.db`). Use Cloudinary for photos. Health check: `/api/health`.
