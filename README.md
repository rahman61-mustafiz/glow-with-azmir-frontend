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

On **Confirm sale**, the sale is recorded and **immediately appears in Home → Today's sales** (live).
Backed by a client-side store (`src/data/salesStore.js`) so it works offline; swap for the real API later.

### Advertise panel

Controls the **Advertise** section that appears on the **public website home page**.
From this tab the admin changes exactly **two** things:

- a **video** (`.mp4` upload only, validated client-side)
- a **description** (text)

with a **live preview** of how it will look to visitors.

> **Backend not built yet.** API calls are stubbed in `src/api/advertise.js`
> — search for `TODO(backend)` to find every place to wire the real endpoint.
> Proposed endpoints: `GET /api/advertise` and `PUT /api/advertise` (multipart).

## Getting started

```bash
npm install
npm run dev      # starts Vite dev server at http://localhost:5173
```

Other scripts:

```bash
npm run build    # production build -> dist/
npm run preview  # preview the production build
```

## Project structure

```
glow-with-azmir-frontend/
├── index.html              # loads Open Sans + mounts the app
├── vite.config.js
├── package.json
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx            # React + Router entry
    ├── App.jsx             # routes
    ├── index.css           # design tokens + base styles
    ├── data/
    │   ├── products.js     # shared product catalog (buy/sell/stock/category) + ৳ formatter
    │   └── salesStore.js   # client-side sales store (Sales entry -> Today's sales)
    ├── api/
    │   ├── advertise.js    # STUBBED advertise API (TODO(backend))
    │   ├── sales.js        # STUBBED sales API, backed by salesStore (TODO(backend))
    │   ├── customers.js    # STUBBED customer suggest/lookup (TODO(backend))
    │   └── accounting.js   # STUBBED accounting summary (TODO(backend))
    ├── components/
    │   ├── Layout.jsx      # top bar + nav (Bold header)
    │   ├── layout.css
    │   ├── PageHeader.jsx
    │   └── StatusPill.jsx
    └── pages/
        ├── Home.jsx        # Overview + Today's sales views (live)
        ├── SalesEntry.jsx  # tablet sales input system (Noor-style)
        ├── sales-entry.css
        ├── Accounting.jsx  # bookkeeping (income/expenses/profit/stock value)
        ├── Gallery.jsx
        ├── ProductPrice.jsx     # buying (admin-only) + selling (public) prices
        ├── AdvertisePanel.jsx   # most complete
        └── advertise.css
```
