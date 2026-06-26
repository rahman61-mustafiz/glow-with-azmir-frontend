# Glow with Azmir — Backend

Node/Express + **Firebase Firestore** API that powers the **Glow with Azmir**
admin SaaS panel and (later) the Flutter tablet. Firestore is used because the
shop's ISP blocks MongoDB connections; Firestore works over HTTPS.

- **No login** (per requirements). Optional light protection via an `API_KEY`
  header for writes — off by default.
- Data access lives in `src/repos/` (one module per collection); Firebase Admin
  is initialized in `src/config/firebase.js` from a service-account key.

## Setup

1. Create a Firebase project + enable **Firestore**.
2. Project settings → Service accounts → **Generate new private key**, save it as
   `serviceAccountKey.json` in the backend root (git-ignored).
3. `cp .env.example .env` (defaults are fine for local).

## Run locally

```bash
npm install
npm run seed       # populate Firestore with starter data (run once)
npm start          # http://localhost:4000
# or: npm run dev  (nodemon)
```

Health check: `GET http://localhost:4000/health`

## Firestore collections (schemaless — shapes enforced in `src/repos/`)

| Collection | Purpose |
| --- | --- |
| `products` | name, sku, category, **buyPrice** (admin-only), **sellPrice** (public), stock |
| `sales` | customerName, customerPhone, items[], total |
| `customers` | doc id = phone; name, lastItems — for type-ahead/lookup |
| `ledger` | income/expense entries (sales auto-create income) |
| `gallery` | title, category, imageUrl, active |
| `advertise` | doc `singleton`: videoUrl (.mp4) + description for the public home page |
| `settings` | doc `singleton`: storeName, phone, currency, lowStockThreshold |

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

See `.env.example`. Vars: `PORT`, `CORS_ORIGIN`, `PUBLIC_URL`, optional
`API_KEY`, and optional `FIREBASE_SERVICE_ACCOUNT` (path override; defaults to
`./serviceAccountKey.json`). **No database URL** — Firestore auth comes from the
service-account key.
