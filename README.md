# Glow with Azmir — Backend

Node/Express + MongoDB API that powers the **Glow with Azmir** admin SaaS panel
and (later) the Flutter tablet. Mirrors the architecture of `noor-beauty-backend`.

- **No login** (per requirements). Optional light protection via an `API_KEY`
  header for writes — off by default.
- Auto-seeds starter data when the database is empty.
- Local dev needs **zero setup**: if `MONGODB_URI` is empty, an in-memory
  MongoDB is started automatically (data not persisted).

## Run locally

```bash
npm install
npm start          # http://localhost:4000  (in-memory DB, auto-seeded)
# or: npm run dev  (nodemon)
```

Health check: `GET http://localhost:4000/health`

To use a real database, copy `.env.example` → `.env` and set `MONGODB_URI`.
Then optionally `npm run seed` to (re)load starter data.

## Data models

| Model | Purpose |
| --- | --- |
| `Product` | name, sku, category, **buyPrice** (admin-only), **sellPrice** (public), stock |
| `Sale` | customerName, customerPhone, items[], total |
| `Customer` | phone (unique), name, lastItems — for type-ahead/lookup |
| `LedgerEntry` | income/expense entries (sales auto-create income) |
| `GalleryItem` | title, category, imageUrl, active |
| `Advertise` | singleton: videoUrl (.mp4) + description for the public home page |
| `Settings` | singleton: storeName, phone, currency, lowStockThreshold |

## API

```
GET    /health

GET    /api/products            list (admin: includes buyPrice + status)
GET    /api/products/public     public list (sellPrice only — for the website)
POST   /api/products            create
PUT    /api/products/:id        update
DELETE /api/products/:id        delete

GET    /api/sales/today         { total, orders, count, items[] }
GET    /api/sales               recent sales
POST   /api/sales               record a sale (decrements stock, logs income, upserts customer)

GET    /api/customers/suggest?q=017   type-ahead (min 4 digits)
GET    /api/customers/:phone          lookup

GET    /api/accounting/summary        income/expenses/profit/stock value + ledger
POST   /api/accounting/entries        add income/expense entry
DELETE /api/accounting/entries/:id

GET    /api/gallery
POST   /api/gallery             multipart: image + title/category
PUT    /api/gallery/:id
DELETE /api/gallery/:id

GET    /api/advertise           { videoUrl, description, updatedAt }
PUT    /api/advertise           multipart: video (.mp4, optional) + description

GET    /api/settings
PUT    /api/settings
```

Uploaded files are served from `/uploads/...`.

> **Production note:** uploads are written to local disk. Hosts like Railway
> have **ephemeral disks** — for production, switch advertise/gallery uploads to
> S3 or Cloudinary (env-configurable). See `DEPLOY.md`.

## Environment

See `.env.example`. Key vars: `MONGODB_URI`, `PORT`, `CORS_ORIGIN`,
`PUBLIC_URL`, optional `API_KEY`.
