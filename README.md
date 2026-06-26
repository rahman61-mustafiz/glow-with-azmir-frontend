# Glow with Azmir — Admin Frontend

Admin panel for **Glow with Azmir** (a beauty-product shop, part of the *noor-beauty* salon project).
Built with **React + Vite**.

## Tech stack

- **React 18** + **Vite 5**
- **react-router-dom** for tab navigation
- **Open Sans** (Google Fonts) for all text
- Plain CSS with a locked design-token palette (no UI framework)

## Design (locked)

| Token | Value | Use |
| --- | --- | --- |
| `--gold` | `#C2A35B` | primary accent |
| `--gold-dark` | `#8A7233` | text / icons on light |
| `--gold-tint` | `#F5EFE0` | surfaces |
| `--black` | `#141414` | bold header, text |
| `--white` | `#FFFFFF` | content area |

- **Layout:** "Bold header" — black top bar with gold *Glow with Azmir* wordmark + gold primary buttons, white content area.
- **Status pills:** Active = black bg + gold text · Low stock = amber (`#FAEEDA` / `#854F0B`).

## Sections (nav tabs)

1. **Home** — dashboard with an **Overview** view + a **Today's sales** view (live/recent sales feed + today's total)
2. **Sales entry** — tablet input system (modelled on the Noor booking tablet): record a sale's client name, phone & products
3. **Accounting** — business bookkeeping: income, expenses, profit, and current stock value (tied to stock on hand + buying prices)
4. **Gallery** — image curation grid
5. **Product price** — products with **buying price** (admin-only) + **selling price** (public) + stock
6. **Advertise panel** — *the important one* ⤵

### Sales entry (tablet input system)

Modelled on the **Noor salon booking tablet**: a 3-panel flow — **categories │ product grid │ client + cart + confirm**.
The admin manually records each sale:

- **Client name** (required)
- **Phone number** (with type-ahead suggestions + returning-customer lookup — stubbed)
- **Product(s) bought** — tap products to add, adjust quantity; selling price auto-fills, total computes

On **Confirm sale**, the sale is recorded in the backend, **stock decrements**, an
**income entry** is logged in Accounting, and it **immediately appears in Home →
Today's sales** (the feed polls live).

### Advertise panel

Controls the **Advertise** section that appears on the **public website home page**.
From this tab the admin changes exactly **two** things:

- a **video** (`.mp4` upload only, validated client-side)
- a **description** (text)

with a **live preview** of how it will look to visitors.

The video + description are stored in the backend (`GET`/`PUT /api/advertise`,
multipart). The public website reads the same `GET /api/advertise` to render its
home-page Advertise section.

## Backend

This panel is now **fully wired to a live backend** —
[`glow-with-azmir-backend`](../glow-with-azmir-backend) (Node/Express + MongoDB).
Everything is editable and persists: products/prices, sales, accounting,
gallery, advertise. There is **no login** (internal tool).

The API base URL comes from `VITE_API_BASE` (see `.env.example`).

## Getting started

You need the backend running too.

```bash
# 1) Backend  (separate folder: glow-with-azmir-backend)
cd ../glow-with-azmir-backend
npm install
npm start                 # http://localhost:4000  (in-memory DB, auto-seeded)

# 2) Frontend (this folder)
npm install
cp .env.example .env      # VITE_API_BASE=http://localhost:4000/api
npm run dev               # http://localhost:5173
```

Other scripts: `npm run build` (→ `dist/`), `npm run preview`.

To deploy and get a live link, see **`DEPLOY.md`** in the backend repo
(MongoDB Atlas + Railway + Netlify/Vercel + how to add the link into the Noor admin).

## Project structure

```
glow-with-azmir-frontend/
├── index.html              # loads Open Sans + mounts the app
├── vite.config.js
├── .env.example            # VITE_API_BASE (backend URL)
├── public/favicon.svg
└── src/
    ├── main.jsx            # React + Router entry
    ├── App.jsx             # routes
    ├── index.css           # design tokens + base styles
    ├── data/
    │   └── products.js     # ৳ currency formatter (data now from the API)
    ├── api/                # all talk to the live backend
    │   ├── client.js       # fetch wrapper (VITE_API_BASE + optional key)
    │   ├── products.js     # list/create/update/delete
    │   ├── sales.js        # today's sales + record sale
    │   ├── customers.js    # phone suggest/lookup
    │   ├── accounting.js   # summary + ledger entries
    │   ├── gallery.js      # list/add(upload)/delete
    │   └── advertise.js    # get + save (.mp4 upload + description)
    ├── components/         # Layout (top bar + nav), PageHeader, StatusPill
    └── pages/
        ├── Home.jsx        # Overview + Today's sales (polls live)
        ├── SalesEntry.jsx  # tablet sales input system (Noor-style)  + sales-entry.css
        ├── Accounting.jsx  # bookkeeping + add/delete ledger entries
        ├── Gallery.jsx     # add (image upload) / delete
        ├── ProductPrice.jsx     # add/edit/delete; buying (admin) + selling (public)
        └── AdvertisePanel.jsx   # .mp4 upload + description + live preview  + advertise.css
```
